'use client';

import { HeartIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface Property {
  id: string;
  title: string;
  slug: string;
  salesStatus?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  images?: { url: string }[];
  heroImage?: string;
  city?: { name: string };
  district?: { name: string };
  developer?: { name: string };
}

export type PropertyCardProps = {
  property: Property;
};

export function PropertyCard({ property }: PropertyCardProps) {
  const hero = property?.images?.[0]?.url || property?.heroImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  const priceMin = property?.minPrice ? Math.round(property.minPrice).toLocaleString('en-AE') : null;
  const priceMax = property?.maxPrice ? Math.round(property.maxPrice).toLocaleString('en-AE') : null;
  const price = priceMin && priceMax ? `AED ${priceMin} - ${priceMax}` : priceMin ? `From AED ${priceMin}` : 'Price on request';

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={hero}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status Badge */}
        {property.salesStatus && (
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-lg">
              {property.salesStatus.replace(/_/g, ' ')}
            </span>
          </div>
        )}
        
        {/* Favorite Button */}
        <button className="absolute right-4 top-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100">
          <HeartIcon className="w-5 h-5" />
        </button>

        {/* Hover Overlay Content */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <div className="flex items-center space-x-4 text-white text-sm">
            <div className="flex items-center space-x-1">
              <MapPinIcon className="w-4 h-4" />
              <span>{property?.city?.name || 'Dubai'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <BuildingOfficeIcon className="w-4 h-4" />
              <span>{property?.developer?.name || 'Premium Developer'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Developer Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            {property?.developer?.name || 'Premium Developer'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-teal-600 transition-colors">
          {property.title}
        </h3>

        {/* Location */}
        <p className="text-sm text-gray-600 mb-4 flex items-center">
          <MapPinIcon className="w-4 h-4 mr-1" />
          {property?.city?.name}{property?.district ? `, ${property.district.name}` : ''}
        </p>

        {/* Price and Area */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-lg font-bold text-gray-900">{price}</p>
            {property?.minArea && (
              <p className="text-sm text-gray-500">From {Math.round(property.minArea)} sqft</p>
            )}
          </div>
          
          {/* View Property CTA Arrow */}
          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

                            {/* Action CTAs */}
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <button 
                        className="px-2 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center justify-center border border-teal-200"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(`mailto:info@offplandub.ai?subject=Brochure Request - ${property.title}&body=Hi, I would like to request a brochure for ${property.title}.`, '_blank');
                        }}
                        title="Download property brochure"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Brochure
                      </button>
                      
                      <button 
                        className="px-2 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center justify-center border border-amber-200"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(`https://wa.me/971501234567?text=Hi, I would like to schedule a viewing for ${property.title}`, '_blank');
                        }}
                        title="Schedule property viewing"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        View
                      </button>

                      <button 
                        className="px-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center justify-center border border-blue-200"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(`/map?property=${property.id}`, '_blank');
                        }}
                        title="View property on map"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Map
                      </button>
                    </div>

        {/* Special CTA for "Price on request" properties */}
        {(!property?.minPrice && !property?.maxPrice) && (
          <button 
            className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(`https://wa.me/971501234567?text=Hi, I would like to know the current price for ${property.title}`, '_blank');
            }}
            title="Get current property price"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Get Current Price
          </button>
        )}
      </div>

      {/* Link Overlay */}
      <a href={`/properties/${property.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {property.title}</span>
      </a>
    </div>
  );
}
