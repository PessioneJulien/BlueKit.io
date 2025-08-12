'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, BadgeProps } from '@/components/ui/Badge';
import { animationSystem } from '@/lib/animations/animationSystem';

export interface AnimatedBadgeProps extends BadgeProps {
  children: React.ReactNode;
  delay?: number;
  enableHover?: boolean;
  enableSpring?: boolean;
  enablePulse?: boolean;
  customAnimation?: 'bounce' | 'spin' | 'pulse' | 'shake' | 'glow';
  onAnimationComplete?: () => void;
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  children,
  delay = 0,
  enableHover = true,
  enableSpring = true,
  enablePulse = false,
  customAnimation,
  onAnimationComplete,
  className,
  ...badgeProps
}) => {
  // Animation variants basés sur le système d'animation
  const variants = {
    hidden: { 
      scale: 0, 
      opacity: 0,
      rotateZ: -180
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      rotateZ: 0,
      transition: enableSpring ? {
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay
      } : {
        duration: 0.3,
        ease: "easeOut",
        delay
      }
    },
    exit: { 
      scale: 0, 
      opacity: 0,
      rotateZ: 180,
      transition: {
        duration: 0.2
      }
    }
  };

  // Hover variants
  const hoverVariants = enableHover ? {
    scale: 1.05,
    y: -2,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 15 
    }
  } : {};

  // Tap variants
  const tapVariants = {
    scale: 0.95,
    transition: { duration: 0.1 }
  };

  // Custom animation variants
  const getCustomAnimationVariants = () => {
    switch (customAnimation) {
      case 'bounce':
        return {
          animate: {
            y: [0, -5, 0],
            transition: {
              duration: 0.6,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse" as const
            }
          }
        };
      case 'spin':
        return {
          animate: {
            rotate: 360,
            transition: {
              duration: 2,
              ease: "linear",
              repeat: Infinity
            }
          }
        };
      case 'pulse':
        return {
          animate: {
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1],
            transition: {
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity
            }
          }
        };
      case 'shake':
        return {
          animate: {
            x: [0, -2, 2, -2, 2, 0],
            transition: {
              duration: 0.6,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 3
            }
          }
        };
      case 'glow':
        return {
          animate: {
            boxShadow: [
              "0 0 5px rgba(59, 130, 246, 0.3)",
              "0 0 15px rgba(59, 130, 246, 0.6)",
              "0 0 5px rgba(59, 130, 246, 0.3)"
            ],
            transition: {
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity
            }
          }
        };
      default:
        return {};
    }
  };

  // Pulse animation pour les badges importants
  const pulseAnimation = enablePulse ? {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity
    }
  } : {};

  const customVariants = getCustomAnimationVariants();

  if (!animationSystem.areAnimationsEnabled()) {
    return (
      <Badge {...badgeProps} className={className}>
        {children}
      </Badge>
    );
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={hoverVariants}
      whileTap={tapVariants}
      onAnimationComplete={onAnimationComplete}
      style={{ display: 'inline-block' }}
      {...customVariants}
    >
      <motion.div
        animate={pulseAnimation}
        style={{ display: 'inline-block' }}
      >
        <Badge {...badgeProps} className={className}>
          {children}
        </Badge>
      </motion.div>
    </motion.div>
  );
};

// Wrapper component pour les collections de badges avec animation en séquence
export interface AnimatedBadgeGroupProps {
  children: React.ReactNode;
  staggerDelay?: number;
  direction?: 'row' | 'column';
  className?: string;
}

export const AnimatedBadgeGroup: React.FC<AnimatedBadgeGroupProps> = ({
  children,
  staggerDelay = 0.1,
  direction = 'row',
  className = ''
}) => {
  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2
      }
    },
    exit: {
      transition: {
        staggerChildren: staggerDelay * 0.5,
        staggerDirection: -1
      }
    }
  };

  if (!animationSystem.areAnimationsEnabled()) {
    return (
      <div className={`flex ${direction === 'row' ? 'flex-row' : 'flex-col'} gap-2 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`flex ${direction === 'row' ? 'flex-row' : 'flex-col'} gap-2 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

// Hook pour contrôler les animations de badges
export const useAnimatedBadge = (badgeId: string) => {
  const playBounce = () => {
    // Trigger bounce animation programmatically
    console.log(`Playing bounce animation for badge ${badgeId}`);
  };

  const playGlow = () => {
    // Trigger glow animation programmatically  
    console.log(`Playing glow animation for badge ${badgeId}`);
  };

  const playShake = () => {
    // Trigger shake animation programmatically
    console.log(`Playing shake animation for badge ${badgeId}`);
  };

  return {
    playBounce,
    playGlow,
    playShake
  };
};