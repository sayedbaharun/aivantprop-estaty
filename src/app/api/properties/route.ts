/**
 * Properties API Route
 * Handles listing, searching, and filtering of properties
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { cleanPropertyDescription, extractKeyFeatures, extractLocationHighlights } from '@/lib/html-cleaner';

// Validation schema for search parameters
const searchParamsSchema = z.object({
  // Search and filtering
  search: z.string().optional(),
  city: z.string().optional(),
  developer: z.string().optional(),
  district: z.string().optional(),
  property_type: z.string().optional(),
  status: z.string().optional(),
  sales_status: z.string().optional(),
  
  // Price range
  min_price: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  max_price: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  
  // Area range
  min_area: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  max_area: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  
  // Bedrooms (multiple values)
  bedrooms: z.string().optional(),
  
  // Amenities (multiple values)
  amenities: z.string().optional(),
  
  // Delivery date
  handover_year: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  
  // Sorting
  sort_by: z.enum([
    'price_asc',
    'price_desc',
    'area_asc', 
    'area_desc',
    'name_asc',
    'name_desc',
    'created_at_desc',
    'delivery_date_asc'
  ]).optional().default('created_at_desc'),
  
  // Pagination
  page: z.string().transform(val => val ? parseInt(val) : 1).optional().default(1),
  limit: z.string().transform(val => val ? Math.min(parseInt(val), 100) : 20).optional().default(20),
  
  // Include relations
  include_developer: z.string().transform(val => val === 'true').optional().default(true),
  include_city: z.string().transform(val => val === 'true').optional().default(true),
  include_images: z.string().transform(val => val === 'true').optional().default(true),
  include_floor_plans: z.string().transform(val => val === 'true').optional().default(false),
  include_units: z.string().transform(val => val === 'true').optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Validate and parse search parameters
    const validatedParams = searchParamsSchema.parse(params);
    
    // Build where clause for filtering
    const where: any = {};
    
    // Text search
    if (validatedParams.search) {
      where.OR = [
        { title: { contains: validatedParams.search, mode: 'insensitive' } },
        { description: { contains: validatedParams.search, mode: 'insensitive' } },
        { developer: { name: { contains: validatedParams.search, mode: 'insensitive' } } },
      ];
    }
    
    // City filter
    if (validatedParams.city) {
      where.city = { slug: validatedParams.city };
    }
    
    // Developer filter
    if (validatedParams.developer) {
      where.developer = { slug: validatedParams.developer };
    }
    
    // District filter
    if (validatedParams.district) {
      where.district = { slug: validatedParams.district };
    }
    
    // Property type filter
    if (validatedParams.property_type) {
      where.propertyType = validatedParams.property_type.toUpperCase();
    }
    
    // Status filters
    if (validatedParams.status) {
      where.status = validatedParams.status.toUpperCase();
    }
    
    if (validatedParams.sales_status) {
      where.salesStatus = validatedParams.sales_status.toUpperCase();
    }
    
    // Price range
    if (validatedParams.min_price || validatedParams.max_price) {
      where.OR = [
        ...(where.OR || []),
        {
          AND: [
            validatedParams.min_price ? { minPrice: { gte: validatedParams.min_price } } : {},
            validatedParams.max_price ? { maxPrice: { lte: validatedParams.max_price } } : {},
          ].filter(obj => Object.keys(obj).length > 0)
        }
      ];
    }
    
    // Area range
    if (validatedParams.min_area || validatedParams.max_area) {
      where.AND = [
        ...(where.AND || []),
        validatedParams.min_area ? { minArea: { gte: validatedParams.min_area } } : {},
        validatedParams.max_area ? { maxArea: { lte: validatedParams.max_area } } : {},
      ].filter(obj => Object.keys(obj).length > 0);
    }
    
    // Bedrooms filter (from units)
    if (validatedParams.bedrooms) {
      const bedroomValues = validatedParams.bedrooms.split(',').map(b => parseInt(b.trim()));
      where.units = {
        some: {
          bedrooms: { in: bedroomValues }
        }
      };
    }
    
    // Amenities filter
    if (validatedParams.amenities) {
      const amenityList = validatedParams.amenities.split(',').map(a => a.trim());
      where.amenities = {
        hasEvery: amenityList
      };
    }
    
    // Handover year filter
    if (validatedParams.handover_year) {
      where.handoverYear = validatedParams.handover_year;
    }
    
    // Build orderBy clause
    const orderBy: any = {};
    switch (validatedParams.sort_by) {
      case 'price_asc':
        orderBy.minPrice = 'asc';
        break;
      case 'price_desc':
        orderBy.minPrice = 'desc';
        break;
      case 'area_asc':
        orderBy.minArea = 'asc';
        break;
      case 'area_desc':
        orderBy.minArea = 'desc';
        break;
      case 'name_asc':
        orderBy.title = 'asc';
        break;
      case 'name_desc':
        orderBy.title = 'desc';
        break;
      case 'delivery_date_asc':
        orderBy.deliveryDate = 'asc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }
    
    // Build include clause
    const include: any = {};
    
    if (validatedParams.include_developer) {
      include.developer = {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        }
      };
    }
    
    if (validatedParams.include_city) {
      include.city = {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      };
      include.district = {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      };
    }
    
    if (validatedParams.include_images) {
      include.images = {
        where: { tag: 'HERO' },
        take: 5,
        orderBy: { sortOrder: 'asc' }
      };
    }
    
    if (validatedParams.include_floor_plans) {
      include.floorPlans = {
        take: 10,
        orderBy: { title: 'asc' }
      };
    }
    
    if (validatedParams.include_units) {
      include.units = {
        take: 10,
        orderBy: { price: 'asc' }
      };
    }
    
    // Calculate pagination
    const page = Math.max(1, validatedParams.page || 1);
    const limit = Math.min(100, Math.max(1, validatedParams.limit || 20));
    const skip = (page - 1) * limit;
    
    // Execute queries
    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    // Clean property descriptions
    const cleanedProperties = properties.map(property => ({
      ...property,
      description: cleanPropertyDescription(property.description),
      keyFeatures: extractKeyFeatures(property.description || ''),
      locationHighlights: extractLocationHighlights(property.description || ''),
    }));

    return NextResponse.json({
      success: true,
      data: cleanedProperties,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        applied: Object.keys(params).length > 0,
        count: Object.keys(where).length,
      }
    });
    
  } catch (error) {
    console.error('Properties API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid search parameters',
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch properties' 
      },
      { status: 500 }
    );
  }
}

// POST endpoint for advanced search with complex filtering
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Advanced search schema
    const advancedSearchSchema = z.object({
      search: z.string().optional(),
      filters: z.object({
        cities: z.array(z.string()).optional(),
        developers: z.array(z.string()).optional(),
        districts: z.array(z.string()).optional(),
        property_types: z.array(z.string()).optional(),
        statuses: z.array(z.string()).optional(),
        sales_statuses: z.array(z.string()).optional(),
        price_range: z.object({
          min: z.number().optional(),
          max: z.number().optional(),
        }).optional(),
        area_range: z.object({
          min: z.number().optional(),
          max: z.number().optional(),
        }).optional(),
        bedrooms: z.array(z.number()).optional(),
        amenities: z.array(z.string()).optional(),
        facilities: z.array(z.string()).optional(),
        payment_plans: z.array(z.string()).optional(),
        handover_years: z.array(z.number()).optional(),
        delivery_date_range: z.object({
          from: z.string().optional(),
          to: z.string().optional(),
        }).optional(),
      }).optional(),
      sort: z.object({
        field: z.string(),
        direction: z.enum(['asc', 'desc']),
      }).optional(),
      pagination: z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional(),
      include: z.object({
        developer: z.boolean().default(true),
        city: z.boolean().default(true),
        district: z.boolean().default(true),
        images: z.boolean().default(true),
        units: z.boolean().default(false),
        floorPlans: z.boolean().default(false),
      }).optional(),
    });
    
    const validatedBody = advancedSearchSchema.parse(body);
    const { search, filters = {}, sort, pagination = {}, include = {} } = validatedBody;
    
    // Build complex where clause
    const where: any = {};
    const andConditions: any[] = [];
    const orConditions: any[] = [];
    
    // Text search across multiple fields
    if (search) {
      orConditions.push(
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { developer: { name: { contains: search, mode: 'insensitive' } } },
        { city: { name: { contains: search, mode: 'insensitive' } } },
        { district: { name: { contains: search, mode: 'insensitive' } } }
      );
    }
    
    // Multiple city filter
    if (filters.cities && filters.cities.length > 0) {
      andConditions.push({ city: { slug: { in: filters.cities } } });
    }
    
    // Multiple developer filter
    if (filters.developers && filters.developers.length > 0) {
      andConditions.push({ developer: { slug: { in: filters.developers } } });
    }
    
    // Multiple district filter
    if (filters.districts && filters.districts.length > 0) {
      andConditions.push({ district: { slug: { in: filters.districts } } });
    }
    
    // Property types
    if (filters.property_types && filters.property_types.length > 0) {
      andConditions.push({ propertyType: { in: filters.property_types.map(t => t.toUpperCase()) } });
    }
    
    // Statuses
    if (filters.statuses && filters.statuses.length > 0) {
      andConditions.push({ status: { in: filters.statuses.map(s => s.toUpperCase()) } });
    }
    
    if (filters.sales_statuses && filters.sales_statuses.length > 0) {
      andConditions.push({ salesStatus: { in: filters.sales_statuses.map(s => s.toUpperCase()) } });
    }
    
    // Price range
    if (filters.price_range) {
      const priceConditions: any[] = [];
      if (filters.price_range.min) {
        priceConditions.push({ minPrice: { gte: filters.price_range.min } });
      }
      if (filters.price_range.max) {
        priceConditions.push({ maxPrice: { lte: filters.price_range.max } });
      }
      if (priceConditions.length > 0) {
        andConditions.push({ AND: priceConditions });
      }
    }
    
    // Area range
    if (filters.area_range) {
      const areaConditions: any[] = [];
      if (filters.area_range.min) {
        areaConditions.push({ minArea: { gte: filters.area_range.min } });
      }
      if (filters.area_range.max) {
        areaConditions.push({ maxArea: { lte: filters.area_range.max } });
      }
      if (areaConditions.length > 0) {
        andConditions.push({ AND: areaConditions });
      }
    }
    
    // Bedrooms from units
    if (filters.bedrooms && filters.bedrooms.length > 0) {
      andConditions.push({
        units: {
          some: {
            bedrooms: { in: filters.bedrooms }
          }
        }
      });
    }
    
    // Amenities
    if (filters.amenities && filters.amenities.length > 0) {
      andConditions.push({
        amenities: { hasEvery: filters.amenities }
      });
    }
    
    // Facilities
    if (filters.facilities && filters.facilities.length > 0) {
      andConditions.push({
        facilities: { hasEvery: filters.facilities }
      });
    }
    
    // Payment plans
    if (filters.payment_plans && filters.payment_plans.length > 0) {
      andConditions.push({
        paymentPlans: { hasSome: filters.payment_plans }
      });
    }
    
    // Handover years
    if (filters.handover_years && filters.handover_years.length > 0) {
      andConditions.push({
        handoverYear: { in: filters.handover_years }
      });
    }
    
    // Delivery date range
    if (filters.delivery_date_range) {
      const dateConditions: any[] = [];
      if (filters.delivery_date_range.from) {
        dateConditions.push({ deliveryDate: { gte: new Date(filters.delivery_date_range.from) } });
      }
      if (filters.delivery_date_range.to) {
        dateConditions.push({ deliveryDate: { lte: new Date(filters.delivery_date_range.to) } });
      }
      if (dateConditions.length > 0) {
        andConditions.push({ AND: dateConditions });
      }
    }
    
    // Combine conditions
    if (orConditions.length > 0) {
      where.OR = orConditions;
    }
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }
    
    // Build include
    const includeClause: any = {};
    if (include.developer) {
      includeClause.developer = {
        select: { id: true, name: true, slug: true, logo: true }
      };
    }
    if (include.city) {
      includeClause.city = {
        select: { id: true, name: true, slug: true }
      };
    }
    if (include.district) {
      includeClause.district = {
        select: { id: true, name: true, slug: true }
      };
    }
    if (include.images) {
      includeClause.images = {
        where: { tag: { in: ['HERO', 'GALLERY'] } },
        take: 10,
        orderBy: { sortOrder: 'asc' }
      };
    }
    if (include.units) {
      includeClause.units = {
        take: 20,
        orderBy: { price: 'asc' }
      };
    }
    if (include.floorPlans) {
      includeClause.floorPlans = {
        take: 10,
        orderBy: { bedrooms: 'asc' }
      };
    }
    
    // Build orderBy
    let orderBy: any = { createdAt: 'desc' }; // default
    if (sort) {
      orderBy = {};
      orderBy[sort.field] = sort.direction;
    }
    
    // Pagination
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;
    
    // Execute query
    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        include: includeClause,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: properties,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
      filters: {
        applied: Object.keys(filters).length > 0,
        search: !!search,
      }
    });
    
  } catch (error) {
    console.error('Advanced Search API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid search payload',
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Advanced search failed' 
      },
      { status: 500 }
    );
  }
}
