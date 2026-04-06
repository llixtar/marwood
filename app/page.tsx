import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { CatalogGallery } from "@/components/sections/CatalogGallery";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { supabaseAdmin } from "@/lib/supabase/server";

// Додаємо ревалідацію щоб бачити зміни
export const revalidate = 60; // 60 секунд кешування

export default async function Home() {
  
  // Хіти: сортування по sales_count
  const { data: hits } = await supabaseAdmin
    .from('products')
    .select('*')
    .gt('sales_count', 0)
    .order('sales_count', { ascending: false })
    .limit(10);

  // Новинки
  const { data: newProds } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(10);

  // Акції (Або is_sale = true, або є discount_price)
  const { data: saleProds } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_sale', true)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <CatalogGallery />
      <ProductShowcase 
        hitsProducts={hits || []} 
        newProducts={newProds || []} 
        saleProducts={saleProds || []} 
      />
    </main>
  );
}