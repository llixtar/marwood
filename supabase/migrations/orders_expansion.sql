-- Оновлення таблиці замовлень для підтримки часткової оплати та ТТН
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_amount INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ttn TEXT;

-- Оновлення типів статусів (опціонально, якщо використовується ENUM, але тут скоріш за все просто TEXT)
-- Статуси: pending, awaiting_payment, confirmed, packing, handed_to_delivery, shipped, delivered, completed, cancelled
