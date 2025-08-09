/**
 * Developers API Route
 * Handles developer listing and statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const sortBy = searchParams.get('sort') || 'projects_desc'; // projects_desc, projects_asc, name_asc, name_desc

    // Build where clause for search
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { headquarters: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    let orderBy: any = { name: 'asc' }; // default
    switch (sortBy) {
      case 'projects_desc':
        orderBy = { properties: { _count: 'desc' } };
        break;
      case 'projects_asc':
        orderBy = { properties: { _count: 'asc' } };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
    }

    // Fetch developers with property counts
    const [developers, totalCount] = await Promise.all([
      prisma.developer.findMany({
        where,
        include: {
          properties: {
            select: {
              id: true,
              title: true,
              slug: true,
              salesStatus: true,
              minPrice: true,
              maxPrice: true,
              handoverYear: true,
              images: {
                where: { tag: 'HERO' },
                take: 1,
                select: { url: true }
              }
            },
            take: 6, // Preview of properties
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              properties: true
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.developer.count({ where }),
    ]);

    // Transform data for response
    const transformedDevelopers = developers.map(dev => ({
      id: dev.id,
      name: dev.name,
      slug: dev.slug,
      logo: dev.logo,
      description: dev.description,
      website: dev.website,
      phone: dev.phone,
      email: dev.email,
      headquarters: dev.headquarters,
      totalProjects: dev._count.properties,
      featuredProperties: dev.properties.map(prop => ({
        id: prop.id,
        title: prop.title,
        slug: prop.slug,
        salesStatus: prop.salesStatus,
        minPrice: prop.minPrice,
        maxPrice: prop.maxPrice,
        handoverYear: prop.handoverYear,
        heroImage: prop.images[0]?.url || null,
      })),
    }));

    // Calculate statistics
    const stats = {
      totalDevelopers: totalCount,
      totalProjects: await prisma.property.count(),
      avgProjectsPerDeveloper: totalCount > 0 ? Math.round((await prisma.property.count()) / totalCount) : 0,
    };

    return NextResponse.json({
      success: true,
      data: transformedDevelopers,
      pagination: {
        total: totalCount,
        offset,
        limit,
        hasMore: offset + limit < totalCount,
      },
      stats,
    });

  } catch (error) {
    console.error('Developers API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch developers' },
      { status: 500 }
    );
  }
}