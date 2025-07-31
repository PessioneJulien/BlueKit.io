'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStoreHydration } from '@/lib/hooks/useStoreHydration';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { VisualStackBuilder } from '@/components/ui/VisualBuilder/VisualStackBuilder';
import { useStackStore } from '@/lib/stores/stackStore';
import { getStackById } from '@/lib/data/stacksData';
import type { CanvasNode } from '@/lib/stores/stackStore';
import type { Connection } from '@/components/ui/VisualBuilder/ConnectionLine';

export default function BuilderPage() {
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

  const handleSaveStack = (stack: {
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
      technologies: stack.nodes.map(node => ({
        id: node.id,
        name: node.name,
        category: node.category,
        description: node.description,
        setupTimeHours: node.setupTimeHours,
        difficulty: node.difficulty,
        pricing: node.pricing,
        stars: 4.5 // Default rating
      })),
      author: 'You',
      stars: 0,
      uses: 0,
      difficulty: 'intermediate' as const,
      category: 'Custom',
      isPublic: false,
    };

    saveStack(stackData);
    
    // TODO: Show success message or redirect
    console.log('Stack saved:', stackData);
  };

  return (
    <div className="h-screen overflow-hidden">
      <VisualStackBuilder 
        initialStack={initialStack}
        onSave={handleSaveStack} 
      />
    </div>
  );
}