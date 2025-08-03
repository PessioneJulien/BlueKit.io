import { useCallback, useRef, useEffect } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseStableAutoSaveOptions {
  key: string;
  delay?: number;
  maxAge?: number;
}

interface SavedData {
  stackName: string;
  stackDescription: string;
  nodes: unknown[];
  connections: unknown[];
  lastSaved: number;
}

export function useStableAutoSave(options: UseStableAutoSaveOptions) {
  const { key, delay = 3000, maxAge = 7 * 24 * 60 * 60 * 1000 } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<string>('');
  const storageKey = `autosave_${key}`;

  // Sauvegarde simple dans localStorage
  const saveToStorage = useCallback((data: Omit<SavedData, 'lastSaved'>) => {
    try {
      const dataString = JSON.stringify(data);
      
      // Ne sauvegarder que si les données ont changé
      if (dataString === lastDataRef.current) {
        return false;
      }
      
      const saveData: SavedData = {
        ...data,
        lastSaved: Date.now()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      lastDataRef.current = dataString;
      console.log('📝 Auto-saved:', key);
      return true;
    } catch (error) {
      console.error('Failed to auto-save:', error);
      return false;
    }
  }, [key, storageKey]);

  // Fonction de sauvegarde avec debounce
  const autoSave = useCallback((data: Omit<SavedData, 'lastSaved'>) => {
    // Skip si pas de données significatives
    if (!data.stackName.trim() && data.nodes.length === 0) {
      return;
    }

    // Clear timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce la sauvegarde
    timeoutRef.current = setTimeout(() => {
      saveToStorage(data);
    }, delay);
  }, [delay, saveToStorage]);

  // Charger depuis localStorage
  const loadAutoSave = useCallback((): SavedData | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;

      const data: SavedData = JSON.parse(saved);
      
      // Vérifier l'expiration
      if (Date.now() - data.lastSaved > maxAge) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to load auto-save:', error);
      return null;
    }
  }, [storageKey, maxAge]);

  // Clear auto-save
  const clearAutoSave = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      lastDataRef.current = '';
      console.log('🗑️ Cleared auto-save:', key);
    } catch (error) {
      console.error('Failed to clear auto-save:', error);
    }
  }, [storageKey, key]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    autoSave,
    loadAutoSave,
    clearAutoSave,
    hasAutoSave: () => {
      try {
        return !!localStorage.getItem(storageKey);
      } catch {
        return false;
      }
    }
  };
}