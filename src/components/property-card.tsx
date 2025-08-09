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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">{price}</p>
            {property?.minArea && (
              <p className="text-sm text-gray-500">From {Math.round(property.minArea)} sqft</p>
            )}
          </div>
          
          {/* CTA Arrow */}
          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Link Overlay */}
      <a href={`/properties/${property.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {property.title}</span>
      </a>
    </div>
  );
}
