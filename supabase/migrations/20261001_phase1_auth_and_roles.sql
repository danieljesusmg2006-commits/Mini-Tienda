-- ==============================================================================
-- FASE 1: ESQUEMA DE AUTENTICACIÓN, PERFILES, ROLES RBAC Y AUDITORÍA INMUTABLE
-- ==============================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tipo Enum para Roles de Usuario
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'super_admin',
        'admin',
        'almacenista',
        'comprador',
        'vendedor',
        'auditor'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tabla de Perfiles vinculada directamente a auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'vendedor',
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Forzar RLS obligatorio
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- 4. Funciones Auxiliares SECURITY DEFINER (Previenen recursión y evalúan roles de forma segura)

-- Obtener rol del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND is_active = true LIMIT 1;
$$;

-- Verificar si el usuario autenticado es Super Admin o Administrador
CREATE OR REPLACE FUNCTION public.is_admin()
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
      AND role IN ('super_admin', 'admin')
  );
$$;

-- Verificar si el usuario actual está activo
CREATE OR REPLACE FUNCTION public.is_current_user_active()
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
  );
$$;

-- 5. Políticas de Row Level Security (RLS) para profiles

-- Lectura: Cada usuario puede leer su propio perfil; admins y auditores pueden ver todos los perfiles
CREATE POLICY "Lectura de perfiles segun rol"
ON public.profiles FOR SELECT
TO authenticated
USING (
    (id = auth.uid() AND is_active = true) OR
    public.is_admin() OR
    public.get_auth_role() = 'auditor'
);

-- Inserción: Solo administradores pueden insertar perfiles manualmente
CREATE POLICY "Solo administradores pueden crear perfiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin()
);

-- Actualización: Cada usuario puede modificar sus datos básicos (nombre, teléfono), pero solo administradores cambian roles o suspenden
CREATE POLICY "Actualizacion de perfiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
    (id = auth.uid() AND is_active = true) OR public.is_admin()
)
WITH CHECK (
    -- Si no es admin, no puede cambiar su propio rol ni su estado de activación
    CASE
        WHEN NOT public.is_admin() THEN
            role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
            is_active = (SELECT is_active FROM public.profiles WHERE id = auth.uid())
        ELSE true
    END
);

-- 6. Trigger para creación automática de perfil al registrar/invitar en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    default_role user_role := 'vendedor';
    user_name TEXT;
BEGIN
    user_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    
    IF (new.raw_user_meta_data->>'role') IS NOT NULL THEN
        BEGIN
            default_role := (new.raw_user_meta_data->>'role')::user_role;
        EXCEPTION WHEN OTHERS THEN
            default_role := 'vendedor';
        END;
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, is_active)
    VALUES (new.id, new.email, user_name, default_role, true)
    ON CONFLICT (id) DO NOTHING;

    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Tabla de Auditoría Inmutable (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,          -- 'INSERT', 'UPDATE', 'DELETE'
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

-- Políticas de Auditoría: Solo administradores y auditores pueden leer logs
CREATE POLICY "Lectura de logs por admin y auditores"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
    public.is_admin() OR public.get_auth_role() = 'auditor'
);

-- Inserción de logs permitida para usuarios autenticados
CREATE POLICY "Insercion de auditoria para autenticados"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Prohibición total de edición o borrado de logs (Logs inmutables)
-- No se definen políticas de UPDATE o DELETE para public.audit_logs.

-- 8. Trigger Universal de Auditoría
CREATE OR REPLACE FUNCTION public.audit_record_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data)
        VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id::text, to_jsonb(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
        VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id::text, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_data)
        VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id::text, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

-- Aplicar trigger de auditoría a la tabla profiles
DROP TRIGGER IF EXISTS audit_profiles_changes ON public.profiles;
CREATE TRIGGER audit_profiles_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_record_changes();
