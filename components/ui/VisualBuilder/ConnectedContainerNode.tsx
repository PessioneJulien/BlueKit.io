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
  Minimize2,
  Maximize2,
  Server,
  Network,
  Box,
  Zap,
  ArrowRight,
  Circle
} from 'lucide-react';
import { NodeData } from './CanvasNode';

export interface ConnectedContainerNodeData extends NodeData {
  isContainer: true;
  containerType: 'docker' | 'kubernetes';
  connectedServices: {
    id: string;
    name: string;
    port: string;
    status: 'connected' | 'disconnected' | 'pending';
  }[];
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

export const ConnectedContainerNode = memo<NodeProps<ConnectedContainerNodeData>>(({ 
  data,
  selected 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const {
    id,
    name,
    description,
    containerType,
    connectedServices = [],
    ports = [],
    replicas,
    status,
    resources,
    width = 300,
    height = 200,
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
        return <Box className="h-6 w-6 text-blue-400" />;
      case 'kubernetes':
        return <Layers className="h-6 w-6 text-green-400" />;
      default:
        return <Server className="h-6 w-6 text-gray-400" />;
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

  const getServiceStatusColor = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'connected':
        return 'text-green-400';
      case 'disconnected':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div
      className={cn(
        'bg-slate-800/90 backdrop-blur-sm border-2 rounded-lg shadow-xl transition-all duration-200',
        selected ? 'border-blue-500 shadow-blue-500/20' : 'border-slate-600',
        'hover:border-slate-500'
      )}
      style={{ width, height }}
    >
      {/* Connection Handles - Multiple handles for different services */}
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
      
      {/* Additional handles for services */}
      {connectedServices.slice(0, 3).map((service, index) => (
        <Handle
          key={service.id}
          type="source"
          position={Position.Right}
          id={`service-${service.id}`}
          className="w-2 h-2 bg-blue-500 border border-blue-300"
          style={{
            top: 40 + (index * 25),
            right: -4
          }}
        />
      ))}

      {/* Container Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
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

      {/* Container Content */}
      <div className="p-3">
        {/* Description */}
        {!isCompact && (
          <p className="text-xs text-slate-400 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Connected Services */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Network className="h-3 w-3" />
            Services connectés ({connectedServices.length})
          </div>
          
          {connectedServices.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-2">
              Aucun service connecté
            </div>
          ) : (
            <div className="space-y-1">
              {connectedServices.slice(0, isCompact ? 2 : 4).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between bg-slate-700/50 rounded px-2 py-1"
                >
                  <div className="flex items-center gap-2">
                    <Circle 
                      className={cn(
                        'h-2 w-2 fill-current',
                        getServiceStatusColor(service.status)
                      )}
                    />
                    <span className="text-xs text-slate-300">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      :{service.port}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-slate-500" />
                  </div>
                </div>
              ))}
              
              {connectedServices.length > (isCompact ? 2 : 4) && (
                <div className="text-xs text-slate-500 text-center">
                  +{connectedServices.length - (isCompact ? 2 : 4)} autres
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ports Section */}
        {ports.length > 0 && !isCompact && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="flex items-center gap-2 text-xs text-slate-300 mb-2">
              <Zap className="h-3 w-3" />
              Ports exposés
            </div>
            <div className="flex flex-wrap gap-1">
              {ports.slice(0, 4).map((port) => (
                <Badge key={port} variant="secondary" className="text-xs">
                  {port}
                </Badge>
              ))}
              {ports.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{ports.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Container Stats */}
        {showDetails && (
          <div className="absolute inset-x-3 bottom-3 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Ressources:</span>
                <div className="text-slate-200 mt-1">
                  <div>CPU: {resources.cpu}</div>
                  <div>RAM: {resources.memory}</div>
                </div>
              </div>
              <div>
                <span className="text-slate-400">Réseau:</span>
                <div className="text-slate-200 mt-1">
                  <div>{connectedServices.length} services</div>
                  {networks.length > 0 && <div>Networks: {networks.join(', ')}</div>}
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
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
              onClick={() => {
                setShowMenu(false);
                // TODO: Manage connections
              }}
            >
              <Network className="h-4 w-4" />
              Connexions
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

ConnectedContainerNode.displayName = 'ConnectedContainerNode';