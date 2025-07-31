'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { X, MoreVertical, Settings, Info } from 'lucide-react';
import { NodeData } from './CanvasNode';

interface TechNodeData extends NodeData {
  isCompact?: boolean;
  onDelete: (id: string) => void;
  onToggleMode: (id: string) => void;
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
  const isCompact = data.isCompact ?? true; // Default to true if undefined

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
        onConnect={(params) => console.log('handle onConnect', params)}
      />

      {/* Node Content */}
      <div
        className={cn(
          'bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-lg transition-all duration-200',
          'hover:shadow-xl hover:border-slate-600/70',
          selected && 'ring-2 ring-blue-500 ring-opacity-60 shadow-blue-500/20',
        )}
        style={{
          width: isCompact ? 200 : 280,
          minHeight: isCompact ? 80 : 120,
        }}
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
          {!isCompact && data.isMainTechnology && data.subTechnologies && data.subTechnologies.length > 0 && (
            <div className="border-t border-slate-600 pt-2 mt-3">
              <div className="text-xs font-medium text-slate-400 mb-2">Integrated Tools:</div>
              <div className="flex flex-wrap gap-1">
                {data.subTechnologies.map((subTech) => (
                  <Badge
                    key={subTech.id}
                    variant="default"
                    size="sm"
                    className="text-xs bg-slate-700 text-slate-300 border-slate-600"
                  >
                    {subTech.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Drop zone for sub-technologies */}
          {!isCompact && data.isMainTechnology && data.canAcceptSubTech && (
            <div className="border-t border-slate-600 pt-2 mt-3">
              <div className="text-xs text-slate-400 mb-1">
                Drop tools here: {data.canAcceptSubTech.join(', ')}
              </div>
              <div className="min-h-[20px] border-2 border-dashed border-slate-600 rounded-md bg-slate-800/50 flex items-center justify-center">
                <span className="text-xs text-slate-500">Drop zone</span>
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
    </div>
  );
});

TechNode.displayName = 'TechNode';