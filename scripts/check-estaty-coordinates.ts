import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const BASE_URL = process.env.ESTATY_BASE_URL!;
const API_KEY = process.env.ESTATY_API_KEY!;

if (!BASE_URL || !API_KEY) {
  console.error('❌ Missing Estaty API configuration');
  process.exit(1);
}

async function checkEstatyCoordinates() {
  try {
    console.log('🔍 CHECKING ESTATY API FOR COORDINATE DATA\n');

    // Get a few properties to examine
    console.log('📡 Fetching sample properties from Estaty API...');
    
    const response = await fetch(`${BASE_URL}/api/v1/latestCreatedProperties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'App-key': API_KEY,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const properties = data.properties || data;
    console.log(`✅ Retrieved ${properties?.length || 0} properties from API\n`);

    if (properties && properties.length > 0) {
      console.log('🗺️ COORDINATE DATA ANALYSIS:');
      console.log('=' .repeat(70));

      // Check first 5 properties for coordinate data
      const samplesToCheck = Math.min(5, properties.length);
      let propertiesWithCoords = 0;
      let propertiesWithoutCoords = 0;

      for (let i = 0; i < samplesToCheck; i++) {
        const property = properties[i];
        
        console.log(`\n${i + 1}. ${property.title || 'Untitled Property'}`);
        console.log(`   ID: ${property.id}`);
        console.log(`   Developer ID: ${property.developer_company_id || 'N/A'}`);
        console.log(`   City ID: ${property.city_id || 'N/A'}`);
        
        // Check for coordinate fields
        const hasLat = property.latitude !== null && property.latitude !== undefined;
        const hasLng = property.longitude !== null && property.longitude !== undefined;
        
        if (hasLat && hasLng) {
          console.log(`   📍 Coordinates: ${property.latitude}, ${property.longitude} ✅`);
          propertiesWithCoords++;
        } else {
          console.log(`   📍 Coordinates: ${property.latitude || 'null'}, ${property.longitude || 'null'} ❌`);
          propertiesWithoutCoords++;
        }

        // Check for other location-related fields
        console.log(`   📍 Address: ${property.address || 'N/A'}`);
        
        // Show all keys for the first property to see what's available
        if (i === 0) {
          console.log('\n🔍 AVAILABLE FIELDS IN PROPERTY OBJECT:');
          console.log('─'.repeat(50));
          const keys = Object.keys(property);
          keys.forEach(key => {
            const value = property[key];
            const type = typeof value;
            const preview = type === 'object' ? (Array.isArray(value) ? `Array(${value?.length || 0})` : 'Object') : String(value).substring(0, 50);
            console.log(`   ${key}: ${type} = ${preview}${String(value).length > 50 ? '...' : ''}`);
          });
        }
      }

      console.log('\n📊 COORDINATE SUMMARY:');
      console.log('=' .repeat(70));
      console.log(`Properties with coordinates: ${propertiesWithCoords}/${samplesToCheck}`);
      console.log(`Properties without coordinates: ${propertiesWithoutCoords}/${samplesToCheck}`);
      
      const percentage = ((propertiesWithCoords / samplesToCheck) * 100).toFixed(1);
      console.log(`Coordinate coverage: ${percentage}%`);

      if (propertiesWithCoords === 0) {
        console.log('\n💡 POSSIBLE REASONS FOR MISSING COORDINATES:');
        console.log('1. Estaty API doesn\'t provide coordinates in the latest created endpoint');
        console.log('2. Coordinates might be available in individual property details');
        console.log('3. Coordinates might be in a different field name');
        console.log('4. API version or endpoint might need updating');
      }

    } else {
      console.log('❌ No properties returned from API');
    }

    // Also check a specific property detail if we have an ID
    if (properties && properties.length > 0 && properties[0].id) {
      console.log('\n🔍 CHECKING INDIVIDUAL PROPERTY DETAILS:');
      console.log('=' .repeat(70));
      
      const propertyId = properties[0].id;
      console.log(`Fetching detailed info for property ID: ${propertyId}`);

      const detailResponse = await fetch(`${BASE_URL}/api/v1/getProperty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'App-key': API_KEY,
        },
        body: JSON.stringify({
          id: propertyId,
        }),
      });

      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        const propertyDetail = detailData.property || detailData;

        console.log(`\n📍 DETAILED PROPERTY COORDINATE DATA:`);
        console.log(`Title: ${propertyDetail.title || 'N/A'}`);
        console.log(`Latitude: ${propertyDetail.latitude || 'null'}`);
        console.log(`Longitude: ${propertyDetail.longitude || 'null'}`);
        console.log(`Address: ${propertyDetail.address || 'N/A'}`);

        // Look for alternative coordinate field names
        const altFields = ['lat', 'lng', 'geo_lat', 'geo_lng', 'location_lat', 'location_lng'];
        console.log('\n🔍 Checking alternative coordinate field names:');
        altFields.forEach(field => {
          if (propertyDetail[field] !== undefined) {
            console.log(`   ${field}: ${propertyDetail[field]}`);
          }
        });

      } else {
        console.log('❌ Failed to fetch individual property details');
      }
    }

  } catch (error) {
    console.error('❌ Error checking Estaty coordinates:', error);
  }
}

checkEstatyCoordinates();
