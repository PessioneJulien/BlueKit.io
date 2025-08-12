import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { RateLimitRule } from '@/lib/security/validation';

// Re-export rate limit rules for convenience
export { rateLimitRules } from '@/lib/security/validation';

// Types
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  statusCode: number;
}

export interface MiddlewareOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  rateLimit?: RateLimitRule;
  validateCSRF?: boolean;
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Authentication middleware
export class AuthMiddleware {
  static async authenticate(): Promise<{
    user: { id: string; email?: string; role?: string } | null;
    error: ApiError | null;
  }> {
    try {
      const supabase = await createServerClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return {
          user: null,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            statusCode: 401
          }
        };
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'user'
        },
        error: null
      };
    } catch (error) {
      return {
        user: null,
        error: {
          code: 'AUTH_ERROR',
          message: 'Authentication failed',
          details: error instanceof Error ? error.message : 'Unknown error',
          statusCode: 401
        }
      };
    }
  }

  static async requireAuth(request: NextRequest): Promise<{
    user: { id: string; email?: string; role?: string };
    error: ApiError | null;
  }> {
    const result = await this.authenticate(request);
    
    if (!result.user) {
      return {
        user: result.user!,
        error: result.error || {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          statusCode: 401
        }
      };
    }

    return {
      user: result.user,
      error: null
    };
  }

  static async requireAdmin(request: NextRequest): Promise<{
    user: { id: string; email?: string; role?: string };
    error: ApiError | null;
  }> {
    const result = await this.requireAuth(request);
    
    if (result.error) {
      return result;
    }

    // Check if user is admin
    const isAdmin = result.user.email === 'julien.pessione83@gmail.com' || 
                   result.user.role === 'admin';

    if (!isAdmin) {
      return {
        user: result.user,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
          statusCode: 403
        }
      };
    }

    return result;
  }
}

// Rate limiting middleware
export class RateLimitMiddleware {
  static async checkRateLimit(
    request: NextRequest, 
    rule: RateLimitRule,
    identifier?: string
  ): Promise<{
    allowed: boolean;
    error: ApiError | null;
    remaining: number;
    resetTime: number;
  }> {
    try {
      // Get identifier (user ID, IP, or custom)
      const key = identifier || this.getIdentifier(request);
      const now = Date.now();
      
      // Get current data for this identifier
      const current = rateLimitStore.get(key);
      
      // If no data or window has expired, reset
      if (!current || now > current.resetTime) {
        const resetTime = now + rule.windowMs;
        rateLimitStore.set(key, { count: 1, resetTime });
        
        return {
          allowed: true,
          error: null,
          remaining: rule.maxRequests - 1,
          resetTime
        };
      }
      
      // Check if limit exceeded
      if (current.count >= rule.maxRequests) {
        return {
          allowed: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: rule.message || 'Too many requests',
            statusCode: 429,
            details: {
              limit: rule.maxRequests,
              windowMs: rule.windowMs,
              resetTime: current.resetTime
            }
          },
          remaining: 0,
          resetTime: current.resetTime
        };
      }
      
      // Increment count
      current.count++;
      rateLimitStore.set(key, current);
      
      return {
        allowed: true,
        error: null,
        remaining: rule.maxRequests - current.count,
        resetTime: current.resetTime
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      // On error, allow the request
      return {
        allowed: true,
        error: null,
        remaining: rule.maxRequests,
        resetTime: Date.now() + rule.windowMs
      };
    }
  }

  private static getIdentifier(request: NextRequest): string {
    // Try to get user ID first
    const userId = request.headers.get('x-user-id');
    if (userId) return `user:${userId}`;
    
    // Fallback to IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || 'unknown';
    
    return `ip:${ip}`;
  }

  // Cleanup expired entries (call periodically)
  static cleanup(): void {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// Error handling middleware
export class ErrorMiddleware {
  static createErrorResponse(error: ApiError): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details })
        },
        timestamp: new Date().toISOString()
      },
      { status: error.statusCode }
    );
  }

  static handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      // Check for specific error types
      if (error.name === 'ValidationError') {
        return {
          code: 'VALIDATION_ERROR',
          message: error.message,
          statusCode: 400
        };
      }

      if (error.message.includes('duplicate key')) {
        return {
          code: 'DUPLICATE_ENTRY',
          message: 'Resource already exists',
          statusCode: 409
        };
      }

      if (error.message.includes('not found')) {
        return {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          statusCode: 404
        };
      }

      if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        return {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
          statusCode: 403
        };
      }

      return {
        code: 'INTERNAL_ERROR',
        message: error.message,
        statusCode: 500
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      statusCode: 500
    };
  }
}

