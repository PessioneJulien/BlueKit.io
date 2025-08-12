import { NextRequest, NextResponse } from 'next/server';
import { dataMigrationService } from '@/lib/services/data-migration';
import { createServerClient } from '@/lib/supabase/server';

// Admin check middleware
async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== 'julien.pessione83@gmail.com') {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// GET /api/admin/migrate - Get migration status
export async function GET(_request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const [status, schemaValidation] = await Promise.all([
      dataMigrationService.getMigrationStatus(),
      dataMigrationService.validateDatabaseSchema()
    ]);

    return NextResponse.json({
      migration_status: status,
      schema_validation: schemaValidation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/admin/migrate:', error);
    return NextResponse.json(
      {
        error: 'Failed to get migration status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/migrate - Run migration
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, options } = body;

    switch (action) {
      case 'migrate_all':
        console.log('Starting full migration...');
        const migrationResult = await dataMigrationService.migrateStacksToDatabase();
        
        return NextResponse.json({
          action: 'migrate_all',
          result: migrationResult,
          timestamp: new Date().toISOString()
        });

      case 'validate_schema':
        const schemaValidation = await dataMigrationService.validateDatabaseSchema();
        
        return NextResponse.json({
          action: 'validate_schema',
          result: schemaValidation,
          timestamp: new Date().toISOString()
        });

      case 'clear_all':
        if (!options?.confirm) {
          return NextResponse.json(
            { error: 'Confirmation required for destructive operation' },
            { status: 400 }
          );
        }
        
        console.log('WARNING: Clearing all stacks from database...');
        const clearedCount = await dataMigrationService.clearAllStacks();
        
        return NextResponse.json({
          action: 'clear_all',
          result: { cleared_count: clearedCount },
          timestamp: new Date().toISOString()
        });

      case 'sync_single':
        if (!options?.stack_id) {
          return NextResponse.json(
            { error: 'stack_id required for sync_single action' },
            { status: 400 }
          );
        }
        
        await dataMigrationService.syncStack(options.stack_id);
        
        return NextResponse.json({
          action: 'sync_single',
          result: { stack_id: options.stack_id, status: 'synced' },
          timestamp: new Date().toISOString()
        });

      case 'generate_sql':
        const sql = dataMigrationService.generateSQLInserts();
        
        return NextResponse.json({
          action: 'generate_sql',
          result: { sql },
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in POST /api/admin/migrate:', error);
    
    return NextResponse.json(
      {
        error: 'Migration operation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}