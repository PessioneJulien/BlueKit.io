'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ConnectionStyleEditor, ConnectionStyle, StyledConnection } from './ConnectionStyleEditor';

export interface Connection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  type: 'compatible' | 'incompatible' | 'neutral';
  style?: ConnectionStyle;
}

interface ConnectionLineProps {
  connection: Connection;
  onDelete?: (connectionId: string) => void;
  onStyleChange?: (connectionId: string, style: ConnectionStyle) => void;
  className?: string;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  onDelete,
  onStyleChange,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 });

  const { sourcePosition, targetPosition, type } = connection;
  
  // Calculate control points for curved line
  const deltaX = targetPosition.x - sourcePosition.x;
  const deltaY = targetPosition.y - sourcePosition.y;
  
  // Make the curve more pronounced based on distance
  const controlPointOffset = Math.min(Math.abs(deltaX) * 0.5, 100);
  
  const controlPoint1X = sourcePosition.x + controlPointOffset;
  const controlPoint1Y = sourcePosition.y;
  
  const controlPoint2X = targetPosition.x - controlPointOffset;
  const controlPoint2Y = targetPosition.y;

  // Create SVG path for curved line
  const pathData = `M ${sourcePosition.x} ${sourcePosition.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetPosition.x} ${targetPosition.y}`;

  // Get line color based on custom style or connection type
  const getLineColor = () => {
    if (connection.style?.color) {
      return connection.style.color;
    }
    switch (type) {
      case 'compatible':
        return '#10b981'; // green-500
      case 'incompatible':
        return '#ef4444'; // red-500
      default:
        return '#3b82f6'; // blue-500
    }
  };

  // Get stroke style
  const getStrokeStyle = () => {
    if (connection.style?.strokeStyle) {
      switch (connection.style.strokeStyle) {
        case 'dashed':
          return '8,4';
        case 'dotted':
          return '2,2';
        case 'animated':
          return '8,4';
        default:
          return 'none';
      }
    }
    return type === 'incompatible' ? '5,5' : 'none';
  };

  // Get stroke width
  const getStrokeWidth = () => {
    return connection.style?.strokeWidth || 2;
  };

  // Get opacity
  const getOpacity = () => {
    return connection.style?.opacity || 1;
  };

  // Handle connection click for style editing
  const handleConnectionClick = (e: React.MouseEvent) => {
    if (!onStyleChange) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    setEditorPosition({
      x: e.clientX,
      y: e.clientY
    });
    setShowStyleEditor(true);
  };

  // Calculate midpoint for delete button
  const midX = (sourcePosition.x + targetPosition.x) / 2;
  const midY = (sourcePosition.y + targetPosition.y) / 2;

  return (
    <g className={className}>
      {/* Connection line */}
      <path
        d={pathData}
        fill="none"
        stroke={getLineColor()}
        strokeWidth={isHovered ? getStrokeWidth() + 1 : getStrokeWidth()}
        strokeDasharray={getStrokeStyle()}
        opacity={getOpacity()}
        className={cn(
          'transition-all duration-200 cursor-pointer',
          'drop-shadow-sm hover:drop-shadow-md',
          connection.style?.animation === 'pulse' && 'animate-pulse',
          connection.style?.animation === 'glow' && 'filter drop-shadow-lg'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleConnectionClick}
      >
        {/* Animated flow effect */}
        {connection.style?.animation === 'flow' && connection.style?.strokeStyle === 'animated' && (
          <animate
            attributeName="stroke-dasharray"
            values="0,12;12,0;0,12"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </path>
      
      {/* Arrow marker */}
      <defs>
        <marker
          id={`arrowhead-${connection.id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={getLineColor()}
            className="transition-colors duration-200"
          />
        </marker>
      </defs>
      
      <path
        d={pathData}
        fill="none"
        stroke={getLineColor()}
        strokeWidth={isHovered ? getStrokeWidth() + 1 : getStrokeWidth()}
        strokeDasharray={getStrokeStyle()}
        opacity={getOpacity()}
        className={cn(
          'transition-all duration-200 cursor-pointer',
          connection.style?.animation === 'pulse' && 'animate-pulse',
          connection.style?.animation === 'glow' && 'filter drop-shadow-lg'
        )}
        markerEnd={`url(#arrowhead-${connection.id})`}
        onClick={handleConnectionClick}
      >
        {/* Animated flow effect */}
        {connection.style?.animation === 'flow' && connection.style?.strokeStyle === 'animated' && (
          <animate
            attributeName="stroke-dasharray"
            values="0,12;12,0;0,12"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Delete button (appears on hover) */}
      {isHovered && onDelete && (
        <g>
          <circle
            cx={midX}
            cy={midY}
            r="12"
            className="fill-red-500/80 hover:fill-red-500 cursor-pointer transition-colors"
            onClick={() => onDelete(connection.id)}
          />
          <path
            d={`M ${midX - 4} ${midY - 4} L ${midX + 4} ${midY + 4} M ${midX + 4} ${midY - 4} L ${midX - 4} ${midY + 4}`}
            className="stroke-white stroke-2 pointer-events-none"
          />
        </g>
      )}

      {/* Connection type indicator */}
      {type !== 'neutral' && (
        <circle
          cx={sourcePosition.x + (deltaX * 0.2)}
          cy={sourcePosition.y + (deltaY * 0.2)}
          r="6"
          fill={getLineColor()}
          className="transition-colors duration-200 opacity-70"
        />
      )}

      {/* Style Editor */}
      {showStyleEditor && onStyleChange && (
        <foreignObject x="0" y="0" width="100%" height="100%">
          <ConnectionStyleEditor
            connection={connection as StyledConnection}
            onStyleChange={onStyleChange}
            onClose={() => setShowStyleEditor(false)}
            position={editorPosition}
          />
        </foreignObject>
      )}
    </g>
  );
};

// Temporary connection line while dragging
interface TempConnectionLineProps {
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  className?: string;
}

export const TempConnectionLine: React.FC<TempConnectionLineProps> = ({
  startPosition,
  endPosition,
  className
}) => {
  const deltaX = endPosition.x - startPosition.x;
  const controlPointOffset = Math.min(Math.abs(deltaX) * 0.5, 100);
  
  const controlPoint1X = startPosition.x + controlPointOffset;
  const controlPoint1Y = startPosition.y;
  
  const controlPoint2X = endPosition.x - controlPointOffset;
  const controlPoint2Y = endPosition.y;

  const pathData = `M ${startPosition.x} ${startPosition.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endPosition.x} ${endPosition.y}`;

  return (
    <path
      d={pathData}
      fill="none"
      className={cn(
        'stroke-blue-400 stroke-2 opacity-60 pointer-events-none',
        'stroke-dasharray-[5,5]',
        className
      )}
    />
  );
};