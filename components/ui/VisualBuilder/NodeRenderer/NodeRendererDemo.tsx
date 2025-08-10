'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ContainerNodeRenderer, 
  StackNodeRenderer, 
  ToolNodeRenderer,
  NodeSize
} from './index';
import { NodeData } from '../CanvasNode';
import { Button } from '@/components/ui/Button';

// Mock data for demonstration
const mockContainerData = {
  id: 'container-1',
  name: 'Docker Container',
  category: 'devops' as const,
  description: 'Production-ready Docker container with optimized configuration',
  setupTimeHours: 2,
  difficulty: 'intermediate' as const,
  pricing: 'free' as const,
  isMainTechnology: true,
  isContainer: true as const,
  containerType: 'docker' as const,
  containedNodes: [
    {
      id: 'node-1',
      name: 'React App',
      category: 'frontend' as const,
      description: 'Main React application',
      setupTimeHours: 3,
      difficulty: 'intermediate' as const,
      pricing: 'free' as const,
      isMainTechnology: true
    },
    {
      id: 'node-2', 
      name: 'Node.js API',
      category: 'backend' as const,
      description: 'REST API server',
      setupTimeHours: 2,
      difficulty: 'intermediate' as const,
      pricing: 'free' as const,
      isMainTechnology: true
    },
    {
      id: 'node-3',
      name: 'PostgreSQL',
      category: 'database' as const,
      description: 'Primary database',
      setupTimeHours: 1,
      difficulty: 'beginner' as const,
      pricing: 'free' as const,
      isMainTechnology: true
    }
  ],
  ports: ['3000', '3001', '5432'],
  resources: {
    cpu: '2 CPU',
    memory: '4GB'
  },
  status: 'running' as const
};

const mockStackData: NodeData = {
  id: 'stack-1',
  name: 'Next.js',
  category: 'frontend',
  description: 'The React Framework for Production with full-stack capabilities',
  setupTimeHours: 3,
  difficulty: 'intermediate',
  pricing: 'free',
  isMainTechnology: true,
  subTechnologies: [
    {
      id: 'tailwind',
      name: 'Tailwind CSS',
      type: 'styling',
      description: 'Utility-first CSS framework',
      setupTimeHours: 1,
      difficulty: 'beginner',
      pricing: 'free'
    },
    {
      id: 'jest',
      name: 'Jest',
      type: 'testing',
      description: 'JavaScript testing framework',
      setupTimeHours: 2,
      difficulty: 'intermediate',
      pricing: 'free'
    },
    {
      id: 'storybook',
      name: 'Storybook',
      type: 'documentation',
      description: 'Tool for building UI components',
      setupTimeHours: 2,
      difficulty: 'intermediate', 
      pricing: 'free'
    }
  ],
  canAcceptSubTech: ['styling', 'testing', 'documentation', 'state-management'],
  resources: {
    cpu: '1 core',
    memory: '1GB'
  }
};

const mockToolData: NodeData = {
  id: 'tool-1',
  name: 'Tailwind CSS',
  category: 'ui-ux',
  description: 'Utility-first CSS framework for rapid UI development',
  setupTimeHours: 1,
  difficulty: 'beginner',
  pricing: 'free',
  isMainTechnology: false,
  type: 'styling'
};

/**
 * Composant de démonstration pour les nouveaux renderers
 */
export const NodeRendererDemo = () => {
  const [selectedType, setSelectedType] = useState<'container' | 'stack' | 'tool'>('container');
  const [selectedSize, setSelectedSize] = useState<NodeSize>('normal');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSelect = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const handleToggleSize = () => {
    const sizes: NodeSize[] = ['compact', 'normal', 'expanded'];
    const currentIndex = sizes.indexOf(selectedSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setSelectedSize(sizes[nextIndex]);
  };

  const handleConfigure = () => {
    console.log('Configure node');
  };

  const handleRemoveTool = (toolId: string) => {
    console.log('Remove tool:', toolId);
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Node Renderer Demo
          </h1>
          <p className="text-slate-400 mb-6">
            Démonstration des nouveaux renderers pour les 3 types de composants
          </p>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex gap-2">
              <span className="text-slate-300 font-medium">Type:</span>
              {(['container', 'stack', 'tool'] as const).map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <span className="text-slate-300 font-medium">Size:</span>
              {(['compact', 'normal', 'expanded'] as const).map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSize(size)}
                  className="capitalize"
                >
                  {size}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDragging(!isDragging)}
            >
              {isDragging ? 'Stop Dragging' : 'Simulate Drag'}
            </Button>
          </div>
        </div>

        {/* Demo Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Container Node */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              📦 Container Node
              {selectedType === 'container' && (
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              )}
            </h2>
            <div className="flex justify-center p-6 bg-slate-900/50 rounded-lg">
              <ContainerNodeRenderer
                data={mockContainerData}
                size={selectedType === 'container' ? selectedSize : 'normal'}
                isSelected={selectedNode === 'container-1'}
                isDragging={selectedType === 'container' && isDragging}
                onSelect={() => handleSelect('container-1')}
                onToggleSize={handleToggleSize}
                onConfigure={handleConfigure}
              />
            </div>
          </div>

          {/* Stack Node */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              ⚡ Stack Node
              {selectedType === 'stack' && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </h2>
            <div className="flex justify-center p-6 bg-slate-900/50 rounded-lg">
              <StackNodeRenderer
                data={mockStackData}
                size={selectedType === 'stack' ? selectedSize : 'normal'}
                isSelected={selectedNode === 'stack-1'}
                isDragging={selectedType === 'stack' && isDragging}
                onSelect={() => handleSelect('stack-1')}
                onToggleSize={handleToggleSize}
                onConfigure={handleConfigure}
                onRemoveTool={handleRemoveTool}
              />
            </div>
          </div>

          {/* Tool Node */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              🔧 Tool Node
              {selectedType === 'tool' && (
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              )}
            </h2>
            <div className="flex justify-center p-6 bg-slate-900/50 rounded-lg">
              <ToolNodeRenderer
                data={{ ...mockToolData, type: 'styling' }}
                size={selectedType === 'tool' ? selectedSize : 'normal'}
                isSelected={selectedNode === 'tool-1'}
                isDragging={selectedType === 'tool' && isDragging}
                isPaletteItem={true}
                onSelect={() => handleSelect('tool-1')}
                onToggleSize={handleToggleSize}
                onConfigure={handleConfigure}
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            className="bg-slate-800/50 p-6 rounded-lg border border-slate-700"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              🎨 Design System Cohérent
            </h3>
            <ul className="text-slate-400 space-y-1 text-sm">
              <li>• Couleurs et styles unifiés par type</li>
              <li>• Animations fluides et performantes</li>
              <li>• Responsive design intégré</li>
              <li>• Support accessibility</li>
            </ul>
          </motion.div>

          <motion.div 
            className="bg-slate-800/50 p-6 rounded-lg border border-slate-700"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              ⚡ Performance Optimisée
            </h3>
            <ul className="text-slate-400 space-y-1 text-sm">
              <li>• Components memoized</li>
              <li>• Lazy loading des détails</li>
              <li>• Animations GPU accelerated</li>
              <li>• Bundle size optimized</li>
            </ul>
          </motion.div>

          <motion.div 
            className="bg-slate-800/50 p-6 rounded-lg border border-slate-700"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              🔧 Developer Experience
            </h3>
            <ul className="text-slate-400 space-y-1 text-sm">
              <li>• TypeScript intégré</li>
              <li>• Props interfaces claires</li>
              <li>• Documentation complète</li>
              <li>• Tests unitaires</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};