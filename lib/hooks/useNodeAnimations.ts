'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useAnimation } from 'framer-motion';
import { animationSystem } from '../animations/animationSystem';

export interface UseNodeAnimationsReturn {
  // Animation controls
  controls: ReturnType<typeof useAnimation>;
  
  // Animation handlers
  handleAppear: () => void;
  handleDisappear: () => void;
  handleHover: () => void;
  handleHoverEnd: () => void;
  handleSelect: () => void;
  handleDeselect: () => void;
  handleDragStart: () => void;
  handleDragEnd: () => void;
  handleModeTransition: (isCompact: boolean) => void;
  handleDropSuccess: () => void;
  handleError: () => void;
  
  // Animation configs
  appearVariants: Record<string, unknown>;
  hoverVariants: Record<string, unknown>;
  selectVariants: Record<string, unknown>;
  dragVariants: Record<string, unknown>;
  modeVariants: Record<string, unknown>;
  
  // State
  isAnimating: boolean;
}

export const useNodeAnimations = (
  nodeId: string,
  options?: {
    enableCelebration?: boolean;
    customTransitions?: Record<string, Record<string, unknown>>;
  }
): UseNodeAnimationsReturn => {
  const controls = useAnimation();
  const isAnimatingRef = useRef(false);
  const mountedRef = useRef(false);

  // Track mount state to avoid calling controls.start after unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Création des variants d'animation
  const appearVariants = animationSystem.createAnimation('nodeAppear', options?.customTransitions?.appear);
  const hoverVariants = animationSystem.createAnimation('nodeHover', options?.customTransitions?.hover);
  const selectVariants = animationSystem.createAnimation('nodeSelect', options?.customTransitions?.select);
  const dragVariants = animationSystem.createAnimation('dragGhost', options?.customTransitions?.drag);
  const modeVariants = animationSystem.createAnimation('modeTransition', options?.customTransitions?.mode);

  // Handlers d'animation
  const handleAppear = useCallback(async () => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    isAnimatingRef.current = true;
    animationSystem.addAnimation(nodeId, 'nodeAppear');
    
    try {
      if (!mountedRef.current) return;
      await controls.start('visible');
      
      // Animation de célébration optionnelle après apparition
      if (options?.enableCelebration) {
        const celebrationConfig = animationSystem.createAnimation('celebration');
        if (!mountedRef.current) return;
        await controls.start(celebrationConfig.variants.celebrate);
      }
    } catch (error) {
      console.warn('Animation error:', error);
    } finally {
      isAnimatingRef.current = false;
      animationSystem.removeAnimation(nodeId);
    }
  }, [controls, nodeId, options?.enableCelebration]);

  const handleDisappear = useCallback(async () => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    isAnimatingRef.current = true;
    animationSystem.addAnimation(nodeId, 'nodeDisappear');
    
    try {
      const disappearConfig = animationSystem.createAnimation('nodeDisappear');
      if (!mountedRef.current) return;
      await controls.start(disappearConfig.variants.exit);
    } catch (error) {
      console.warn('Animation error:', error);
    } finally {
      isAnimatingRef.current = false;
      animationSystem.removeAnimation(nodeId);
    }
  }, [controls, nodeId]);

  const handleHover = useCallback(() => {
    if (!animationSystem.areAnimationsEnabled() || isAnimatingRef.current) return;
    
    // CRITICAL: Check if any node is being dragged globally to prevent flicker
    const isDragActive = document.querySelector('.react-flow__node.dragging') !== null;
    if (isDragActive) return;
    if (!mountedRef.current) return;
    
    // Only apply hover if not in drag state
    controls.start({
      scale: 1.02,
      y: -1,
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
      filter: 'brightness(1.05)',
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    });
  }, [controls]);

  const handleHoverEnd = useCallback(() => {
    if (!animationSystem.areAnimationsEnabled() || isAnimatingRef.current) return;
    
    // CRITICAL: Check if any node is being dragged globally to prevent flicker
    const isDragActive = document.querySelector('.react-flow__node.dragging') !== null;
    if (isDragActive) return;
    if (!mountedRef.current) return;
    
    // Retour à l'état normal ou sélectionné - always ensure scale is 1
    controls.start({
      scale: 1,
      y: 0,
      boxShadow: '0 0 0 0px rgba(0, 0, 0, 0)',
      filter: 'brightness(1)',
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    });
  }, [controls]);

  const handleSelect = useCallback(() => {
    if (!animationSystem.areAnimationsEnabled()) return;
    if (!mountedRef.current) return;
    
    // Ensure selected state has proper scale
    controls.start({
      scale: 1.01,
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.4), 0 0 15px rgba(59, 130, 246, 0.2)',
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    });
  }, [controls]);

  const handleDeselect = useCallback(() => {
    if (!animationSystem.areAnimationsEnabled()) return;
    if (!mountedRef.current) return;
    
    // Reset to normal state with explicit scale
    controls.start({
      scale: 1,
      boxShadow: '0 0 0 0px rgba(0, 0, 0, 0)',
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    });
  }, [controls]);

  const handleDragStart = useCallback(() => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    isAnimatingRef.current = true;
    animationSystem.addAnimation(nodeId, 'dragGhost');
    
    // CRITICAL: Stop all other animations immediately to prevent flicker
    controls.stop();
    
    // Apply minimal drag styling to prevent conflicts with React Flow
    controls.set({
      opacity: 0.9,
      cursor: 'grabbing'
    });
  }, [controls, nodeId]);

  const handleDragEnd = useCallback(() => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    isAnimatingRef.current = false;
    animationSystem.removeAnimation(nodeId);
    
    // Reset to normal state with explicit values to prevent any lingering styles
    if (!mountedRef.current) return;
    controls.start({
      scale: 1,
      rotate: 0,
      opacity: 1,
      zIndex: 'auto',
      filter: 'none',
      cursor: 'auto',
      x: 0,
      y: 0,
      transition: {
        duration: 0.15, // Faster reset to minimize visual artifacts
        ease: "easeOut"
      }
    });
  }, [controls, nodeId]);

  const handleModeTransition = useCallback(async (isCompact: boolean) => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    isAnimatingRef.current = true;
    animationSystem.addAnimation(nodeId, 'modeTransition');
    
    try {
      if (!mountedRef.current) return;
      await controls.start(isCompact ? 'compact' : 'expanded');
    } catch (error) {
      console.warn('Mode transition error:', error);
    } finally {
      isAnimatingRef.current = false;
      animationSystem.removeAnimation(nodeId);
    }
  }, [controls, nodeId]);

  const handleDropSuccess = useCallback(async () => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    const successConfig = animationSystem.createAnimation('dropSuccess');
    
    try {
      if (!mountedRef.current) return;
      await controls.start(successConfig.variants.success);
      // Retour à l'état normal après la célébration
      setTimeout(() => { if (mountedRef.current) { controls.start('visible'); } }, 600);
    } catch (error) {
      console.warn('Success animation error:', error);
    }
  }, [controls]);

  const handleError = useCallback(async () => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    const errorConfig = animationSystem.createAnimation('errorShake');
    
    try {
      if (!mountedRef.current) return;
      await controls.start(errorConfig.variants.error);
      // Retour à l'état normal après l'erreur
      setTimeout(() => { if (mountedRef.current) { controls.start('visible'); } }, 600);
    } catch (error) {
      console.warn('Error animation error:', error);
    }
  }, [controls]);

  return {
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
    appearVariants: appearVariants.variants,
    hoverVariants: hoverVariants.variants,
    selectVariants: selectVariants.variants,
    dragVariants: dragVariants.variants,
    modeVariants: modeVariants.variants,
    isAnimating: isAnimatingRef.current
  };
};