'use client'

import { useEffect } from 'react'
import { useStackStore } from '@/lib/stores/stackStore'
import { useUserStore } from '@/lib/stores/userStore'

/**
 * Provider qui initialise les stores Zustand côté client
 * Évite les erreurs d'hydratation en forçant la synchronisation
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force la rehydratation des stores au montage du composant
    useStackStore.persist.rehydrate()
    useUserStore.persist.rehydrate()
  }, [])

  return <>{children}</>
}