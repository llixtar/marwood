'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductQuickView } from './ProductQuickView';

type ProductGridClientProps = {
  products: any[];
};

export function ProductGridClient({ products }: ProductGridClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  if (!products || products.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 w-full">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="group flex flex-col cursor-pointer"
            onClick={() => setSelectedProduct(product)}
          >
            
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-bottle/5 mb-3">
              {product.images && product.images.length > 0 ? (
                <Image 
                  src={product.images[0]} 
                  alt={product.title} 
                  fill 
                  className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
              ) : null}
              
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                {product.is_new && (
                  <span className="bg-bottle text-milky px-2 py-1 text-[9px] uppercase tracking-widest font-bold shadow-sm w-fit">
                    New
                  </span>
                )}
                {product.discount_price && (
                  <span className="bg-red-600 text-white px-2 py-1 text-[9px] uppercase tracking-widest font-bold shadow-sm w-fit">
                    Sale
                  </span>
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Підказка розмірів при наведенні */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  {product.sizes.map((s: string) => (
                    <span key={s} className="bg-white/90 text-bottle text-[10px] font-bold px-1.5 py-0.5 min-w-[20px] text-center shadow-sm">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center z-10 px-2 text-center">
              <h3 className="text-xs md:text-sm font-light uppercase tracking-widest text-bottle line-clamp-1 mb-1">
                {product.title}
              </h3>
              
              {product.color && (
                <span className="text-[10px] text-bottle/50 mb-2 uppercase tracking-widest">{product.color}</span>
              )}

              <div className="flex items-center gap-2">
                {product.discount_price ? (
                  <>
                    <span className="text-red-600 font-medium text-sm md:text-base">{product.discount_price} ₴</span>
                    <span className="text-bottle/40 line-through text-xs md:text-sm">{product.price} ₴</span>
                  </>
                ) : (
                  <span className="text-bottle font-medium text-sm md:text-base">{product.price} ₴</span>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      <ProductQuickView 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </>
  );
}
