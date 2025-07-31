'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface Connection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  type: 'compatible' | 'incompatible' | 'neutral';
}

interface ConnectionLineProps {
  connection: Connection;
  onDelete?: (connectionId: string) => void;
  className?: string;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  onDelete,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

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

  // Get line color based on connection type
  const getLineColor = () => {
    switch (type) {
      case 'compatible':
        return 'stroke-green-400';
      case 'incompatible':
        return 'stroke-red-400';
      default:
        return 'stroke-blue-400';
    }
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
        className={cn(
          'transition-all duration-200',
          getLineColor(),
          isHovered ? 'stroke-[3]' : 'stroke-2',
          'drop-shadow-sm'
        )}
        strokeDasharray={type === 'incompatible' ? '5,5' : 'none'}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
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
            className={cn(
              'transition-colors duration-200',
              getLineColor().replace('stroke-', 'fill-')
            )}
          />
        </marker>
      </defs>
      
      <path
        d={pathData}
        fill="none"
        className={cn(
          'transition-all duration-200',
          getLineColor(),
          isHovered ? 'stroke-[3]' : 'stroke-2'
        )}
        strokeDasharray={type === 'incompatible' ? '5,5' : 'none'}
        markerEnd={`url(#arrowhead-${connection.id})`}
      />

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
          className={cn(
            'transition-colors duration-200',
            type === 'compatible' ? 'fill-green-400' : 'fill-red-400'
          )}
        />
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