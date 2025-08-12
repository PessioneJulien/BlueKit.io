import { createClient } from '@/lib/supabase/client';

export interface Component {
  id: string;
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'tool' | 'other';
  type: 'main' | 'sub';
  setupTimeHours: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  pricing: 'free' | 'freemium' | 'paid';
  documentation?: string;
  officialDocsUrl?: string;
  githubUrl?: string;
  npmUrl?: string;
  logoUrl?: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  reviewCount: number;
  usageCount: number;
  isOfficial: boolean;
  compatibleWith?: string[];
  isContainer?: boolean;
  containerType?: 'docker' | 'kubernetes';
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentReview {
  id: string;
  componentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  notHelpfulCount: number;
  isVerified: boolean;
  createdAt: Date;
  criteria: {
    documentation: number;
    easeOfUse: number;
    performance: number;
    support: number;
  };
}

export interface CreateComponentData {
  name: string;
  description: string;
  category: Component['category'];
  type: Component['type'];
  setupTimeHours: number;
  difficulty: Component['difficulty'];
  pricing: Component['pricing'];
  documentation?: string;
  officialDocsUrl?: string;
  githubUrl?: string;
  npmUrl?: string;
  logoUrl?: string;
  tags?: string[];
  compatibleWith?: string[];
  isContainer?: boolean;
  containerType?: 'docker' | 'kubernetes';
}

export interface CreateReviewData {
  componentId: string;
  rating: number;
  comment: string;
  criteria: {
    documentation: number;
    easeOfUse: number;
    performance: number;
    support: number;
  };
}

// Components API
export const componentsApi = {
  // Get all components with optional filtering
  async getComponents(filters?: {
    category?: string;
    type?: string;
    search?: string;
    sortBy?: 'rating' | 'usage' | 'recent';
  }): Promise<Component[]> {
    const supabase = createClient();
    
    let query = supabase
      .from('components')
      .select('*');

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case 'usage':
        query = query.order('usage_count', { ascending: false });
        break;
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;
      case 'rating':
      default:
        // For rating, we'll need to calculate it from reviews
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching components:', error);
      throw new Error(`Failed to fetch components: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Calculate ratings for each component
    const componentsWithRatings = await Promise.all(
      data.map(async (component) => {
        const { data: reviews } = await supabase
          .from('component_reviews')
          .select('rating')
          .eq('component_id', component.id);

        const rating = reviews && reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

        // Get author info if available
        let authorName = 'Unknown';
        if (component.author_id) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && user.id === component.author_id) {
            authorName = user.email || user.user_metadata?.name || 'You';
          } else {
            // For other users, we'll use a generic name since we can't access their data
            authorName = 'Community Member';
          }
        }

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
          author: {
            id: component.author_id,
            name: authorName
          },
          rating,
          reviewCount: reviews?.length || 0,
          usageCount: component.usage_count || 0,
          isOfficial: component.is_official || false,
          compatibleWith: component.compatible_with || [],
          isContainer: component.is_container || false,
          containerType: component.container_type,
          createdAt: new Date(component.created_at),
          updatedAt: new Date(component.updated_at)
        } as Component;
      })
    );

    return componentsWithRatings;
  },

  // Get a single component by ID
  async getComponent(id: string): Promise<Component | null> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching component:', error);
      return null;
    }

    if (!data) return null;

    // Get reviews for rating calculation
    const { data: reviews } = await supabase
      .from('component_reviews')
      .select('rating')
      .eq('component_id', id);

    const rating = reviews && reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Get author info if available
    let authorName = 'Unknown';
    if (data.author_id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === data.author_id) {
        authorName = user.email || user.user_metadata?.name || 'You';
      } else {
        authorName = 'Community Member';
      }
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      type: data.type,
      setupTimeHours: data.setup_time_hours,
      difficulty: data.difficulty,
      pricing: data.pricing,
      documentation: data.documentation,
      officialDocsUrl: data.official_docs_url,
      githubUrl: data.github_url,
      npmUrl: data.npm_url,
      logoUrl: data.logo_url,
      tags: data.tags || [],
      author: {
        id: data.author_id,
        name: authorName
      },
      rating,
      reviewCount: reviews?.length || 0,
      usageCount: data.usage_count || 0,
      isOfficial: data.is_official || false,
      compatibleWith: data.compatible_with || [],
      isContainer: data.is_container || false,
      containerType: data.container_type,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  // Create a new component
  async createComponent(componentData: CreateComponentData): Promise<Component> {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create components');
    }

    const { data, error } = await supabase
      .from('components')
      .insert({
        name: componentData.name,
        description: componentData.description,
        category: componentData.category,
        type: componentData.type,
        setup_time_hours: componentData.setupTimeHours,
        difficulty: componentData.difficulty,
        pricing: componentData.pricing,
        documentation: componentData.documentation,
        official_docs_url: componentData.officialDocsUrl,
        github_url: componentData.githubUrl,
        npm_url: componentData.npmUrl,
        logo_url: componentData.logoUrl,
        tags: componentData.tags || [],
        author_id: user.id,
        compatible_with: componentData.compatibleWith || [],
        is_container: componentData.isContainer || false,
        container_type: componentData.containerType
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating component:', error);
      throw new Error(`Failed to create component: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      type: data.type,
      setupTimeHours: data.setup_time_hours,
      difficulty: data.difficulty,
      pricing: data.pricing,
      documentation: data.documentation,
      officialDocsUrl: data.official_docs_url,
      githubUrl: data.github_url,
      npmUrl: data.npm_url,
      logoUrl: data.logo_url,
      tags: data.tags || [],
      author: {
        id: user.id,
        name: user.email || 'Unknown',
        avatar: user.user_metadata?.avatar_url
      },
      rating: 0,
      reviewCount: 0,
      usageCount: 0,
      isOfficial: false,
      compatibleWith: data.compatible_with || [],
      isContainer: data.is_container || false,
      containerType: data.container_type,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  // Update a component
  async updateComponent(id: string, updates: Partial<CreateComponentData>): Promise<Component> {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to update components');
    }

    type UpdateRow = {
      name?: string;
      description?: string;
      category?: string;
      type?: string;
      setup_time_hours?: number;
      difficulty?: string;
      pricing?: string;
      documentation?: string | null;
      official_docs_url?: string | null;
      github_url?: string | null;
      npm_url?: string | null;
      logo_url?: string | null;
      tags?: string[];
      compatible_with?: string[];
      is_container?: boolean;
      container_type?: string | null;
    };

    const updateData: UpdateRow = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.category) updateData.category = updates.category;
    if (updates.type) updateData.type = updates.type;
    if (updates.setupTimeHours) updateData.setup_time_hours = updates.setupTimeHours;
    if (updates.difficulty) updateData.difficulty = updates.difficulty;
    if (updates.pricing) updateData.pricing = updates.pricing;
    if (updates.documentation !== undefined) updateData.documentation = updates.documentation;
    if (updates.officialDocsUrl !== undefined) updateData.official_docs_url = updates.officialDocsUrl;
    if (updates.githubUrl !== undefined) updateData.github_url = updates.githubUrl;
    if (updates.npmUrl !== undefined) updateData.npm_url = updates.npmUrl;
    if (updates.logoUrl !== undefined) updateData.logo_url = updates.logoUrl;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.compatibleWith) updateData.compatible_with = updates.compatibleWith;
    if (updates.isContainer !== undefined) updateData.is_container = updates.isContainer;
    if (updates.containerType !== undefined) updateData.container_type = updates.containerType;

    const { data, error } = await supabase
      .from('components')
      .update(updateData)
      .eq('id', id)
      .eq('author_id', user.id) // Ensure user can only update their own components
      .select()
      .single();

    if (error) {
      console.error('Error updating component:', error);
      throw new Error(`Failed to update component: ${error.message}`);
    }

    // Get updated component with rating
    const updatedComponent = await this.getComponent(id);
    if (!updatedComponent) {
      throw new Error('Failed to fetch updated component');
    }

    return updatedComponent;
  },

