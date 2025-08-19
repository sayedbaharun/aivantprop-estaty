import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Count properties
    const propertyCount = await prisma.property.count();
    
    // Get first 3 properties
    const sampleProperties = await prisma.property.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
      }
    });
    
    // Check environment variables (without exposing sensitive data)
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      ESTATY_BASE_URL: !!process.env.ESTATY_BASE_URL,
      ESTATY_API_KEY: !!process.env.ESTATY_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
    };
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        propertyCount,
        sampleProperties,
      },
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        DIRECT_URL: !!process.env.DIRECT_URL,
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: !!process.env.VERCEL,
      },
    }, { status: 500 });
  }
}