import { createClient } from '@/lib/supabase/client';

interface NodeData {
  id?: string;
  name?: string;
  label?: string;
  category?: string;
  pricing?: string;
  setupTimeHours?: number;
  optional?: boolean;
  [key: string]: unknown;
}

interface StackNode {
  id: string;
  type: string;
  data: NodeData;
  position?: { x: number; y: number };
  [key: string]: unknown;
}

interface StackConnection {
  id: string;
  source: string;
  target: string;
  [key: string]: unknown;
}

export interface DatabaseStack {
  id: string;
  name: string;
  description: string;
  use_cases: string[];
  author_id: string;
  is_official: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  nodes: StackNode[];
  connections: StackConnection[];
}

export interface StackTechnology {
  id: string;
  stack_id: string;
  technology_id: string;
  technology_name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'other';
  role: 'primary' | 'secondary' | 'optional';
}

export interface StackWithDetails {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  setup_time_hours: number;
  pricing: 'free' | 'freemium' | 'paid' | 'mixed';
  author: string;
  is_official: boolean;
  created_at: string;
  updated_at: string;
  technologies: StackTechnology[];
  use_cases: string[];
  pros: string[];
  cons: string[];
  installation_steps: string[];
  alternatives: string[];
  usage_count: number;
  rating: number;
}

export interface StackFormData {
  name: string;
  slug?: string;
  description: string;
  short_description?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  setup_time_hours?: number;
  pricing?: 'free' | 'freemium' | 'paid' | 'mixed';
  author?: string;
  is_official?: boolean;
}

