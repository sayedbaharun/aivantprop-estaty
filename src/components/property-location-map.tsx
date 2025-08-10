'use client';

import { useState, useEffect } from 'react';
import { PropertyMap, MapProperty } from '@/components/property-map';

interface Property {
  id: string;
  title: string;
  slug: string;
  latitude?: number | null;
  longitude?: number | null;
  minPrice?: number | null;
  salesStatus?: string;
  city?: { name: string } | null;
  district?: { name: string } | null;
  developer?: { name: string } | null;
  images?: { url: string }[] | null;
}

interface PropertyLocationMapProps {
  property: Property;
  nearbyProperties?: Property[];
  className?: string;
}

export function PropertyLocationMap({ 
  property, 
  nearbyProperties = [], 
  className = '' 
}: PropertyLocationMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render if property doesn't have coordinates
  if (!property.latitude || !property.longitude) {
    return (
      <div className={`bg-gray-100 rounded-xl p-6 text-center ${className}`}>
        <div className="text-gray-500 mb-2">Location Map</div>
        <p className="text-sm text-gray-600">
          Map coordinates not available for this property
        </p>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className={`bg-gray-100 rounded-xl p-6 text-center ${className}`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  // Convert property to MapProperty format
  const mapProperty: MapProperty = {
    id: property.id,
    title: property.title,
    slug: property.slug,
    coordinates: [property.latitude, property.longitude],
    price: property.minPrice 
      ? `From AED ${Math.round(property.minPrice).toLocaleString('en-AE')}`
      : 'Price on request',
    priceValue: property.minPrice || 0,
    status: property.salesStatus || 'AVAILABLE',
    location: `${property.city?.name || ''}${property.district ? `, ${property.district.name}` : ''}`,
    developer: property.developer?.name,
    image: property.images?.[0]?.url || null,
    isAvailable: property.salesStatus === 'AVAILABLE' || property.salesStatus === 'LIMITED_AVAILABILITY'
  };

  // Convert nearby properties to MapProperty format
  const nearbyMapProperties: MapProperty[] = nearbyProperties
    .filter(p => p.latitude && p.longitude && p.id !== property.id)
    .map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      coordinates: [p.latitude!, p.longitude!],
      price: p.minPrice 
        ? `From AED ${Math.round(p.minPrice).toLocaleString('en-AE')}`
        : 'Price on request',
      priceValue: p.minPrice || 0,
      status: p.salesStatus || 'AVAILABLE',
      location: `${p.city?.name || ''}${p.district ? `, ${p.district.name}` : ''}`,
      developer: p.developer?.name,
      image: p.images?.[0]?.url || null,
      isAvailable: p.salesStatus === 'AVAILABLE' || p.salesStatus === 'LIMITED_AVAILABILITY'
    }));

  const allProperties = [mapProperty, ...nearbyMapProperties];

  // Calculate bounds with some padding around the main property
  const padding = 0.01; // Roughly 1km
  const bounds = {
    north: property.latitude + padding,
    south: property.latitude - padding,
    east: property.longitude + padding,
    west: property.longitude - padding
  };

  return (
    <div className={className}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Location & Nearby Properties</h3>
          <p className="text-sm text-gray-600 mt-1">
            {property.city?.name}{property.district ? `, ${property.district.name}` : ''}
            {nearbyMapProperties.length > 0 && (
              <span className="ml-2 text-teal-600">
                +{nearbyMapProperties.length} nearby
              </span>
            )}
          </p>
        </div>
        
        <PropertyMap
          properties={allProperties}
          selectedPropertyId={property.id}
          height="350px"
          showControls={true}
          initialBounds={bounds}
          className="border-0 rounded-none"
        />
        
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Coordinates:</span>
              <div className="font-mono text-xs text-gray-800">
                {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
              </div>
            </div>
            <div className="text-right">
              <a
                href={`/map?bounds=${JSON.stringify(bounds)}`}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                View in Full Map →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
