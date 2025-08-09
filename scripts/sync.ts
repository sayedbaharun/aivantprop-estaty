import 'dotenv/config';
import { propertySyncService } from '../src/lib/sync';
import { prisma } from '../src/lib/db';

async function main() {
  console.log('Starting full sync...');
  const stats = await propertySyncService.syncAll({ full: true, batchSize: 10 });
  console.log('Sync complete:', stats);
}

main().then(() => prisma.$disconnect()).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
