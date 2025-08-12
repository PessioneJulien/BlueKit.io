'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { X, MoreVertical, Settings, Info, FileText, Palette } from 'lucide-react';
import { NodeData, SubTechnology, ResourceStats } from './CanvasNode';
import { ResourceConfigModal } from './ResourceConfigModal';
import { NodeResizeHandle } from './NodeResizeHandle';
import { FloatingDocPanel } from './FloatingDocPanel';
import { NodeCustomStyle } from './NodeColorPicker';
import { AnimatedNode, AnimatedNodeRef } from '@/components/ui/animated/AnimatedNode';
import { useNodeAnimations } from '@/lib/hooks/useNodeAnimations';
import { logger } from '@/lib/utils/logger';
import { animationSystem } from '@/lib/animations/animationSystem';

interface TechNodeData extends NodeData {
  isCompact?: boolean;
  width?: number;
  height?: number;
  documentation?: string;
  onDelete: (id: string) => void;
  onToggleMode: (id: string) => void;
  onResize?: (id: string, width: number, height: number) => void;
  onDocumentationSave?: (nodeId: string, documentation: string) => void;
  onAddSubTechnology?: (nodeId: string, subTechId: string) => void;
  onRemoveSubTechnology?: (nodeId: string, subTechId: string) => void;
  onStyleChange?: (nodeId: string, style: NodeCustomStyle) => void;
  onNodeSelect?: (nodeId: string) => void;
  onConfigure?: (nodeId: string, resources: ResourceStats, envVars: Record<string, string>) => void;
  onNameChange?: (nodeId: string, newName: string) => void;
  availableSubTechnologies?: SubTechnology[];
  // Presentation mode
  isReadOnly?: boolean;
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

export const TechNode = memo<NodeProps<TechNodeData>>(({ data, selected }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(data.name);
  const [isBeingDragged, setIsBeingDragged] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const animatedNodeRef = useRef<AnimatedNodeRef>(null);
  const isCompact = data.isCompact ?? true; // Default to true if undefined
  
  // Animation hooks
  const {
    controls,
    handleAppear,
    handleDisappear,
    handleHover,
    handleHoverEnd,
    handleSelect,
    handleDeselect,
    handleDragStart: handleAnimatedDragStart,
    handleDragEnd: handleAnimatedDragEnd,
    handleModeTransition,
    handleDropSuccess,
    handleError
  } = useNodeAnimations(data.id, {
    enableCelebration: true
  });

  // Sync editName with data.name when it changes
  useEffect(() => {
    setEditName(data.name);
  }, [data.name]);
  
  // Handle configuration save
  const handleConfigurationSave = (resources: ResourceStats, envVars: Record<string, string>) => {
    if (data.onConfigure) {
      data.onConfigure(data.id, resources, envVars);
    }
  };
  
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

  // Color change now handled by toolbar
  
  // Debug logging
  logger.dev('TechNode render:', data.name, 'isCompact:', data.isCompact, 'calculated isCompact:', isCompact);
  // Use custom dimensions if available, otherwise use defaults based on mode
  const nodeWidth = data.width || (isCompact ? 200 : 300);
  const nodeHeight = data.height || (isCompact ? 
    (data.subTechnologies && data.subTechnologies.length > 0 ? 120 : 80) : 
    (data.subTechnologies && data.subTechnologies.length > 0 ? 180 : 140)
  );

  // Handle drop of tools onto this node
  const handleDragOver = (e: React.DragEvent) => {
    if (!data.isMainTechnology) return;
    
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation(); // Stop event from reaching ReactFlow
    
    // Show drop zone for main technologies during drag over
    // We can't reliably check drag data during dragover in all browsers
    logger.dev('🎯 DragOver on main tech:', data.name);
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation(); // Stop event from reaching ReactFlow
    
    // Only hide drop zone if actually leaving the node (not just moving to child elements)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation(); // Stop event from reaching ReactFlow
    setIsDragOver(false);

    logger.dev('🎯 Drop event on', data.name);

    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
      logger.dev('🎯 Drop data:', dragData);
      
      if ((dragData.type === 'tool' || dragData.type === 'community-component') && data.onAddSubTechnology && data.isMainTechnology) {
        logger.dev('✅ Dropping tool:', dragData.component.id, 'onto main tech:', data.id);
        data.onAddSubTechnology(data.id, dragData.component.id);
        
        // Show success animation
        handleDropSuccess();
      } else {
        logger.dev('❌ Drop conditions not met:', {
          type: dragData.type,
          hasCallback: !!data.onAddSubTechnology,
          isMainTech: data.isMainTechnology
        });
        
        // Show error animation if drop conditions not met
        handleError();
      }
    } catch (error) {
      logger.error('❌ Error handling tool drop:', error);
    }
  };

  // Handle node drag start
  const handleDragStart = (e: React.DragEvent) => {
    setIsBeingDragged(true);
    handleAnimatedDragStart();
    logger.dev('🎯 Node drag started:', data.name);
    
    // Set drag data for container drop detection
    try {
      const dragData = {
        type: 'node',
        node: data
      };
      const jsonData = JSON.stringify(dragData);
      logger.dev('🎯 Setting drag data:', jsonData);
      
      e.dataTransfer.setData('application/json', jsonData);
      e.dataTransfer.setData('text/plain', data.id);
      e.dataTransfer.effectAllowed = 'move';
      
      logger.dev('🎯 Drag data set successfully');
    } catch (error) {
      logger.error('Error setting drag data:', error);
    }
  };

  // Handle node drag end
  const handleDragEnd = () => {
    setIsBeingDragged(false);
    handleAnimatedDragEnd();
    logger.dev('🎯 Node drag ended:', data.name);
  };

  // Handle selection changes
  useEffect(() => {
    if (selected) {
      handleSelect();
    } else {
      handleDeselect();
    }
  }, [selected, handleSelect, handleDeselect]);

  // Handle mode transitions
  useEffect(() => {
    handleModeTransition(isCompact);
  }, [isCompact, handleModeTransition]);

  // Handle successful drops
  const handleSuccessfulDrop = () => {
    handleDropSuccess();
  };

  // Return early if no data (after all hooks)
  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="tech-node">
      {/* Input Handle (left) */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#1e293b',
          border: '2px solid #475569',
          borderRadius: '50%',
        }}
        onConnect={(params) => logger.dev('handle onConnect', params)}
      />

