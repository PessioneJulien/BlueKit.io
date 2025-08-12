'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnectionAnimations } from '@/lib/hooks/useConnectionAnimations';
import { animationSystem } from '@/lib/animations/animationSystem';

export interface AnimatedConnectionProps {
  connectionId: string;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  isValid?: boolean;
  isHovered?: boolean;
  showDataFlow?: boolean;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  // Colors
  color?: string;
  hoverColor?: string;
  validColor?: string;
  invalidColor?: string;
  flowColor?: string;
  // Animation options
  drawDuration?: number;
  pulseInterval?: number;
  disableAnimations?: boolean;
  // Event handlers
  onDrawComplete?: () => void;
  onEraseComplete?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
}

export interface AnimatedConnectionRef {
  playDrawAnimation: () => Promise<void>;
  playEraseAnimation: () => Promise<void>;
  startDataFlow: () => void;
  stopDataFlow: () => void;
  playValidationAnimation: (isValid: boolean) => void;
}

export const AnimatedConnection = forwardRef<AnimatedConnectionRef, AnimatedConnectionProps>(({
  connectionId,
  sourcePosition,
  targetPosition,
  isValid = true,
  isHovered = false,
  showDataFlow = false,
  strokeWidth = 2,
  className = '',
  style = {},
  color = '#64748b',
  hoverColor = '#3b82f6',
  validColor = '#10b981',
  invalidColor = '#ef4444',
  flowColor = '#10b981',
  drawDuration = 0.8,
  pulseInterval = 2,
  disableAnimations = false,
  onDrawComplete,
  onEraseComplete,
  onHover,
  onHoverEnd
}, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const {
    controls,
    pathControls,
    pulseControls,
    handleConnectionDraw,
    handleConnectionErase,
    handleHover,
    handleHoverEnd,
    startDataFlowAnimation,
    stopDataFlowAnimation,
    playValidationAnimation,
    drawVariants,
    isDrawing,
    isFlowing
  } = useConnectionAnimations(connectionId, {
    drawDuration,
    pulseInterval,
    customColors: {
      default: color,
      hover: hoverColor,
      valid: validColor,
      invalid: invalidColor,
      flow: flowColor
    }
  });

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    playDrawAnimation: async () => {
      await handleConnectionDraw();
      onDrawComplete?.();
    },
    playEraseAnimation: async () => {
      await handleConnectionErase();
      onEraseComplete?.();
    },
    startDataFlow: () => {
      startDataFlowAnimation();
    },
    stopDataFlow: () => {
      stopDataFlowAnimation();
    },
    playValidationAnimation: (valid: boolean) => {
      playValidationAnimation(valid);
    }
  }), [handleConnectionDraw, handleConnectionErase, startDataFlowAnimation, stopDataFlowAnimation, playValidationAnimation, onDrawComplete, onEraseComplete]);

  // Handle hover state
  useEffect(() => {
    if (disableAnimations) return;
    
    if (isHovered) {
      handleHover();
      onHover?.();
    } else {
      handleHoverEnd();
      onHoverEnd?.();
    }
  }, [isHovered, handleHover, handleHoverEnd, onHover, onHoverEnd, disableAnimations]);

  // Handle data flow
  useEffect(() => {
    if (disableAnimations) return;
    
    if (showDataFlow && !isFlowing) {
      startDataFlowAnimation();
    } else if (!showDataFlow && isFlowing) {
      stopDataFlowAnimation();
    }
  }, [showDataFlow, isFlowing, startDataFlowAnimation, stopDataFlowAnimation, disableAnimations]);

  // Auto draw animation on mount
  useEffect(() => {
    if (!disableAnimations && animationSystem.areAnimationsEnabled()) {
      handleConnectionDraw();
    }
  }, [handleConnectionDraw, disableAnimations]);

  // Calculate path
  const calculatePath = () => {
    const { x: x1, y: y1 } = sourcePosition;
    const { x: x2, y: y2 } = targetPosition;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    // Control points for curved path
    const midX = x1 + dx * 0.5;
    const controlX1 = x1 + Math.abs(dx) * 0.3;
    const controlX2 = x2 - Math.abs(dx) * 0.3;
    
    // Create smooth curved path
    return `M ${x1} ${y1} C ${controlX1} ${y1}, ${controlX2} ${y2}, ${x2} ${y2}`;
  };

  // Calculate SVG bounds
  const getBounds = () => {
    const { x: x1, y: y1 } = sourcePosition;
    const { x: x2, y: y2 } = targetPosition;
    
    const minX = Math.min(x1, x2) - 10;
    const minY = Math.min(y1, y2) - 10;
    const maxX = Math.max(x1, x2) + 10;
    const maxY = Math.max(y1, y2) + 10;
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  const pathData = calculatePath();
  const bounds = getBounds();

  if (disableAnimations || !animationSystem.areAnimationsEnabled()) {
    return (
      <svg
        ref={svgRef}
        className={className}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          zIndex: 1,
          ...style,
          left: bounds.x,
          top: bounds.y,
          width: bounds.width,
          height: bounds.height
        }}
      >
        <path
          d={pathData}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <motion.svg
      ref={svgRef}
      className={className}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 1,
        ...style,
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Main path */}
      <motion.path
        d={pathData}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={drawVariants}
        animate={pathControls}
        initial="hidden"
        // Performance optimizations
        style={{ willChange: 'stroke-dashoffset, opacity' }}
      />
      
      {/* Glow effect for hover/validation */}
      <motion.path
        d={pathData}
        stroke="currentColor"
        strokeWidth={strokeWidth + 4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0}
        filter="blur(2px)"
        animate={controls}
        style={{ willChange: 'opacity, stroke' }}
      />
      
      {/* Data flow particles (when active) */}
      <AnimatePresence>
        {showDataFlow && !disableAnimations && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.circle
                key={i}
                r="2"
                fill={flowColor}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  offset: [0, 1]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  offsetPath: `path("${pathData}")`,
                  offsetDistance: '0%'
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
      
      {/* Validation indicator */}
      <AnimatePresence>
        {!isValid && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotate: [0, 360]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 }
            }}
          >
            <circle
              cx={sourcePosition.x + (targetPosition.x - sourcePosition.x) * 0.5}
              cy={sourcePosition.y + (targetPosition.y - sourcePosition.y) * 0.5}
              r="8"
              fill={invalidColor}
              opacity={0.9}
            />
            <path
              d={`M ${sourcePosition.x + (targetPosition.x - sourcePosition.x) * 0.5 - 4} ${sourcePosition.y + (targetPosition.y - sourcePosition.y) * 0.5 - 4} 
                  L ${sourcePosition.x + (targetPosition.x - sourcePosition.x) * 0.5 + 4} ${sourcePosition.y + (targetPosition.y - sourcePosition.y) * 0.5 + 4}
                  M ${sourcePosition.x + (targetPosition.x - sourcePosition.x) * 0.5 + 4} ${sourcePosition.y + (targetPosition.y - sourcePosition.y) * 0.5 - 4}
                  L ${sourcePosition.x + (targetPosition.x - sourcePosition.x) * 0.5 - 4} ${sourcePosition.y + (targetPosition.y - sourcePosition.y) * 0.5 + 4}`}
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.g>
        )}
      </AnimatePresence>
    </motion.svg>
  );
});

