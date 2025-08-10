'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { 
  BaseNodeRenderer, 
  NodeHeader, 
  NodeStats, 
  NodeSize 
} from './BaseNodeRenderer';
import { NodeData, SubTechnology } from '../CanvasNode';
import { 
  Settings, 
  MoreVertical,
  Zap,
  Plus,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';

interface StackNodeRendererProps {
  data: NodeData;
  size: NodeSize;
  isSelected: boolean;
  isDragging: boolean;
  isDropTarget?: boolean; // Pour highlight en mode drag d'un tool
  onSelect: () => void;
  onToggleSize?: () => void;
  onConfigure?: () => void;
  onRemoveTool?: (toolId: string) => void;
  className?: string;
}

/**
 * Renderer optimisé pour les stacks (composants principaux)
 * Focus sur les outils intégrés et les capabilities
 */
export const StackNodeRenderer = memo<StackNodeRendererProps>(({
  data,
  size,
  isSelected,
  isDragging,
  isDropTarget = false,
  onSelect,
  onToggleSize,
  onConfigure,
  onRemoveTool,
  className
}) => {
  const [showTools, setShowTools] = useState(size !== 'compact');
  const { subTechnologies = [], difficulty, pricing, setupTimeHours, resources } = data;

  // Get category-specific styling
  const getCategoryIcon = () => {
    switch (data.category) {
      case 'frontend':
        return '🎨';
      case 'backend':
        return '⚙️';
      case 'database':
        return '🗄️';
      case 'devops':
        return '🚀';
      case 'mobile':
        return '📱';
      case 'ai':
        return '🤖';
      default:
        return '⚡';
    }
  };

  // Prepare badges based on size
  const badges = [
    ...(size !== 'compact' ? [
      { label: pricing, variant: pricing === 'free' ? 'success' : pricing === 'freemium' ? 'warning' : 'danger' as const },
      { label: difficulty, variant: difficulty === 'beginner' ? 'success' : difficulty === 'intermediate' ? 'warning' : 'danger' as const }
    ] : [
      { label: pricing, variant: pricing === 'free' ? 'success' : pricing === 'freemium' ? 'warning' : 'danger' as const }
    ]),
    ...(subTechnologies.length > 0 ? [{
      label: `${subTechnologies.length} tool${subTechnologies.length > 1 ? 's' : ''}`,
      variant: 'default' as const
    }] : [])
  ];

  // Prepare stats
  const stats = [
    { label: 'Setup', value: `${setupTimeHours}h`, icon: '⏱️' },
    ...(resources ? [
      { label: 'CPU', value: resources.cpu, icon: '📊' },
      { label: 'RAM', value: resources.memory, icon: '💾' }
    ] : [])
  ];

  // Actions
  const actions = (
    <div className="flex items-center gap-1">
      {size !== 'compact' && subTechnologies.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowTools(!showTools);
          }}
          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
          title="Toggle tools"
        >
          {showTools ? 
            <ChevronDown className="h-3 w-3" /> : 
            <ChevronRight className="h-3 w-3" />
          }
        </button>
      )}

      {size !== 'compact' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConfigure?.();
          }}
          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
          title="Configure stack"
        >
          <Settings className="h-3 w-3" />
        </button>
      )}

      {onToggleSize && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSize();
          }}
          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
          title="Toggle size"
        >
          <MoreVertical className="h-3 w-3" />
        </button>
      )}
    </div>
  );

  return (
    <BaseNodeRenderer
      data={data}
      type="stack"
      size={size}
      isSelected={isSelected}
      isDragging={isDragging}
      onSelect={onSelect}
      className={cn(
        className,
        isDropTarget && 'ring-2 ring-green-400 ring-opacity-60 bg-green-900/10'
      )}
    >
      {/* Header with category icon */}
      <div className="flex items-center gap-2 mb-2">
        <div className="text-lg">{getCategoryIcon()}</div>
        <NodeHeader
          title={data.name}
          subtitle={size !== 'compact' ? data.description : undefined}
          type="stack"
          badges={badges}
          actions={actions}
        />
      </div>

      {/* Stats */}
      {size !== 'compact' && (
        <div className="mb-2">
          <NodeStats stats={stats} type="stack" />
        </div>
      )}

      {/* Integrated Tools */}
      <AnimatePresence>
        {size !== 'compact' && showTools && subTechnologies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-600/50 pt-2 mt-auto"
          >
            <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              <Zap className="h-3 w-3 text-green-400" />
              Integrated Tools:
            </div>
            
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar">
              {subTechnologies.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <Badge
                    variant="outline"
                    size="sm"
                    className={cn(
                      'text-xs bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-300 border-green-500/30 hover:border-green-400/50 transition-colors',
                      'pr-6' // Space for remove button
                    )}
                    title={`${tool.name} - ${tool.description}`}
                  >
                    <span className="mr-1">
                      {getToolIcon(tool.type)}
                    </span>
                    {tool.name}
                  </Badge>
                  
                  {onRemoveTool && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTool(tool.id);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove tool"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Drop zone for tools - when in drop target mode */}
        {size !== 'compact' && isDropTarget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-t border-green-500/50 pt-2 mt-auto"
          >
            <div className="min-h-[30px] border-2 border-dashed border-green-500/50 rounded-lg bg-green-500/10 flex items-center justify-center">
              <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                <Plus className="h-3 w-3" />
                Drop tool here to integrate
              </span>
            </div>
          </motion.div>
        )}

        {/* Available tool types hint - only in expanded mode */}
        {size === 'expanded' && !isDropTarget && data.canAcceptSubTech && data.canAcceptSubTech.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-t border-slate-600/30 pt-2 mt-auto"
          >
            <div className="text-xs text-slate-500">
              <span className="font-medium">Accepts:</span> {data.canAcceptSubTech.join(', ')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact mode - just show tool count */}
      {size === 'compact' && subTechnologies.length > 0 && (
        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Tools:</span>
            <Badge variant="outline" size="sm" className="bg-green-600/20 text-green-300 border-green-500/30">
              {subTechnologies.length}
            </Badge>
          </div>
        </div>
      )}
    </BaseNodeRenderer>
  );
});

StackNodeRenderer.displayName = 'StackNodeRenderer';

/**
 * Helper function to get tool type icon
 */
function getToolIcon(type: SubTechnology['type']): string {
  switch (type) {
    case 'styling':
      return '🎨';
    case 'testing':
      return '🧪';
    case 'documentation':
      return '📚';
    case 'state-management':
      return '📊';
    case 'routing':
      return '🗺️';
    case 'build-tool':
      return '🔨';
    case 'linting':
      return '✅';
    case 'deployment':
      return '🚀';
    default:
      return '🔧';
  }
}