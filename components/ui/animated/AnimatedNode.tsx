'use client';

import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNodeAnimations } from '@/lib/hooks/useNodeAnimations';
import { animationSystem } from '@/lib/animations/animationSystem';

export interface AnimatedNodeProps {
  children: React.ReactNode;
  nodeId: string;
  isSelected?: boolean;
  isCompact?: boolean;
  onAppear?: () => void;
  onDisappear?: () => void;
  onModeChange?: (isCompact: boolean) => void;
  enableCelebration?: boolean;
  className?: string;
  style?: React.CSSProperties;
  // Drag and drop props
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDropSuccess?: () => void;
  onError?: () => void;
  // Animation options
  customTransitions?: Record<string, Record<string, unknown>>;
  disableAnimations?: boolean;
}

export interface AnimatedNodeRef {
  playAppearAnimation: () => void;
  playDisappearAnimation: () => void;
  playSuccessAnimation: () => void;
  playErrorAnimation: () => void;
  playModeTransition: (isCompact: boolean) => void;
}

export const AnimatedNode = forwardRef<AnimatedNodeRef, AnimatedNodeProps>(({
  children,
  nodeId,
  isSelected = false,
  isCompact = true,
  onAppear,
  onDisappear,
  onModeChange,
  enableCelebration = false,
  className = '',
  style = {},
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragEnd,
  onDropSuccess,
  onError,
  customTransitions,
  disableAnimations = false
}, ref) => {
  const {
    controls,
    handleAppear,
    handleDisappear,
    handleHover,
    handleHoverEnd,
    handleSelect,
    handleDeselect,
    handleDragStart,
    handleDragEnd,
    handleModeTransition,
    handleDropSuccess,
    handleError,
    appearVariants,
    hoverVariants,
    selectVariants,
    dragVariants,
    modeVariants,
    isAnimating
  } = useNodeAnimations(nodeId, {
    enableCelebration,
    customTransitions
  });

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    playAppearAnimation: async () => {
      await handleAppear();
      onAppear?.();
    },
    playDisappearAnimation: async () => {
      await handleDisappear();
      onDisappear?.();
    },
    playSuccessAnimation: async () => {
      await handleDropSuccess();
      onDropSuccess?.();
    },
    playErrorAnimation: async () => {
      await handleError();
      onError?.();
    },
    playModeTransition: async (compact: boolean) => {
      await handleModeTransition(compact);
      onModeChange?.(compact);
    }
  }), [handleAppear, handleDisappear, handleDropSuccess, handleError, handleModeTransition, onAppear, onDisappear, onDropSuccess, onError, onModeChange]);

  // Handle selection state
  useEffect(() => {
    if (disableAnimations) return;
    
    if (isSelected) {
      handleSelect();
    } else {
      handleDeselect();
    }
  }, [isSelected, handleSelect, handleDeselect, disableAnimations]);

  // Handle drag state
  useEffect(() => {
    if (disableAnimations) return;
    
    if (isDragging) {
      handleDragStart();
      onDragStart?.();
    } else {
      handleDragEnd();
      onDragEnd?.();
    }
  }, [isDragging, handleDragStart, handleDragEnd, onDragStart, onDragEnd, disableAnimations]);

  // Handle drop success
  useEffect(() => {
    if (disableAnimations || !isDragOver) return;
    
    // Visual feedback for valid drop zone
    controls.start({
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.5)',
      transition: { duration: 0.2 }
    });

    return () => {
      controls.start({
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        transition: { duration: 0.2 }
      });
    };
  }, [isDragOver, controls, disableAnimations]);

  // Auto appear animation on mount
  useEffect(() => {
    if (!disableAnimations && animationSystem.areAnimationsEnabled()) {
      handleAppear();
    }
  }, [handleAppear, disableAnimations]);

  // Merge all variants
  const mergedVariants = {
    ...appearVariants,
    ...hoverVariants,
    ...selectVariants,
    ...dragVariants,
    ...modeVariants,
    // Custom drop zone states
    dropZoneActive: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.5)',
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    dropZoneInactive: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  // Animation event handlers
  const handleMouseEnter = () => {
    if (!disableAnimations && !isAnimating && !isDragging) {
      handleHover();
    }
  };

  const handleMouseLeave = () => {
    if (!disableAnimations && !isAnimating && !isDragging) {
      handleHoverEnd();
    }
  };

  if (disableAnimations || !animationSystem.areAnimationsEnabled()) {
    return (
      <div
        className={className}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      animate={controls}
      variants={mergedVariants}
      initial="hidden"
      className={className}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // Performance optimizations
      layoutId={nodeId}
      layout={false} // Disable automatic layout animations for better performance
      transformTemplate={({ scale, rotate, x, y }) => 
        `translate3d(${x || 0}, ${y || 0}, 0) scale(${scale || 1}) rotate(${rotate || 0}deg)`
      }
      // Accessibility
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (isSelected) {
            handleDeselect();
          } else {
            handleSelect();
          }
        }
      }}
      // Framer Motion optimization props
      drag={false}
      whileTap={disableAnimations ? undefined : { scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
});

AnimatedNode.displayName = 'AnimatedNode';

// HOC pour wrapper des composants existants
export const withNodeAnimation = <T extends object>(
  Component: React.ComponentType<T>,
  defaultOptions?: Partial<AnimatedNodeProps>
) => {
  const AnimatedComponent = forwardRef<AnimatedNodeRef, T & AnimatedNodeProps>((props, ref) => (
    <AnimatedNode ref={ref} {...defaultOptions} {...props}>
      <Component {...(props as T)} />
    </AnimatedNode>
  ));
  
  AnimatedComponent.displayName = `WithNodeAnimation(${Component.displayName || Component.name})`;
  return AnimatedComponent;
};