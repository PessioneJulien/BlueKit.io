import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import type { 
  DatabaseStack, 
  StackApiResponse, 
  CreateStackRequest, 
  UpdateStackRequest, 
  StackFilters,
  PaginatedResponse 
} from '@/lib/types/database-models';

export class StacksApiService {
  private supabase: ReturnType<typeof createClient>;
  
  constructor(isServer = false) {
    this.supabase = isServer ? createServerClient() : createClient();
  }

  /**
   * Get all stacks with optional filtering and pagination
   */
  async getStacks(filters?: StackFilters): Promise<PaginatedResponse<StackApiResponse>> {
    try {
      let query = this.supabase
        .from('stacks')
        .select(`
          *,
          technologies:stack_technologies(*),
          use_cases:stack_use_cases(use_case),
          pros:stack_pros(pro),
          cons:stack_cons(con),
          installation_steps:stack_installation_steps(step_number, step_description),
          alternatives:stack_alternatives(alternative),
          ratings:stack_ratings(rating)
        `);

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters?.pricing) {
        query = query.eq('pricing', filters.pricing);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,` +
          `description.ilike.%${filters.search}%,` +
          `short_description.ilike.%${filters.search}%`
        );
      }

      // Apply technology filter
      if (filters?.technology) {
        query = query.filter('technologies.technology_name', 'ilike', `%${filters.technology}%`);
      }

      // Apply sorting
      switch (filters?.sort_by) {
        case 'usage':
          // We'll need to join with usage stats and sort by count
          query = query.order('created_at', { ascending: false }); // Fallback for now
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'alphabetical':
          query = query.order('name', { ascending: true });
          break;
        case 'rating':
        default:
          query = query.order('created_at', { ascending: false }); // Fallback for now
          break;
      }

      // Apply pagination
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch stacks: ${error.message}`);
      }

      const stacks = (data || []).map(this.mapDatabaseToApi);

      // Calculate pagination info
      const total = count || 0;
      const pages = Math.ceil(total / limit);
      const page = Math.floor(offset / limit) + 1;

