'use client'

import { useEffect, useState } from 'react'

interface HydrationProviderProps {
  children: React.ReactNode
}

/**
 * Provider qui empêche le rendu jusqu'à ce que l'hydratation soit complète
 * Évite les erreurs de mismatch entre SSR et client-side
 */
export function HydrationProvider({ children }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Pendant le SSR et avant l'hydratation, on affiche un placeholder
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <>{children}</>
}