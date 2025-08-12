import { NextRequest, NextResponse } from 'next/server';
import { serverStacksApi } from '@/lib/api/stacks';
import type { CreateStackRequest, StackFilters } from '@/lib/types/database-models';
import { 
  stackValidationSchemas, 
  validateData, 
  sanitize 
} from '@/lib/security/validation';
import { 
  withMiddleware,
  createCORSResponse,
  rateLimitRules 
} from '@/lib/middleware/api-middleware';

// GET /api/stacks - Get all stacks with filtering
export const GET = withMiddleware(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const rawFilters = Object.fromEntries(searchParams.entries());
    const validation = validateData(stackValidationSchemas.stackFilters, rawFilters);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: validation.error?.details
        },
        { status: 400 }
      );
    }

    const filters: StackFilters = validation.data!;
    
    // Sanitize search input if present
    if (filters.search) {
      filters.search = sanitize.text(filters.search);
    }
    
    const result = await serverStacksApi.getStacks(filters);
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  },
  {
    rateLimit: rateLimitRules.default
  }
);

// POST /api/stacks - Create a new stack
export const POST = withMiddleware(
  async (request: NextRequest, { user: _user }) => {
    const body = await request.json();
    
    // Validate input
    const validation = validateData(stackValidationSchemas.createStack, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid stack data',
          details: validation.error?.details
        },
        { status: 400 }
      );
    }

    const stackData: CreateStackRequest = validation.data!;
    
    // Sanitize text inputs
    stackData.name = sanitize.text(stackData.name);
    stackData.description = sanitize.markdown(stackData.description);
    stackData.short_description = sanitize.text(stackData.short_description);
    stackData.category = sanitize.text(stackData.category);
    
    // Sanitize arrays
    stackData.use_cases = stackData.use_cases.map(uc => sanitize.text(uc));
    stackData.pros = stackData.pros.map(pro => sanitize.text(pro));
    stackData.cons = stackData.cons.map(con => sanitize.text(con));
    stackData.installation_steps = stackData.installation_steps.map(step => sanitize.text(step));
    stackData.alternatives = stackData.alternatives.map(alt => sanitize.text(alt));
    
    // Sanitize technologies
    stackData.technologies = stackData.technologies.map(tech => ({
      ...tech,
      name: sanitize.text(tech.name)
    }));
    
    const newStack = await serverStacksApi.createStack(stackData);
    
    return NextResponse.json(newStack, { status: 201 });
  },
  {
    requireAuth: true,
    rateLimit: rateLimitRules.createOperations
  }
);

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return createCORSResponse(['GET', 'POST', 'OPTIONS']);
}