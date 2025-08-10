'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom property marker icons
const createPropertyIcon = (status: string, isSelected: boolean = false) => {
  const color = status === 'AVAILABLE' || status === 'LIMITED_AVAILABILITY' 
    ? '#059669' // Green for available
    : status === 'SOLD_OUT' 
    ? '#dc2626' // Red for sold out
    : '#f59e0b'; // Orange for coming soon

  const size = isSelected ? 35 : 25;
  const zIndex = isSelected ? 1000 : 100;

  return L.divIcon({
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
        ${status === 'AVAILABLE' ? '●' : status === 'SOLD_OUT' ? '✕' : '◐'}
      </div>
    `,
    className: 'property-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

export interface MapProperty {
  id: string;
  title: string;
  slug: string;
  coordinates: [number, number];
  price: string;
  priceValue: number;
  status: string;
  location: string;
  developer?: string;
  image?: string | null;
  isAvailable: boolean;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface PropertyMapProps {
  properties: MapProperty[];
  selectedPropertyId?: string;
  onPropertySelect?: (property: MapProperty) => void;
  height?: string;
  showControls?: boolean;
  initialBounds?: MapBounds;
  className?: string;
}

// Component to fit bounds when properties change
function MapBoundsController({ properties, initialBounds }: { properties: MapProperty[], initialBounds?: MapBounds }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length === 0) return;

    if (initialBounds) {
      // Use provided bounds
      map.fitBounds([
        [initialBounds.south, initialBounds.west],
        [initialBounds.north, initialBounds.east]
      ], { padding: [20, 20] });
    } else {
      // Calculate bounds from properties
      const bounds = L.latLngBounds(
        properties.map(p => p.coordinates as L.LatLngTuple)
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, properties, initialBounds]);

  return null;
}

export function PropertyMap({
  properties,
  selectedPropertyId,
  onPropertySelect,
  height = '400px',
  showControls = true,
  initialBounds,
  className = ''
}: PropertyMapProps) {
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Ensure this only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div 
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  // Default center (Dubai)
  const defaultCenter: [number, number] = [25.2048, 55.2708];

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        ref={mapRef}
        center={defaultCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg z-0"
        zoomControl={showControls}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapBoundsController properties={properties} initialBounds={initialBounds} />

        {properties.map((property) => (
          <Marker
            key={property.id}
            position={property.coordinates}
            icon={createPropertyIcon(property.status, selectedPropertyId === property.id)}
            eventHandlers={{
              click: () => onPropertySelect?.(property)
            }}
          >
            <Popup>
              <div className="w-64 p-2">
                {property.image && (
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {property.title}
                </h3>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center justify-between">
                    <span>Price:</span>
                    <span className="font-semibold text-teal-600">{property.price}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      property.isAvailable 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {property.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Location:</span>
                    <span className="text-right">{property.location}</span>
                  </div>
                  
                  {property.developer && (
                    <div className="flex items-center justify-between">
                      <span>Developer:</span>
                      <span className="text-right">{property.developer}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <a
                    href={`/properties/${property.slug}`}
                    className="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg text-center transition-colors"
                  >
                    View Details
                  </a>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const message = `Hi, I'm interested in ${property.title}. Can you provide more information?`;
                      window.open(`https://wa.me/971501234567?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg text-center transition-colors"
                  >
                    Enquire
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      {showControls && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Property Status</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Coming Soon</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span>Sold Out</span>
            </div>
          </div>
        </div>
      )}

      {/* Property Count */}
      {showControls && properties.length > 0 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
          <span className="text-sm font-medium text-gray-900">
            {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
          </span>
        </div>
      )}
    </div>
  );
}
