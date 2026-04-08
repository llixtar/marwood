'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Building2, Loader2, ChevronDown, Search, AlertTriangle } from 'lucide-react';

const NP_API_URL = 'https://api.novaposhta.ua/v2.0/json/';
const NP_API_KEY = process.env.NEXT_PUBLIC_NP_API_KEY || '';

type Settlement = {
  Ref: string;
  Description: string;
  AreaDescription: string;
  RegionsDescription: string;
};

type Warehouse = {
  Ref: string;
  Description: string;
  Number: string;
  ShortAddress: string;
  CategoryOfWarehouse: string;
};

async function npFetch(modelName: string, calledMethod: string, methodProperties: Record<string, any>) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    
    const res = await fetch(NP_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: NP_API_KEY,
        modelName,
        calledMethod,
        methodProperties,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    const data = await res.json();
    if (data.success === false) {
      console.warn('NP API error:', data.errors);
      return [];
    }
    return data.data || [];
  } catch (err) {
    console.warn('NP API fetch failed:', err);
    return [];
  }
}

// =============================================
// ПОШУК МІСТА
// =============================================
export function NovaPoshtaCitySelect({ onCitySelect, selectedCity }: { 
  onCitySelect: (city: string, cityRef: string) => void;
  selectedCity: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Settlement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchCities = useCallback((value: string) => {
    setQuery(value);
    setApiError(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (value.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const data = await npFetch('Address', 'getSettlements', {
        FindByString: value,
        Limit: 20,
      });
      
      if (data.length === 0 && value.length >= 2) {
        // API не повернув результати — дозволяємо ручне введення
        setApiError(true);
      }
      
      setResults(data);
      setIsOpen(data.length > 0);
      setLoading(false);
    }, 400);
  }, []);

  // Дозволяємо ручне введення міста (fallback)
  const handleManualConfirm = () => {
    if (query.trim().length >= 2) {
      onCitySelect(query.trim(), '');
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 mb-1.5 block">
        <MapPin className="w-3 h-3 inline mr-1" />
        Місто *
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle/25 pointer-events-none" />
        <input
          type="text"
          value={selectedCity || query}
          onChange={(e) => {
            if (selectedCity) {
              onCitySelect('', '');
            }
            searchCities(e.target.value);
          }}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && apiError && query.trim()) {
              e.preventDefault();
              handleManualConfirm();
            }
          }}
          placeholder="Почніть вводити назву міста..."
          className="w-full border border-bottle/15 pl-10 pr-4 py-3 text-sm text-bottle bg-white focus:border-bottle focus:outline-none transition-colors placeholder:text-bottle/30"
          style={{ fontSize: '16px' }}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle/40 animate-spin" />
        )}
      </div>

      {/* Dropdown з результатами */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-bottle/10 shadow-2xl max-h-64 overflow-y-auto rounded-sm">
          {results.map((s) => (
            <button
              key={s.Ref}
              type="button"
              className="w-full text-left px-4 py-3 text-sm text-bottle hover:bg-bottle/5 transition-colors flex items-center gap-3 border-b border-bottle/5 last:border-0"
              onClick={() => {
                const label = s.RegionsDescription 
                  ? `${s.Description}, ${s.AreaDescription} обл., ${s.RegionsDescription} р-н` 
                  : `${s.Description}, ${s.AreaDescription} обл.`;
                onCitySelect(label, s.Ref);
                setQuery('');
                setIsOpen(false);
                setApiError(false);
              }}
            >
              <MapPin className="w-4 h-4 text-bottle/30 flex-shrink-0" />
              <div>
                <span className="font-semibold">{s.Description}</span>
                <span className="text-bottle/40 text-xs ml-2">
                  {s.AreaDescription} обл.
                  {s.RegionsDescription ? `, ${s.RegionsDescription} р-н` : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Якщо API не відповідає — дозволяємо ручне введення */}
      {apiError && query.length >= 2 && !selectedCity && (
        <div className="mt-2 bg-amber-50 border border-amber-200 px-3 py-2 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700">
            <p>API Нової Пошти тимчасово недоступне.</p>
            <button 
              type="button"
              onClick={handleManualConfirm}
              className="font-bold underline hover:no-underline mt-1 inline-block"
            >
              Використати «{query}» як місто →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// ПОШУК ВІДДІЛЕННЯ
// =============================================
export function NovaPoshtaWarehouseSelect({ cityRef, cityName, onWarehouseSelect, selectedWarehouse }: {
  cityRef: string;
  cityName: string;
  onWarehouseSelect: (warehouse: string, warehouseRef: string) => void;
  selectedWarehouse: string;
}) {
  const [query, setQuery] = useState('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filtered, setFiltered] = useState<Warehouse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noApi, setNoApi] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setWarehouses([]);
    setFiltered([]);
    setNoApi(false);
    setQuery('');

    if (!cityRef) {
      // Немає cityRef — API недоступне, дозволяємо ручне введення
      if (cityName) setNoApi(true);
      return;
    }

    setLoading(true);
    npFetch('Address', 'getWarehouses', {
      CityRef: cityRef,
      Limit: 500,
    }).then((data) => {
      if (data.length === 0) {
        setNoApi(true);
      }
      setWarehouses(data);
      setFiltered(data);
      setLoading(false);
    });
  }, [cityRef, cityName]);

  const filterWarehouses = (value: string) => {
    setQuery(value);
    if (selectedWarehouse) {
      onWarehouseSelect('', '');
    }
    const q = value.toLowerCase();
    setFiltered(warehouses.filter((w) => 
      w.Description.toLowerCase().includes(q) || w.Number.includes(q)
    ));
    setIsOpen(true);
  };

  if (!cityRef && !cityName) return null;

  // Якщо API недоступне — звичайне текстове поле 
  if (noApi) {
    return (
      <div>
        <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 mb-1.5 block">
          <Building2 className="w-3 h-3 inline mr-1" />
          Номер відділення Нової Пошти *
        </label>
        <input
          type="text"
          value={selectedWarehouse || query}
          onChange={(e) => {
            setQuery(e.target.value);
            onWarehouseSelect(e.target.value, '');
          }}
          placeholder="Наприклад: Відділення №5, вул. Сумська, 10"
          className="w-full border border-bottle/15 px-4 py-3 text-sm text-bottle bg-white focus:border-bottle focus:outline-none transition-colors placeholder:text-bottle/30"
          style={{ fontSize: '16px' }}
        />
        <p className="text-[10px] text-bottle/40 mt-1">
          Введіть номер та адресу відділення вручну
        </p>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 mb-1.5 block">
        <Building2 className="w-3 h-3 inline mr-1" />
        Відділення Нової Пошти *
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle/25 pointer-events-none" />
        <input
          type="text"
          value={selectedWarehouse || query}
          onChange={(e) => filterWarehouses(e.target.value)}
          onFocus={() => { if (filtered.length > 0) setIsOpen(true); }}
          placeholder={loading ? 'Завантаження відділень...' : `Оберіть відділення або введіть №...`}
          className="w-full border border-bottle/15 pl-10 pr-10 py-3 text-sm text-bottle bg-white focus:border-bottle focus:outline-none transition-colors placeholder:text-bottle/30"
          style={{ fontSize: '16px' }}
          disabled={loading}
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle/40 animate-spin" />
        ) : (
          <ChevronDown 
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bottle/30 cursor-pointer hover:text-bottle transition-colors" 
            onClick={() => { if (filtered.length > 0) setIsOpen(!isOpen); }}
          />
        )}
      </div>

      {/* Кількість знайдених */}
      {!loading && warehouses.length > 0 && !selectedWarehouse && (
        <p className="text-[10px] text-bottle/40 mt-1">
          Знайдено {warehouses.length} відділень. Почніть вводити номер для фільтрації.
        </p>
      )}

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-bottle/10 shadow-2xl max-h-64 overflow-y-auto rounded-sm">
          {filtered.slice(0, 50).map((w) => (
            <button
              key={w.Ref}
              type="button"
              className="w-full text-left px-4 py-3 text-sm text-bottle hover:bg-bottle/5 transition-colors border-b border-bottle/5 last:border-0 flex items-start gap-3"
              onClick={() => {
                onWarehouseSelect(w.Description, w.Ref);
                setQuery('');
                setIsOpen(false);
              }}
            >
              <span className="text-[10px] font-bold text-white bg-bottle/60 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">
                №{w.Number}
              </span>
              <span className="text-xs leading-relaxed">
                {w.ShortAddress || w.Description}
              </span>
            </button>
          ))}
        </div>
      )}

      {isOpen && filtered.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-bottle/10 shadow-xl p-4 text-center text-sm text-bottle/40 rounded-sm">
          Відділень не знайдено
        </div>
      )}
    </div>
  );
}
