'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/store/cartStore';

export type PurchasedItem = {
  id: string;
  selectedSize?: string;
};

interface ClearCartProps {
  purchasedItems?: PurchasedItem[];
}

export function ClearCart({ purchasedItems }: ClearCartProps) {
  const clearCart = useCartStore((state) => state.clearCart);
  const removeItem = useCartStore((state) => state.removeItem);

  useEffect(() => {
    if (purchasedItems && purchasedItems.length > 0) {
      console.log('--- CLEAR CART CLIENT: Removing purchased items:', purchasedItems);
      purchasedItems.forEach((item) => {
        removeItem(item.id, item.selectedSize);
      });
    } else {
      console.log('--- CLEAR CART CLIENT: Clearing entire cart ---');
      clearCart();
    }
  }, [clearCart, removeItem, purchasedItems]);

  return null;
}
