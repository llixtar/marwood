'use client';

import { useTransition, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addProductAction, updateProductAction } from '@/app/actions/products';
import { ImagePlus, Package, Fingerprint, Scissors, Palette, Percent, Copy, Save } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const ukrainianToLatinMap: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'iu', я: 'ia',
  ' ': '-', '_': '-', ',': '', '.': '', '!': '', '?': '', '@': '', '#': '', '$': '', '%': '', '^': '', '&': '', '*': '', '(': '', ')': '', '+': '', '=': '', "'": '', '"': '', '`': '', '~': '', '<': '', '>': '', '/': '', '\\': '', '|': ''
};

function transliterate(str: string): string {
  return str.toLowerCase().split('').map(char => ukrainianToLatinMap[char] ?? (/[a-z0-9-]/.test(char) ? char : '')).join('').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

const AVAILABLE_SIZES = ['A-B', 'C-D', 'FREE', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '70A', '70B', '70C', '75A', '75B', '75C', '80B', '80C', '85B', '85C'];
const AVAILABLE_COLORS = ['Чорний', 'Білий', 'Червоний', 'Бежевий', 'Рожевий', 'Синій', 'Бордовий', 'Різнокольоровий', 'Зелений'];

type ProductFormProps = {
  initialData?: any; // Якщо є ініціал дата - це режим редагування
};

export function ProductForm({ initialData }: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [previewImages, setPreviewImages] = useState<string[]>(initialData?.images || []);
  const [title, setTitle] = useState(initialData?.title || '');
  const [color, setColor] = useState(initialData?.color || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug); // Якщо товар новий - автослаг ввімкнений
  
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialData?.sizes || []);

  useEffect(() => {
    if (!autoSlug) return;
    const baseStr = `${title} ${color}`.trim();
    if (baseStr) setSlug(transliterate(baseStr));
    else setSlug('');
  }, [title, color, autoSlug]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const urls = filesArray.map(f => URL.createObjectURL(f));
      setPreviewImages(urls); // Показуємо нові завантажені
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const executeSubmit = (formData: FormData, isDuplicate: boolean) => {
    formData.set('sizes', selectedSizes.join(', '));
    formData.set('color', color);
    formData.set('slug', slug); 
    
    // Передаємо старі фотографії, щоб сервер не втратив їх, якщо ми не завантажили нові
    if (initialData?.images) {
      formData.set('existing_images', JSON.stringify(initialData.images));
    }

    startTransition(async () => {
      try {
        let result;
        if (initialData && !isDuplicate) {
          result = await updateProductAction(initialData.id, formData);
        } else {
          result = await addProductAction(formData);
        }

        if (result.success) {
          router.push('/admin');
        } else {
          alert('Сталася помилка: ' + result.error);
        }
      } catch (err: any) {
        alert('Сталася непередбачувана помилка: ' + err.message);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <Link href="/admin" className="text-[10px] uppercase tracking-widest text-bottle/50 hover:text-bottle transition-colors mb-2 inline-block">
            ← Назад до списку
          </Link>
          <h1 className="text-2xl font-light text-bottle uppercase tracking-widest flex items-center gap-2">
            <Package className="w-6 h-6 text-bottle/30" /> 
            {initialData ? 'Редагувати товар' : 'Новий товар'}
          </h1>
        </div>
      </div>

      <form ref={formRef} className="bg-white border border-black/5 p-4 md:p-6 shadow-sm flex flex-col gap-6">
        
        {/* Головна секція */}
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          <div className="flex flex-col gap-2">
            <div className="bg-bottle/5 w-full h-[150px] md:aspect-[3/4] md:h-auto flex justify-center items-center relative border border-dashed border-bottle/30 group overflow-hidden">
              <input 
                type="file" 
                name="images" 
                multiple
                accept="image/*" 
                required={!initialData} 
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                title="Завантажити декілька фото"
              />
              
              {previewImages.length > 0 ? (
                <Image src={previewImages[0]} alt="Preview" fill className="object-cover z-10 opacity-50 group-hover:opacity-30 transition-opacity" />
              ) : null}

              <div className="flex flex-col items-center gap-1 text-bottle/40 group-hover:text-bottle/70 transition-colors z-20 pointer-events-none">
                <ImagePlus className="w-8 h-8" />
                <span className="text-[9px] uppercase tracking-widest font-bold mt-1 text-center px-2">Вибрати нові фото</span>
                {previewImages.length > 0 && (
                  <span className="text-bottle font-bold text-xs bg-white/80 px-2 rounded-full mt-2">Фото: {previewImages.length}</span>
                )}
              </div>
            </div>
            {previewImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto mt-2 pb-2 scrollbar-thin">
                {previewImages.slice(1).map((src, i) => (
                  <div key={i} className="relative w-12 h-16 flex-shrink-0 bg-gray-100 border border-black/10">
                    <Image src={src} key={i} alt={`Preview ${i}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70">Назва товару *</label>
                <input 
                  name="title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                  className="w-full border-b border-bottle/20 py-1.5 focus:border-bottle transition-colors text-base font-light outline-none" 
                  placeholder="Мереживне боді Passion" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70">Slug (URL) *</label>
                  <label className="text-[9px] text-bottle/40 cursor-pointer flex items-center gap-1">
                    <input type="checkbox" checked={autoSlug} onChange={(e) => setAutoSlug(e.target.checked)} className="accent-bottle" /> Авто
                  </label>
                </div>
                <div className="flex items-end">
                  <span className="text-bottle/40 text-sm pb-1.5 pr-1 border-b border-bottle/20">/</span>
                  <input 
                    name="slug-disabled" 
                    value={slug}
                    onChange={(e) => {
                      if (!autoSlug) setSlug(transliterate(e.target.value));
                    }}
                    required 
                    readOnly={autoSlug}
                    className="w-full border-b border-bottle/20 py-1.5 focus:border-bottle transition-colors text-sm outline-none placeholder:text-bottle/20" 
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70">Опис товару</label>
              <textarea name="description" defaultValue={initialData?.description} className="w-full border border-bottle/20 p-2 min-h-[80px] flex-1 focus:border-bottle transition-colors text-sm outline-none resize-y" placeholder="Пишіть деталі тут..." />
            </div>
          </div>
        </div>

        <hr className="border-bottle/5" />

        {/* Колір та Розміри */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 flex items-center gap-1"><Palette className="w-3 h-3"/> Колір</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map(c => (
                <div 
                  key={c}
                  onClick={() => setColor(c === color ? '' : c)}
                  className={`px-3 py-1 cursor-pointer text-xs transition-colors border ${color === c ? 'bg-bottle text-white border-bottle' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-bottle/40'}`}
                >
                  {c}
                </div>
              ))}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] text-gray-400">Інший:</span>
              <input value={color && !AVAILABLE_COLORS.includes(color) ? color : ''} onChange={(e) => setColor(e.target.value)} className="border-b border-bottle/20 text-xs py-1 px-1 outline-none focus:border-bottle max-w-[150px]" placeholder="Введіть колір..." />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 flex items-center gap-1"><Scissors className="w-3 h-3"/> Доступні розміри</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map(s => (
                <div 
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={`px-2 py-1 cursor-pointer text-[10px] sm:text-xs font-bold transition-all border ${selectedSizes.includes(s) ? 'bg-bottle text-white border-bottle' : 'bg-white border-gray-200 text-gray-500 hover:border-bottle/40'}`}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className="border-bottle/5" />

        {/* Комерція */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 items-end bg-gray-50 p-4 border border-bottle/5 rounded-sm">
          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 flex items-center gap-1"><Fingerprint className="w-3 h-3"/> Артикул</label>
            <input name="sku" defaultValue={initialData?.sku} className="w-full border-b border-bottle/30 py-1 focus:border-bottle transition-colors text-sm font-medium outline-none bg-transparent" placeholder="MD-1050" />
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-bottle flex items-center gap-1">Ціна (₴) *</label>
            <input type="number" name="price" defaultValue={initialData?.price} required step="0.01" className="w-full border-b border-bottle/30 py-1 focus:border-bottle transition-colors text-base font-medium outline-none bg-transparent" placeholder="1000" />
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-red-600 flex items-center gap-1"><Percent className="w-3 h-3"/> Акція (₴)</label>
            <input type="number" name="discount_price" defaultValue={initialData?.discount_price} step="0.01" className="w-full border-b border-red-200 py-1 focus:border-red-500 transition-colors text-base text-red-600 outline-none bg-transparent" placeholder="850" />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-bottle">Категорія *</label>
            <select name="category_slug" defaultValue={initialData?.category_slug || 'panties'} className="w-full border-b border-bottle/30 py-1 focus:border-bottle transition-colors text-sm outline-none bg-transparent appearance-none cursor-pointer">
              <option value="panties">Труси</option>
              <option value="basic">Базова білизна</option>
              <option value="erotic">Еротична білизна</option>
              <option value="costumes">Еротичні костюми</option>
              <option value="robes">Халати</option>
              <option value="pajamas">Піжами</option>
              <option value="body">Боді</option>
              <option value="plus-size">Плюс сайз</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-bottle flex items-center gap-1">Продажі(Хіт)</label>
            <input type="number" name="sales_count" defaultValue={initialData?.sales_count || 0} className="w-full border-b border-bottle/30 py-1 focus:border-bottle transition-colors text-sm font-medium outline-none bg-transparent" placeholder="0" />
          </div>

          <div className="flex flex-col justify-center gap-2 h-full md:col-span-1 pb-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" name="is_new" defaultChecked={initialData?.is_new} className="w-3 h-3 accent-bottle" /> 
              <span className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 group-hover:text-bottle">Новинка</span>
            </label>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          {initialData ? (
            <>
              <button 
                disabled={isPending} 
                type="button" 
                onClick={() => {
                  const fd = new FormData(formRef.current!);
                  executeSubmit(fd, false);
                }}
                className="bg-bottle text-milky py-4 px-6 flex-1 uppercase tracking-[0.2em] text-xs font-bold hover:bg-bottle/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> {isPending ? 'Збереження...' : 'Зберегти зміни'}
              </button>
              <button 
                disabled={isPending} 
                type="button" 
                onClick={() => {
                  const fd = new FormData(formRef.current!);
                  executeSubmit(fd, true);
                }}
                className="bg-gray-100 text-bottle py-4 px-6 flex-1 uppercase tracking-[0.2em] text-xs font-bold border border-bottle/20 hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" /> Зберегти як нове
              </button>
            </>
          ) : (
            <button 
              disabled={isPending} 
              type="button" 
              onClick={() => {
                const fd = new FormData(formRef.current!);
                executeSubmit(fd, false);
              }}
              className="bg-bottle text-milky py-4 w-full uppercase tracking-[0.2em] text-xs font-bold hover:bg-bottle/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> {isPending ? 'Збереження...' : 'Додати товар до каталогу'}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
