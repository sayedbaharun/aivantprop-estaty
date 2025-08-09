'use client';

import { useMemo, useState } from 'react';

export type FloorPlan = {
  id?: string;
  title?: string;
  planType?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size?: number | null;
  imageUrl?: string | null;
  pdfUrl?: string | null;
};

export function FloorPlanExplorer({ floorPlans = [] as FloorPlan[] }: { floorPlans: FloorPlan[] }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const current = floorPlans[index];
  const byBedrooms = useMemo(() => {
    const map = new Map<number, FloorPlan[]>();
    for (const fp of floorPlans) {
      const key = (fp.bedrooms ?? 0) as number;
      map.set(key, [...(map.get(key) || []), fp]);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [floorPlans]);

  const hasAnyImage = useMemo(() => floorPlans.some(fp => !!fp.imageUrl), [floorPlans]);
  const bedroomOptions = useMemo(() => {
    const set = new Set<number>(floorPlans.map(fp => (fp.bedrooms ?? 0) as number));
    return Array.from(set).sort((a, b) => a - b);
  }, [floorPlans]);

  if (!floorPlans.length) return null;

  // Fallback view when there are no floor plan images
  if (!hasAnyImage) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Floor Plans</h3>
            <p className="text-sm text-gray-600">Available bedroom options</p>
          </div>
          <a href="#enquire" className="rounded-lg bg-gray-900 text-white text-sm px-4 py-2">
            Need floor plans? Click here
          </a>
        </div>

        <div className="flex flex-wrap gap-2">
          {bedroomOptions.length ? (
            bedroomOptions.map((b, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm"
              >
                {b === 0 ? 'Studio' : `${b} Bedroom`}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No bedroom options available</span>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          We&apos;ll share official floor plan images on request.
        </div>
      </div>
    );
  }

  // Default full explorer when images exist
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Floor Plans</h3>
          <p className="text-sm text-gray-600">Zoom and explore available layouts</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="rounded-lg px-3 py-2 bg-gray-100">-</button>
          <span className="w-12 text-center text-sm">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="rounded-lg px-3 py-2 bg-gray-100">+</button>
          <button onClick={() => setZoom(1)} className="rounded-lg px-3 py-2 bg-gray-100">Reset</button>
          {current?.pdfUrl && (
            <a target="_blank" href={current.pdfUrl} className="ml-2 rounded-lg px-3 py-2 bg-gray-900 text-white text-sm">Download PDF</a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="overflow-auto rounded-xl border bg-gray-50">
            {current?.imageUrl ? (
              <img
                src={current.imageUrl}
                alt={current?.title || 'Floor Plan'}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                className="origin-top-left"
              />
            ) : (
              <div className="p-12 text-center text-gray-500">No image available</div>
            )}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            {(current?.bedrooms ?? 0) === 0 ? 'Studio' : `${current?.bedrooms} Bedroom`}
            {current?.size ? ` • ${Math.round(current.size)} sqft` : ''}
          </div>
        </div>
        <div className="space-y-4">
          {byBedrooms.map(([beds, plans]) => (
            <div key={beds}>
              <div className="text-sm font-semibold text-gray-700 mb-2">{beds === 0 ? 'Studio' : `${beds} Bedroom`}</div>
              <div className="grid grid-cols-3 gap-2">
                {plans.map((fp, i) => {
                  const idx = floorPlans.indexOf(fp);
                  const active = idx === index;
                  return (
                    <button
                      key={i}
                      onClick={() => setIndex(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border ${active ? 'ring-2 ring-gray-900' : 'border-gray-200'}`}
                      title={fp.title || ''}
                    >
                      {fp.imageUrl ? (
                        <img src={fp.imageUrl} alt={fp.title || ''} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gray-100" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
