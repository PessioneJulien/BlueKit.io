'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PresentationMode } from '@/components/ui/VisualBuilder/PresentationMode';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useStackStore, Stack } from '@/lib/stores/stackStore';

// Mock data - In real app, this would come from Supabase
const mockStacks = {
  'next-supabase': {
    id: 'next-supabase',
    name: 'Next.js + Supabase Stack',
    description: 'A modern full-stack web application using Next.js for the frontend and Supabase for the backend services.',
    nodes: [
      {
        id: 'nextjs',
        name: 'Next.js',
        category: 'frontend' as const,
        description: 'The React Framework for Production',
        setupTimeHours: 3,
        difficulty: 'intermediate' as const,
        pricing: 'free' as const,
        isMainTechnology: true,
        position: { x: 100, y: 100 },
        isCompact: false,
        width: 300,
        height: 140,
        documentation: '# Next.js Setup\n\n## Installation\n```bash\nnpx create-next-app@latest my-app\n```\n\n## Configuration\n- Configure TypeScript\n- Setup Tailwind CSS\n- Configure environment variables'
      },
      {
        id: 'supabase',
        name: 'Supabase',
        category: 'backend' as const,
        description: 'Open source Firebase alternative',
        setupTimeHours: 2,
        difficulty: 'beginner' as const,
        pricing: 'freemium' as const,
        isMainTechnology: true,
        position: { x: 500, y: 100 },
        isCompact: false,
        width: 300,
        height: 140,
        documentation: '# Supabase Setup\n\n## Project Creation\n1. Create new project on supabase.com\n2. Copy project URL and anon key\n3. Setup database schema\n\n## Integration\n```bash\nnpm install @supabase/supabase-js\n```'
      },
      {
        id: 'vercel',
        name: 'Vercel',
        category: 'devops' as const,
        description: 'Platform for frontend frameworks',
        setupTimeHours: 1,
        difficulty: 'beginner' as const,
        pricing: 'freemium' as const,
        isMainTechnology: true,
        position: { x: 300, y: 300 },
        isCompact: true,
        width: 200,
        height: 80
      }
    ],
    connections: [
      {
        id: 'nextjs-supabase',
        sourceNodeId: 'nextjs',
        targetNodeId: 'supabase',
        type: 'compatible' as const,
        sourcePosition: { x: 0, y: 0 },
        targetPosition: { x: 0, y: 0 }
      },
      {
        id: 'nextjs-vercel',
        sourceNodeId: 'nextjs',
        targetNodeId: 'vercel',
        type: 'compatible' as const,
        sourcePosition: { x: 0, y: 0 },
        targetPosition: { x: 0, y: 0 }
      }
    ],
    createdAt: new Date('2024-01-15'),
    author: {
      name: 'John Doe',
      avatar: undefined
    }
  }
};

export default function PresentationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const stackId = params.id as string;
  const isEmbed = searchParams.get('embed') === 'true';
  const editMode = searchParams.get('edit') === 'true';
  
  const { getStack } = useStackStore();
  const [stack, setStack] = useState<Stack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStack = async () => {
      if (!stackId) {
        setError('No stack ID provided');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // First try to fetch from Supabase
        const fetchedStack = await getStack(stackId);
        
        if (fetchedStack) {
          setStack(fetchedStack);
        } else {
          // Fallback to mock data for existing presentations
          const mockStack = mockStacks[stackId as keyof typeof mockStacks];
          if (mockStack) {
            setStack(mockStack as any);
          } else {
            setError('Stack not found');
          }
        }
      } catch (error) {
        console.error('Failed to fetch stack:', error);
        
        // Fallback to mock data
        const mockStack = mockStacks[stackId as keyof typeof mockStacks];
        if (mockStack) {
          setStack(mockStack as any);
        } else {
          setError('Stack not found');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStack();
  }, [stackId, getStack]);

  const handleSave = async (updatedStack: Stack) => {
    if (updatedStack && updatedStack.id) {
      setStack(updatedStack);
      // TODO: Implement stack update in StackStore
      console.log('Saving stack to database:', updatedStack);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error || !stack) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <Card variant="glass" className="max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              Presentation Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              The requested stack presentation could not be found.
            </p>
            {!isEmbed && (
              <Link href="/builder">
                <Button variant="primary" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Builder
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Embed mode - minimal interface
  if (isEmbed) {
    return (
      <div className="h-screen">
        <PresentationMode
          stack={stack}
          initialEditMode={false}
          showAuthor={false}
          allowEdit={false}
          className="h-full"
        />
      </div>
    );
  }

  // Full presentation mode
  return (
    <div className="h-screen">
      <PresentationMode
        stack={stack}
        initialEditMode={editMode}
        showAuthor={true}
        allowEdit={true} // TODO: Check user permissions
        onSave={handleSave}
      />
    </div>
  );
}