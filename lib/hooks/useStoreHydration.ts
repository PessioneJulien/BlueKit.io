'use client'

import { useEffect } from 'react'
import { useStackStore } from '@/lib/stores/stackStore'
import { useUserStore } from '@/lib/stores/userStore'

/**
 * Hook pour gérer l'hydratation des stores Zustand
 * Évite les erreurs de mismatch entre SSR et client
 */
export function useStoreHydration() {
  const stackStoreHydrated = useStackStore((state) => state._hasHydrated)
  const userStoreHydrated = useUserStore((state) => state._hasHydrated)
  
  useEffect(() => {
    // Force l'hydratation si elle n'a pas encore eu lieu
    if (!stackStoreHydrated) {
      useStackStore.persist.rehydrate()
    }
    if (!userStoreHydrated) {
      useUserStore.persist.rehydrate()
    }
  }, [stackStoreHydrated, userStoreHydrated])

  return stackStoreHydrated && userStoreHydrated
}