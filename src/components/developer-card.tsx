'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
  ChevronRightIcon,
  CalendarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

export interface DeveloperCardProps {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  website?: string | null;
  phone?: string | null;
  headquarters?: string | null;
  establishedYear?: number | null;
  totalProjects: number;
  featuredProperties: Array<{
    id: string;
    title: string;
    slug: string;
    salesStatus?: string | null;
    minPrice?: number | null;
    heroImage?: string | null;
  }>;
}

export function DeveloperCard({ 
  id,
  name, 
  slug, 
  logo, 
  description, 
  website, 
  phone, 
  headquarters, 
  establishedYear,
  totalProjects, 
  featuredProperties 
}: DeveloperCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Price on request';
    if (price >= 1000000) {
      return `AED ${(price / 1000000).toFixed(1)}M`;
    }
    return `AED ${Math.round(price).toLocaleString('en-AE')}`;
  };

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case 'SELLING':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Available</span>;
      case 'LAUNCHING':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Launching</span>;
      case 'COMING_SOON':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Coming Soon</span>;
      case 'SOLD_OUT':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Sold Out</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {logo ? (
              <img 
                src={logo} 
                alt={`${name} logo`} 
                className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-2"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900">{name}</h3>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  <span>{totalProjects} projects</span>
                </span>
                {establishedYear && (
                  <span className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Est. {establishedYear}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title={showDetails ? 'Hide details' : 'Show details'}
            >
              <EyeIcon className="w-5 h-5" />
            </button>
            <Link
              href={`/developers/${slug}`}
              className="flex items-center space-x-1 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <span>View All</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {description && (
          <p className="mt-3 text-gray-600 text-sm line-clamp-2">{description}</p>
        )}
      </div>

      {/* Contact Details - Expandable */}
      {showDetails && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {headquarters && (
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                <span>{headquarters}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center space-x-2 text-gray-600">
                <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                <span>{phone}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center space-x-2 text-gray-600 md:col-span-2">
                <GlobeAltIcon className="w-4 h-4 flex-shrink-0" />
                <a 
                  href={website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 truncate"
                >
                  {website}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Recent Projects</h4>
            {featuredProperties.length > 3 && (
              <span className="text-sm text-gray-500">
                +{featuredProperties.length - 3} more
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredProperties.slice(0, 3).map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.slug}`}
                className="group block"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
                  {property.heroImage ? (
                    <img 
                      src={property.heroImage} 
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  {property.salesStatus && (
                    <div className="absolute top-2 left-2">
                      {getStatusBadge(property.salesStatus)}
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <h5 className="font-medium text-gray-900 text-sm line-clamp-1 group-hover:text-gray-700">
                    {property.title}
                  </h5>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatPrice(property.minPrice)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
