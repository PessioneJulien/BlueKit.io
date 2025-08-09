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
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

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
    
    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Get total count first (without pagination)
    let countQuery = supabase
      .from('components')
      .select('*', { count: 'exact', head: true });
    
    // Apply same filters for count
    if (difficulty && difficulty !== 'all') {
      countQuery = countQuery.eq('difficulty', difficulty);
    }
    
    if (pricing && pricing !== 'all') {
      countQuery = countQuery.eq('pricing', pricing);
    }
    
    if (category && category !== 'all') {
      countQuery = countQuery.eq('category', category);
    }
    
    if (authorId) {
      countQuery = countQuery.eq('author_id', authorId);
    }
    
    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    const { count: totalCount, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Error counting components:', countError);
      return NextResponse.json({ error: 'Database error', details: countError.message }, { status: 500 });
    }

    // Order by popularity (likes) and recency, then apply pagination
    query = query.order('likes_count', { ascending: false })
                 .order('created_at', { ascending: false })
                 .range(offset, offset + limit - 1);

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

    return NextResponse.json({ 
      components: componentsWithRealLikes,
      total: totalCount || 0,
      page,
      limit,
      totalPages: Math.ceil((totalCount || 0) / limit)
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}