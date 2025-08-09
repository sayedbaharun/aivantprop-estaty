import { PropertyCard } from '@/components/property-card';

async function getData(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => {
    if (!v) return;
    if (Array.isArray(v)) params.set(k, v[0]); else params.set(k, v);
  });
  params.set('include_developer', 'true');
  params.set('include_city', 'true');
  params.set('include_images', 'true');
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/properties?` + params.toString(), { cache: 'no-store' });
  if (!res.ok) return { data: [], pagination: { totalCount: 0 } } as any;
  return res.json();
}

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedSearchParams = await searchParams;
  const data = await getData(resolvedSearchParams);
  const properties = data?.data || [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6">Properties</h1>
      {properties.length === 0 ? (
        <div className="text-gray-600">No properties found. Try adjusting your filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((p: any) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </main>
  );
}
