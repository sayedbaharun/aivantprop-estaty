import { prisma } from '@/lib/db';
import Link from 'next/link';

export async function DeveloperShowcase() {
  let developers: any[] = [];
  
  try {
    developers = await prisma.developer.findMany({
      take: 12,
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        _count: {
          select: {
            properties: true
          }
        }
      },
      orderBy: {
        properties: {
          _count: 'desc'
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch developers:', error);
    developers = [];
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
      {developers.map((d) => (
        <Link key={d.id} href={`/developers/${d.slug}`} className="bg-white rounded-xl p-6 shadow-lg flex flex-col items-center gap-3 hover:shadow-xl transition-shadow">
          {d.logo ? (
            <img src={d.logo} alt={d.name} className="h-10 object-contain" />
          ) : (
            <div className="h-10 w-24 bg-gray-100 rounded" />
          )}
          <span className="text-sm font-medium text-gray-900 text-center line-clamp-2">{d.name}</span>
        </Link>
      ))}
    </div>
  );
}