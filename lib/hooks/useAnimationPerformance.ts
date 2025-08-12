'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { animationSystem, PerformanceMode } from '../animations/animationSystem';

export interface PerformanceMetrics {
  fps: number;
  frameDrops: number;
  memoryUsage: number;
  animationCount: number;
  performanceScore: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface UseAnimationPerformanceReturn {
  metrics: PerformanceMetrics;
  performanceMode: PerformanceMode;
  isReducedMotion: boolean;
  setPerformanceMode: (mode: PerformanceMode) => void;
  enableAnimations: (enabled: boolean) => void;
  optimizeForPerformance: () => void;
  resetPerformanceTracking: () => void;
}

export const useAnimationPerformance = (): UseAnimationPerformanceReturn => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameDrops: 0,
    memoryUsage: 0,
    animationCount: 0,
    performanceScore: 'excellent'
  });

  const [performanceMode, setPerformanceModeState] = useState<PerformanceMode>('auto');
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameDropsRef = useRef(0);
  const animationFrameRef = useRef<number>();

  // Calcul du score de performance
  const calculatePerformanceScore = useCallback((fps: number, frameDrops: number): PerformanceMetrics['performanceScore'] => {
    if (fps >= 55 && frameDrops < 5) return 'excellent';
    if (fps >= 45 && frameDrops < 15) return 'good';
    if (fps >= 30 && frameDrops < 30) return 'fair';
    return 'poor';
  }, []);

  // Monitoring FPS et frame drops
  const monitorPerformance = useCallback(() => {
    const currentTime = performance.now();
    frameCountRef.current++;

    // Détection des frame drops (si le temps entre les frames > 20ms pour 60fps)
    if (currentTime - lastTimeRef.current > 20) {
      frameDropsRef.current++;
    }

    // Calcul FPS toutes les secondes
    if (currentTime >= lastTimeRef.current + 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
      
      // Estimation utilisation mémoire (approximation basée sur les animations actives)
      const memoryUsage = performance.memory ? 
        Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0;
      
      const animationCount = animationSystem.getCurrentAnimationCount?.() || 0;
      const performanceScore = calculatePerformanceScore(fps, frameDropsRef.current);

      setMetrics({
        fps,
        frameDrops: frameDropsRef.current,
        memoryUsage,
        animationCount,
        performanceScore
      });

      // Reset counters
      frameCountRef.current = 0;
      frameDropsRef.current = 0;
      lastTimeRef.current = currentTime;

      // Auto-ajustement du mode performance
      if (performanceMode === 'auto') {
        if (performanceScore === 'poor' || fps < 30) {
          setPerformanceModeState('performance');
          animationSystem.setPerformanceMode('performance');
        } else if (performanceScore === 'excellent' && fps > 55) {
          setPerformanceModeState('quality');
          animationSystem.setPerformanceMode('quality');
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(monitorPerformance);
  }, [performanceMode, calculatePerformanceScore]);

  // Démarrage du monitoring
  useEffect(() => {
    if (animationSystem.areAnimationsEnabled()) {
      monitorPerformance();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [monitorPerformance]);

  // Synchronisation avec le système d'animation
  useEffect(() => {
    const updateState = () => {
      setIsReducedMotion(animationSystem.isReducedMotion());
      setPerformanceModeState(animationSystem.getPerformanceMode());
    };

    updateState();
    
    // Observer les changements de préférences système
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', updateState);

    return () => {
      mediaQuery.removeEventListener('change', updateState);
    };
  }, []);

  // Contrôles
  const setPerformanceMode = useCallback((mode: PerformanceMode) => {
    setPerformanceModeState(mode);
    animationSystem.setPerformanceMode(mode);
  }, []);

  const enableAnimations = useCallback((enabled: boolean) => {
    animationSystem.enableAnimations(enabled);
  }, []);

  const optimizeForPerformance = useCallback(() => {
    // Optimisations automatiques pour améliorer les performances
    setPerformanceMode('performance');
    
    // Réduire le nombre d'animations simultanées
    animationSystem.clearAllAnimations();
    
    // Suggestions d'optimisation (log pour debug)
    console.log('🚀 Performance optimization activated:', {
      reducedAnimations: true,
      lowerQuality: true,
      fasterTransitions: true
    });
  }, [setPerformanceMode]);

  const resetPerformanceTracking = useCallback(() => {
    frameCountRef.current = 0;
    frameDropsRef.current = 0;
    lastTimeRef.current = performance.now();
    
    setMetrics({
      fps: 60,
      frameDrops: 0,
      memoryUsage: 0,
      animationCount: 0,
      performanceScore: 'excellent'
    });
  }, []);

  return {
    metrics,
    performanceMode,
    isReducedMotion,
    setPerformanceMode,
    enableAnimations,
    optimizeForPerformance,
    resetPerformanceTracking
  };
};

// Hook pour débugger les performances
export const useAnimationDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<{
    activeAnimations: string[];
    memoryLeaks: boolean;
    performanceWarnings: string[];
  }>({
    activeAnimations: [],
    memoryLeaks: false,
    performanceWarnings: []
  });

  const logAnimationStart = useCallback((animationId: string) => {
    setDebugInfo(prev => ({
      ...prev,
      activeAnimations: [...prev.activeAnimations, animationId]
    }));
  }, []);

  const logAnimationEnd = useCallback((animationId: string) => {
    setDebugInfo(prev => ({
      ...prev,
      activeAnimations: prev.activeAnimations.filter(id => id !== animationId)
    }));
  }, []);

  const checkMemoryLeaks = useCallback(() => {
    const activeCount = debugInfo.activeAnimations.length;
    if (activeCount > 50) {
      setDebugInfo(prev => ({
        ...prev,
        memoryLeaks: true,
        performanceWarnings: [
          ...prev.performanceWarnings,
          `High number of active animations detected: ${activeCount}`
        ]
      }));
    }
  }, [debugInfo.activeAnimations.length]);

  useEffect(() => {
    checkMemoryLeaks();
  }, [checkMemoryLeaks]);

  const clearWarnings = useCallback(() => {
    setDebugInfo(prev => ({
      ...prev,
      performanceWarnings: []
    }));
  }, []);

  return {
    debugInfo,
    logAnimationStart,
    logAnimationEnd,
    clearWarnings
  };
};

// Extensions pour le système d'animation existant
declare module '../animations/animationSystem' {
  interface AnimationSystem {
    getCurrentAnimationCount(): number;
  }
}