-- 1. Додаємо колонку для обліку залишків по розмірах
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_by_size JSONB DEFAULT '{}'::jsonb;

-- 2. Створюємо RPC функцію для безпечного створення замовлення з відніманням залишків
CREATE OR REPLACE FUNCTION create_order_with_stock(
  p_order_number TEXT,
  p_customer_id UUID,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT,
  p_delivery_method TEXT,
  p_city TEXT,
  p_city_ref TEXT,
  p_warehouse TEXT,
  p_warehouse_ref TEXT,
  p_address TEXT,
  p_payment_method TEXT,
  p_payment_status TEXT,
  p_status TEXT,
  p_items JSONB,
  p_subtotal INTEGER,
  p_shipping_cost INTEGER,
  p_total INTEGER,
  p_comment TEXT
) RETURNS JSONB AS $$
DECLARE
  v_item JSONB;
  v_product_id UUID;
  v_requested_size TEXT;
  v_requested_qty INTEGER;
  v_current_stock JSONB;
  v_new_stock_val INTEGER;
  v_order_id UUID;
BEGIN
  -- Цикл по товарам у замовленні для перевірки наявності
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'id')::UUID;
    v_requested_size := v_item->>'selectedSize';
    v_requested_qty := (v_item->>'quantity')::INTEGER;

    -- Отримуємо поточні залишки товару
    -- Використовуємо FOR UPDATE для блокування рядка (захист від race condition)
    SELECT stock_by_size INTO v_current_stock 
    FROM products 
    WHERE id = v_product_id 
    FOR UPDATE;

    IF v_requested_size IS NOT NULL AND v_requested_size <> '' THEN
      -- Перевіряємо чи є такий розмір у залишках
      IF NOT (v_current_stock ? v_requested_size) THEN
        RAISE EXCEPTION 'Розмір % для товару % не знайдено в базі', v_requested_size, v_product_id;
      END IF;

      -- Перевіряємо кількість
      v_new_stock_val := (v_current_stock->>v_requested_size)::INTEGER - v_requested_qty;
      
      IF v_new_stock_val < 0 THEN
        RAISE EXCEPTION 'Товару у розмірі % недостатньо на складі', v_requested_size;
      END IF;

      -- Оновлюємо залишки та лічильник продажів
      UPDATE products 
      SET 
        stock_by_size = stock_by_size || jsonb_build_object(v_requested_size, v_new_stock_val),
        sales_count = COALESCE(sales_count, 0) + v_requested_qty
      WHERE id = v_product_id;
    ELSE
      -- Якщо розмір не вказано (наприклад, товар без розміру)
      -- Можна додати логіку для загального stock_quantity, якщо потрібно
    END IF;
  END LOOP;

  -- Вставляємо замовлення
  INSERT INTO orders (
    order_number, customer_id, customer_name, customer_phone, customer_email,
    delivery_method, city, city_ref, warehouse, warehouse_ref, address,
    payment_method, payment_status, status, items, subtotal, shipping_cost, total, comment
  ) VALUES (
    p_order_number, p_customer_id, p_customer_name, p_customer_phone, p_customer_email,
    p_delivery_method, p_city, p_city_ref, p_warehouse, p_warehouse_ref, p_address,
    p_payment_method, p_payment_status, p_status, p_items, p_subtotal, p_shipping_cost, p_total, p_comment
  ) RETURNING id INTO v_order_id;

  RETURN jsonb_build_object('id', v_order_id, 'success', true);
END;
$$ LANGUAGE plpgsql;
