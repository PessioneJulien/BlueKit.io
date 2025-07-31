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
  NodeChange,
  EdgeChange,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TechNode } from './TechNode';
import { NodeData } from './CanvasNode';

// Custom node types
const nodeTypes: NodeTypes = {
  techNode: TechNode,
};

interface ReactFlowCanvasProps {
  nodes: Array<NodeData & { position: { x: number; y: number }; isCompact?: boolean }>;
  connections: Array<{ id: string; sourceNodeId: string; targetNodeId: string; type: string }>;
  onNodesChange: (nodes: Array<NodeData & { position: { x: number; y: number }; isCompact?: boolean }>) => void;
  onConnectionsChange: (connections: Array<{ id: string; sourceNodeId: string; targetNodeId: string; type: string }>) => void;
  className?: string;
}

export const ReactFlowCanvas: React.FC<ReactFlowCanvasProps> = ({
  nodes: externalNodes,
  connections: externalConnections,
  onNodesChange,
  onConnectionsChange,
  className
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
        onDelete: (id: string) => {
          const updatedNodes = nodeList.filter(n => n.id !== id);
          onNodesChange(updatedNodes);
          
          const updatedConnections = externalConnections.filter(
            conn => conn.sourceNodeId !== id && conn.targetNodeId !== id
          );
          onConnectionsChange(updatedConnections);
        },
        onToggleMode: (id: string) => {
          // Find the current state of the node
          const currentNode = externalNodes.find(n => n.id === id);
          if (currentNode) {
            const updatedNodes = externalNodes.map(n =>
              n.id === id ? { ...n, isCompact: !currentNode.isCompact } : n
            );
            onNodesChange(updatedNodes);
          }
        }
      }
    }));
  }, [onNodesChange, externalConnections, onConnectionsChange, externalNodes]);

  const convertToReactFlowEdges = useCallback((connectionList: typeof externalConnections): Edge[] =>
    connectionList.map(conn => ({
      id: conn.id,
      source: conn.sourceNodeId,
      target: conn.targetNodeId,
      type: 'smoothstep',
      animated: conn.type === 'compatible',
      style: {
        stroke: conn.type === 'compatible' ? '#10b981' : 
               conn.type === 'incompatible' ? '#ef4444' : '#3b82f6',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: conn.type === 'compatible' ? '#10b981' : 
               conn.type === 'incompatible' ? '#ef4444' : '#3b82f6',
      }
    })), []
  );

  // Sync ReactFlow nodes back to our format when they change
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChangeInternal(changes);
    
    // Only sync back when drag ends or remove operations
    const dragEndChanges = changes.filter((change) => 
      (change.type === 'position' && 'dragging' in change && !(change as { dragging?: boolean }).dragging) ||
      change.type === 'remove'
    );
    
    if (dragEndChanges.length > 0) {
      // Sync positions back to parent state
      setTimeout(() => {
        const updatedNodes = nodes.map(node => ({
          ...node.data,
          position: node.position,
          isCompact: node.data.isCompact
        }));
        onNodesChange(updatedNodes);
      }, 10);
    }
  }, [nodes, onNodesChange, onNodesChangeInternal]);

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
    const newEdge: Edge = {
      id: newConnection.id,
      source: params.source!,
      target: params.target!,
      type: 'smoothstep',
      animated: connectionType === 'compatible',
      style: {
        stroke: connectionType === 'compatible' ? '#10b981' : 
               connectionType === 'incompatible' ? '#ef4444' : '#3b82f6',
        strokeWidth: 2,
      },
              markerEnd: {
          type: MarkerType.ArrowClosed,
          color: connectionType === 'compatible' ? '#10b981' : 
                 connectionType === 'incompatible' ? '#ef4444' : '#3b82f6',
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

  // Update nodes when external nodes change
  useEffect(() => {
    const reactFlowNodes = convertToReactFlowNodes(externalNodes);
    setNodes(reactFlowNodes);
  }, [externalNodes, convertToReactFlowNodes, setNodes]);

  // Update edges when external connections change  
  useEffect(() => {
    const reactFlowEdges = convertToReactFlowEdges(externalConnections);
    setEdges(reactFlowEdges);
  }, [externalConnections, convertToReactFlowEdges, setEdges]);


  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={2}
        snapToGrid={true}
        snapGrid={[15, 15]}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Meta"
        panOnDrag={[1, 2]} // Pan only with middle mouse or right mouse
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        selectNodesOnDrag={true}
        nodesConnectable={true}
        nodesDraggable={true}
        elementsSelectable={true}
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