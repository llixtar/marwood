import { ProductForm } from '@/components/admin/ProductForm';
import { supabaseAdmin } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ q?: string; category?: string }> 
}) {
  const { id } = await params;
  const { q, category } = await searchParams;

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  return <ProductForm initialData={product} returnParams={{ q, category }} />;
}
