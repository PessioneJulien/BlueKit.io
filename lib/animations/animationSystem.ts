'use client';

import { Variants, Transition } from 'framer-motion';

// Types pour le système d'animations
export type AnimationType = 
  | 'nodeAppear' 
  | 'nodeDisappear' 
  | 'nodeHover' 
  | 'nodeSelect'
  | 'connectionDraw' 
  | 'connectionPulse'
  | 'modeTransition'
  | 'dragGhost'
  | 'dropSuccess'
  | 'errorShake'
  | 'celebration';

export type PerformanceMode = 'auto' | 'performance' | 'quality';

export interface AnimationInstance {
  id: string;
  type: AnimationType;
  startTime: number;
  duration?: number;
}

export interface AnimationConfig {
  variants: Variants;
  transition?: Transition;
  duration?: number;
  delay?: number;
  stiffness?: number;
  damping?: number;
}

export interface AnimationSystemState {
  animationsEnabled: boolean;
  reducedMotion: boolean;
  performanceMode: PerformanceMode;
  currentAnimations: Map<string, AnimationInstance>;
  fps: number;
  dropFrames: number;
}

// Timings standards inspirés d'Apple Human Interface Guidelines
export const animationTimings = {
  instant: 0.1,     // Hover states, button presses
  quick: 0.2,       // Small UI changes, toggles
  smooth: 0.3,      // Panel transitions, modal opens
  flowing: 0.5,     // Page transitions, major changes
  dramatic: 0.8,    // Special effects, celebrations
  
  // Easing curves
  easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeIn: [0.4, 0, 0.2, 1] as [number, number, number, number],
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  spring: { stiffness: 300, damping: 30 },
  springBouncy: { stiffness: 400, damping: 25 },
  springGentle: { stiffness: 200, damping: 35 }
} as const;

class AnimationSystem {
  private state: AnimationSystemState = {
    animationsEnabled: true,
    reducedMotion: false,
    performanceMode: 'auto',
    currentAnimations: new Map(),
    fps: 60,
    dropFrames: 0
  };

  private performanceObserver: PerformanceObserver | null = null;
  private frameCount = 0;
  private lastTime = performance.now();

  constructor() {
    this.init();
  }