AnimatedConnection.displayName = 'AnimatedConnection';

// Utility hook for managing multiple connections
export const useAnimatedConnections = (connections: Array<{
  id: string;
  source: { x: number; y: number };
  target: { x: number; y: number };
}>) => {
  const connectionRefs = useRef<Map<string, AnimatedConnectionRef>>(new Map());
  
  const playAllDrawAnimations = async () => {
    const animations = Array.from(connectionRefs.current.values()).map(ref => 
      ref.playDrawAnimation()
    );
    await Promise.all(animations);
  };
  
  const playAllEraseAnimations = async () => {
    const animations = Array.from(connectionRefs.current.values()).map(ref => 
      ref.playEraseAnimation()
    );
    await Promise.all(animations);
  };
  
  const startAllDataFlows = () => {
    connectionRefs.current.forEach(ref => ref.startDataFlow());
  };
  
  const stopAllDataFlows = () => {
    connectionRefs.current.forEach(ref => ref.stopDataFlow());
  };
  
  const setConnectionRef = (id: string, ref: AnimatedConnectionRef | null) => {
    if (ref) {
      connectionRefs.current.set(id, ref);
    } else {
      connectionRefs.current.delete(id);
    }
  };
  
  return {
    playAllDrawAnimations,
    playAllEraseAnimations,
    startAllDataFlows,
    stopAllDataFlows,
    setConnectionRef
  };
};