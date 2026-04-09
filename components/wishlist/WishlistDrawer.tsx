'use client';

import { useState, useEffect } from 'react';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useQuickViewStore } from '@/lib/store/quickViewStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import Image from 'next/image';
import { Trash2, Heart, X, Eye, ArrowRight } from 'lucide-react';

export function WishlistDrawer() {
  const [mounted, setMounted] = useState(false);
  const { items, isOpen, closeWishlist, removeItem, clearWishlist, totalItems } = useWishlistStore();
  const { openQuickView } = useQuickViewStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = totalItems();

  if (!mounted) return null;

  const handleProductClick = (item: any) => {
    // Формуємо об'єкт продукту для QuickView
    // В сторі ми зберігаємо базову інформацію,QuickView підвантажить деталі за SKU якщо треба
    closeWishlist();
    openQuickView(item);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeWishlist()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-md p-0 flex flex-col border-none shadow-2xl bg-white overflow-hidden z-[160]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Вибране</SheetTitle>
          <SheetDescription>Товари у вашому списку вибраного</SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-between px-6 py-5 border-b border-bottle/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-bottle" strokeWidth={1.5} />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-bottle">
              Вибране
            </h2>
            {count > 0 && (
              <span className="text-[10px] font-bold bg-bottle text-milky px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeWishlist}
            className="p-2 text-bottle/40 hover:text-bottle transition-colors rounded-full hover:bg-bottle/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 px-8 text-center py-20">
              <div className="w-24 h-24 rounded-full bg-bottle/5 flex items-center justify-center">
                <Heart className="w-10 h-10 text-bottle/20" strokeWidth={1} />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-base font-light uppercase tracking-widest text-bottle">
                  Список порожній
                </p>
                <p className="text-xs text-bottle/40 leading-relaxed">
                  Додавайте товари до вибраного, щоб не загубити їх
                </p>
              </div>
              <button
                onClick={closeWishlist}
                className="mt-2 text-xs font-bold uppercase tracking-widest text-bottle border-b border-bottle pb-0.5 hover:text-bottle/60 hover:border-bottle/60 transition-colors"
              >
                Перейти до каталогу
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-bottle/5 px-6">
              {items.map((item) => {
                const effectivePrice = item.discount_price ?? item.price;
                return (
                  <li key={item.id} className="py-5 flex gap-4">
                    {/* Фото - клікабельне */}
                    <div 
                      className="relative w-20 h-28 flex-shrink-0 bg-bottle/5 overflow-hidden cursor-pointer group"
                      onClick={() => handleProductClick(item)}
                    >
                      {item.images && item.images[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart className="w-6 h-6 text-bottle/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div 
                          className="flex flex-col gap-1 min-w-0 cursor-pointer group"
                          onClick={() => handleProductClick(item)}
                        >
                          <span className="text-xs font-bold uppercase tracking-widest text-bottle line-clamp-2 leading-snug group-hover:text-bottle/60 transition-colors">
                            {item.title}
                          </span>
                          {item.color && (
                            <span className="text-[10px] text-bottle/40 uppercase tracking-widest">
                              {item.color}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-bottle/30 hover:text-red-500 transition-colors flex-shrink-0 hover:bg-red-50 rounded"
                          title="Видалити з вибраного"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3 gap-2">
                        <div className="flex items-center gap-1.5">
                          {item.discount_price && (
                            <span className="text-[10px] text-bottle/30 line-through font-mono">
                              {item.price} ₴
                            </span>
                          )}
                          <span className={`text-sm font-bold ${item.discount_price ? 'text-red-600' : 'text-bottle'}`}>
                            {effectivePrice} ₴
                          </span>
                        </div>

                        <button
                          onClick={() => handleProductClick(item)}
                          className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-bottle border border-bottle/15 px-3 py-1.5 hover:bg-bottle/5 transition-colors"
                        >
                          Обрати розмір
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-bottle/10 p-6 flex flex-col gap-3 flex-shrink-0 bg-white">
            <button
              onClick={clearWishlist}
              className="w-full border border-bottle/15 text-bottle/50 py-3 uppercase tracking-widest text-[10px] font-bold hover:text-red-500 hover:border-red-300 transition-colors"
            >
              Очистити вибране
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
