import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const pricing = searchParams.get('pricing');
    const category = searchParams.get('category');
    const authorId = searchParams.get('author_id'); // For "My Components" filter

    console.log('Fetching components from database...');
    
    let query = supabase
      .from('components')
      .select('*'); // Sélectionne toutes les colonnes disponibles

    // Apply filters
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }
    
    if (pricing && pricing !== 'all') {
      query = query.eq('pricing', pricing);
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (authorId) {
      query = query.eq('author_id', authorId);
    }

    // Order by popularity (likes) and recency
    query = query.order('likes_count', { ascending: false })
                 .order('created_at', { ascending: false });

    const { data: components, error } = await query;

    if (error) {
      console.error('Error fetching components:', error);
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    console.log(`Found ${components?.length || 0} components`);

    if (!components || components.length === 0) {
      return NextResponse.json({ components: [] });
    }

    // Get actual likes count for each component
    const componentsWithRealLikes = await Promise.all(
      components.map(async (component) => {
        const { count, error } = await supabase
          .from('component_likes')
          .select('*', { count: 'exact', head: true })
          .eq('component_id', component.id);
        
        const actualLikesCount = error ? 0 : (count || 0);
        
        return {
          id: component.id,
          name: component.name,
          description: component.description,
          category: component.category,
          type: component.type,
          setupTimeHours: component.setup_time_hours,
          difficulty: component.difficulty,
          pricing: component.pricing,
          documentation: component.documentation,
          officialDocsUrl: component.official_docs_url,
          githubUrl: component.github_url,
          npmUrl: component.npm_url,
          logoUrl: component.logo_url,
          tags: component.tags || [],
          authorId: component.author_id,
          isOfficial: component.is_official,
          compatibleWith: component.compatible_with || [],
          usageCount: component.usage_count || 0,
          likesCount: actualLikesCount, // Use real count instead of stored value
          createdAt: component.created_at,
          updatedAt: component.updated_at
        };
      })
    );

    return NextResponse.json({ components: componentsWithRealLikes });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}