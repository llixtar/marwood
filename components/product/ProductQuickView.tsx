'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import Image from 'next/image';
import { ShoppingCart, Heart, ShieldCheck, Ruler, Truck, ChevronLeft, ChevronRight, Maximize2, X, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useCartStore } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useAuthStore } from '@/lib/store/authStore';

type ProductQuickViewProps = {
  product: any;
  isOpen: boolean;
  onClose: () => void;
};

export function ProductQuickView({ product: initialProduct, isOpen, onClose }: ProductQuickViewProps) {
  const router = useRouter();
  const [currentProduct, setCurrentProduct] = useState<any>(initialProduct);
  const [variants, setVariants] = useState<any[]>([]);

  const product = currentProduct || initialProduct;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showToast, setShowToast] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const touchStartX = useRef<number | null>(null);

  // Скидаємо стейти при відкритті нового товару або зміні props
  useEffect(() => {
    if (isOpen && initialProduct) {
      setCurrentProduct(initialProduct);
      setCurrentImageIndex(0);
      setSelectedSize(initialProduct.selectedSize || '');
      setShowToast('');
      setIsLightboxOpen(false);
      
      // Завантажуємо повні дані про товар
      const fetchFullProduct = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', initialProduct.id)
            .single();
          
          if (data && !error) {
            setCurrentProduct(data);
          }
        } catch (err) {
          console.error('Error fetching full product:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchFullProduct();
    }
  }, [isOpen, initialProduct?.id]);

  // Завантаження варіантів (товарів з таким же артикулом)
  useEffect(() => {
    if (isOpen && product?.sku) {
      const fetchVariants = async () => {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('sku', product.sku);

        if (data && data.length > 0) {
          // Сортуємо по ID щоб порядок був однаковим
          const sortedData = data.sort((a, b) => a.id - b.id);
          setVariants(sortedData);
        }
      };
      fetchVariants();
    }
  }, [isOpen, product?.sku]);

  const { addItem, openCart, items } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { user } = useAuthStore();

  if (!product) return null;

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setShowToast('Будь ласка, оберіть розмір!');
      setTimeout(() => setShowToast(''), 3000);
      return;
    }
    
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      discount_price: product.discount_price,
      image: product.images?.[0],
      selectedSize: selectedSize || undefined,
      sku: product.sku,
    });

    setShowToast('Товар додано до кошика! 🛍️');
    setTimeout(() => {
      setShowToast('');
      onClose();
      openCart();
    }, 800);
  };
  
  const handleGoToCheckout = () => {
    // Якщо товару ще немає в кошику — додаємо
    if (!isInCart) {
      if (product.sizes?.length > 0 && !selectedSize) {
        setShowToast('Будь ласка, оберіть розмір!');
        setTimeout(() => setShowToast(''), 3000);
        return;
      }
      
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        discount_price: product.discount_price,
        image: product.images?.[0],
        selectedSize: selectedSize || undefined,
        sku: product.sku,
      });
    }

    onClose();
    const sizeParam = selectedSize ? `&size=${encodeURIComponent(selectedSize)}` : '';
    router.push(`/checkout?buyNow=true&id=${product.id}${sizeParam}`);
  };

  const isInCart = mounted && items.some(i => 
    i.id === product.id && 
    (selectedSize ? i.selectedSize === selectedSize : !i.selectedSize)
  );

  const handleToggleWishlist = () => {
    if (!user) {
      (window as any).dispatchOpenAuth?.();
      return;
    }

    toggleItem({
      id: product.id,
      title: product.title,
      price: product.price,
      discount_price: product.discount_price,
      images: product.images,
      color: product.color,
      sizes: product.sizes,
      sku: product.sku,
      description: product.description,
    });
    const msg = isInWishlist(product.id)
      ? 'Додано до вибраного! ❤️'
      : 'Видалено з вибраного';
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 2000);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Спеціальний ширший Sheet для картки товару, особливо на екранах планшетів/ПК */}
      <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-md md:max-w-xl p-0 flex flex-col border-none shadow-2xl bg-white overflow-hidden">
        
        {/* Кастомна кнопка закриття з високим z-index для мобільних */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[100] bg-white/80 backdrop-blur-sm p-2 text-bottle hover:bg-white hover:text-red-500 transition-colors rounded-full shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Заголовок для Accessibility (прихований візуально) */}
        <SheetHeader className="sr-only">
          <SheetTitle>{product.title}</SheetTitle>
          <SheetDescription>Опис товару та додавання в кошик</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-thin">
          
          {/* Слайдер Фотографій */}
          <div className="relative w-full aspect-[3/4] bg-bottle/5 select-none overflow-hidden group">
            {product.images && product.images.length > 0 ? (
              <>
                <Image 
                  src={product.images[currentImageIndex]} 
                  alt={product.title} 
                  fill 
                  className="object-cover cursor-zoom-in"
                  priority
                  onClick={() => setIsLightboxOpen(true)}
                />
                
                {/* Навігація по фотострілками */}
                {product.images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 text-bottle hover:bg-white transition-colors z-20 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 text-bottle hover:bg-white transition-colors z-20 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 z-20">
                      {product.images.map((_: any, idx: number) => (
                         <div 
                           key={idx} 
                           onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                           className={`h-1 cursor-pointer transition-all ${idx === currentImageIndex ? 'w-6 bg-white shadow-sm' : 'w-2 bg-white/50 hover:bg-white/80'}`} 
                         />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-bottle/20 uppercase tracking-widest text-xs">Немає фото</div>
            )}

            {/* Лейбли (Знижка / Новинка) */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
              {product.is_new && (
                <span className="bg-bottle text-milky px-3 py-1 text-[10px] uppercase tracking-widest font-bold shadow-sm w-fit">
                  В тренді
                </span>
              )}
              {product.discount_price && (
                <span className="bg-red-600 text-white px-3 py-1 text-[10px] uppercase tracking-widest font-bold shadow-sm w-fit">
                  Сезонний Sale
                </span>
              )}
            </div>
          </div>

          {/* Інформація про товар */}
          <div className={`p-6 md:p-8 flex flex-col gap-6 relative transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
                <div className="w-8 h-8 border-2 border-bottle/20 border-t-bottle rounded-full animate-spin" />
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-bottle/40 uppercase tracking-widest font-mono">
                {product.sku ? `SKU: ${product.sku}` : 'Marwood Collection'}
              </span>
              <h2 className="text-2xl font-light text-bottle uppercase tracking-widest leading-tight">
                {product.title}
              </h2>
              
              <div className="flex items-end gap-3 mt-1">
                {product.discount_price ? (
                  <>
                    <span className="text-2xl font-bold text-red-600">{product.discount_price} ₴</span>
                    <span className="text-base text-bottle/40 line-through pb-0.5">{product.price} ₴</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-bottle">{product.price} ₴</span>
                )}
              </div>
            </div>

            <hr className="border-bottle/10" />

            {/* Деталі */}
            {product.color && (
               <div className="flex flex-col gap-2">
                 <span className="text-[10px] uppercase tracking-widest font-bold text-bottle/70">Колір: {product.color}</span>
               </div>
            )}

            {/* Варіанти кольорів (якщо є інші товари з цим SKU) */}
            {variants.length > 1 && (
               <div className="flex flex-col gap-3 mt-1">
                 <div className="flex flex-wrap gap-2">
                   {variants.map((variant) => (
                     <button
                       key={variant.id}
                       onClick={() => {
                         setCurrentProduct(variant);
                         setCurrentImageIndex(0);
                         setSelectedSize('');
                       }}
                       title={variant.color || variant.title}
                       className={`relative w-12 h-16 overflow-hidden border-2 transition-all ${
                         product.id === variant.id 
                           ? 'border-bottle opacity-100 shadow-md scale-105' 
                           : 'border-transparent opacity-60 hover:opacity-100 hover:border-bottle/30'
                       }`}
                     >
                       {variant.images && variant.images.length > 0 ? (
                         <Image 
                           src={variant.images[0]} 
                           alt={variant.color || variant.title}
                           fill
                           className="object-cover"
                         />
                       ) : (
                         <div className="w-full h-full bg-bottle/10" />
                       )}
                     </button>
                   ))}
                 </div>
               </div>
            )}

            {/* Розміри */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-bottle/70">Розмір:</span>
                  <button className="flex items-center gap-1 text-[10px] text-bottle/50 hover:text-bottle transition-colors uppercase tracking-widest">
                    <Ruler className="w-3 h-3" /> Таблиця розмірів
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s: string) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-fit px-4 py-2 text-sm transition-all border ${selectedSize === s ? 'bg-bottle text-white border-bottle' : 'bg-transparent text-bottle hover:border-bottle/40 border-bottle/10'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Опис */}
            {product.description && (
              <div className="flex flex-col gap-2 mt-2">
                 <span className="text-[10px] uppercase tracking-widest font-bold text-bottle/70">Про виріб:</span>
                 <p className="text-sm font-light text-bottle/80 leading-relaxed whitespace-pre-line">
                   {product.description}
                 </p>
              </div>
            )}

            {/* Інформативні бейджі (доставка, повернення) */}
            <div className="mt-4 flex flex-col gap-3 p-4 bg-[#F9F9F9] border border-black/5 text-xs text-bottle/70">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-bottle opacity-60" />
                <p><strong>Безкоштовна доставка</strong> Новою Поштою від 2000 ₴</p>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-bottle opacity-60" />
                <p>Гарантія якості та конфіденційне пакування</p>
              </div>
            </div>

          </div>
        </div>

        {/* Фіксований Футер з кнопками */}
        <div className="border-t border-bottle/10 p-4 bg-white flex gap-3 z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <button 
            onClick={handleToggleWishlist}
            className={`w-14 h-14 flex items-center justify-center border transition-colors flex-shrink-0 ${
              mounted && isInWishlist(product.id)
                ? 'border-red-300 bg-red-50 text-red-500 hover:bg-red-100'
                : 'border-bottle/20 text-bottle hover:bg-red-50 hover:text-red-500 hover:border-red-200'
            }`}
            title={mounted && isInWishlist(product.id) ? 'Видалити з вибраного' : 'Додати до вибраного'}
          >
            <Heart className={`w-5 h-5 transition-all ${mounted && isInWishlist(product.id) ? 'fill-red-500' : ''}`} />
          </button>

          {isInCart ? (
            <button 
              onClick={handleGoToCheckout}
              className="flex-1 bg-bottle text-milky hover:bg-bottle/90 uppercase tracking-[0.2em] text-xs font-bold transition-colors flex items-center justify-center gap-3 px-6 shadow-lg shadow-bottle/20"
            >
              Оформити замовлення <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-bottle text-milky hover:bg-bottle/90 uppercase tracking-[0.2em] text-xs font-bold transition-colors flex items-center justify-center gap-3 px-6"
            >
              <ShoppingCart className="w-4 h-4 ml-1" /> Додати до кошика
            </button>
          )}
        </div>

        {/* Спливаюче Toast (Дуже кастомне і просте) */}
        {showToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-bottle text-white text-xs px-6 py-3 rounded-full shadow-2xl z-50 animate-in slide-in-from-top fade-in flex items-center gap-2 whitespace-nowrap border border-white/20 font-medium">
            {showToast}
          </div>
        )}

        {/* --- LIGHTBOX (Повний екран) --- */}
        {isLightboxOpen && product.images.length > 0 && (
          <div 
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col animate-in fade-in"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const touchEndX = e.changedTouches[0].clientX;
              const diff = touchStartX.current - touchEndX;
              
              if (diff > 50) {
                setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1);
              } else if (diff < -50) {
                setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1);
              }
              touchStartX.current = null;
            }}
          >
            <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-[210] bg-gradient-to-b from-black/80 to-transparent">
              <span className="text-white/70 text-xs uppercase tracking-widest font-mono">
                {currentImageIndex + 1} / {product.images.length}
              </span>
              <button onClick={() => setIsLightboxOpen(false)} className="text-white hover:text-white/70 transition-colors p-2">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="flex-1 relative flex items-center justify-center">
              <Image 
                src={product.images[currentImageIndex]} 
                alt={product.title} 
                fill 
                className="object-contain"
                priority
              />
            </div>

            {product.images.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                  className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4 z-[210] bg-black/20 hover:bg-black/50"
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button 
                  onClick={() => setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                  className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4 z-[210] bg-black/20 hover:bg-black/50"
                >
                  <ChevronRight className="w-10 h-10" />
                </button>
              </>
            )}
          </div>
        )}

      </SheetContent>
    </Sheet>
  );
}