      {/* Animated Node Content */}
      <AnimatedNode
        ref={animatedNodeRef}
        nodeId={data.id}
        isSelected={selected}
        isCompact={isCompact}
        isDragging={isBeingDragged}
        isDragOver={isDragOver}
        onDragStart={() => setIsBeingDragged(true)}
        onDragEnd={() => setIsBeingDragged(false)}
        onDropSuccess={handleSuccessfulDrop}
        enableCelebration={true}
        className={cn(
          'bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-lg',
          'hover:shadow-xl hover:border-slate-600/70',
          selected && 'ring-2 ring-blue-500 ring-opacity-60 shadow-blue-500/20',
          data.isMainTechnology && isDragOver && 'ring-2 ring-green-500 ring-opacity-80 shadow-green-500/30 border-green-500/50'
        )}
        style={{
          width: nodeWidth,
          height: 'auto',
          minHeight: nodeHeight,
          position: 'relative',
          pointerEvents: 'all' // Ensure the node can receive pointer events
        }}
        onMouseEnter={() => !isBeingDragged && handleHover()}
        onMouseLeave={() => !isBeingDragged && handleHoverEnd()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div 
          className={cn(
            'flex items-center justify-between rounded-t-lg relative',
            isCompact ? 'p-2' : 'p-3',
            !data.customStyle && `bg-gradient-to-r ${categoryColors[data.category as keyof typeof categoryColors] || categoryColors.other}`
          )}
          style={{
            ...(data.customStyle ? {
              background: nodeStyle.background,
              borderColor: nodeStyle.borderColor,
              color: nodeStyle.color
            } : {}),
            cursor: 'move'
          }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={cn(
              'bg-white/30 rounded-full flex-shrink-0',
              isCompact ? 'w-2 h-2' : 'w-3 h-3'
            )} />
            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                  setIsEditingName(false);
                  if (editName.trim() && editName !== data.name && data.onNameChange) {
                    data.onNameChange(data.id, editName.trim());
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingName(false);
                    if (editName.trim() && editName !== data.name && data.onNameChange) {
                      data.onNameChange(data.id, editName.trim());
                    }
                  } else if (e.key === 'Escape') {
                    setEditName(data.name);
                    setIsEditingName(false);
                  }
                }}
                className={cn(
                  'nodrag bg-transparent border-none outline-none font-semibold',
                  isCompact ? 'text-sm' : 'text-base',
                  !data.customStyle && 'text-white',
                  'w-full min-w-0'
                )}
                style={data.customStyle ? { color: nodeStyle.color } : {}}
                autoFocus
                onMouseDown={(e) => e.stopPropagation()}
              />
            ) : (
              <h3 
                className={cn(
                  'font-semibold truncate cursor-text',
                  isCompact ? 'text-sm' : 'text-base',
                  !data.customStyle && 'text-white'
                )}
                style={data.customStyle ? { color: nodeStyle.color } : {}}
                onClick={(e) => {
                  e.stopPropagation();
                  if (data.onNameChange && !data.isReadOnly) {
                    setIsEditingName(true);
                    setEditName(data.name);
                  }
                }}
                title={data.isReadOnly ? data.name : "Cliquer pour éditer le nom"}
              >
                {data.name}
              </h3>
            )}
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Documentation indicator */}
            {data.documentation && (
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  logger.dev('Documentation clicked:', {
                    nodeId: data.id,
                    nodeName: data.name,
                    isReadOnly: data.isReadOnly,
                    hasDocumentation: !!data.documentation,
                    documentationLength: data.documentation?.length
                  });
                  
                  if (data.isReadOnly) {
                    logger.dev('Opening doc viewer in read-only mode');
                    setShowDocViewer(true);
                  } else {
                    logger.dev('Opening doc modal in edit mode');
                    setShowDocModal(true);
                  }
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={cn(
                  "nodrag p-1 rounded transition-colors relative z-10 cursor-pointer",
                  data.customStyle ? "hover:bg-black/20" : "hover:bg-white/20 text-white/80 hover:text-white"
                )}
                style={{
                  ...(data.customStyle ? { color: nodeStyle.color + '80' } : {}),
                  pointerEvents: 'auto'
                }}
                title={data.isReadOnly ? "View Documentation" : "Edit Documentation"}
              >
                <FileText className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
                {/* Indicator dot */}
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-slate-800" />
              </button>
            )}
            
            {!data.isReadOnly && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  logger.dev('Toggle button clicked for:', data.name, 'current isCompact:', isCompact);
                  data.onToggleMode(data.id);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={cn(
                  "nodrag p-1 rounded transition-colors",
                  data.customStyle ? "hover:bg-black/20" : "hover:bg-white/20 text-white/80 hover:text-white"
                )}
                style={data.customStyle ? { color: nodeStyle.color + '80' } : {}}
                title={isCompact ? "Expand" : "Collapse"}
              >
                <div className={cn(
                  "transition-transform text-xs",
                  isCompact ? "rotate-0" : "rotate-180"
                )}>
                  ⤢
                </div>
              </button>
            )}
            
            {!data.isReadOnly && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={cn(
                  "nodrag p-1 rounded transition-colors",
                  data.customStyle ? "hover:bg-black/20" : "hover:bg-white/20 text-white/80 hover:text-white"
                )}
                style={data.customStyle ? { color: nodeStyle.color + '80' } : {}}
              >
                <MoreVertical className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
              </button>
            )}
            
            {!data.isReadOnly && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  data.onDelete(data.id);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className={cn(
                  "nodrag p-1 hover:bg-red-500/20 rounded transition-colors relative z-50",
                  data.customStyle ? "hover:text-red-300" : "text-white/80 hover:text-red-300"
                )}
                style={{
                  ...(data.customStyle ? { color: nodeStyle.color + '80' } : {}),
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
                title="Delete node"
              >
                <X className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={cn("space-y-2 cursor-move", isCompact ? "p-2" : "p-3")}>
          {!isCompact && (
            <p className="text-sm text-slate-300 line-clamp-2 mb-3">
              {data.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: 0.2, 
                type: "spring", 
                stiffness: 400, 
                damping: 25 
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <Badge 
                variant={data.pricing === 'free' ? 'success' : data.pricing === 'freemium' ? 'warning' : 'danger'}
                size="sm"
                outline
              >
                {data.pricing}
              </Badge>
            </motion.div>
            <AnimatePresence>
              {!isCompact && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ 
                    delay: 0.3, 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 25 
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Badge 
                    variant={data.difficulty === 'beginner' ? 'success' : data.difficulty === 'intermediate' ? 'warning' : 'danger'}
                    size="sm"
                    outline
                  >
                    {data.difficulty}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div 
              className="text-xs text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {data.setupTimeHours}h
            </motion.div>
          </div>

          {/* Resource stats */}
          {!isCompact && data.resources && (
            <div className="text-xs text-slate-400 border-t border-slate-700 pt-2 space-y-1">
              <div className="font-medium text-slate-300 mb-1">📊 Resources</div>
              <div className="grid grid-cols-2 gap-1">
                <div>CPU: {data.resources.cpu}</div>
                <div>RAM: {data.resources.memory}</div>
                {data.resources.storage && <div>Storage: {data.resources.storage}</div>}
                {data.resources.network && <div>Net: {data.resources.network}</div>}
              </div>
            </div>
          )}

          {/* Sub-technologies section */}
          {data.isMainTechnology && data.subTechnologies && data.subTechnologies.length > 0 && (
            <div className="border-t border-slate-600 pt-3 mt-3">
              {!isCompact && (
                <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                  <span className="text-blue-400">⚡</span>
                  Integrated Tools:
                </div>
              )}
              <motion.div 
                className={cn(
                  "flex flex-wrap gap-2",
                  isCompact && "justify-center"
                )}
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.3
                    }
                  }
                }}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {data.subTechnologies.map((subTech) => (
                    <motion.div 
                      key={subTech.id} 
                      className="relative group"
                      variants={{
                        hidden: { 
                          scale: 0, 
                          opacity: 0, 
                          rotate: -180 
                        },
                        visible: { 
                          scale: 1, 
                          opacity: 1, 
                          rotate: 0,
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                          }
                        },
                        exit: { 
                          scale: 0, 
                          opacity: 0, 
                          rotate: 180,
                          transition: {
                            duration: 0.3
                          }
                        }
                      }}
                      whileHover={{ 
                        scale: 1.1,
                        y: -2,
                        transition: { 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 15 
                        }
                      }}
                      layout
                    >
                      <Badge
                        variant="default"
                        size="sm"
                        className={cn(
                          "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 border-blue-500/30 hover:border-blue-400/50 transition-colors cursor-help",
                          isCompact ? "text-xs px-2 py-1 pr-6" : "text-xs px-2 py-1 pr-6"
                        )}
                        title={`${subTech.name} - ${subTech.description}\nType: ${subTech.type}\nDifficulty: ${subTech.difficulty}`}
                      >
                        <span className="mr-1">
                          {subTech.type === 'styling' && '🎨'}
                          {subTech.type === 'testing' && '🧪'}
                          {subTech.type === 'documentation' && '📚'}
                          {subTech.type === 'state-management' && '📊'}
                          {subTech.type === 'routing' && '🗺️'}
                          {subTech.type === 'build-tool' && '🔨'}
                          {subTech.type === 'linting' && '✅'}
                          {!['styling', 'testing', 'documentation', 'state-management', 'routing', 'build-tool', 'linting'].includes(subTech.type) && '🔧'}
                        </span>
                        {isCompact ? subTech.name.split(' ')[0] : subTech.name}
                      </Badge>
                      {!data.isReadOnly && data.onRemoveSubTechnology && (
                        <motion.button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            data.onRemoveSubTechnology!(data.id, subTech.id);
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                          title="Remove tool"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 0, scale: 0 }}
                          whileHover={{ 
                            opacity: 1, 
                            scale: 1.2,
                            transition: { duration: 0.2 }
                          }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {/* Drop zone indicator for main technologies */}
          <AnimatePresence>
            {data.isMainTechnology && isDragOver && (
              <motion.div 
                className="border-t border-green-500/50 pt-2 mt-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: 1, 
                  height: 'auto',
                  transition: {
                    duration: 0.3,
                    ease: "easeOut"
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  height: 0,
                  transition: {
                    duration: 0.2
                  }
                }}
              >
                <motion.div 
                  className="min-h-[30px] border-2 border-dashed border-green-500/50 rounded-md bg-green-500/10 flex items-center justify-center"
                  initial={{ scale: 0.9 }}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    borderColor: [
                      'rgba(34, 197, 94, 0.3)',
                      'rgba(34, 197, 94, 0.7)',
                      'rgba(34, 197, 94, 0.3)'
                    ],
                    backgroundColor: [
                      'rgba(34, 197, 94, 0.1)',
                      'rgba(34, 197, 94, 0.2)',
                      'rgba(34, 197, 94, 0.1)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <motion.span 
                    className="text-xs text-green-400 font-medium"
                    animate={{
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    📦 Drop tool here to integrate
                  </motion.span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drop zone for sub-technologies - only show when not dragging */}
          {!isCompact && data.isMainTechnology && data.canAcceptSubTech && !isDragOver && (
            <div className="border-t border-slate-600 pt-2 mt-3">
              <div className="text-xs text-slate-400 mb-1">
                Accepts: {data.canAcceptSubTech.join(', ')}
              </div>
              <div className="min-h-[20px] border-2 border-dashed border-slate-600 rounded-md bg-slate-800/50 flex items-center justify-center">
                <span className="text-xs text-slate-500">Drag tools here</span>
              </div>
            </div>
          )}
        </div>

        {/* Context Menu */}
        {showMenu && !data.isReadOnly && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute top-12 right-0 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-lg min-w-[160px]">
              <div className="p-1">
                {data.onNodeSelect && (
                  <button 
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      data.onNodeSelect!(data.id);
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
                    setShowDocModal(true);
                    setShowMenu(false);
                  }}
                >
                  <FileText className="w-4 h-4" />
                  Documentation
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfigModal(true);
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
                    logger.dev('Details for', data.name);
                    setShowMenu(false);
                  }}
                >
                  <Info className="w-4 h-4" />
                  Details
                </button>
              </div>
            </div>
          </>
        )}

        {/* Resize handle for non-compact nodes */}
        {!isCompact && selected && data.onResize && (
          <NodeResizeHandle
            nodeId={data.id}
            currentWidth={nodeWidth}
            currentHeight={nodeHeight}
            onResize={data.onResize}
            minWidth={250}
            minHeight={150}
            maxWidth={400}
            maxHeight={500}
          />
        )}
      </AnimatedNode>

      {/* Output Handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#1e293b',
          border: '2px solid #475569',
          borderRadius: '50%',
        }}
      />

      {/* Color picker removed - now uses toolbar */}

      {/* Documentation Panel (Edit Mode) */}
      {showDocModal && data.onDocumentationSave && (
        <FloatingDocPanel
          isOpen={showDocModal}
          onClose={() => setShowDocModal(false)}
          nodeId={data.id}
          nodeName={data.name}
          initialDocumentation={data.documentation}
          onSave={data.onDocumentationSave}
          isSubTechnology={!data.isMainTechnology}
          parentTechnologyName={data.isMainTechnology ? undefined : 'Parent Technology'}
          isReadOnly={data.isReadOnly}
        />
      )}

      {/* Documentation Panel (Read-Only Mode) */}
      {showDocViewer && data.documentation && (
        <FloatingDocPanel
          isOpen={showDocViewer}
          onClose={() => setShowDocViewer(false)}
          nodeId={data.id}
          nodeName={data.name}
          initialDocumentation={data.documentation}
          isSubTechnology={!data.isMainTechnology}
          parentTechnologyName={data.isMainTechnology ? undefined : 'Parent Technology'}
          isReadOnly={true}
        />
      )}

      {/* Resource Configuration Modal */}
      {showConfigModal && (
        <ResourceConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          onSave={handleConfigurationSave}
          initialResources={data.resources}
          initialEnvVars={data.environmentVariables || {}}
          componentName={data.name}
        />
      )}

    </div>
  );
});

TechNode.displayName = 'TechNode';