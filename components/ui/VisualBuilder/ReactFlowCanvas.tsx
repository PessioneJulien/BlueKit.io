'use client';

import { useCallback, useEffect } from 'react';
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

// Custom node types
const nodeTypes: NodeTypes = {
  techNode: TechNode,
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

  // Convert our data format to ReactFlow format
  const convertToReactFlowNodes = useCallback((nodeList: typeof externalNodes): Node[] => {
    return nodeList.map(node => ({
      id: node.id,
      type: 'techNode',
      position: node.position,
      data: {
        ...node,
        onDelete: onDeleteNode || ((id: string) => {
          const updatedNodes = externalNodes.filter(n => n.id !== id);
          onNodesChange(updatedNodes);
          
          const updatedConnections = externalConnections.filter(
            conn => conn.sourceNodeId !== id && conn.targetNodeId !== id
          );
          onConnectionsChange(updatedConnections);
        }),
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
        onDocumentationSave,
        onAddSubTechnology,
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
        availableSubTechnologies,
        isReadOnly
      }
    }));
  }, [onNodesChange, externalConnections, onConnectionsChange, externalNodes, onDocumentationSave, onAddSubTechnology, onDeleteNode, onRemoveSubTechnology, onNodeStyleChange, onNodeSelect, availableSubTechnologies, isReadOnly]);

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
          isSelected: selectedConnectionId === conn.id
        }
      };
    }), [onConnectionStyleChange, onConnectionSelect, selectedConnectionId]
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
      onNodesChange(updatedNodes);
    }
    
    console.log('ReactFlow nodes changed:', changes);
  }, [onNodesChangeInternal, onDeleteNode, onNodesChange, externalNodes]);

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
  }, [externalNodes, externalConnections, onConnectionsChange, setEdges]);

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
      
      if (data.type === 'main-component' && onDropComponent) {
        // Calculate position relative to ReactFlow canvas
        const position = {
          x: event.clientX - reactFlowBounds.left - 100, // Offset for centering
          y: event.clientY - reactFlowBounds.top - 50
        };
        
        onDropComponent(data.component, position);
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  }, [onDropComponent]);

  // Update nodes when external nodes change - preserve positions
  useEffect(() => {
    const reactFlowNodes = convertToReactFlowNodes(externalNodes);
    setNodes(prevNodes => {
      // Preserve positions from current ReactFlow nodes
      return reactFlowNodes.map(newNode => {
        const existingNode = prevNodes.find(n => n.id === newNode.id);
        if (existingNode) {
          // Keep the current position from ReactFlow
          return {
            ...newNode,
            position: existingNode.position
          };
        }
        return newNode;
      });
    });
  }, [externalNodes, convertToReactFlowNodes]);

  // Update edges when external connections change  
  useEffect(() => {
    const reactFlowEdges = convertToReactFlowEdges(externalConnections);
    setEdges(reactFlowEdges);
  }, [externalConnections, convertToReactFlowEdges]);


  return (
    <div 
      className={className} 
      style={{ width: '100%', height: '100%' }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
    </div>
  );
};