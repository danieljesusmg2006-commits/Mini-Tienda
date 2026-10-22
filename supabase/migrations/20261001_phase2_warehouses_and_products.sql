-- ==============================================================================
-- FASE 2: MIGRACIÓN DE ALMACENES, CATEGORÍAS, PRODUCTOS Y STOCK POR ALMACÉN
-- ==============================================================================

-- 1. Tabla de Almacenes / Sucursales
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,                -- Ej: 'ALM-01', 'SUC-NORTE'
    name TEXT NOT NULL,                       -- Ej: 'Almacén Central Matriz'
    address TEXT,
    phone TEXT,
    manager_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses FORCE ROW LEVEL SECURITY;

-- 2. Tabla de Categorías de Productos
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;

-- 3. Tabla de Productos (Catálogo Central)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,                 -- Código interno (ej: 'REP-0012')
    barcode TEXT UNIQUE,                      -- Código de barras (EAN-13, Code128, UPC)
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cost_price >= 0),
    sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (sale_price >= 0),
    min_stock NUMERIC(10, 2) NOT NULL DEFAULT 5.00 CHECK (min_stock >= 0),
    max_stock NUMERIC(10, 2) DEFAULT 100.00 CHECK (max_stock >= min_stock),
    unit_measure TEXT NOT NULL DEFAULT 'UND',  -- 'UND', 'KG', 'LITRO', 'CAJA', 'PAQUETE'
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;

-- 4. Tabla de Existencias por Almacén (Relación Producto-Almacén)
CREATE TABLE IF NOT EXISTS public.warehouse_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    current_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (current_stock >= 0),
    reserved_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (reserved_stock >= 0),
    location_shelf TEXT,                      -- Ej: 'Pasillo B - Estante 4 - Nivel 2'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_product_warehouse UNIQUE (product_id, warehouse_id)
);

ALTER TABLE public.warehouse_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_stock FORCE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Funciones auxiliares de verificación de roles de inventario
CREATE OR REPLACE FUNCTION public.can_manage_inventory()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('super_admin', 'admin', 'almacenista', 'comprador')
  );
$$;

-- Políticas para Almacenes (Warehouses)
CREATE POLICY "Lectura de almacenes para usuarios autenticados activos"
ON public.warehouses FOR SELECT
TO authenticated
USING (public.is_current_user_active());

CREATE POLICY "Gestion de almacenes exclusiva para administradores"
ON public.warehouses FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Políticas para Categorías (Categories)
CREATE POLICY "Lectura de categorias para usuarios autenticados activos"
ON public.categories FOR SELECT
TO authenticated
USING (public.is_current_user_active());

CREATE POLICY "Gestion de categorias para personal autorizado"
ON public.categories FOR ALL
TO authenticated
USING (public.can_manage_inventory())
WITH CHECK (public.can_manage_inventory());

-- Políticas para Productos (Products)
CREATE POLICY "Lectura de productos para usuarios autenticados activos"
ON public.products FOR SELECT
TO authenticated
USING (public.is_current_user_active());

CREATE POLICY "Gestion de productos para personal autorizado"
ON public.products FOR ALL
TO authenticated
USING (public.can_manage_inventory())
WITH CHECK (public.can_manage_inventory());

-- Políticas para Stock por Almacén (Warehouse Stock)
CREATE POLICY "Lectura de stock para usuarios autenticados activos"
ON public.warehouse_stock FOR SELECT
TO authenticated
USING (public.is_current_user_active());

CREATE POLICY "Gestion de stock para personal autorizado"
ON public.warehouse_stock FOR ALL
TO authenticated
USING (public.can_manage_inventory())
WITH CHECK (public.can_manage_inventory());

-- ==============================================================================
-- 6. TRIGGERS DE AUDITORÍA
-- ==============================================================================

DROP TRIGGER IF EXISTS audit_warehouses_changes ON public.warehouses;
CREATE TRIGGER audit_warehouses_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.warehouses
    FOR EACH ROW EXECUTE FUNCTION public.audit_record_changes();

DROP TRIGGER IF EXISTS audit_products_changes ON public.products;
CREATE TRIGGER audit_products_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.audit_record_changes();