  private init() {
    // Détection des préférences utilisateur pour reduced motion
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.state.reducedMotion = mediaQuery.matches;
      
      mediaQuery.addEventListener('change', (e) => {
        this.state.reducedMotion = e.matches;
        this.updateAnimationsState();
      });

      // Monitoring des performances
      this.initPerformanceMonitoring();
    }
  }

  private initPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Observer les métriques de performance
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            // Ajuster le mode performance basé sur les métriques
            if (entry.startTime > 2000) {
              this.setPerformanceMode('performance');
            }
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['paint', 'navigation'] });
    }

    // Monitoring FPS simple
    this.monitorFrameRate();
  }

  private monitorFrameRate() {
    const monitor = () => {
      const currentTime = performance.now();
      this.frameCount++;
      
      if (currentTime >= this.lastTime + 1000) {
        this.state.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        
        // Ajustement automatique du mode performance
        if (this.state.performanceMode === 'auto') {
          if (this.state.fps < 45) {
            this.setPerformanceMode('performance');
          } else if (this.state.fps > 55) {
            this.setPerformanceMode('quality');
          }
        }
        
        this.frameCount = 0;
        this.lastTime = currentTime;
      }
      
      if (this.state.animationsEnabled) {
        requestAnimationFrame(monitor);
      }
    };
    
    requestAnimationFrame(monitor);
  }

  private updateAnimationsState() {
    this.state.animationsEnabled = !this.state.reducedMotion;
  }

  public setPerformanceMode(mode: PerformanceMode) {
    this.state.performanceMode = mode;
  }

  public enableAnimations(enabled: boolean) {
    this.state.animationsEnabled = enabled && !this.state.reducedMotion;
  }

  public getPerformanceMode(): PerformanceMode {
    return this.state.performanceMode;
  }

  public getFPS(): number {
    return this.state.fps;
  }

  public areAnimationsEnabled(): boolean {
    return this.state.animationsEnabled;
  }

  public isReducedMotion(): boolean {
    return this.state.reducedMotion;
  }

  // Création d'animations basées sur le type
  public createAnimation(type: AnimationType, options?: Partial<AnimationConfig>): AnimationConfig {
    const baseConfig = this.getBaseConfigForType(type);
    const performanceAdjustments = this.getPerformanceAdjustments();
    
    return {
      ...baseConfig,
      ...options,
      variants: {
        ...baseConfig.variants,
        ...options?.variants
      },
      transition: {
        ...baseConfig.transition,
        ...performanceAdjustments,
        ...options?.transition
      }
    };
  }

  private getBaseConfigForType(type: AnimationType): AnimationConfig {
    switch (type) {
      case 'nodeAppear':
        return {
          variants: {
            hidden: { 
              scale: 0.5, 
              opacity: 0, 
              y: -50,
              rotateX: -90
            },
            visible: { 
              scale: 1, 
              opacity: 1, 
              y: 0,
              rotateX: 0
            }
          },
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.8
          }
        };

      case 'nodeDisappear':
        return {
          variants: {
            exit: {
              scale: 0.3,
              opacity: 0,
              rotateY: 90,
              filter: 'blur(4px)'
            }
          },
          transition: { 
            duration: animationTimings.smooth,
            ease: animationTimings.easeIn 
          }
        };

      case 'nodeHover':
        return {
          variants: {
            hover: {
              scale: 1.02,
              y: -1,
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
              filter: 'brightness(1.05)'
            }
          },
          transition: {
            duration: 0.15,
            ease: "easeOut"
          }
        };

      case 'nodeSelect':
        return {
          variants: {
            selected: {
              scale: 1.01,
              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.4), 0 0 15px rgba(59, 130, 246, 0.2)'
            }
          },
          transition: {
            duration: 0.2,
            ease: "easeOut"
          }
        };

      case 'connectionDraw':
        return {
          variants: {
            hidden: {
              pathLength: 0,
              opacity: 0
            },
            visible: {
              pathLength: 1,
              opacity: 1
            }
          },
          transition: {
            pathLength: {
              type: "spring",
              duration: 0.8,
              ease: "easeInOut"
            },
            opacity: {
              duration: 0.3
            }
          }
        };

      case 'connectionPulse':
        return {
          variants: {
            pulse: {
              strokeWidth: [2, 4, 2],
              opacity: [0.7, 1, 0.7]
            }
          },
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };

      case 'modeTransition':
        return {
          variants: {
            compact: {
              scale: 0.9,
              height: 'auto'
            },
            expanded: {
              scale: 1,
              height: 'auto'
            }
          },
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: animationTimings.smooth
          }
        };

      case 'dragGhost':
        return {
          variants: {
            drag: {
              scale: 1.05,
              rotate: 2,
              opacity: 0.85,
              zIndex: 1000,
              filter: 'drop-shadow(0 8px 15px rgba(0,0,0,0.25))'
            }
          },
          transition: {
            duration: 0.2,
            ease: "easeOut"
          }
        };

      case 'dropSuccess':
        return {
          variants: {
            success: {
              scale: [1, 1.08, 1],
              backgroundColor: ['rgba(16, 185, 129, 0.08)', 'rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.08)'],
              borderColor: ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.6)', 'rgba(16, 185, 129, 0.3)']
            }
          },
          transition: {
            duration: 0.4,
            ease: "easeOut"
          }
        };

      case 'errorShake':
        return {
          variants: {
            error: {
              x: [0, -10, 10, -10, 10, 0],
              borderColor: 'rgba(239, 68, 68, 0.8)'
            }
          },
          transition: {
            duration: 0.6,
            ease: "easeOut"
          }
        };

      case 'celebration':
        return {
          variants: {
            celebrate: {
              scale: [1, 1.15, 1],
              rotate: [0, 8, -8, 0],
              filter: ['hue-rotate(0deg)', 'hue-rotate(180deg)', 'hue-rotate(0deg)']
            }
          },
          transition: {
            duration: 0.6,
            ease: "easeOut"
          }
        };

      default:
        return {
          variants: {},
          transition: animationTimings.spring
        };
    }
  }

  private getPerformanceAdjustments(): Partial<Transition> {
    switch (this.state.performanceMode) {
      case 'performance':
        return {
          duration: animationTimings.quick,
          ease: "easeOut"
        };
      case 'quality':
        return {
          type: "spring",
          stiffness: 400,
          damping: 25
        };
      default:
        return this.state.fps < 50 ? {
          duration: animationTimings.quick,
          ease: "easeOut"
        } : {
          type: "spring",
          stiffness: 300,
          damping: 25
        };
    }
  }

  // Gestion des animations actives
  public addAnimation(id: string, type: AnimationType) {
    const animation: AnimationInstance = {
      id,
      type,
      startTime: performance.now()
    };
    this.state.currentAnimations.set(id, animation);
  }

  public removeAnimation(id: string) {
    this.state.currentAnimations.delete(id);
  }

  public clearAllAnimations() {
    this.state.currentAnimations.clear();
  }

  // Utility pour créer des stagger animations
  public createStaggerConfig(childDelay: number = 0.1, direction: 1 | -1 = 1) {
    return {
      variants: {
        visible: {
          transition: {
            staggerChildren: childDelay,
            staggerDirection: direction
          }
        },
        exit: {
          transition: {
            staggerChildren: childDelay * 0.5,
            staggerDirection: -direction
          }
        }
      }
    };
  }

  // Méthode pour obtenir le nombre d'animations actives
  public getCurrentAnimationCount(): number {
    return this.state.currentAnimations.size;
  }

  // Cleanup
  public destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    this.clearAllAnimations();
  }
}

// Instance globale du système d'animation
export const animationSystem = new AnimationSystem();

// Hooks utilitaires
export const useAnimationSystem = () => {
  return {
    createAnimation: (type: AnimationType, options?: Partial<AnimationConfig>) => 
      animationSystem.createAnimation(type, options),
    isAnimationEnabled: () => animationSystem.areAnimationsEnabled(),
    isReducedMotion: () => animationSystem.isReducedMotion(),
    getFPS: () => animationSystem.getFPS(),
    getPerformanceMode: () => animationSystem.getPerformanceMode()
  };
};

// Export des variants mis à jour avec le nouveau système
export * from './variants';