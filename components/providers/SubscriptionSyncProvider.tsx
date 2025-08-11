'use client';

import { useSubscriptionSync } from '@/lib/hooks/useSubscriptionSync';

export function SubscriptionSyncProvider({ children }: { children: React.ReactNode }) {
  // Le hook s'occupe de tout automatiquement
  useSubscriptionSync();
  
  return <>{children}</>;
}