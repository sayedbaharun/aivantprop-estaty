/**
 * Check what image and floor plan data we get from Estaty API
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

// Debug environment variables
console.log('ESTATY_BASE_URL:', process.env.ESTATY_BASE_URL);
console.log('ESTATY_API_KEY:', process.env.ESTATY_API_KEY ? '***' + process.env.ESTATY_API_KEY.slice(-4) : 'NOT SET');

import { Estaty } from '../src/lib/estaty';

async function checkApiImages() {
  try {
    console.log('🔍 Checking Estaty API for image and floor plan data...\n');

    // Get a few properties to check their raw data
    const properties = await Estaty.getLatestCreated();
    
    for (let i = 0; i < Math.min(3, properties.length); i++) {
      const property = properties[i];
      console.log(`\n📋 Property: ${property.title} (ID: ${property.id})`);
      
      // Get detailed property data
      const fullProperty = await Estaty.getProperty(property.id);
      
      if (fullProperty) {
        console.log(`\n📸 Images (${fullProperty.images?.length || 0} found):`);
        if (fullProperty.images && fullProperty.images.length > 0) {
          fullProperty.images.slice(0, 3).forEach((img, idx) => {
            console.log(`  ${idx + 1}. URL: ${img.url}`);
            console.log(`     Alt: ${img.alt || 'N/A'}`);
            console.log(`     Tag: ${img.tag || 'N/A'}`);
            console.log('');
          });
        } else {
          console.log('  No images found');
        }

        console.log(`\n📐 Floor Plans (${fullProperty.floor_plans?.length || 0} found):`);
        if (fullProperty.floor_plans && fullProperty.floor_plans.length > 0) {
          fullProperty.floor_plans.slice(0, 3).forEach((plan, idx) => {
            console.log(`  ${idx + 1}. Title: ${plan.title}`);
            console.log(`     Type: ${plan.plan_type}`);
            console.log(`     Image URL: ${plan.image_url || 'N/A'}`);
            console.log(`     PDF URL: ${plan.pdf_url || 'N/A'}`);
            console.log(`     Bedrooms: ${plan.bedrooms || 'N/A'}`);
            console.log(`     Size: ${plan.size || 'N/A'}`);
            console.log('');
          });
        } else {
          console.log('  No floor plans found');
        }

        // Show raw property data structure
        console.log('\n🔍 Raw API Response Keys:');
        console.log(Object.keys(fullProperty).sort());
        
        console.log('\n' + '='.repeat(50));
      }
    }

  } catch (error) {
    console.error('❌ Error checking API images:', error);
  }
}

checkApiImages();
