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
  Box
} from 'lucide-react';
import { NodeData } from './CanvasNode';

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
}

export const NestedContainerNode = memo<NodeProps<NestedContainerNodeData>>(({ 
  data,
  selected 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
    onToggleCompact
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
  const nodeHeight = 80;
  const nodeSpacing = 10;

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
      <div className="p-4 relative" style={{ height: height - headerHeight }}>
        {/* Container Description */}
        {!isCompact && (
          <p className="text-xs text-slate-400 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Contained Nodes Area */}
        <div className="relative h-full border-2 border-dashed border-slate-600 rounded-lg p-3">
          {containedNodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Plus className="h-8 w-8 mb-2" />
              <p className="text-sm">Glissez des composants ici</p>
              <p className="text-xs">pour les containeriser</p>
            </div>
          ) : (
            <div className="space-y-2">
              {containedNodes.map((node, index) => (
                <div
                  key={node.id}
                  className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 flex items-center gap-3"
                  style={{
                    position: 'absolute',
                    top: index * (nodeHeight + nodeSpacing),
                    left: 0,
                    right: 0,
                    height: nodeHeight
                  }}
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-200">{node.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{node.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {node.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {node.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {node.setupTimeHours}h
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Container Stats */}
        {showDetails && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Ressources:</span>
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
        )}
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
                // TODO: Open container settings
              }}
            >
              <Settings className="h-4 w-4" />
              Paramètres
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
    </div>
  );
});

NestedContainerNode.displayName = 'NestedContainerNode';