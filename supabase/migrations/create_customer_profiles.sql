-- Таблиця профілів клієнтів (і зареєстрованих, і гостьових)
-- Виконайте цей SQL у Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  
  full_name TEXT,
  phone TEXT,
  email TEXT,
  
  -- Збережена адреса доставки (остання використана)
  saved_city TEXT,
  saved_city_ref TEXT,
  saved_warehouse TEXT,
  saved_warehouse_ref TEXT,
  saved_address TEXT,
  saved_delivery_method TEXT,
  
  orders_count INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  
  is_guest BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_cp_auth_user ON customer_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_cp_phone ON customer_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_cp_email ON customer_profiles(email);

-- RLS
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- Авторизовані юзери можуть бачити свій профіль
CREATE POLICY "Users can view own profile" ON customer_profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON customer_profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Service role має повний доступ (для серверних операцій)
CREATE POLICY "Service role full access" ON customer_profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Додаємо customer_id до таблиці orders (якщо вона існує)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customer_profiles(id);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
  END IF;
END $$;
