/**
 * Single Property API Route
 * Handles individual property detail requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cleanPropertyDescription, extractKeyFeatures, extractLocationHighlights } from '@/lib/html-cleaner';
import { notFound } from 'next/navigation';

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
        { success: false, error: 'Property slug is required' },
        { status: 400 }
      );
    }
    
    // Find property by slug with full details
    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            description: true,
            website: true,
            phone: true,
            email: true,
            headquarters: true,
          }
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true,
            nameAr: true,
            country: true,
            latitude: true,
            longitude: true,
          }
        },
        district: {
          select: {
            id: true,
            name: true,
            slug: true,
            nameAr: true,
            latitude: true,
            longitude: true,
          }
        },
        images: {
          orderBy: [
            { tag: 'asc' }, // HERO images first
            { sortOrder: 'asc' }
          ]
        },
        floorPlans: {
          orderBy: [
            { bedrooms: 'asc' },
            { planType: 'asc' }
          ]
        },
        units: {
          orderBy: [
            { bedrooms: 'asc' },
            { price: 'asc' }
          ],
          include: {
            images: {
              take: 5,
              orderBy: { sortOrder: 'asc' }
            },
            floorPlans: {
              orderBy: { planType: 'asc' }
            }
          }
        }
      }
    });
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    // Get related properties (same developer or same city)
    const relatedProperties = await prisma.property.findMany({
      where: {
        AND: [
          { id: { not: property.id } },
          {
            OR: [
              { developerId: property.developerId },
              { cityId: property.cityId }
            ]
          }
        ]
      },
      include: {
        developer: {
          select: { id: true, name: true, slug: true, logo: true }
        },
        city: {
          select: { id: true, name: true, slug: true }
        },
        images: {
          where: { tag: 'HERO' },
          take: 1,
          orderBy: { sortOrder: 'asc' }
        }
      },
      take: 6,
      orderBy: { createdAt: 'desc' }
    });
    
    // Get property statistics
    const stats = {
      totalUnits: property.units.length,
      availableUnits: property.units.filter(unit => unit.status === 'AVAILABLE').length,
      bedroomTypes: [...new Set(property.units.map(unit => unit.bedrooms).filter(Boolean))].sort(),
      priceRange: {
        min: Math.min(...property.units.map(unit => unit.price || 0).filter(Boolean)),
        max: Math.max(...property.units.map(unit => unit.price || 0).filter(Boolean)),
      },
      areaRange: {
        min: Math.min(...property.units.map(unit => unit.size || 0).filter(Boolean)),
        max: Math.max(...property.units.map(unit => unit.size || 0).filter(Boolean)),
      }
    };
    
    // Clean property description
    const cleanedProperty = {
      ...property,
      description: cleanPropertyDescription(property.description),
      keyFeatures: extractKeyFeatures(property.description || ''),
      locationHighlights: extractLocationHighlights(property.description || ''),
    };

    // Clean related properties descriptions too
    const cleanedRelatedProperties = relatedProperties.map(prop => ({
      ...prop,
      description: cleanPropertyDescription(prop.description),
    }));

    return NextResponse.json({
      success: true,
      data: {
        property: cleanedProperty,
        relatedProperties: cleanedRelatedProperties,
        stats
      }
    });
    
  } catch (error) {
    console.error('Property Detail API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property details' },
      { status: 500 }
    );
  }
}

// PUT endpoint for updating property details (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();
    
    // TODO: Add authentication/authorization check
    
    // Find existing property
    const existingProperty = await prisma.property.findUnique({
      where: { slug }
    });
    
    if (!existingProperty) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    // Update property
    const updatedProperty = await prisma.property.update({
      where: { slug },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        salesStatus: body.salesStatus,
        minPrice: body.minPrice,
        maxPrice: body.maxPrice,
        minArea: body.minArea,
        maxArea: body.maxArea,
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
        handoverYear: body.handoverYear,
        handoverQuarter: body.handoverQuarter,
        heroImage: body.heroImage,
        brochureUrl: body.brochureUrl,
        videoUrl: body.videoUrl,
        amenities: body.amenities,
        facilities: body.facilities,
        paymentPlans: body.paymentPlans,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        updatedAt: new Date(),
      },
      include: {
        developer: true,
        city: true,
        district: true,
      }
    });
    
    return NextResponse.json({
      success: true,
      data: updatedProperty,
      message: 'Property updated successfully'
    });
    
  } catch (error) {
    console.error('Property Update API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update property' },
      { status: 500 }
    );
  }
}
