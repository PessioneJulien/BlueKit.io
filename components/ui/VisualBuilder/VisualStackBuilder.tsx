'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ComponentPalette } from './ComponentPalette';
import { ReactFlowCanvas } from './ReactFlowCanvas';
import { NodeData, NodePosition, SubTechnology } from './CanvasNode';
import { Connection } from './ConnectionLine';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Save, 
  Download, 
  Share2, 
  Info,
  X,
  Layers,
  Code,
} from 'lucide-react';
import { ExportModal } from './ExportModal';
import { TemplatesModal } from './TemplatesModal';
import { StackTemplate } from '@/lib/data/stackTemplates';

interface CanvasNode extends NodeData {
  position: NodePosition;
  isCompact?: boolean;
  width?: number;
  height?: number;
  documentation?: string;
}

interface VisualStackBuilderProps {
  initialStack?: {
    name: string;
    description: string;
    nodes: CanvasNode[];
    connections: Connection[];
  };
  onSave?: (stack: {
    name: string;
    description: string;
    nodes: CanvasNode[];
    connections: Connection[];
  }) => void;
  className?: string;
}

// Technologies principales avec leurs sous-technologies
const mainTechnologies: NodeData[] = [
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    description: 'A JavaScript library for building user interfaces',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: true,
    canAcceptSubTech: ['styling', 'state-management', 'routing', 'testing', 'documentation'],
    compatibleWith: ['typescript', 'nextjs', 'nodejs'],
    incompatibleWith: ['angular', 'vue']
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'frontend',
    description: 'The React Framework for Production',
    setupTimeHours: 3,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: true,
    canAcceptSubTech: ['styling', 'testing', 'documentation', 'deployment'],
    compatibleWith: ['react', 'typescript', 'vercel', 'supabase'],
    incompatibleWith: ['gatsby', 'create-react-app']
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'backend',
    description: 'JavaScript runtime built on Chrome\'s V8 engine',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: true,
    canAcceptSubTech: ['testing', 'linting', 'build-tool'],
    compatibleWith: ['express', 'typescript', 'mongodb', 'postgresql']
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'database',
    description: 'Powerful open source database',
    setupTimeHours: 3,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: true,
    canAcceptSubTech: ['testing'],
    compatibleWith: ['nodejs', 'supabase', 'prisma']
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'database',
    description: 'Document-based NoSQL database',
    setupTimeHours: 2,
    difficulty: 'beginner',
    pricing: 'freemium',
    isMainTechnology: true,
    canAcceptSubTech: ['testing'],
    compatibleWith: ['nodejs', 'express'],
    incompatibleWith: ['postgresql']
  }
];

// Sous-technologies/outils disponibles
const subTechnologies: SubTechnology[] = [
  // Styling
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    type: 'styling',
    description: 'A utility-first CSS framework',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'free'
  },
  {
    id: 'material-ui',
    name: 'Material-UI',
    type: 'styling',
    description: 'React components implementing Material Design',
    setupTimeHours: 2,
    difficulty: 'beginner',
    pricing: 'free'
  },
  {
    id: 'styled-components',
    name: 'Styled Components',
    type: 'styling',
    description: 'Visual primitives for the component age',
    setupTimeHours: 1,
    difficulty: 'intermediate',
    pricing: 'free'
  },
  // Testing
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
    id: 'cypress',
    name: 'Cypress',
    type: 'testing',
    description: 'End-to-end testing framework',
    setupTimeHours: 3,
    difficulty: 'intermediate',
    pricing: 'freemium'
  },
  {
    id: 'playwright',
    name: 'Playwright',
    type: 'testing',
    description: 'Cross-browser automation',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free'
  },
  // Documentation
  {
    id: 'storybook',
    name: 'Storybook',
    type: 'documentation',
    description: 'Tool for building UI components in isolation',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free'
  },
  // State Management
  {
    id: 'redux',
    name: 'Redux',
    type: 'state-management',
    description: 'Predictable state container',
    setupTimeHours: 3,
    difficulty: 'intermediate',
    pricing: 'free'
  },
  {
    id: 'zustand',
    name: 'Zustand',
    type: 'state-management',
    description: 'Small, fast state management',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'free'
  },
  // Routing
  {
    id: 'react-router',
    name: 'React Router',
    type: 'routing',
    description: 'Declarative routing for React',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'free'
  }
];

