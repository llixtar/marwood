'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { Button } from '@/components/ui/button';
import { CartDrawer } from '@/components/cart/CartDrawer';

export function CartButton() {
  const [mounted, setMounted] = useState(false);
  const { openCart, totalItems } = useCartStore();
  const count = totalItems();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={openCart}
        className="relative text-bottle hover:bg-bottle/5"
        aria-label="Відкрити кошик"
      >
        <ShoppingCart className="h-5 w-5" />
        {mounted && count > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-bottle text-milky text-[9px] flex items-center justify-center font-bold transition-all">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Button>
      <CartDrawer />
    </>
  );
}
