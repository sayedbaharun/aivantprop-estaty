// Test Estaty API connection
const ESTATY_BASE_URL = "https://api.estaty.app";
const ESTATY_API_KEY = "a1b60171c1f8d972290552bfd6138b72";

async function testEstatyAPI() {
  try {
    console.log('Testing Estaty API connection...\n');
    
    // Test getting latest properties
    const response = await fetch(`${ESTATY_BASE_URL}/api/v1/latestCreatedProperties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'App-key': ESTATY_API_KEY
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Estaty API connection successful!');
    console.log(`Found ${data.properties?.length || 0} latest properties\n`);
    
    if (data.properties && data.properties.length > 0) {
      console.log('Sample property:');
      const sample = data.properties[0];
      console.log(`- Title: ${sample.title}`);
      console.log(`- Developer ID: ${sample.developer_company_id}`);
      console.log(`- City ID: ${sample.city_id}`);
      console.log(`- Status: ${sample.status}`);
      console.log(`- Price: ${sample.min_price} - ${sample.max_price} ${sample.currency}`);
    }
    
  } catch (error) {
    console.error('❌ Estaty API test failed:', error.message);
  }
}

testEstatyAPI();