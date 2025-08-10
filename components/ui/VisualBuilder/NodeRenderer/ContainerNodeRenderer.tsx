'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { 
  BaseNodeRenderer, 
  NodeHeader, 
  NodeStats, 
  NodeSize
} from './BaseNodeRenderer';
import { NodeData } from '../CanvasNode';
import { 
  Box, 
  Layers, 
  ChevronDown, 
  ChevronRight,
  Server,
  Plus,
  Settings,
  MoreVertical 
} from 'lucide-react';

export interface ContainerNodeData extends NodeData {
  isContainer: true;
  containerType: 'docker' | 'kubernetes';
  containedNodes?: NodeData[];
  ports?: string[];
  resources: {
    cpu: string;
    memory: string;
  };
  status?: 'running' | 'stopped' | 'pending';
}

interface ContainerNodeRendererProps {
  data: ContainerNodeData;
  size: NodeSize;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onToggleSize?: () => void;
  onConfigure?: () => void;
  className?: string;
}

/**
 * Renderer optimisé pour les containers (Docker/Kubernetes)
 * Focus sur la visualisation des services contenus et des ressources
 */
export const ContainerNodeRenderer = memo<ContainerNodeRendererProps>(({
  data,
  size,
  isSelected,
  isDragging,
  onSelect,
  onToggleSize,
  onConfigure,
  className
}) => {
  const [showContainedNodes, setShowContainedNodes] = useState(size !== 'compact');
  const { containerType, containedNodes = [], ports = [], resources, status = 'running' } = data;

  // Container-specific styling
  const getContainerIcon = () => {
    switch (containerType) {
      case 'docker':
        return <Box className="h-4 w-4 text-blue-400" />;
      case 'kubernetes':
        return <Layers className="h-4 w-4 text-green-400" />;
      default:
        return <Server className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Prepare badges
  const badges = [
    { label: containerType, variant: 'default' as const },
    ...(containedNodes.length > 0 ? [{ 
      label: `${containedNodes.length} service${containedNodes.length > 1 ? 's' : ''}`, 
      variant: 'success' as const 
    }] : [])
  ];

  // Prepare stats
  const stats = [
    { label: 'CPU', value: resources.cpu, icon: '📊' },
    { label: 'RAM', value: resources.memory, icon: '💾' },
    ...(ports.length > 0 ? [{ label: 'Ports', value: ports.length.toString(), icon: '🚪' }] : [])
  ];

  // Actions
  const actions = (
    <div className="flex items-center gap-1">
      {/* Status indicator */}
      <div className="flex items-center gap-1">
        <div className={cn('w-2 h-2 rounded-full', getStatusColor())} />
        <span className="text-xs text-slate-400 capitalize">{status}</span>
      </div>
      
      {size !== 'compact' && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfigure?.();
            }}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Configure container"
          >
            <Settings className="h-3 w-3" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowContainedNodes(!showContainedNodes);
            }}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Toggle contained services"
          >
            {showContainedNodes ? 
              <ChevronDown className="h-3 w-3" /> : 
              <ChevronRight className="h-3 w-3" />
            }
          </button>
        </>
      )}

      {onToggleSize && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSize();
          }}
          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
          title="Toggle size"
        >
          <MoreVertical className="h-3 w-3" />
        </button>
      )}
    </div>
  );

  return (
    <BaseNodeRenderer
      data={data}
      type="container"
      size={size}
      isSelected={isSelected}
      isDragging={isDragging}
      onSelect={onSelect}
      className={className}
    >
      {/* Header with container icon */}
      <div className="flex items-center gap-2 mb-2">
        {getContainerIcon()}
        <NodeHeader
          title={data.name}
          subtitle={size !== 'compact' ? data.description : undefined}
          type="container"
          badges={badges}
          actions={actions}
        />
      </div>

      {/* Stats - always visible for containers */}
      {size !== 'compact' && (
        <div className="mb-2">
          <NodeStats stats={stats} type="container" />
        </div>
      )}

      {/* Contained Services - expandable */}
      <AnimatePresence>
        {size !== 'compact' && showContainedNodes && containedNodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-600/50 pt-2 mt-auto"
          >
            <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              <Server className="h-3 w-3" />
              Contained Services:
            </div>
            
            <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
              {containedNodes.slice(0, 3).map((node, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 text-xs bg-slate-700/30 rounded p-1"
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    node.category === 'frontend' ? 'bg-blue-400' :
                    node.category === 'backend' ? 'bg-green-400' :
                    node.category === 'database' ? 'bg-purple-400' :
                    'bg-gray-400'
                  )} />
                  <span className="text-slate-200 font-medium truncate flex-1">
                    {node.name}
                  </span>
                  <Badge variant="outline" size="sm" className="text-xs py-0">
                    {node.category}
                  </Badge>
                </motion.div>
              ))}
              
              {containedNodes.length > 3 && (
                <div className="text-xs text-slate-500 text-center py-1">
                  +{containedNodes.length - 3} more services
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Empty state for containers */}
        {size !== 'compact' && showContainedNodes && containedNodes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-t border-slate-600/50 pt-2 mt-auto flex flex-col items-center justify-center py-4 text-center"
          >
            <Plus className="h-8 w-8 text-slate-500 mb-2" />
            <p className="text-xs text-slate-500 mb-1">No services yet</p>
            <p className="text-xs text-slate-600">Drag components here</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact mode - just show count */}
      {size === 'compact' && containedNodes.length > 0 && (
        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Services:</span>
            <Badge variant="success" size="sm">
              {containedNodes.length}
            </Badge>
          </div>
        </div>
      )}
    </BaseNodeRenderer>
  );
});

ContainerNodeRenderer.displayName = 'ContainerNodeRenderer';