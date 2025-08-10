'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
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
  Link2,
  Target
} from 'lucide-react';

interface ToolNodeRendererProps {
  data: NodeData & { type?: SubTechnology['type'] };
  size: NodeSize;
  isSelected: boolean;
  isDragging: boolean;
  isPaletteItem?: boolean; // Pour distinguer les outils dans la palette
  parentStack?: string; // Nom du stack parent si attaché
  onSelect: () => void;
  onToggleSize?: () => void;
  onConfigure?: () => void;
  onDetach?: () => void; // Pour détacher d'un stack
  className?: string;
}

/**
 * Renderer optimisé pour les outils/tools
 * Design minimal et focus sur l'intégration avec les stacks
 */
export const ToolNodeRenderer = memo<ToolNodeRendererProps>(({
  data,
  size,
  isSelected,
  isDragging,
  isPaletteItem = false,
  parentStack,
  onSelect,
  onToggleSize,
  onConfigure,
  onDetach,
  className
}) => {
  const { difficulty, pricing, setupTimeHours, type } = data;

  // Get tool type specific styling
  const getToolTypeIcon = () => {
    if (!type) return '🔧';
    
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
  };

  const getToolTypeColor = () => {
    if (!type) return 'text-orange-400';
    
    switch (type) {
      case 'styling':
        return 'text-pink-400';
      case 'testing':
        return 'text-green-400';
      case 'documentation':
        return 'text-blue-400';
      case 'state-management':
        return 'text-purple-400';
      case 'routing':
        return 'text-indigo-400';
      case 'build-tool':
        return 'text-yellow-400';
      case 'linting':
        return 'text-teal-400';
      case 'deployment':
        return 'text-red-400';
      default:
        return 'text-orange-400';
    }
  };

  // Prepare badges - more concise for tools
  const badges = [
    ...(size !== 'compact' ? [
      { label: pricing, variant: pricing === 'free' ? 'success' : 'warning' as const },
      ...(type ? [{ label: type.replace('-', ' '), variant: 'default' as const }] : [])
    ] : [
      { label: pricing === 'free' ? 'Free' : 'Paid', variant: pricing === 'free' ? 'success' : 'warning' as const }
    ])
  ];

  // Prepare stats - minimal for tools
  const stats = [
    { label: 'Setup', value: `${setupTimeHours}h`, icon: '⏱️' },
    { label: 'Level', value: difficulty, icon: getDifficultyIcon(difficulty) }
  ];

  // Actions - simplified for tools
  const actions = (
    <div className="flex items-center gap-1">
      {parentStack && (
        <div className="flex items-center gap-1 mr-2">
          <Link2 className="h-3 w-3 text-green-400" />
          <span className="text-xs text-slate-400">→ {parentStack}</span>
        </div>
      )}

      {parentStack && onDetach && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDetach();
          }}
          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors"
          title="Detach from stack"
        >
          <Link2 className="h-3 w-3" />
        </button>
      )}

      {size !== 'compact' && onConfigure && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConfigure();
          }}
          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
          title="Configure tool"
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
      type="tool"
      size={size}
      isSelected={isSelected}
      isDragging={isDragging}
      onSelect={onSelect}
      className={cn(
        className,
        isPaletteItem && 'cursor-grab active:cursor-grabbing',
        parentStack && 'border-l-4 border-l-green-500/60' // Visual indicator when attached
      )}
    >
      {/* Header with tool icon */}
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('text-lg', getToolTypeColor())}>
          {getToolTypeIcon()}
        </div>
        <NodeHeader
          title={data.name}
          subtitle={size !== 'compact' ? data.description : undefined}
          type="tool"
          badges={badges}
          actions={actions}
        />
      </div>

      {/* Stats - only in non-compact mode */}
      {size !== 'compact' && (
        <div className="mb-2">
          <NodeStats stats={stats} type="tool" />
        </div>
      )}

      {/* Integration hint - only for palette items */}
      {isPaletteItem && size !== 'compact' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-slate-600/30 pt-2 mt-auto"
        >
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Target className="h-3 w-3" />
            <span>Drag to a stack to integrate</span>
          </div>
        </motion.div>
      )}

      {/* Parent stack indicator - for attached tools */}
      {parentStack && size === 'compact' && (
        <div className="mt-auto border-t border-green-500/30 pt-1">
          <div className="flex items-center gap-1 text-xs">
            <Link2 className="h-3 w-3 text-green-400" />
            <span className="text-green-400 truncate font-medium">
              {parentStack}
            </span>
          </div>
        </div>
      )}

      {/* Palette dragging hint */}
      {isPaletteItem && isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-orange-500/20 rounded-xl pointer-events-none"
        >
          <div className="text-xs text-orange-300 font-medium">
            Drop on stack to integrate
          </div>
        </motion.div>
      )}
    </BaseNodeRenderer>
  );
});

ToolNodeRenderer.displayName = 'ToolNodeRenderer';

/**
 * Helper function to get difficulty icon
 */
function getDifficultyIcon(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return '🟢';
    case 'intermediate':
      return '🟡';
    case 'expert':
      return '🔴';
    default:
      return '⚪';
  }
}