'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { ProductQuickView } from './ProductQuickView';
import { SlidersHorizontal, ChevronDown, Heart } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useQuickViewStore } from '@/lib/store/quickViewStore';

type ProductGridClientProps = {
  products: any[];
};

export function ProductGridClient({ products }: ProductGridClientProps) {
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { user } = useAuthStore();
  const { openQuickView } = useQuickViewStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Фільтри
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('newest');
  
  // Максимальна ціна серед усіх товарів
  const maxProductPrice = useMemo(() => {
    return products.length > 0 
      ? Math.max(...products.map(p => p.discount_price || p.price), 0)
      : 10000;
  }, [products]);
  
  const minProductPrice = useMemo(() => {
    return products.length > 0
      ? Math.min(...products.map(p => p.discount_price || p.price), 0)
      : 0;
  }, [products]);

  // Поточні обрані ліміти ціни
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);

  // Встановлюємо правильні ліміти після першого рендеру
  useEffect(() => {
    setMinPrice(minProductPrice);
    setMaxPrice(maxProductPrice);
  }, [minProductPrice, maxProductPrice]);

  // Збираємо всі доступні значення розмірів та кольорів
  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach(p => p.sizes?.forEach((s: string) => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [products]);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach(p => p.color && colors.add(p.color));
    return Array.from(colors).sort();
  }, [products]);

  // Фільтрація
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const pPrice = p.discount_price || p.price;
      if (pPrice < minPrice || pPrice > maxPrice) return false;
      
      if (selectedSizes.length > 0) {
        if (!p.sizes || !p.sizes.some((s: string) => selectedSizes.includes(s))) return false;
      }
      
      if (selectedColors.length > 0) {
        if (!p.color || !selectedColors.includes(p.color)) return false;
      }
      
      return true;
    });
  }, [products, minPrice, maxPrice, selectedSizes, selectedColors]);

  // Сортування
  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortOption) {
      case 'price_asc':
        arr.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
        break;
      case 'price_desc':
        arr.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
        break;
      case 'name_asc':
        arr.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'popularity':
        arr.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
        break;
      default:
        // 'newest' (за датою спадання)
        arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return arr;
  }, [filteredProducts, sortOption]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const filterSidebarContent = (
    <div className="flex flex-col gap-8 w-full mt-4 lg:mt-0 pb-8 lg:pb-0">
      {/* ЦІНА */}
      <div className="flex flex-col gap-4">
        <h4 className="flex items-center justify-between text-xs uppercase tracking-widest font-bold text-bottle border-b border-bottle/10 pb-2">
          Ціна
        </h4>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bottle/50 text-[10px] font-mono">Від</span>
            <input 
              type="number" 
              className="w-full text-[16px] lg:text-xs border border-bottle/20 py-2 pl-9 pr-3 text-bottle focus:outline-none focus:border-bottle transition-colors"
              value={Number(minPrice).toString()} 
              onChange={(e) => setMinPrice(Math.max(minProductPrice, Math.min(maxPrice, Number(e.target.value))))}
            />
          </div>
          <span className="text-bottle/30">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bottle/50 text-[10px] font-mono">До</span>
            <input 
              type="number" 
              className="w-full text-[16px] lg:text-xs border border-bottle/20 py-2 pl-9 pr-3 text-bottle focus:outline-none focus:border-bottle transition-colors"
              value={Number(maxPrice).toString()} 
              onChange={(e) => setMaxPrice(Math.max(minPrice, Math.min(maxProductPrice, Number(e.target.value))))}
            />
          </div>
        </div>

        <div className="mt-2 touch-none">
          <input 
            type="range" 
            min={minProductPrice} 
            max={maxProductPrice} 
            step="1"
            value={maxPrice} 
            onChange={(e) => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-full accent-bottle h-0.5 bg-bottle/20 rounded-none appearance-none cursor-grab active:cursor-grabbing outline-none relative z-10"
          />
          <div className="flex justify-between text-[10px] text-bottle/50 font-mono mt-2">
            <span>{Math.round(minProductPrice)} ₴</span>
            <span>{Math.round(maxProductPrice)} ₴</span>
          </div>
        </div>
      </div>

      {/* РОЗМІРИ */}
      {allSizes.length > 0 && (
        <div className="flex flex-col gap-4">
          <h4 className="text-xs uppercase tracking-widest font-bold text-bottle border-b border-bottle/10 pb-2">
            Розмір
          </h4>
          <div className="flex flex-wrap gap-2">
            {allSizes.map(size => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                  selectedSizes.includes(size) 
                    ? 'bg-bottle text-white border-bottle' 
                    : 'bg-white text-bottle hover:border-bottle border-bottle/20'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* КОЛЬОРИ */}
      {allColors.length > 0 && (
        <div className="flex flex-col gap-4">
          <h4 className="text-xs uppercase tracking-widest font-bold text-bottle border-b border-bottle/10 pb-2">
            Колір
          </h4>
          <div className="flex flex-wrap gap-2">
            {allColors.map(color => (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-colors ${
                  selectedColors.includes(color) 
                    ? 'bg-bottle text-white border-bottle' 
                    : 'bg-white text-bottle hover:border-bottle border-bottle/20'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full flex flex-col">
      {/* Top Bar (Сортування і лічильник) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 w-full border-b border-bottle/10 pb-4">
        <div className="text-xs text-bottle/60 font-mono pt-2 sm:pt-0">
          Товарів: {sortedProducts.length}
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          {/* Кнопка фільтрів (Мобільна) */}
          <button 
            className="lg:hidden flex flex-1 sm:flex-none items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold text-bottle border border-bottle/20 px-4 py-3 hover:bg-bottle/5 transition-colors"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Фільтри
            {(selectedSizes.length > 0 || selectedColors.length > 0 || maxPrice < maxProductPrice || minPrice > minProductPrice) && (
              <span className="w-2 h-2 rounded-full bg-red-500 ml-1"></span>
            )}
          </button>
          
          <div className="relative flex-1 sm:flex-none">
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full sm:w-64 appearance-none bg-transparent border border-bottle/20 px-4 py-3 pr-10 text-xs uppercase tracking-widest text-bottle font-bold cursor-pointer hover:bg-bottle/5 outline-none transition-colors"
            >
              <option value="newest">Новинки</option>
              <option value="price_asc">Від дешевих</option>
              <option value="price_desc">Від дорогих</option>
              <option value="popularity">За популярністю</option>
              <option value="name_asc">За назвою (А-Я)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-10 w-full relative items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
          {filterSidebarContent}
        </aside>

        {/* Main Grid Каталогу */}
        <div className="flex-1 min-w-0">
          {sortedProducts.length === 0 ? (
            <div className="w-full py-20 flex flex-col items-center justify-center border border-dashed border-bottle/20 bg-bottle/5">
              <p className="text-bottle/50 uppercase tracking-widest text-sm font-light text-center px-4">
                За обраними фільтрами нічого не знайдено
              </p>
              <button 
                onClick={() => {
                  setSelectedSizes([]);
                  setSelectedColors([]);
                  setMinPrice(minProductPrice);
                  setMaxPrice(maxProductPrice);
                }}
                className="mt-6 text-xs font-bold uppercase tracking-widest text-bottle border-b border-bottle pb-0.5 hover:text-red-500 hover:border-red-500 transition-colors"
              >
                Скинути фільтри
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 w-full">
              {sortedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="group flex flex-col cursor-pointer"
                  onClick={() => openQuickView(product)}
                >
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-bottle/5 mb-3">
                    {product.images && product.images.length > 0 ? (
                      <Image 
                        src={product.images[0]} 
                        alt={product.title} 
                        fill 
                        className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                      />
                    ) : null}
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      {product.is_new && (
                        <span className="bg-bottle text-milky px-2 py-1 text-[9px] uppercase tracking-widest font-bold shadow-sm w-fit">
                          New
                        </span>
                      )}
                      {product.discount_price && (
                        <span className="bg-red-600 text-white px-2 py-1 text-[9px] uppercase tracking-widest font-bold shadow-sm w-fit">
                          Sale
                        </span>
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Підказка розмірів при наведенні */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 px-2 flex-wrap">
                        {product.sizes.map((s: string) => (
                          <span key={s} className="bg-white/95 text-bottle text-[9px] font-bold px-1.5 py-0.5 min-w-[20px] text-center shadow-sm">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Кнопка вибраного */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        
                        // Перевірка авторизації
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
                      }}
                      className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 bg-white/80 hover:bg-white shadow-sm hover:shadow-md"
                      title={mounted && isInWishlist(product.id) ? 'Видалити з вибраного' : 'Додати до вибраного'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-all duration-200 ${
                          mounted && isInWishlist(product.id)
                            ? 'fill-red-500 text-red-500 scale-110'
                            : 'text-bottle/50 fill-transparent'
                        }`}
                      />
                    </button>

                  </div>

                  <div className="flex flex-col items-center z-10 px-2 text-center pb-4">
                    <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-widest text-bottle line-clamp-1 mb-1">
                      {product.title}
                    </h3>
                    
                    {product.color && (
                      <span className="text-[9px] md:text-[10px] text-bottle/50 mb-2 uppercase tracking-widest">{product.color}</span>
                    )}

                    <div className="flex items-center gap-2">
                      {product.discount_price ? (
                        <>
                          <span className="text-red-600 font-bold text-sm md:text-base">{product.discount_price} ₴</span>
                          <span className="text-bottle/40 line-through text-xs md:text-xs">{product.price} ₴</span>
                        </>
                      ) : (
                        <span className="text-bottle font-bold text-sm md:text-base">{product.price} ₴</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Мобільні фільтри Sheet */}
      <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
        <SheetContent 
          side="left" 
          className="w-[85vw] sm:w-[400px] p-6 bg-white overflow-y-auto border-none shadow-2xl z-[150]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className="mb-6 border-b border-bottle/10 pb-4 text-left">
            <SheetTitle className="text-lg font-light uppercase tracking-widest text-bottle">Фільтри</SheetTitle>
          </SheetHeader>
          
          {filterSidebarContent}
          
          <div className="mt-10 flex flex-col gap-3">
            <button 
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full bg-bottle text-white py-4 uppercase tracking-widest text-[10px] font-bold hover:bg-bottle/90 transition-colors shadow-xl"
            >
              Застосувати ({sortedProducts.length})
            </button>
            {(selectedSizes.length > 0 || selectedColors.length > 0 || maxPrice < maxProductPrice || minPrice > minProductPrice) && (
              <button 
                onClick={() => {
                  setSelectedSizes([]);
                  setSelectedColors([]);
                  setMinPrice(minProductPrice);
                  setMaxPrice(maxProductPrice);
                }}
                className="w-full border border-bottle/20 text-bottle py-4 uppercase tracking-widest text-[10px] font-bold hover:bg-bottle/5 transition-colors"
              >
                Скинути все
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}
