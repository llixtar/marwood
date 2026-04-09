'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { syncCustomerData } from '@/app/actions/customers';

export function SyncManager() {
  const { user, profile } = useAuthStore();
  const { items: cartItems, setItems: setCartItems, clearCart } = useCartStore();
  const { items: wishlistItems, setItems: setWishlistItems, clearWishlist } = useWishlistStore();
  
  const isInitialSync = useRef(true);
  const lastSyncUser = useRef<string | null>(null);

  // 1. СИНХРОНІЗАЦІЯ ПРИ ВХОДІ (MERGE АБО LOAD)
  useEffect(() => {
    if (user && profile && lastSyncUser.current !== user.id) {
      console.log('🔄 Синхронізація акаунта...', user.email);
      
      const dbCart = Array.isArray(profile.cart_data) ? profile.cart_data : [];
      const dbWishlist = Array.isArray(profile.wishlist_data) ? profile.wishlist_data : [];

      // Якщо перемикаємось з іншого Юзера на нового — очищуємо локальне
      const isUserSwitch = lastSyncUser.current !== null && lastSyncUser.current !== user.id;
      
      let finalCart = [...dbCart];
      let finalWishlist = [...dbWishlist];

      if (!isUserSwitch) {
        // Це перехід Гість -> Юзер: робимо злиття
        cartItems.forEach(localItem => {
          const existing = finalCart.find(i => 
            i.id === localItem.id && i.selectedSize === localItem.selectedSize
          );
          if (existing) {
            existing.quantity = Math.max(existing.quantity, localItem.quantity);
          } else {
            finalCart.push(localItem);
          }
        });

        wishlistItems.forEach(localItem => {
          if (!finalWishlist.find(i => i.id === localItem.id)) {
            finalWishlist.push(localItem);
          }
        });
      }

      // ОНОВЛЮЄМО СХОВИЩА ТА БД
      setCartItems(finalCart);
      setWishlistItems(finalWishlist);
      
      if (!isUserSwitch && (cartItems.length > 0 || wishlistItems.length > 0)) {
        // Якщо було злиття — відразу пушим в БД
        syncCustomerData(user.id, 'cart', finalCart);
        syncCustomerData(user.id, 'wishlist', finalWishlist);
      }
      
      lastSyncUser.current = user.id;
      // Даємо невелику затримку, щоб useEffect-и "PUSH" не спрацювали раніше часу
      setTimeout(() => {
        isInitialSync.current = false;
      }, 500);
    }

    if (!user) {
      lastSyncUser.current = null;
      isInitialSync.current = true;
    }
  }, [user, profile]); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. СИНХРОНІЗАЦІЯ ПРИ ЗМІНАХ (PUSH)
  useEffect(() => {
    // Пропускаємо перший рендер та період ініціалізації акаунта
    if (!user || isInitialSync.current) return;

    const timer = setTimeout(() => {
      syncCustomerData(user.id, 'cart', cartItems);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cartItems, user]);

  useEffect(() => {
    if (!user || isInitialSync.current) return;

    const timer = setTimeout(() => {
      syncCustomerData(user.id, 'wishlist', wishlistItems);
    }, 1000);

    return () => clearTimeout(timer);
  }, [wishlistItems, user]);

  return null;
}
