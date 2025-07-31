'use client'

import { useEffect, useState } from 'react'

/**
 * Hook pour éviter les erreurs d'hydratation avec localStorage/Zustand
 * Retourne false pendant le SSR et true après l'hydratation client
 */
export function useHydration() {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    setHasHydrated(true)
  }, [])

  return hasHydrated
}