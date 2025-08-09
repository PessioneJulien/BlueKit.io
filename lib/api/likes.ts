import { createClient } from '@/lib/supabase/client';

export const likesApi = {
  async toggleLike(componentId: string): Promise<{ liked: boolean; likesCount: number }> {
    const supabase = createClient();
    
    console.log('🔄 toggleLike called for component:', componentId);
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated to like components');
    }
    
    console.log('👤 User authenticated:', user.id);

    // Check if user already liked this component
    const { data: existingLikes, error: checkError } = await supabase
      .from('component_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('component_id', componentId);

    if (checkError) {
      throw new Error(`Failed to check existing like: ${checkError.message}`);
    }

    const existingLike = existingLikes && existingLikes.length > 0 ? existingLikes[0] : null;
    
    console.log('🔍 Existing like found:', !!existingLike);

    let liked: boolean;
    if (existingLike) {
      // Unlike - remove the like
      const { error: deleteError } = await supabase
        .from('component_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('component_id', componentId);

      if (deleteError) {
        throw new Error(`Failed to remove like: ${deleteError.message}`);
      }
      console.log('➖ Like removed successfully');
      liked = false;
    } else {
      // Like - add the like
      const { error: insertError } = await supabase
        .from('component_likes')
        .insert({
          user_id: user.id,
          component_id: componentId
        });

      if (insertError) {
        throw new Error(`Failed to add like: ${insertError.message}`);
      }
      console.log('➕ Like added successfully');
      liked = true;
    }

    // Get updated likes count by counting actual likes
    const { count: actualLikesCount, error: countError } = await supabase
      .from('component_likes')
      .select('*', { count: 'exact', head: true })
      .eq('component_id', componentId);

    if (countError) {
      throw new Error(`Failed to get updated likes count: ${countError.message}`);
    }
    
    const finalCount = actualLikesCount || 0;
    console.log('📊 Total likes for component:', finalCount);

    // Note: We can't update likes_count in components table due to RLS policies
    // The API will count likes dynamically instead

    return { 
      liked, 
      likesCount: finalCount 
    };
  },

  async getUserLikedComponents(): Promise<string[]> {
    const supabase = createClient();
    
    console.log('📎 Loading user liked components...');
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('⚠️ User not authenticated, returning empty likes');
      return []; // Return empty array for non-authenticated users
    }
    
    console.log('👤 Loading likes for user:', user.id);

    // Get all component IDs that the user has liked
    const { data: likedComponents, error } = await supabase
      .from('component_likes')
      .select('component_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Failed to fetch liked components:', error);
      throw new Error(`Failed to fetch liked components: ${error.message}`);
    }
    
    const likedComponentIds = likedComponents.map(like => like.component_id);
    console.log(`✅ Found ${likedComponentIds.length} liked components:`, likedComponentIds);

    return likedComponentIds;
  }
};