// Helper function to extract stack info from nodes
function extractStackInfoFromNodes(stack: DatabaseStack): StackWithDetails {
  const technologies: StackTechnology[] = [];
  let totalSetupHours = 2; // Base setup time
  let category = 'Full-stack';
  let difficulty: 'beginner' | 'intermediate' | 'expert' = 'intermediate';
  let pricing: 'free' | 'freemium' | 'paid' | 'mixed' = 'free';
  
  // Category counts to determine stack type
  const categoryCount: { [key: string]: number } = {};
  const pricingSet = new Set<string>();
  
  // Extract technologies from nodes
  if (stack.nodes && Array.isArray(stack.nodes)) {
    stack.nodes.forEach((node: StackNode, index: number) => {
      if (node.type === 'component' && node.data) {
        // Use the actual name and category from node data
        const techName = node.data.name || node.id || 'Unknown';
        let techCategory: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'other' = 'other';
        
        // First, try to use the category from the node data
        if (node.data.category) {
          const nodeCategory = node.data.category.toLowerCase();
          if (['frontend', 'backend', 'database', 'devops', 'mobile', 'ai'].includes(nodeCategory)) {
            techCategory = nodeCategory as 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai';
          }
        }
        
        // If no category in node data, fall back to name-based categorization
        if (techCategory === 'other') {
          if (techName.toLowerCase().includes('react') || techName.toLowerCase().includes('vue') || 
              techName.toLowerCase().includes('angular') || techName.toLowerCase().includes('next') ||
              techName.toLowerCase().includes('tailwind') || techName.toLowerCase().includes('css')) {
            techCategory = 'frontend';
          } else if (techName.toLowerCase().includes('node') || techName.toLowerCase().includes('express') ||
                     techName.toLowerCase().includes('fastapi') || techName.toLowerCase().includes('django') ||
                     techName.toLowerCase().includes('rails') || techName.toLowerCase().includes('spring')) {
            techCategory = 'backend';
          } else if (techName.toLowerCase().includes('postgres') || techName.toLowerCase().includes('mysql') ||
                     techName.toLowerCase().includes('mongo') || techName.toLowerCase().includes('redis') ||
                     techName.toLowerCase().includes('supabase') || techName.toLowerCase().includes('firebase')) {
            techCategory = 'database';
          } else if (techName.toLowerCase().includes('docker') || techName.toLowerCase().includes('kubernetes') ||
                     techName.toLowerCase().includes('aws') || techName.toLowerCase().includes('vercel') ||
                     techName.toLowerCase().includes('netlify')) {
            techCategory = 'devops';
          }
        }
        
        // Count categories
        categoryCount[techCategory] = (categoryCount[techCategory] || 0) + 1;
        
        // Determine role based on node data and technology type
        let role: 'primary' | 'secondary' | 'optional' = 'secondary';
        
        // Check if node has explicit role or isMainTechnology flag
        if (node.data.isMainTechnology === true) {
          role = 'primary';
        } else if (node.data.optional === true) {
          role = 'optional';
        } else if (techCategory === 'database' || techCategory === 'backend') {
          role = 'primary'; // Core infrastructure is usually primary
        } else if (index < 2) {
          role = 'primary'; // First couple of components are usually primary
        }
        
        technologies.push({
          id: node.id,
          stack_id: stack.id,
          technology_id: node.data.id || node.id,
          technology_name: techName,
          category: techCategory,
          role: role
        });
        
        // Use actual setup time from node data or estimate
        if (node.data.setupTimeHours) {
          totalSetupHours += node.data.setupTimeHours;
        } else {
          // Fallback estimates
          if (techCategory === 'database') totalSetupHours += 1;
          else if (techCategory === 'backend') totalSetupHours += 2;
          else if (techCategory === 'frontend') totalSetupHours += 2;
          else if (techCategory === 'devops') totalSetupHours += 3;
          else totalSetupHours += 1;
        }
        
        // Use actual pricing from node data
        if (node.data.pricing) {
          pricingSet.add(node.data.pricing);
        } else {
          // Most open-source technologies are free
          pricingSet.add('free');
        }
      }
    });
  }
  
  // Determine overall category based on technology mix
  if (categoryCount['frontend'] > 0 && categoryCount['backend'] > 0) {
    category = 'Full-stack';
  } else if (categoryCount['frontend'] > categoryCount['backend']) {
    category = 'Frontend';
  } else if (categoryCount['backend'] > 0) {
    category = 'Backend';
  } else if (categoryCount['mobile'] > 0) {
    category = 'Mobile';
  } else if (categoryCount['ai'] > 0) {
    category = 'AI/ML';
  } else if (categoryCount['devops'] > 0) {
    category = 'DevOps';
  }
  
  // Determine overall pricing
  if (pricingSet.has('paid')) {
    pricing = pricingSet.size > 1 ? 'mixed' : 'paid';
  } else if (pricingSet.has('freemium')) {
    pricing = pricingSet.size > 1 ? 'mixed' : 'freemium';
  }
  
  // Determine difficulty based on number of technologies and setup time
  if (technologies.length <= 3 && totalSetupHours <= 4) {
    difficulty = 'beginner';
  } else if (technologies.length <= 6 && totalSetupHours <= 8) {
    difficulty = 'intermediate';
  } else {
    difficulty = 'expert';
  }
  
  // Generate use cases based on category
  const useCases = stack.use_cases || [];
  if (useCases.length === 0) {
    switch (category) {
      case 'Full-stack':
        useCases.push('Web applications', 'SaaS platforms', 'E-commerce sites');
        break;
      case 'Frontend':
        useCases.push('Single page applications', 'Progressive web apps', 'Marketing websites');
        break;
      case 'Backend':
        useCases.push('REST APIs', 'Microservices', 'Data processing');
        break;
      case 'Mobile':
        useCases.push('Cross-platform mobile apps', 'Native mobile development', 'Hybrid applications');
        break;
      case 'AI/ML':
        useCases.push('Machine learning models', 'Natural language processing', 'Computer vision');
        break;
      default:
        useCases.push('Custom development', 'Rapid prototyping', 'Production applications');
    }
  }
  
  // Generate pros based on technologies
  const pros = [
    `${technologies.length} integrated technologies`,
    'Modern technology stack',
    difficulty === 'beginner' ? 'Easy to get started' : 'Scalable architecture'
  ];
  
  // Generate cons based on complexity
  const cons = [
    `${totalSetupHours} hours initial setup time`,
    difficulty === 'expert' ? 'Requires experienced developers' : 'Some configuration needed'
  ];
  
  // Generate installation steps
  const installationSteps = [
    'Set up development environment',
    'Install required dependencies',
    'Configure environment variables',
    'Initialize database connections',
    'Start development server',
    'Verify all services are running'
  ];
  
  return {
    id: stack.id,
    name: stack.name,
    slug: stack.id,
    description: stack.description || `A ${category.toLowerCase()} technology stack with ${technologies.length} integrated components.`,
    short_description: stack.description?.substring(0, 100) + '...' || `${category} stack with ${technologies.length} technologies`,
    category,
    difficulty,
    setup_time_hours: totalSetupHours,
    pricing,
    author: stack.author_id || 'Community',
    is_official: stack.is_official,
    created_at: stack.created_at,
    updated_at: stack.updated_at,
    technologies,
    use_cases: useCases,
    pros,
    cons,
    installation_steps: installationSteps,
    alternatives: [],
    usage_count: 0, // Will be updated with real stats later
    rating: 4.2 + Math.random() * 0.6 // Random rating between 4.2 and 4.8
  };
}

