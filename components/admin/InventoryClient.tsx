'use client';

import { useState } from 'react';
import { InventoryMatrix } from './InventoryMatrix';
import { Package, Search, X, LayoutGrid } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CATEGORIES = [
  { slug: 'panties', name: 'Труси' },
  { slug: 'basic', name: 'Базова білизна' },
  { slug: 'erotic', name: 'Еротична білизна' },
  { slug: 'costumes', name: 'Еротичні костюми' },
  { slug: 'robes', name: 'Халати' },
  { slug: 'pajamas', name: 'Піжами' },
  { slug: 'body', name: 'Боді' },
  { slug: 'plus-size', name: 'Плюс сайз' }
];

export function InventoryClient({ initialProducts }: { initialProducts: any[] }) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // 1. Фільтруємо за артикулом
  const filteredBySearch = initialProducts.filter(p => {
    if (!search) return true;
    return p.sku?.toLowerCase().includes(search.toLowerCase());
  });

  // 2. Фільтруємо за категорією (якщо не 'all')
  const finalProducts = activeTab === 'all' 
    ? filteredBySearch 
    : filteredBySearch.filter(p => p.category_slug === activeTab);

  // 3. Групуємо (тільки для режиму 'all')
  const groupedProducts: Record<string, any[]> = {};
  finalProducts.forEach(p => {
    if (!groupedProducts[p.category_slug]) {
      groupedProducts[p.category_slug] = [];
    }
    groupedProducts[p.category_slug].push(p);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top Controls: Search & Tabs */}
      <div className="relative z-30 bg-white pt-4 pb-6 border-b border-bottle/10 -mx-4 px-4 sm:mx-0 sm:px-0 mb-10">
        <div className="flex flex-col gap-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle/30" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Швидкий пошук за артикулом (SKU)..."
              className="w-full bg-white border border-bottle/10 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-bottle/30 transition-all font-mono shadow-sm"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-bottle/5 text-bottle/40 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all flex items-center gap-2 ${
                activeTab === 'all' 
                ? 'bg-bottle text-milky border-bottle shadow-md' 
                : 'bg-white text-bottle border-bottle/10 hover:border-bottle/30'
              }`}
            >
              <LayoutGrid className="w-3 h-3" /> Всі товари
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat.slug}
                onClick={() => setActiveTab(cat.slug)}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all ${
                  activeTab === cat.slug 
                  ? 'bg-bottle text-milky border-bottle shadow-md' 
                  : 'bg-white text-bottle border-bottle/10 hover:border-bottle/30'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {finalProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-bottle/30 gap-4 bg-white border border-bottle/5">
           <Search className="w-12 h-12 opacity-10" />
           <p className="text-sm uppercase tracking-widest font-bold">Нічого не знайдено</p>
        </div>
      ) : (
        <div className="mt-4">
          {activeTab === 'all' ? (
            <div className="space-y-12">
              {CATEGORIES.map(cat => {
                  const catProducts = groupedProducts[cat.slug] || [];
                  if (catProducts.length === 0) return null;

                  return (
                      <div key={cat.slug} className="space-y-4">
                          <div className="flex items-center gap-4 bg-bottle/5 p-4 border-l-4 border-bottle">
                              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-bottle">{cat.name}</h2>
                              <span className="text-[10px] bg-bottle/10 text-bottle px-2 py-0.5 font-mono">{catProducts.length} поз.</span>
                          </div>
                          
                          <InventoryMatrix products={catProducts} />
                      </div>
                  );
              })}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2">
               <InventoryMatrix products={finalProducts} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
