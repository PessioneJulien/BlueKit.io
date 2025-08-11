import { useEffect, useRef } from 'react';
import { useSupabaseAuth } from '@/lib/supabase/auth-context';
import { usePathname } from 'next/navigation';

const SYNC_INTERVAL = 60000; // Vérifier toutes les 60 secondes
const LAST_SYNC_KEY = 'last_subscription_sync';

export function useSubscriptionSync() {
  const { user } = useSupabaseAuth();
  const pathname = usePathname();
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);

  const syncSubscription = async (force = false) => {
    if (!user) return;

    // Récupérer le timestamp de la dernière sync
    const lastSyncStr = localStorage.getItem(LAST_SYNC_KEY);
    const lastSync = lastSyncStr ? parseInt(lastSyncStr, 10) : 0;
    const now = Date.now();

    // Ne pas sync si c'était il y a moins de 30 secondes (sauf si forcé)
    if (!force && now - lastSync < 30000) {
      console.log('⏭️ Skipping sync, too recent');
      return;
    }

    try {
      console.log('🔄 Syncing subscription with Stripe...');
      const response = await fetch('/api/stripe/sync-subscription');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Subscription sync result:', data);
        
        // Sauvegarder le timestamp
        localStorage.setItem(LAST_SYNC_KEY, now.toString());
        
        // Si l'abonnement a été annulé ou changé, recharger la page
        if (data.plan === 'free' && localStorage.getItem('had_subscription') === 'true') {
          console.log('⚠️ Subscription cancelled, reloading...');
          localStorage.removeItem('had_subscription');
          window.location.reload();
        } else if (data.plan !== 'free') {
          localStorage.setItem('had_subscription', 'true');
        }
        
        // Si le plan a changé, recharger pour mettre à jour l'UI
        const currentPlan = localStorage.getItem('current_plan');
        if (currentPlan && currentPlan !== data.plan) {
          console.log('🔄 Plan changed from', currentPlan, 'to', data.plan);
          window.location.reload();
        }
        localStorage.setItem('current_plan', data.plan || 'free');
      }
    } catch (error) {
      console.error('❌ Subscription sync error:', error);
    }
  };

  // Sync au changement de page
  useEffect(() => {
    if (user) {
      console.log('📍 Page change detected, syncing subscription...');
      syncSubscription();
    }
  }, [pathname, user]);

  // Sync périodique (toutes les 60 secondes)
  useEffect(() => {
    if (!user) return;

    // Sync initiale
    syncSubscription();

    // Setup interval pour sync périodique
    syncIntervalRef.current = setInterval(() => {
      console.log('⏰ Periodic subscription sync...');
      syncSubscription();
    }, SYNC_INTERVAL);

    // Cleanup
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [user]);

  // Sync quand la fenêtre redevient active
  useEffect(() => {
    const handleFocus = () => {
      console.log('👀 Window focused, syncing subscription...');
      syncSubscription();
    };

    window.addEventListener('focus', handleFocus);
    
    // Sync quand on revient d'un autre onglet
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('👁️ Tab visible, syncing subscription...');
        syncSubscription();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  return { syncSubscription };
}