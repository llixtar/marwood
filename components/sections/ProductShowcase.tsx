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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ProductQuickView } from '@/components/product/ProductQuickView';
import { useCartStore } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useQuickViewStore } from '@/lib/store/quickViewStore';

type ShowcaseProps = {
  hitsProducts: any[];
  newProducts: any[];
  saleProducts: any[];
};

export function ProductShowcase({ hitsProducts, newProducts, saleProducts }: ShowcaseProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('hits');

  useEffect(() => {
    setIsMounted(true);

    // Перевірка хешу в URL
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#sale' || hash === '#hits' || hash === '#new') {
        if (hash === '#sale') setActiveTab('sale');
        if (hash === '#hits') setActiveTab('hits');
        if (hash === '#new') setActiveTab('new');
        
        const element = document.getElementById('sale');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <section id="sale" className="w-full py-10 md:py-16 px-2 md:px-4 scroll-mt-20">
      <div className="container mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col items-center">
          <TabsList className="bg-bottle/5 p-1 md:p-1 mb-8 md:mb-12 h-11 md:h-14 rounded-full border border-bottle/10 flex items-center justify-center backdrop-blur-sm shadow-inner overflow-hidden">
            <TabsTrigger
              value="hits"
              className="h-full text-[10px] md:text-sm font-heading font-bold uppercase tracking-widest rounded-full px-4 md:px-8 flex items-center justify-center data-[state=active]:bg-bottle data-[state=active]:text-milky data-[state=active]:shadow-lg transition-all duration-300 hover:text-bottle/70 data-[state=active]:hover:text-milky"
            >
              Хіти продажу
            </TabsTrigger>
            <TabsTrigger
              value="new"
              className="h-full text-[10px] md:text-sm font-heading font-bold uppercase tracking-widest rounded-full px-4 md:px-8 flex items-center justify-center data-[state=active]:bg-bottle data-[state=active]:text-milky data-[state=active]:shadow-lg transition-all duration-300 hover:text-bottle/70 data-[state=active]:hover:text-milky"
            >
              Новинки
            </TabsTrigger>
            <TabsTrigger
              value="sale"
              className="h-full text-[10px] md:text-sm font-heading font-bold uppercase tracking-widest rounded-full px-4 md:px-8 flex items-center justify-center data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 text-red-600/70 hover:text-red-600 data-[state=active]:hover:text-white"
            >
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
  if (!products || products.length === 0) {
    return <div className="py-12 text-center text-bottle/50 tracking-widest uppercase text-sm">Тут поки пусто</div>;
  }

  return (
    <Carousel opts={{ align: "start" }} className="w-full md:-mb-52">
      <CarouselContent className="-ml-2 md:-ml-4 md:pb-52 pt-2">
        {products.map((product) => (
          <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4">
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
  const currentPrice = product.discount_price ? product.discount_price : product.price;
  const oldPrice = product.discount_price ? product.price : null;
  const imageSrc = product.images && product.images.length > 0 ? product.images[0] : '';

  const { addItem, openCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { user } = useAuthStore();
  const { openQuickView } = useQuickViewStore();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showToast, setShowToast] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isProductOutOfStock = product.sizes && product.sizes.length > 0
    ? Object.values(product.stock_by_size || {}).every((v: any) => v <= 0)
    : (product.stock_quantity ?? 0) <= 0;

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (product.sizes?.length > 0 && !selectedSize) {
      setShowToast('Будь ласка, оберіть розмір!');
      setTimeout(() => setShowToast(''), 3000);
      return;
    }

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      discount_price: product.discount_price,
      image: product.images?.[0],
      selectedSize: selectedSize || undefined,
      sku: product.sku,
    });

    openCart();
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      (window as any).dispatchOpenAuth?.();
      return;
    }

    toggleItem({
      id: product.id,
      title: product.title,
      price: product.price,
      discount_price: product.discount_price,
      images: product.images,
      color: product.color,
      sizes: product.sizes,
      sku: product.sku,
      description: product.description,
    });
  };

  return (
    <div className="group relative w-full bg-background rounded-md hover:z-50 flex flex-col h-full border border-black/5 md:border-transparent">

      {/* Контейнер картинки */}
      <div
        className="relative aspect-[3/4] md:h-[260px] md:aspect-auto w-full overflow-hidden bg-bottle/5 flex-shrink-0 cursor-pointer"
        onClick={() => openQuickView(product)}
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

        {/* Бейджі */}
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
          {isProductOutOfStock && (
            <div className="px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white bg-gray-500 shadow-sm">
              НЕМАЄ В НАЯВНОСТІ
            </div>
          )}
        </div>

        {/* Кнопка вибраного (Топ право) */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 md:top-3 md:right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/80 active:scale-90 shadow-sm md:hidden"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${mounted && isInWishlist(product.id)
                ? 'fill-red-500 text-red-500'
                : 'text-bottle/40'
              }`}
          />
        </button>

        {/* Швидке додавання (Мобілка) */}
        <div className="absolute bottom-2 right-2 z-20 md:hidden" onClick={(e) => e.stopPropagation()}>
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
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[2.5rem] px-3 h-10 rounded-none border flex items-center justify-center text-sm font-medium transition-colors ${selectedSize === size
                              ? 'bg-bottle text-white border-bottle'
                              : 'bg-transparent text-bottle border-bottle/20'
                            }`}
                        >
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
                  <SheetClose asChild>
                    <Button
                      disabled={isProductOutOfStock}
                      onClick={() => handleAddToCart()}
                      className="flex-1 bg-bottle text-milky h-12 rounded-none uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-3 px-6 disabled:bg-gray-200 disabled:text-bottle/30"
                    >
                      {isProductOutOfStock ? 'Немає в наявності' : <><ShoppingCart className="w-4 h-4 ml-1" /> В кошик</>}
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Інформація під картинкою */}
      <div
        className="p-3 md:p-4 pb-4 md:pb-4 relative bg-white z-10 transition-all duration-300 flex-1 flex flex-col justify-between cursor-pointer"
        onClick={() => openQuickView(product)}
      >
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

        {/* ДЕСКТОПНЕ ХОВЕР-МЕНЮ */}
        <div
          className="absolute top-1/2 left-0 w-full bg-white border border-t-0 border-bottle/10 p-5 opacity-0 pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto translate-y-[-10px] md:group-hover:translate-y-0 transition-all duration-300 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] z-20 flex-col gap-4 hidden md:flex"
          onClick={(e) => e.stopPropagation()}
        >

          {product.sizes && product.sizes.length > 0 && (
            <div>
              <p className="text-[10px] text-bottle/60 mb-2 uppercase tracking-widest font-bold">Розмір</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={(e) => { e.stopPropagation(); setSelectedSize(size); }}
                    className={`min-w-[2rem] px-2 h-8 border flex items-center justify-center text-xs font-medium transition-colors ${selectedSize === size
                        ? 'bg-bottle text-white border-bottle'
                        : 'bg-transparent text-bottle border-bottle/10 hover:border-bottle'
                      }`}
                  >
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
            <Button
              disabled={isProductOutOfStock}
              onClick={handleAddToCart}
              className="flex-1 bg-bottle text-milky hover:bg-bottle/90 h-10 rounded-none uppercase tracking-[0.2em] text-[10px] font-bold flex items-center justify-center gap-3 px-6 disabled:bg-gray-200 disabled:text-bottle/30"
            >
              {isProductOutOfStock ? 'Немає' : <><ShoppingCart className="w-3.5 h-3.5 ml-1" /> В кошик</>}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`h-10 w-10 border-bottle/20 rounded-none flex-shrink-0 transition-colors ${mounted && isInWishlist(product.id)
                  ? 'bg-red-50 text-red-500 border-red-200'
                  : 'text-bottle hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                }`}
              onClick={handleToggleWishlist}
            >
              <Heart className={`w-4 h-4 ${mounted && isInWishlist(product.id) ? 'fill-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-bottle text-white text-[10px] px-4 py-2 rounded-full shadow-2xl z-50 animate-in slide-in-from-top fade-in flex items-center gap-2 whitespace-nowrap border border-white/20 font-medium">
          {showToast}
        </div>
      )}
    </div>
  );
}
