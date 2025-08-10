'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HeartIcon, MapPinIcon, BuildingOfficeIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Property {
  id: string;
  title: string;
  slug: string;
  salesStatus?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  handoverYear?: number;
  handoverQuarter?: number;
  images?: { url: string }[];
  heroImage?: string;
  city?: { name: string };
  district?: { name: string };
  developer?: { name: string };
  description?: string;
  keyFeatures?: string[];
}

interface EnhancedPropertyCardProps {
  property: Property;
  onFavorite?: (propertyId: string) => void;
  isFavorite?: boolean;
  showDescription?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export function EnhancedPropertyCard({ 
  property, 
  onFavorite,
  isFavorite = false,
  showDescription = true,
  variant = 'default'
}: EnhancedPropertyCardProps) {
  const [showQuickView, setShowQuickView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const hero = property?.images?.[0]?.url || property?.heroImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  const priceMin = property?.minPrice ? Math.round(property.minPrice).toLocaleString('en-AE') : null;
  const priceMax = property?.maxPrice ? Math.round(property.maxPrice).toLocaleString('en-AE') : null;
  const price = priceMin && priceMax ? `AED ${priceMin} - ${priceMax}` : priceMin ? `From AED ${priceMin}` : 'Price on request';

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500 hover:bg-green-600';
      case 'LIMITED_AVAILABILITY': return 'bg-orange-500 hover:bg-orange-600';
      case 'SOLD_OUT': return 'bg-red-500 hover:bg-red-600';
      case 'COMING_SOON': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const formatStatus = (status?: string) => {
    return status?.replace(/_/g, ' ') || 'Available';
  };

  const cardHeight = variant === 'compact' ? 'h-64' : variant === 'featured' ? 'h-80' : 'h-72';

  return (
    <>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg">
        {/* Image Container */}
        <div className={`relative ${cardHeight} overflow-hidden`}>
          <img
            src={hero}
            alt={property.title}
            className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400">Loading...</div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Status Badge */}
          {property.salesStatus && (
            <Badge 
              className={`absolute left-4 top-4 text-white border-0 ${getStatusColor(property.salesStatus)}`}
            >
              {formatStatus(property.salesStatus)}
            </Badge>
          )}
          
          {/* Favorite Button */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-4 top-4 h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavorite?.(property.id);
            }}
          >
            {isFavorite ? (
              <HeartSolidIcon className="h-4 w-4 text-red-500" />
            ) : (
              <HeartIcon className="h-4 w-4" />
            )}
          </Button>

          {/* Quick Actions Overlay */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="secondary" className="flex-1">
                    Quick View
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(`/map?property=${property.id}`, '_blank');
                }}
              >
                <MapPinIcon className="h-4 w-4 mr-1" />
                Map
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Developer Badge */}
          <div className="mb-3">
            <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-50">
              <BuildingOfficeIcon className="w-3 h-3 mr-1" />
              {property?.developer?.name || 'Premium Developer'}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-teal-600 transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPinIcon className="w-4 h-4 mr-1" />
            <span>{property?.city?.name}{property?.district ? `, ${property.district.name}` : ''}</span>
          </div>

          {/* Price and Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-gray-900">{price}</div>
                {property?.minArea && (
                  <div className="text-sm text-gray-500">From {Math.round(property.minArea)} sqft</div>
                )}
              </div>
              
              {(property.handoverYear || property.handoverQuarter) && (
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>
                      {property.handoverQuarter ? `Q${property.handoverQuarter} ` : ''}
                      {property.handoverYear}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Key Features */}
          {property.keyFeatures && property.keyFeatures.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {property.keyFeatures.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {property.keyFeatures.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{property.keyFeatures.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Description */}
          {showDescription && property.description && variant !== 'compact' && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-3">
              {property.description}
            </p>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <div className="flex w-full gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const message = `Hi, I'm interested in ${property.title}. Can you provide more information?`;
                window.open(`https://wa.me/971501234567?text=${encodeURIComponent(message)}`, '_blank');
              }}
            >
              <CurrencyDollarIcon className="w-4 h-4 mr-1" />
              Enquire
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(`mailto:info@offplandub.ai?subject=Brochure Request - ${property.title}`, '_blank');
              }}
            >
              Brochure
            </Button>
          </div>
        </CardFooter>

        {/* Link Overlay */}
        <Link href={`/properties/${property.slug}`} className="absolute inset-0 z-10">
          <span className="sr-only">View {property.title}</span>
        </Link>
      </Card>

      {/* Quick View Dialog */}
      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{property.title}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={hero}
                alt={property.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Property Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">{price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span>{property?.city?.name}{property?.district ? `, ${property.district.name}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Developer:</span>
                    <span>{property?.developer?.name}</span>
                  </div>
                  {property?.minArea && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span>From {Math.round(property.minArea)} sqft</span>
                    </div>
                  )}
                </div>
              </div>
              
              {property.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-gray-600 line-clamp-4">{property.description}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href={`/properties/${property.slug}`}>
                    View Details
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const message = `Hi, I'm interested in ${property.title}. Can you provide more information?`;
                    window.open(`https://wa.me/971501234567?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                >
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
