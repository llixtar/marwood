'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Plus, Minus, ShoppingCart, Expand } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ProductQuickView } from '@/components/product/ProductQuickView';

type ShowcaseProps = {
  hitsProducts: any[];
  newProducts: any[];
  saleProducts: any[];
};

export function ProductShowcase({ hitsProducts, newProducts, saleProducts }: ShowcaseProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="w-full py-10 md:py-16 px-2 md:px-4">
      <div className="container mx-auto">
        <Tabs defaultValue="hits" className="w-full flex flex-col items-center">
          <TabsList className="bg-transparent mb-6 md:mb-10 gap-3 md:gap-8 h-auto flex-wrap justify-center">
            <TabsTrigger value="hits" className="text-base md:text-2xl font-light uppercase tracking-widest data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-bottle rounded-none px-0 pb-1 md:pb-2">
              Хіти продажу
            </TabsTrigger>
            <TabsTrigger value="new" className="text-base md:text-2xl font-light uppercase tracking-widest data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-bottle rounded-none px-0 pb-1 md:pb-2">
              Новинки
            </TabsTrigger>
            <TabsTrigger value="sale" className="text-base md:text-2xl font-light uppercase tracking-widest data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none px-0 pb-1 md:pb-2 text-red-600">
              Акції
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hits" className="w-full">
            <ProductCarousel products={hitsProducts} isMounted={isMounted} onSelectProduct={setSelectedProduct} />
          </TabsContent>
          <TabsContent value="new" className="w-full">
            <ProductCarousel products={newProducts} isMounted={isMounted} onSelectProduct={setSelectedProduct} />
          </TabsContent>
          <TabsContent value="sale" className="w-full">
            <ProductCarousel products={saleProducts} isMounted={isMounted} onSelectProduct={setSelectedProduct} />
          </TabsContent>
        </Tabs>
      </div>

      <ProductQuickView 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </section>
  );
}

