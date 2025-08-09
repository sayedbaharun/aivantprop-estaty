'use client';

import { useEffect, useMemo, useState } from 'react';
import { PropertyCard } from './property-card';

export function SearchFilters() {
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [developer, setDeveloper] = useState('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [price, setPrice] = useState<string>('');

  useEffect(() => {
    fetch('/api/filters').then(r => r.json()).then(d => setFilters(d.data));
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (city) params.set('city', city);
    if (developer) params.set('developer', developer);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (price) {
      const [min, max] = price.split('-');
      if (min) params.set('min_price', min);
      if (max && max !== 'null') params.set('max_price', max);
    }
    params.set('include_developer', 'true');
    params.set('include_city', 'true');
    params.set('include_images', 'true');

    const res = await fetch(`/api/properties?${params.toString()}`);
    const json = await res.json();
    setResults(json?.data || []);
    setLoading(false);
  };

  const priceOptions = useMemo(() => filters?.priceRanges || [], [filters]);

  return (
    <div id="search" className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Search</label>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Property name or keyword" className="mt-2 w-full rounded-xl border-gray-200 focus:border-gray-900 focus:ring-gray-900" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">City</label>
          <select value={city} onChange={e => setCity(e.target.value)} className="mt-2 w-full rounded-xl border-gray-200 focus:border-gray-900 focus:ring-gray-900">
            <option value="">All</option>
            {filters?.cities?.map((c: any) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Developer</label>
          <select value={developer} onChange={e => setDeveloper(e.target.value)} className="mt-2 w-full rounded-xl border-gray-200 focus:border-gray-900 focus:ring-gray-900">
            <option value="">All</option>
            {filters?.developers?.map((d: any) => (
              <option key={d.slug} value={d.slug}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Bedrooms</label>
          <select value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="mt-2 w-full rounded-xl border-gray-200 focus:border-gray-900 focus:ring-gray-900">
            <option value="">Any</option>
            {filters?.bedrooms?.map((b: any) => (
              <option key={b.value} value={String(b.value)}>{b.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Price</label>
          <select value={price} onChange={e => setPrice(e.target.value)} className="mt-2 w-full rounded-xl border-gray-200 focus:border-gray-900 focus:ring-gray-900">
            <option value="">Any</option>
            {priceOptions.map((p: any) => (
              <option key={p.label} value={`${p.min}-${p.max}`}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={handleSearch} className="w-full rounded-xl bg-gray-900 text-white font-semibold h-11 hover:bg-black">
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
