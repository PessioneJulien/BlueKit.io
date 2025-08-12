/**
 * Unified Stack Builder Hook
 * 
 * Combines auto-save, history management, and keyboard shortcuts
 * for a complete stack building experience
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEnhancedAutoSave, UseEnhancedAutoSaveOptions } from './useEnhancedAutoSave';
import { useEnhancedHistory, UseEnhancedHistoryOptions } from './useEnhancedHistory';
import { useKeyboardShortcuts, createUndoRedoShortcuts, createSaveShortcuts } from './useKeyboardShortcuts';
import { CanvasState, ActionType, HistoryEntry } from '@/lib/services/historyManager';
import { SaveStatus } from '@/lib/services/autoSaveService';

export interface UseStackBuilderOptions {
  autoSave?: UseEnhancedAutoSaveOptions;
  history?: UseEnhancedHistoryOptions;
  enableKeyboardShortcuts?: boolean;
  onStateChange?: (state: CanvasState) => void;
  onSaveStatusChange?: (status: SaveStatus, lastSaved: Date | null) => void;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

export interface StackBuilderResult {
  // Current state
  currentState: CanvasState | null;
  
  // State management
  updateState: (
    state: CanvasState, 
    actionType?: ActionType, 
    metadata?: HistoryEntry['metadata']
  ) => void;
  resetState: (newState: CanvasState) => void;
  
  // Auto-save
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  forceSave: () => Promise<void>;
  loadSave: () => Promise<void>;
  clearSave: () => Promise<void>;
  hasAutoSave: boolean;
  
  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyInfo: {
    currentIndex: number;
    totalEntries: number;
    lastAction?: string;
    memoryUsage: number;
  };
  jumpToHistoryIndex: (index: number) => void;
  clearHistory: () => void;
  getDetailedHistory: () => ReturnType<typeof useEnhancedHistory>['getDetailedHistory'];
  
  // Utilities
  isReady: boolean;
  hasChanges: boolean;
}

export function useStackBuilder(
  initialState: CanvasState,
  options: UseStackBuilderOptions = {}
): StackBuilderResult {
  const {
    autoSave: autoSaveOptions = {},
    history: historyOptions = {},
    enableKeyboardShortcuts = true,
    onStateChange,
    onSaveStatusChange,
    onHistoryChange
  } = options;

  // Internal state
  const [isReady, setIsReady] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Refs for stable callbacks
  const onStateChangeRef = useRef(onStateChange);
  const onSaveStatusChangeRef = useRef(onSaveStatusChange);
  const onHistoryChangeRef = useRef(onHistoryChange);
  const initialStateRef = useRef(initialState);
  const lastStateRef = useRef<CanvasState>(initialState);

  // Update refs
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
    onSaveStatusChangeRef.current = onSaveStatusChange;
    onHistoryChangeRef.current = onHistoryChange;
  });

  // Enhanced auto-save hook
  const autoSave = useEnhancedAutoSave({
    ...autoSaveOptions,
    onSave: (success, error) => {
      if (autoSaveOptions.onSave) {
        autoSaveOptions.onSave(success, error);
      }
    },
    onRestore: async (state) => {
      // When auto-save is restored, add to history and update state
      history.addToHistory(state, 'import');
      setHasChanges(true);
      
      if (autoSaveOptions.onRestore) {
        autoSaveOptions.onRestore(state);
      }
    }
  });

  // Enhanced history hook
  const history = useEnhancedHistory(initialState, {
    ...historyOptions,
    onHistoryChange: (summary) => {
      if (onHistoryChangeRef.current) {
        onHistoryChangeRef.current(summary.canUndo, summary.canRedo);
      }
      
      if (historyOptions.onHistoryChange) {
        historyOptions.onHistoryChange(summary);
      }
    }
  });

  // State update function
  const updateState = useCallback((
    newState: CanvasState,
    actionType: ActionType = 'unknown',
    metadata?: HistoryEntry['metadata']
  ) => {
    // Add to history first
    history.addToHistory(newState, actionType, metadata);
    
    // Auto-save the state
    autoSave.autoSave(newState);
    
    // Track changes
    setHasChanges(true);
    lastStateRef.current = newState;
    
    // Notify listeners
    if (onStateChangeRef.current) {
      onStateChangeRef.current(newState);
    }
  }, [history, autoSave]);

  // Reset state (for imports, templates, etc.)
  const resetState = useCallback((newState: CanvasState) => {
    // Clear history and start fresh
    history.clearHistory();
    history.addToHistory(newState, 'import');
    
    // Force save
    autoSave.autoSave(newState, true);
    
    // Reset change tracking
    setHasChanges(false);
    lastStateRef.current = newState;
    initialStateRef.current = newState;
    
    // Notify listeners
    if (onStateChangeRef.current) {
      onStateChangeRef.current(newState);
    }
  }, [history, autoSave]);

  // Enhanced undo with auto-save
  const undo = useCallback(() => {
    const previousState = history.undo();
    if (previousState) {
      // Auto-save the undo state
      autoSave.autoSave(previousState);
      lastStateRef.current = previousState;
      
      if (onStateChangeRef.current) {
        onStateChangeRef.current(previousState);
      }
    }
  }, [history, autoSave]);

  // Enhanced redo with auto-save
  const redo = useCallback(() => {
    const nextState = history.redo();
    if (nextState) {
      // Auto-save the redo state
      autoSave.autoSave(nextState);
      lastStateRef.current = nextState;
      
      if (onStateChangeRef.current) {
        onStateChangeRef.current(nextState);
      }
    }
  }, [history, autoSave]);

  // Force save function
  const forceSave = useCallback(async () => {
    if (history.currentState) {
      await autoSave.autoSave(history.currentState, true);
    }
  }, [history.currentState, autoSave]);

  // Load save function
  const loadSave = useCallback(async () => {
    const savedState = await autoSave.loadSave();
    if (savedState) {
      resetState(savedState);
    }
  }, [autoSave, resetState]);

  // Jump to history index
  const jumpToHistoryIndex = useCallback((index: number) => {
    const state = history.jumpToIndex(index);
    if (state) {
      autoSave.autoSave(state);
      lastStateRef.current = state;
      
      if (onStateChangeRef.current) {
        onStateChangeRef.current(state);
      }
    }
  }, [history, autoSave]);

  // Keyboard shortcuts
  const shortcuts = [
    ...createUndoRedoShortcuts(undo, redo, history.canUndo, history.canRedo),
    ...createSaveShortcuts(forceSave, true)
  ];

  useKeyboardShortcuts(shortcuts, {
    enabled: enableKeyboardShortcuts
  });

  // Initialize and check readiness
  useEffect(() => {
    const checkReadiness = async () => {
      // Wait for auto-save to initialize
      if (autoSave.isInitialized) {
        setIsReady(true);
        
        // Check if we have a saved state to restore
        if (autoSave.hasAutoSave) {
          // Don't auto-load, let user decide
          console.log('📁 Auto-saved state available for restoration');
        }
      }
    };

    checkReadiness();
  }, [autoSave.isInitialized, autoSave.hasAutoSave]);

  // Monitor save status changes
  useEffect(() => {
    if (onSaveStatusChangeRef.current) {
      onSaveStatusChangeRef.current(autoSave.saveStatus, autoSave.lastSaved);
    }
  }, [autoSave.saveStatus, autoSave.lastSaved]);

  // Track changes based on state comparison
  useEffect(() => {
    const currentState = history.currentState;
    if (currentState && initialStateRef.current) {
      const hasActualChanges = JSON.stringify(currentState) !== JSON.stringify(initialStateRef.current);
      setHasChanges(hasActualChanges);
    }
  }, [history.currentState]);

  return {
    // Current state
    currentState: history.currentState,
    
    // State management
    updateState,
    resetState,
    
    // Auto-save
    saveStatus: autoSave.saveStatus,
    lastSaved: autoSave.lastSaved,
    hasUnsavedChanges: autoSave.hasUnsavedChanges,
    forceSave,
    loadSave,
    clearSave: autoSave.clearSave,
    hasAutoSave: autoSave.hasAutoSave,
    
    // History
    undo,
    redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    historyInfo: {
      currentIndex: history.currentIndex,
      totalEntries: history.totalEntries,
      lastAction: history.lastAction,
      memoryUsage: history.memoryUsage
    },
    jumpToHistoryIndex,
    clearHistory: history.clearHistory,
    getDetailedHistory: history.getDetailedHistory,
    
    // Utilities
    isReady,
    hasChanges
  };
}