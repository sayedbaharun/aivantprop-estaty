import { PropertyCard, type PropertyCardProps } from './property-card';

type Property = PropertyCardProps['property'];

export async function FeaturedProperties() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/properties?limit=6&include_developer=true&include_city=true&include_images=true`, { next: { revalidate: 300 } });
  const json = await res.json();
  const properties = json?.data || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((p: Property) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  );
}
