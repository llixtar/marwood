import { ProductForm } from '@/components/admin/ProductForm';
import { supabaseAdmin } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  return <ProductForm initialData={product} />;
}
