'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStoreHydration } from '@/lib/hooks/useStoreHydration';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { VisualStackBuilder } from '@/components/ui/VisualBuilder/VisualStackBuilder';
import { useStackStore } from '@/lib/stores/stackStore';
import { getStackById } from '@/lib/data/stacksData';
import type { CanvasNode } from '@/lib/stores/stackStore';
import type { Connection } from '@/components/ui/VisualBuilder/ConnectionLine';

function BuilderContent() {
  const searchParams = useSearchParams();
  const presetId = searchParams.get('preset');
  const isHydrated = useStoreHydration();
  const { saveStack } = useStackStore();
  const [initialStack, setInitialStack] = useState<{
    name: string;
    description: string;
    nodes: CanvasNode[];
    connections: Connection[];
  } | undefined>(undefined);
  const [isLoadingPreset, setIsLoadingPreset] = useState(!!presetId);
  
  // Handle save stack function (must be defined before conditional return)
  const handleSaveStack = useCallback((stack: {
    name: string;
    description: string;
    nodes: {
      id: string;
      name: string;
      category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'other' | 'testing' | 'ui-ux' | 'state-management' | 'routing' | 'documentation' | 'build-tools' | 'linting';
      description: string;
      setupTimeHours: number;
      difficulty: 'beginner' | 'intermediate' | 'expert';
      pricing: 'free' | 'freemium' | 'paid' | 'enterprise';
    }[];
    connections: {
      id: string;
      sourceNodeId: string;
      targetNodeId: string;
      type: string;
    }[];
  }) => {
    // Convert visual builder data to our stack format
    const stackData = {
      name: stack.name,
      description: stack.description,
      nodes: stack.nodes.map((node, index) => ({
        ...node,
        position: { x: index * 200, y: 100 }
      })) as CanvasNode[],
      connections: stack.connections.map(conn => ({
        ...conn,
        sourcePosition: { x: 0, y: 0 },
        targetPosition: { x: 0, y: 0 },
        type: conn.type as 'compatible' | 'incompatible' | 'neutral'
      })),
      is_public: false,
    };

    saveStack(stackData);
    
    // TODO: Show success message or redirect
    console.log('Stack saved:', stackData);
  }, [saveStack]);

  // Load preset data if provided
  useEffect(() => {
    if (presetId && isHydrated) {
      const presetStack = getStackById(presetId);
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
      }
      setIsLoadingPreset(false);
    }
  }, [presetId, isHydrated]);

  // Show loading until hydrated or preset is loaded
  if (!isHydrated || isLoadingPreset) {
    return <LoadingScreen message={isLoadingPreset ? 'Loading preset stack...' : 'Loading visual stack builder...'} />
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden">
      <VisualStackBuilder 
        initialStack={initialStack}
        onSave={handleSaveStack} 
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