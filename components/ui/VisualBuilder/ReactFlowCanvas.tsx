'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  Background,
  Connection as ReactFlowConnection,
  ConnectionMode,
  Panel,
  NodeTypes,
  EdgeTypes,
  NodeChange,
  EdgeChange,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TechNode } from './TechNode';
import { NodeData, SubTechnology } from './CanvasNode';
import { ConnectionStyle } from './ConnectionStyleEditor';
import { NodeCustomStyle } from './NodeColorPicker';
import { CustomEdge } from './CustomEdge';
import { ContainerNode } from './ContainerNode';
import { ConnectionContextMenu } from './ConnectionContextMenu';
import { useContainerLogic } from '@/lib/hooks/useContainerLogic';

// Custom node types
const nodeTypes: NodeTypes = {
  techNode: TechNode,
  containerNode: ContainerNode as React.ComponentType<unknown>,
};

// Custom edge types
const edgeTypes: EdgeTypes = {
  customEdge: CustomEdge,
};

interface ReactFlowCanvasProps {
  nodes: Array<NodeData & { 
    position: { x: number; y: number }; 
    isCompact?: boolean;
    width?: number;
    height?: number;
    documentation?: string;
  }>;
  connections: Array<{ id: string; sourceNodeId: string; targetNodeId: string; type: string; style?: ConnectionStyle }>;
  onNodesChange?: (nodes: Array<NodeData & { position: { x: number; y: number }; isCompact?: boolean; width?: number; height?: number; documentation?: string }>) => void;
  onConnectionsChange?: (connections: Array<{ id: string; sourceNodeId: string; targetNodeId: string; type: string; style?: ConnectionStyle }>) => void;
  onConnectionStyleChange?: (connectionId: string, style: ConnectionStyle) => void;
  onConnectionSelect?: (connectionId: string | null) => void;
  selectedConnectionId?: string | null;
  onNodeStyleChange?: (nodeId: string, style: NodeCustomStyle) => void;
  onNodeSelect?: (nodeId: string) => void;
  onDocumentationSave?: (nodeId: string, documentation: string) => void;
  onAddSubTechnology?: (mainTechId: string, subTechId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onRemoveSubTechnology?: (mainTechId: string, subTechId: string) => void;
  onDropComponent?: (component: NodeData, position: { x: number; y: number }) => void;
  onAddComponentToContainer?: (component: NodeData, containerId: string, isMoving?: boolean) => void;
  onMoveNodeToContainer?: (nodeId: string, containerId: string) => void;
  onRemoveFromContainer?: (containerId: string, nodeId: string) => void;
  onConvertToContainer?: (nodeId: string, containerType: 'docker' | 'kubernetes' | 'custom') => void;
  onNameChange?: (nodeId: string, newName: string) => void;
  availableSubTechnologies?: SubTechnology[];
  className?: string;
  // Presentation mode props
  nodesDraggable?: boolean;
  nodesConnectable?: boolean;
  elementsSelectable?: boolean;
  isReadOnly?: boolean;
}

export const ReactFlowCanvas: React.FC<ReactFlowCanvasProps> = ({
  nodes: externalNodes,
  connections: externalConnections,
  onNodesChange,
  onConnectionsChange,
  onConnectionStyleChange,
  onConnectionSelect,
  selectedConnectionId,
  onNodeStyleChange,
  onNodeSelect,
  onDocumentationSave,
  onAddSubTechnology,
  onDeleteNode,
  onRemoveSubTechnology,
  onDropComponent,
  onAddComponentToContainer,
  onMoveNodeToContainer,
  onRemoveFromContainer,
  onConvertToContainer,
  onNameChange,
  availableSubTechnologies,
  className,
  // Presentation mode props with defaults
  nodesDraggable = true,
  nodesConnectable = true,
  elementsSelectable = true,
  isReadOnly = false
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState([]);
  const { updateContainerNodes, detectContainerDrops } = useContainerLogic();
  
  // Context menu state
  const [contextMenuConnectionId, setContextMenuConnectionId] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Dragging state for ghost preview
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Convert our data format to ReactFlow format
  const convertToReactFlowNodes = useCallback((nodeList: typeof externalNodes): Node[] => {
    return nodeList.map(node => {
      // Check if it's a container node
      const isContainer = 'isContainer' in node && node.isContainer === true;
      const nodeType = isContainer ? 'containerNode' : 'techNode';

      return {
        id: node.id,
        type: nodeType,
        position: node.position,
        data: {
        ...node,
        onDelete: isContainer ? ((id: string) => {
          // Container deletion handler
          const updatedNodes = externalNodes.filter(n => n.id !== id);
          onNodesChange(updatedNodes);
          
          const updatedConnections = externalConnections.filter(
            conn => conn.sourceNodeId !== id && conn.targetNodeId !== id
          );
          onConnectionsChange(updatedConnections);
        }) : (onDeleteNode || ((id: string) => {
          const updatedNodes = externalNodes.filter(n => n.id !== id);
          onNodesChange(updatedNodes);
          
          const updatedConnections = externalConnections.filter(
            conn => conn.sourceNodeId !== id && conn.targetNodeId !== id
          );
          onConnectionsChange(updatedConnections);
        })),
        onToggleCompact: isContainer ? ((id: string) => {
          // Container toggle compact handler
          const updatedNodes = externalNodes.map(n =>
            n.id === id ? { ...n, isCompact: !n.isCompact } : n
          );
          onNodesChange(updatedNodes);
        }) : undefined,
        onToggleMode: (id: string) => {
          // Find the current state of the node
          const currentNode = externalNodes.find(n => n.id === id);
          if (currentNode) {
            // Default to true if isCompact is undefined, then toggle
            const currentCompactState = currentNode.isCompact ?? true;
            const newCompactState = !currentCompactState;
            const hasSubTech = currentNode.subTechnologies && currentNode.subTechnologies.length > 0;
            
            console.log('Toggle mode for node:', id, 'from', currentCompactState, 'to', newCompactState);
            
            // Adjust dimensions based on new compact state
            const newWidth = newCompactState ? 200 : 300;
            const newHeight = newCompactState ? 
              (hasSubTech ? 120 : 80) : 
              (hasSubTech ? 180 : 140);
            
            const updatedNodes = externalNodes.map(n =>
              n.id === id ? { 
                ...n, 
                isCompact: newCompactState,
                width: newWidth,
                height: newHeight
              } : n
            );
            onNodesChange(updatedNodes);
          }
        },
        onResize: (id: string, width: number, height: number) => {
          const updatedNodes = externalNodes.map(n =>
            n.id === id ? { ...n, width, height } : n
          );
          onNodesChange(updatedNodes);
        },
        onConfigure: (id: string, resources: unknown, envVars: Record<string, string>) => {
          const updatedNodes = externalNodes.map(n =>
            n.id === id ? { 
              ...n, 
              resources,
              environmentVariables: envVars
            } : n
          );
          onNodesChange(updatedNodes);
        },
        onDocumentationSave,
        onAddSubTechnology,
        onNameChange: onNameChange ? (nodeId: string, newName: string) => {
          const updatedNodes = externalNodes.map(n =>
            n.id === nodeId ? { ...n, name: newName } : n
          );
          onNodesChange(updatedNodes);
        } : undefined,
        onRemoveSubTechnology: onRemoveSubTechnology || ((mainTechId: string, subTechId: string) => {
          const updatedNodes = externalNodes.map(node => {
            if (node.id === mainTechId && node.subTechnologies) {
              const newSubTechnologies = node.subTechnologies.filter(st => st.id !== subTechId);
              const isCompact = node.isCompact ?? true;
              
              // Adjust height when removing sub-technology
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
          
          onNodesChange(updatedNodes);
        }),
        onStyleChange: onNodeStyleChange,
        onNodeSelect,
        onRemoveFromContainer,
        onDropComponent,
        onAddComponentToContainer,
        onConvertToContainer,
        availableSubTechnologies,
        isReadOnly,
        draggingNodeId,
        draggingNode: draggingNodeId ? externalNodes.find(n => n.id === draggingNodeId) : null,
        mousePosition
        }
      };
    });
  }, [onNodesChange, externalConnections, onConnectionsChange, externalNodes, onDocumentationSave, onAddSubTechnology, onDeleteNode, onRemoveSubTechnology, onNodeStyleChange, onNameChange, onNodeSelect, onRemoveFromContainer, onDropComponent, onAddComponentToContainer, onConvertToContainer, availableSubTechnologies, isReadOnly, draggingNodeId, mousePosition]);

  // Handle connection context menu
  const handleConnectionContextMenu = useCallback((connectionId: string, event: React.MouseEvent) => {
    setContextMenuConnectionId(connectionId);
    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY
    });
  }, []);

  // Handle connection deletion from context menu
  const handleConnectionDelete = useCallback((connectionId: string) => {
    const updatedConnections = externalConnections.filter(conn => conn.id !== connectionId);
    if (onConnectionsChange) {
      onConnectionsChange(updatedConnections);
    }
    setContextMenuConnectionId(null);
  }, [externalConnections, onConnectionsChange]);

  // Handle canvas click to close context menu
  const handleCanvasClick = useCallback(() => {
    if (contextMenuConnectionId) {
      setContextMenuConnectionId(null);
    }
  }, [contextMenuConnectionId]);

  // Handle when a node drag starts
  const handleNodeDragStart = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('🎯 Node drag started:', node.id, 'setting draggingNodeId');
    setDraggingNodeId(node.id);
    setMousePosition({ x: event.clientX, y: event.clientY });
  }, []);
  
  // Handle when a node drag ends - check if it's over a container
  const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('🎯 Node drag stopped:', node.id, 'at position:', node.position, 'clearing draggingNodeId');
    setDraggingNodeId(null);
    setMousePosition(null);
    
    // Find if the node was dropped over a container
    const allNodes = nodes;
    const draggedNode = allNodes.find(n => n.id === node.id);
    
    if (!draggedNode) return;
    
    // Check each container to see if the node is within its bounds
    for (const potentialContainer of allNodes) {
      if (potentialContainer.data.isContainer && potentialContainer.id !== node.id) {
        const containerBounds = {
          x: potentialContainer.position.x,
          y: potentialContainer.position.y,
          width: potentialContainer.data.width || 400,
          height: potentialContainer.data.height || 300
        };
        
        const nodeBounds = {
          x: node.position.x,
          y: node.position.y,
          width: draggedNode.data.width || 200,
          height: draggedNode.data.height || 80
        };
        
        // Check if node center is within container
        const nodeCenterX = nodeBounds.x + nodeBounds.width / 2;
        const nodeCenterY = nodeBounds.y + nodeBounds.height / 2;
        
        const isWithinContainer = 
          nodeCenterX >= containerBounds.x && 
          nodeCenterX <= containerBounds.x + containerBounds.width &&
          nodeCenterY >= containerBounds.y && 
          nodeCenterY <= containerBounds.y + containerBounds.height;
        
        if (isWithinContainer) {
          console.log('🎯 Node dropped in container:', potentialContainer.id);
          
          // Move node to container - pass the node ID directly
          if (onMoveNodeToContainer) {
            onMoveNodeToContainer(node.id, potentialContainer.id);
          } else if (onAddComponentToContainer) {
            // Fallback for backward compatibility
            onAddComponentToContainer(draggedNode.data, potentialContainer.id, true);
          }
          
          // The node removal will be handled by the onAddComponentToContainer function
          break;
        }
      }
    }
  }, [nodes, onMoveNodeToContainer, onAddComponentToContainer]);

  const convertToReactFlowEdges = useCallback((connectionList: typeof externalConnections): Edge[] =>
    connectionList.map(conn => {
      // Use custom style if available, otherwise use default based on type
      const strokeColor = conn.style?.color || 
                         (conn.type === 'compatible' ? '#10b981' : 
                          conn.type === 'incompatible' ? '#ef4444' : '#3b82f6');
      
      return {
        id: conn.id,
        source: conn.sourceNodeId,
        target: conn.targetNodeId,
        type: 'customEdge',
        style: {
          stroke: strokeColor,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
        },
        data: {
          connectionId: conn.id,
          style: conn.style,
          onStyleChange: onConnectionStyleChange,
          onSelect: onConnectionSelect,
          onContextMenu: handleConnectionContextMenu,
          isSelected: selectedConnectionId === conn.id
        }
      };
    }), [onConnectionStyleChange, onConnectionSelect, handleConnectionContextMenu, selectedConnectionId]
  );

  // Sync ReactFlow nodes back to our format when they change
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChangeInternal(changes);
    
    // Handle node deletions through ReactFlow (when using Delete key)
    const deleteChanges = changes.filter(change => change.type === 'remove');
    if (deleteChanges.length > 0) {
      deleteChanges.forEach(change => {
        if ('id' in change && onDeleteNode) {
          onDeleteNode(change.id);
        }
      });
    }
    
    // Handle position changes
    const positionChanges = changes.filter(change => change.type === 'position' && 'position' in change && change.position);
    if (positionChanges.length > 0 && onNodesChange) {
      const updatedNodes = externalNodes.map(node => {
        const change = positionChanges.find(c => 'id' in c && c.id === node.id);
        if (change && 'position' in change && change.position) {
          return { ...node, position: change.position };
        }
        return node;
      });
      
      // Only detect container drops on actual drops (not during drag)
      const isDrop = positionChanges.some(change => !('dragging' in change) || !change.dragging);
      
      if (isDrop) {
        console.log('🎯 Drop detected, checking for container integration');
        const nodesWithContainerUpdates = detectContainerDrops(updatedNodes);
        onNodesChange(nodesWithContainerUpdates);
      } else {
        // Just update positions without container detection during drag
        onNodesChange(updatedNodes);
      }
    }
    
    console.log('ReactFlow nodes changed:', changes);
  }, [onNodesChangeInternal, onDeleteNode, onNodesChange, externalNodes, detectContainerDrops]);

  // Handle new connections
  const onConnect = useCallback((params: ReactFlowConnection) => {
    const sourceNode = externalNodes.find(n => n.id === params.source);
    const targetNode = externalNodes.find(n => n.id === params.target);
    
    if (!sourceNode || !targetNode) return;
    
    // Determine connection type based on compatibility
    let connectionType = 'neutral';
    if (sourceNode.compatibleWith?.includes(targetNode.id)) {
      connectionType = 'compatible';
    } else if (sourceNode.incompatibleWith?.includes(targetNode.id)) {
      connectionType = 'incompatible';
    }

    const newConnection = {
      id: `${params.source}-${params.target}-${Date.now()}`,
      sourceNodeId: params.source!,
      targetNodeId: params.target!,
      type: connectionType
    };

    onConnectionsChange([...externalConnections, newConnection]);

    // Also update ReactFlow edges
    const strokeColor = connectionType === 'compatible' ? '#10b981' : 
                       connectionType === 'incompatible' ? '#ef4444' : '#3b82f6';
    const newEdge: Edge = {
      id: newConnection.id,
      source: params.source!,
      target: params.target!,
      type: 'customEdge',
      style: {
        stroke: strokeColor,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
      },
      data: {
        connectionId: newConnection.id,
        style: undefined,
        onStyleChange: onConnectionStyleChange
      }
    };

    setEdges((eds) => addEdge(newEdge, eds));
  }, [externalNodes, externalConnections, onConnectionsChange, setEdges, onConnectionStyleChange]);

  // Handle edge deletion
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChangeInternal(changes);
    
    // Handle deletions
    const deletedEdges = changes.filter((change) => change.type === 'remove');
    if (deletedEdges.length > 0) {
      const remainingConnections = externalConnections.filter(
        conn => !deletedEdges.some((deleted) => deleted.id === conn.id)
      );
      onConnectionsChange(remainingConnections);
    }
  }, [onEdgesChangeInternal, externalConnections, onConnectionsChange]);

  // Handle drag and drop from palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = (event.target as Element).getBoundingClientRect();
    
    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      console.log('🎯 Dropped data:', data);
      
      if ((data.type === 'main-component' || data.type === 'community-component') && onDropComponent) {
        console.log('✅ Handling drop for type:', data.type);
        // Calculate position relative to ReactFlow canvas
        const position = {
          x: event.clientX - reactFlowBounds.left - 100, // Offset for centering
          y: event.clientY - reactFlowBounds.top - 50
        };
        
        // For community components, we need to convert the format to match NodeData
        let componentToAdd = data.component;
        
        if (data.type === 'community-component') {
          // Convert community component to NodeData format
          componentToAdd = {
            id: data.component.id,
            name: data.component.name,
            label: data.component.name,
            category: data.component.category,
            description: data.component.description,
            setupTimeHours: data.component.setupTimeHours,
            pricing: data.component.pricing,
            difficulty: data.component.difficulty,
            documentation: data.component.documentation,
            officialDocsUrl: data.component.officialDocsUrl,
            githubUrl: data.component.githubUrl,
            npmUrl: data.component.npmUrl,
            tags: data.component.tags || [],
            isMainTechnology: true, // Community components are main technologies
            isCommunity: true // Flag to identify community components
          };
        }
        
        onDropComponent(componentToAdd, position);
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  }, [onDropComponent]);

  // Update nodes when external nodes change - preserve positions and dimensions
  useEffect(() => {
    const reactFlowNodes = convertToReactFlowNodes(externalNodes);
    setNodes(prevNodes => {
      // Preserve positions and dimensions from current ReactFlow nodes
      return reactFlowNodes.map(newNode => {
        const existingNode = prevNodes.find(n => n.id === newNode.id);
        if (existingNode) {
          // Keep the current position and dimensions from ReactFlow
          return {
            ...newNode,
            position: existingNode.position,
            // Preserve custom dimensions if they exist
            data: {
              ...newNode.data,
              width: existingNode.data?.width || newNode.data.width,
              height: existingNode.data?.height || newNode.data.height,
            }
          };
        }
        return newNode;
      });
    });
  }, [externalNodes, convertToReactFlowNodes, setNodes]);

  // Update edges when external connections change  
  useEffect(() => {
    const reactFlowEdges = convertToReactFlowEdges(externalConnections);
    setEdges(reactFlowEdges);
  }, [externalConnections, convertToReactFlowEdges, setEdges]);

  // Track mouse position during drag for ghost preview
  useEffect(() => {
    if (!draggingNodeId) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [draggingNodeId]);


  return (
    <div 
      className={className} 
      style={{ width: '100%', height: '100%' }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-testid="visual-canvas"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        data-testid="drop-zone"
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={handleCanvasClick}
        onNodeDragStart={handleNodeDragStart}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={2}
        snapToGrid={true}
        snapGrid={[15, 15]}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Meta"
        panOnDrag={true} // Allow pan with left mouse button
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        selectNodesOnDrag={elementsSelectable}
        nodesConnectable={nodesConnectable}
        nodesDraggable={nodesDraggable}
        elementsSelectable={elementsSelectable}
      >
        {/* Background with subtle pattern */}
        <Background 
          color="#475569" 
          gap={20} 
          size={1}
          variant={BackgroundVariant.Dots}
        />
        
        {/* Navigation controls */}
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          position="bottom-right"
        />
        
        {/* Mini map */}
        <MiniMap 
          nodeColor="#1e293b"
          nodeStrokeWidth={2}
          pannable
          zoomable
          position="bottom-left"
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #475569',
          }}
        />

        {/* Status panel */}
        <Panel position="top-left">
          <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2">
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <span>{nodes.length} nodes</span>
              <span>{edges.length} connections</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
      
      {/* Connection Context Menu */}
      <ConnectionContextMenu
        connectionId={contextMenuConnectionId || ''}
        isVisible={!!contextMenuConnectionId}
        onDelete={handleConnectionDelete}
        onClose={() => setContextMenuConnectionId(null)}
        position={contextMenuPosition}
      />
    </div>
  );
};