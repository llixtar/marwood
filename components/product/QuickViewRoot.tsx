'use client';

import { useQuickViewStore } from '@/lib/store/quickViewStore';
import { ProductQuickView } from './ProductQuickView';

export function QuickViewRoot() {
  const { selectedProduct, isOpen, closeQuickView } = useQuickViewStore();

  if (!isOpen && !selectedProduct) return null;

  return (
    <ProductQuickView 
      product={selectedProduct} 
      isOpen={isOpen} 
      onClose={closeQuickView} 
    />
  );
}
