/**
 * Check for duplicate images across properties
 */

import 'dotenv/config';
import { prisma } from '../src/lib/db';

async function main() {
  console.log('Checking for duplicate images...\n');

  // Find duplicate image URLs
  const duplicateImages = await prisma.$queryRaw`
    SELECT url, COUNT(*) as count, 
           ARRAY_AGG(DISTINCT property_id) as property_ids
    FROM property_images
    GROUP BY url
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
    LIMIT 20
  ` as Array<{url: string, count: bigint, property_ids: string[]}>;

  if (duplicateImages.length === 0) {
    console.log('✅ No duplicate images found!');
    return;
  }

  console.log(`🔍 Found ${duplicateImages.length} duplicate image URLs:\n`);

  for (const dup of duplicateImages) {
    console.log(`📸 ${dup.url}`);
    console.log(`   Used in ${Number(dup.count)} properties: ${dup.property_ids.join(', ')}`);
    
    // Get property titles for these IDs
    const properties = await prisma.property.findMany({
      where: { id: { in: dup.property_ids } },
      select: { id: true, title: true, externalId: true }
    });
    
    properties.forEach(prop => {
      console.log(`   - ${prop.title} (ID: ${prop.externalId})`);
    });
    console.log('');
  }

  // Check total unique vs total images
  const totalImages = await prisma.propertyImage.count();
  const uniqueImages = await prisma.propertyImage.groupBy({
    by: ['url'],
    _count: true
  });

  console.log(`📊 Statistics:`);
  console.log(`   Total images: ${totalImages}`);
  console.log(`   Unique URLs: ${uniqueImages.length}`);
  console.log(`   Duplicate images: ${totalImages - uniqueImages.length}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });