import { useCallback, useEffect, useRef, useState } from 'react';
import { useUserStore } from '@/lib/stores/userStore';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AutoSaveData {
  stackName: string;
  stackDescription: string;
  nodes: any[];
  connections: any[];
  lastSaved: number;
}

interface UseAutoSaveOptions {
  key: string; // Clé pour le localStorage
  delay?: number; // Délai de debounce en ms (défaut: 2000ms)
  maxAge?: number; // Durée max en ms avant expiration (défaut: 7 jours)
  onSave?: (data: AutoSaveData) => Promise<void>; // Callback optionnel pour sauvegarde serveur
}

export function useAutoSave(options: UseAutoSaveOptions) {
  const { key, delay = 2000, maxAge = 7 * 24 * 60 * 60 * 1000, onSave } = options;
  const { user } = useUserStore();
  
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isInitialLoad = useRef(true);
  const onSaveRef = useRef(onSave);
  const userRef = useRef(user);
  
  // Update refs
  useEffect(() => {
    onSaveRef.current = onSave;
    userRef.current = user;
  });

  // Générer la clé unique par utilisateur
  const storageKey = user ? `autosave_${key}_${user.id}` : `autosave_${key}_anonymous`;

  // Sauvegarder dans le localStorage
  const saveToLocalStorage = useCallback((data: AutoSaveData) => {
    try {
      const saveData = {
        ...data,
        lastSaved: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      setSaveStatus('saved');
      setLastSaved(new Date());
      console.log('🔄 Auto-saved to localStorage:', key);
    } catch (error) {
      console.error('Failed to auto-save to localStorage:', error);
      setSaveStatus('error');
    }
  }, [storageKey, key]);

  // Charger depuis le localStorage
  const loadFromLocalStorage = useCallback((): AutoSaveData | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;

      const data: AutoSaveData = JSON.parse(saved);
      
      // Vérifier l'expiration
      if (Date.now() - data.lastSaved > maxAge) {
        localStorage.removeItem(storageKey);
        return null;
      }

      setLastSaved(new Date(data.lastSaved));
      console.log('📂 Loaded auto-saved data:', key);
      return data;
    } catch (error) {
      console.error('Failed to load auto-saved data:', error);
      return null;
    }
  }, [storageKey, maxAge, key]);

  // Supprimer les données sauvegardées
  const clearAutoSave = useCallback(() => {
    localStorage.removeItem(storageKey);
    setLastSaved(null);
    setSaveStatus('idle');
    console.log('🗑️ Cleared auto-save data:', key);
  }, [storageKey, key]);

  // Référence pour la dernière donnée sauvegardée
  const lastSavedDataRef = useRef<string>('');

  // Auto-save avec debounce
  const autoSave = useCallback((data: Omit<AutoSaveData, 'lastSaved'>) => {
    // Ignorer le premier appel (chargement initial)
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Comparer avec la dernière sauvegarde pour éviter les sauvegardes inutiles
    const dataString = JSON.stringify(data);
    if (dataString === lastSavedDataRef.current) {
      return; // Pas de changement, pas de sauvegarde
    }

    // Annuler le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Ne pas changer l'état à 'saving' immédiatement pour éviter les re-renders
    // setSaveStatus('saving');

    // Debounce la sauvegarde
    timeoutRef.current = setTimeout(async () => {
      // Mettre l'état en 'saving' seulement quand on sauvegarde vraiment
      setSaveStatus('saving');
      
      const saveData: AutoSaveData = {
        ...data,
        lastSaved: Date.now()
      };

      // Mettre à jour la référence
      lastSavedDataRef.current = dataString;

      // Sauvegarder en local
      saveToLocalStorage(saveData);

      // Sauvegarder sur le serveur si callback fourni et utilisateur connecté
      if (onSaveRef.current && userRef.current) {
        try {
          await onSaveRef.current(saveData);
          console.log('☁️ Auto-saved to server:', key);
        } catch (error) {
          console.error('Failed to auto-save to server:', error);
          // La sauvegarde locale a réussi, donc on garde le statut 'saved'
        }
      }
    }, delay);
  }, [delay, saveToLocalStorage]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Vérifier les anciennes sauvegardes au montage
  useEffect(() => {
    // Nettoyer les anciennes sauvegardes expirées
    const cleanupOldSaves = () => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('autosave_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.lastSaved && Date.now() - data.lastSaved > maxAge) {
              localStorage.removeItem(key);
              console.log('🧹 Cleaned up expired auto-save:', key);
            }
          } catch (error) {
            // Supprimer les données corrompues
            localStorage.removeItem(key);
          }
        }
      });
    };

    cleanupOldSaves();
  }, [maxAge]);

  return {
    saveStatus,
    lastSaved,
    autoSave,
    loadFromLocalStorage,
    clearAutoSave,
    hasAutoSave: () => !!localStorage.getItem(storageKey)
  };
}