// Logging middleware
export class LoggingMiddleware {
  static async logRequest(
    request: NextRequest,
    response: NextResponse,
    user?: { id: string; email?: string },
    duration?: number
  ): Promise<void> {
    try {
      const method = request.method;
      const url = request.url;
      const status = response.status;
      const userAgent = request.headers.get('user-agent');
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';

      const logEntry = {
        timestamp: new Date().toISOString(),
        method,
        url,
        status,
        user_id: user?.id,
        user_email: user?.email,
        ip,
        user_agent: userAgent,
        duration_ms: duration,
      };

      // In production, send to logging service
      console.log('[API]', JSON.stringify(logEntry));
      
      // Could also store in database for audit trails
    } catch (error) {
      console.error('Logging error:', error);
    }
  }

  static async logError(
    request: NextRequest,
    error: ApiError | Error,
    user?: { id: string; email?: string }
  ): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        method: request.method,
        url: request.url,
        error_code: error instanceof Error ? 'INTERNAL_ERROR' : error.code,
        error_message: error.message,
        user_id: user?.id,
        user_email: user?.email,
        stack: error instanceof Error ? error.stack : undefined,
      };

      console.error('[API ERROR]', JSON.stringify(logEntry));
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }
}

// Combined middleware wrapper
export function withMiddleware<T = Record<string, unknown>>(
  handler: (request: NextRequest, context?: T & { user?: { id: string; email?: string; role?: string } }) => Promise<NextResponse>,
  options: MiddlewareOptions = {}
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    const startTime = Date.now();
    let user: { id: string; email?: string; role?: string } | undefined;

    try {
      // Rate limiting
      if (options.rateLimit) {
        const rateLimitResult = await RateLimitMiddleware.checkRateLimit(
          request, 
          options.rateLimit
        );

        if (!rateLimitResult.allowed && rateLimitResult.error) {
          const response = ErrorMiddleware.createErrorResponse(rateLimitResult.error);
          response.headers.set('X-RateLimit-Limit', options.rateLimit.maxRequests.toString());
          response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
          response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
          return response;
        }
      }

      // Authentication
      if (options.requireAdmin) {
        const authResult = await AuthMiddleware.requireAdmin(request);
        if (authResult.error) {
          return ErrorMiddleware.createErrorResponse(authResult.error);
        }
        user = authResult.user;
      } else if (options.requireAuth) {
        const authResult = await AuthMiddleware.requireAuth(request);
        if (authResult.error) {
          return ErrorMiddleware.createErrorResponse(authResult.error);
        }
        user = authResult.user;
      }

      // Call the actual handler
      const response = await handler(request, { ...context, user });

      // Log successful request
      const duration = Date.now() - startTime;
      await LoggingMiddleware.logRequest(request, response, user, duration);

      return response;

    } catch (error) {
      console.error('Middleware error:', error);
      
      const apiError = ErrorMiddleware.handleError(error);
      await LoggingMiddleware.logError(request, apiError, user);
      
      return ErrorMiddleware.createErrorResponse(apiError);
    }
  };
}

// Specific middleware helpers
export const requireAuth = <T = Record<string, unknown>>(
  handler: (request: NextRequest, context?: T & { user?: { id: string; email?: string; role?: string } }) => Promise<NextResponse>
) => withMiddleware(handler, { requireAuth: true });

export const requireAdmin = <T = Record<string, unknown>>(
  handler: (request: NextRequest, context?: T & { user?: { id: string; email?: string; role?: string } }) => Promise<NextResponse>
) => withMiddleware(handler, { requireAdmin: true });

export const withRateLimit = <T = Record<string, unknown>>(
  handler: (request: NextRequest, context?: T & { user?: { id: string; email?: string; role?: string } }) => Promise<NextResponse>, 
  rule: RateLimitRule
) => withMiddleware(handler, { rateLimit: rule });

// CORS middleware
export function createCORSResponse(methods: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': methods.join(', '),
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400', // 24 hours
    }
  });
}

// Clean up rate limit store periodically (in production, this would be handled by Redis TTL)
setInterval(() => {
  RateLimitMiddleware.cleanup();
}, 60000); // Clean up every minute