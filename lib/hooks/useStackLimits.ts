'use client';

import { useCallback } from 'react';
import { useSubscription } from './useSubscription';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface StackLimits {
  maxStacks: number;
  maxComponentsPerStack: number;
  maxExportsPerMonth: number;
  canUseContainers: boolean;
  canUseCustomStyling: boolean;
  canShareStacks: boolean;
}

export function useStackLimits() {
  const { subscription, canUseFeature } = useSubscription();
  const router = useRouter();

  const getLimits = useCallback((): StackLimits => {
    switch (subscription.plan) {
      case 'starter':
        return {
          maxStacks: 10,
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
          maxStacks: 3,
          maxComponentsPerStack: 10,
          maxExportsPerMonth: 5,
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
      toast.error(`Limite de ${limits.maxComponentsPerStack} composants atteinte! Passez à un plan supérieur pour continuer.`, {
        duration: 6000,
        style: {
          background: '#dc2626',
          color: '#fff',
        },
      });
      // Optionally navigate to pricing after a delay
      setTimeout(() => {
        if (window.confirm('Voulez-vous voir les plans premium ?')) {
          router.push('/pricing');
        }
      }, 1000);
      return false;
    }
    
    console.log('✅ Under limit, allowing addition');
    return true;
  }, [getLimits, subscription.plan, router]);

  const checkStackLimit = useCallback((currentCount: number): boolean => {
    const limits = getLimits();
    
    if (limits.maxStacks === -1) return true; // Unlimited
    
    if (currentCount >= limits.maxStacks) {
      toast.error(`Limite de stacks atteinte (${limits.maxStacks}). Passez à un plan supérieur.`);
      return false;
    }
    
    return true;
  }, [getLimits, router]);

  const checkExportLimit = useCallback((currentCount: number): boolean => {
    const limits = getLimits();
    
    if (limits.maxExportsPerMonth === -1) return true; // Unlimited
    
    if (currentCount >= limits.maxExportsPerMonth) {
      toast.error(`Limite d'exports atteinte (${limits.maxExportsPerMonth}). Passez à un plan supérieur.`);
      return false;
    }
    
    return true;
  }, [getLimits, router]);

  const checkFeatureAccess = useCallback((feature: keyof StackLimits): boolean => {
    const limits = getLimits();
    
    switch (feature) {
      case 'canUseContainers':
        if (!limits.canUseContainers) {
          toast.error('🔒 Les conteneurs sont réservés aux plans payants. Passez au plan Starter pour les débloquer.', {
            duration: 6000,
            style: {
              background: '#ea580c',
              color: '#fff',
            },
          });
          return false;
        }
        return true;
      case 'canUseCustomStyling':
        if (!limits.canUseCustomStyling) {
          toast.error('La personnalisation du style est réservée aux plans payants.');
          return false;
        }
        return true;
      case 'canShareStacks':
        if (!limits.canShareStacks) {
          toast.error('Le partage de stacks est réservé aux plans payants.');
          return false;
        }
        return true;
      default:
        return true;
    }
  }, [getLimits, router]);

  return {
    limits: getLimits(),
    checkComponentLimit,
    checkStackLimit,
    checkExportLimit,
    checkFeatureAccess,
    subscription,
  };
}