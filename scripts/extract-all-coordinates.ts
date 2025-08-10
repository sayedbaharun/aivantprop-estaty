import { config } from 'dotenv';
import { resolve } from 'path';
import { propertySyncService } from '../src/lib/sync';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

async function extractAllCoordinates() {
  console.log('🗺️ EXTRACTING COORDINATES FROM ALL PROPERTIES');
  console.log('⏱️ This may take a few minutes to process 1,552 properties...\n');
  
  const startTime = Date.now();
  
  try {
    // Run full sync to update all properties with coordinate parsing
    const stats = await propertySyncService.syncAll({ 
      full: true, 
      batchSize: 20,
      skipImages: true,  // Skip images to speed up the process
      skipFloorPlans: true  // Skip floor plans to speed up
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n✅ COORDINATE EXTRACTION COMPLETED!');
    console.log(`⏱️ Total time: ${duration} seconds`);
    console.log('📊 Sync statistics:', stats);
    
  } catch (error) {
    console.error('❌ Error during coordinate extraction:', error);
  }
}

extractAllCoordinates();
