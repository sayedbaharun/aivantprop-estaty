# Estaty API Sync Documentation

## Overview
This document describes how to sync property data from the Estaty API to the database.

## Environment Variables
Add the following to your environment variables (Vercel or local):

```env
ESTATY_BASE_URL="https://panel.estaty.app"
ESTATY_API_KEY="a1b60171c1f8d972290552bfd6138b72"
```

## Available Sync Commands

### 1. Incremental Sync (Recommended)
Syncs only the latest created and updated properties:
```bash
npm run sync:latest
```
- Fetches the 10 most recently created properties
- Fetches the 10 most recently updated properties
- Adds images and floor plans for each property
- Takes approximately 2 minutes to complete

### 2. Full Sync
Syncs all properties from Estaty (use with caution):
```bash
npm run sync
```
- Syncs all filters (developers, cities, districts)
- Syncs all properties with details
- May take significant time to complete
- May encounter district validation errors

## Running Sync on Vercel

### Option 1: GitHub Actions (Recommended)
Create `.github/workflows/sync.yml`:
```yaml
name: Sync Properties
on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
  workflow_dispatch: # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run sync:latest
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
          ESTATY_BASE_URL: ${{ secrets.ESTATY_BASE_URL }}
          ESTATY_API_KEY: ${{ secrets.ESTATY_API_KEY }}
```

### Option 2: Manual Sync via Vercel Functions
Create `app/api/sync/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { propertySyncService } from '@/lib/sync';

export async function POST(req: Request) {
  try {
    // Verify auth token (implement your auth)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await propertySyncService.syncLatestUpdates();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
```

Then trigger via cron job or manually:
```bash
curl -X POST https://your-site.vercel.app/api/sync \
  -H "Authorization: Bearer YOUR_SYNC_SECRET"
```

## Sync Results
After running the sync, you'll see statistics like:
- Properties created/updated
- Images added
- Floor plans added
- Total time taken
- Any errors encountered

## Current Database Status
- Total properties: 1,562
- Last sync: Successfully added 20 new properties
- Images: 222 new images added
- Floor plans: 45 new floor plans added

## Troubleshooting

### District Validation Errors
If you encounter district validation errors during full sync:
- Use `npm run sync:latest` instead (bypasses district sync)
- Districts will be created on-demand when properties reference them

### Connection Issues
Ensure environment variables are properly set:
- `DATABASE_URL`: Supabase pooler connection
- `DIRECT_URL`: Direct Supabase connection
- `ESTATY_BASE_URL`: Must be `https://panel.estaty.app`
- `ESTATY_API_KEY`: Your API key

### Rate Limiting
The sync service includes built-in delays between batches to respect API rate limits.