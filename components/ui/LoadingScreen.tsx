'use client'

import { Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  className?: string
}

export function LoadingScreen({ message = "Loading...", className }: LoadingScreenProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-slate-900 ${className}`}>
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-slate-400 text-sm">{message}</p>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }
  
  return (
    <Loader2 className={`animate-spin text-blue-500 ${sizeClasses[size]} ${className}`} />
  )
}