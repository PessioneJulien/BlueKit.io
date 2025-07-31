'use client';

import { EdgeProps, getSmoothStepPath } from 'reactflow';
import { ConnectionStyle } from './ConnectionStyleEditor';

interface CustomEdgeData {
  connectionId: string;
  style?: ConnectionStyle;
  onStyleChange?: (connectionId: string, style: ConnectionStyle) => void;
  onSelect?: (connectionId: string) => void;
  isSelected?: boolean;
}

export const CustomEdge: React.FC<EdgeProps<CustomEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}) => {
  // Remove modal state - we'll use selection instead

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleEdgeClick = (event: React.MouseEvent) => {
    if (!data?.onSelect) return;
    
    event.stopPropagation();
    event.preventDefault();
    
    // Select this connection to show toolbar
    data.onSelect(data.connectionId);
  };

  // Remove handleStyleChange - styles will be handled by toolbar

  // Apply custom styles
  const customStyle = data?.style;
  const isSelected = data?.isSelected;
  
  const edgeStyle = {
    ...style,
    stroke: customStyle?.color || style.stroke || '#3b82f6',
    strokeWidth: customStyle?.strokeWidth || style.strokeWidth || 2,
    opacity: customStyle?.opacity || style.opacity || 1,
    strokeDasharray: customStyle?.strokeStyle === 'dashed' ? '8,4' :
                    customStyle?.strokeStyle === 'dotted' ? '2,2' :
                    customStyle?.strokeStyle === 'animated' ? '8,4' : 'none',
    // Add selection highlight
    filter: isSelected ? 'drop-shadow(0 0 6px currentColor)' : undefined,
  };

  // Apply animation classes
  let pathClass = '';
  if (customStyle?.animation === 'flow') {
    pathClass = 'connection-flow';
  } else if (customStyle?.animation === 'pulse') {
    pathClass = 'connection-pulse';
  } else if (customStyle?.animation === 'glow') {
    pathClass = 'connection-glow';
  }

  return (
    <>
      <path
        id={id}
        style={edgeStyle}
        className={`react-flow__edge-path ${pathClass}`}
        d={edgePath}
        markerEnd={markerEnd}
        onClick={handleEdgeClick}
        cursor="pointer"
      />
      
      {/* Invisible larger path for easier clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onClick={handleEdgeClick}
        cursor="pointer"
      />

      {/* No longer need EdgeLabelRenderer for modal */}
    </>
  );
};