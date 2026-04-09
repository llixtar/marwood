'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { WishlistDrawer } from '@/components/wishlist/WishlistDrawer';

export function WishlistButton() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const { openWishlist, totalItems } = useWishlistStore();
  const count = totalItems();
  
  const handleOpenWishlist = () => {
    if (!user) {
      (window as any).dispatchOpenAuth?.();
      return;
    }
    openWishlist();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpenWishlist}
        className="relative text-bottle hover:bg-bottle/5"
        aria-label="Відкрити вибране"
      >
        <Heart className="h-5 w-5" />
        {mounted && user && count > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-bottle text-milky text-[9px] flex items-center justify-center font-bold transition-all">
            {count}
          </span>
        )}
      </Button>
      <WishlistDrawer />
    </>
  );
}
