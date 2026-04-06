'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Plus, Minus, ShoppingCart } from 'lucide-react';
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

// --- МОКОВІ ДАНІ З МУЛЬТИ-ЛЕЙБЛАМИ ---
const hitsProducts = [
  { id: 1, name: 'Комплект BASIC', price: '295 грн', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600', sizes: ['S', 'M', 'L'], colors: ['#0a0a0a', '#ffffff'], badges: [{ type: 'hit', text: 'Хіт продажу' }, { type: 'new', text: 'NEW' }] },
  { id: 2, name: 'Комплект з сіточки', price: '340 грн', oldPrice: '430 грн', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=600', sizes: ['S', 'M'], colors: ['#0a0a0a'], badges: [{ type: 'hit', text: 'Хіт продажу' }, { type: 'sale', text: '-20%' }] },
  { id: 3, name: 'Мереживний боді', price: '650 грн', image: 'https://images.unsplash.com/photo-1508243529287-e21914733111?q=80&w=600', sizes: ['XS', 'S', 'M'], colors: ['#0a0a0a'], badges: [{ type: 'hit', text: 'Хіт продажу' }] },
  { id: 4, name: 'Комплект з мережива', price: '565 грн', image: 'https://images.unsplash.com/photo-1515562141207-7a8f73cb55b1?q=80&w=600', sizes: ['XS', 'S', 'M'], colors: ['#0a0a0a', '#800020'], badges: [] },
];

const newProducts = [
  { id: 6, name: 'Спортивний топ', price: '420 грн', image: 'https://images.unsplash.com/photo-1617392652178-953b1b9eeb2c?q=80&w=600', sizes: ['S', 'M', 'L'], colors: ['#0a0a0a', '#e5e7eb'], badges: [{ type: 'new', text: 'NEW' }] },
  { id: 7, name: 'Базові сліпи', price: '150 грн', image: 'https://images.unsplash.com/photo-1608228068565-d021c17da623?q=80&w=600', sizes: ['S', 'M', 'L', 'XL'], colors: ['#ffffff', '#0a0a0a', '#d2b48c'], badges: [{ type: 'new', text: 'NEW' }] },
];

const saleProducts = [
  { id: 10, name: 'Трусики бразиліани', price: '180 грн', oldPrice: '250 грн', image: 'https://images.unsplash.com/photo-1582715065287-31c360980fa2?q=80&w=600', sizes: ['S', 'M'], colors: ['#0a0a0a'], badges: [{ type: 'sale', text: '-28%' }] },
  { id: 11, name: 'Комплект "Ніжність"', price: '399 грн', oldPrice: '550 грн', image: 'https://images.unsplash.com/photo-1521572008054-d890060d463e?q=80&w=600', sizes: ['S', 'L'], colors: ['#ffffff'], badges: [{ type: 'sale', text: '-27%' }] },
];

export function ProductShowcase() {
  const [isMounted, setIsMounted] = useState(false);

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
            <ProductCarousel products={hitsProducts} isMounted={isMounted} />
          </TabsContent>
          <TabsContent value="new" className="w-full">
            <ProductCarousel products={newProducts} isMounted={isMounted} />
          </TabsContent>
          <TabsContent value="sale" className="w-full">
            <ProductCarousel products={saleProducts} isMounted={isMounted} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function ProductCarousel({ products, isMounted }: { products: any[], isMounted: boolean }) {
  return (
    <Carousel opts={{ align: "start" }} className="w-full md:-mb-56">
      <CarouselContent className="-ml-2 md:-ml-4 md:pb-56 pt-2">
        {products.map((product) => (
          // На мобілці basis-1/3 (3 в ряд), на планшеті 1/2, на десктопі 1/4
          <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/3 sm:basis-1/2 lg:basis-1/4">
            <ProductCard product={product} />
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

function ProductCard({ product }: { product: any }) {
  return (
    <div className="group relative w-full bg-background rounded-md hover:z-50 flex flex-col h-full">
      
      {/* Контейнер картинки */}
      <div className="relative h-[160px] md:h-[400px] w-full overflow-hidden rounded-t-md bg-bottle/5">
        
        {/* Головне посилання на картинку */}
        <Link href={`/product/${product.id}`} className="absolute inset-0 z-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        
        {/* Бейджі (Колонка з лейблами) */}
        <div className="absolute top-1 left-1 md:top-3 md:left-3 z-10 flex flex-col gap-1 pointer-events-none">
          {product.badges?.map((badge: any, idx: number) => (
            <div key={idx} className={`px-1.5 py-0.5 md:px-3 md:py-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-milky rounded-sm ${
              badge.type === 'new' ? 'bg-bottle' : 
              badge.type === 'sale' ? 'bg-red-600' : 'bg-bottle/80 backdrop-blur-sm'
            }`}>
              {badge.text}
            </div>
          ))}
        </div>

        {/* --- МОБІЛЬНИЙ QUICK BUY (Шторка) --- */}
        {/* Показуємо тільки на мобільному, відкриває шторку */}
        <div className="absolute bottom-2 right-2 z-20 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="bg-milky text-bottle p-1.5 rounded-full shadow-md border border-bottle/10 active:scale-95 transition-transform" aria-label="Швидка покупка">
                <ShoppingCart className="w-4 h-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-milky rounded-t-2xl border-bottle/10 px-4 py-6">
              <SheetHeader className="text-left mb-4">
                <SheetTitle className="text-bottle font-medium text-lg">{product.name}</SheetTitle>
                <div className="flex gap-2 items-baseline">
                  <p className={`font-bold ${product.oldPrice ? 'text-red-600' : 'text-bottle'}`}>{product.price}</p>
                  {product.oldPrice && <p className="text-xs text-bottle/50 line-through">{product.oldPrice}</p>}
                </div>
              </SheetHeader>
              
              <div className="flex flex-col gap-4">
                {/* Розмір */}
                <div>
                  <p className="text-xs text-bottle/60 mb-2 uppercase tracking-wider">Розмір</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size: string) => (
                      <button key={size} className="min-w-[2.5rem] px-2 h-10 rounded-md border border-bottle/20 flex items-center justify-center text-sm font-medium text-bottle hover:border-bottle hover:bg-bottle/5 transition-colors">
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Колір */}
                <div>
                  <p className="text-xs text-bottle/60 mb-2 uppercase tracking-wider">Колір</p>
                  <div className="flex gap-3">
                    {product.colors.map((color: string, index: number) => (
                      <button key={index} className={`w-8 h-8 rounded-full border shadow-sm ${color === '#ffffff' ? 'border-bottle/20' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>

                {/* Кнопки мобілка */}
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex items-center border border-bottle/20 rounded-md h-12 w-28">
                    <button className="flex-1 flex items-center justify-center text-bottle"><Minus className="w-4 h-4" /></button>
                    <span className="text-base font-medium w-8 text-center">1</span>
                    <button className="flex-1 flex items-center justify-center text-bottle"><Plus className="w-4 h-4" /></button>
                  </div>
                  <Button className="flex-1 bg-bottle text-milky h-12 rounded-md uppercase tracking-wider text-sm">
                    Купити
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Інформація під картинкою */}
      <div className="pt-2 md:pt-4 pb-2 md:pb-4 relative bg-background z-10 transition-all duration-300 flex-1 flex flex-col justify-between">
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="font-medium text-bottle text-[10px] md:text-lg hover:underline underline-offset-4 line-clamp-2 md:line-clamp-1 leading-tight">{product.name}</h3>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-baseline gap-0 md:gap-2 mt-1">
          <p className={`font-bold text-xs md:text-base ${product.oldPrice ? 'text-red-600' : 'text-bottle'}`}>{product.price}</p>
          {product.oldPrice && (
            <p className="text-[9px] md:text-xs text-bottle/50 line-through">{product.oldPrice}</p>
          )}
        </div>
        
        {/* ДЕСКТОПНЕ ХОВЕР-МЕНЮ (Приховане на мобілці) */}
        <div className="absolute top-full left-0 w-full bg-background border border-t-0 border-bottle/10 rounded-b-md p-4 opacity-0 pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto translate-y-[-10px] md:group-hover:translate-y-0 transition-all duration-300 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] z-20 flex-col gap-4 hidden md:flex">
          {/* ... Вміст десктопного меню залишився без змін ... */}
          <div>
            <p className="text-xs text-bottle/60 mb-2 uppercase tracking-wider">Розмір</p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size: string) => (
                <button key={size} className="min-w-[2rem] px-2 h-8 rounded-full border border-bottle/20 flex items-center justify-center text-xs font-medium text-bottle hover:border-bottle hover:bg-bottle/5 transition-colors">
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-bottle/60 mb-2 uppercase tracking-wider">Колір</p>
            <div className="flex gap-2">
              {product.colors.map((color: string, index: number) => (
                <button key={index} className={`w-6 h-6 rounded-full border shadow-sm hover:scale-110 transition-transform ${color === '#ffffff' ? 'border-bottle/20' : 'border-transparent'}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center border border-bottle/20 rounded-md h-10 w-24">
              <button className="flex-1 flex items-center justify-center text-bottle hover:bg-bottle/5 h-full"><Minus className="w-3 h-3" /></button>
              <span className="text-sm font-medium w-8 text-center">1</span>
              <button className="flex-1 flex items-center justify-center text-bottle hover:bg-bottle/5 h-full"><Plus className="w-3 h-3" /></button>
            </div>
            <Button className="flex-1 bg-bottle text-milky hover:bg-bottle/90 h-10 rounded-md uppercase tracking-wider text-xs">
              Купити
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 border-bottle/20 text-bottle hover:bg-bottle/5 rounded-md flex-shrink-0">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}