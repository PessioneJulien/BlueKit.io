import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { serverStacksApi } from '@/lib/api/stacks';
import type { UpdateStackRequest } from '@/lib/types/database-models';

// Validation schemas
const updateStackSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  short_description: z.string().min(1).max(500).optional(),
  category: z.string().min(1).max(100).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'expert']).optional(),
  setup_time_hours: z.number().int().min(1).max(100).optional(),
  pricing: z.enum(['free', 'freemium', 'paid', 'mixed']).optional(),
  technologies: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum(['frontend', 'backend', 'database', 'devops', 'mobile', 'ai', 'tool', 'other']),
    role: z.enum(['primary', 'secondary', 'optional'])
  })).optional(),
  use_cases: z.array(z.string()).optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  installation_steps: z.array(z.string()).optional(),
  alternatives: z.array(z.string()).optional()
});

// GET /api/stacks/[id] - Get a single stack
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stackId = params.id;
    
    // Try to get by ID first, then by slug if not found
    let stack = await serverStacksApi.getStack(stackId);
    
    if (!stack) {
      // Try to get by slug
      stack = await serverStacksApi.getStackBySlug(stackId);
    }
    
    if (!stack) {
      return NextResponse.json(
        { error: 'Stack not found' },
        { status: 404 }
      );
    }
    
    // Track usage
    await serverStacksApi.trackUsage(stack.id);
    
    return NextResponse.json(stack, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/stacks/[id]:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch stack',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/stacks/[id] - Update a stack
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stackId = params.id;
    const body = await request.json();
    
    // Validate input
    const validationResult = updateStackSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid stack data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const updateData: UpdateStackRequest = {
      id: stackId,
      ...validationResult.data
    };
    
    const updatedStack = await serverStacksApi.updateStack(stackId, updateData);
    
    return NextResponse.json(updatedStack);
  } catch (error) {
    console.error('Error in PUT /api/stacks/[id]:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Stack not found' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      {
        error: 'Failed to update stack',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/stacks/[id] - Delete a stack
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stackId = params.id;
    
    await serverStacksApi.deleteStack(stackId);
    
    return NextResponse.json(
      { message: 'Stack deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/stacks/[id]:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Stack not found' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      {
        error: 'Failed to delete stack',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}