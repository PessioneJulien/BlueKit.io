'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { 
  X, 
  MoreVertical, 
  Settings, 
  Info, 
  FileText, 
  Layers,
  Plus,
  Minimize2,
  Maximize2,
  Server,
  Box,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NodeData, ResourceStats } from './CanvasNode';
import { ResourceConfigModal } from './ResourceConfigModal';
import { PortVolumeModal } from './PortVolumeModal';
import { ComponentConfigModal } from './ComponentConfigModal';

export interface NestedContainerNodeData extends NodeData {
  isContainer: true;
  containerType: 'docker' | 'kubernetes';
  containedNodes: NodeData[];
  ports?: string[];
  networks?: string[];
  replicas?: number;
  status: 'running' | 'stopped' | 'pending';
  resources: {
    cpu: string;
    memory: string;
  };
  // Visual properties
  width: number;
  height: number;
  isCompact: boolean;
  onDelete: () => void;
  onToggleCompact: () => void;
  onConfigure?: (resources: ResourceStats, envVars: Record<string, string>) => void;
  onRemoveFromContainer?: (containerId: string, nodeId: string) => void;
  onDropComponent?: (component: NodeData, position: { x: number; y: number }) => void;
}

export const NestedContainerNode = memo<NodeProps<NestedContainerNodeData>>(({ 
  data,
  selected 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPortVolumeModal, setShowPortVolumeModal] = useState(false);
  const [selectedNodeConfig, setSelectedNodeConfig] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const {
    name,
    description,
    containerType,
    containedNodes,
    ports = [],
    replicas,
    status,
    resources,
    width = 400,
    height = 300,
    isCompact = false,
    onDelete,
    onToggleCompact,
    onConfigure,
    onRemoveFromContainer,
    onDropComponent
  } = data;

  const toggleMenu = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);

  const handleDelete = useCallback(() => {
    onDelete();
  }, [onDelete]);

  const handleToggleCompact = useCallback(() => {
    onToggleCompact();
  }, [onToggleCompact]);

  const handleConfigure = useCallback((resources: ResourceStats, envVars: Record<string, string>) => {
    if (onConfigure) {
      onConfigure(resources, envVars);
    }
  }, [onConfigure]);

  const getContainerIcon = () => {
    switch (containerType) {
      case 'docker':
        return <Box className="h-5 w-5 text-blue-400" />;
      case 'kubernetes':
        return <Layers className="h-5 w-5 text-green-400" />;
      default:
        return <Server className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'text-green-400 bg-green-500/20';
      case 'stopped':
        return 'text-red-400 bg-red-500/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const headerHeight = 60;

  // Debug: Log des données du conteneur
  console.log('NestedContainerNode render:', {
    name,
    containedNodesCount: containedNodes.length,
    containedNodes: containedNodes.map(n => ({ id: n.id, name: n.name }))
  });

  return (
    <div
      className={cn(
        'bg-slate-800/90 backdrop-blur-sm border-2 rounded-lg shadow-xl transition-all duration-200',
        selected ? 'border-blue-500 shadow-blue-500/20' : 'border-slate-600',
        'hover:border-slate-500'
      )}
      style={{ width, height }}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-slate-600 border-2 border-slate-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-slate-600 border-2 border-slate-400"
      />

      {/* Container Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          {getContainerIcon()}
          <div>
            <h3 className="font-medium text-slate-200 text-sm">{name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {containerType}
              </Badge>
              <div className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                getStatusColor()
              )}>
                {status}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleDetails}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <Info className="h-4 w-4" />
          </button>
          <button
            onClick={handleToggleCompact}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            {isCompact ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={toggleMenu}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Container Content Area */}
      <div className="p-3 relative" style={{ height: height - headerHeight }}>
        {/* Container Description */}
        {!isCompact && (
          <p className="text-xs text-slate-400 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Contained Nodes Area */}
        <div 
          className="relative h-full border-2 border-dashed border-slate-600 rounded-lg p-2 transition-colors duration-200 hover:border-slate-500"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('border-blue-400', 'bg-blue-500/5');
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('border-blue-400', 'bg-blue-500/5');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('border-blue-400', 'bg-blue-500/5');
            
            // Parse the dragged data
            const draggedData = e.dataTransfer.getData('application/json');
            if (draggedData) {
              try {
                const parsedData = JSON.parse(draggedData);
                console.log('Dropped data into container:', parsedData);
                
                // Check if it's a component drop
                if (parsedData.type === 'main-component' && parsedData.component && onDropComponent) {
                  // Calculate position relative to the container
                  const rect = e.currentTarget.getBoundingClientRect();
                  const position = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                  };
                  
                  // Call the drop handler
                  onDropComponent(parsedData.component, position);
                  console.log('Component dropped:', parsedData.component.name, 'into container:', data.name);
                }
              } catch (error) {
                console.error('Failed to parse dropped data:', error);
              }
            }
          }}
        >
          {containedNodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Plus className="h-8 w-8 mb-2" />
              <p className="text-sm">Glissez des composants ici</p>
              <p className="text-xs">pour les containeriser</p>
            </div>
          ) : (
            <div className="space-y-2 relative">
              {/* Services compacts avec pagination */}
              {containedNodes.slice(currentPage * 2, (currentPage + 1) * 2).map((node) => (
                <div
                  key={node.id}
                  className="bg-gradient-to-r from-slate-700/60 to-slate-600/40 border border-slate-500/30 rounded-lg p-1.5 flex items-center gap-2 relative hover:from-slate-600/60 hover:to-slate-500/40 transition-all duration-200"
                >
                  {/* Icon catégorie compact */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      node.category === 'frontend' ? 'bg-blue-500/20 text-blue-400' :
                      node.category === 'backend' ? 'bg-green-500/20 text-green-400' :
                      node.category === 'database' ? 'bg-purple-500/20 text-purple-400' :
                      node.category === 'devops' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {node.category === 'frontend' && '🎨'}
                      {node.category === 'backend' && '⚙️'}
                      {node.category === 'database' && '🗄️'}
                      {node.category === 'devops' && '🚀'}
                      {!['frontend', 'backend', 'database', 'devops'].includes(node.category) && '📦'}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header compact */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <h4 className="text-sm font-medium text-slate-100 truncate">{node.name}</h4>
                    </div>
                    
                    {/* Infos compactes */}
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <Badge variant="secondary" className="text-xs py-0 px-1">
                        {node.category}
                      </Badge>
                      {node.resources && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-blue-300">📊 {node.resources.cpu}</span>
                          <span className="text-green-300">💾 {node.resources.memory}</span>
                          {node.resources.storage && (
                            <span className="text-purple-300">💿 {node.resources.storage}</span>
                          )}
                          {node.resources.network && (
                            <span className="text-yellow-300">🌐 {node.resources.network}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions du composant */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Configurer le composant */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeConfig(node.id);
                      }}
                      className="p-1 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded transition-colors"
                      title="Configurer le composant"
                    >
                      <Settings className="h-3 w-3" />
                    </button>
                    
                    {/* Retirer du conteneur */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRemoveFromContainer && data.id) {
                          onRemoveFromContainer(data.id, node.id);
                        }
                      }}
                      className="p-1 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors"
                      title="Retirer du conteneur"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Pagination si plus de 2 composants */}
              {containedNodes.length > 2 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  
                  <div className="text-xs text-slate-400">
                    {currentPage * 2 + 1}-{Math.min((currentPage + 1) * 2, containedNodes.length)} / {containedNodes.length}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(Math.ceil(containedNodes.length / 2) - 1, currentPage + 1))}
                    disabled={currentPage >= Math.ceil(containedNodes.length / 2) - 1}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time Container Stats */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          {showDetails ? (
            <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Ressources totales:</span>
                  <div className="text-slate-200 mt-1">
                    <div>CPU: {resources.cpu}</div>
                    <div>RAM: {resources.memory}</div>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Services:</span>
                  <div className="text-slate-200 mt-1">
                    <div>{containedNodes.length} composants</div>
                    {ports.length > 0 && <div>Ports: {ports.join(', ')}</div>}
                    {replicas && <div>Réplicas: {replicas}</div>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Always show compact stats
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-300">
                  <span>📊 {resources.cpu}</span>
                  <span>💾 {resources.memory}</span>
                </div>
                <div className="text-slate-400">
                  {containedNodes.length} services
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute top-12 right-4 z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[160px]">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
              onClick={() => {
                setShowMenu(false);
                setShowConfigModal(true);
              }}
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
              onClick={() => {
                setShowMenu(false);
                setShowPortVolumeModal(true);
              }}
            >
              <Server className="h-4 w-4" />
              Ports & Volumes
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
              onClick={() => {
                setShowMenu(false);
                // TODO: Show container logs
              }}
            >
              <FileText className="h-4 w-4" />
              Logs
            </button>
            <div className="h-px bg-slate-700 my-1" />
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300"
              onClick={() => {
                setShowMenu(false);
                handleDelete();
              }}
            >
              <X className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        </>
      )}

      {/* Resource Configuration Modal */}
      <ResourceConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={handleConfigure}
        initialResources={resources}
        initialEnvVars={data.environmentVariables || {}}
        componentName={name}
      />

      {/* Port & Volume Configuration Modal */}
      <PortVolumeModal
        isOpen={showPortVolumeModal}
        onClose={() => setShowPortVolumeModal(false)}
        onSave={(ports, volumes) => {
          // TODO: Handle ports and volumes save
          console.log('Ports:', ports, 'Volumes:', volumes);
        }}
        initialPorts={ports.map((port, index) => ({
          id: `port-${index}`,
          containerPort: port,
          hostPort: port,
          protocol: 'tcp' as const,
          description: `Port ${port}`
        }))}
        initialVolumes={[]}
        containerName={name}
        containerType={containerType}
      />

      {/* Configuration Modal for Individual Components */}
      {selectedNodeConfig && (() => {
        const selectedNode = containedNodes.find(n => n.id === selectedNodeConfig);
        return selectedNode ? (
          <ComponentConfigModal
            isOpen={true}
            nodeName={`${selectedNode.name} (dans ${name})`}
            initialResources={selectedNode.resources || { cpu: '1 core', memory: '512MB' }}
            initialEnvVars={selectedNode.environmentVariables || {}}
            onSave={(resources, envVars) => {
              // TODO: Update individual component configuration
              console.log('Update node config:', selectedNode.name, resources, envVars);
              setSelectedNodeConfig(null);
            }}
            onClose={() => setSelectedNodeConfig(null)}
          />
        ) : null;
      })()}
    </div>
  );
});

NestedContainerNode.displayName = 'NestedContainerNode';