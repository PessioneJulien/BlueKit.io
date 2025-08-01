'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { X, MoreVertical, Settings, Info, FileText, Palette } from 'lucide-react';
import { NodeData, SubTechnology } from './CanvasNode';
import { NodeResizeHandle } from './NodeResizeHandle';
import { FloatingDocPanel } from './FloatingDocPanel';
import { NodeColorPicker, NodeCustomStyle, StyledNodeData } from './NodeColorPicker';

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
  const [isDragOver, setIsDragOver] = useState(false);
  const isCompact = data.isCompact ?? true; // Default to true if undefined
  
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
  console.log('TechNode render:', data.name, 'isCompact:', data.isCompact, 'calculated isCompact:', isCompact);
  // Use custom dimensions if available, otherwise use defaults based on mode
  const nodeWidth = data.width || (isCompact ? 200 : 300);
  const nodeHeight = data.height || (isCompact ? 
    (data.subTechnologies && data.subTechnologies.length > 0 ? 120 : 80) : 
    (data.subTechnologies && data.subTechnologies.length > 0 ? 180 : 140)
  );

  if (!data) {
    return <div>Loading...</div>;
  }

  // Handle drop of tools onto this node
  const handleDragOver = (e: React.DragEvent) => {
    if (!data.isMainTechnology) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (dragData.type === 'tool' && data.onAddSubTechnology && data.isMainTechnology) {
        console.log('Dropping tool:', dragData.component.id, 'onto main tech:', data.id);
        data.onAddSubTechnology(dragData.component.id, data.id);
      }
    } catch (error) {
      console.error('Error handling tool drop:', error);
    }
  };

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
        onConnect={(params) => console.log('handle onConnect', params)}
      />

      {/* Node Content */}
      <div
        className={cn(
          'bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-lg transition-all duration-200',
          'hover:shadow-xl hover:border-slate-600/70',
          selected && 'ring-2 ring-blue-500 ring-opacity-60 shadow-blue-500/20',
          data.isMainTechnology && isDragOver && 'ring-2 ring-green-500 ring-opacity-80 shadow-green-500/30 border-green-500/50'
        )}
        style={{
          width: nodeWidth,
          height: 'auto',
          minHeight: nodeHeight,
          position: 'relative'
        }}
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
          
          <div className="flex items-center gap-1 flex-shrink-0 nodrag">
            {/* Documentation indicator */}
            {data.documentation && (
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Documentation clicked:', {
                    nodeId: data.id,
                    nodeName: data.name,
                    isReadOnly: data.isReadOnly,
                    hasDocumentation: !!data.documentation,
                    documentationLength: data.documentation?.length
                  });
                  
                  if (data.isReadOnly) {
                    console.log('Opening doc modal in read-only mode');
                    setShowDocViewer(true);
                  } else {
                    console.log('Opening doc modal in edit mode');
                    setShowDocModal(true);
                  }
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
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
                  console.log('Toggle button clicked for:', data.name, 'current isCompact:', isCompact);
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

          {/* Sub-technologies section */}
          {data.isMainTechnology && data.subTechnologies && data.subTechnologies.length > 0 && (
            <div className="border-t border-slate-600 pt-3 mt-3">
              {!isCompact && (
                <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                  <span className="text-blue-400">⚡</span>
                  Integrated Tools:
                </div>
              )}
              <div className={cn(
                "flex flex-wrap gap-2",
                isCompact && "justify-center"
              )}>
                {data.subTechnologies.map((subTech) => (
                  <div key={subTech.id} className="relative group">
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
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          data.onRemoveSubTechnology!(data.id, subTech.id);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove tool"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drop zone indicator for main technologies */}
          {data.isMainTechnology && isDragOver && (
            <div className="border-t border-green-500/50 pt-2 mt-3">
              <div className="min-h-[30px] border-2 border-dashed border-green-500/50 rounded-md bg-green-500/10 flex items-center justify-center">
                <span className="text-xs text-green-400 font-medium">📦 Drop tool here to integrate</span>
              </div>
            </div>
          )}

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
      </div>

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
      {showDocModal && data.onDocumentationSave && !data.isReadOnly && (
        <FloatingDocPanel
          isOpen={showDocModal}
          onClose={() => setShowDocModal(false)}
          nodeId={data.id}
          nodeName={data.name}
          initialDocumentation={data.documentation}
          onSave={data.onDocumentationSave}
          isSubTechnology={!data.isMainTechnology}
          parentTechnologyName={data.isMainTechnology ? undefined : 'Parent Technology'}
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

    </div>
  );
});

TechNode.displayName = 'TechNode';