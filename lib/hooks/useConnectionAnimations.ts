'use client';

import { useRef, useCallback } from 'react';
import { useAnimation } from 'framer-motion';
import { animationSystem } from '../animations/animationSystem';

export interface UseConnectionAnimationsReturn {
  // Animation controls
  controls: ReturnType<typeof useAnimation>;
  pathControls: ReturnType<typeof useAnimation>;
  pulseControls: ReturnType<typeof useAnimation>;
  
  // Animation handlers
  handleConnectionDraw: () => Promise<void>;
  handleConnectionErase: () => Promise<void>;
  handleHover: () => void;
  handleHoverEnd: () => void;
  startDataFlowAnimation: () => void;
  stopDataFlowAnimation: () => void;
  playValidationAnimation: (isValid: boolean) => void;
  
  // Animation variants
  drawVariants: Record<string, unknown>;
  pulseVariants: Record<string, unknown>;
  
  // State
  isDrawing: boolean;
  isFlowing: boolean;
}

export const useConnectionAnimations = (
  connectionId: string,
  options?: {
    drawDuration?: number;
    pulseInterval?: number;
    customColors?: {
      default?: string;
      hover?: string;
      valid?: string;
      invalid?: string;
      flow?: string;
    };
  }
): UseConnectionAnimationsReturn => {
  const controls = useAnimation();
  const pathControls = useAnimation();
  const pulseControls = useAnimation();
  
  const isDrawingRef = useRef(false);
  const isFlowingRef = useRef(false);
  const pulseIntervalRef = useRef<NodeJS.Timeout>();

  // Création des variants d'animation
  const drawConfig = animationSystem.createAnimation('connectionDraw', {
    transition: {
      pathLength: {
        duration: options?.drawDuration || 0.8,
        ease: "easeInOut"
      }
    }
  });

  const pulseConfig = animationSystem.createAnimation('connectionPulse', {
    transition: {
      duration: options?.pulseInterval || 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  });

  const drawVariants = drawConfig.variants;
  const pulseVariants = pulseConfig.variants;

  // Handler pour dessiner la connexion
  const handleConnectionDraw = useCallback(async () => {
    if (!animationSystem.areAnimationsEnabled() || isDrawingRef.current) return;
    
    isDrawingRef.current = true;
    animationSystem.addAnimation(connectionId, 'connectionDraw');
    
    try {
      // Commencer par l'état caché
      await pathControls.set('hidden');
      // Animer vers visible avec le dessin progressif
      await pathControls.start('visible');
    } catch (error) {
      console.warn('Connection draw error:', error);
    } finally {
      isDrawingRef.current = false;
      animationSystem.removeAnimation(connectionId);
    }
  }, [pathControls, connectionId]);

  // Handler pour effacer la connexion
  const handleConnectionErase = useCallback(async () => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    isDrawingRef.current = true;
    animationSystem.addAnimation(connectionId, 'connectionDraw');
    
    try {
      // Animation d'effacement (inverse du dessin)
      await pathControls.start({
        pathLength: 0,
        opacity: 0,
        transition: {
          duration: 0.4,
          ease: "easeIn"
        }
      });
    } catch (error) {
      console.warn('Connection erase error:', error);
    } finally {
      isDrawingRef.current = false;
      animationSystem.removeAnimation(connectionId);
    }
  }, [pathControls, connectionId]);

  // Handler pour le hover
  const handleHover = useCallback(() => {
    if (!animationSystem.areAnimationsEnabled() || isDrawingRef.current) return;
    
    controls.start({
      strokeWidth: 4,
      stroke: options?.customColors?.hover || '#3b82f6',
      filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))',
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    });
  }, [controls, options?.customColors?.hover]);

  // Handler pour la fin du hover
  const handleHoverEnd = useCallback(() => {
    if (!animationSystem.areAnimationsEnabled() || isDrawingRef.current) return;
    
    controls.start({
      strokeWidth: 2,
      stroke: options?.customColors?.default || '#64748b',
      filter: 'none',
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    });
  }, [controls, options?.customColors?.default]);

  // Animation de flux de données
  const startDataFlowAnimation = useCallback(() => {
    if (!animationSystem.areAnimationsEnabled() || isFlowingRef.current) return;
    
    isFlowingRef.current = true;
    animationSystem.addAnimation(connectionId, 'connectionPulse');

    // Animation de particules qui se déplacent le long du path
    const animateFlow = () => {
      controls.start({
        strokeDasharray: '5 10',
        strokeDashoffset: [0, -15],
        stroke: options?.customColors?.flow || '#10b981',
        transition: {
          strokeDashoffset: {
            duration: 1.5,
            ease: "linear",
            repeat: Infinity
          }
        }
      });
    };

    animateFlow();

    // Pulse périodique pour renforcer l'effet
    pulseIntervalRef.current = setInterval(() => {
      pulseControls.start({
        strokeWidth: [2, 3, 2],
        transition: {
          duration: 0.8,
          ease: "easeInOut"
        }
      });
    }, 2000);
  }, [controls, pulseControls, connectionId, options?.customColors?.flow]);

  // Arrêter l'animation de flux
  const stopDataFlowAnimation = useCallback(() => {
    if (!isFlowingRef.current) return;
    
    isFlowingRef.current = false;
    animationSystem.removeAnimation(connectionId);
    
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
    }

    // Retour à l'état normal
    controls.start({
      strokeDasharray: 'none',
      strokeDashoffset: 0,
      stroke: options?.customColors?.default || '#64748b',
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    });
  }, [controls, connectionId, options?.customColors?.default]);

  // Animation de validation (connexion valide/invalide)
  const playValidationAnimation = useCallback((isValid: boolean) => {
    if (!animationSystem.areAnimationsEnabled()) return;
    
    const color = isValid 
      ? (options?.customColors?.valid || '#10b981')
      : (options?.customColors?.invalid || '#ef4444');
    
    const animation = isValid
      ? {
          stroke: [
            options?.customColors?.default || '#64748b',
            color,
            options?.customColors?.default || '#64748b'
          ],
          strokeWidth: [2, 3, 2],
          filter: [
            'none',
            `drop-shadow(0 0 8px ${color}60)`,
            'none'
          ],
          transition: {
            duration: 1,
            ease: "easeInOut"
          }
        }
      : {
          stroke: [
            options?.customColors?.default || '#64748b',
            color,
            color,
            options?.customColors?.default || '#64748b'
          ],
          strokeWidth: [2, 3, 3, 2],
          strokeDasharray: ['none', '3 3', '3 3', 'none'],
          transition: {
            duration: 1.2,
            ease: "easeInOut"
          }
        };

    controls.start(animation);
  }, [controls, options?.customColors]);

  return {
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
    pulseVariants,
    isDrawing: isDrawingRef.current,
    isFlowing: isFlowingRef.current
  };
};