import { create } from 'zustand';

type QuickViewStore = {
  selectedProduct: any | null;
  isOpen: boolean;
  openQuickView: (product: any) => void;
  closeQuickView: () => void;
};

export const useQuickViewStore = create<QuickViewStore>((set) => ({
  selectedProduct: null,
  isOpen: false,
  openQuickView: (product) => set({ selectedProduct: product, isOpen: true }),
  closeQuickView: () => set({ selectedProduct: null, isOpen: false }),
}));
