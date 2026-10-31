-- ========================================================
-- MINI TIENDA - ESQUEMA DE BASE DE DATOS SUPABASE
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- ========================================================

-- 1. Tabla de Órdenes / Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Completada',
  is_guest BOOLEAN DEFAULT false,
  customer_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabla de Chats de Órdenes
CREATE TABLE IF NOT EXISTS public.order_chats (
  order_id TEXT PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_for_admin INTEGER DEFAULT 0,
  unread_for_customer INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabla de Mensajes de Chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.order_chats(order_id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'seller')),
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  read_by_customer BOOLEAN DEFAULT false,
  read_by_seller BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas ultra rápidas
CREATE INDEX IF NOT EXISTS idx_chat_messages_order_id ON public.chat_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Habilitar Row Level Security (RLS) pero permitir acceso público / anon para la tienda
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de ordenes" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Permitir insercion publica de ordenes" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion publica de ordenes" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Permitir lectura publica de chats" ON public.order_chats FOR SELECT USING (true);
CREATE POLICY "Permitir insercion publica de chats" ON public.order_chats FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion publica de chats" ON public.order_chats FOR UPDATE USING (true);

CREATE POLICY "Permitir lectura publica de mensajes" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Permitir insercion publica de mensajes" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion publica de mensajes" ON public.chat_messages FOR UPDATE USING (true);

-- Habilitar Realtime para las tablas de chat y pedidos
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
