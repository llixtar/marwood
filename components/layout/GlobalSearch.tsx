'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/lib/supabase/client';
import { ProductQuickView } from '@/components/product/ProductQuickView';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  // Здійснюємо пошук при зміні debouncedQuery
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const fetchResults = async () => {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`title.ilike.%${debouncedQuery}%,sku.ilike.%${debouncedQuery}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setResults(data);
      }
      setIsSearching(false);
    };

    fetchResults();
  }, [debouncedQuery]);

  // Закриваємо пошук якщо відкрилась картка (опціонально, але для UX краще лишити щоб повернутись до результатів)
  // Ми дозволимо вікну пошуку залишатись позаду

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-bottle hover:bg-bottle/5">
            <Search className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="top" className="w-full h-[85vh] sm:h-[70vh] bg-white border-b border-bottle/10 shadow-2xl p-0 flex flex-col z-[100]">
          <SheetHeader className="sr-only">
            <SheetTitle>Пошук товарів</SheetTitle>
            <SheetDescription>Введіть назву або артикул для пошуку</SheetDescription>
          </SheetHeader>
          <div className="container mx-auto max-w-4xl px-4 py-8 flex flex-col h-full">
            
            {/* Рядок пошуку */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-bottle/40" />
              <input
                type="text"
                autoFocus
                placeholder="Пошук за назвою або артикулом..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-xl md:text-3xl font-light tracking-wide text-bottle border-b-2 border-bottle/20 pb-4 pl-14 pr-12 focus:outline-none focus:border-bottle transition-colors placeholder:text-bottle/20 bg-transparent"
              />
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-bottle/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-bottle/50" />
                </button>
              )}
            </div>

            {/* Зона результатів */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center p-12 text-bottle/50">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="uppercase tracking-widest text-xs font-bold">Шукаємо...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.map((product) => (
                    <div 
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className="group cursor-pointer flex flex-col items-center text-center"
                    >
                      <div className="relative w-full aspect-[3/4] bg-bottle/5 mb-3 overflow-hidden">
                        {product.images && product.images.length > 0 && (
                          <Image 
                            src={product.images[0]} 
                            alt={product.title} 
                            fill 
                            className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                          />
                        )}
                        {product.sku && (
                          <span className="absolute top-2 left-2 bg-white/90 text-bottle px-1.5 py-0.5 text-[8px] font-mono tracking-widest border border-bottle/10 shadow-sm z-10">
                            {product.sku}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs uppercase tracking-widest font-bold text-bottle line-clamp-1 mb-1">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {product.discount_price ? (
                          <>
                            <span className="text-red-600 font-bold text-xs">{product.discount_price} ₴</span>
                            <span className="text-bottle/40 line-through text-[10px]">{product.price} ₴</span>
                          </>
                        ) : (
                          <span className="text-bottle font-bold text-xs">{product.price} ₴</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : debouncedQuery.length > 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-bottle/50">
                  <p className="uppercase tracking-widest text-sm font-light text-center border-b border-bottle/10 pb-4 inline-block">
                    Товарів за запитом "{debouncedQuery}" не знайдено
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6 pt-4">
                  <p className="uppercase tracking-[0.2em] text-[10px] font-bold text-bottle/40">Популярні КАТЕГОРІЇ</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { name: 'Труси', slug: 'panties' },
                      { name: 'Базова білизна', slug: 'basic' },
                      { name: 'Еротична білизна', slug: 'erotic' },
                      { name: 'Халати', slug: 'robes' },
                      { name: 'Боді', slug: 'body' },
                      { name: 'Купальники', slug: 'swimwear' },
                      { name: 'Купальники Plus Size', slug: 'plus-size-swimwear' },
                    ].map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          window.location.href = `/category/${cat.slug}`;
                          setIsOpen(false);
                        }}
                        className="px-6 py-3 border border-bottle/10 hover:border-bottle transition-colors text-xs uppercase tracking-widest text-bottle"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Швидкий перегляд товару */}
      <ProductQuickView 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </>
  );
}
