'use client';

import { memo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { NodeData } from '../CanvasNode';

// Design tokens pour cohérence visuelle
export const NODE_STYLES = {
  colors: {
    container: {
      gradient: 'from-blue-600/20 to-purple-600/20',
      border: 'border-blue-500/40',
      glow: 'shadow-blue-500/20',
      accent: 'text-blue-400'
    },
    stack: {
      gradient: 'from-green-600/20 to-emerald-600/20', 
      border: 'border-green-500/40',
      glow: 'shadow-green-500/20',
      accent: 'text-green-400'
    },
    tool: {
      gradient: 'from-orange-600/20 to-amber-600/20',
      border: 'border-orange-500/40', 
      glow: 'shadow-orange-500/20',
      accent: 'text-orange-400'
    }
  },
  sizes: {
    compact: { width: 220, height: 80 },
    normal: { width: 280, height: 140 },
    expanded: { width: 350, height: 200 }
  },
  animations: {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
    drag: { scale: 1.05, rotate: 2, transition: { duration: 0.2 } }
  }
} as const;

export type NodeType = 'container' | 'stack' | 'tool';
export type NodeSize = 'compact' | 'normal' | 'expanded';

export interface BaseNodeProps {
  data: NodeData;
  type: NodeType;
  size: NodeSize;
  isSelected: boolean;
  isDragging: boolean;
  children: ReactNode;
  onSelect: () => void;
  className?: string;
}

/**
 * Composant de base pour tous les types de nodes
 * Fournit un design system cohérent et des animations optimisées
 */
export const BaseNodeRenderer = memo<BaseNodeProps>(({ 
  type, 
  size,
  isSelected,
  isDragging,
  children,
  onSelect,
  className
}) => {
  const styles = NODE_STYLES.colors[type];
  const dimensions = NODE_STYLES.sizes[size];

  return (
    <motion.div
      className={cn(
        // Base styles
        'relative bg-slate-800/90 backdrop-blur-md rounded-xl shadow-lg cursor-pointer',
        'border-2 transition-all duration-200',
        
        // Type-specific styling
        styles.gradient,
        styles.border,
        
        // State-specific styling
        isSelected && [styles.glow, 'ring-2 ring-opacity-60'],
        isDragging && 'opacity-70',
        
        // Hover effects
        'hover:shadow-xl hover:border-opacity-70',
        
        className
      )}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        minHeight: size === 'compact' ? 80 : 140
      }}
      variants={NODE_STYLES.animations}
      whileHover={!isDragging ? "hover" : undefined}
      whileTap="tap" 
      animate={isDragging ? "drag" : undefined}
      onClick={onSelect}
      layout
      transition={{ type: "spring", damping: 25, stiffness: 400 }}
    >
      {/* Type Indicator */}
      <div className={cn(
        'absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center',
        'text-xs font-bold border-2 border-slate-800 shadow-lg',
        styles.gradient,
        styles.accent
      )}>
        {type === 'container' && '📦'}
        {type === 'stack' && '⚡'}
        {type === 'tool' && '🔧'}
      </div>

      {/* Content Area */}
      <div className="h-full flex flex-col p-3">
        {children}
      </div>

      {/* Selection Ring Effect */}
      {isSelected && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-xl border-2 pointer-events-none',
            styles.border.replace('/40', '/80')
          )}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
});

BaseNodeRenderer.displayName = 'BaseNodeRenderer';

/**
 * Composant Header réutilisable pour tous les types de nodes
 */
export const NodeHeader = memo<{
  title: string;
  subtitle?: string;
  type: NodeType;
  badges?: Array<{ label: string; variant: 'success' | 'warning' | 'danger' | 'default' }>;
  actions?: ReactNode;
}>(({ title, subtitle, badges = [], actions }) => {
  
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-100 text-sm truncate mb-1">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-400 truncate">
            {subtitle}
          </p>
        )}
        {badges.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {badges.map((badge, index) => (
              <Badge
                key={index}
                variant={badge.variant}
                size="sm"
                className="text-xs"
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
      </div>
      {actions && (
        <div className="ml-2 flex items-center gap-1">
          {actions}
        </div>
      )}
    </div>
  );
});

NodeHeader.displayName = 'NodeHeader';

/**
 * Composant Stats réutilisable
 */
export const NodeStats = memo<{
  stats: Array<{ label: string; value: string; icon?: string }>;
  type: NodeType;
}>(({ stats, type }) => {
  const styles = NODE_STYLES.colors[type];
  
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-1">
          {stat.icon && <span>{stat.icon}</span>}
          <span className="text-slate-400">{stat.label}:</span>
          <span className={cn('font-medium', styles.accent)}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
});

NodeStats.displayName = 'NodeStats';