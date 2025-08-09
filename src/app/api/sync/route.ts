/**
 * Sync API Route
 * Handles data synchronization from Estaty API
 */

import { NextRequest, NextResponse } from 'next/server';
import { propertySyncService } from '@/lib/sync';
import { z } from 'zod';

// Validation schema for sync parameters
const syncParamsSchema = z.object({
  type: z.enum(['full', 'incremental']).default('incremental'),
  force: z.boolean().default(false),
  batch_size: z.number().min(1).max(100).default(10),
  include_drafts: z.boolean().default(false),
  skip_images: z.boolean().default(false),
  skip_floor_plans: z.boolean().default(false),
});

// Rate limiting (simple in-memory)
const syncLocks = new Map();
const SYNC_COOLDOWN = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    // Check if sync is already running
    const now = Date.now();
    const lastSync = syncLocks.get('sync');
    
    if (lastSync && (now - lastSync) < SYNC_COOLDOWN) {
      const remainingTime = Math.ceil((SYNC_COOLDOWN - (now - lastSync)) / 1000);
      return NextResponse.json(
        { 
          success: false, 
          error: `Sync is rate limited. Try again in ${remainingTime} seconds.`,
          retryAfter: remainingTime
        },
        { status: 429 }
      );
    }
    
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const params = syncParamsSchema.parse(body);
    
    // Set sync lock
    syncLocks.set('sync', now);
    
    let stats;
    
    if (params.type === 'full') {
      console.log('🚀 Starting full synchronization...');
      stats = await propertySyncService.syncAll({
        full: true,
        batchSize: params.batch_size,
        includeDrafts: params.include_drafts,
        skipImages: params.skip_images,
        skipFloorPlans: params.skip_floor_plans,
      });
    } else {
      console.log('🔄 Starting incremental synchronization...');
      stats = await propertySyncService.syncLatestUpdates();
    }
    
    // Clear sync lock
    syncLocks.delete('sync');
    
    return NextResponse.json({
      success: true,
      data: stats,
      message: `${params.type === 'full' ? 'Full' : 'Incremental'} sync completed successfully`,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    // Clear sync lock on error
    syncLocks.delete('sync');
    
    console.error('Sync API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid sync parameters',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Synchronization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for sync status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('include_stats') === 'true';
    
    // Check if sync is running
    const now = Date.now();
    const lastSync = syncLocks.get('sync');
    const isRunning = lastSync && (now - lastSync) < SYNC_COOLDOWN;
    
    let stats = null;
    if (includeStats) {
      // Get database statistics
      const { getDatabaseStats } = await import('@/lib/db');
      stats = await getDatabaseStats();
    }
    
    return NextResponse.json({
      success: true,
      data: {
        isRunning,
        lastSyncTime: lastSync ? new Date(lastSync).toISOString() : null,
        cooldownRemaining: isRunning ? Math.ceil((SYNC_COOLDOWN - (now - lastSync!)) / 1000) : 0,
        stats,
      }
    });
    
  } catch (error) {
    console.error('Sync Status API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
