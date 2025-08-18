import { prisma } from '@/lib/db';

export async function StatsSection() {
  // During build time, fetch data directly from database instead of API
  let stats = null;
  let total = 0;
  
  try {
    const [developers, cities, districts, properties] = await Promise.all([
      prisma.developer.count(),
      prisma.city.count(),
      prisma.district.count(),
      prisma.property.count(),
    ]);
    
    stats = { developers, cities, districts };
    total = properties;
  } catch (error) {
    // Fallback to default values if database is not available
    console.error('Failed to fetch stats:', error);
    stats = { developers: 0, cities: 0, districts: 0 };
    total = 0;
  }

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