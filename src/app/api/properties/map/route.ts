import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Schema for map API parameters
const mapParamsSchema = z.object({
  bounds: z.object({
    north: z.coerce.number(),
    south: z.coerce.number(),
    east: z.coerce.number(),
    west: z.coerce.number()
  }).optional(),
  city: z.string().optional(),
  developer: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  salesStatus: z.enum(['AVAILABLE', 'LIMITED_AVAILABILITY', 'SOLD_OUT', 'COMING_SOON']).optional(),
  property: z.string().optional(), // Single property ID to highlight
  limit: z.coerce.number().min(1).max(1000).default(500)
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const params = {
      bounds: searchParams.get('bounds') ? JSON.parse(searchParams.get('bounds')!) : undefined,
      city: searchParams.get('city') || undefined,
      developer: searchParams.get('developer') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      salesStatus: searchParams.get('salesStatus') || undefined,
      property: searchParams.get('property') || undefined,
      limit: searchParams.get('limit') || undefined
    };

    const validatedParams = mapParamsSchema.parse(params);

    // Build where clause for property filtering
    const where: any = {
      // Only include properties with coordinates
      AND: [
        { latitude: { not: null } },
        { longitude: { not: null } }
      ]
    };

    // Add bounds filtering if provided
    if (validatedParams.bounds) {
      const { north, south, east, west } = validatedParams.bounds;
      where.AND.push(
        { latitude: { gte: south, lte: north } },
        { longitude: { gte: west, lte: east } }
      );
    }

    // Add city filter
    if (validatedParams.city) {
      where.AND.push({
        city: { name: { contains: validatedParams.city, mode: 'insensitive' } }
      });
    }

    // Add developer filter
    if (validatedParams.developer) {
      where.AND.push({
        developer: { name: { contains: validatedParams.developer, mode: 'insensitive' } }
      });
    }

    // Add price filters
    if (validatedParams.minPrice || validatedParams.maxPrice) {
      const priceFilter: any = {};
      if (validatedParams.minPrice) priceFilter.gte = validatedParams.minPrice;
      if (validatedParams.maxPrice) priceFilter.lte = validatedParams.maxPrice;
      where.AND.push({ minPrice: priceFilter });
    }

    // Add sales status filter
    if (validatedParams.salesStatus) {
      where.AND.push({ salesStatus: validatedParams.salesStatus });
    }

    // Single property filter (for highlighting specific property)
    if (validatedParams.property) {
      where.AND.push({ id: validatedParams.property });
    }

    // Fetch properties with coordinates
    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        latitude: true,
        longitude: true,
        minPrice: true,
        maxPrice: true,
        salesStatus: true,
        city: { select: { name: true } },
        district: { select: { name: true } },
        developer: { select: { name: true } },
        images: {
          take: 1,
          select: { url: true, tag: true }
        }
      },
      take: validatedParams.limit,
      orderBy: [
        { salesStatus: 'asc' }, // Prioritize available properties
        { minPrice: 'asc' }
      ]
    });

    // Transform properties for map display
    const mapProperties = properties.map(property => ({
      id: property.id,
      title: property.title,
      slug: property.slug,
      coordinates: [property.latitude!, property.longitude!] as [number, number],
      price: property.minPrice 
        ? `From AED ${Math.round(property.minPrice).toLocaleString('en-AE')}`
        : 'Price on request',
      priceValue: property.minPrice || 0,
      status: property.salesStatus,
      location: `${property.city?.name}${property.district ? `, ${property.district.name}` : ''}`,
      developer: property.developer?.name,
      image: property.images?.[0]?.url || null,
      isAvailable: property.salesStatus === 'AVAILABLE' || property.salesStatus === 'LIMITED_AVAILABILITY'
    }));

    // Calculate bounds of returned properties
    const bounds = mapProperties.length > 0 ? {
      north: Math.max(...mapProperties.map(p => p.coordinates[0])),
      south: Math.min(...mapProperties.map(p => p.coordinates[0])),
      east: Math.max(...mapProperties.map(p => p.coordinates[1])),
      west: Math.min(...mapProperties.map(p => p.coordinates[1]))
    } : null;

    // Calculate statistics
    const stats = {
      total: mapProperties.length,
      available: mapProperties.filter(p => p.isAvailable).length,
      avgPrice: mapProperties.length > 0 
        ? Math.round(mapProperties.reduce((sum, p) => sum + p.priceValue, 0) / mapProperties.length)
        : 0,
      cities: [...new Set(mapProperties.map(p => p.location.split(',')[0]))].length,
      developers: [...new Set(mapProperties.map(p => p.developer).filter(Boolean))].length
    };

    return NextResponse.json({
      success: true,
      data: {
        properties: mapProperties,
        bounds,
        stats,
        total: mapProperties.length
      }
    });

  } catch (error) {
    console.error('Map API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch map data' },
      { status: 500 }
    );
  }
}
