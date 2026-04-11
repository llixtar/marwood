import { supabaseAdmin } from '@/lib/supabase/server';
import { InventoryClient } from '@/components/admin/InventoryClient';
import { LayoutDashboard } from 'lucide-react';

export const revalidate = 0; // Завжди свіжі дані

export default async function InventoryPage() {
  // Отримуємо всі товари
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('category_slug')
    .order('sku');

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-bottle uppercase tracking-[0.2em] mb-2 flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 opacity-20" />
          Управління складом
        </h1>
        <p className="text-xs text-bottle/50 uppercase tracking-widest font-mono">Контроль наявності та швидкий пошук за артикулом</p>
      </div>

      <InventoryClient initialProducts={products || []} />
    </div>
  );
}
