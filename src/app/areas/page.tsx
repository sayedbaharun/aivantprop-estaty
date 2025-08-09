import { Metadata } from 'next';
import Link from 'next/link';
import { AreaImage } from '@/components/area-image';

export const metadata: Metadata = {
  title: 'Areas | Off Plan Dub.ai',
  description: 'Explore properties by location across Dubai, Abu Dhabi, Sharjah and other UAE emirates.',
};

export default function AreasPage() {
  const areas = [
    { 
      name: 'Dubai Marina', 
      count: 145, 
      image: '/images/areas/dubai-marina.jpg',
      description: 'Waterfront living with stunning marina views'
    },
    { 
      name: 'Downtown Dubai', 
      count: 98, 
      image: '/images/areas/downtown-dubai.jpg',
      description: 'Heart of Dubai with Burj Khalifa and Dubai Mall'
    },
    { 
      name: 'Business Bay', 
      count: 127, 
      image: '/images/areas/business-bay.jpg',
      description: 'Central business district with canal views'
    },
    { 
      name: 'Jumeirah Village Circle', 
      count: 89, 
      image: '/images/areas/jumeirah-village-circle.jpg',
      description: 'Family-friendly community with parks and amenities'
    },
    { 
      name: 'Dubai South', 
      count: 67, 
      image: '/images/areas/dubai-south.jpg',
      description: 'Future city near Al Maktoum International Airport'
    },
    { 
      name: 'Al Barsha', 
      count: 43, 
      image: '/images/areas/al-barsha.jpg',
      description: 'Established community near Mall of the Emirates'
    },
    { 
      name: 'Palm Jumeirah', 
      count: 78, 
      image: '/images/areas/palm-jumeirah.jpg',
      description: 'Iconic palm-shaped island with luxury beachfront living'
    },
    { 
      name: 'Jumeirah Lake Towers', 
      count: 156, 
      image: '/images/areas/jumeirah-lake-towers.jpg',
      description: 'Modern towers surrounding beautiful lakes'
    },
    { 
      name: 'Dubai Hills Estate', 
      count: 92, 
      image: '/images/areas/dubai-hills-estate.jpg',
      description: 'Green community with golf course and parks'
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse by Location</h1>
          <p className="text-xl text-gray-600">
            Find your perfect property in Dubai&apos;s most sought-after neighborhoods
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {areas.map((area) => (
            <Link 
              key={area.name} 
              href={`/properties?location=${encodeURIComponent(area.name)}`}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group block"
            >
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <AreaImage 
                  src={area.image} 
                  alt={area.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium">
                    {area.count} properties
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                  {area.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{area.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{area.count} properties available</span>
                  <span className="text-sm text-gray-900 font-medium group-hover:text-gray-700 transition-colors">
                    Explore →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-2xl shadow-lg p-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">More Areas Coming Soon</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            We&apos;re expanding our coverage to include more areas across the UAE including Abu Dhabi, Sharjah, and other emirates.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="px-3 py-1 bg-gray-100 rounded-full">Abu Dhabi</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">Sharjah</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">Ajman</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">Ras Al Khaimah</span>
          </div>
        </div>
      </div>
    </main>
  );
}
