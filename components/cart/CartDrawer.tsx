'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import Image from 'next/image';
import { Trash2, ShoppingBag, Minus, Plus, X, ArrowRight } from 'lucide-react';

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { items, isOpen, closeCart, removeItem, updateQty, clearCart, totalPrice, totalItems } =
    useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = totalPrice();
  const count = totalItems();

  if (!mounted) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-md p-0 flex flex-col border-none shadow-2xl bg-white overflow-hidden z-[160]"
      >
        {/* Хедер */}
        <SheetHeader className="sr-only">
          <SheetTitle>Кошик</SheetTitle>
          <SheetDescription>Ваші обрані товари</SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-between px-6 py-5 border-b border-bottle/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-bottle" strokeWidth={1.5} />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-bottle">
              Кошик
            </h2>
            {count > 0 && (
              <span className="text-[10px] font-bold bg-bottle text-milky px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-bottle/40 hover:text-bottle transition-colors rounded-full hover:bg-bottle/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Список товарів */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            /* Порожній стан */
            <div className="flex flex-col items-center justify-center h-full gap-6 px-8 text-center py-20">
              <div className="w-24 h-24 rounded-full bg-bottle/5 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-bottle/20" strokeWidth={1} />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-base font-light uppercase tracking-widest text-bottle">
                  Кошик порожній
                </p>
                <p className="text-xs text-bottle/40 leading-relaxed">
                  Додайте товари з каталогу, щоб продовжити покупки
                </p>
              </div>
              <button
                onClick={closeCart}
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
                  <li
                    key={`${item.id}-${item.selectedSize ?? ''}`}
                    className="py-5 flex gap-4"
                  >
                    {/* Фото */}
                    <div className="relative w-20 h-28 flex-shrink-0 bg-bottle/5 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-bottle/20" />
                        </div>
                      )}
                    </div>

                    {/* Деталі */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-xs font-bold uppercase tracking-widest text-bottle line-clamp-2 leading-snug">
                            {item.title}
                          </span>
                          {item.selectedSize && (
                            <span className="text-[10px] text-bottle/40 uppercase tracking-widest">
                              Розмір: {item.selectedSize}
                            </span>
                          )}
                        </div>
                        {/* Видалити */}
                        <button
                          onClick={() => removeItem(item.id, item.selectedSize)}
                          className="p-1.5 text-bottle/30 hover:text-red-500 transition-colors flex-shrink-0 hover:bg-red-50 rounded"
                          title="Видалити"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Ціна + кількість */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          {item.discount_price && (
                            <span className="text-[10px] text-bottle/30 line-through font-mono">
                              {item.price} ₴
                            </span>
                          )}
                          <span className={`text-sm font-bold ${item.discount_price ? 'text-red-600' : 'text-bottle'}`}>
                            {effectivePrice} ₴
                          </span>
                        </div>

                        {/* Лічильник */}
                        <div className="flex items-center border border-bottle/15 overflow-hidden">
                          <button
                            onClick={() => updateQty(item.id, item.selectedSize, -1)}
                            className="w-8 h-8 flex items-center justify-center text-bottle/60 hover:bg-bottle hover:text-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center text-xs font-bold text-bottle border-x border-bottle/15">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, item.selectedSize, 1)}
                            className="w-8 h-8 flex items-center justify-center text-bottle/60 hover:bg-bottle hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Футер з підсумком */}
        {items.length > 0 && (
          <div className="border-t border-bottle/10 p-6 flex flex-col gap-4 flex-shrink-0 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.04)]">
            {/* Підсумок */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-bottle/50 font-mono">
                Разом:
              </span>
              <span className="text-xl font-bold text-bottle">
                {total.toLocaleString('uk-UA')} ₴
              </span>
            </div>

            {/* Кнопки */}
            <button 
              onClick={() => { closeCart(); router.push('/checkout'); }}
              className="w-full bg-bottle text-milky py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-bottle/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-bottle/20"
            >
              Оформити замовлення
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={clearCart}
              className="w-full border border-bottle/15 text-bottle/50 py-3 uppercase tracking-widest text-[10px] font-bold hover:text-red-500 hover:border-red-300 transition-colors"
            >
              Очистити кошик
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
