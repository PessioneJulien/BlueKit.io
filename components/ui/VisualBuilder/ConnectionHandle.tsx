'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ConnectionHandleProps {
  nodeId: string;
  position: 'left' | 'right';
  isConnecting: boolean;
  onStartConnection: (nodeId: string, position: 'left' | 'right') => void;
  onEndConnection: (nodeId: string, position: 'left' | 'right') => void;
  className?: string;
}

export const ConnectionHandle: React.FC<ConnectionHandleProps> = ({
  nodeId,
  position,
  isConnecting,
  onStartConnection,
  onEndConnection,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const handleRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsDragging(true);
    onStartConnection(nodeId, position);
    
    // Add global mouse events for dragging connection
    const handleMouseMove = (e: MouseEvent) => {
      // This will be handled by the parent canvas for temp line
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      
      // Check if we're over another connection handle
      const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
      const targetHandle = elementUnderMouse?.closest('[data-connection-handle]') as HTMLElement;
      
      if (targetHandle && targetHandle !== handleRef.current) {
        const targetNodeId = targetHandle.dataset.nodeId;
        const targetPosition = targetHandle.dataset.position as 'left' | 'right';
        
        if (targetNodeId && targetPosition && targetNodeId !== nodeId) {
          onEndConnection(targetNodeId, targetPosition);
          return;
        }
      }
      
      // If no valid target, cancel connection
      onEndConnection('', 'left');
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <button
      ref={handleRef}
      data-connection-handle
      data-node-id={nodeId}
      data-position={position}
      className={cn(
        'w-4 h-4 rounded-full border-2 transition-all duration-200',
        'hover:scale-125 active:scale-110',
        isHovered && 'scale-125',
        isDragging && 'scale-150 shadow-lg',
        isConnecting 
          ? 'border-green-400 bg-green-500 shadow-green-400/50' 
          : 'border-slate-600 bg-slate-800 hover:border-blue-400 hover:bg-blue-500',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        [position === 'left' ? 'left' : 'right']: '-8px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10
      }}
    />
  );
};