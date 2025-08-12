'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ReactFlowCanvas } from './ReactFlowCanvas';
import { PresentationToolbar } from './PresentationToolbar';
import { NodeData, NodePosition } from './CanvasNode';
import { Connection } from './ConnectionLine';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Info } from 'lucide-react';

interface CanvasNode extends NodeData {
  position: NodePosition;
  isCompact?: boolean;
  width?: number;
  height?: number;
  documentation?: string;
}

interface PresentationStack {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  connections: Connection[];
  createdAt?: Date;
  author?: {
    name: string;
    avatar?: string;
  };
}

interface PresentationModeProps {
  stack: PresentationStack;
  initialEditMode?: boolean;
  showAuthor?: boolean;
  allowEdit?: boolean;
  onSave?: (stack: PresentationStack) => void;
  className?: string;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  stack,
  initialEditMode = false,
  showAuthor = true,
  allowEdit = false, // Toujours désactivé en présentation
  onSave,
  className
}) => {
  const [isEditMode, setIsEditMode] = useState(false); // Toujours en mode vue
  const [nodes, setNodes] = useState<CanvasNode[]>(stack.nodes);
  const [connections, setConnections] = useState<Connection[]>(stack.connections);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    const pricingTypes = Array.from(new Set(nodes.map(node => node.pricing)));
    const totalCost = pricingTypes.includes('paid') ? 'paid' : 
                     pricingTypes.includes('freemium') ? 'freemium' : 'free';

    return {
      totalSetupTime,
      averageDifficulty,
      categories,
      hasIncompatible,
      nodeCount: nodes.length,
      connectionCount: connections.length,
      totalCost,
      technologies: nodes.filter(n => n.isMainTechnology).length,
      tools: nodes.filter(n => !n.isMainTechnology).length
    };
  }, [nodes, connections]);

  const handleDocumentationSave = (nodeId: string, documentation: string) => {
    const updatedNodes = nodes.map(node => 
      node.id === nodeId ? { ...node, documentation } : node
    );
    setNodes(updatedNodes);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...stack,
        nodes,
        connections
      });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={cn(
      'flex flex-col h-screen max-h-screen bg-slate-950 text-white overflow-hidden',
      isFullscreen && 'fixed inset-0 z-50',
      className
    )}>
      {/* Presentation Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <h1 className="text-xl font-bold text-white">
              {stack.name}
            </h1>
            <Badge variant="default" size="sm" className="bg-blue-600">
              Presentation
            </Badge>
          </div>
          
          {showAuthor && stack.author && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>by</span>
              <span className="text-slate-200 font-medium">{stack.author.name}</span>
            </div>
          )}
        </div>

        <PresentationToolbar
          isEditMode={false} // Toujours en mode vue
          allowEdit={false} // Édition désactivée
          showSidebar={showSidebar}
          onToggleEdit={undefined} // Pas de toggle d'édition
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          onFullscreen={toggleFullscreen}
          onSave={undefined} // Pas de sauvegarde
          canSave={false} // Pas de sauvegarde
          stackId={stack.id}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Info Sidebar */}
        {showSidebar && (
          <div className="w-80 border-r border-slate-700 bg-slate-900/30 backdrop-blur-md flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-2">Stack Overview</h2>
              <p className="text-sm text-slate-300">{stack.description}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Statistics */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-400">Technologies</span>
                      <div className="text-white font-semibold">{stackStats.technologies}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Tools</span>
                      <div className="text-white font-semibold">{stackStats.tools}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Setup Time</span>
                      <div className="text-white font-semibold">{stackStats.totalSetupTime}h</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Connections</span>
                      <div className="text-white font-semibold">{stackStats.connectionCount}</div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-700">
                    <div className="flex justify-between items-center text-sm mb-2">
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
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Cost</span>
                      <Badge 
                        variant={
                          stackStats.totalCost === 'free' ? 'success' :
                          stackStats.totalCost === 'freemium' ? 'warning' : 'danger'
                        }
                        size="sm"
                      >
                        {stackStats.totalCost}
                      </Badge>
                    </div>
                  </div>

                  {stackStats.hasIncompatible && (
                    <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded mt-2">
                      <Info className="h-4 w-4 text-red-400" />
                      <span className="text-xs text-red-300">
                        Contains incompatible components
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Categories */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-sm">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {stackStats.categories.map(category => (
                      <Badge key={category} variant="secondary" size="sm" className="capitalize">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Technologies List */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-sm">Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {nodes.filter(n => n.isMainTechnology).map(node => (
                      <div key={node.id} className="flex items-center justify-between text-sm">
                        <span className="text-white">{node.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" size="sm" className="bg-slate-700">{node.difficulty}</Badge>
                          <span className="text-slate-400 text-xs">{node.setupTimeHours}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <ReactFlowCanvas
            nodes={nodes}
            connections={connections}
            onNodesChange={undefined} // Pas de modification en présentation
            onConnectionsChange={undefined} // Pas de modification des connexions
            onDocumentationSave={handleDocumentationSave}
            onAddSubTechnology={undefined} // Pas d'ajout en présentation
            className="flex-1"
            // Mode présentation : lecture seule avec interactions limitées
            nodesDraggable={false} // Pas de déplacement
            nodesConnectable={false} // Pas de nouvelles connexions
            elementsSelectable={true} // Permettre sélection pour documentation
            isReadOnly={true} // Toujours en lecture seule
          />
        </div>
      </div>
    </div>
  );
};