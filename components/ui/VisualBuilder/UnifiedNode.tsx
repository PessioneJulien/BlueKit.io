'use client';

import { memo, useCallback, useMemo } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeData } from './CanvasNode';
import { 
  ContainerNodeRenderer, 
  StackNodeRenderer, 
  ToolNodeRenderer,
  NodeSize,
  type ContainerNodeData 
} from './NodeRenderer';

// Types pour les différents types de nodes
export interface UnifiedNodeData extends NodeData {
  // Visual properties
  isCompact?: boolean;
  width?: number;
  height?: number;
  
  // Interactions
  onToggleMode?: (id: string) => void;
  onConfigure?: (id: string) => void;
  onRemoveTool?: (nodeId: string, toolId: string) => void;
  onDetach?: (id: string) => void;
  
  // Specialized properties
  isContainer?: boolean;
  containerType?: 'docker' | 'kubernetes';
  containedNodes?: NodeData[];
  ports?: string[];
  status?: 'running' | 'stopped' | 'pending';
  
  // Tool-specific
  type?: string;
  parentStack?: string;
  isPaletteItem?: boolean;
  
  // Drop state
  isDropTarget?: boolean;
  isDragOver?: boolean;
}

/**
 * Composant Node unifié qui détermine automatiquement le type de renderer à utiliser
 * Gère les connexions ReactFlow et délègue le rendu aux renderers spécialisés
 */
export const UnifiedNode = memo<NodeProps<UnifiedNodeData>>(({ 
  data,
  selected = false,
  dragging = false
}) => {
  // Determine node type based on data
  const nodeType = useMemo(() => {
    if (data.isContainer) return 'container';
    if (data.isMainTechnology) return 'stack';
    return 'tool';
  }, [data.isContainer, data.isMainTechnology]);

  // Determine node size
  const nodeSize: NodeSize = useMemo(() => {
    if (data.isCompact === false) return 'expanded';
    if (data.isCompact === true) return 'compact'; 
    return 'normal';
  }, [data.isCompact]);

  // Handle interactions
  const handleSelect = useCallback(() => {
    // Node selection logic if needed
    console.log('Node selected:', data.id);
  }, [data]);

  const handleToggleSize = useCallback(() => {
    if (data.onToggleMode) {
      data.onToggleMode(data.id);
    }
  }, [data]);

  const handleConfigure = useCallback(() => {
    if (data.onConfigure) {
      data.onConfigure(data.id);
    }
  }, [data]);

  const handleRemoveTool = useCallback((toolId: string) => {
    if (data.onRemoveTool) {
      data.onRemoveTool(data.id, toolId);
    }
  }, [data]);

  const handleDetach = useCallback(() => {
    if (data.onDetach) {
      data.onDetach(data.id);
    }
  }, [data]);

  // Calculate dimensions based on size and type
  const dimensions = useMemo(() => {
    const baseSizes = {
      compact: { width: 220, height: 80 },
      normal: { width: 280, height: 140 },
      expanded: { width: 350, height: 200 }
    };

    let size = baseSizes[nodeSize];

    // Adjust for container nodes
    if (nodeType === 'container') {
      size = {
        width: Math.max(size.width, 300),
        height: Math.max(size.height, nodeSize === 'expanded' ? 300 : 200)
      };
    }

    // Use custom dimensions if provided
    if (data.width) size.width = data.width;
    if (data.height) size.height = data.height;

    return size;
  }, [nodeSize, nodeType, data.width, data.height]);

  return (
    <div
      className="unified-node relative"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        minWidth: dimensions.width,
        minHeight: dimensions.height
      }}
    >
      {/* Connection Handles - positioned based on node type */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className={cn(
          "w-3 h-3 border-2 rounded-full transition-colors",
          nodeType === 'container' ? 'bg-blue-600 border-blue-400 hover:bg-blue-500' :
          nodeType === 'stack' ? 'bg-green-600 border-green-400 hover:bg-green-500' :
          'bg-orange-600 border-orange-400 hover:bg-orange-500'
        )}
        style={{
          left: -6,
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className={cn(
          "w-3 h-3 border-2 rounded-full transition-colors",
          nodeType === 'container' ? 'bg-blue-600 border-blue-400 hover:bg-blue-500' :
          nodeType === 'stack' ? 'bg-green-600 border-green-400 hover:bg-green-500' :
          'bg-orange-600 border-orange-400 hover:bg-orange-500'
        )}
        style={{
          right: -6,
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      />

      {/* Render appropriate node type */}
      {nodeType === 'container' && (
        <ContainerNodeRenderer
          data={data as ContainerNodeData}
          size={nodeSize}
          isSelected={selected}
          isDragging={dragging}
          onSelect={handleSelect}
          onToggleSize={handleToggleSize}
          onConfigure={handleConfigure}
          className="w-full h-full"
        />
      )}

      {nodeType === 'stack' && (
        <StackNodeRenderer
          data={data}
          size={nodeSize}
          isSelected={selected}
          isDragging={dragging}
          isDropTarget={data.isDropTarget}
          onSelect={handleSelect}
          onToggleSize={handleToggleSize}
          onConfigure={handleConfigure}
          onRemoveTool={handleRemoveTool}
          className="w-full h-full"
        />
      )}

      {nodeType === 'tool' && (
        <ToolNodeRenderer
          data={{ ...data, type: data.type }}
          size={nodeSize}
          isSelected={selected}
          isDragging={dragging}
          isPaletteItem={data.isPaletteItem}
          parentStack={data.parentStack}
          onSelect={handleSelect}
          onToggleSize={handleToggleSize}
          onConfigure={handleConfigure}
          onDetach={handleDetach}
          className="w-full h-full"
        />
      )}

      {/* Drop overlay for drag interactions */}
      {data.isDragOver && (
        <div className="absolute inset-0 bg-green-500/10 border-2 border-dashed border-green-500/50 rounded-xl pointer-events-none" />
      )}
    </div>
  );
});

UnifiedNode.displayName = 'UnifiedNode';