// Core database models and TypeScript interfaces for the stack builder platform

export interface DatabaseStack {
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
  // Related data (populated via joins)
  technologies?: DatabaseStackTechnology[];
  use_cases?: DatabaseStackUseCase[];
  pros?: DatabaseStackPro[];
  cons?: DatabaseStackCon[];
  installation_steps?: DatabaseStackInstallationStep[];
  alternatives?: DatabaseStackAlternative[];
  ratings?: DatabaseStackRating[];
}

export interface DatabaseStackTechnology {
  id: string;
  stack_id: string;
  technology_id: string;
  technology_name: string;
  category: TechnologyCategory;
  role: 'primary' | 'secondary' | 'optional';
  created_at: string;
}

export interface DatabaseStackUseCase {
  id: string;
  stack_id: string;
  use_case: string;
  created_at: string;
}

export interface DatabaseStackPro {
  id: string;
  stack_id: string;
  pro: string;
  created_at: string;
}

export interface DatabaseStackCon {
  id: string;
  stack_id: string;
  con: string;
  created_at: string;
}

export interface DatabaseStackInstallationStep {
  id: string;
  stack_id: string;
  step_number: number;
  step_description: string;
  created_at: string;
}

export interface DatabaseStackAlternative {
  id: string;
  stack_id: string;
  alternative: string;
  created_at: string;
}

export interface DatabaseStackRating {
  id: string;
  stack_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  criteria?: {
    documentation: number;
    ease_of_use: number;
    performance: number;
    support: number;
  };
  created_at: string;
  updated_at: string;
}

export interface DatabaseStackUsageStat {
  id: string;
  stack_id: string;
  user_id?: string;
  session_id?: string;
  clicked_at: string;
}

// Technology/Component models
export interface DatabaseTechnology {
  id: string;
  name: string;
  description: string;
  category: TechnologyCategory;
  type: 'main' | 'sub';
  setup_time_hours: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  pricing: 'free' | 'freemium' | 'paid';
  documentation?: string;
  official_docs_url?: string;
  github_url?: string;
  npm_url?: string;
  logo_url?: string;
  tags?: string[];
  author_id?: string;
  is_official: boolean;
  compatible_with?: string[];
  created_at: string;
  updated_at: string;
}

// User models extending Supabase auth
export interface DatabaseUserProfile {
  id: string; // matches auth.users.id
  email: string;
  name?: string;
  avatar_url?: string;
  subscription_status?: 'free' | 'pro' | 'enterprise';
  subscription_id?: string;
  customer_id?: string;
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

// API request/response types
export interface CreateStackRequest {
  name: string;
  description: string;
  short_description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  setup_time_hours: number;
  pricing: 'free' | 'freemium' | 'paid' | 'mixed';
  technologies: {
    id: string;
    name: string;
    category: TechnologyCategory;
    role: 'primary' | 'secondary' | 'optional';
  }[];
  use_cases: string[];
  pros: string[];
  cons: string[];
  installation_steps: string[];
  alternatives: string[];
}

export interface UpdateStackRequest extends Partial<CreateStackRequest> {
  id: string;
}

export interface CreateTechnologyRequest {
  name: string;
  description: string;
  category: TechnologyCategory;
  type: 'main' | 'sub';
  setup_time_hours: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  pricing: 'free' | 'freemium' | 'paid';
  documentation?: string;
  official_docs_url?: string;
  github_url?: string;
  npm_url?: string;
  logo_url?: string;
  tags?: string[];
  compatible_with?: string[];
}

export interface UpdateTechnologyRequest extends Partial<CreateTechnologyRequest> {
  id: string;
}

// API response types
export interface StackApiResponse extends Omit<DatabaseStack, 'created_at' | 'updated_at'> {
  created_at: Date;
  updated_at: Date;
  technologies: {
    id: string;
    name: string;
    category: TechnologyCategory;
    role: 'primary' | 'secondary' | 'optional';
  }[];
  use_cases: string[];
  pros: string[];
  cons: string[];
  installation_steps: string[];
  alternatives: string[];
  // Computed fields
  average_rating?: number;
  rating_count?: number;
  usage_count?: number;
}

export interface TechnologyApiResponse extends Omit<DatabaseTechnology, 'created_at' | 'updated_at'> {
  created_at: Date;
  updated_at: Date;
  // Computed fields
  average_rating?: number;
  rating_count?: number;
  usage_count?: number;
}

// Query filter types
export interface StackFilters {
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  pricing?: 'free' | 'freemium' | 'paid' | 'mixed';
  technology?: string; // Filter by technology name/id
  search?: string; // Search in name, description, etc.
  sort_by?: 'rating' | 'usage' | 'recent' | 'alphabetical';
  limit?: number;
  offset?: number;
}

export interface TechnologyFilters {
  category?: TechnologyCategory;
  type?: 'main' | 'sub';
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  pricing?: 'free' | 'freemium' | 'paid';
  is_official?: boolean;
  search?: string;
  sort_by?: 'rating' | 'usage' | 'recent' | 'alphabetical';
  limit?: number;
  offset?: number;
}

// Utility types
export type TechnologyCategory = 
  | 'frontend' 
  | 'backend' 
  | 'database' 
  | 'devops' 
  | 'mobile' 
  | 'ai' 
  | 'tool' 
  | 'other';

export type StackCategory = 
  | 'Full-stack'
  | 'Frontend'
  | 'Backend'
  | 'Mobile'
  | 'AI/ML'
  | 'DevOps'
  | 'E-commerce'
  | 'Content'
  | 'Real-time'
  | 'Enterprise'
  | 'Microservices'
  | 'Data Science'
  | 'API'
  | 'Serverless'
  | 'Desktop'
  | 'IoT'
  | 'Blockchain'
  | 'Performance'
  | 'Rapid Development'
  | 'other';

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Validation schemas (for Zod integration)
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Rate limiting types
export interface RateLimitConfig {
  max_requests: number;
  window_ms: number;
  skip_successful_requests?: boolean;
}

// Cache types
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  key_prefix: string;
  enabled: boolean;
}

// Audit/logging types
export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}