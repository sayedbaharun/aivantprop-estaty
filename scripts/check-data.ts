/**
 * Quick data verification script
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    // Count records
    const propertyCount = await prisma.property.count();
    const developerCount = await prisma.developer.count();
    const cityCount = await prisma.city.count();
    const districtCount = await prisma.district.count();

    console.log('📊 Database Summary:');
    console.log(`🏗️  Properties: ${propertyCount}`);
    console.log(`🏢 Developers: ${developerCount}`);
    console.log(`🏙️  Cities: ${cityCount}`);
    console.log(`📍 Districts: ${districtCount}`);

    // Sample properties
    console.log('\n🏗️  Sample Properties:');
    const sampleProperties = await prisma.property.findMany({
      take: 5,
      select: {
        title: true,
        status: true,
        salesStatus: true,
        minPrice: true,
        maxPrice: true,
        currency: true,
        developer: {
          select: { name: true }
        },
        city: {
          select: { name: true }
        }
      }
    });

    sampleProperties.forEach((prop, i) => {
      console.log(`${i + 1}. ${prop.title}`);
      console.log(`   Developer: ${prop.developer.name}`);
      console.log(`   City: ${prop.city.name}`);
      console.log(`   Status: ${prop.status} / ${prop.salesStatus}`);
      if (prop.minPrice && prop.maxPrice) {
        console.log(`   Price: ${prop.minPrice.toLocaleString()} - ${prop.maxPrice.toLocaleString()} ${prop.currency}`);
      }
      console.log('');
    });

    // Cities breakdown
    console.log('🏙️  Cities:');
    const cities = await prisma.city.findMany({
      select: {
        name: true,
        _count: {
          select: { properties: true }
        }
      },
      orderBy: {
        properties: { _count: 'desc' }
      }
    });

    cities.forEach(city => {
      console.log(`   ${city.name}: ${city._count.properties} properties`);
    });

    // Top developers
    console.log('\n🏢 Top Developers:');
    const developers = await prisma.developer.findMany({
      take: 10,
      select: {
        name: true,
        _count: {
          select: { properties: true }
        }
      },
      orderBy: {
        properties: { _count: 'desc' }
      }
    });

    developers.forEach(dev => {
      console.log(`   ${dev.name}: ${dev._count.properties} properties`);
    });

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
