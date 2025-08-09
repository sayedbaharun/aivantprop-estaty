/**
 * Filters API Route
 * Provides filter options for property search
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all filter options in parallel
    const [
      cities,
      developers,
      districts,
      propertyTypes,
      statuses,
      salesStatuses,
      priceRanges,
      areaRanges,
      bedroomOptions,
      amenitiesAgg,
      facilitiesAgg,
      paymentPlansAgg,
      handoverYears,
    ] = await Promise.all([
      // Cities with property count
      prisma.city.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { properties: true }
          }
        },
        orderBy: { name: 'asc' },
        where: {
          properties: { some: {} }
        }
      }),
      
      // Developers with property count
      prisma.developer.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          _count: {
            select: { properties: true }
          }
        },
        orderBy: { name: 'asc' },
        where: {
          properties: { some: {} }
        }
      }),
      
      // Districts with property count
      prisma.district.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          city: {
            select: { name: true, slug: true }
          },
          _count: {
            select: { properties: true }
          }
        },
        orderBy: { name: 'asc' },
        where: {
          properties: { some: {} }
        }
      }),
      
      // Property types
      prisma.property.groupBy({
        by: ['propertyType'],
        _count: true,
        orderBy: { _count: { propertyType: 'desc' } }
      }),
      
      // Property statuses
      prisma.property.groupBy({
        by: ['status'],
        _count: true,
        orderBy: { _count: { status: 'desc' } }
      }),
      
      // Sales statuses
      prisma.property.groupBy({
        by: ['salesStatus'],
        _count: true,
        orderBy: { _count: { salesStatus: 'desc' } }
      }),
      
      // Price ranges
      prisma.property.aggregate({
        _min: { minPrice: true },
        _max: { maxPrice: true },
        where: {
          AND: [
            { minPrice: { not: null } },
            { maxPrice: { not: null } },
            { minPrice: { gt: 0 } },
            { maxPrice: { gt: 0 } },
          ]
        }
      }),
      
      // Area ranges
      prisma.property.aggregate({
        _min: { minArea: true },
        _max: { maxArea: true },
        where: {
          AND: [
            { minArea: { not: null } },
            { maxArea: { not: null } },
            { minArea: { gt: 0 } },
            { maxArea: { gt: 0 } },
          ]
        }
      }),
      
      // Bedroom options from units
      prisma.unit.groupBy({
        by: ['bedrooms'],
        _count: true,
        orderBy: { bedrooms: 'asc' },
        where: {
          bedrooms: { not: null }
        }
      }),
      
      // Amenities aggregation
      prisma.$queryRaw`
        SELECT DISTINCT unnest(amenities) as amenity, COUNT(*) as count
        FROM properties 
        WHERE array_length(amenities, 1) > 0
        GROUP BY amenity
        ORDER BY count DESC, amenity ASC
        LIMIT 50
      `,
      
      // Facilities aggregation
      prisma.$queryRaw`
        SELECT DISTINCT unnest(facilities) as facility, COUNT(*) as count
        FROM properties 
        WHERE array_length(facilities, 1) > 0
        GROUP BY facility
        ORDER BY count DESC, facility ASC
        LIMIT 50
      `,
      
      // Payment plans aggregation
      prisma.$queryRaw`
        SELECT DISTINCT unnest(payment_plans) as payment_plan, COUNT(*) as count
        FROM properties 
        WHERE array_length(payment_plans, 1) > 0
        GROUP BY payment_plan
        ORDER BY count DESC, payment_plan ASC
        LIMIT 20
      `,
      
      // Handover years
      prisma.property.groupBy({
        by: ['handoverYear'],
        _count: true,
        orderBy: { handoverYear: 'asc' },
        where: {
          handoverYear: { not: null }
        }
      }),
    ]);
    
    // Generate price range buckets
    const minPrice = priceRanges._min.minPrice || 100000;
    const maxPrice = priceRanges._max.maxPrice || 10000000;
    const priceRangeBuckets = generatePriceRanges(minPrice, maxPrice);
    
    // Generate area range buckets
    const minArea = areaRanges._min.minArea || 300;
    const maxArea = areaRanges._max.maxArea || 5000;
    const areaRangeBuckets = generateAreaRanges(minArea, maxArea);
    
    // Format bedroom options
    const bedroomOptionsFormatted = bedroomOptions.map(option => ({
      value: option.bedrooms,
      label: option.bedrooms === 0 ? 'Studio' : `${option.bedrooms} BR`,
      count: option._count
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        cities: cities.map(city => ({
          id: city.id,
          name: city.name,
          slug: city.slug,
          count: city._count.properties
        })),
        
        developers: developers.map(dev => ({
          id: dev.id,
          name: dev.name,
          slug: dev.slug,
          logo: dev.logo,
          count: dev._count.properties
        })),
        
        districts: districts.map(district => ({
          id: district.id,
          name: district.name,
          slug: district.slug,
          city: district.city,
          count: district._count.properties
        })),
        
        propertyTypes: propertyTypes.map(type => ({
          value: type.propertyType,
          label: formatPropertyType(type.propertyType),
          count: type._count
        })),
        
        statuses: statuses.map(status => ({
          value: status.status,
          label: formatStatus(status.status),
          count: status._count
        })),
        
        salesStatuses: salesStatuses.map(status => ({
          value: status.salesStatus,
          label: formatSalesStatus(status.salesStatus),
          count: status._count
        })),
        
        priceRanges: priceRangeBuckets,
        areaRanges: areaRangeBuckets,
        bedrooms: bedroomOptionsFormatted,
        
        amenities: (amenitiesAgg as any[]).map((item: any) => ({
          value: item.amenity,
          label: item.amenity,
          count: parseInt(item.count)
        })),
        
        facilities: (facilitiesAgg as any[]).map((item: any) => ({
          value: item.facility,
          label: item.facility,
          count: parseInt(item.count)
        })),
        
        paymentPlans: (paymentPlansAgg as any[]).map((item: any) => ({
          value: item.payment_plan,
          label: item.payment_plan,
          count: parseInt(item.count)
        })),
        
        handoverYears: handoverYears.map(year => ({
          value: year.handoverYear,
          label: year.handoverYear?.toString(),
          count: year._count
        })),
        
        summary: {
          totalProperties: await prisma.property.count(),
          activeCities: cities.length,
          activeDevelopers: developers.length,
          priceRange: { min: minPrice, max: maxPrice },
          areaRange: { min: minArea, max: maxArea },
        }
      }
    });
    
  } catch (error) {
    console.error('Filters API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}

// Helper functions
function formatPropertyType(type: string): string {
  const typeMap: Record<string, string> = {
    'RESIDENTIAL': 'Residential',
    'COMMERCIAL': 'Commercial',
    'MIXED_USE': 'Mixed Use',
    'INDUSTRIAL': 'Industrial',
  };
  return typeMap[type] || type;
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'UPCOMING': 'Upcoming',
    'UNDER_CONSTRUCTION': 'Under Construction',
    'READY': 'Ready',
    'COMPLETED': 'Completed',
    'SOLD_OUT': 'Sold Out',
  };
  return statusMap[status] || status;
}

function formatSalesStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'AVAILABLE': 'Available',
    'LIMITED_AVAILABILITY': 'Limited Availability',
    'SOLD_OUT': 'Sold Out',
    'COMING_SOON': 'Coming Soon',
  };
  return statusMap[status] || status;
}

function generatePriceRanges(minPrice: number, maxPrice: number) {
  const ranges = [
    { min: 0, max: 500000, label: 'Under AED 500K' },
    { min: 500000, max: 1000000, label: 'AED 500K - 1M' },
    { min: 1000000, max: 2000000, label: 'AED 1M - 2M' },
    { min: 2000000, max: 3000000, label: 'AED 2M - 3M' },
    { min: 3000000, max: 5000000, label: 'AED 3M - 5M' },
    { min: 5000000, max: 10000000, label: 'AED 5M - 10M' },
    { min: 10000000, max: null, label: 'Above AED 10M' },
  ];
  
  return ranges.filter(range => {
    if (range.max === null) return maxPrice > range.min;
    return minPrice <= range.max && maxPrice >= range.min;
  });
}

function generateAreaRanges(minArea: number, maxArea: number) {
  const ranges = [
    { min: 0, max: 500, label: 'Under 500 sqft' },
    { min: 500, max: 1000, label: '500 - 1,000 sqft' },
    { min: 1000, max: 1500, label: '1,000 - 1,500 sqft' },
    { min: 1500, max: 2000, label: '1,500 - 2,000 sqft' },
    { min: 2000, max: 3000, label: '2,000 - 3,000 sqft' },
    { min: 3000, max: 5000, label: '3,000 - 5,000 sqft' },
    { min: 5000, max: null, label: 'Above 5,000 sqft' },
  ];
  
  return ranges.filter(range => {
    if (range.max === null) return maxArea > range.min;
    return minArea <= range.max && maxArea >= range.min;
  });
}