  // Delete a component
  async deleteComponent(id: string): Promise<void> {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete components');
    }

    const { error } = await supabase
      .from('components')
      .delete()
      .eq('id', id)
      .eq('author_id', user.id); // Ensure user can only delete their own components

    if (error) {
      console.error('Error deleting component:', error);
      throw new Error(`Failed to delete component: ${error.message}`);
    }
  },

  // Track component usage
  async trackUsage(componentId: string): Promise<void> {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('component_usage')
      .insert({
        component_id: componentId,
        user_id: user?.id || null
      });

    if (error) {
      console.error('Error tracking component usage:', error);
      // Don't throw error for usage tracking failures
    }
  }
};

// Reviews API
export const reviewsApi = {
  // Get reviews for a component
  async getReviews(componentId: string): Promise<ComponentReview[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('component_reviews')
      .select(`
        *,
        user:user_id (
          id,
          name:email,
          avatar:avatar_url
        )
      `)
      .eq('component_id', componentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }

    return (data || []).map(review => ({
      id: review.id,
      componentId: review.component_id,
      userId: review.user_id,
      userName: review.user?.name || 'Anonymous',
      userAvatar: review.user?.avatar,
      rating: review.rating,
      comment: review.comment,
      helpfulCount: review.helpful_count || 0,
      notHelpfulCount: review.not_helpful_count || 0,
      isVerified: review.is_verified || false,
      createdAt: new Date(review.created_at),
      criteria: review.criteria || {
        documentation: 0,
        easeOfUse: 0,
        performance: 0,
        support: 0
      }
    }));
  },

  // Create a review
  async createReview(reviewData: CreateReviewData): Promise<ComponentReview> {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create reviews');
    }

    const { data, error } = await supabase
      .from('component_reviews')
      .insert({
        component_id: reviewData.componentId,
        user_id: user.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        criteria: reviewData.criteria
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      throw new Error(`Failed to create review: ${error.message}`);
    }

    return {
      id: data.id,
      componentId: data.component_id,
      userId: data.user_id,
      userName: user.email || 'Anonymous',
      userAvatar: user.user_metadata?.avatar_url,
      rating: data.rating,
      comment: data.comment,
      helpfulCount: 0,
      notHelpfulCount: 0,
      isVerified: false,
      createdAt: new Date(data.created_at),
      criteria: data.criteria
    };
  },

  // Vote on a review
  async voteOnReview(reviewId: string, voteType: 'helpful' | 'not_helpful'): Promise<void> {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to vote on reviews');
    }

    // Use upsert to handle vote changes
    const { error } = await supabase
      .from('component_review_votes')
      .upsert({
        review_id: reviewId,
        user_id: user.id,
        vote_type: voteType
      }, {
        onConflict: 'review_id,user_id'
      });

    if (error) {
      console.error('Error voting on review:', error);
      throw new Error(`Failed to vote on review: ${error.message}`);
    }
  }
};