'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

export function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    // Only update if the query actually changed compared to URL
    const currentQ = searchParams.get('q') || '';
    if (debouncedQuery === currentQ) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set('q', debouncedQuery);
      params.set('page', '1'); // Скидаємо на першу сторінку при пошуку
    } else {
      params.delete('q');
    }
    
    router.push(`/admin?${params.toString()}`);
  }, [debouncedQuery, router, searchParams]);

  // Sync internal state with URL params (e.g. if back button is pressed)
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle/30" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Пошук за артикулом (SKU)..."
        className="w-full bg-white border border-bottle/10 pl-10 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-bottle/30 transition-all font-mono shadow-sm"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-bottle/5 text-bottle/40 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
