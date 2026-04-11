'use client';

import { useState, useEffect, useTransition } from 'react';
import { updateStockAction, saveProductStockAction } from '@/app/actions/inventory';
import { Loader2, Plus, AlertCircle, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

type Product = {
  id: string;
  title: string;
  sku: string;
  color: string;
  stock_by_size: Record<string, number> | null;
  sizes: string[];
};

export function InventoryMatrix({ products }: { products: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localStock, setLocalStock] = useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {};
    products.forEach(p => {
      initial[p.id] = { ...(p.stock_by_size as any || {}) };
    });
    return initial;
  });

  // Синхронізуємо локальний стан, якщо пропси змінилися зверху (після revalidatePath)
  useEffect(() => {
    const nextState: Record<string, Record<string, number>> = {};
    products.forEach(p => {
      nextState[p.id] = { ...(p.stock_by_size as any || {}) };
    });
    setLocalStock(nextState);
  }, [products]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, string | null>>({}); // rowId-size

  const handleStockChange = (productId: string, size: string, value: string) => {
    const num = parseInt(value, 10);
    setLocalStock(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: isNaN(num) ? 0 : num
      }
    }));
  };

  const isRowDirty = (product: Product) => {
    const current = localStock[product.id];
    const original = (product.stock_by_size as any) || {};
    
    return ALL_SIZES.some(size => {
        const cVal = current?.[size] || 0;
        const oVal = original?.[size] || 0;
        return cVal !== oVal;
    });
  };

  const handleSaveRow = async (product: Product) => {
    if (!isRowDirty(product)) return;
    
    const stock = localStock[product.id];
    setSaving(prev => ({ ...prev, [product.id]: 'saving' }));
    
    try {
      const result = await saveProductStockAction({
          productId: product.id,
          sku: product.sku,
          color: product.color,
          stock: stock
      });

      if (result.success) {
        startTransition(() => {
          router.refresh();
        });
        toast.success(`Збережено: ${product.sku} (${product.color})`, {
          description: `Дані успішно оновлені в базі`,
          duration: 2000
        });
      }
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error('Помилка збереження', {
        description: err.message || 'Спробуйте ще раз'
      });
    } finally {
      setSaving(prev => ({ ...prev, [product.id]: null }));
    }
  };

  const handleAddStock = async (product: Product, size: string) => {
      const current = localStock[product.id][size] || 0;
      const add = prompt(`Скільки одиниць приїхало для ${product.sku} (${product.color}) розмір ${size}?`, '0');
      if (add === null) return;
      
      const addNum = parseInt(add, 10);
      if (isNaN(addNum) || addNum === 0) return;

      const saveKey = `${product.id}-${size}`;
      setSaving(prev => ({ ...prev, [saveKey]: 'saving' }));
      try {
          const newTotal = current + addNum;
          await updateStockAction({
              productId: product.id,
              sku: product.sku,
              color: product.color,
              size,
              newStock: newTotal,
              reason: 'supply'
          });
          
          setLocalStock(prev => ({
              ...prev,
              [product.id]: { ...prev[product.id], [size]: newTotal }
          }));
          startTransition(() => {
            router.refresh();
          });
          toast.success(`Поставка: +${addNum} (Разом: ${newTotal})`);
      } catch (err) {
          toast.error('Помилка');
      } finally {
          setSaving(prev => ({ ...prev, [saveKey]: null }));
      }
  };

  const toggleExpand = (id: string) => {
      setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      
      {/* Десктоп версія: Таблиця (прихована на мобільних) */}
      <div className="hidden md:block bg-white border border-bottle/10 shadow-sm overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#FAFAFA] border-b border-bottle/10">
            <tr>
              <th className="px-4 py-4 font-bold uppercase tracking-widest text-[10px] w-[180px] border-r border-bottle/5 whitespace-nowrap">SKU / Колір</th>
              <th className="px-4 py-4 font-bold uppercase tracking-widest text-[10px]">Розміри (Залишок)</th>
              <th className="px-4 py-4 font-bold uppercase tracking-widest text-[10px] w-[60px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bottle/5">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-4 py-4 border-r border-bottle/5 bg-white group-hover:bg-[#fcfcfa] align-top">
                  <div className="flex flex-col">
                     <span className="text-[12px] font-bold text-bottle tracking-wider mb-0.5 truncate">{p.sku}</span>
                     <span className="px-1.5 py-0.5 bg-bottle/5 text-bottle text-[9px] font-bold uppercase w-fit">{p.color}</span>
                     <button 
                        onClick={() => toggleExpand(p.id)}
                        className="mt-3 text-[9px] uppercase tracking-widest font-bold text-bottle/40 hover:text-bottle transition-colors flex items-center gap-1"
                     >
                        {expanded[p.id] ? <><ChevronUp className="w-3 h-3"/> Сховати</> : <><ChevronDown className="w-3 h-3"/> Всі розміри</>}
                     </button>
                  </div>
                </td>
                <td className="px-4 py-4">
                   <div className="flex flex-wrap gap-4">
                      {ALL_SIZES.map(size => {
                          const isEnabled = p.sizes.includes(size);
                          const isExpanded = expanded[p.id];
                          const val = localStock[p.id]?.[size] ?? (p.stock_by_size as any)?.[size] ?? 0;
                          const isSaving = saving[`${p.id}-${size}`];

                          if (!isEnabled && !isExpanded) return null;

                          return (
                            <div key={size} className="flex flex-col items-center gap-1">
                               <div className="flex justify-between w-full mb-0.5 px-1">
                                  <span className={`text-[9px] font-bold ${isEnabled ? 'text-bottle' : 'text-bottle/30'}`}>{size}</span>
                                  {isSaving && <Loader2 className="w-2 h-2 animate-spin text-bottle/40" />}
                               </div>
                               <div className="relative group/cell">
                                  <input 
                                    type="number"
                                    value={val}
                                    onChange={(e) => handleStockChange(p.id, size, e.target.value)}
                                    className={`w-14 h-8 text-center text-xs border transition-all focus:outline-none focus:ring-1 focus:ring-bottle ${
                                      !isEnabled ? 'opacity-40 border-dashed border-bottle/20' : 
                                      val === 0 ? 'border-red-200 bg-red-50 text-red-600' : 'border-bottle/10 hover:border-bottle/30'
                                    }`}
                                  />
                                  <button 
                                    onClick={() => handleAddStock(p, size)}
                                    className="absolute -top-1 -right-1 bg-white border border-bottle shadow-sm rounded-full p-0.5 text-bottle opacity-0 group-hover/cell:opacity-100 transition-opacity translate-x-1 -translate-y-1 hover:scale-110 active:scale-95 z-10"
                                    title="Додати поставку"
                                  >
                                     <Plus className="w-2.5 h-2.5" />
                                  </button>
                               </div>
                            </div>
                          );
                      })}
                   </div>
                </td>
                <td className="px-4 py-4 text-right">
                   <button 
                     onClick={() => handleSaveRow(p)}
                     disabled={saving[p.id] === 'saving' || !isRowDirty(p)}
                     className={`p-2.5 transition-all flex items-center justify-center ml-auto shadow-sm ${
                        saving[p.id] === 'saving' || !isRowDirty(p)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-bottle text-milky hover:bg-bottle/90 active:scale-95'
                     }`}
                     title={isRowDirty(p) ? "Зберегти всі зміни" : "Змін немає"}
                   >
                     {saving[p.id] === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Мобільна версія: Картки (прихована на десктопах) */}
      <div className="md:hidden space-y-3">
        {products.map(p => (
           <div key={p.id} className="bg-white border border-bottle/10 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-4 border-b border-bottle/5 pb-2">
                 <div>
                    <div className="text-sm font-bold text-bottle tracking-wide">{p.sku}</div>
                    <div className="text-[10px] text-bottle/60 uppercase font-medium">{p.color}</div>
                 </div>
                 <div className="flex items-center gap-2">
                    <button 
                       onClick={() => toggleExpand(p.id)}
                       className="flex items-center gap-1 px-3 py-1.5 bg-bottle/5 text-bottle text-[9px] font-bold uppercase tracking-widest hover:bg-bottle/10 transition-all rounded-sm"
                    >
                       {expanded[p.id] ? 'Сховати' : '+ Всі розміри'}
                    </button>
                    <button 
                      onClick={() => handleSaveRow(p)}
                      disabled={saving[p.id] === 'saving' || !isRowDirty(p)}
                      className={`p-1.5 rounded-sm transition-all shadow-sm ${
                        saving[p.id] === 'saving' || !isRowDirty(p)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-bottle text-milky hover:bg-bottle/90 active:scale-95'
                      }`}
                      title={isRowDirty(p) ? "Зберегти зміни" : "Змін немає"}
                    >
                      {saving[p.id] === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                  {ALL_SIZES.map(size => {
                      const isEnabled = p.sizes.includes(size);
                      const isExpanded = expanded[p.id];
                      const val = localStock[p.id]?.[size] ?? (p.stock_by_size as any)?.[size] ?? 0;
                      const isSaving = saving[`${p.id}-${size}`];

                      if (!isEnabled && !isExpanded) return null;

                      return (
                        <div key={size} className="flex flex-col items-center gap-1">
                           <div className="flex justify-between w-full px-1">
                              <span className={`text-[8px] font-bold uppercase font-mono ${isEnabled ? 'text-bottle' : 'text-bottle/30'}`}>{size}</span>
                              {isSaving && <Loader2 className="w-2 h-2 animate-spin text-bottle/40" />}
                           </div>
                           <div className="relative w-full">
                              <input 
                                type="number"
                                inputMode="numeric"
                                value={val}
                                onChange={(e) => handleStockChange(p.id, size, e.target.value)}
                                className={`w-full h-9 text-center text-xs border transition-all focus:outline-none focus:ring-1 focus:ring-bottle bg-gray-50/50 ${
                                  !isEnabled ? 'opacity-30 border-dashed border-bottle/15' : 
                                  val === 0 ? 'border-red-100 bg-red-50 text-red-500' : 'border-bottle/10'
                                }`}
                              />
                              {isEnabled && (
                                  <button 
                                    onClick={() => handleAddStock(p, size)}
                                    className="absolute -top-1.5 -right-1.5 bg-bottle text-white rounded-full p-1 shadow-md active:scale-95 z-10"
                                  >
                                    <Plus className="w-2 h-2" />
                                  </button>
                              )}
                           </div>
                        </div>
                      );
                  })}
              </div>
           </div>
        ))}
      </div>
    </div>
  );
}
