'use client';

import { memo, useContext } from 'react';
import { NodeProps } from '@xyflow/react';
import { NodeData, SubTechnology, ResourceStats } from './CanvasNode';
import { NestedContainerNode, NestedContainerNodeData } from './NestedContainerNode';

// Context for container view mode
import { createContext } from 'react';

export type ContainerViewMode = 'nested';

export const ContainerViewContext = createContext<ContainerViewMode>('nested');

export interface ContainerNodeData extends NodeData {
  isContainer: true;
  containerType?: 'docker' | 'kubernetes' | string;
  containedNodes?: NodeData[];
  ports?: string[];
  volumes?: string[];
  networks?: string[];
  resources?: {
    cpu: string;
    memory: string;
  };
  // status?: 'running' | 'stopped' | 'building' | 'pending'; // Removed - not useful
  replicas?: number;
  isCompact?: boolean;
  width?: number;
  height?: number;
  documentation?: string;
  onDelete: (id: string) => void;
  onToggleCompact: (id: string) => void;
  onConfigure?: (id: string, resources: ResourceStats, envVars: Record<string, string>) => void;
  onRemoveFromContainer?: (containerId: string, nodeId: string) => void;
  onDropComponent?: (component: NodeData, position: { x: number; y: number }) => void;
  onAddSubTechnology?: (mainTechId: string, subTechId: string) => void;
  onRemoveSubTechnology?: (mainTechId: string, subTechId: string) => void;
  onDocumentationSave?: (nodeId: string, documentation: string) => void;
  onStyleChange?: (nodeId: string, style: Record<string, unknown>) => void;
  onNodeSelect?: (nodeId: string) => void;
  availableSubTechnologies?: SubTechnology[];
  isReadOnly?: boolean;
  onResize?: (id: string, width: number, height: number) => void;
}

export const ContainerNode = memo<NodeProps<ContainerNodeData>>(({ 
  data,
  selected,
  ...props
}) => {
  const viewMode = useContext(ContainerViewContext);

  // Debug: Log des données du conteneur
  console.log('ContainerNode data:', {
    id: data.id,
    name: data.name,
    containedNodes: data.containedNodes?.length || 0,
    containedNodesDetails: data.containedNodes?.map(n => ({ id: n.id, name: n.name })) || []
  });

  // Convert data to the appropriate format for each view
  const convertToNestedData = (): NestedContainerNodeData => ({
    ...data,
    containedNodes: data.containedNodes || [],
    // status: (data.status as 'running' | 'stopped' | 'pending') || 'running', // Removed
    resources: data.resources || { cpu: '1 CPU', memory: '512MB' },
    width: data.width || 400,
    height: data.height || 300,
    isCompact: data.isCompact || false,
    onDelete: () => data.onDelete(data.id),
    onToggleCompact: () => data.onToggleCompact(data.id),
    onConfigure: data.onConfigure ? (resources: ResourceStats, envVars: Record<string, string>) => data.onConfigure!(data.id, resources, envVars) : undefined,
    onRemoveFromContainer: data.onRemoveFromContainer,
    onDropComponent: data.onDropComponent,
    onResize: data.onResize
  });

  // Always use nested view
  return (
    <NestedContainerNode 
      data={convertToNestedData()} 
      selected={selected}
      {...props}
    />
  );
});

ContainerNode.displayName = 'ContainerNode';