'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStoreHydration } from '@/lib/hooks/useStoreHydration';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { VisualStackBuilder } from '@/components/ui/VisualBuilder/VisualStackBuilder';
import { getStackById } from '@/lib/data/stacksData';
import { useStackStore, CanvasNode } from '@/lib/stores/stackStore';
import type { Connection } from '@/components/ui/VisualBuilder/ConnectionLine';

// Mock data - Same as presentation page
const mockStacks = {
  '66e116e3-07a8-4ec3-a8df-ae0880da35dc': {
    id: '66e116e3-07a8-4ec3-a8df-ae0880da35dc',
    name: 'Full-Stack Production Stack',
    description: 'A complete production-ready stack with containers and microservices architecture.',
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
      }
    ],
    createdAt: new Date('2024-01-15'),
    author: {
      name: 'John Doe',
      avatar: undefined
    }
  },
  '22c62461-279a-4977-9eba-50fa0fc8995e': {
    id: '22c62461-279a-4977-9eba-50fa0fc8995e',
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
      }
    ],
    createdAt: new Date('2024-01-15'),
    author: {
      name: 'John Doe',
      avatar: undefined
    }
  }
};

function BuilderContent() {
  const searchParams = useSearchParams();
  const presetId = searchParams.get('preset');
  const stackId = searchParams.get('stackId'); // Pour charger depuis la présentation
  const isHydrated = useStoreHydration();
  const { getStack } = useStackStore();
  const [initialStack, setInitialStack] = useState<{
    name: string;
    description: string;
    nodes: CanvasNode[];
    connections: Connection[];
  } | undefined>(undefined);
  const [isLoadingPreset, setIsLoadingPreset] = useState(!!(presetId || stackId));
  
  // Load preset or stack data if provided
  useEffect(() => {
    if ((presetId || stackId) && isHydrated) {
      // Si stackId est présent, charger depuis la présentation
      if (stackId) {
        // Utiliser la même logique que la page presentation
        const loadStackFromPresentation = async () => {
          try {
            console.log('Loading stack with ID:', stackId);
            
            // First try to fetch from Supabase using the store
            const fetchedStack = await getStack(stackId);
            
            if (fetchedStack && fetchedStack.nodes && fetchedStack.connections) {
              console.log('Stack loaded successfully from Supabase:', fetchedStack);
              setInitialStack({
                name: fetchedStack.name,
                description: fetchedStack.description,
                nodes: fetchedStack.nodes,
                connections: fetchedStack.connections
              });
            } else {
              // Fallback to mock data for existing presentations
              const mockStack = mockStacks[stackId as keyof typeof mockStacks];
              if (mockStack) {
                console.log('Using mock stack data:', mockStack);
                setInitialStack({
                  name: mockStack.name,
                  description: mockStack.description,
                  nodes: mockStack.nodes as CanvasNode[],
                  connections: mockStack.connections
                });
              } else {
                console.error('Stack not found in mock data');
              }
            }
          } catch (error) {
            console.error('Error loading stack:', error);
            
            // Fallback to mock data
            const mockStack = mockStacks[stackId as keyof typeof mockStacks];
            if (mockStack) {
              console.log('Using mock stack data as fallback:', mockStack);
              setInitialStack({
                name: mockStack.name,
                description: mockStack.description,
                nodes: mockStack.nodes as CanvasNode[],
                connections: mockStack.connections
              });
            }
          } finally {
            setIsLoadingPreset(false);
          }
        };
        loadStackFromPresentation();
      } else if (presetId) {
        // Essayer d'abord de charger depuis Supabase (pour les UUIDs), puis depuis les presets locaux
        const loadPreset = async () => {
          try {
            console.log('Loading preset with ID:', presetId);
            
            // Si l'ID ressemble à un UUID, essayer Supabase d'abord
            if (presetId.includes('-')) {
              console.log('UUID detected, trying Supabase first...');
              const fetchedStack = await getStack(presetId);
              
              if (fetchedStack && fetchedStack.nodes && fetchedStack.connections) {
                console.log('Preset loaded from Supabase:', fetchedStack);
                setInitialStack({
                  name: fetchedStack.name,
                  description: fetchedStack.description,
                  nodes: fetchedStack.nodes,
                  connections: fetchedStack.connections
                });
                setIsLoadingPreset(false);
                return;
              }
            }
            
            // Fallback sur les presets locaux
            console.log('Trying local presets...');
            const presetStack = getStackById(presetId);
            console.log('Found preset stack:', presetStack);
            
            if (presetStack) {
              // Convert StackData to VisualStackBuilder format
              const nodes: CanvasNode[] = presetStack.technologies.map((tech, index) => ({
                id: tech.id,
                name: tech.name,
                category: tech.category,
                description: `${tech.name} - ${tech.category}`,
                setupTimeHours: 2,
                difficulty: 'intermediate' as const,
                pricing: 'free' as const,
                isMainTechnology: tech.role === 'primary',
                position: {
                  x: 100 + (index % 3) * 300,
                  y: 100 + Math.floor(index / 3) * 200
                },
                isCompact: false,
                width: 250,
                height: 120
              }));

              // Create simple connections between primary technologies
              const primaryNodes = nodes.filter(n => n.isMainTechnology);
              const connections: Connection[] = primaryNodes.slice(0, -1).map((node, index) => ({
                id: `connection-${index}`,
                sourceNodeId: node.id,
                targetNodeId: primaryNodes[index + 1].id,
                type: 'compatible' as const,
                sourcePosition: { x: 0, y: 0 },
                targetPosition: { x: 0, y: 0 }
              }));

              setInitialStack({
                name: presetStack.name,
                description: presetStack.description,
                nodes,
                connections
              });
            } else {
              console.error('Preset not found with ID:', presetId);
              console.log('Available preset IDs might be:', ['modern-saas', 'ai-powered-app']); // Examples
            }
          } catch (error) {
            console.error('Error loading preset:', error);
          } finally {
            setIsLoadingPreset(false);
          }
        };
        loadPreset();
      }
    }
  }, [presetId, stackId, isHydrated, getStack]);

  // Show loading until hydrated or preset/stack is loaded
  if (!isHydrated || isLoadingPreset) {
    return <LoadingScreen message={isLoadingPreset ? 'Loading stack...' : 'Loading visual stack builder...'} />
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden">
      <VisualStackBuilder 
        initialStack={initialStack}
      />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BuilderContent />
    </Suspense>
  );
}