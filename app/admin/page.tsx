import { supabaseAdmin } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { PackageOpen, Trash2 } from 'lucide-react';
import { deleteProductAction } from '@/app/actions/products';
import { ProductSearch } from '@/components/admin/ProductSearch';

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ category?: string; page?: string; q?: string }> }) {
  const { category, page: pageParam, q } = await searchParams;
  
  const ITEM_PER_PAGE = 16;
  const page = parseInt(pageParam || '1', 10);

  // Категорії для фільтру
  const categories = [
    { slug: 'all', name: 'Всі товари' },
    { slug: 'panties', name: 'Труси' },
    { slug: 'basic', name: 'Базова білизна' },
    { slug: 'erotic', name: 'Еротична білизна' },
    { slug: 'costumes', name: 'Еротичні костюми' },
    { slug: 'robes', name: 'Халати' },
    { slug: 'pajamas', name: 'Піжами' },
    { slug: 'body', name: 'Боді' },
    { slug: 'plus-size', name: 'Плюс сайз (всі)' },
    { slug: 'plus-size-swimwear', name: 'Купальники (Plus Size)' },
    { slug: 'swimwear', name: 'Купальники' }
  ];

  // Будуємо запит
  let query = supabaseAdmin
    .from('products')
    .select('*', { count: 'exact' });

  if (category && category !== 'all') {
    query = query.eq('category_slug', category);
  }

  if (q) {
    query = query.ilike('sku', `%${q}%`);
  }

  // Обчислення пагінації (range)
  const from = (page - 1) * ITEM_PER_PAGE;
  const to = from + ITEM_PER_PAGE - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data: products, count, error } = await query;
  const totalPages = count ? Math.ceil(count / ITEM_PER_PAGE) : 0;

  if (error) {
    return (
      <div className="p-8 text-red-600 bg-red-50 border border-red-200 rounded-md">
        Помилка підключення до БД: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      
      {/* Шапка */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-light text-bottle uppercase tracking-widest mb-1">Товари в наявності</h1>
          <p className="text-sm text-bottle/60 uppercase tracking-widest font-medium">Всього в базі: {count || 0}</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <ProductSearch />
          <Link 
            href="/admin/products/new" 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-bottle text-milky hover:bg-bottle/90 uppercase text-xs tracking-widest shadow-md transition-all self-stretch md:self-auto"
          >
            <PackageOpen className="w-4 h-4" />
            Додати новий
          </Link>
        </div>
      </div>

      {/* Фільтрація по категоріям */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-thin">
        {categories.map(c => {
          const isActive = category === c.slug || (!category && c.slug === 'all');
          return (
            <Link 
              key={c.slug} 
              href={`/admin?category=${c.slug}&page=1${q ? `&q=${q}` : ''}`}
              className={`px-4 py-2 border text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors flex-shrink-0 ${
                isActive 
                  ? 'bg-bottle text-white border-bottle' 
                  : 'bg-white text-bottle border-black/10 hover:border-bottle/40 hover:bg-gray-50'
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>

      {/* Сітка товарів */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
        {products?.map((product) => (
          <div key={product.id} className="group bg-white border border-black/5 rounded-none shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden relative">
            
            <Link href={`/admin/products/${product.id}?q=${q || ''}&category=${category || 'all'}`} className="absolute inset-x-0 top-0 bottom-[60px] z-10" />

            {/* Фото */}
            <div className="relative w-full aspect-[3/4] bg-[#f8f8f8] overflow-hidden border-b border-black/5 flex-shrink-0">
              {product.images && product.images.length > 0 ? (
                <Image 
                  src={product.images[0]} 
                  alt={product.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-bottle/30 uppercase text-xs tracking-widest flex-col gap-2">
                  <PackageOpen className="w-8 h-8 opacity-50" />
                  Без фото
                </div>
              )}
              
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                <span className="bg-white/90 backdrop-blur-sm text-bottle px-2 py-1 text-[9px] uppercase tracking-widest font-bold shadow-sm">
                  {product.category_slug}
                </span>
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
              
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 text-[10px] rounded-sm backdrop-blur-md">
                  1 / {product.images.length}
                </div>
              )}
            </div>

            {/* Інфо */}
            <div className="p-2 md:p-3 flex flex-col flex-1 gap-1">
              <div className="flex justify-between items-start gap-1">
                <h3 className="text-xs font-bold text-bottle tracking-wider line-clamp-2 leading-tight">
                  {product.title}
                </h3>
              </div>
              
              <div className="flex flex-col gap-1 mt-1">
                {product.sku && <span className="text-[10px] text-bottle/50 font-mono">SKU: {product.sku}</span>}
                <div className="flex items-baseline gap-2 mt-1">
                  {product.discount_price ? (
                    <>
                      <span className="text-red-600 font-bold text-lg">{product.discount_price} ₴</span>
                      <span className="text-bottle/40 line-through text-xs">{product.price} ₴</span>
                    </>
                  ) : (
                    <span className="text-bottle font-bold text-lg">{product.price} ₴</span>
                  )}
                </div>
              </div>
              
              <div className="mt-auto flex justify-between items-center pt-2 border-t border-black/5 relative z-20">
                <div className="flex gap-1 text-[10px] text-bottle/50 font-medium">
                  {product.sizes && product.sizes.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-bottle/5">{product.sizes.length} розм.</span>
                  )}
                </div>

                <form action={async () => {
                  'use server';
                  await deleteProductAction(product.id, product.images);
                }}>
                  <button 
                    type="submit" 
                    className="flex items-center gap-1 text-red-500/70 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                    title="Видалити"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
            
          </div>
        ))}

        {/* Пустий стан */}
        {(!products || products.length === 0) && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white border border-dashed border-bottle/20">
            <PackageOpen className="w-12 h-12 text-bottle/20 mb-4" />
            <h3 className="text-xl font-light text-bottle uppercase tracking-widest mb-2">Каталог порожній</h3>
            <p className="text-gray-500 text-sm max-w-sm mb-6">
              У цій категорії ще немає товарів.
            </p>
          </div>
        )}
      </div>

      {/* Пагінація */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          {page > 1 ? (
            <Link 
              href={`/admin?category=${category || 'all'}&page=${page - 1}${q ? `&q=${q}` : ''}`} 
              className="px-4 py-2 border border-black/10 hover:bg-gray-50 text-[10px] uppercase tracking-widest transition-colors"
            >
              ← Попередня
            </Link>
          ) : (
            <div className="px-4 py-2 border border-transparent text-black/20 text-[10px] uppercase tracking-widest cursor-not-allowed">
              ← Попередня
            </div>
          )}
          
          <span className="text-[10px] uppercase tracking-widest text-bottle/60 font-bold">
            Сторінка {page} з {totalPages}
          </span>

          {page < totalPages ? (
            <Link 
              href={`/admin?category=${category || 'all'}&page=${page + 1}${q ? `&q=${q}` : ''}`} 
              className="px-4 py-2 border border-black/10 hover:bg-gray-50 text-[10px] uppercase tracking-widest transition-colors"
            >
              Наступна →
            </Link>
          ) : (
            <div className="px-4 py-2 border border-transparent text-black/20 text-[10px] uppercase tracking-widest cursor-not-allowed">
              Наступна →
            </div>
          )}
        </div>
      )}

    </div>
  );
}
