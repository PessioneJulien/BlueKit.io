'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2, Minimize2, Grip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseFloatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
  headerActions?: ReactNode;
  footerActions?: ReactNode;
}

export const BaseFloatingModal: React.FC<BaseFloatingModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 600, height: 400 },
  minWidth = 400,
  minHeight = 300,
  maxWidth = 1200,
  maxHeight = 800,
  className,
  headerActions,
  footerActions
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      // Center the modal on open
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const modalWidth = size.width;
      const modalHeight = size.height;
      
      setPosition({
        x: Math.max(50, (windowWidth - modalWidth) / 2),
        y: Math.max(50, (windowHeight - modalHeight) / 2)
      });
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize') => {
    e.preventDefault();
    
    if (action === 'drag') {
      isDragging.current = true;
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        dragStart.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }
    } else {
      isResizing.current = true;
      dragStart.current = {
        x: e.clientX,
        y: e.clientY
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current && !isMaximized) {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - size.width, newX)),
        y: Math.max(0, Math.min(window.innerHeight - size.height, newY))
      });
    } else if (isResizing.current && !isMaximized) {
      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;
      
      setSize(prev => ({
        width: Math.max(minWidth, Math.min(maxWidth, prev.width + deltaX)),
        height: Math.max(minHeight, Math.min(maxHeight, prev.height + deltaY))
      }));
      
      dragStart.current = {
        x: e.clientX,
        y: e.clientY
      };
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isResizing.current = false;
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isOpen, size.width, size.height]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={panelRef}
      className={cn(
        "fixed bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col",
        isMaximized && "inset-4",
        className
      )}
      style={isMaximized ? {} : {
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-slate-700 cursor-move bg-slate-800/50 rounded-t-lg"
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
      >
        <div className="flex items-center gap-3">
          <Grip className="h-5 w-5 text-slate-500" />
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            {subtitle && (
              <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {headerActions}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* Footer (optional) */}
      {footerActions && (
        <div className="p-4 border-t border-slate-700 bg-slate-800/30">
          {footerActions}
        </div>
      )}

      {/* Resize handle */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => handleMouseDown(e, 'resize')}
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-slate-600" />
        </div>
      )}
    </div>
  );

  // Create portal to render at document body level
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
};