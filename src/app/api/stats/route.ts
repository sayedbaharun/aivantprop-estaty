import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get basic counts
    const [
      totalProperties,
      availableProperties,
      developers,
      cities,
      priceStats,
      popularAreas,
      newListings,
      upcomingHandovers,
      topDevelopers
    ] = await Promise.all([
      // Total properties
      prisma.property.count(),
      
      // Available properties
      prisma.property.count({
        where: {
          salesStatus: {
            in: ['AVAILABLE', 'LIMITED_AVAILABILITY']
          }
        }
      }),
      
      // Total developers
      prisma.developer.count(),
      
      // Total cities
      prisma.city.count(),
      
      // Price statistics
      prisma.property.aggregate({
        _avg: { minPrice: true },
        _min: { minPrice: true },
        _max: { minPrice: true },
        where: {
          minPrice: { not: null }
        }
      }),
      
      // Popular areas (cities with property counts)
      prisma.city.findMany({
        select: {
          name: true,
          _count: {
            select: { properties: true }
          }
        },
        orderBy: {
          properties: { _count: 'desc' }
        },
        take: 5
      }),
      
      // New listings (properties created in the last 30 days)
      prisma.property.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Upcoming handovers (next 12 months)
      prisma.property.count({
        where: {
          handoverYear: {
            in: [new Date().getFullYear(), new Date().getFullYear() + 1]
          }
        }
      }),
      
      // Top developers by property count
      prisma.developer.findMany({
        select: {
          name: true,
          _count: {
            select: { properties: true }
          },
          properties: {
            select: { minPrice: true },
            where: { minPrice: { not: null } }
          }
        },
        orderBy: {
          properties: { _count: 'desc' }
        },
        take: 4
      })
    ]);

    // Calculate average prices for top developers
    const topDevelopersWithAvg = topDevelopers.map(dev => {
      const prices = dev.properties.map(p => p.minPrice).filter(Boolean) as number[];
      const avgPrice = prices.length > 0 
        ? prices.reduce((sum, price) => sum + price, 0) / prices.length 
        : 0;
      
      return {
        name: dev.name,
        count: dev._count.properties,
        avgPrice: Math.round(avgPrice)
      };
    });

    const stats = {
      totalProperties,
      availableProperties,
      developers,
      cities,
      averagePrice: Math.round(priceStats._avg.minPrice || 0),
      priceRange: {
        min: priceStats._min.minPrice || 0,
        max: priceStats._max.minPrice || 0
      },
      popularAreas: popularAreas.map(area => ({
        name: area.name,
        count: area._count.properties
      })),
      newListings,
      upcomingHandovers,
      topDevelopers: topDevelopersWithAvg
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
