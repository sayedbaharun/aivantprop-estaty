/**
 * Database client and connection management
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  await prisma.$disconnect();
}

// Database statistics
export async function getDatabaseStats(): Promise<{
  developers: number;
  cities: number;
  districts: number;
  properties: number;
  units: number;
  images: number;
  floorPlans: number;
}> {
  const [
    developers,
    cities,
    districts,
    properties,
    units,
    images,
    floorPlans,
  ] = await Promise.all([
    prisma.developer.count(),
    prisma.city.count(),
    prisma.district.count(),
    prisma.property.count(),
    prisma.unit.count(),
    prisma.propertyImage.count(),
    prisma.floorPlan.count(),
  ]);

  return {
    developers,
    cities,
    districts,
    properties,
    units,
    images,
    floorPlans,
  };
}
