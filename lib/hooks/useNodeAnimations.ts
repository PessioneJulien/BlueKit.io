'use client';

import { useRef, useCallback } from 'react';
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
      await controls.start('visible');
      
      // Animation de célébration optionnelle après apparition
      if (options?.enableCelebration) {
        const celebrationConfig = animationSystem.createAnimation('celebration');
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
    
    controls.start('hover');
  }, [controls]);

  const handleHoverEnd = useCallback(() => {
    if (!animationSystem.areAnimationsEnabled() || isAnimatingRef.current) return;
    
    // Retour à l'état normal ou sélectionné
    controls.start('visible');
  }, [controls]);

  const handleSelect = useCallback(() => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    controls.start('selected');
  }, [controls]);

  const handleDeselect = useCallback(() => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    controls.start('visible');
  }, [controls]);

  const handleDragStart = useCallback(() => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    isAnimatingRef.current = true;
    animationSystem.addAnimation(nodeId, 'dragGhost');
    controls.start('drag');
  }, [controls, nodeId]);

  const handleDragEnd = useCallback(() => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    isAnimatingRef.current = false;
    animationSystem.removeAnimation(nodeId);
    controls.start('visible');
  }, [controls, nodeId]);

  const handleModeTransition = useCallback(async (isCompact: boolean) => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    isAnimatingRef.current = true;
    animationSystem.addAnimation(nodeId, 'modeTransition');
    
    try {
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
      await controls.start(successConfig.variants.success);
      // Retour à l'état normal après la célébration
      setTimeout(() => controls.start('visible'), 600);
    } catch (error) {
      console.warn('Success animation error:', error);
    }
  }, [controls]);

  const handleError = useCallback(async () => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    const errorConfig = animationSystem.createAnimation('errorShake');
    
    try {
      await controls.start(errorConfig.variants.error);
      // Retour à l'état normal après l'erreur
      setTimeout(() => controls.start('visible'), 600);
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