function ProductCarousel({ products, isMounted, onSelectProduct }: { products: any[], isMounted: boolean, onSelectProduct: (p: any) => void }) {
  if (!products || products.length === 0) {
    return <div className="py-12 text-center text-bottle/50 tracking-widest uppercase text-sm">Тут поки пусто</div>;
  }

  return (
    <Carousel opts={{ align: "start" }} className="w-full md:-mb-52">
      <CarouselContent className="-ml-2 md:-ml-4 md:pb-52 pt-2">
        {products.map((product) => (
          <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4">
            <ProductCard product={product} onSelect={() => onSelectProduct(product)} />
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {isMounted && (
        <div className="hidden lg:block">
          <CarouselPrevious className="-left-12 border-bottle/20 hover:bg-bottle hover:text-milky" />
          <CarouselNext className="-right-12 border-bottle/20 hover:bg-bottle hover:text-milky" />
        </div>
      )}
    </Carousel>
  );
}

function ProductCard({ product, onSelect }: { product: any, onSelect: () => void }) {
  const currentPrice = product.discount_price ? product.discount_price : product.price;
  const oldPrice = product.discount_price ? product.price : null;
  const imageSrc = product.images && product.images.length > 0 ? product.images[0] : '';

  return (
    <div className="group relative w-full bg-background rounded-md hover:z-50 flex flex-col h-full border border-black/5 md:border-transparent">
      
      {/* Контейнер картинки (ЗМЕНШЕНА ВДВІЧІ ВИСОТА) */}
      <div 
        className="relative aspect-[3/4] md:h-[260px] md:aspect-auto w-full overflow-hidden bg-bottle/5 flex-shrink-0 cursor-pointer"
        onClick={onSelect}
      >
        
        {/* Головне посилання на картинку */}
        {imageSrc ? (
          <div className="absolute inset-0 z-0 bg-[#f8f8f8]">
            <Image
              src={imageSrc}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-[#f8f8f8] flex items-center justify-center text-xs text-bottle/30">Без фото</div>
        )}
        
        {/* Бейджі (Колонка з лейблами) */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 flex flex-col gap-1 pointer-events-none">
          {product.is_new && (
            <div className="px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-milky bg-bottle shadow-sm">
              New
            </div>
          )}
          {product.discount_price && (
            <div className="px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white bg-red-600 shadow-sm">
              Sale
            </div>
          )}
          {product.sales_count > 0 && (
             <div className="px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-bottle bg-white/90 backdrop-blur-sm shadow-sm border border-bottle/10 flex items-center gap-1 w-fit">
               <span className="text-sm border-none leading-none">🔥</span> Хіт
             </div>
          )}
        </div>

        {/* Швидке додавання (Мобілка) */}
        <div className="absolute bottom-2 right-2 z-20 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="bg-white/90 backdrop-blur-sm text-bottle w-8 h-8 rounded shadow-sm border border-bottle/10 active:scale-95 transition-transform flex items-center justify-center" aria-label="Швидка покупка">
                <ShoppingCart className="w-4 h-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-milky rounded-t-2xl border-bottle/10 px-4 py-6">
              <SheetHeader className="text-left mb-4">
                <SheetTitle className="text-bottle font-medium text-lg leading-tight">{product.title}</SheetTitle>
                <div className="flex gap-2 items-baseline mt-1">
                  {oldPrice ? (
                    <>
                      <p className="font-bold text-red-600 text-xl">{currentPrice} ₴</p>
                      <p className="text-sm text-bottle/50 line-through">{oldPrice} ₴</p>
                    </>
                  ) : (
                    <p className="font-bold text-bottle text-xl">{currentPrice} ₴</p>
                  )}
                </div>
              </SheetHeader>
              
              <div className="flex flex-col gap-4">
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <p className="text-xs text-bottle/60 mb-2 uppercase tracking-wider font-bold">Розмір</p>
                    <div className="flex gap-2 flex-wrap">
                      {product.sizes.map((size: string) => (
                        <button key={size} className="min-w-[2.5rem] px-3 h-10 rounded-none border border-bottle/20 flex items-center justify-center text-sm font-medium text-bottle focus:bg-bottle focus:text-white transition-colors">
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.color && (
                  <div className="mt-2">
                     <p className="text-xs text-bottle/60 mb-2 uppercase tracking-wider font-bold">Колір</p>
                     <span className="text-xs font-medium text-white bg-bottle px-3 py-1.5">{product.color}</span>
                  </div>
                )}

                {/* Кнопки мобілка */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-bottle/10">
                  <Button className="flex-1 bg-bottle text-milky h-12 rounded-none uppercase tracking-widest text-xs font-bold">
                    Купити зараз
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Інформація під картинкою */}
      <div className="p-3 md:p-4 pb-4 md:pb-4 relative bg-white z-10 transition-all duration-300 flex-1 flex flex-col justify-between cursor-pointer" onClick={onSelect}>
        <div>
          <h3 className="font-medium text-bottle text-[11px] md:text-sm hover:underline underline-offset-4 line-clamp-2 leading-snug uppercase tracking-wide">
            {product.title}
          </h3>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-baseline gap-0 md:gap-2 mt-2">
          {oldPrice ? (
            <>
              <p className="font-bold text-sm md:text-base text-red-600">{currentPrice} ₴</p>
              <p className="text-[10px] md:text-xs text-bottle/50 line-through">{oldPrice} ₴</p>
            </>
          ) : (
            <p className="font-bold text-sm md:text-base text-bottle">{currentPrice} ₴</p>
          )}
        </div>
        
        {/* ДЕСКТОПНЕ ХОВЕР-МЕНЮ (Приховане на мобілці) */}
        <div className="absolute top-1/2 left-0 w-full bg-white border border-t-0 border-bottle/10 p-5 opacity-0 pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto translate-y-[-10px] md:group-hover:translate-y-0 transition-all duration-300 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] z-20 flex-col gap-4 hidden md:flex">
          
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <p className="text-[10px] text-bottle/60 mb-2 uppercase tracking-widest font-bold">Розмір</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size: string) => (
                  <button key={size} className="min-w-[2rem] px-2 h-8 border border-bottle/10 flex items-center justify-center text-xs font-medium text-bottle hover:border-bottle hover:bg-bottle focus:bg-bottle focus:text-white transition-colors">
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.color && (
            <div>
              <p className="text-[10px] text-bottle/60 mb-2 uppercase tracking-widest font-bold">Колір</p>
              <span className="text-[10px] font-bold text-white bg-bottle px-2 py-1">{product.color}</span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <Button className="flex-1 bg-bottle text-milky hover:bg-bottle/90 h-10 rounded-none uppercase tracking-[0.2em] text-[10px] font-bold">
              В кошик
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 border-bottle/20 text-bottle hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-none flex-shrink-0 transition-colors">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}