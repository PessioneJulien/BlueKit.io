import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Track component usage
export async function POST(request: NextRequest) {
  console.log('[Community Components Usage API] POST request received');
  
  try {
    const { componentId } = await request.json();
    
    if (!componentId) {
      return NextResponse.json(
        { error: 'Component ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Get current user (optional for usage tracking)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Increment usage count in community_components table
    const { error: updateError } = await supabase
      .from('community_components')
      .update({ 
        usage_count: supabase.sql`usage_count + 1` 
      })
      .eq('id', componentId);
    
    if (updateError) {
      console.error('[Community Components Usage API] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update usage count' },
        { status: 500 }
      );
    }
    
    // Log detailed usage if user is authenticated (optional table)
    if (user) {
      const { error: logError } = await supabase
        .from('component_usage_logs')
        .insert({
          component_id: componentId,
          user_id: user.id,
          used_at: new Date().toISOString()
        });
      
      // Don't fail if logging doesn't work (table might not exist)
      if (logError) {
        console.warn('[Community Components Usage API] Failed to log usage:', logError);
      }
    }
    
    console.log('[Community Components Usage API] Usage tracked successfully for component:', componentId);
    
    return NextResponse.json({
      success: true,
      message: 'Usage tracked successfully'
    });
    
  } catch (error) {
    console.error('[Community Components Usage API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}