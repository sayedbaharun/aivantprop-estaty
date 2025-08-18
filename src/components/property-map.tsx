'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic imports for Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Map property type
export interface MapProperty {
  id: string;
  title: string;
  slug: string;
  developer: string;
  city: string;
  district?: string;
  latitude: number;
  longitude: number;
  salesStatus: string;
  status: string;
  minPrice?: number;
  maxPrice?: number;
  handoverYear?: number;
  handoverQuarter?: number;
  heroImage?: string;
  unitCount: number;
  amenities?: string[];
}

interface PropertyMapProps {
  properties: MapProperty[];
  selectedProperty: MapProperty | null;
  onPropertySelect: (property: MapProperty) => void;
  className?: string;
}

export function PropertyMap({ 
  properties, 
  selectedProperty, 
  onPropertySelect,
  className = "h-full w-full"
}: PropertyMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [leaflet, setLeaflet] = useState<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Dynamic import of Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix for default markers in react-leaflet
      const icon = '/leaflet/marker-icon.png';
      const iconShadow = '/leaflet/marker-shadow.png';
      
      const DefaultIcon = L.default.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41],
        shadowSize: [41, 41]
      });
      
      L.default.Marker.prototype.options.icon = DefaultIcon;
      setLeaflet(L.default);
    });
  }, []);

  // Center map on selected property
  useEffect(() => {
    if (selectedProperty && mapRef.current) {
      mapRef.current.setView(
        [selectedProperty.latitude, selectedProperty.longitude],
        15,
        { animate: true }
      );
    }
  }, [selectedProperty]);

  // Create property marker icons
  const createPropertyIcon = (status: string, isSelected: boolean = false) => {
    if (!leaflet) return null;
    
    const color = status === 'AVAILABLE' || status === 'LIMITED_AVAILABILITY' 
      ? '#059669' // Green for available
      : status === 'SOLD_OUT' 
      ? '#dc2626' // Red for sold out
      : '#f59e0b'; // Orange for coming soon

    const size = isSelected ? 35 : 25;
    const zIndex = isSelected ? 1000 : 100;

    return leaflet.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
          font-weight: bold;
          z-index: ${zIndex};
          ${isSelected ? 'transform: scale(1.2);' : ''}
        ">
          ${properties.length > 50 ? '' : '•'}
        </div>
      `,
      className: 'property-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  };

  // Format price for display
  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    if (price >= 1000000) {
      return `AED ${(price / 1000000).toFixed(1)}M`;
    }
    return `AED ${Math.round(price).toLocaleString('en-AE')}`;
  };

  // Calculate map bounds
  const getMapBounds = () => {
    if (properties.length === 0) {
      // Default to Dubai coordinates
      return {
        center: [25.2048, 55.2708] as [number, number],
        zoom: 11
      };
    }

    const lats = properties.map(p => p.latitude);
    const lngs = properties.map(p => p.longitude);
    
    const center: [number, number] = [
      lats.reduce((a, b) => a + b, 0) / lats.length,
      lngs.reduce((a, b) => a + b, 0) / lngs.length
    ];

    // Calculate appropriate zoom level based on spread
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const spread = Math.max(latSpread, lngSpread);
    
    let zoom = 11;
    if (spread < 0.05) zoom = 14;
    else if (spread < 0.1) zoom = 13;
    else if (spread < 0.2) zoom = 12;
    else if (spread < 0.5) zoom = 11;
    else zoom = 10;

    return { center, zoom };
  };

  const { center, zoom } = getMapBounds();

  if (!isClient || !leaflet) {
    return (
      <div className={`${className} bg-gray-100 animate-pulse flex items-center justify-center`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      ref={mapRef}
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude, property.longitude]}
          icon={createPropertyIcon(
            property.salesStatus,
            selectedProperty?.id === property.id
          )}
          eventHandlers={{
            click: () => onPropertySelect(property)
          }}
        >
          <Popup>
            <div className="min-w-[250px] p-2">
              {property.heroImage && (
                <img 
                  src={property.heroImage} 
                  alt={property.title}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-semibold text-gray-900">{property.title}</h3>
              <p className="text-sm text-gray-600">{property.developer}</p>
              <p className="text-sm text-gray-600">
                {property.city}{property.district ? `, ${property.district}` : ''}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <span className="font-semibold">
                  {formatPrice(property.minPrice)}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  property.salesStatus === 'AVAILABLE' || property.salesStatus === 'LIMITED_AVAILABILITY'
                    ? 'bg-green-100 text-green-800'
                    : property.salesStatus === 'SOLD_OUT'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {property.salesStatus === 'AVAILABLE' ? 'Available' :
                   property.salesStatus === 'LIMITED_AVAILABILITY' ? 'Limited' :
                   property.salesStatus === 'SOLD_OUT' ? 'Sold Out' : 'Coming Soon'}
                </span>
              </div>
              {property.handoverYear && (
                <p className="text-xs text-gray-500 mt-1">
                  Handover: Q{property.handoverQuarter || '?'} {property.handoverYear}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}