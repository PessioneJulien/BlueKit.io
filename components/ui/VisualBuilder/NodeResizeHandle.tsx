'use client';

import { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface NodeResizeHandleProps {
  nodeId: string;
  currentWidth: number;
  currentHeight: number;
  onResize: (nodeId: string, width: number, height: number) => void;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const NodeResizeHandle: React.FC<NodeResizeHandleProps> = ({
  nodeId,
  currentWidth,
  currentHeight,
  onResize,
  minWidth = 200,
  minHeight = 80,
  maxWidth = 400,
  maxHeight = 600
}) => {
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0, width: currentWidth, height: currentHeight });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    isResizing.current = true;
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: currentWidth,
      height: currentHeight
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;

      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      const newWidth = Math.max(minWidth, Math.min(maxWidth, startPos.current.width + deltaX));
      const newHeight = Math.max(minHeight, Math.min(maxHeight, startPos.current.height + deltaY));

      onResize(nodeId, newWidth, newHeight);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [currentWidth, currentHeight, nodeId, onResize, minWidth, minHeight, maxWidth, maxHeight]);

  return (
    <>
      {/* Corner resize handle */}
      <div
        className={cn(
          "absolute bottom-0 right-0 w-4 h-4 cursor-se-resize",
          "bg-blue-500/20 hover:bg-blue-500/40 transition-colors",
          "border-r-2 border-b-2 border-blue-500/50"
        )}
        onMouseDown={handleMouseDown}
        style={{
          borderBottomRightRadius: '0.5rem'
        }}
      />
      
      {/* Edge resize handles */}
      <div
        className="absolute bottom-0 right-4 left-4 h-2 cursor-s-resize hover:bg-blue-500/20 transition-colors"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startHeight = currentHeight;
          
          const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - startX;
            const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
            onResize(nodeId, currentWidth, newHeight);
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />
      
      <div
        className="absolute top-4 bottom-4 right-0 w-2 cursor-e-resize hover:bg-blue-500/20 transition-colors"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startWidth = currentWidth;
          
          const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
            onResize(nodeId, newWidth, currentHeight);
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />
    </>
  );
};