// Map sub-technology types to display categories
const mapSubTechTypeToCategory = (subTechType: string): NodeData['category'] => {
  const mapping: Record<string, NodeData['category']> = {
    'styling': 'ui-ux',
    'testing': 'testing',
    'documentation': 'documentation',
    'state-management': 'state-management',
    'routing': 'routing',
    'build-tool': 'build-tools',
    'linting': 'linting',
    'deployment': 'devops'
  };
  return mapping[subTechType] || 'other';
};

// Combine all available components
const availableComponents: NodeData[] = [
  ...mainTechnologies,
  // Convert sub-technologies to NodeData format for palette display
  ...subTechnologies.map(subTech => ({
    id: subTech.id,
    name: subTech.name,
    category: mapSubTechTypeToCategory(subTech.type),
    description: subTech.description,
    setupTimeHours: subTech.setupTimeHours,
    difficulty: subTech.difficulty,
    pricing: subTech.pricing,
    isMainTechnology: false
  }))
];

export const VisualStackBuilder: React.FC<VisualStackBuilderProps> = ({
  initialStack,
  onSave,
  className
}) => {
  const [stackName, setStackName] = useState(initialStack?.name || '');
  const [stackDescription, setStackDescription] = useState(initialStack?.description || '');
  const [nodes, setNodes] = useState<CanvasNode[]>(initialStack?.nodes || []);
  const [connections, setConnections] = useState<Connection[]>(initialStack?.connections || []);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'components' | 'export'>('components');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  // Get used component IDs
  const usedComponentIds = useMemo(() => nodes.map(node => node.id), [nodes]);

  // Handle template selection
  const handleTemplateSelect = (template: StackTemplate) => {
    setStackName(template.name);
    setStackDescription(template.description);
    setNodes(template.nodes);
    setConnections(template.connections);
  };

  // Handle documentation save
  const handleDocumentationSave = useCallback((nodeId: string, documentation: string) => {
    const updatedNodes = nodes.map(node => 
      node.id === nodeId ? { ...node, documentation } : node
    );
    setNodes(updatedNodes);
  }, [nodes]);

  // Add sub-technology to main component
  const handleAddSubTechnology = useCallback((subTechId: string, mainTechId: string) => {
    const subTech = subTechnologies.find(st => st.id === subTechId);
    const mainTech = nodes.find(n => n.id === mainTechId);
    
    if (!subTech || !mainTech || !mainTech.canAcceptSubTech?.includes(subTech.type)) {
      return;
    }

    // Check if sub-tech is already added
    if (mainTech.subTechnologies?.some(st => st.id === subTechId)) {
      return;
    }

    const updatedNodes = nodes.map(node => {
      if (node.id === mainTechId) {
        const newSubTechnologies = [...(node.subTechnologies || []), subTech];
        const isCompact = node.isCompact ?? true;
        
        // Adjust height to accommodate new sub-technology
        const newHeight = isCompact ? 
          (newSubTechnologies.length > 0 ? Math.min(120 + (newSubTechnologies.length * 10), 200) : 80) : 
          (newSubTechnologies.length > 0 ? Math.min(180 + (newSubTechnologies.length * 15), 280) : 140);
        
        return {
          ...node,
          subTechnologies: newSubTechnologies,
          height: newHeight
        };
      }
      return node;
    });

    setNodes(updatedNodes);
  }, [nodes]);

  // Handle dropping component from palette
  const handleDropComponent = useCallback((component: NodeData, position: { x: number; y: number }) => {
    if (usedComponentIds.includes(component.id)) return;

    // If it's a sub-technology, try to add it to a compatible main technology
    if (!component.isMainTechnology) {
      const subTech = subTechnologies.find(st => st.id === component.id);
      if (subTech) {
        const compatibleMainTech = nodes.find(node => 
          node.isMainTechnology && 
          node.canAcceptSubTech?.includes(subTech.type) &&
          !node.subTechnologies?.some(st => st.id === subTech.id)
        );
        
        if (compatibleMainTech) {
          handleAddSubTechnology(component.id, compatibleMainTech.id);
          return;
        }
      }
      // If no compatible main tech found, don't add it as standalone
      return;
    }

    const newNode: CanvasNode = {
      ...component,
      position,
      isCompact: true,
      width: 200,
      height: 80
    };

    setNodes(prev => [...prev, newNode]);
  }, [usedComponentIds, handleAddSubTechnology, nodes]);

  // Add component to canvas
  const handleAddComponent = useCallback((component: NodeData) => {
    if (usedComponentIds.includes(component.id)) return;

    // If it's a sub-technology, try to add it to a compatible main technology
    if (!component.isMainTechnology) {
      const subTech = subTechnologies.find(st => st.id === component.id);
      if (subTech) {
        const compatibleMainTech = nodes.find(node => 
          node.isMainTechnology && 
          node.canAcceptSubTech?.includes(subTech.type) &&
          !node.subTechnologies?.some(st => st.id === subTech.id)
        );
        
        if (compatibleMainTech) {
          handleAddSubTechnology(component.id, compatibleMainTech.id);
          return;
        }
      }
      // If no compatible main tech found, don't add it as standalone
      return;
    }

    // Find a good position for the new node
    const canvasWidth = 2000;
    const canvasHeight = 1500;
    const nodeWidth = 200;
    const nodeHeight = 80;
    const padding = 20;

    let position: NodePosition = { x: padding, y: padding };

    // Try to find a non-overlapping position
    for (let y = padding; y < canvasHeight - nodeHeight; y += nodeHeight + padding) {
      for (let x = padding; x < canvasWidth - nodeWidth; x += nodeWidth + padding) {
        const testPosition = { x, y };
        const overlaps = nodes.some(node => 
          Math.abs(node.position.x - testPosition.x) < nodeWidth + padding &&
          Math.abs(node.position.y - testPosition.y) < nodeHeight + padding
        );
        
        if (!overlaps) {
          position = testPosition;
          break;
        }
      }
      if (position.x !== padding || position.y !== padding) break;
    }

    const newNode: CanvasNode = {
      ...component,
      position,
      isCompact: true, // Start in compact mode
      width: 200,
      height: 80
    };

    setNodes(prev => [...prev, newNode]);
  }, [handleAddSubTechnology, nodes, usedComponentIds]);

  // Calculate stack statistics
  const stackStats = useMemo(() => {
    const totalSetupTime = nodes.reduce((sum, node) => sum + node.setupTimeHours, 0);
    const difficulties = nodes.map(node => node.difficulty);
    const expertCount = difficulties.filter(d => d === 'expert').length;
    const beginnerCount = difficulties.filter(d => d === 'beginner').length;
    
    let averageDifficulty: 'beginner' | 'intermediate' | 'expert' = 'intermediate';
    if (expertCount > nodes.length / 2) {
      averageDifficulty = 'expert';
    } else if (beginnerCount > nodes.length / 2) {
      averageDifficulty = 'beginner';
    }

    const categories = Array.from(new Set(nodes.map(node => node.category)));
    const hasIncompatible = connections.some(conn => conn.type === 'incompatible');

    return {
      totalSetupTime,
      averageDifficulty,
      categories,
      hasIncompatible,
      nodeCount: nodes.length,
      connectionCount: connections.length
    };
  }, [nodes, connections]);

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave({
        name: stackName,
        description: stackDescription,
        nodes,
        connections
      });
    }
  };

  return (
    <div className={cn('flex h-screen bg-slate-950', className)}>
      {/* Component Palette Sidebar */}
      {showSidebar && (
        <div className="w-80 flex flex-col border-r border-slate-700">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Button
                variant={selectedTab === 'components' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTab('components')}
              >
                <Layers className="h-4 w-4 mr-1" />
                Components
              </Button>
              <Button
                variant={selectedTab === 'export' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTab('export')}
              >
                <Code className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Sidebar Content */}
          {selectedTab === 'components' && (
            <ComponentPalette
              availableComponents={availableComponents}
              subTechnologies={subTechnologies}
              onAddComponent={handleAddComponent}
              usedComponentIds={usedComponentIds}
              className="flex-1"
            />
          )}

          {selectedTab === 'export' && (
            <div className="flex-1 p-4 space-y-4">
              {/* Stack Info */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Stack Name
                  </label>
                  <Input
                    value={stackName}
                    onChange={(e) => setStackName(e.target.value)}
                    placeholder="My Awesome Stack"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Description
                  </label>
                  <textarea
                    value={stackDescription}
                    onChange={(e) => setStackDescription(e.target.value)}
                    placeholder="Describe your technology stack..."
                    className="w-full h-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 resize-none text-sm"
                  />
                </div>
              </div>

              {/* Statistics */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-sm">Stack Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Components</span>
                    <span className="text-slate-200">{stackStats.nodeCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Connections</span>
                    <span className="text-slate-200">{stackStats.connectionCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Setup Time</span>
                    <span className="text-slate-200">{stackStats.totalSetupTime}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Difficulty</span>
                    <Badge 
                      variant={
                        stackStats.averageDifficulty === 'beginner' ? 'success' :
                        stackStats.averageDifficulty === 'intermediate' ? 'warning' : 'danger'
                      }
                      size="sm"
                    >
                      {stackStats.averageDifficulty}
                    </Badge>
                  </div>
                  {stackStats.hasIncompatible && (
                    <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded mt-2">
                      <Info className="h-4 w-4 text-red-400" />
                      <span className="text-xs text-red-300">
                        Incompatible components detected
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={handleSave}
                  disabled={!stackName || nodes.length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Stack
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setShowExportModal(true)}
                    disabled={nodes.length === 0}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-4">
            {!showSidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(true)}
              >
                <Layers className="h-4 w-4 mr-2" />
                Show Sidebar
              </Button>
            )}
            
            <div className="text-slate-300">
              <h1 className="font-semibold">
                {stackName || 'Untitled Stack'}
              </h1>
              <p className="text-sm text-slate-500">
                Visual Stack Builder
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowTemplatesModal(true)}
            >
              <Layers className="h-4 w-4 mr-1" />
              Templates
            </Button>
            <Badge variant="default" size="sm">
              {stackStats.nodeCount} components
            </Badge>
            <Badge variant="default" size="sm">
              {stackStats.connectionCount} connections
            </Badge>
          </div>
        </div>

        {/* Canvas */}
        <ReactFlowCanvas
          nodes={nodes}
          connections={connections}
          onNodesChange={setNodes}
          onConnectionsChange={(newConnections) => {
            const convertedConnections: Connection[] = newConnections.map(conn => ({
              ...conn,
              sourcePosition: { x: 0, y: 0 },
              targetPosition: { x: 0, y: 0 },
              type: conn.type as 'compatible' | 'incompatible' | 'neutral'
            }));
            setConnections(convertedConnections);
          }}
          onDocumentationSave={handleDocumentationSave}
          onAddSubTechnology={handleAddSubTechnology}
          onDropComponent={handleDropComponent}
          availableSubTechnologies={subTechnologies}
          className="flex-1"
        />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        stackName={stackName}
        stackDescription={stackDescription}
        nodes={nodes}
        connections={connections}
      />

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
};