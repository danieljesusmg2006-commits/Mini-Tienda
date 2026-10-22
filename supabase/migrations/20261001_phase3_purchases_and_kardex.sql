-- ==============================================================================
-- FASE 3: MIGRACIÓN DE PROVEEDORES, COMPRAS Y MOVIMIENTOS DE INVENTARIO (KARDEX)
-- ==============================================================================

-- 1. Tabla de Proveedores (Suppliers)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_id TEXT UNIQUE,                       -- RNC, RFC, RUT, NIF
    name TEXT NOT NULL,                       -- Nombre o Razón Social
    contact_name TEXT,                        -- Persona de contacto
    email TEXT,
    phone TEXT,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers FORCE ROW LEVEL SECURITY;

-- 2. Tabla de Órdenes de Compra (Purchases)
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_number TEXT NOT NULL UNIQUE,     -- Ej: 'OC-2026-001'
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'SOLICITADO' CHECK (status IN ('BORRADOR', 'SOLICITADO', 'RECIBIDO', 'CANCELADO')),
    payment_status TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (payment_status IN ('PENDIENTE', 'PAGADO')),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases FORCE ROW LEVEL SECURITY;

-- 3. Detalle de Compra (Purchase Items)
CREATE TABLE IF NOT EXISTS public.purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity_ordered NUMERIC(10, 2) NOT NULL CHECK (quantity_ordered > 0),
    quantity_received NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (quantity_received >= 0),
    unit_cost NUMERIC(12, 2) NOT NULL CHECK (unit_cost >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items FORCE ROW LEVEL SECURITY;

-- 4. Cabecera de Movimientos de Inventario (Kardex General)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_number TEXT NOT NULL UNIQUE,     -- Ej: 'MOV-2026-001'
    type TEXT NOT NULL CHECK (type IN ('ENTRADA', 'SALIDA', 'TRASLADO', 'AJUSTE')),
    source_warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    target_warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    reference_type TEXT CHECK (reference_type IN ('COMPRA', 'VENTA', 'TRASLADO_MANUAL', 'AJUSTE_INVENTARIO', 'MERMA')),
    reference_id TEXT,                        -- ID o número de documento asociado
    reason TEXT,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements FORCE ROW LEVEL SECURITY;

-- 5. Detalle de Movimientos de Inventario (Kardex Items)
CREATE TABLE IF NOT EXISTS public.inventory_movement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_id UUID NOT NULL REFERENCES public.inventory_movements(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_cost >= 0),
    total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_cost >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.inventory_movement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movement_items FORCE ROW LEVEL SECURITY;

-- ==============================================================================
-- 6. PROCEDIMIENTOS ALMACENADOS PL/pgSQL TRANSACCIONALES (ACID)
-- ==============================================================================

-- Función Transaccional para Recepción de Compras (Afecta Stock y Recalcula Costo Ponderado)
CREATE OR REPLACE FUNCTION public.receive_purchase_order(
    p_purchase_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_purchase RECORD;
    v_item RECORD;
    v_movement_id UUID;
    v_mov_number TEXT;
    v_current_stock NUMERIC(12, 2);
    v_old_cost NUMERIC(12, 2);
    v_new_avg_cost NUMERIC(12, 2);
BEGIN
    -- 1. Bloquear y verificar orden de compra
    SELECT * INTO v_purchase
    FROM public.purchases
    WHERE id = p_purchase_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Orden de compra no encontrada.';
    END IF;

    IF v_purchase.status = 'RECIBIDO' THEN
        RAISE EXCEPTION 'Esta orden de compra ya fue recibida anteriormente.';
    END IF;

    IF v_purchase.status = 'CANCELADO' THEN
        RAISE EXCEPTION 'No se puede recibir una orden cancelada.';
    END IF;

    -- Generar número correlativo de movimiento
    v_mov_number := 'MOV-REC-' || to_char(now(), 'YYYYMMDD-HH24MISS');

    -- 2. Crear cabecera de movimiento Kardex de Entrada
    INSERT INTO public.inventory_movements (
        movement_number,
        type,
        target_warehouse_id,
        reference_type,
        reference_id,
        reason,
        performed_by
    ) VALUES (
        v_mov_number,
        'ENTRADA',
        v_purchase.warehouse_id,
        'COMPRA',
        v_purchase.purchase_number,
        'Recepción de Orden de Compra #' || v_purchase.purchase_number,
        p_user_id
    ) RETURNING id INTO v_movement_id;

    -- 3. Iterar items de la compra
    FOR v_item IN (SELECT * FROM public.purchase_items WHERE purchase_id = p_purchase_id) LOOP
        -- Obtener costo actual y stock global para costo promedio ponderado
        SELECT cost_price INTO v_old_cost FROM public.products WHERE id = v_item.product_id;
        
        -- Obtener stock actual en el almacén de recepción (con bloqueo)
        SELECT COALESCE(current_stock, 0) INTO v_current_stock
        FROM public.warehouse_stock
        WHERE product_id = v_item.product_id AND warehouse_id = v_purchase.warehouse_id
        FOR UPDATE;

        IF NOT FOUND THEN
            v_current_stock := 0;
            INSERT INTO public.warehouse_stock (product_id, warehouse_id, current_stock)
            VALUES (v_item.product_id, v_purchase.warehouse_id, v_item.quantity_ordered);
        ELSE
            UPDATE public.warehouse_stock
            SET current_stock = current_stock + v_item.quantity_ordered,
                updated_at = now()
            WHERE product_id = v_item.product_id AND warehouse_id = v_purchase.warehouse_id;
        END IF;

        -- Actualizar cantidad recibida en el item
        UPDATE public.purchase_items
        SET quantity_received = quantity_ordered
        WHERE id = v_item.id;

        -- Recálculo de Costo Promedio Ponderado:
        -- Nuevo Costo = ((Stock Previo * Costo Previo) + (Cantidad Nueva * Costo Nuevo)) / (Stock Previo + Cantidad Nueva)
        IF (v_current_stock + v_item.quantity_ordered) > 0 THEN
            v_new_avg_cost := ((v_current_stock * v_old_cost) + (v_item.quantity_ordered * v_item.unit_cost)) / (v_current_stock + v_item.quantity_ordered);
            UPDATE public.products
            SET cost_price = round(v_new_avg_cost, 2),
                updated_at = now()
            WHERE id = v_item.product_id;
        END IF;

        -- Registrar item en el movimiento Kardex
        INSERT INTO public.inventory_movement_items (
            movement_id,
            product_id,
            quantity,
            unit_cost,
            total_cost
        ) VALUES (
            v_movement_id,
            v_item.product_id,
            v_item.quantity_ordered,
            v_item.unit_cost,
            round(v_item.quantity_ordered * v_item.unit_cost, 2)
        );
    END LOOP;

    -- 4. Marcar compra como RECIBIDO
    UPDATE public.purchases
    SET status = 'RECIBIDO',
        received_at = now(),
        updated_at = now()
    WHERE id = p_purchase_id;

    RETURN jsonb_build_object(
        'success', true,
        'purchase_id', p_purchase_id,
        'movement_id', v_movement_id,
        'movement_number', v_mov_number
    );
END;
$$;

-- Función Transaccional para Traslado entre Almacenes
CREATE OR REPLACE FUNCTION public.execute_stock_transfer(
    p_source_wh UUID,
    p_target_wh UUID,
    p_product_id UUID,
    p_quantity NUMERIC(10, 2),
    p_reason TEXT,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_source_stock NUMERIC(12, 2);
    v_prod_cost NUMERIC(12, 2);
    v_movement_id UUID;
    v_mov_number TEXT;
BEGIN
    IF p_source_wh = p_target_wh THEN
        RAISE EXCEPTION 'El almacén de origen y destino no pueden ser el mismo.';
    END IF;

    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'La cantidad a transferir debe ser mayor a cero.';
    END IF;

    -- 1. Bloquear y verificar stock en origen
    SELECT current_stock INTO v_source_stock
    FROM public.warehouse_stock
    WHERE product_id = p_product_id AND warehouse_id = p_source_wh
    FOR UPDATE;

    IF NOT FOUND OR v_source_stock < p_quantity THEN
        RAISE EXCEPTION 'Stock insuficiente en almacén de origen (Disponible: %)', COALESCE(v_source_stock, 0);
    END IF;

    SELECT cost_price INTO v_prod_cost FROM public.products WHERE id = p_product_id;

    -- 2. Restar del origen
    UPDATE public.warehouse_stock
    SET current_stock = current_stock - p_quantity,
        updated_at = now()
    WHERE product_id = p_product_id AND warehouse_id = p_source_wh;

    -- 3. Sumar en destino (upsert)
    INSERT INTO public.warehouse_stock (product_id, warehouse_id, current_stock)
    VALUES (p_product_id, p_target_wh, p_quantity)
    ON CONFLICT (product_id, warehouse_id) DO UPDATE
    SET current_stock = public.warehouse_stock.current_stock + p_quantity,
        updated_at = now();

    -- 4. Registrar movimiento de Kardex
    v_mov_number := 'TR-' || to_char(now(), 'YYYYMMDD-HH24MISS');

    INSERT INTO public.inventory_movements (
        movement_number,
        type,
        source_warehouse_id,
        target_warehouse_id,
        reference_type,
        reason,
        performed_by
    ) VALUES (
        v_mov_number,
        'TRASLADO',
        p_source_wh,
        p_target_wh,
        'TRASLADO_MANUAL',
        p_reason,
        p_user_id
    ) RETURNING id INTO v_movement_id;

    INSERT INTO public.inventory_movement_items (
        movement_id,
        product_id,
        quantity,
        unit_cost,
        total_cost
    ) VALUES (
        v_movement_id,
        p_product_id,
        p_quantity,
        v_prod_cost,
        round(p_quantity * v_prod_cost, 2)
    );

    RETURN jsonb_build_object(
        'success', true,
        'movement_id', v_movement_id,
        'movement_number', v_mov_number
    );
END;
$$;

-- ==============================================================================
-- 7. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Suppliers
CREATE POLICY "Lectura de proveedores para usuarios autenticados"
ON public.suppliers FOR SELECT TO authenticated
USING (public.is_current_user_active());

CREATE POLICY "Gestion de proveedores para personal autorizado"
ON public.suppliers FOR ALL TO authenticated
USING (public.can_manage_inventory())
WITH CHECK (public.can_manage_inventory());

-- Purchases & Items
CREATE POLICY "Lectura de compras para usuarios autenticados"
ON public.purchases FOR SELECT TO authenticated
USING (public.is_current_user_active());

CREATE POLICY "Gestion de compras para personal autorizado"
ON public.purchases FOR ALL TO authenticated
USING (public.can_manage_inventory())
WITH CHECK (public.can_manage_inventory());

CREATE POLICY "Lectura de items de compra para usuarios autenticados"
ON public.purchase_items FOR SELECT TO authenticated
USING (public.is_current_user_active());

CREATE POLICY "Gestion de items de compra para personal autorizado"
ON public.purchase_items FOR ALL TO authenticated
USING (public.can_manage_inventory())
WITH CHECK (public.can_manage_inventory());

-- Movements & Items (Kardex)
CREATE POLICY "Lectura de movimientos kardex para usuarios autenticados"
ON public.inventory_movements FOR SELECT TO authenticated
USING (public.is_current_user_active());

CREATE POLICY "Insercion de movimientos kardex para personal autorizado"
ON public.inventory_movements FOR INSERT TO authenticated
WITH CHECK (public.can_manage_inventory());

CREATE POLICY "Lectura de items kardex para usuarios autenticados"
ON public.inventory_movement_items FOR SELECT TO authenticated
USING (public.is_current_user_active());

CREATE POLICY "Insercion de items kardex para personal autorizado"
ON public.inventory_movement_items FOR INSERT TO authenticated
WITH CHECK (public.can_manage_inventory());

-- ==============================================================================
-- 8. TRIGGERS DE AUDITORÍA
-- ==============================================================================

DROP TRIGGER IF EXISTS audit_suppliers_changes ON public.suppliers;
CREATE TRIGGER audit_suppliers_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION public.audit_record_changes();

DROP TRIGGER IF EXISTS audit_purchases_changes ON public.purchases;
CREATE TRIGGER audit_purchases_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.purchases
    FOR EACH ROW EXECUTE FUNCTION public.audit_record_changes();

DROP TRIGGER IF EXISTS audit_inventory_movements_changes ON public.inventory_movements;
CREATE TRIGGER audit_inventory_movements_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.inventory_movements
    FOR EACH ROW EXECUTE FUNCTION public.audit_record_changes();

-- ==============================================================================
-- 9. DATOS DEMOSTRATIVOS (SEED DATA)
-- ==============================================================================

INSERT INTO public.suppliers (id, tax_id, name, contact_name, email, phone, address, is_active)
VALUES 
    ('33333333-3333-3333-3333-333333333331', '101-55829-1', 'Distribuidora Automotriz del Caribe SRL', 'Manuel Tejeda', 'ventas@caribeauto.com', '+1 809-567-8900', 'Zona Industrial Herrera, Santo Domingo', true),
    ('33333333-3333-3333-3333-333333333332', '102-99432-8', 'Importadora Global de Filtros y Baterías', 'Sonia Almonte', 'pedidos@globalfiltros.com', '+1 809-241-1122', 'Parque Industrial Tamboril, Santiago', true)
ON CONFLICT (tax_id) DO NOTHING;

INSERT INTO public.purchases (id, purchase_number, supplier_id, warehouse_id, status, payment_status, subtotal, tax_amount, total_amount, notes)
VALUES
    ('44444444-4444-4444-4444-444444444441', 'OC-2026-001', '33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'RECIBIDO', 'PAGADO', 45600.00, 8208.00, 53808.00, 'Recepción completa de aceites y refrigerantes'),
    ('44444444-4444-4444-4444-444444444442', 'OC-2026-002', '33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'SOLICITADO', 'PENDIENTE', 25200.00, 4536.00, 29736.00, 'Pendiente de entrega estimada en 48 horas')
ON CONFLICT (purchase_number) DO NOTHING;
