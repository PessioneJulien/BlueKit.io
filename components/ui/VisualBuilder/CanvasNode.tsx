'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConnectionHandle } from './ConnectionHandle';
import { NodeColorPicker, NodeCustomStyle, StyledNodeData } from './NodeColorPicker';
import { nodeVariants, buttonVariants } from '@/lib/animations/variants';
import { X, MoreVertical, Settings, Info, Palette, Box } from 'lucide-react';

export interface NodePosition {
  x: number;
  y: number;
}

export interface SubTechnology {
  id: string;
  name: string;
  type: 'styling' | 'testing' | 'documentation' | 'state-management' | 'routing' | 'build-tool' | 'linting' | 'deployment' | 'other';
  description: string;
  setupTimeHours: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  pricing: 'free' | 'freemium' | 'paid';
}

export interface ResourceStats {
  cpu: string; // CPU requirements (e.g., "2 cores", "1 CPU")
  memory: string; // Memory requirements (e.g., "512MB", "2GB")
  storage?: string; // Storage requirements (e.g., "10GB", "1TB")
  network?: string; // Network usage (e.g., "1Mbps", "100Mbps")
}

export interface NodeData {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'other' | 'testing' | 'ui-ux' | 'state-management' | 'routing' | 'documentation' | 'build-tools' | 'linting';
  description: string;
  setupTimeHours: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  pricing: 'free' | 'freemium' | 'paid';
  compatibleWith?: string[];
  incompatibleWith?: string[];
  isMainTechnology?: boolean; // Indique si c'est une techno principale
  subTechnologies?: SubTechnology[]; // Sous-technologies intégrées
  canAcceptSubTech?: string[]; // Types de sous-technos acceptées
  customStyle?: NodeCustomStyle; // Style personnalisé
  resources?: ResourceStats; // Resource requirements
  environmentVariables?: Record<string, string>; // Environment variables for configuration
  // Container properties (optional)
  isContainer?: boolean;
  containerType?: 'docker' | 'kubernetes';
  containedNodes?: NodeData[];
  connectedServices?: {
    id: string;
    name: string;
    port: string;
    status: 'connected' | 'disconnected' | 'pending';
  }[];
  ports?: string[];
  status?: 'running' | 'stopped' | 'pending';
}

interface CanvasNodeProps {
  data: NodeData;
  position: NodePosition;
  isSelected: boolean;
  isConnecting: boolean;
  isCompact?: boolean;
  onPositionChange: (id: string, position: NodePosition) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onStartConnection: (nodeId: string, position: 'left' | 'right') => void;
  onEndConnection: (nodeId: string, position: 'left' | 'right') => void;
  onToggleMode?: (id: string) => void;
  onStyleChange?: (nodeId: string, style: NodeCustomStyle) => void;
  onConvertToContainer?: (nodeId: string, containerType: 'docker' | 'kubernetes' | 'custom') => void;
  className?: string;
}

const categoryColors = {
  frontend: 'from-blue-500 to-cyan-500',
  backend: 'from-green-500 to-emerald-500', 
  database: 'from-purple-500 to-violet-500',
  devops: 'from-orange-500 to-red-500',
  mobile: 'from-pink-500 to-rose-500',
  ai: 'from-yellow-500 to-amber-500',
  other: 'from-gray-500 to-slate-500'
};

const difficultyColors = {
  beginner: 'text-green-400',
  intermediate: 'text-yellow-400', 
  expert: 'text-red-400'
};

