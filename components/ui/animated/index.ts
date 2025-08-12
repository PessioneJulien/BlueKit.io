// Animations Components Exports
export { AnimatedNode, withNodeAnimation } from './AnimatedNode';
export type { AnimatedNodeProps, AnimatedNodeRef } from './AnimatedNode';

export { AnimatedConnection, useAnimatedConnections } from './AnimatedConnection';
export type { AnimatedConnectionProps, AnimatedConnectionRef } from './AnimatedConnection';

export { AnimatedBadge, AnimatedBadgeGroup, useAnimatedBadge } from './AnimatedBadge';
export type { AnimatedBadgeProps, AnimatedBadgeGroupProps } from './AnimatedBadge';

// Re-export des animations de base
export * from '../../../lib/animations/animationSystem';
export * from '../../../lib/hooks/useNodeAnimations';
export * from '../../../lib/hooks/useConnectionAnimations';
export * from '../../../lib/hooks/useAnimationPerformance';