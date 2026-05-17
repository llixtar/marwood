-- Таблиця відгуків клієнтів
-- Виконайте цей SQL у Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS customer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- NULL для додаткових коментарів без повторної оцінки
  comment TEXT NOT NULL,
  images TEXT[] DEFAULT '{}', -- Масив URL-адрес завантажених зображень
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Індекси для швидкого пошуку та з'єднань
CREATE INDEX IF NOT EXISTS idx_customer_reviews_profile ON customer_reviews(profile_id);

-- Унікальний індекс: ОДИН користувач може поставити лише ОДНУ оцінку (рядок, де rating IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_reviews_single_rating 
ON customer_reviews (profile_id) 
WHERE rating IS NOT NULL;

-- Дозволи Row Level Security (RLS)
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

-- Усі користувачі можуть читати відгуки
CREATE POLICY "Anyone can view reviews" ON customer_reviews
  FOR SELECT USING (true);

-- Лише авторизовані користувачі можуть додавати відгуки для свого власного профілю
CREATE POLICY "Authenticated users can insert reviews" ON customer_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM customer_profiles 
      WHERE id = profile_id AND auth_user_id = auth.uid()
    )
  );

-- Адміністратори можуть видаляти будь-які відгуки
CREATE POLICY "Admins can delete reviews" ON customer_reviews
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM customer_profiles 
      WHERE auth_user_id = auth.uid() AND is_admin = true
    )
  );

-- Service role має повний доступ (для серверних операцій)
CREATE POLICY "Service role full access on reviews" ON customer_reviews
  FOR ALL USING (true) WITH CHECK (true);

-- Створення бакету для зображень відгуків у storage (якщо не існує)
INSERT INTO storage.buckets (id, name, public)
VALUES ('reviews', 'reviews', true)
ON CONFLICT (id) DO NOTHING;

-- Дозвіл публічного читання зображень з бакету reviews
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'reviews');
