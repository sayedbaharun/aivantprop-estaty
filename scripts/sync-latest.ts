/**
 * Sync only the latest properties from Estaty API
 */

import 'dotenv/config';
import { propertySyncService } from '../src/lib/sync';
import { prisma } from '../src/lib/db';

async function main() {
  console.log('Starting incremental sync for latest properties...');
  
  try {
    // Just sync the latest updates (won't fail on district issues)
    const stats = await propertySyncService.syncLatestUpdates();
    console.log('Sync complete:', stats);
    
    // Show current database stats
    const count = await prisma.property.count();
    console.log(`\nTotal properties in database: ${count}`);
    
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });