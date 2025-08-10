'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  onResize: (width: number, height: number) => void;
  initialWidth: number;
  initialHeight: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  disabled?: boolean;
  className?: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onResize,
  initialWidth,
  initialHeight,
  minWidth = 200,
  minHeight = 150,
  maxWidth = 800,
  maxHeight = 600,
  disabled = false,
  className
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [currentSize, setCurrentSize] = useState({ width: initialWidth, height: initialHeight });
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: initialWidth, height: initialHeight });

  // Update current size when initial size changes
  useEffect(() => {
    setCurrentSize({ width: initialWidth, height: initialHeight });
  }, [initialWidth, initialHeight]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    console.log('🔄 ResizeHandle mouseDown triggered');
    
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent ReactFlow from starting node drag
    (e.target as HTMLElement).classList.add('nodrag');
    
    setIsResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { ...currentSize };
    
    document.body.style.cursor = 'nw-resize';
    document.body.style.userSelect = 'none';
  }, [disabled, currentSize]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;

    const newWidth = Math.max(
      minWidth,
      Math.min(maxWidth, startSize.current.width + deltaX)
    );
    const newHeight = Math.max(
      minHeight,
      Math.min(maxHeight, startSize.current.height + deltaY)
    );

    setCurrentSize({ width: newWidth, height: newHeight });
    onResize(newWidth, newHeight);
  }, [isResizing, minWidth, minHeight, maxWidth, maxHeight, onResize]);

  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;
    
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // Remove nodrag class after resize - more comprehensive cleanup
    const elements = document.querySelectorAll('.nodrag');
    elements.forEach(el => {
      // Only remove nodrag from temporary elements, not permanent ones
      if (!el.closest('.resize-handle') && !el.classList.contains('permanent-nodrag')) {
        el.classList.remove('nodrag');
      }
    });
  }, [isResizing]);

  // Add global mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (disabled) return null;

  return (
    <div
      className={cn(
        'absolute bottom-0 right-0 w-8 h-8 cursor-nw-resize group nodrag resize-handle z-50',
        'hover:bg-blue-500/40 transition-all duration-200 rounded-tl-lg',
        'border-2 border-slate-400 hover:border-blue-300 bg-slate-600/80 hover:bg-slate-500',
        'shadow-lg hover:shadow-blue-500/20',
        isResizing && 'bg-blue-500/70 border-blue-200 scale-110',
        className
      )}
      onMouseDown={handleMouseDown}
      title="Redimensionner le container"
    >
      {/* Resize indicator - make it more visible */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Main resize lines */}
          <div className="w-3 h-0.5 bg-slate-300 group-hover:bg-blue-300 transition-colors mb-1" />
          <div className="w-0.5 h-3 bg-slate-300 group-hover:bg-blue-300 transition-colors absolute top-0 right-0" />
          
          {/* Corner grip dots */}
          <div className="absolute -bottom-1 -right-1">
            <div className="w-1 h-1 bg-slate-300 group-hover:bg-blue-300 rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Hover tooltip */}
      <div className={cn(
        'absolute -top-8 -left-16 bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded shadow-lg',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none',
        'whitespace-nowrap'
      )}>
        Drag to resize
      </div>
    </div>
  );
};