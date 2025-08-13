'use client';

import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
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
  isCompact = true, // eslint-disable-line @typescript-eslint/no-unused-vars
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

  // Handle drag state - CRITICAL: Prevent animation conflicts during drag
  useEffect(() => {
    if (disableAnimations) return;
    
    if (isDragging) {
      // CRITICAL: Stop ALL animations immediately for better performance
      controls.stop();
      // Set static values to prevent flickering
      controls.set({
        scale: 1,
        rotate: 0,
        opacity: 0.9,
        x: 0,
        y: 0,
        filter: 'none',
        boxShadow: 'none'
      });
      handleDragStart();
      onDragStart?.();
    } else {
      // Reset immediately without animation during drag end
      controls.set({
        scale: 1,
        rotate: 0,
        opacity: 1,
        x: 0,
        y: 0,
        filter: 'none',
        boxShadow: 'none'
      });
      handleDragEnd();
      onDragEnd?.();
    }
  }, [isDragging, handleDragStart, handleDragEnd, onDragStart, onDragEnd, disableAnimations, controls]);

  // Handle drop success - Only when NOT dragging to prevent conflicts
  useEffect(() => {
    if (disableAnimations || !isDragOver || isDragging) return;
    
    // Visual feedback for valid drop zone
    controls.start({
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.5)',
      transition: { duration: 0.2 }
    });

    return () => {
      if (!isDragging) {
        controls.start({
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          transition: { duration: 0.2 }
        });
      }
    };
  }, [isDragOver, controls, disableAnimations, isDragging]);

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
      backgroundColor: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      scale: 1.01,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    dropZoneInactive: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  // Animation event handlers with drag state management
  const handleMouseEnter = () => {
    // CRITICAL: Check for global drag state to prevent flicker
    const isGlobalDragActive = document.body.classList.contains('react-flow-dragging');
    if (!disableAnimations && !isAnimating && !isDragging && !isGlobalDragActive) {
      handleHover();
    }
  };

  const handleMouseLeave = () => {
    // CRITICAL: Check for global drag state to prevent flicker
    const isGlobalDragActive = document.body.classList.contains('react-flow-dragging');
    if (!disableAnimations && !isAnimating && !isDragging && !isGlobalDragActive) {
      handleHoverEnd();
    }
  };

  // Handle click/tap animations properly - DISABLED during drag to prevent flicker
  const handleMouseDown = () => {
    if (!disableAnimations && !isAnimating && !isDragging) {
      controls.start({
        scale: 0.99,
        transition: { duration: 0.1, ease: "easeOut" }
      });
    }
  };

  const handleMouseUp = () => {
    if (!disableAnimations && !isAnimating && !isDragging) {
      // Reset to the appropriate state based on current conditions
      if (isSelected) {
        handleSelect();
      } else {
        controls.start({
          scale: 1,
          transition: { duration: 0.15, ease: "easeOut" }
        });
      }
    }
  };

  const handleClick = () => {
    // Skip click animations during or right after drag to prevent flicker
    if (isDragging) return;
    
    // Ensure we always reset to proper scale after click
    setTimeout(() => {
      if (!disableAnimations && !isAnimating && !isDragging) {
        if (isSelected) {
          handleSelect();
        } else {
          controls.start({
            scale: 1,
            transition: { duration: 0.15, ease: "easeOut" }
          });
        }
      }
    }, 50); // Small delay to ensure click events are processed
  };

  if (disableAnimations || !animationSystem.areAnimationsEnabled()) {
    return (
      <div
        className={className}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      animate={isDragging ? { scale: 1, opacity: 1 } : controls} // Override with static values during drag
      variants={mergedVariants}
      initial="hidden"
      className={className}
      style={style}
      onMouseEnter={isDragging ? undefined : handleMouseEnter}
      onMouseLeave={isDragging ? undefined : handleMouseLeave}
      onMouseDown={isDragging ? undefined : handleMouseDown}
      onMouseUp={isDragging ? undefined : handleMouseUp}
      onClick={isDragging ? undefined : handleClick}
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
      // Framer Motion optimization props - CRITICAL for performance during drag
      drag={false}
      // Removed whileTap to prevent stuck animations - we handle this manually now
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