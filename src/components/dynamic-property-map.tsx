'use client';

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

// Dynamically import the PropertyLocationMap component with SSR disabled
const PropertyLocationMap = dynamic(
  () => import('./property-location-map').then(mod => ({ default: mod.PropertyLocationMap })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-xl p-6 text-center">
        <div className="text-gray-500 mb-2">Location Map</div>
        <div className="text-sm text-gray-600">Loading map...</div>
      </div>
    ),
  }
);

// Re-export with the same interface
export { PropertyLocationMap };

export default PropertyLocationMap;
