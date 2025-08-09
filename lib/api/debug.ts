import { createClient } from '@/lib/supabase/client';

export const debugApi = {
  async checkUserLikes(userId?: string): Promise<void> {
    const supabase = createClient();
    
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      targetUserId = user?.id;
    }
    
    if (!targetUserId) {
      console.log('❌ No user to check likes for');
      return;
    }
    
    console.log('🔍 Checking likes for user:', targetUserId);
    
    // Get all likes for this user
    const { data: likes, error } = await supabase
      .from('component_likes')
      .select(`
        id,
        component_id,
        created_at,
        components (
          name
        )
      `)
      .eq('user_id', targetUserId);
    
    if (error) {
      console.error('❌ Error fetching likes:', error);
      return;
    }
    
    console.log(`✅ Found ${likes.length} likes in database:`);
    likes.forEach(like => {
      const componentName = (like as { components?: { name?: string } }).components?.name || 'Unknown';
      console.log(`  - ${componentName} (${like.component_id}) at ${like.created_at}`);
    });
  },

  async checkComponentLikes(componentId: string): Promise<void> {
    const supabase = createClient();
    
    console.log('🔍 Checking likes for component:', componentId);
    
    // Get all likes for this component
    const { data: likes, error } = await supabase
      .from('component_likes')
      .select('id, user_id, created_at')
      .eq('component_id', componentId);
    
    if (error) {
      console.error('❌ Error fetching component likes:', error);
      return;
    }
    
    console.log(`✅ Component has ${likes.length} likes:`);
    likes.forEach((like, index) => {
      console.log(`  ${index + 1}. User: ${like.user_id} at ${like.created_at}`);
    });
    
    // Also check the component's likes_count
    const { data: component, error: compError } = await supabase
      .from('components')
      .select('likes_count, name')
      .eq('id', componentId)
      .single();
    
    if (compError) {
      console.error('❌ Error fetching component:', compError);
      return;
    }
    
    console.log(`📊 Component "${component.name}" has likes_count: ${component.likes_count}`);
    
    if (component.likes_count !== likes.length) {
      console.warn(`⚠️ MISMATCH! Database has ${likes.length} actual likes but likes_count is ${component.likes_count}`);
    }
  },

  async syncAllLikesCount(): Promise<void> {
    const supabase = createClient();
    
    console.log('🔄 Syncing all components likes_count...');
    
    // Get all components
    const { data: components, error: compError } = await supabase
      .from('components')
      .select('id, name, likes_count');
    
    if (compError) {
      console.error('❌ Error fetching components:', compError);
      return;
    }
    
    for (const component of components) {
      // Count actual likes for this component
      const { count, error: countError } = await supabase
        .from('component_likes')
        .select('*', { count: 'exact', head: true })
        .eq('component_id', component.id);
      
      if (countError) {
        console.error(`❌ Error counting likes for ${component.name}:`, countError);
        continue;
      }
      
      const actualCount = count || 0;
      
      if (actualCount !== component.likes_count) {
        console.log(`🔄 Syncing ${component.name}: ${component.likes_count} → ${actualCount}`);
        
        const { error: updateError } = await supabase
          .from('components')
          .update({ likes_count: actualCount })
          .eq('id', component.id);
        
        if (updateError) {
          console.error(`❌ Failed to update ${component.name}:`, updateError);
        } else {
          console.log(`✅ Updated ${component.name} likes_count`);
        }
      } else {
        console.log(`✅ ${component.name} already has correct count (${actualCount})`);
      }
    }
    
    console.log('✅ Sync completed!');
  }
};

// Expose to window for easy debugging in browser console
if (typeof window !== 'undefined') {
  const w = window as unknown as { 
    debugLikes: typeof debugApi;
    syncLikes: () => Promise<void>;
  };
  w.debugLikes = debugApi;
  w.syncLikes = debugApi.syncAllLikesCount;
}