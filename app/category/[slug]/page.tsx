import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ProductGridClient } from '@/components/product/ProductGridClient';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const validSlugs = ['panties', 'basic', 'erotic', 'costumes', 'robes', 'pajamas', 'body', 'plus-size', 'new', 'swimwear', 'plus-size-swimwear'];
  
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
    'swimwear': 'Купальники',
    'plus-size-swimwear': 'Купальники Plus Size',
  };

  const currentTitle = titleMap[slug] || slug;

  // Якщо це головна категорія Плюс Сайз, показуємо вибір підкатегорій
  if (slug === 'plus-size') {
    const subcategories = [
      { 
        title: 'Купальники', 
        slug: 'plus-size-swimwear', 
        image: '/categories/plus-size-swimwear.jpg'
      },
    ];

    return (
      <main className="min-h-screen pt-16 pb-12 px-4 container mx-auto flex flex-col items-center">
        <div className="w-full flex items-center justify-start gap-2 text-sm text-bottle/60 mb-8 mt-4">
          <Link href="/" className="hover:text-bottle transition-colors">Головна</Link>
          <span>/</span>
          <span className="text-bottle uppercase tracking-wider">{currentTitle}</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-light uppercase tracking-[0.2em] text-bottle mb-4 text-center">
          {currentTitle}
        </h1>
        <p className="text-bottle/60 text-sm uppercase tracking-widest mb-12 text-center max-w-xl">
          Оберіть категорію
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full max-w-6xl">
          {subcategories.map((sub) => (
            <Link 
              key={sub.slug} 
              href={`/category/${sub.slug}`}
              className="group relative aspect-[3/4] overflow-hidden bg-bottle/5 rounded-sm"
            >
              <Image 
                src={sub.image} 
                alt={sub.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              {/* Градієнт знизу для читабельності тексту */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Текст (стиль як на головній) */}
              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white max-w-[80%]">
                <h3 className="text-sm md:text-xl uppercase tracking-widest font-light drop-shadow-md leading-tight">
                  {sub.title}
                </h3>
                <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-medium mt-2 inline-block border-b border-white/50 pb-1 group-hover:border-white transition-colors">
                  Дивитись ➔
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    );
  }

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
