'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { ShoppingBag, Minus, Plus, Trash2, ShieldCheck, Truck, CreditCard, X } from 'lucide-react';

export function OrderSummary() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQty } = useCartStore();

  const buyNow = searchParams.get('buyNow') === 'true';
  const buyNowId = searchParams.get('id');
  const buyNowSize = searchParams.get('size');

  // Визначаємо товари для відображення
  const displayedItems = buyNow 
    ? items.filter(i => String(i.id) === buyNowId && (buyNowSize ? i.selectedSize === buyNowSize : !i.selectedSize))
    : items;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Якщо товарів немає — повертаємо на головну
  useEffect(() => {
    if (mounted && displayedItems.length === 0) {
      router.push('/');
    }
  }, [mounted, displayedItems.length, router]);

  if (!mounted) {
    return (
      <div className="bg-white border border-bottle/10 p-6 animate-pulse">
        <div className="h-6 bg-bottle/10 rounded w-1/2 mb-6" />
        <div className="space-y-4">
          <div className="h-20 bg-bottle/5 rounded" />
          <div className="h-20 bg-bottle/5 rounded" />
        </div>
      </div>
    );
  }

  const total = displayedItems.reduce((sum, i) => sum + (i.discount_price ?? i.price) * i.quantity, 0);
  const count = displayedItems.reduce((sum, i) => sum + i.quantity, 0);
  const freeShippingThreshold = 2000;
  const shippingCost = total >= freeShippingThreshold ? 0 : 70;
  const finalTotal = total + shippingCost;

  return (
    <div className="bg-white border border-bottle/10 sticky top-20">
      {/* Заголовок */}
      <div className="px-6 py-4 border-b border-bottle/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-bottle/60" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-bottle">
            Ваше замовлення
          </h3>
        </div>
        <span className="text-[10px] font-bold bg-bottle text-milky px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>

      {/* Товари */}
      <div className="max-h-[500px] overflow-y-auto">
        {displayedItems.map((item) => {
          const effectivePrice = item.discount_price ?? item.price;
          return (
            <div
              key={`${item.id}-${item.selectedSize ?? ''}`}
              className="px-6 py-5 flex gap-4 border-b border-bottle/5 last:border-0 relative group"
            >
              {/* Фото */}
              <div className="relative w-16 h-24 flex-shrink-0 bg-bottle/5 overflow-hidden">
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-bottle/20" />
                  </div>
                )}
              </div>
              {/* Деталі */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-bottle line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                  {item.selectedSize && (
                    <p className="text-[10px] text-bottle/40 uppercase tracking-widest mt-0.5">
                      Розмір: {item.selectedSize}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    {item.discount_price && (
                      <span className="text-[10px] text-bottle/30 line-through font-mono">
                        {item.price} ₴
                      </span>
                    )}
                    <span className={`text-xs font-bold ${item.discount_price ? 'text-red-600' : 'text-bottle'}`}>
                      {effectivePrice} ₴
                    </span>
                  </div>

                  {/* Кількість */}
                  <div className="flex items-center border border-bottle/10">
                    <button
                      onClick={() => updateQty(item.id, item.selectedSize, -1)}
                      className="w-7 h-7 flex items-center justify-center text-bottle/50 hover:bg-bottle hover:text-white transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 h-7 flex items-center justify-center text-[10px] font-bold text-bottle border-x border-bottle/10">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.selectedSize, 1)}
                      className="w-7 h-7 flex items-center justify-center text-bottle/50 hover:bg-bottle hover:text-white transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Видалити */}
              <button
                onClick={() => {
                  if (buyNow) {
                    router.push('/');
                  } else {
                    removeItem(item.id, item.selectedSize);
                  }
                }}
                className="absolute top-4 right-4 p-2 text-bottle/20 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                title="Видалити"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Підсумок */}
      <div className="px-6 py-4 border-t border-bottle/10 space-y-3 bg-[#fafaf5]">
        <div className="flex justify-between text-xs text-bottle/60">
          <span>Товари ({count})</span>
          <span className="font-mono">{total.toLocaleString('uk-UA')} ₴</span>
        </div>
        <div className="flex justify-between text-xs text-bottle/60">
          <span>Доставка</span>
          <span className={`font-mono ${shippingCost === 0 ? 'text-green-600 font-bold' : ''}`}>
            {shippingCost === 0 ? 'Безкоштовно' : `${shippingCost} ₴`}
          </span>
        </div>

        {total < freeShippingThreshold && (
          <div className="text-[10px] text-bottle/40 bg-bottle/5 px-3 py-2 text-center">
            До безкоштовної доставки ще <strong>{freeShippingThreshold - total} ₴</strong>
          </div>
        )}

        <hr className="border-bottle/10" />

        <div className="flex justify-between items-baseline">
          <span className="text-xs uppercase tracking-widest text-bottle/50 font-mono">
            Разом:
          </span>
          <span className="text-xl font-bold text-bottle">
            {finalTotal.toLocaleString('uk-UA')} ₴
          </span>
        </div>
      </div>

      {/* Гарантії */}
      <div className="px-6 py-3 border-t border-bottle/10 space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-bottle/50">
          <Truck className="w-3 h-3 flex-shrink-0" />
          <span>Безкоштовна доставка від {freeShippingThreshold} ₴</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-bottle/50">
          <ShieldCheck className="w-3 h-3 flex-shrink-0" />
          <span>Конфіденційне пакування</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-bottle/50">
          <CreditCard className="w-3 h-3 flex-shrink-0" />
          <span>Безпечна оплата</span>
        </div>
      </div>
    </div>
  );
}
