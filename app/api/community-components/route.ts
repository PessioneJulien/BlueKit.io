import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Types pour l'API
interface CommunityComponent {
  id: string;
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'infrastructure' | 'other';
  type: 'component' | 'container';
  containerType?: 'docker' | 'kubernetes';
  setupTimeHours: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  pricing: 'free' | 'freemium' | 'paid';
  documentation?: string;
  officialDocsUrl?: string;
  githubUrl?: string;
  logoUrl?: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  reviewCount: number;
  likesCount: number;
  usageCount: number;
  isOfficial: boolean;
  compatibleWith?: string[];
  containedTechnologies?: string[];
  resourceRequirements?: {
    cpu?: string;
    memory?: string;
    storage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// GET - Récupérer tous les composants communautaires
export async function GET(request: NextRequest) {
  console.log('[Community Components API] GET request received');
  
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');
    const pricing = searchParams.get('pricing');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const supabase = await createClient();
    
    // Construire la requête (sans la relation users pour l'instant)
    let query = supabase
      .from('community_components')
      .select(`
        *,
        component_reviews (
          rating
        ),
        component_likes (
          user_id
        )
      `);
    
    // Appliquer les filtres
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }
    if (pricing && pricing !== 'all') {
      query = query.eq('pricing', pricing);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
    }
    
    // Appliquer la pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('[Community Components API] Supabase error:', error);
      return NextResponse.json({
        components: [],
        totalCount: 0,
        page,
        limit,
        error: error.message
      });
    }
    
    console.log(`[Community Components API] Found ${data?.length || 0} components`);
    
    // Transformer les données Supabase au format attendu
    const transformedComponents: CommunityComponent[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      type: item.type,
      containerType: item.container_type,
      setupTimeHours: item.setup_time_hours || 1,
      difficulty: item.difficulty,
      pricing: item.pricing,
      documentation: item.documentation,
      officialDocsUrl: item.official_docs_url,
      githubUrl: item.github_url,
      logoUrl: item.logo_url,
      tags: item.tags || [],
      author: {
        id: item.author_id || 'anonymous',
        name: 'Community User', // Temporaire jusqu'à la relation users
        avatar: undefined
      },
      rating: calculateAverageRating(item.component_reviews || []),
      reviewCount: item.component_reviews?.length || 0,
      likesCount: item.component_likes?.length || 0,
      usageCount: item.usage_count || 0,
      isOfficial: item.is_official || false,
      compatibleWith: item.compatible_with || [],
      containedTechnologies: item.contained_technologies || [],
      resourceRequirements: item.resource_requirements ? {
        cpu: item.resource_requirements.cpu,
        memory: item.resource_requirements.memory,
        storage: item.resource_requirements.storage
      } : undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
    
    // Trier les résultats
    transformedComponents.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.usageCount - a.usageCount;
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
    
    return NextResponse.json({
      components: transformedComponents,
      totalCount: count || transformedComponents.length,
      page,
      limit
    });
    
  } catch (error) {
    console.error('[Community Components API] Unexpected error:', error);
    return NextResponse.json({
      components: [],
      totalCount: 0,
      page: 1,
      limit: 20,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST - Créer un nouveau composant communautaire
export async function POST(request: NextRequest) {
  console.log('[Community Components API] POST request received');
  
  try {
    const body = await request.json();
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Préparer les données pour Supabase
    const componentData = {
      name: body.name,
      description: body.description,
      category: body.category,
      type: body.type,
      container_type: body.containerType,
      setup_time_hours: body.setupTimeHours,
      difficulty: body.difficulty,
      pricing: body.pricing,
      documentation: body.documentation,
      official_docs_url: body.officialDocsUrl,
      github_url: body.githubUrl,
      logo_url: body.logoUrl,
      tags: body.tags,
      compatible_with: body.compatibleWith,
      contained_technologies: body.containedTechnologies,
      resource_requirements: body.resources ? {
        cpu: body.resources.cpu,
        memory: body.resources.memory,
        storage: body.resources.storage
      } : null,
      author_id: user.id,
      is_official: false // Les soumissions communautaires ne sont jamais officielles par défaut
    };
    
    const { data, error } = await supabase
      .from('community_components')
      .insert([componentData])
      .select()
      .single();
    
    if (error) {
      console.error('[Community Components API] Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create component' },
        { status: 500 }
      );
    }
    
    console.log('[Community Components API] Component created successfully:', data.id);
    
    return NextResponse.json({
      success: true,
      component: data
    });
    
  } catch (error) {
    console.error('[Community Components API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour calculer la note moyenne
function calculateAverageRating(reviews: { rating: number }[]): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}