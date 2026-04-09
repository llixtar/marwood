import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: number;
  title: string;
  price: number;
  discount_price?: number | null;
  image?: string;
  selectedSize?: string;
  quantity: number;
  sku?: string;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number, selectedSize?: string) => void;
  updateQty: (id: number, selectedSize: string | undefined, delta: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;

  totalItems: () => number;
  totalPrice: () => number;
};

const itemKey = (id: number, size?: string) => `${id}__${size ?? ''}`;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product) => {
        set((state) => {
          const key = itemKey(product.id, product.selectedSize);
          const existing = state.items.find(
            (i) => itemKey(i.id, i.selectedSize) === key
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.id, i.selectedSize) === key
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity: 1 }] };
        });
      },

      removeItem: (id, selectedSize) => {
        const key = itemKey(id, selectedSize);
        set((state) => ({
          items: state.items.filter((i) => itemKey(i.id, i.selectedSize) !== key),
        }));
      },

      updateQty: (id, selectedSize, delta) => {
        const key = itemKey(id, selectedSize);
        set((state) => ({
          items: state.items
            .map((i) =>
              itemKey(i.id, i.selectedSize) === key
                ? { ...i, quantity: Math.max(1, i.quantity + delta) }
                : i
            ),
        }));
      },

      clearCart: () => set({ items: [] }),

      setItems: (items) => set({ items }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + (i.discount_price ?? i.price) * i.quantity,
          0
        ),
    }),
    {
      name: 'marwood-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
