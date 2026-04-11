-- Таблиця для відстеження історії змін на складі
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT,
    color TEXT,
    size TEXT,
    change_amount INTEGER, -- + для поставок, - для продажів/коригувань
    new_stock INTEGER, -- залишок після зміни
    reason TEXT, -- 'supply', 'order', 'correction', 'return'
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Індекс для швидкого пошуку по SKU
CREATE INDEX IF NOT EXISTS idx_inv_logs_sku ON inventory_logs(sku);
CREATE INDEX IF NOT EXISTS idx_inv_logs_product ON inventory_logs(product_id);

-- Налаштовуємо RLS (тільки адміни можуть бачити логи через серверну частину)
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything with inventory logs" ON inventory_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM customer_profiles 
      WHERE auth_user_id = auth.uid() AND is_admin = true
    )
  );
