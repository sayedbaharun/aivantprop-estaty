/**
 * Utility functions for the property portal
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for merging Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Create URL-friendly slug from string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with -
    .replace(/\s+/g, '-')
    // Remove all non-word chars
    .replace(/[^\w\-]+/g, '')
    // Replace multiple - with single -
    .replace(/\-\-+/g, '-')
    // Remove - from start and end
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Format price with currency
 */
export function formatPrice(
  price: number | null | undefined,
  currency: string = 'AED'
): string {
  if (!price) return 'Price on request';
  
  const formatter = new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(price);
}

/**
 * Format price range
 */
export function formatPriceRange(
  minPrice: number | null | undefined,
  maxPrice: number | null | undefined,
  currency: string = 'AED'
): string {
  if (!minPrice && !maxPrice) return 'Price on request';
  if (minPrice && !maxPrice) return `From ${formatPrice(minPrice, currency)}`;
  if (!minPrice && maxPrice) return `Up to ${formatPrice(maxPrice, currency)}`;
  if (minPrice === maxPrice) return formatPrice(minPrice, currency);
  
  return `${formatPrice(minPrice, currency)} - ${formatPrice(maxPrice, currency)}`;
}

/**
 * Format area with unit
 */
export function formatArea(
  area: number | null | undefined,
  unit: string = 'sqft'
): string {
  if (!area) return 'Area on request';
  
  const formatter = new Intl.NumberFormat('en-AE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return `${formatter.format(area)} ${unit}`;
}

/**
 * Format area range
 */
export function formatAreaRange(
  minArea: number | null | undefined,
  maxArea: number | null | undefined,
  unit: string = 'sqft'
): string {
  if (!minArea && !maxArea) return 'Area on request';
  if (minArea && !maxArea) return `From ${formatArea(minArea, unit)}`;
  if (!minArea && maxArea) return `Up to ${formatArea(maxArea, unit)}`;
  if (minArea === maxArea) return formatArea(minArea, unit);
  
  return `${formatArea(minArea, unit)} - ${formatArea(maxArea, unit)}`;
}

/**
 * Format bedrooms display
 */
export function formatBedrooms(bedrooms: number | null | undefined): string {
  if (!bedrooms) return 'Studio';
  if (bedrooms === 1) return '1 Bedroom';
  return `${bedrooms} Bedrooms`;
}

/**
 * Format bathrooms display
 */
export function formatBathrooms(bathrooms: number | null | undefined): string {
  if (!bathrooms) return '';
  if (bathrooms === 1) return '1 Bathroom';
  if (bathrooms % 1 === 0) return `${bathrooms} Bathrooms`;
  return `${bathrooms} Bathrooms`;
}

/**
 * Format unit type display (Studio, 1BR, 2BR, etc.)
 */
export function formatUnitType(
  bedrooms: number | null | undefined,
  bathrooms?: number | null | undefined
): string {
  if (!bedrooms || bedrooms === 0) return 'Studio';
  
  const bedroomStr = `${bedrooms}BR`;
  if (bathrooms && bathrooms > 0) {
    const bathroomStr = bathrooms % 1 === 0 ? `${bathrooms}BA` : `${bathrooms}BA`;
    return `${bedroomStr} + ${bathroomStr}`;
  }
  
  return bedroomStr;
}

/**
 * Format delivery date
 */
export function formatDeliveryDate(
  deliveryDate: Date | string | null | undefined,
  handoverYear?: number | null,
  handoverQuarter?: number | null
): string {
  if (deliveryDate) {
    const date = typeof deliveryDate === 'string' ? new Date(deliveryDate) : deliveryDate;
    return new Intl.DateTimeFormat('en-AE', {
      year: 'numeric',
      month: 'long',
    }).format(date);
  }
  
  if (handoverYear) {
    if (handoverQuarter) {
      return `Q${handoverQuarter} ${handoverYear}`;
    }
    return handoverYear.toString();
  }
  
  return 'TBA';
}

/**
 * Format property status for display
 */
export function formatPropertyStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'UPCOMING': 'Upcoming',
    'UNDER_CONSTRUCTION': 'Under Construction',
    'READY': 'Ready',
    'COMPLETED': 'Completed',
    'SOLD_OUT': 'Sold Out',
  };
  
  return statusMap[status] || status;
}

