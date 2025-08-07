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
    updatedNodes: Array<NodeData & { position: { x: number; y: number }; width?: number; height?: number }>;
    wasContained: boolean;
  } => {
    console.log('🎯 handleNodeDrop called with node:', newNode.name, 'at position:', newNode.position);
    
    // Get all container drop zones
    const dropZones = ContainerManager.getDropZones(nodes);
    console.log('📦 Available drop zones:', dropZones);
    
    // Check if the node is dropped inside a container
    const targetContainerId = ContainerManager.findTargetContainer(
      newNode.position,
      dropZones,
      { width: newNode.width || 200, height: newNode.height || 80 }
    );

    console.log('🎯 Target container ID:', targetContainerId);

    if (targetContainerId) {
      // Find the target container
      const updatedNodes = nodes.map(node => {
        if (node.id === targetContainerId && 'isContainer' in node && node.isContainer) {
          const container = node as ContainerNodeData;
          const newContainedNodes = [...(container.containedNodes || []), newNode];
          
          console.log('✅ Adding node to container:', {
            containerName: container.name,
            newNodeName: newNode.name,
            totalContainedNodes: newContainedNodes.length
          });
          
          if (viewMode === 'connected') {
            // Update both contained nodes and connected services for connected view
            return {
              ...container,
              containedNodes: newContainedNodes,
              connectedServices: newContainedNodes.map((containedNode, index) => ({
                id: containedNode.id,
                name: containedNode.name,
                port: `${3000 + index}`,
                status: 'connected' as const
              }))
            };
          } else {
            // Update contained nodes for nested view
            return {
              ...container,
              containedNodes: newContainedNodes
            };
          }
        }
        return node;
      });

      console.log('🎯 handleNodeDrop result: node was contained');
      return {
        updatedNodes,
        wasContained: true
      };
    }

    // If not contained, add the new node to the canvas
    return {
      updatedNodes: [...nodes, newNode],
      wasContained: false
    };
  }, [viewMode]);

  // Update container with new contained nodes - detect when nodes are dropped into containers
  const updateContainerNodes = useCallback((
    nodes: Array<NodeData & { position: { x: number; y: number }; width?: number; height?: number }>,
    forceDetection = false
  ): Array<NodeData & { position: { x: number; y: number }; width?: number; height?: number }> => {
    console.log('🔄 updateContainerNodes called with', nodes.length, 'nodes, forceDetection:', forceDetection);
    
    let updatedNodes = [...nodes];
    const nodesToRemove: string[] = [];

    // Process containers and detect nodes that should be contained
    updatedNodes = updatedNodes.map(node => {
      if ('isContainer' in node && node.isContainer) {
        const container = node as ContainerNodeData;
        console.log('📦 Processing container:', container.name, 'at position', container.position);
        
        // Preserve existing contained nodes
        const existingContainedNodes = container.containedNodes || [];
        console.log('🔍 Existing contained nodes:', existingContainedNodes.map(n => n.name));
        
        // Only detect new contained nodes if forced (during explicit drops)
        let newlyContainedNodes: Array<NodeData & { position: { x: number; y: number }; width?: number; height?: number }> = [];
        
        if (forceDetection) {
          // Find nodes that are physically inside the container (new ones)
          newlyContainedNodes = nodes.filter(n => {
            if (n.id === container.id || ('isContainer' in n && n.isContainer)) {
              return false;
            }
            
            // Skip if already contained
            const isAlreadyContained = existingContainedNodes.some(contained => contained.id === n.id);
            if (isAlreadyContained) {
              return false;
            }
            
            // Check if node is physically inside the container
            const isPhysicallyInside = ContainerManager.isNodeInsideContainer(
              n.position,
              container.position,
              { width: container.width || 400, height: container.height || 300 },
              { width: n.width || 200, height: n.height || 80 }
            );

            console.log('🔍 Checking NEW node', n.name, 'at', n.position, {
              isAlreadyContained,
              isPhysicallyInside
            });

            if (isPhysicallyInside) {
              nodesToRemove.push(n.id);
            }

            return isPhysicallyInside;
          });
        }
        
        // Combine existing and new contained nodes
        const containedNodes = [...existingContainedNodes, ...newlyContainedNodes];
        console.log('🔍 Final contained nodes:', containedNodes.map(n => n.name));

        console.log('✅ Container', container.name, 'will contain', containedNodes.length, 'nodes:', containedNodes.map(n => n.name));

        // Update the container with contained nodes
        let updatedContainer = ContainerManager.updateContainer(container, containedNodes);
        
        // In connected view, also update connectedServices
        if (viewMode === 'connected') {
          updatedContainer = {
            ...updatedContainer,
            connectedServices: containedNodes.map((containedNode, index) => ({
              id: containedNode.id,
              name: containedNode.name,
              port: `${3000 + index}`,
              status: 'connected' as const
            }))
          };
          console.log('🔗 Updated connectedServices:', updatedContainer.connectedServices?.length || 0);
        }
        
        console.log('📦 Updated container', updatedContainer.name, 'containedNodes:', updatedContainer.containedNodes?.length || 0);
        
        return updatedContainer;
      }
      
      return node;
    });

    // Remove contained nodes from the main canvas only if we detected new ones
    if (forceDetection && nodesToRemove.length > 0) {
      console.log('🗑️ Removing nodes from canvas:', nodesToRemove);
      updatedNodes = updatedNodes.filter(node => !nodesToRemove.includes(node.id));
    }
    
    console.log('🔄 Final result:', updatedNodes.length, 'nodes remaining');
    return updatedNodes;
  }, [viewMode]);

  // New function to handle drag and drop detection after position changes
  const detectContainerDrops = useCallback((
    nodes: Array<NodeData & { position: { x: number; y: number }; width?: number; height?: number }>
  ): Array<NodeData & { position: { x: number; y: number }; width?: number; height?: number }> => {
    return updateContainerNodes(nodes, true);
  }, [updateContainerNodes]);

  return {
    convertToContainer,
    handleNodeDrop,
    updateContainerNodes,
    detectContainerDrops
  };
}