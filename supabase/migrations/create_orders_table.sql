-- Таблиця замовлень Marwood
-- Виконайте цей SQL у Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customer_profiles(id), -- Прив'язка до профілю (може бути NULL для старих замовлень)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  
  -- Контактні дані
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  
  -- Доставка
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('nova_poshta_warehouse', 'nova_poshta_courier')),
  city TEXT NOT NULL,
  city_ref TEXT,
  warehouse TEXT,
  warehouse_ref TEXT,
  address TEXT,
  
  -- Оплата
  payment_method TEXT NOT NULL CHECK (payment_method IN ('monopay', 'cod')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'success', 'failure', 'reversed')),
  mono_invoice_id TEXT,
  
  -- Замовлення
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  shipping_cost INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_mono_invoice ON orders(mono_invoice_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- RLS (Row Level Security) — поки вимкнено для спрощення
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Дозволяємо service_role повний доступ
CREATE POLICY "Service role full access" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);
