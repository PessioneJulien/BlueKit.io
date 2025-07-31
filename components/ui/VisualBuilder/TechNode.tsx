'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { X, MoreVertical, Settings, Info, FileText } from 'lucide-react';
import { NodeData, SubTechnology } from './CanvasNode';
import { NodeResizeHandle } from './NodeResizeHandle';
import { FloatingDocPanel } from './FloatingDocPanel';

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
  availableSubTechnologies?: SubTechnology[];
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
  const [isDragOver, setIsDragOver] = useState(false);
  const isCompact = data.isCompact ?? true; // Default to true if undefined
  
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
        <div className={cn(
          'flex items-center justify-between bg-gradient-to-r rounded-t-lg',
          isCompact ? 'p-2' : 'p-3',
          categoryColors[data.category as keyof typeof categoryColors] || categoryColors.other
        )}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={cn(
              'bg-white/30 rounded-full flex-shrink-0',
              isCompact ? 'w-2 h-2' : 'w-3 h-3'
            )} />
            <h3 className={cn(
              'font-semibold text-white truncate',
              isCompact ? 'text-sm' : 'text-base'
            )}>
              {data.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Toggle button clicked for:', data.name, 'current isCompact:', isCompact);
                data.onToggleMode(data.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-1 hover:bg-white/20 rounded text-white/80 hover:text-white transition-colors"
              title={isCompact ? "Expand" : "Collapse"}
            >
              <div className={cn(
                "transition-transform text-xs",
                isCompact ? "rotate-0" : "rotate-180"
              )}>
                ⤢
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-1 hover:bg-white/20 rounded text-white/80 hover:text-white transition-colors"
            >
              <MoreVertical className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete(data.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-1 hover:bg-red-500/20 rounded text-white/80 hover:text-red-300 transition-colors"
            >
              <X className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
            </button>
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
                  <Badge
                    key={subTech.id}
                    variant="default"
                    size="sm"
                    className={cn(
                      "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 border-blue-500/30 hover:border-blue-400/50 transition-colors cursor-help",
                      isCompact ? "text-xs px-2 py-1" : "text-xs px-2 py-1"
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
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute top-12 right-0 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-lg min-w-[160px]">
              <div className="p-1">
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

      {/* Documentation Panel */}
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
        />
      )}

    </div>
  );
});

TechNode.displayName = 'TechNode';