      return {
        data: stacks,
        pagination: {
          page,
          limit,
          total,
          pages,
          has_next: page < pages,
          has_prev: page > 1
        }
      };
    } catch (error) {
      console.error('Error in getStacks:', error);
      throw error;
    }
  }

  /**
   * Get a single stack by ID
   */
  async getStack(id: string): Promise<StackApiResponse | null> {
    try {
      const { data, error } = await this.supabase
        .from('stacks')
        .select(`
          *,
          technologies:stack_technologies(*),
          use_cases:stack_use_cases(use_case),
          pros:stack_pros(pro),
          cons:stack_cons(con),
          installation_steps:stack_installation_steps(step_number, step_description),
          alternatives:stack_alternatives(alternative),
          ratings:stack_ratings(rating)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        throw new Error(`Failed to fetch stack: ${error.message}`);
      }

      return this.mapDatabaseToApi(data);
    } catch (error) {
      console.error('Error in getStack:', error);
      throw error;
    }
  }

  /**
   * Get a stack by slug
   */
  async getStackBySlug(slug: string): Promise<StackApiResponse | null> {
    try {
      const { data, error } = await this.supabase
        .from('stacks')
        .select(`
          *,
          technologies:stack_technologies(*),
          use_cases:stack_use_cases(use_case),
          pros:stack_pros(pro),
          cons:stack_cons(con),
          installation_steps:stack_installation_steps(step_number, step_description),
          alternatives:stack_alternatives(alternative),
          ratings:stack_ratings(rating)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        throw new Error(`Failed to fetch stack: ${error.message}`);
      }

      return this.mapDatabaseToApi(data);
    } catch (error) {
      console.error('Error in getStackBySlug:', error);
      throw error;
    }
  }

  /**
   * Create a new stack
   */
  async createStack(stackData: CreateStackRequest): Promise<StackApiResponse> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated to create stacks');
      }

      // Create slug from name
      const slug = this.createSlug(stackData.name);

      // Start a transaction by creating the main stack record first
      const { data: stack, error: stackError } = await this.supabase
        .from('stacks')
        .insert({
          name: stackData.name,
          slug,
          description: stackData.description,
          short_description: stackData.short_description,
          category: stackData.category,
          difficulty: stackData.difficulty,
          setup_time_hours: stackData.setup_time_hours,
          pricing: stackData.pricing,
          author: user.email || 'Unknown',
          is_official: false
        })
        .select()
        .single();

      if (stackError) {
        throw new Error(`Failed to create stack: ${stackError.message}`);
      }

      const stackId = stack.id;

      // Insert related data
      await Promise.all([
        this.insertStackTechnologies(stackId, stackData.technologies),
        this.insertStackUseCases(stackId, stackData.use_cases),
        this.insertStackPros(stackId, stackData.pros),
        this.insertStackCons(stackId, stackData.cons),
        this.insertStackInstallationSteps(stackId, stackData.installation_steps),
        this.insertStackAlternatives(stackId, stackData.alternatives)
      ]);

      // Fetch the complete stack with all relations
      const createdStack = await this.getStack(stackId);
      if (!createdStack) {
        throw new Error('Failed to fetch created stack');
      }

      return createdStack;
    } catch (error) {
      console.error('Error in createStack:', error);
      throw error;
    }
  }

  /**
   * Update an existing stack
   */
  async updateStack(id: string, updates: UpdateStackRequest): Promise<StackApiResponse> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated to update stacks');
      }

      // Check if user can update this stack (admin or owner)
      const existingStack = await this.getStack(id);
      if (!existingStack) {
        throw new Error('Stack not found');
      }

      // Update the main stack record
      const updateData: Partial<DatabaseStack> = {};
      
      if (updates.name) {
        updateData.name = updates.name;
        updateData.slug = this.createSlug(updates.name);
      }
      if (updates.description) updateData.description = updates.description;
      if (updates.short_description) updateData.short_description = updates.short_description;
      if (updates.category) updateData.category = updates.category;
      if (updates.difficulty) updateData.difficulty = updates.difficulty;
      if (updates.setup_time_hours) updateData.setup_time_hours = updates.setup_time_hours;
      if (updates.pricing) updateData.pricing = updates.pricing;

      if (Object.keys(updateData).length > 0) {
        const { error } = await this.supabase
          .from('stacks')
          .update(updateData)
          .eq('id', id);

        if (error) {
          throw new Error(`Failed to update stack: ${error.message}`);
        }
      }

      // Update related data if provided
      if (updates.technologies) {
        await this.updateStackTechnologies(id, updates.technologies);
      }
      if (updates.use_cases) {
        await this.updateStackUseCases(id, updates.use_cases);
      }
      if (updates.pros) {
        await this.updateStackPros(id, updates.pros);
      }
      if (updates.cons) {
        await this.updateStackCons(id, updates.cons);
      }
      if (updates.installation_steps) {
        await this.updateStackInstallationSteps(id, updates.installation_steps);
      }
      if (updates.alternatives) {
        await this.updateStackAlternatives(id, updates.alternatives);
      }

      // Return updated stack
      const updatedStack = await this.getStack(id);
      if (!updatedStack) {
        throw new Error('Failed to fetch updated stack');
      }

      return updatedStack;
    } catch (error) {
      console.error('Error in updateStack:', error);
      throw error;
    }
  }

  /**
   * Delete a stack
   */
  async deleteStack(id: string): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated to delete stacks');
      }

      // Check if stack exists and user can delete it
      const existingStack = await this.getStack(id);
      if (!existingStack) {
        throw new Error('Stack not found');
      }

      const { error } = await this.supabase
        .from('stacks')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete stack: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteStack:', error);
      throw error;
    }
  }

  /**
   * Track stack usage
   */
  async trackUsage(stackId: string): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      const { error } = await this.supabase
        .from('stack_usage_stats')
        .insert({
          stack_id: stackId,
          user_id: user?.id || null,
          session_id: null // Could implement session tracking
        });

      if (error) {
        console.error('Failed to track usage:', error);
        // Don't throw error for analytics failures
      }
    } catch (error) {
      console.error('Error in trackUsage:', error);
      // Don't throw error for analytics failures
    }
  }

  /**
   * Get popular stacks (by usage)
   */
  async getPopularStacks(limit = 10): Promise<StackApiResponse[]> {
    try {
      // This would need a more complex query with usage stats join
      // For now, use a simple approach based on creation date
      const result = await this.getStacks({
        sort_by: 'recent',
        limit
      });
      return result.data;
    } catch (error) {
      console.error('Error in getPopularStacks:', error);
      throw error;
    }
  }

  /**
   * Search stacks
   */
  async searchStacks(query: string, limit = 20): Promise<StackApiResponse[]> {
    try {
      const result = await this.getStacks({
        search: query,
        limit
      });
      return result.data;
    } catch (error) {
      console.error('Error in searchStacks:', error);
      throw error;
    }
  }

  // Private helper methods

  private mapDatabaseToApi(dbStack: DatabaseStack & {
    technologies?: DatabaseStackTechnology[];
    use_cases?: DatabaseStackUseCase[];
    pros?: DatabaseStackPro[];
    cons?: DatabaseStackCon[];
    installation_steps?: DatabaseStackInstallationStep[];
    alternatives?: DatabaseStackAlternative[];
    ratings?: { rating: number }[];
  }): StackApiResponse {
    // Calculate average rating
    const ratings = dbStack.ratings || [];
    const average_rating = ratings.length > 0 
      ? ratings.reduce((sum: number, r) => sum + r.rating, 0) / ratings.length 
      : 0;

    // Sort installation steps by step number
    const installation_steps = (dbStack.installation_steps || [])
      .sort((a, b) => a.step_number - b.step_number)
      .map((step) => step.step_description);

    return {
      id: dbStack.id,
      name: dbStack.name,
      slug: dbStack.slug,
      description: dbStack.description,
      short_description: dbStack.short_description,
      category: dbStack.category,
      difficulty: dbStack.difficulty,
      setup_time_hours: dbStack.setup_time_hours,
      pricing: dbStack.pricing,
      author: dbStack.author,
      is_official: dbStack.is_official,
      created_at: new Date(dbStack.created_at),
      updated_at: new Date(dbStack.updated_at),
      technologies: (dbStack.technologies || []).map((tech) => ({
        id: tech.technology_id,
        name: tech.technology_name,
        category: tech.category,
        role: tech.role
      })),
      use_cases: (dbStack.use_cases || []).map((uc) => uc.use_case),
      pros: (dbStack.pros || []).map((p) => p.pro),
      cons: (dbStack.cons || []).map((c) => c.con),
      installation_steps,
      alternatives: (dbStack.alternatives || []).map((alt) => alt.alternative),
      average_rating,
      rating_count: ratings.length,
      usage_count: 0 // Would need to calculate from usage stats
    };
  }

  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async insertStackTechnologies(stackId: string, technologies: CreateStackRequest['technologies']) {
    if (technologies.length === 0) return;

    const records = technologies.map(tech => ({
      stack_id: stackId,
      technology_id: tech.id,
      technology_name: tech.name,
      category: tech.category,
      role: tech.role
    }));

    const { error } = await this.supabase
      .from('stack_technologies')
      .insert(records);

    if (error) {
      throw new Error(`Failed to insert technologies: ${error.message}`);
    }
  }

  private async insertStackUseCases(stackId: string, useCases: string[]) {
    if (useCases.length === 0) return;

    const records = useCases.map(useCase => ({
      stack_id: stackId,
      use_case: useCase
    }));

    const { error } = await this.supabase
      .from('stack_use_cases')
      .insert(records);

    if (error) {
      throw new Error(`Failed to insert use cases: ${error.message}`);
    }
  }

  private async insertStackPros(stackId: string, pros: string[]) {
    if (pros.length === 0) return;

    const records = pros.map(pro => ({
      stack_id: stackId,
      pro
    }));

    const { error } = await this.supabase
      .from('stack_pros')
      .insert(records);

    if (error) {
      throw new Error(`Failed to insert pros: ${error.message}`);
    }
  }

  private async insertStackCons(stackId: string, cons: string[]) {
    if (cons.length === 0) return;

    const records = cons.map(con => ({
      stack_id: stackId,
      con
    }));

    const { error } = await this.supabase
      .from('stack_cons')
      .insert(records);

    if (error) {
      throw new Error(`Failed to insert cons: ${error.message}`);
    }
  }

  private async insertStackInstallationSteps(stackId: string, steps: string[]) {
    if (steps.length === 0) return;

    const records = steps.map((step, index) => ({
      stack_id: stackId,
      step_number: index + 1,
      step_description: step
    }));

    const { error } = await this.supabase
      .from('stack_installation_steps')
      .insert(records);

    if (error) {
      throw new Error(`Failed to insert installation steps: ${error.message}`);
    }
  }

  private async insertStackAlternatives(stackId: string, alternatives: string[]) {
    if (alternatives.length === 0) return;

    const records = alternatives.map(alternative => ({
      stack_id: stackId,
      alternative
    }));

    const { error } = await this.supabase
      .from('stack_alternatives')
      .insert(records);

    if (error) {
      throw new Error(`Failed to insert alternatives: ${error.message}`);
    }
  }

  // Update methods for related data (delete existing and re-insert)
  private async updateStackTechnologies(stackId: string, technologies: CreateStackRequest['technologies']) {
    // Delete existing
    await this.supabase.from('stack_technologies').delete().eq('stack_id', stackId);
    // Insert new
    await this.insertStackTechnologies(stackId, technologies);
  }

  private async updateStackUseCases(stackId: string, useCases: string[]) {
    await this.supabase.from('stack_use_cases').delete().eq('stack_id', stackId);
    await this.insertStackUseCases(stackId, useCases);
  }

  private async updateStackPros(stackId: string, pros: string[]) {
    await this.supabase.from('stack_pros').delete().eq('stack_id', stackId);
    await this.insertStackPros(stackId, pros);
  }

  private async updateStackCons(stackId: string, cons: string[]) {
    await this.supabase.from('stack_cons').delete().eq('stack_id', stackId);
    await this.insertStackCons(stackId, cons);
  }

  private async updateStackInstallationSteps(stackId: string, steps: string[]) {
    await this.supabase.from('stack_installation_steps').delete().eq('stack_id', stackId);
    await this.insertStackInstallationSteps(stackId, steps);
  }

  private async updateStackAlternatives(stackId: string, alternatives: string[]) {
    await this.supabase.from('stack_alternatives').delete().eq('stack_id', stackId);
    await this.insertStackAlternatives(stackId, alternatives);
  }
}

// Singleton instances
export const stacksApi = new StacksApiService();
export const serverStacksApi = new StacksApiService(true);