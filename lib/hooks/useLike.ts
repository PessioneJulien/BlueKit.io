'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUserStore } from '@/lib/stores/userStore';

interface LikeState {
  liked: boolean;
  likesCount: number;
  loading: boolean;
}

interface UseLikeReturn extends LikeState {
  toggleLike: () => Promise<void>;
  error: string | null;
}

export function useLike(componentId: string, initialLikesCount: number = 0): UseLikeReturn {
  const { user } = useUserStore();
  const [state, setState] = useState<LikeState>({
    liked: false,
    likesCount: initialLikesCount,
    loading: false
  });
  const [error, setError] = useState<string | null>(null);

  // Charger l'état initial du like
  const loadLikeStatus = useCallback(async () => {
    if (!componentId) return;
    
    try {
      const response = await fetch(`/api/community-components/${componentId}/like`);
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          liked: data.liked,
          likesCount: data.likesCount
        }));
      }
    } catch (err) {
      console.error('Failed to load like status:', err);
    }
  }, [componentId]);

  // Charger le statut au montage du composant
  useEffect(() => {
    loadLikeStatus();
  }, [loadLikeStatus]);

  const toggleLike = useCallback(async () => {
    if (!user) {
      setError('Vous devez être connecté pour liker un composant');
      return;
    }

    if (state.loading) return;

    setState(prev => ({ ...prev, loading: true }));
    setError(null);

    try {
      const response = await fetch(`/api/community-components/${componentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Vous devez être connecté pour liker un composant');
        }
        throw new Error('Erreur lors de la mise à jour du like');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        liked: data.liked,
        likesCount: data.likesCount,
        loading: false
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [componentId, user, state.loading]);

  return {
    ...state,
    toggleLike,
    error
  };
}