export const CanvasNode: React.FC<CanvasNodeProps> = ({
  data,
  position,
  isSelected,
  isConnecting,
  isCompact = true,
  onPositionChange,
  onSelect,
  onDelete,
  onStartConnection,
  onEndConnection,
  onToggleMode,
  onStyleChange,
  onConvertToContainer,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Get custom style or default category colors
  const getNodeStyle = () => {
    if (data.customStyle) {
      return {
        background: data.customStyle.customGradient || 
                   `linear-gradient(135deg, ${data.customStyle.primaryColor}, ${data.customStyle.secondaryColor})`,
        borderColor: data.customStyle.borderColor,
        color: data.customStyle.textColor
      };
    }
    return {
      background: `bg-gradient-to-r ${categoryColors[data.category as keyof typeof categoryColors]}`,
      borderColor: '',
      color: 'white'
    };
  };

  const nodeStyle = getNodeStyle();

  const handleColorChange = (nodeId: string, style: NodeCustomStyle) => {
    if (onStyleChange) {
      onStyleChange(nodeId, style);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    // Don't start dragging if clicking on buttons or interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    onSelect(data.id);
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const canvas = nodeRef.current?.parentElement;
      if (!canvas) return;
      
      const canvasRect = canvas.getBoundingClientRect();
      const transform = getComputedStyle(canvas).transform;
      
      // Parse transform matrix to get current zoom and pan
      let scale = 1;
      let translateX = 0;
      let translateY = 0;
      
      if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
          const values = matrix[1].split(',').map(v => parseFloat(v.trim()));
          scale = values[0];
          translateX = values[4];
          translateY = values[5];
        }
      }
      
      const newPosition = {
        x: (e.clientX - canvasRect.left - translateX) / scale - dragOffset.x,
        y: (e.clientY - canvasRect.top - translateY) / scale - dragOffset.y
      };
      
      // Allow movement in a larger space
      newPosition.x = Math.max(-100, Math.min(newPosition.x, 2000));
      newPosition.y = Math.max(-100, Math.min(newPosition.y, 1500));
      
      onPositionChange(data.id, newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Add cursor style to document
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragOffset, data.id, onPositionChange]);

  const handleStartConnection = (nodeId: string, position: 'left' | 'right') => {
    onStartConnection(nodeId, position);
  };

  const handleEndConnection = (nodeId: string, position: 'left' | 'right') => {
    onEndConnection(nodeId, position);
  };

  return (
    <motion.div
      ref={nodeRef}
      className={cn(
        'absolute bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-lg',
        'hover:shadow-xl hover:border-slate-600/70',
        isSelected && 'ring-2 ring-blue-500 ring-opacity-60 shadow-blue-500/20',
        isConnecting && 'ring-2 ring-green-500 ring-opacity-60',
        !isDragging && 'cursor-grab',
        isDragging && 'cursor-grabbing',
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        width: isCompact ? '200px' : '280px',
        minHeight: isCompact ? '80px' : '120px',
        zIndex: isDragging ? 1000 : isSelected ? 100 : 1
      }}
      variants={nodeVariants}
      initial="hidden"
      animate={isCompact ? "compact" : "expanded"}
      whileHover={!isDragging ? "hover" : undefined}
      whileTap="tap"
      exit="exit"
      layout
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div 
        className={cn(
          'flex items-center justify-between rounded-t-lg',
          isCompact ? 'p-2' : 'p-3',
          !data.customStyle && `bg-gradient-to-r ${categoryColors[data.category as keyof typeof categoryColors]}`
        )}
        style={data.customStyle ? {
          background: nodeStyle.background,
          borderColor: nodeStyle.borderColor,
          color: nodeStyle.color
        } : {}}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={cn(
            'bg-white/30 rounded-full flex-shrink-0',
            isCompact ? 'w-2 h-2' : 'w-3 h-3'
          )} />
          <h3 className={cn(
            'font-semibold truncate',
            isCompact ? 'text-sm' : 'text-base',
            !data.customStyle && 'text-white'
          )}
          style={data.customStyle ? { color: nodeStyle.color } : {}}
          >
            {data.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {onToggleMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onToggleMode(data.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className={cn(
                "p-1 rounded transition-colors",
                data.customStyle ? "hover:bg-black/20" : "hover:bg-white/20 text-white/80 hover:text-white"
              )}
              style={data.customStyle ? { color: nodeStyle.color + '80' } : {}}
              title={isCompact ? "Expand" : "Collapse"}
            >
              <div className={cn(
                "transition-transform",
                isCompact ? "rotate-0" : "rotate-180"
              )}>
                ⤢
              </div>
            </button>
          )}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowMenu(!showMenu);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={cn(
              "p-1 rounded transition-colors",
              data.customStyle ? "hover:bg-black/20" : "hover:bg-white/20 text-white/80 hover:text-white"
            )}
            style={data.customStyle ? { color: nodeStyle.color + '80' } : {}}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <MoreVertical className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete(data.id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={cn(
              "p-1 hover:bg-red-500/20 rounded transition-colors",
              data.customStyle ? "hover:text-red-300" : "text-white/80 hover:text-red-300"
            )}
            style={data.customStyle ? { color: nodeStyle.color + '80' } : {}}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <X className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className={cn("space-y-2", isCompact ? "p-2" : "p-3")}>
        {!isCompact && (
          <p className="text-sm text-slate-300 line-clamp-2 mb-3">
            {data.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant={data.pricing === 'free' ? 'success' : data.pricing === 'freemium' ? 'warning' : 'danger'}
            size="sm"
            outline
          >
            {data.pricing}
          </Badge>
          {!isCompact && (
            <Badge 
              variant={data.difficulty === 'beginner' ? 'success' : data.difficulty === 'intermediate' ? 'warning' : 'danger'}
              size="sm"
              outline
            >
              {data.difficulty}
            </Badge>
          )}
          <div className="text-xs text-slate-400">
            {data.setupTimeHours}h
          </div>
        </div>
      </div>

      {/* Connection Points */}
      <ConnectionHandle
        nodeId={data.id}
        position="left"
        isConnecting={isConnecting}
        onStartConnection={handleStartConnection}
        onEndConnection={handleEndConnection}
      />
      
      <ConnectionHandle
        nodeId={data.id}
        position="right"
        isConnecting={isConnecting}
        onStartConnection={handleStartConnection}
        onEndConnection={handleEndConnection}
      />

      {/* Context Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)}
            />
            <motion.div 
              className="absolute top-12 right-0 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-lg min-w-[160px]"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
            >
            <div className="p-1">
              {onStyleChange && (
                <button 
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(true);
                    setShowMenu(false);
                  }}
                >
                  <Palette className="w-4 h-4" />
                  Customize Colors
                </button>
              )}
              <button 
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Configure', data.name);
                  setShowMenu(false);
                }}
              >
                <Settings className="w-4 h-4" />
                Configure
              </button>
              <button 
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Details for', data.name);
                  setShowMenu(false);
                }}
              >
                <Info className="w-4 h-4" />
                Details
              </button>
              {!data.isContainer && onConvertToContainer && (
                <>
                  <div className="h-px bg-slate-700 my-1" />
                  <div className="px-2 py-1 text-xs text-slate-500 font-medium">
                    Convertir en conteneur
                  </div>
                  <button 
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConvertToContainer(data.id, 'docker');
                      setShowMenu(false);
                    }}
                  >
                    <Box className="w-4 h-4 text-blue-400" />
                    Docker Container
                  </button>
                  <button 
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConvertToContainer(data.id, 'kubernetes');
                      setShowMenu(false);
                    }}
                  >
                    <Box className="w-4 h-4 text-green-400" />
                    Kubernetes Pod
                  </button>
                  <button 
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConvertToContainer(data.id, 'custom');
                      setShowMenu(false);
                    }}
                  >
                    <Box className="w-4 h-4 text-purple-400" />
                    Conteneur personnalisé
                  </button>
                </>
              )}
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Color Picker */}
      {showColorPicker && onStyleChange && (
        <NodeColorPicker
          node={data as StyledNodeData}
          onStyleChange={handleColorChange}
          onClose={() => setShowColorPicker(false)}
          position={{
            x: position.x + (isCompact ? 200 : 280) + 20,
            y: position.y
          }}
        />
      )}
    </motion.div>
  );
};