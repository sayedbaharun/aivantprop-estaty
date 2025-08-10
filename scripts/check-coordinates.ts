import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function checkCoordinatesCoverage() {
  try {
    console.log('🗺️ CHECKING COORDINATE DATA COVERAGE\n');

    // Total properties
    const totalProperties = await prisma.property.count();
    console.log(`📊 Total Properties: ${totalProperties}`);

    // Properties with coordinates
    const propertiesWithCoords = await prisma.property.findMany({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      },
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        city: { select: { name: true } },
        district: { select: { name: true } },
        developer: { select: { name: true } }
      },
      take: 15
    });

    const coordsCount = await prisma.property.count({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      }
    });

    const coordsPercentage = ((coordsCount / totalProperties) * 100).toFixed(1);
    console.log(`📍 Properties with Coordinates: ${coordsCount}/${totalProperties} (${coordsPercentage}%)\n`);

    if (coordsCount > 0) {
      console.log('📍 SAMPLE PROPERTIES WITH COORDINATES:');
      console.log('=' .repeat(60));
      
      propertiesWithCoords.forEach((property, index) => {
        console.log(`${index + 1}. ${property.title}`);
        console.log(`   📍 Coordinates: ${property.latitude}, ${property.longitude}`);
        console.log(`   🏢 Developer: ${property.developer?.name || 'Unknown'}`);
        console.log(`   🌍 Location: ${property.city?.name}${property.district ? `, ${property.district.name}` : ''}`);
        console.log('');
      });

      // Check coordinate distribution by city
      console.log('🌍 COORDINATE COVERAGE BY CITY:');
      console.log('=' .repeat(60));
      
      const cityStats = await prisma.city.findMany({
        select: {
          name: true,
          _count: {
            select: {
              properties: true
            }
          }
        }
      });

      for (const city of cityStats) {
        const cityPropsWithCoords = await prisma.property.count({
          where: {
            AND: [
              { cityId: { not: null } },
              { city: { name: city.name } },
              { latitude: { not: null } },
              { longitude: { not: null } }
            ]
          }
        });

        const cityPercentage = city._count.properties > 0 
          ? ((cityPropsWithCoords / city._count.properties) * 100).toFixed(1)
          : '0.0';

        console.log(`${city.name}: ${cityPropsWithCoords}/${city._count.properties} (${cityPercentage}%)`);
      }

      // Check some coordinates ranges to verify they're Dubai coordinates
      console.log('\n🔍 COORDINATE VALIDATION:');
      console.log('=' .repeat(60));
      
      const coordRanges = await prisma.property.aggregate({
        where: {
          AND: [
            { latitude: { not: null } },
            { longitude: { not: null } }
          ]
        },
        _min: {
          latitude: true,
          longitude: true
        },
        _max: {
          latitude: true,
          longitude: true
        },
        _avg: {
          latitude: true,
          longitude: true
        }
      });

      console.log(`Latitude Range: ${coordRanges._min.latitude} to ${coordRanges._max.latitude}`);
      console.log(`Longitude Range: ${coordRanges._min.longitude} to ${coordRanges._max.longitude}`);
      console.log(`Average Center: ${coordRanges._avg.latitude?.toFixed(4)}, ${coordRanges._avg.longitude?.toFixed(4)}`);
      
      // Dubai coordinates reference: Lat 25.0-25.4, Lng 54.8-55.6
      const dubaiLat = coordRanges._avg.latitude && coordRanges._avg.latitude >= 24.5 && coordRanges._avg.latitude <= 25.5;
      const dubaiLng = coordRanges._avg.longitude && coordRanges._avg.longitude >= 54.5 && coordRanges._avg.longitude <= 56.0;
      
      if (dubaiLat && dubaiLng) {
        console.log('✅ Coordinates appear to be valid Dubai locations!');
      } else {
        console.log('⚠️  Coordinates may need validation - outside typical Dubai range');
      }

    } else {
      console.log('❌ No properties found with coordinate data');
      console.log('💡 This could mean:');
      console.log('   - Estaty API doesn\'t provide coordinates for current properties');
      console.log('   - Sync process needs to be updated');
      console.log('   - Coordinates are stored in different fields');
    }

    // Check if cities/districts have coordinates
    console.log('\n🌍 CITY/DISTRICT COORDINATE COVERAGE:');
    console.log('=' .repeat(60));

    const citiesWithCoords = await prisma.city.count({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      }
    });

    const totalCities = await prisma.city.count();
    console.log(`Cities with coordinates: ${citiesWithCoords}/${totalCities}`);

    const districtsWithCoords = await prisma.district.count({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      }
    });

    const totalDistricts = await prisma.district.count();
    console.log(`Districts with coordinates: ${districtsWithCoords}/${totalDistricts}`);

  } catch (error) {
    console.error('❌ Error checking coordinates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCoordinatesCoverage();
