import { useCallback, useContext } from 'react';
import { NodeData } from '@/components/ui/VisualBuilder/CanvasNode';
import { ContainerNodeData, ContainerViewContext } from '@/components/ui/VisualBuilder/ContainerNode';
import { ContainerManager } from '@/components/ui/VisualBuilder/ContainerManager';

export function useContainerLogic() {
  const viewMode = useContext(ContainerViewContext);
  
  // Convert a regular node to a container node
  const convertToContainer = useCallback((node: NodeData & { position: { x: number; y: number } }): ContainerNodeData => {
    if (node.id === 'docker') {
      return ContainerManager.createDockerContainer(
        node.id,
        node.position,
        [],
        viewMode
      );
    } else if (node.id === 'kubernetes') {
      return ContainerManager.createKubernetesCluster(
        node.id,
        node.position,
        [],
        viewMode
      );
    }
    
    // Fallback - shouldn't happen
    return {
      ...node,
      isContainer: true,
      containerType: 'docker',
      containedNodes: [],
      ports: [],
      status: 'running',
      resources: {
        cpu: '1 CPU',
        memory: '512MB'
      },
      width: 400,
      height: 300,
      isCompact: false,
      onDelete: () => {},
      onToggleCompact: () => {}
    } as ContainerNodeData;
  }, [viewMode]);

  // Handle dropping a node onto the canvas
  const handleNodeDrop = useCallback((
    newNode: NodeData & { position: { x: number; y: number } },
    nodes: Array<NodeData & { position: { x: number; y: number }; width?: number; height?: number }>
  ): {
    node: NodeData & { position: { x: number; y: number } };
    targetContainerId: string | null;
  } => {
    // Get all container drop zones
    const dropZones = ContainerManager.getDropZones(nodes);
    
    // Check if the node is dropped inside a container
    const targetContainerId = ContainerManager.findTargetContainer(
      newNode.position,
      dropZones,
      { width: newNode.width || 200, height: newNode.height || 80 }
    );

    return {
      node: newNode,
      targetContainerId
    };
  }, []);

  // Update container with new contained nodes
  const updateContainerNodes = useCallback((
    nodes: Array<NodeData & { position: { x: number; y: number }; width?: number; height?: number }>
  ): Array<NodeData & { position: { x: number; y: number }; width?: number; height?: number }> => {
    return nodes.map(node => {
      if ('isContainer' in node && node.isContainer) {
        const container = node as ContainerNodeData;
        
        // Find all nodes that should be contained
        const containedNodes = nodes.filter(n => {
          if (n.id === container.id || ('isContainer' in n && n.isContainer)) {
            return false;
          }
          
          return ContainerManager.isNodeInsideContainer(
            n.position,
            container.position,
            { width: container.width || 400, height: container.height || 300 },
            { width: n.width || 200, height: n.height || 80 }
          );
        });

        // Update the container
        return ContainerManager.updateContainer(container, containedNodes);
      }
      
      return node;
    });
  }, []);

  return {
    convertToContainer,
    handleNodeDrop,
    updateContainerNodes
  };
}