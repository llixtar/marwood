import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WishlistItem = {
  id: string; // ЗМІНЕНО на string для підтримки UUID
  title: string;
  price: number;
  discount_price?: number | null;
  images?: string[];
  color?: string;
  sizes?: string[];
  slug?: string;
  sku?: string;
  description?: string;
};

type WishlistStore = {
  items: WishlistItem[];
  isOpen: boolean;

  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlist: () => void;

  addItem: (product: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (product: WishlistItem) => void;
  clearWishlist: () => void;
  setItems: (items: WishlistItem[]) => void;

  isInWishlist: (id: string) => boolean;
  totalItems: () => number;
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),
      toggleWishlist: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product) => {
        set((state) => {
          if (state.items.find((i) => i.id === product.id)) return state;
          return { items: [...state.items, product] };
        });
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },

      toggleItem: (product) => {
        const { items } = get();
        if (items.find((i) => i.id === product.id)) {
          set((state) => ({ items: state.items.filter((i) => i.id !== product.id) }));
        } else {
          set((state) => ({ items: [...state.items, product] }));
        }
      },

      clearWishlist: () => set({ items: [] }),

      setItems: (items) => set({ items }),

      isInWishlist: (id) => get().items.some((i) => i.id === id),

      totalItems: () => get().items.length,
    }),
    {
      name: 'marwood-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