/**
 * Format sales status for display
 */
export function formatSalesStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'AVAILABLE': 'Available',
    'LIMITED_AVAILABILITY': 'Limited Availability',
    'SOLD_OUT': 'Sold Out',
    'COMING_SOON': 'Coming Soon',
  };
  
  return statusMap[status] || status;
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'AVAILABLE': 'text-green-600 bg-green-50',
    'LIMITED_AVAILABILITY': 'text-orange-600 bg-orange-50',
    'SOLD_OUT': 'text-red-600 bg-red-50',
    'COMING_SOON': 'text-blue-600 bg-blue-50',
    'UPCOMING': 'text-purple-600 bg-purple-50',
    'UNDER_CONSTRUCTION': 'text-yellow-600 bg-yellow-50',
    'READY': 'text-green-600 bg-green-50',
    'COMPLETED': 'text-gray-600 bg-gray-50',
  };
  
  return colorMap[status] || 'text-gray-600 bg-gray-50';
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string | null | undefined, length: number = 100): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

/**
 * Generate SEO-friendly meta title
 */
export function generateMetaTitle(
  propertyTitle: string,
  cityName?: string,
  developerName?: string
): string {
  let title = propertyTitle;
  
  if (cityName) {
    title += ` | ${cityName}`;
  }
  
  if (developerName) {
    title += ` by ${developerName}`;
  }
  
  title += ' | Aivant Properties';
  
  return title;
}

/**
 * Generate SEO-friendly meta description
 */
export function generateMetaDescription(
  propertyTitle: string,
  description?: string | null,
  priceRange?: string,
  cityName?: string,
  developerName?: string
): string {
  let metaDesc = `Discover ${propertyTitle}`;
  
  if (developerName) {
    metaDesc += ` by ${developerName}`;
  }
  
  if (cityName) {
    metaDesc += ` in ${cityName}`;
  }
  
  if (priceRange) {
    metaDesc += `. Prices from ${priceRange}`;
  }
  
  if (description) {
    const shortDesc = truncateText(description, 100);
    metaDesc += `. ${shortDesc}`;
  }
  
  metaDesc += ' | View floor plans, amenities & book a viewing with Aivant Properties.';
  
  return metaDesc;
}

/**
 * Generate structured data for property
 */
export function generatePropertyStructuredData(property: {
  title: string;
  description?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  currency?: string;
  minArea?: number | null;
  maxArea?: number | null;
  areaUnit?: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  heroImage?: string | null;
  developer?: { name: string };
  city?: { name: string };
}): object {
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "RealEstateProject",
    name: property.title,
    description: property.description || '',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/properties/${slugify(property.title)}`,
  };

  if (property.developer) {
    structuredData.developer = {
      "@type": "Organization",
      name: property.developer.name,
    };
  }

  if (property.address || property.city) {
    structuredData.address = {
      "@type": "PostalAddress",
      streetAddress: property.address || '',
      addressLocality: property.city?.name || '',
      addressCountry: "AE",
    };
  }

  if (property.latitude && property.longitude) {
    structuredData.geo = {
      "@type": "GeoCoordinates",
      latitude: property.latitude,
      longitude: property.longitude,
    };
  }

  if (property.heroImage) {
    structuredData.image = property.heroImage;
  }

  if (property.minPrice || property.maxPrice) {
    structuredData.offers = {
      "@type": "AggregateOffer",
      priceCurrency: property.currency || 'AED',
      lowPrice: property.minPrice || property.maxPrice,
      highPrice: property.maxPrice || property.minPrice,
    };
  }

  return structuredData;
}

/**
 * Calculate reading time for text content
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Get image optimization URL (placeholder for now)
 */
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  // TODO: Implement image optimization service
  // For now, return original URL
  return url;
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (UAE format)
 */
export function isValidPhoneUAE(phone: string): boolean {
  const phoneRegex = /^(\+971|971|0)?[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Format phone number for display
 */
export function formatPhoneUAE(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('971')) {
    return `+${cleaned}`;
  }
  
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+971${cleaned.substring(1)}`;
  }
  
  if (cleaned.length === 9) {
    return `+971${cleaned}`;
  }
  
  return phone;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
