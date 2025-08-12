import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Component Like] POST request for component:', params.id);
  
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('[Component Like] User not authenticated:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const componentId = params.id;
    
    // Vérifier si le composant existe
    const { data: component, error: componentError } = await supabase
      .from('community_components')
      .select('id, name')
      .eq('id', componentId)
      .single();
    
    if (componentError || !component) {
      console.log('[Component Like] Component not found:', componentError);
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a déjà liké ce composant
    const { data: existingLike, error: likeCheckError } = await supabase
      .from('component_likes')
      .select('id')
      .eq('component_id', componentId)
      .eq('user_id', user.id)
      .single();

    if (likeCheckError && likeCheckError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, ce qui est normal si pas de like
      console.error('[Component Like] Error checking existing like:', likeCheckError);
      return NextResponse.json(
        { error: 'Failed to check existing like' },
        { status: 500 }
      );
    }

    if (existingLike) {
      // L'utilisateur a déjà liké, on retire le like
      const { error: deleteError } = await supabase
        .from('component_likes')
        .delete()
        .eq('component_id', componentId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('[Component Like] Error removing like:', deleteError);
        return NextResponse.json(
          { error: 'Failed to remove like' },
          { status: 500 }
        );
      }

      // Compter les likes restants
      const { count } = await supabase
        .from('component_likes')
        .select('*', { count: 'exact', head: true })
        .eq('component_id', componentId);

      console.log('[Component Like] Like removed successfully, remaining likes:', count);
      
      return NextResponse.json({
        message: 'Like removed successfully',
        liked: false,
        likesCount: count || 0
      });
    } else {
      // L'utilisateur n'a pas encore liké, on ajoute le like
      const { error: insertError } = await supabase
        .from('component_likes')
        .insert({
          component_id: componentId,
          user_id: user.id
        });

      if (insertError) {
        console.error('[Component Like] Error adding like:', insertError);
        return NextResponse.json(
          { error: 'Failed to add like' },
          { status: 500 }
        );
      }

      // Compter les likes totaux
      const { count } = await supabase
        .from('component_likes')
        .select('*', { count: 'exact', head: true })
        .eq('component_id', componentId);

      console.log('[Component Like] Like added successfully, total likes:', count);
      
      return NextResponse.json({
        message: 'Like added successfully',
        liked: true,
        likesCount: count || 1
      });
    }
    
  } catch (error) {
    console.error('[Component Like] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Component Like] GET request for component:', params.id);
  
  try {
    const supabase = await createClient();
    
    const componentId = params.id;
    
    // Compter les likes totaux
    const { count, error: countError } = await supabase
      .from('component_likes')
      .select('*', { count: 'exact', head: true })
      .eq('component_id', componentId);

    if (countError) {
      console.error('[Component Like] Error counting likes:', countError);
      return NextResponse.json(
        { error: 'Failed to count likes' },
        { status: 500 }
      );
    }

    // Vérifier si l'utilisateur connecté a liké
    const { data: { user } } = await supabase.auth.getUser();
    let userHasLiked = false;

    if (user) {
      const { data: userLike, error: userLikeError } = await supabase
        .from('component_likes')
        .select('id')
        .eq('component_id', componentId)
        .eq('user_id', user.id)
        .single();

      if (userLikeError && userLikeError.code !== 'PGRST116') {
        console.error('[Component Like] Error checking user like:', userLikeError);
      } else if (userLike) {
        userHasLiked = true;
      }
    }
    
    return NextResponse.json({
      likesCount: count || 0,
      liked: userHasLiked
    });
    
  } catch (error) {
    console.error('[Component Like] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}