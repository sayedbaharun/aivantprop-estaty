import { Metadata } from 'next';
import { DeveloperCard, DeveloperCardProps } from '@/components/developer-card';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  BuildingOfficeIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Developers | Off Plan Dub.ai',
  description: 'Explore properties from top UAE developers including Emaar, DAMAC, Sobha, and more.',
};

async function getDevelopers(searchParams: Record<string, string | string[] | undefined>) {
  const search = (searchParams.search as string) || '';
  const sort = (searchParams.sort as string) || 'projects_desc';
  const limit = parseInt((searchParams.limit as string) || '12', 10);
  const offset = parseInt((searchParams.offset as string) || '0', 10);

  try {
    const params = new URLSearchParams({
      search,
      sort,
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/api/developers?${params}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Failed to fetch developers:', error);
    return null;
  }
}

export default async function DevelopersPage({ 
  searchParams 
}: { 
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams;
  const data = await getDevelopers(resolvedSearchParams);
  const developers: DeveloperCardProps[] = data?.data || [];
  const stats = data?.stats || {};

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">UAE Property Developers</h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover premium properties from the UAE&apos;s leading developers
          </p>
          
          {/* Stats */}
          {stats.totalDevelopers && (
            <div className="flex justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <BuildingOfficeIcon className="w-5 h-5" />
                <span>{stats.totalDevelopers} Developers</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5" />
                <span>{stats.totalProjects} Projects</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Avg {stats.avgProjectsPerDeveloper} projects per developer</span>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search developers by name, location, or description..."
                defaultValue={resolvedSearchParams.search as string || ''}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select 
                  defaultValue={resolvedSearchParams.sort as string || 'projects_desc'}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="projects_desc">Most Projects</option>
                  <option value="projects_asc">Least Projects</option>
                  <option value="name_asc">Name A-Z</option>
                  <option value="name_desc">Name Z-A</option>
                </select>
              </div>
              
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Developers Grid */}
        {developers.length > 0 ? (
          <div className="space-y-6">
            {developers.map((developer) => (
              <DeveloperCard key={developer.id} {...developer} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Developers Found</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              We couldn't find any developers matching your criteria. Try adjusting your search or filters.
            </p>
            <button className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              View All Developers
            </button>
          </div>
        )}

        {/* Load More */}
        {data?.pagination?.hasMore && (
          <div className="text-center mt-12">
            <button className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              Load More Developers
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
