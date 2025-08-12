import { z } from 'zod';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a server-side DOMPurify instance
const window = new JSDOM('').window;
const purify = DOMPurify(window as unknown as Window);

// Common validation schemas
export const commonSchemas = {
  id: z.string().uuid('Invalid UUID format'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  email: z.string().email('Invalid email format'),
  url: z.string().url('Invalid URL format').optional(),
  positiveInt: z.number().int().positive('Must be a positive integer'),
  nonEmptyString: z.string().min(1, 'Cannot be empty').trim(),
  htmlString: z.string().refine(
    (value) => {
      // Check for dangerous scripts or elements
      const dangerous = /<script|javascript:|data:|vbscript:|on\w+=/i;
      return !dangerous.test(value);
    },
    'Content contains potentially dangerous elements'
  ),
  markdownString: z.string().refine(
    (value) => {
      // Check for dangerous markdown patterns
      const dangerous = /<script|javascript:|data:|vbscript:|on\w+=/i;
      return !dangerous.test(value);
    },
    'Markdown contains potentially dangerous content'
  )
};

// Stack validation schemas
export const stackValidationSchemas = {
  createStack: z.object({
    name: commonSchemas.nonEmptyString.max(255, 'Name too long'),
    description: commonSchemas.markdownString.min(10, 'Description too short').max(5000, 'Description too long'),
    short_description: commonSchemas.nonEmptyString.max(500, 'Short description too long'),
    category: commonSchemas.nonEmptyString.max(100, 'Category too long'),
    difficulty: z.enum(['beginner', 'intermediate', 'expert'], {
      errorMap: () => ({ message: 'Difficulty must be beginner, intermediate, or expert' })
    }),
    setup_time_hours: z.number().int().min(1, 'Setup time must be at least 1 hour').max(100, 'Setup time too high'),
    pricing: z.enum(['free', 'freemium', 'paid', 'mixed'], {
      errorMap: () => ({ message: 'Pricing must be free, freemium, paid, or mixed' })
    }),
    technologies: z.array(z.object({
      id: commonSchemas.nonEmptyString,
      name: commonSchemas.nonEmptyString.max(100, 'Technology name too long'),
      category: z.enum(['frontend', 'backend', 'database', 'devops', 'mobile', 'ai', 'tool', 'other']),
      role: z.enum(['primary', 'secondary', 'optional'])
    })).min(1, 'At least one technology is required').max(20, 'Too many technologies'),
    use_cases: z.array(commonSchemas.nonEmptyString.max(200, 'Use case too long')).max(10, 'Too many use cases'),
    pros: z.array(commonSchemas.nonEmptyString.max(300, 'Pro too long')).max(10, 'Too many pros'),
    cons: z.array(commonSchemas.nonEmptyString.max(300, 'Con too long')).max(10, 'Too many cons'),
    installation_steps: z.array(commonSchemas.nonEmptyString.max(500, 'Installation step too long')).max(20, 'Too many installation steps'),
    alternatives: z.array(commonSchemas.nonEmptyString.max(100, 'Alternative too long')).max(10, 'Too many alternatives')
  }),

  updateStack: z.object({
    name: commonSchemas.nonEmptyString.max(255, 'Name too long').optional(),
    description: commonSchemas.markdownString.min(10, 'Description too short').max(5000, 'Description too long').optional(),
    short_description: commonSchemas.nonEmptyString.max(500, 'Short description too long').optional(),
    category: commonSchemas.nonEmptyString.max(100, 'Category too long').optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'expert']).optional(),
    setup_time_hours: z.number().int().min(1).max(100).optional(),
    pricing: z.enum(['free', 'freemium', 'paid', 'mixed']).optional(),
    technologies: z.array(z.object({
      id: commonSchemas.nonEmptyString,
      name: commonSchemas.nonEmptyString.max(100),
      category: z.enum(['frontend', 'backend', 'database', 'devops', 'mobile', 'ai', 'tool', 'other']),
      role: z.enum(['primary', 'secondary', 'optional'])
    })).min(1).max(20).optional(),
    use_cases: z.array(commonSchemas.nonEmptyString.max(200)).max(10).optional(),
    pros: z.array(commonSchemas.nonEmptyString.max(300)).max(10).optional(),
    cons: z.array(commonSchemas.nonEmptyString.max(300)).max(10).optional(),
    installation_steps: z.array(commonSchemas.nonEmptyString.max(500)).max(20).optional(),
    alternatives: z.array(commonSchemas.nonEmptyString.max(100)).max(10).optional()
  }),

  stackFilters: z.object({
    category: commonSchemas.nonEmptyString.optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'expert']).optional(),
    pricing: z.enum(['free', 'freemium', 'paid', 'mixed']).optional(),
    technology: commonSchemas.nonEmptyString.optional(),
    search: z.string().max(100, 'Search query too long').optional(),
    sort_by: z.enum(['rating', 'usage', 'recent', 'alphabetical']).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0)
  })
};