DROP TRIGGER IF EXISTS audit_warehouse_stock_changes ON public.warehouse_stock;
CREATE TRIGGER audit_warehouse_stock_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.warehouse_stock
    FOR EACH ROW EXECUTE FUNCTION public.audit_record_changes();

-- ==============================================================================
-- 7. DATOS SEMILLA DEMOSTRATIVOS (INITIAL SEED DATA)
-- ==============================================================================

-- Almacén por defecto
INSERT INTO public.warehouses (id, code, name, address, phone, manager_name, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'ALM-CENTRAL', 'Almacén Central (Matriz)', 'Av. 27 de Febrero #450, Santo Domingo', '+1 809-555-0101', 'Carlos Martínez', true),
    ('22222222-2222-2222-2222-222222222222', 'SUC-NORTE', 'Sucursal Norte', 'Autopista Duarte Km 9, Santiago', '+1 809-555-0102', 'Elena Ramos', true)
ON CONFLICT (code) DO NOTHING;

-- Categorías iniciales
INSERT INTO public.categories (id, name, slug, description)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lubricantes y Fluidos', 'lubricantes-fluidos', 'Aceites de motor, refrigerantes y líquidos de freno'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Filtros y Mantenimiento', 'filtros-mantenimiento', 'Filtros de aceite, aire, cabina y combustible'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Baterías y Sistema Eléctrico', 'baterias-electrico', 'Baterías automotrices, bujías y fusibles'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Frenos y Suspensión', 'frenos-suspension', 'Pastillas, discos, amortiguadores y terminales')
ON CONFLICT (name) DO NOTHING;

-- Productos de demostración con códigos de barra y SKU
INSERT INTO public.products (id, sku, barcode, name, description, category_id, cost_price, sale_price, min_stock, max_stock, unit_measure)
VALUES 
    ('10000000-0000-0000-0000-000000000001', 'ACE-5W30-1L', '7501000123456', 'Aceite Sintético 5W-30 (1L)', 'Lubricante sintético de alto rendimiento para motores a gasolina', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 380.00, 550.00, 15.00, 200.00, 'UND'),
    ('10000000-0000-0000-0000-000000000002', 'FIL-AIR-TY01', '7501000234567', 'Filtro de Aire Toyota Corolla', 'Filtro de aire de alto flujo compatible con modelos 2014-2022', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 220.00, 420.00, 10.00, 80.00, 'UND'),
    ('10000000-0000-0000-0000-000000000003', 'BAT-12V-75AH', '7501000345678', 'Batería Automotriz 12V 75Ah', 'Batería libre de mantenimiento con 24 meses de garantía', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 4200.00, 5950.00, 5.00, 40.00, 'UND'),
    ('10000000-0000-0000-0000-000000000004', 'PAS-FRN-FR01', '7501000456789', 'Pastillas de Freno Cerámicas Delanteras', 'Juego de pastillas cerámicas de baja emisión de polvo', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 850.00, 1400.00, 8.00, 60.00, 'JGO'),
    ('10000000-0000-0000-0000-000000000005', 'REF-5050-GAL', '7501000567890', 'Refrigerante 50/50 Verde (1 Galón)', 'Protección contra corrosión y sobrecalentamiento', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 320.00, 490.00, 12.00, 100.00, 'GAL')
ON CONFLICT (sku) DO NOTHING;

-- Stock inicial en almacenes
INSERT INTO public.warehouse_stock (product_id, warehouse_id, current_stock, reserved_stock, location_shelf)
VALUES 
    ('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 85.00, 0.00, 'Pasillo A - Estante 1 - Nivel 2'),
    ('10000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 20.00, 0.00, 'Pasillo 1 - Nivel 1'),
    ('10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 4.00, 0.00, 'Pasillo A - Estante 2 - Nivel 3'), -- Bajo stock
    ('10000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 12.00, 2.00, 'Zona Baterías - Nivel Piso'),
    ('10000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 25.00, 0.00, 'Pasillo B - Estante 3 - Nivel 1'),
    ('10000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 40.00, 0.00, 'Pasillo A - Estante 4 - Nivel 1')
ON CONFLICT (product_id, warehouse_id) DO NOTHING;
