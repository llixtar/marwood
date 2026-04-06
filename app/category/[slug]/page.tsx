import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ProductGridClient } from '@/components/product/ProductGridClient';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const validSlugs = ['panties', 'basic', 'erotic', 'costumes', 'robes', 'pajamas', 'body', 'plus-size', 'new'];
  
  if (!validSlugs.includes(slug)) {
    notFound();
  }

  const titleMap: Record<string, string> = {
    'panties': 'Труси',
    'basic': 'Базова білизна',
    'erotic': 'Еротична білизна',
    'costumes': 'Еротичні костюми',
    'robes': 'Халати',
    'pajamas': 'Піжами',
    'body': 'Боді',
    'plus-size': 'Плюс Сайз',
    'new': 'Новинки',
  };

  const currentTitle = titleMap[slug] || slug;

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_slug', slug)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen pt-16 pb-12 px-4 container mx-auto flex flex-col items-center">
      
      <div className="w-full flex items-center justify-start gap-2 text-sm text-bottle/60 mb-8 mt-4">
        <Link href="/" className="hover:text-bottle transition-colors">Головна</Link>
        <span>/</span>
        <span className="text-bottle uppercase tracking-wider">{currentTitle}</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-light uppercase tracking-[0.2em] text-bottle mb-12 text-center">
        {currentTitle}
      </h1>

      {(!products || products.length === 0) ? (
        <div className="w-full max-w-4xl flex flex-col items-center justify-center p-12 md:py-24 border border-dashed border-bottle/30 rounded-sm bg-bottle/5">
          <p className="text-xl md:text-2xl text-bottle mb-6 font-extralight tracking-widest text-center uppercase">
            Колекція формується
          </p>
          <Link href="/" className="px-8 py-4 border border-bottle text-bottle hover:bg-bottle hover:text-milky transition-colors uppercase tracking-[0.2em] text-xs">
            На головну
          </Link>
        </div>
      ) : (
        <ProductGridClient products={products} />
      )}

    </main>
  );
}
