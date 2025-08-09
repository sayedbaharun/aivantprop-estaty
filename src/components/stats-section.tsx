export async function StatsSection() {
  const [syncRes, propertiesCount] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/sync?include_stats=true`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => null),
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/properties?limit=1`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => null),
  ]);

  const stats = syncRes?.data?.stats || null;
  const total = propertiesCount?.pagination?.totalCount || 0;

  return (
    <section className="py-12 lg:py-16 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-gray-900">{total.toLocaleString('en-AE')}</p>
            <p className="mt-1 text-sm text-gray-600">Properties</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{(stats?.developers || 0).toLocaleString('en-AE')}</p>
            <p className="mt-1 text-sm text-gray-600">Developers</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{(stats?.cities || 0).toLocaleString('en-AE')}</p>
            <p className="mt-1 text-sm text-gray-600">Cities</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{(stats?.districts || 0).toLocaleString('en-AE')}</p>
            <p className="mt-1 text-sm text-gray-600">Districts</p>
          </div>
        </div>
      </div>
    </section>
  );
}
