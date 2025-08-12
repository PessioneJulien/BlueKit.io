/**
 * Enhanced Auto-Save Hook
 * 
 * Integrates with the new AutoSaveService for robust auto-saving functionality
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { autoSaveService, SaveStatus, AutoSaveEvent } from '@/lib/services/autoSaveService';
import { CanvasState } from '@/lib/services/historyManager';
import { useUserStore } from '@/lib/stores/userStore';

export interface UseEnhancedAutoSaveOptions {
  key?: string;
  enabled?: boolean;
  debounceMs?: number;
  onSave?: (success: boolean, error?: string) => void;
  onRestore?: (state: CanvasState) => void;
  onConflict?: (localState: CanvasState, remoteState: CanvasState) => CanvasState;
}

export interface EnhancedAutoSaveResult {
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  autoSave: (state: CanvasState, force?: boolean) => Promise<void>;
  loadSave: () => Promise<CanvasState | null>;
  clearSave: () => Promise<void>;
  hasAutoSave: boolean;
  isInitialized: boolean;
}

export function useEnhancedAutoSave(
  options: UseEnhancedAutoSaveOptions = {}
): EnhancedAutoSaveResult {
  const { user } = useUserStore();
  const {
    key = 'visual_stack_builder',
    enabled = true,
    onSave,
    onRestore,
    onConflict
  } = options;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasAutoSave, setHasAutoSave] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const userRef = useRef(user);
  const onSaveRef = useRef(onSave);
  const onRestoreRef = useRef(onRestore);
  const onConflictRef = useRef(onConflict);
  const eventListenerRef = useRef<(() => void) | null>(null);

  // Update refs
  useEffect(() => {
    userRef.current = user;
    onSaveRef.current = onSave;
    onRestoreRef.current = onRestore;
    onConflictRef.current = onConflict;
  });

  // Initialize auto-save service
  useEffect(() => {
    if (!enabled) return;

    const initializeService = async () => {
      try {
        await autoSaveService.initialize(user?.id);
        setIsInitialized(true);

        // Check for existing saves
        setHasAutoSave(autoSaveService.hasLocalSave());

        // Update status from service
        const status = autoSaveService.getSaveStatus();
        setSaveStatus(status.status);
        setLastSaved(status.lastSaved);
        setHasUnsavedChanges(status.hasUnsavedChanges);

        console.log('🔄 Enhanced auto-save initialized for:', key);
      } catch (error) {
        console.error('Failed to initialize auto-save service:', error);
        setSaveStatus('error');
      }
    };

    initializeService();
  }, [enabled, user?.id, key]);

  // Set up event listener
  useEffect(() => {
    if (!enabled || !isInitialized) return;

    const handleAutoSaveEvent = (event: AutoSaveEvent) => {
      switch (event.type) {
        case 'save_start':
          setSaveStatus('saving');
          setHasUnsavedChanges(true);
          break;

        case 'save_success':
          setSaveStatus('saved');
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
          if (onSaveRef.current) {
            onSaveRef.current(true);
          }
          break;

        case 'save_error':
          setSaveStatus('error');
          setHasUnsavedChanges(true);
          if (onSaveRef.current) {
            onSaveRef.current(false, event.error);
          }
          break;

        case 'restore_available':
          setHasAutoSave(true);
          break;

        case 'conflict_detected':
          setSaveStatus('conflict');
          // Handle conflict resolution if callback provided
          if (onConflictRef.current && event.data) {
            const { localSave, remoteSave } = event.data as {
              localSave: { canvasState: CanvasState };
              remoteSave: { canvasState: CanvasState };
            };
            const resolved = onConflictRef.current(
              localSave.canvasState,
              remoteSave.canvasState
            );
            // Auto-save the resolved state
            autoSaveService.autoSave(resolved, true);
          }
          break;
      }
    };

    eventListenerRef.current = autoSaveService.addEventListener(handleAutoSaveEvent);

    return () => {
      if (eventListenerRef.current) {
        eventListenerRef.current();
        eventListenerRef.current = null;
      }
    };
  }, [enabled, isInitialized]);

  // Auto-save function
  const autoSave = useCallback(async (state: CanvasState, force = false) => {
    if (!enabled || !isInitialized) return;

    try {
      await autoSaveService.autoSave(state, force);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
    }
  }, [enabled, isInitialized]);

  // Load save function
  const loadSave = useCallback(async (): Promise<CanvasState | null> => {
    if (!enabled || !isInitialized) return null;

    try {
      const state = await autoSaveService.loadSave();
      if (state && onRestoreRef.current) {
        onRestoreRef.current(state);
      }
      return state;
    } catch (error) {
      console.error('Load save failed:', error);
      setSaveStatus('error');
      return null;
    }
  }, [enabled, isInitialized]);

  // Clear save function
  const clearSave = useCallback(async () => {
    if (!enabled || !isInitialized) return;

    try {
      await autoSaveService.clearSave();
      setHasAutoSave(false);
      setSaveStatus('idle');
      setLastSaved(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Clear save failed:', error);
      setSaveStatus('error');
    }
  }, [enabled, isInitialized]);

  // Update unsaved changes when save status changes
  useEffect(() => {
    if (saveStatus === 'saved') {
      setHasUnsavedChanges(false);
    } else if (saveStatus === 'saving' || saveStatus === 'error') {
      setHasUnsavedChanges(true);
    }
  }, [saveStatus]);

  return {
    saveStatus,
    lastSaved,
    hasUnsavedChanges,
    autoSave,
    loadSave,
    clearSave,
    hasAutoSave,
    isInitialized
  };
}