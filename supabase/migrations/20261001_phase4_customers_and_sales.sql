-- ==============================================================================
-- FASE 4: MIGRACIÓN DE CLIENTES, VENTAS (POS) Y FACTURACIÓN TRANSACCIONAL
-- ==============================================================================

-- 1. Tabla de Clientes (Customers)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_id TEXT UNIQUE,                       -- RNC, Cédula o Identificación Fiscal
    name TEXT NOT NULL,                       -- Nombre o Razón Social
    email TEXT,
    phone TEXT,
    address TEXT,
    credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (credit_limit >= 0),
    current_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (current_balance >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers FORCE ROW LEVEL SECURITY;

-- 2. Tabla de Ventas / Facturas (Sales)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,     -- Ej: 'FAC-2026-0001'
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'COMPLETADA' CHECK (status IN ('COMPLETADA', 'PENDIENTE', 'ANULADA')),
    payment_method TEXT NOT NULL DEFAULT 'EFECTIVO' CHECK (payment_method IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CREDITO')),
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (amount_paid >= 0),
    change_returned NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (change_returned >= 0),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales FORCE ROW LEVEL SECURITY;

-- 3. Detalle de Ventas (Sale Items)
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    unit_cost NUMERIC(12, 2) NOT NULL CHECK (unit_cost >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items FORCE ROW LEVEL SECURITY;

-- ==============================================================================
-- 4. PROCEDIMIENTOS ALMACENADOS PL/pgSQL TRANSACCIONALES PARA EL POS (ACID)
-- ==============================================================================

-- Función Transaccional de Venta con Bloqueo (SELECT FOR UPDATE) y Descuento de Stock
CREATE OR REPLACE FUNCTION public.process_pos_sale(
    p_customer_id UUID,
    p_warehouse_id UUID,
    p_payment_method TEXT,
    p_amount_paid NUMERIC(12, 2),
    p_discount NUMERIC(12, 2),
    p_items JSONB,                          -- Array de objetos: [{product_id, quantity, unit_price}]
    p_notes TEXT,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_item JSONB;
    v_prod_id UUID;
    v_qty NUMERIC(10, 2);
    v_price NUMERIC(12, 2);
    v_cost NUMERIC(12, 2);
    v_current_stock NUMERIC(12, 2);
    v_prod_name TEXT;
    
    v_subtotal NUMERIC(12, 2) := 0;
    v_tax NUMERIC(12, 2) := 0;
    v_total NUMERIC(12, 2) := 0;
    v_change NUMERIC(12, 2) := 0;
    
    v_invoice_number TEXT;
    v_sale_id UUID;
    v_movement_id UUID;
    v_customer RECORD;
BEGIN
    -- 1. Validar cliente
    SELECT * INTO v_customer FROM public.customers WHERE id = p_customer_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cliente no encontrado.';
    END IF;

    -- Generar correlativo de factura
    v_invoice_number := 'FAC-' || to_char(now(), 'YYYY') || '-' || lpad((nextval('sales_id_seq'::regclass))::text, 5, '0');

    -- 2. Validar cada item y disponibilidad de stock en el almacén
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_prod_id := (v_item->>'product_id')::UUID;
        v_qty := (v_item->>'quantity')::NUMERIC;
        v_price := (v_item->>'unit_price')::NUMERIC;

        IF v_qty <= 0 THEN
            RAISE EXCEPTION 'Cantidad inválida para producto %', v_prod_id;
        END IF;

        -- Bloquear fila de stock para evitar condición de carrera
        SELECT name, cost_price INTO v_prod_name, v_cost FROM public.products WHERE id = v_prod_id;
        
        SELECT current_stock INTO v_current_stock
        FROM public.warehouse_stock
        WHERE product_id = v_prod_id AND warehouse_id = p_warehouse_id
        FOR UPDATE;

        IF NOT FOUND OR v_current_stock < v_qty THEN
            RAISE EXCEPTION 'Stock insuficiente para "%": Disponible %, Solicitado %', 
                v_prod_name, COALESCE(v_current_stock, 0), v_qty;
        END IF;

        -- Sumar subtotal
        v_subtotal := v_subtotal + (v_qty * v_price);
    END LOOP;

    -- Aplicar descuento e impuestos
    v_subtotal := v_subtotal - COALESCE(p_discount, 0);
    v_tax := round(v_subtotal * 0.18, 2);   -- 18% ITBIS
    v_total := v_subtotal + v_tax;

    -- Calcular cambio si es efectivo
    IF p_payment_method = 'EFECTIVO' THEN
        IF p_amount_paid < v_total THEN
            RAISE EXCEPTION 'Monto pagado insuficiente. Total: %, Recibido: %', v_total, p_amount_paid;
        END IF;
        v_change := p_amount_paid - v_total;
    ELSE
        p_amount_paid := v_total;
        v_change := 0;
    END IF;

    -- Manejo de crédito
    IF p_payment_method = 'CREDITO' THEN
        IF (v_customer.current_balance + v_total) > v_customer.credit_limit THEN
            RAISE EXCEPTION 'Límite de crédito excedido. Disponible: %, Factura: %', 
                (v_customer.credit_limit - v_customer.current_balance), v_total;
        END IF;
        
        UPDATE public.customers
        SET current_balance = current_balance + v_total,
            updated_at = now()
        WHERE id = p_customer_id;
    END IF;

    -- 3. Insertar venta
    INSERT INTO public.sales (
        invoice_number,
        customer_id,
        warehouse_id,
        status,
        payment_method,
        amount_paid,
        change_returned,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        notes,
        created_by
    ) VALUES (
        v_invoice_number,
        p_customer_id,
        p_warehouse_id,
        'COMPLETADA',
        p_payment_method,
        p_amount_paid,
        v_change,
        v_subtotal,
        v_tax,
        COALESCE(p_discount, 0),
        v_total,
        p_notes,
        p_user_id
    ) RETURNING id INTO v_sale_id;

    -- 4. Registrar cabecera en Kardex
    INSERT INTO public.inventory_movements (
        movement_number,
        type,
        source_warehouse_id,
        reference_type,
        reference_id,
        reason,
        performed_by
    ) VALUES (
        'MOV-VTA-' || to_char(now(), 'YYYYMMDD-HH24MISS'),
        'SALIDA',
        p_warehouse_id,
        'VENTA',
        v_invoice_number,
        'Salida por Venta Factura #' || v_invoice_number,
        p_user_id
    ) RETURNING id INTO v_movement_id;

    -- 5. Insertar items y descontar stock físicamente
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_prod_id := (v_item->>'product_id')::UUID;
        v_qty := (v_item->>'quantity')::NUMERIC;
        v_price := (v_item->>'unit_price')::NUMERIC;
        SELECT cost_price INTO v_cost FROM public.products WHERE id = v_prod_id;

        -- Descontar inventario
        UPDATE public.warehouse_stock
        SET current_stock = current_stock - v_qty,
            updated_at = now()
        WHERE product_id = v_prod_id AND warehouse_id = p_warehouse_id;

        -- Insertar detalle de venta
        INSERT INTO public.sale_items (
            sale_id,
            product_id,
            quantity,
            unit_price,
            unit_cost,
            subtotal
        ) VALUES (
            v_sale_id,
            v_prod_id,
            v_qty,
            v_price,
            v_cost,
            round(v_qty * v_price, 2)
        );

        -- Insertar item en Kardex
        INSERT INTO public.inventory_movement_items (
            movement_id,
            product_id,
            quantity,
            unit_cost,
            total_cost
        ) VALUES (
            v_movement_id,
            v_prod_id,
            v_qty,
            v_cost,
            round(v_qty * v_cost, 2)
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'sale_id', v_sale_id,
        'invoice_number', v_invoice_number,
        'total_amount', v_total,
        'change_returned', v_change
    );
END;
$$;

-- Secuencia para facturación si no existe
CREATE SEQUENCE IF NOT EXISTS sales_id_seq START 1;

-- ==============================================================================
-- 5. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Customers
CREATE POLICY "Lectura de clientes para usuarios autenticados"
ON public.customers FOR SELECT TO authenticated
USING (public.is_current_user_active());

CREATE POLICY "Gestion de clientes para usuarios autenticados"
ON public.customers FOR ALL TO authenticated
USING (public.is_current_user_active())
WITH CHECK (public.is_current_user_active());

-- Sales & Items
CREATE POLICY "Lectura de ventas para usuarios autenticados"
ON public.sales FOR SELECT TO authenticated
USING (public.is_current_user_active());

CREATE POLICY "Creacion de ventas para usuarios autenticados"
ON public.sales FOR INSERT TO authenticated
WITH CHECK (public.is_current_user_active());

CREATE POLICY "Lectura de items de venta para usuarios autenticados"
ON public.sale_items FOR SELECT TO authenticated
USING (public.is_current_user_active());

CREATE POLICY "Creacion de items de venta para usuarios autenticados"
ON public.sale_items FOR INSERT TO authenticated
WITH CHECK (public.is_current_user_active());

-- ==============================================================================
-- 6. TRIGGERS DE AUDITORÍA
-- ==============================================================================

DROP TRIGGER IF EXISTS audit_customers_changes ON public.customers;
CREATE TRIGGER audit_customers_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.audit_record_changes();

DROP TRIGGER IF EXISTS audit_sales_changes ON public.sales;
CREATE TRIGGER audit_sales_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.sales
    FOR EACH ROW EXECUTE FUNCTION public.audit_record_changes();

-- ==============================================================================
-- 7. DATOS DEMOSTRATIVOS (SEED DATA)
-- ==============================================================================

-- Cliente Genérico (Consumidor Final) y Clientes de Crédito
INSERT INTO public.customers (id, tax_id, name, email, phone, address, credit_limit, current_balance, is_active)
VALUES
    ('55555555-5555-5555-5555-555555555551', '000-0000000-0', 'Consumidor Final / Cliente General', 'caja@empresa.com', 'N/A', 'Venta en Mostrador', 0.00, 0.00, true),
    ('55555555-5555-5555-5555-555555555552', '402-1234567-8', 'Taller Mecánico Hermanos Díaz', 'taller.diaz@gmail.com', '+1 809-555-0811', 'Av. San Vicente de Paul #88, SDE', 50000.00, 14200.00, true),
    ('55555555-5555-5555-5555-555555555553', '131-98765-4', 'Transportes y Flotillas del Norte SAS', 'logistica@transnorte.do', '+1 809-582-9900', 'Santiago de los Caballeros', 150000.00, 32500.00, true)
ON CONFLICT (tax_id) DO NOTHING;
