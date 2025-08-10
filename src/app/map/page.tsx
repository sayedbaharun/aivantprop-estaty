'use client';

import { useState, useEffect } from 'react';
import { PropertyMap, MapProperty } from '@/components/property-map';
import { MapSearch } from '@/components/map-search';
import { PropertyCard } from '@/components/property-card';

interface MapFilters {
  search?: string;
  city?: string;
  developer?: string;
  minPrice?: number;
  maxPrice?: number;
  salesStatus?: string;
}

interface MapStats {
  total: number;
  available: number;
  avgPrice: number;
  cities: number;
  developers: number;
}

export default function MapPage() {
  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<MapFilters>({});
  const [stats, setStats] = useState<MapStats | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'split'>('split');

  // Fetch properties based on filters
  const fetchProperties = async (filterParams: MapFilters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Add filter parameters
      if (filterParams.city) params.append('city', filterParams.city);
      if (filterParams.developer) params.append('developer', filterParams.developer);
      if (filterParams.minPrice) params.append('minPrice', filterParams.minPrice.toString());
      if (filterParams.maxPrice) params.append('maxPrice', filterParams.maxPrice.toString());
      if (filterParams.salesStatus) params.append('salesStatus', filterParams.salesStatus);
      
      // Increase limit for map view
      params.append('limit', '1000');

      const response = await fetch(`/api/properties/map?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProperties(data.data.properties);
        setStats(data.data.stats);
      } else {
        console.error('Failed to fetch properties:', data.error);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProperties({});
  }, []);

  // Handle filter changes
  const handleFiltersChange = (newFilters: MapFilters) => {
    setFilters(newFilters);
    fetchProperties(newFilters);
  };

  // Handle property selection
  const handlePropertySelect = (property: MapProperty) => {
    setSelectedProperty(property);
    
    // Scroll to property in list view if in split mode
    if (viewMode === 'split') {
      const element = document.getElementById(`property-${property.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Map</h1>
              <p className="mt-2 text-gray-600">
                Explore {properties.length.toLocaleString()} off-plan properties across the UAE
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="mt-4 lg:mt-0">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Map Only
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'split'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Map + List
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List Only
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <MapSearch 
              onFiltersChange={handleFiltersChange}
              isLoading={isLoading}
              propertyCount={properties.length}
            />
          </div>
          
          {/* Stats */}
          {stats && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Market Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Properties:</span>
                  <span className="font-medium">{stats.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-medium text-green-600">{stats.available.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Price:</span>
                  <span className="font-medium">
                    {stats.avgPrice > 0 ? `AED ${(stats.avgPrice / 1000000).toFixed(1)}M` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cities:</span>
                  <span className="font-medium">{stats.cities}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Developers:</span>
                  <span className="font-medium">{stats.developers}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={`grid gap-6 ${
          viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}>
          {/* Map View */}
          {(viewMode === 'map' || viewMode === 'split') && (
            <div className={viewMode === 'map' ? 'col-span-full' : ''}>
              <PropertyMap
                properties={properties}
                selectedPropertyId={selectedProperty?.id}
                onPropertySelect={handlePropertySelect}
                height={viewMode === 'map' ? '70vh' : '60vh'}
                showControls={true}
                className="rounded-xl overflow-hidden shadow-lg"
              />
            </div>
          )}

          {/* Property List */}
          {(viewMode === 'list' || viewMode === 'split') && (
            <div className={`space-y-4 ${viewMode === 'list' ? 'col-span-full' : ''}`}>
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Properties ({properties.length})
                </h3>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-48"></div>
                      </div>
                    ))}
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">No properties found</div>
                    <p className="text-gray-600">Try adjusting your search filters</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {properties.map((property) => (
                      <div
                        key={property.id}
                        id={`property-${property.id}`}
                        className={`transition-all duration-200 ${
                          selectedProperty?.id === property.id
                            ? 'ring-2 ring-teal-500 shadow-lg'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handlePropertySelect(property)}
                      >
                        <PropertyCard
                          property={{
                            id: property.id,
                            title: property.title,
                            slug: property.slug,
                            salesStatus: property.status,
                            minPrice: property.priceValue || undefined,
                            images: property.image ? [{ url: property.image }] : undefined,
                            city: { name: property.location.split(',')[0] },
                            district: property.location.includes(',') 
                              ? { name: property.location.split(',')[1]?.trim() } 
                              : undefined,
                            developer: property.developer ? { name: property.developer } : undefined
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected Property Details */}
        {selectedProperty && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Selected Property</h3>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedProperty.image && (
                <img
                  src={selectedProperty.image}
                  alt={selectedProperty.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div className="space-y-3">
                <h4 className="text-lg font-semibold">{selectedProperty.title}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">{selectedProperty.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span>{selectedProperty.location}</span>
                  </div>
                  {selectedProperty.developer && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Developer:</span>
                      <span>{selectedProperty.developer}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedProperty.isAvailable 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedProperty.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-3">
                  <a
                    href={`/properties/${selectedProperty.slug}`}
                    className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-center transition-colors"
                  >
                    View Details
                  </a>
                  <button
                    onClick={() => {
                      const message = `Hi, I'm interested in ${selectedProperty.title}. Can you provide more information?`;
                      window.open(`https://wa.me/971501234567?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-center transition-colors"
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