// Technology validation schemas
export const technologyValidationSchemas = {
  createTechnology: z.object({
    name: commonSchemas.nonEmptyString.max(100, 'Name too long'),
    description: commonSchemas.markdownString.min(10, 'Description too short').max(2000, 'Description too long'),
    category: z.enum(['frontend', 'backend', 'database', 'devops', 'mobile', 'ai', 'tool', 'other']),
    type: z.enum(['main', 'sub']),
    setup_time_hours: z.number().int().min(1).max(50),
    difficulty: z.enum(['beginner', 'intermediate', 'expert']),
    pricing: z.enum(['free', 'freemium', 'paid']),
    documentation: commonSchemas.markdownString.max(10000).optional(),
    official_docs_url: commonSchemas.url,
    github_url: commonSchemas.url,
    npm_url: commonSchemas.url,
    logo_url: commonSchemas.url,
    tags: z.array(commonSchemas.nonEmptyString.max(50)).max(10).optional(),
    compatible_with: z.array(commonSchemas.nonEmptyString).max(20).optional()
  })
};

// Review validation schemas
export const reviewValidationSchemas = {
  createReview: z.object({
    component_id: commonSchemas.id,
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: commonSchemas.markdownString.min(10, 'Comment too short').max(1000, 'Comment too long'),
    criteria: z.object({
      documentation: z.number().int().min(1).max(5),
      ease_of_use: z.number().int().min(1).max(5),
      performance: z.number().int().min(1).max(5),
      support: z.number().int().min(1).max(5)
    })
  })
};

// Input sanitization functions
export const sanitize = {
  /**
   * Sanitize HTML content to prevent XSS
   */
  html: (input: string): string => {
    return purify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
      ALLOWED_ATTR: ['class'],
      FORBID_SCRIPT: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'img', 'svg'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
    });
  },

  /**
   * Sanitize markdown content
   */
  markdown: (input: string): string => {
    // Basic markdown sanitization - remove potentially dangerous patterns
    return input
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },

  /**
   * Sanitize plain text
   */
  text: (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  },

  /**
   * Sanitize URL
   */
  url: (input: string): string => {
    try {
      const url = new URL(input);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
      return url.toString();
    } catch {
      throw new Error('Invalid URL format');
    }
  }
};

// Rate limiting types
export interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

// Common rate limit configurations
export const rateLimitRules = {
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests, please try again later.'
  },
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20,
    message: 'Too many requests, please try again later.'
  },
  createOperations: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many create operations, please try again later.'
  }
};

// CSRF protection
export class CSRFProtection {
  private static readonly SECRET_KEY = process.env.CSRF_SECRET || 'fallback-secret-key';
  
  static generateToken(userId: string): string {
    const timestamp = Date.now().toString();
    const payload = `${userId}:${timestamp}`;
    
    // Simple HMAC-style token (in production, use a proper crypto library)
    const hash = Buffer.from(payload + this.SECRET_KEY).toString('base64');
    return Buffer.from(`${payload}:${hash}`).toString('base64');
  }
  
  static validateToken(token: string, userId: string, maxAge: number = 3600000): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [userIdPart, timestamp, hash] = decoded.split(':');
      
      // Check user ID match
      if (userIdPart !== userId) return false;
      
      // Check token age
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > maxAge) return false;
      
      // Verify hash
      const expectedHash = Buffer.from(`${userIdPart}:${timestamp}` + this.SECRET_KEY).toString('base64');
      return hash === expectedHash;
      
    } catch {
      return false;
    }
  }
}

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Generic validation function
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: result.error.errors
        }
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: error instanceof Error ? error.message : 'Validation failed'
      }
    };
  }
}

// SQL injection protection
export const sqlSanitize = {
  /**
   * Escape SQL string literals
   */
  string: (input: string): string => {
    return input.replace(/'/g, "''");
  },

  /**
   * Validate and sanitize SQL identifiers (table names, column names)
   */
  identifier: (input: string): string => {
    // Only allow alphanumeric characters and underscores
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input)) {
      throw new Error('Invalid SQL identifier');
    }
    return input;
  },

  /**
   * Sanitize LIKE pattern
   */
  likePattern: (input: string): string => {
    return input.replace(/[%_]/g, '\\$&');
  }
};