'use server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';

/**
 * Оновлює залишки для конкретного розміру та фіксує це в логах
 */
export async function updateStockAction({
  productId,
  sku,
  color,
  size,
  newStock,
  reason = 'correction'
}: {
  productId: string;
  sku: string;
  color: string;
  size: string;
  newStock: number;
  reason?: 'supply' | 'correction' | 'return' | 'order';
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  // Створюємо клієнт прямо тут, щоб уникнути проблем з ініціалізацією в Server Actions
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Отримуємо поточний стан (залишки ТА масив розмірів)
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('*') // Беремо все, щоб зрозуміти що там є
    .eq('id', productId)
    .single();

  if (fetchError) {
    console.error('Fetch error:', fetchError);
    // Спробуємо дізнатися які колонки взагалі доступні
    const { data: sample } = await supabase.from('products').select('*').limit(1);
    const columns = sample && sample[0] ? Object.keys(sample[0]).join(', ') : 'none';
    throw new Error(`DB Fetch Error: ${fetchError.message}. Available columns: ${columns}`);
  }

  if (!product) {
    throw new Error(`Product not found (ID: ${productId}, Type: ${typeof productId})`);
  }

  const oldStock = (product.stock_by_size as any)?.[size] || 0;
  const changeAmount = newStock - oldStock;

  // Якщо змін немає, нічого не робимо
  if (changeAmount === 0) return { success: true };

  // 2. Оновлюємо продукт (залишки + список розмірів)
  const updatedStock = {
    ...(product.stock_by_size as any || {}),
    [size]: newStock
  };

  // Якщо ми додали кількість для "нового" розміру, додаємо його в масив sizes
  let updatedSizes = [...(product.sizes || [])];
  if (newStock > 0 && !updatedSizes.includes(size)) {
    updatedSizes.push(size);
  }

  const { data: updatedData, error: updateError } = await supabase
    .from('products')
    .update({ 
      stock_by_size: updatedStock,
      sizes: updatedSizes
    })
    .eq('id', productId)
    .select();

  if (updateError) throw updateError;
  if (!updatedData || updatedData.length === 0) {
    throw new Error('No rows updated. Check if ID matches.');
  }

  // 3. Записуємо в лог
  const { error: logError } = await supabase
    .from('inventory_logs')
    .insert({
      product_id: productId,
      sku,
      color,
      size,
      change_amount: changeAmount,
      new_stock: newStock,
      reason,
      user_id: user.id
    });

  if (logError) console.error('Failed to create inventory log:', logError);

  // Ревалідуємо ВСІ шляхи, щоб сайт одразу побачив зміни
  return { success: true };
}

/**
 * Оновлює ПОВНИЙ набір залишків для товару (для кнопки "Зберегти")
 */
export async function saveProductStockAction({
  productId,
  sku,
  color,
  stock,
}: {
  productId: string;
  sku: string;
  color: string;
  stock: Record<string, number>;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Визначаємо які розміри мають залишок > 0
  const activeSizes = Object.entries(stock)
    .filter(([_, qty]) => qty > 0)
    .map(([size]) => size);

  const { data: updatedData, error: updateError } = await supabase
    .from('products')
    .update({ 
      stock_by_size: stock,
      sizes: activeSizes
    })
    .eq('id', productId)
    .select();

  if (updateError) throw updateError;
  if (!updatedData || updatedData.length === 0) throw new Error('Product not found');

  // Ревалідуємо
  revalidatePath('/', 'layout');
  revalidatePath('/admin/inventory');
  
  return { success: true };
}

/**
 * Отримує історію змін на складі
 */
export async function getInventoryLogs(limit = 100) {
  const { data, error } = await supabaseAdmin
    .from('inventory_logs')
    .select('*, products(title)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
