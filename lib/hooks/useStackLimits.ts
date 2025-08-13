'use client';

import { useCallback } from 'react';
import { useSubscription } from './useSubscription';

interface StackLimits {
  maxStacks: number;
  maxComponentsPerStack: number;
  maxExportsPerMonth: number;
  canUseContainers: boolean;
  canUseCustomStyling: boolean;
  canShareStacks: boolean;
}

export function useStackLimits(onShowUpgradeModal?: (reason: string, currentCount?: number, limit?: number) => void) {
  const { subscription, canUseFeature } = useSubscription();

  const getLimits = useCallback((): StackLimits => {
    switch (subscription.plan) {
      case 'starter':
        return {
          maxStacks: -1,
          maxComponentsPerStack: 25,
          maxExportsPerMonth: 50,
          canUseContainers: true,
          canUseCustomStyling: true,
          canShareStacks: true,
        };
      case 'professional':
        return {
          maxStacks: -1, // Unlimited
          maxComponentsPerStack: -1, // Unlimited
          maxExportsPerMonth: -1, // Unlimited
          canUseContainers: true,
          canUseCustomStyling: true,
          canShareStacks: true,
        };
      case 'enterprise':
        return {
          maxStacks: -1, // Unlimited
          maxComponentsPerStack: -1, // Unlimited
          maxExportsPerMonth: -1, // Unlimited
          canUseContainers: true,
          canUseCustomStyling: true,
          canShareStacks: true,
        };
      default: // free
        return {
          maxStacks: -1,
          maxComponentsPerStack: -1,
          maxExportsPerMonth: -1,
          canUseContainers: false,
          canUseCustomStyling: false,
          canShareStacks: false,
        };
    }
  }, [subscription.plan]);

  const checkComponentLimit = useCallback((currentCount: number): boolean => {
    const limits = getLimits();
    
    console.log('🔍 Checking component limit:', {
      currentCount,
      maxAllowed: limits.maxComponentsPerStack,
      plan: subscription.plan
    });
    
    if (limits.maxComponentsPerStack === -1) return true; // Unlimited
    
    // Vérifier si on DÉPASSERAIT la limite après ajout (pas seulement si on l'a atteinte)
    if (currentCount >= limits.maxComponentsPerStack) {
      console.log('❌ Component limit reached!');
      onShowUpgradeModal?.('components', currentCount, limits.maxComponentsPerStack);
      return false;
    }
    
    console.log('✅ Under limit, allowing addition');
    return true;
  }, [getLimits, subscription.plan, onShowUpgradeModal]);

  const checkStackLimit = useCallback((currentCount: number): boolean => {
    const limits = getLimits();
    
    if (limits.maxStacks === -1) return true; // Unlimited
    
    if (currentCount >= limits.maxStacks) {
      onShowUpgradeModal?.('stacks', currentCount, limits.maxStacks);
      return false;
    }
    
    return true;
  }, [getLimits, onShowUpgradeModal]);

  const checkExportLimit = useCallback((currentCount: number): boolean => {
    const limits = getLimits();
    
    if (limits.maxExportsPerMonth === -1) return true; // Unlimited
    
    if (currentCount >= limits.maxExportsPerMonth) {
      onShowUpgradeModal?.('exports', currentCount, limits.maxExportsPerMonth);
      return false;
    }
    
    return true;
  }, [getLimits, onShowUpgradeModal]);

  const checkFeatureAccess = useCallback((feature: keyof StackLimits): boolean => {
    const limits = getLimits();
    
    switch (feature) {
      case 'canUseContainers':
        if (!limits.canUseContainers) {
          onShowUpgradeModal?.('containers');
          return false;
        }
        return true;
      case 'canUseCustomStyling':
        if (!limits.canUseCustomStyling) {
          onShowUpgradeModal?.('styling');
          return false;
        }
        return true;
      case 'canShareStacks':
        if (!limits.canShareStacks) {
          onShowUpgradeModal?.('sharing');
          return false;
        }
        return true;
      default:
        return true;
    }
  }, [getLimits, onShowUpgradeModal]);

  return {
    limits: getLimits(),
    checkComponentLimit,
    checkStackLimit,
    checkExportLimit,
    checkFeatureAccess,
    subscription,
  };
}