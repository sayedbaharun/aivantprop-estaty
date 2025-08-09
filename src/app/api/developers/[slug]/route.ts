/**
 * Single Developer API Route
 * Handles individual developer detail requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Developer slug is required' },
        { status: 400 }
      );
    }
    
    // Find developer by slug with full details
    const developer = await prisma.developer.findUnique({
      where: { slug },
      include: {
        properties: {
          include: {
            city: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            },
            district: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            },
            images: {
              where: { tag: 'HERO' },
              take: 1,
              select: { url: true, alt: true }
            },
            _count: {
              select: {
                units: true,
                floorPlans: true,
              }
            }
          },
          orderBy: [
            { salesStatus: 'asc' }, // Active projects first
            { createdAt: 'desc' }
          ]
        },
        _count: {
          select: {
            properties: true
          }
        }
      }
    });
    
    if (!developer) {
      return NextResponse.json(
        { success: false, error: 'Developer not found' },
        { status: 404 }
      );
    }

    // Calculate developer statistics
    const stats = {
      totalProjects: developer._count.properties,
      activeProjects: developer.properties.filter(p => 
        p.salesStatus === 'AVAILABLE' || p.salesStatus === 'LIMITED_AVAILABILITY'
      ).length,
      completedProjects: developer.properties.filter(p => 
        p.salesStatus === 'SOLD_OUT'
      ).length,
      totalUnits: developer.properties.reduce((sum, p) => sum + p._count.units, 0),
      avgPrice: developer.properties.length > 0 
        ? Math.round(
            developer.properties
              .filter(p => p.minPrice && p.minPrice > 0)
              .reduce((sum, p, _, arr) => sum + (p.minPrice || 0), 0) / 
            developer.properties.filter(p => p.minPrice && p.minPrice > 0).length
          ) 
        : 0,
      priceRange: {
        min: Math.min(...developer.properties.map(p => p.minPrice || 0).filter(p => p > 0)),
        max: Math.max(...developer.properties.map(p => p.maxPrice || 0))
      }
    };

    // Group properties by status
    const projectsByStatus = {
      active: developer.properties.filter(p => 
        p.salesStatus === 'AVAILABLE' || p.salesStatus === 'LIMITED_AVAILABILITY'
      ),
      upcoming: developer.properties.filter(p => 
        p.salesStatus === 'COMING_SOON'
      ),
      completed: developer.properties.filter(p => 
        p.salesStatus === 'SOLD_OUT'
      ),
    };

    // Transform properties for response
    const transformedProperties = developer.properties.map(prop => ({
      id: prop.id,
      title: prop.title,
      slug: prop.slug,
      salesStatus: prop.salesStatus,
      status: prop.status,
      propertyType: prop.propertyType,
      minPrice: prop.minPrice,
      maxPrice: prop.maxPrice,
      handoverYear: prop.handoverYear,
      handoverQuarter: prop.handoverQuarter,
      heroImage: prop.images[0]?.url || null,
      city: prop.city,
      district: prop.district,
      unitCount: prop._count.units,
      floorPlanCount: prop._count.floorPlans,
    }));

    return NextResponse.json({
      success: true,
      data: {
        developer: {
          id: developer.id,
          name: developer.name,
          slug: developer.slug,
          logo: developer.logo,
          description: developer.description,
          website: developer.website,
          phone: developer.phone,
          email: developer.email,
          headquarters: developer.headquarters,
        },
        properties: transformedProperties,
        projectsByStatus,
        stats
      }
    });
    
  } catch (error) {
    console.error('Developer Detail API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch developer details' },
      { status: 500 }
    );
  }
}
