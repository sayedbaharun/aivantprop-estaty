'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface MapSearchFilters {
  search?: string;
  city?: string;
  developer?: string;
  minPrice?: number;
  maxPrice?: number;
  salesStatus?: string;
}

interface MapSearchProps {
  onFiltersChange: (filters: MapSearchFilters) => void;
  isLoading?: boolean;
  propertyCount?: number;
}

const salesStatusOptions = [
  { value: '', label: 'Any Status' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'LIMITED_AVAILABILITY', label: 'Limited Availability' },
  { value: 'COMING_SOON', label: 'Coming Soon' },
  { value: 'SOLD_OUT', label: 'Sold Out' }
];

const cityOptions = [
  { value: '', label: 'All Cities' },
  { value: 'Dubai', label: 'Dubai' },
  { value: 'Abu Dhabi', label: 'Abu Dhabi' },
  { value: 'Sharjah', label: 'Sharjah' },
  { value: 'Ajman', label: 'Ajman' },
  { value: 'Ras Al Khaimah', label: 'Ras Al Khaimah' },
  { value: 'Fujairah', label: 'Fujairah' },
  { value: 'Umm Al Quwain', label: 'Umm Al Quwain' }
];

const priceRanges = [
  { value: '', label: 'Any Price' },
  { value: '0-1000000', label: 'Under AED 1M' },
  { value: '1000000-2000000', label: 'AED 1M - 2M' },
  { value: '2000000-5000000', label: 'AED 2M - 5M' },
  { value: '5000000-10000000', label: 'AED 5M - 10M' },
  { value: '10000000-', label: 'Above AED 10M' }
];

export function MapSearch({ onFiltersChange, isLoading = false, propertyCount = 0 }: MapSearchProps) {
  const [filters, setFilters] = useState<MapSearchFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange('search', searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleFilterChange = (key: keyof MapSearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (range: string) => {
    if (!range) {
      handleFilterChange('minPrice', undefined);
      handleFilterChange('maxPrice', undefined);
      return;
    }

    const [min, max] = range.split('-').map(v => v ? parseInt(v) : undefined);
    setFilters(prev => {
      const newFilters = { ...prev, minPrice: min, maxPrice: max };
      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  const getCurrentPriceRange = () => {
    const { minPrice, maxPrice } = filters;
    if (!minPrice && !maxPrice) return '';
    
    return priceRanges.find(range => {
      if (!range.value) return false;
      const [min, max] = range.value.split('-').map(v => v ? parseInt(v) : undefined);
      return min === minPrice && max === maxPrice;
    })?.value || '';
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPinIcon className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-gray-900">Property Map Search</h3>
          {propertyCount > 0 && (
            <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-medium">
              {propertyCount} found
            </span>
          )}
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search properties, developers, or locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.city || ''}
          onChange={(e) => handleFilterChange('city', e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          {cityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={getCurrentPriceRange()}
          onChange={(e) => handlePriceRangeChange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          {priceRanges.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.salesStatus || ''}
          onChange={(e) => handleFilterChange('salesStatus', e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          {salesStatusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Developer Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Developer
              </label>
              <input
                type="text"
                placeholder="e.g., EMAAR, Damac, Azizi..."
                value={filters.developer || ''}
                onChange={(e) => handleFilterChange('developer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Custom Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Price Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min price"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
