import { PropertyCard, type PropertyCardProps } from './property-card';
import { prisma } from '@/lib/db';

type Property = PropertyCardProps['property'];

export async function FeaturedProperties() {
  let properties: Property[] = [];
  
  try {
    const dbProperties = await prisma.property.findMany({
      take: 6,
      where: {
        salesStatus: {
          in: ['AVAILABLE', 'LIMITED_AVAILABILITY', 'COMING_SOON']
        }
      },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
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
        { salesStatus: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    
    // Transform to match PropertyCard expected format
    properties = dbProperties.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      developer: p.developer ? {
        id: p.developer.id,
        name: p.developer.name,
        slug: p.developer.slug,
      } : undefined,
      city: p.city ? {
        id: p.city.id,
        name: p.city.name,
        slug: p.city.slug,
      } : undefined,
      district: p.district ? {
        id: p.district.id,
        name: p.district.name,
        slug: p.district.slug,
      } : undefined,
      salesStatus: p.salesStatus,
      status: p.status,
      propertyType: p.propertyType,
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      minArea: p.minArea,
      maxArea: p.maxArea,
      currency: p.currency,
      areaUnit: p.areaUnit,
      handoverYear: p.handoverYear,
      handoverQuarter: p.handoverQuarter,
      latitude: p.latitude,
      longitude: p.longitude,
      heroImage: p.images[0]?.url || null,
      unitCount: p._count.units,
      floorPlanCount: p._count.floorPlans,
      amenities: p.amenities || [],
      facilities: p.facilities || [],
      paymentPlans: p.paymentPlans || [],
    }));
  } catch (error) {
    console.error('Failed to fetch featured properties:', error);
    properties = [];
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((p: Property) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  );
}