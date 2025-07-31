import { createClient } from '@/lib/supabase/client';

export interface SimpleComponent {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  setup_time_hours: number;
  difficulty: string;
  pricing: string;
  documentation?: string;
  official_docs_url?: string;
  github_url?: string;
  npm_url?: string;
  tags: string[];
  author_id: string;
  is_official: boolean;
  compatible_with: string[];
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// Simplified API for debugging
export const simpleComponentsApi = {
  // Get all components (basic version)
  async getComponents(): Promise<SimpleComponent[]> {
    const supabase = createClient();
    
    console.log('Fetching components...');
    
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Error fetching components:', error);
      throw new Error(`Failed to fetch components: ${error.message}`);
    }

    return data || [];
  },

  // Create a component (basic version)
  async createComponent(componentData: {
    name: string;
    description: string;
    category: string;
    type: string;
    setup_time_hours: number;
    difficulty: string;
    pricing: string;
    documentation?: string;
    official_docs_url?: string;
    github_url?: string;
    npm_url?: string;
    tags?: string[];
    compatible_with?: string[];
  }): Promise<SimpleComponent> {
    const supabase = createClient();
    
    console.log('Creating component:', componentData);
    
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);
    
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
        setup_time_hours: componentData.setup_time_hours,
        difficulty: componentData.difficulty,
        pricing: componentData.pricing,
        documentation: componentData.documentation,
        official_docs_url: componentData.official_docs_url,
        github_url: componentData.github_url,
        npm_url: componentData.npm_url,
        tags: componentData.tags || [],
        author_id: user.id,
        compatible_with: componentData.compatible_with || []
      })
      .select()
      .single();

    console.log('Create component response:', { data, error });

    if (error) {
      console.error('Error creating component:', error);
      throw new Error(`Failed to create component: ${error.message}`);
    }

    return data;
  },

  // Delete a component (basic version)
  async deleteComponent(id: string): Promise<void> {
    const supabase = createClient();
    
    console.log('Deleting component:', id);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete components');
    }

    const { error } = await supabase
      .from('components')
      .delete()
      .eq('id', id)
      .eq('author_id', user.id);

    console.log('Delete component response:', { error });

    if (error) {
      console.error('Error deleting component:', error);
      throw new Error(`Failed to delete component: ${error.message}`);
    }
  }
};