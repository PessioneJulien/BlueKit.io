'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CanvasNode, NodeData, NodePosition } from './CanvasNode';
import { ConnectionLine, TempConnectionLine, Connection } from './ConnectionLine';
import { Button } from '@/components/ui/Button';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize,
  Grid3X3,
} from 'lucide-react';

interface CanvasNode extends NodeData {
  position: NodePosition;
  isCompact?: boolean;
}

interface VisualCanvasProps {
  nodes: CanvasNode[];
  connections: Connection[];
  onNodesChange: (nodes: CanvasNode[]) => void;
  onConnectionsChange: (connections: Connection[]) => void;
  className?: string;
}

export const VisualCanvas: React.FC<VisualCanvasProps> = ({
  nodes,
  connections,
  onNodesChange,
  onConnectionsChange,
  className
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [connectingFromPosition, setConnectingFromPosition] = useState<'left' | 'right' | null>(null);
  const [tempConnectionEnd, setTempConnectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Handle node position changes
  const handleNodePositionChange = useCallback((nodeId: string, position: NodePosition) => {
    const updatedNodes = nodes.map(node => 
      node.id === nodeId ? { ...node, position } : node
    );
    onNodesChange(updatedNodes);
    
    // Update connection positions
    const updatedConnections = connections.map(connection => {
      const sourceNode = updatedNodes.find(n => n.id === connection.sourceNodeId);
      const targetNode = updatedNodes.find(n => n.id === connection.targetNodeId);
      
      if (!sourceNode || !targetNode) return connection;
      
      const sourceWidth = sourceNode.isCompact ? 200 : 280;
      const sourceHeight = sourceNode.isCompact ? 80 : 120;
      const targetHeight = targetNode.isCompact ? 80 : 120;
      
      return {
        ...connection,
        sourcePosition: {
          x: sourceNode.position.x + sourceWidth,
          y: sourceNode.position.y + sourceHeight / 2
        },
        targetPosition: {
          x: targetNode.position.x,
          y: targetNode.position.y + targetHeight / 2
        }
      };
    });
    
    onConnectionsChange(updatedConnections);
  }, [nodes, connections, onNodesChange, onConnectionsChange]);

  // Handle node deletion
  const handleNodeDelete = useCallback((nodeId: string) => {
    const updatedNodes = nodes.filter(node => node.id !== nodeId);
    const updatedConnections = connections.filter(
      connection => connection.sourceNodeId !== nodeId && connection.targetNodeId !== nodeId
    );
    
    onNodesChange(updatedNodes);
    onConnectionsChange(updatedConnections);
    
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [nodes, connections, selectedNodeId, onNodesChange, onConnectionsChange]);

  // Handle node mode toggle
  const handleToggleMode = useCallback((nodeId: string) => {
    const updatedNodes = nodes.map(node => 
      node.id === nodeId ? { ...node, isCompact: !node.isCompact } : node
    );
    onNodesChange(updatedNodes);
  }, [nodes, onNodesChange]);

  // Handle connection start
  const handleStartConnection = useCallback((nodeId: string, position: 'left' | 'right') => {
    setIsConnecting(true);
    setConnectingFromId(nodeId);
    setConnectingFromPosition(position);
  }, []);

  // Handle connection end
  const handleEndConnection = useCallback((nodeId: string, position: 'left' | 'right') => {
    if (!isConnecting || !connectingFromId || connectingFromId === nodeId || !nodeId) {
      setIsConnecting(false);
      setConnectingFromId(null);
      setConnectingFromPosition(null);
      setTempConnectionEnd(null);
      return;
    }

    // Check if connection already exists
    const existingConnection = connections.find(
      conn => 
        (conn.sourceNodeId === connectingFromId && conn.targetNodeId === nodeId) ||
        (conn.sourceNodeId === nodeId && conn.targetNodeId === connectingFromId)
    );

    if (existingConnection) {
      setIsConnecting(false);
      setConnectingFromId(null);
      setConnectingFromPosition(null);
      setTempConnectionEnd(null);
      return;
    }

    // Create new connection
    const sourceNode = nodes.find(n => n.id === connectingFromId);
    const targetNode = nodes.find(n => n.id === nodeId);

    if (sourceNode && targetNode) {
      // Determine connection type based on compatibility
      let connectionType: 'compatible' | 'incompatible' | 'neutral' = 'neutral';
      
      if (sourceNode.compatibleWith?.includes(targetNode.id)) {
        connectionType = 'compatible';
      } else if (sourceNode.incompatibleWith?.includes(targetNode.id)) {
        connectionType = 'incompatible';
      }

      const sourceWidth = sourceNode.isCompact ? 200 : 280;
      const sourceHeight = sourceNode.isCompact ? 80 : 120;
      const targetHeight = targetNode.isCompact ? 80 : 120;

      const newConnection: Connection = {
        id: `${connectingFromId}-${nodeId}-${Date.now()}`,
        sourceNodeId: connectingFromId,
        targetNodeId: nodeId,
        sourcePosition: {
          x: sourceNode.position.x + sourceWidth,
          y: sourceNode.position.y + sourceHeight / 2
        },
        targetPosition: {
          x: targetNode.position.x,
          y: targetNode.position.y + targetHeight / 2
        },
        type: connectionType
      };

      onConnectionsChange([...connections, newConnection]);
    }

    setIsConnecting(false);
    setConnectingFromId(null);
    setConnectingFromPosition(null);
    setTempConnectionEnd(null);
  }, [isConnecting, connectingFromId, connections, nodes, onConnectionsChange]);

  // Handle connection deletion
  const handleConnectionDelete = useCallback((connectionId: string) => {
    const updatedConnections = connections.filter(conn => conn.id !== connectionId);
    onConnectionsChange(updatedConnections);
  }, [connections, onConnectionsChange]);

  // Handle canvas mouse events
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.target === svgRef.current) {
      setSelectedNodeId(null);
      
      if (e.button === 1 || (e.button === 0 && (e.metaKey || e.ctrlKey || e.shiftKey))) { // Middle click, Cmd+click, Ctrl+click, or Shift+click for panning
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  }, [pan]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
    
    if (isConnecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setTempConnectionEnd({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom
      });
    }
  }, [isPanning, panStart, isConnecting, pan, zoom]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Keyboard shortcuts and wheel events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsConnecting(false);
        setConnectingFromId(null);
        setConnectingFromPosition(null);
        setTempConnectionEnd(null);
        setSelectedNodeId(null);
      }
      
      if (e.key === 'Delete' && selectedNodeId) {
        handleNodeDelete(selectedNodeId);
      }
      
      if (e.key === '=' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleZoomIn();
      }
      
      if (e.key === '-' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleZoomOut();
      }
      
      if (e.key === '0' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleZoomReset();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Always prevent default scrolling on canvas
      e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl/Cmd + wheel
        if (e.deltaY < 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      } else if (e.shiftKey) {
        // Pan horizontally with Shift + wheel
        setPan(prev => ({
          ...prev,
          x: prev.x - e.deltaY * 0.5
        }));
      } else {
        // Pan vertically with wheel
        setPan(prev => ({
          ...prev,
          y: prev.y - e.deltaY * 0.5
        }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    canvasRef.current?.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      canvasRef.current?.removeEventListener('wheel', handleWheel);
    };
  }, [selectedNodeId, handleNodeDelete]);

  return (
    <div className={cn('relative flex-1 overflow-hidden bg-slate-950', className)}>
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-2">
          <Button variant="ghost" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" color="white"/>
          </Button>
          <span className="px-2 text-sm text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <Button size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" color="white"/>
          </Button>
          <Button size="sm" onClick={handleZoomReset}>
            <Maximize className="h-4 w-4" color="white"/>
          </Button>
        </div>
        
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-2">
          <Button 
            variant={showGrid ? 'primary' : 'ghost'} 
            size="sm" 
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-move"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Grid Background */}
        {showGrid && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(71, 85, 105) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(71, 85, 105) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        )}

        {/* SVG for connections */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          {/* Render connections */}
          {connections.map(connection => (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              onDelete={handleConnectionDelete}
            />
          ))}
          
          {/* Temporary connection line */}
          {isConnecting && connectingFromId && connectingFromPosition && tempConnectionEnd && (
            <TempConnectionLine
              startPosition={(() => {
                const sourceNode = nodes.find(n => n.id === connectingFromId);
                if (!sourceNode) return { x: 0, y: 0 };
                
                const sourceWidth = sourceNode.isCompact ? 200 : 280;
                const sourceHeight = sourceNode.isCompact ? 80 : 120;
                
                return {
                  x: connectingFromPosition === 'right' 
                    ? sourceNode.position.x + sourceWidth 
                    : sourceNode.position.x,
                  y: sourceNode.position.y + sourceHeight / 2
                };
              })()}
              endPosition={tempConnectionEnd}
            />
          )}
        </svg>

        {/* Render nodes */}
        {nodes.map(node => (
          <CanvasNode
            key={node.id}
            data={node}
            position={node.position}
            isSelected={selectedNodeId === node.id}
            isConnecting={isConnecting && connectingFromId === node.id}
            isCompact={node.isCompact !== false} // Default to true
            onPositionChange={handleNodePositionChange}
            onSelect={setSelectedNodeId}
            onDelete={handleNodeDelete}
            onStartConnection={handleStartConnection}
            onEndConnection={handleEndConnection}
            onToggleMode={handleToggleMode}
          />
        ))}
      </div>

      {/* Status bar */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2">
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <span>{nodes.length} nodes</span>
          <span>{connections.length} connections</span>
          {isConnecting && (
            <span className="text-blue-400">
              Connecting from {nodes.find(n => n.id === connectingFromId)?.name}...
            </span>
          )}
          {isPanning && (
            <span className="text-green-400">Panning...</span>
          )}
        </div>
      </div>

      {/* Navigation Help */}
      <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2">
        <div className="text-xs text-slate-400 space-y-1">
          <div>• Scroll to pan • Shift+Scroll horizontal</div>
          <div>• Cmd/Ctrl+Scroll to zoom</div>
          <div>• Drag connection handles</div>
        </div>
      </div>
    </div>
  );
};