'use client';

import { useStoreHydration } from '@/lib/hooks/useStoreHydration';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { VisualStackBuilder } from '@/components/ui/VisualBuilder/VisualStackBuilder';
import { useStackStore } from '@/lib/stores/stackStore';

export default function BuilderPage() {
  const isHydrated = useStoreHydration();
  const { saveStack } = useStackStore();
  
  // Show loading until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return <LoadingScreen message="Loading visual stack builder..." />
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
      <VisualStackBuilder onSave={handleSaveStack} />
    </div>
  );
}