// Get usage count for a stack
async function getStackUsageCount(stackId: string): Promise<number> {
  const supabase = createClient();
  
  const { count, error } = await supabase
    .from('stack_usage_stats')
    .select('*', { count: 'exact', head: true })
    .eq('stack_id', stackId);

  if (error) {
    console.error('Error fetching usage count:', error);
    return 0;
  }

  return count || 0;
}

// Get all stacks with their details
export async function getStacks() {
  const supabase = createClient();
  
  // Fetch stacks with author information
  const { data: stacks, error } = await supabase
    .from('stacks')
    .select(`
      *,
      users!author_id (
        name,
        email
      )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stacks:', error);
    return [];
  }

  // Transform the data and add real usage counts
  const stacksWithDetails = await Promise.all(
    stacks.map(async (stack) => {
      // Extract author name from the joined data
      let authorName = 'Admin';
      if (stack.users && typeof stack.users === 'object') {
        const userData = stack.users as { email?: string; name?: string };
        // Get admin email from environment variable
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'julien.pessione83@gmail.com';
        if (userData.email === adminEmail) {
          authorName = 'Admin';
        } else if (userData.name) {
          authorName = userData.name;
        } else if (userData.email) {
          // Use email username as fallback
          authorName = userData.email.split('@')[0];
        }
      } else if (!stack.author_id) {
        // No author_id means it's an admin-created stack
        authorName = 'Admin';
      }
      
      const stackWithDetails = extractStackInfoFromNodes(stack);
      const usageCount = await getStackUsageCount(stack.id);
      return {
        ...stackWithDetails,
        author: authorName,
        usage_count: usageCount
      };
    })
  );

  return stacksWithDetails;
}

// Get a single stack by slug (using ID as slug)
export async function getStackBySlug(slug: string) {
  const supabase = createClient();
  
  // Fetch stack with author information
  const { data: stack, error } = await supabase
    .from('stacks')
    .select(`
      *,
      users!author_id (
        name,
        email
      )
    `)
    .eq('id', slug)
    .single();

  if (error || !stack) {
    console.error('Error fetching stack:', error);
    return null;
  }

  // Extract author name from the joined data
  let authorName = 'Admin';
  if (stack.users && typeof stack.users === 'object') {
    const userData = stack.users as { email?: string; name?: string };
    // Get admin email from environment variable
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'julien.pessione83@gmail.com';
    if (userData.email === adminEmail) {
      authorName = 'Admin';
    } else if (userData.name) {
      authorName = userData.name;
    } else if (userData.email) {
      // Use email username as fallback
      authorName = userData.email.split('@')[0];
    }
  } else if (!stack.author_id) {
    // No author_id means it's an admin-created stack
    authorName = 'Admin';
  }

  const stackWithDetails = extractStackInfoFromNodes(stack);
  const usageCount = await getStackUsageCount(stack.id);
  
  return {
    ...stackWithDetails,
    author: authorName,
    usage_count: usageCount
  };
}

// Track when someone clicks "Start Building Now"
export async function trackStackUsage(stackId: string, userId?: string) {
  const supabase = createClient();
  
  // Generate a session ID for anonymous users
  const sessionId = typeof window !== 'undefined' 
    ? sessionStorage.getItem('session_id') || crypto.randomUUID()
    : crypto.randomUUID();
  
  if (typeof window !== 'undefined' && !sessionStorage.getItem('session_id')) {
    sessionStorage.setItem('session_id', sessionId);
  }
  
  const { error } = await supabase
    .from('stack_usage_stats')
    .insert({
      stack_id: stackId,
      user_id: userId || null,
      session_id: sessionId
    });

  if (error) {
    console.error('Error tracking stack usage:', error);
  }
}

// Create a new stack (admin only)
export async function createStack(
  stackData: StackFormData,
  technologies: Omit<StackTechnology, 'id' | 'stack_id'>[],
  useCases: string[],
  pros?: string[],
  cons?: string[],
  installationSteps?: string[],
  alternatives?: string[]
) {
  const supabase = createClient();
  
  // Convert the form data into nodes format
  const nodes: StackNode[] = [];
  const connections: StackConnection[] = [];
  
  technologies.forEach((tech, index) => {
    const nodeId = `node-${index}`;
    nodes.push({
      id: nodeId,
      type: 'component',
      position: { x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 150 },
      data: {
        id: tech.technology_id,
        name: tech.technology_name,
        label: tech.technology_name,
        category: tech.category,
        optional: tech.role === 'optional'
      }
    });
  });
  
  // Build the stack object in the format expected by the database
  const newStackData: Omit<DatabaseStack, 'id' | 'created_at' | 'updated_at'> = {
    name: stackData.name,
    description: stackData.description,
    use_cases: useCases,
    author_id: null, // Admin created stacks don't have an author_id
    is_official: true,
    is_public: true,
    nodes,
    connections
  };
  
  // Insert the new stack
  const { data: newStack, error: stackError } = await supabase
    .from('stacks')
    .insert(newStackData)
    .select()
    .single();

  if (stackError || !newStack) {
    console.error('Error creating stack:', stackError);
    return null;
  }

  return newStack;
}

// Update a stack (admin only)
export async function updateStack(
  stackId: string,
  stackData: StackFormData,
  technologies?: Omit<StackTechnology, 'id' | 'stack_id'>[],
  useCases?: string[],
  pros?: string[],
  cons?: string[],
  installationSteps?: string[],
  alternatives?: string[]
) {
  const supabase = createClient();
  
  // Convert the form data into nodes format
  const nodes: StackNode[] = [];
  const connections: StackConnection[] = [];
  
  if (technologies) {
    technologies.forEach((tech, index) => {
      const nodeId = `node-${index}`;
      nodes.push({
        id: nodeId,
        type: 'component',
        position: { x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 150 },
        data: {
          id: tech.technology_id,
          name: tech.technology_name,
          label: tech.technology_name,
          category: tech.category,
          optional: tech.role === 'optional'
        }
      });
    });
  }
  
  // Build the stack update object
  const updateData: Partial<DatabaseStack> = {
    name: stackData.name,
    description: stackData.description,
    use_cases: useCases || [],
    is_official: stackData.is_official ?? true,
    is_public: true,
    nodes,
    connections,
    updated_at: new Date().toISOString()
  };
  
  // Update main stack data
  const { error: stackError } = await supabase
    .from('stacks')
    .update(updateData)
    .eq('id', stackId);

  if (stackError) {
    console.error('Error updating stack:', stackError);
    return false;
  }

  return true;
}

// Delete a stack (admin only)
export async function deleteStack(stackId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('stacks')
    .delete()
    .eq('id', stackId);

  if (error) {
    console.error('Error deleting stack:', error);
    return false;
  }

  return true;
}

// Check if user is admin
export async function isAdmin() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get admin email from environment variable, fallback to default if not set
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'julien.pessione83@gmail.com';
  
  return user?.email === adminEmail;
}