import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Direct database connection test
    const { PrismaClient } = require('@prisma/client');
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Test connection and count properties
    const count = await prisma.property.count();
    const properties = await prisma.property.findMany({ take: 3 });
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      database_url: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      direct_url: process.env.DIRECT_URL ? 'SET' : 'NOT SET',
      node_env: process.env.NODE_ENV,
      property_count: count,
      sample_properties: properties.map(p => ({ id: p.id, title: p.title })),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      database_url: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      direct_url: process.env.DIRECT_URL ? 'SET' : 'NOT SET',
      node_env: process.env.NODE_ENV,
    }, { status: 500 });
  }
}