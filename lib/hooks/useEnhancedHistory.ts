/**
 * Enhanced History Hook
 * 
 * Integrates with the HistoryManager service for advanced undo/redo functionality
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { historyManager, CanvasState, ActionType, HistoryEntry } from '@/lib/services/historyManager';

export interface UseEnhancedHistoryOptions {
  maxHistorySize?: number;
  debounceMs?: number;
  enabled?: boolean;
  onHistoryChange?: (summary: ReturnType<typeof historyManager.getHistorySummary>) => void;
}

export interface EnhancedHistoryResult {
  // Current state
  currentState: CanvasState | null;
  
  // History operations
  undo: () => CanvasState | null;
  redo: () => CanvasState | null;
  addToHistory: (state: CanvasState, actionType?: ActionType, metadata?: HistoryEntry['metadata']) => void;
  jumpToIndex: (index: number) => CanvasState | null;
  clearHistory: () => void;
  
  // History status
  canUndo: boolean;
  canRedo: boolean;
  currentIndex: number;
  totalEntries: number;
  lastAction?: string;
  memoryUsage: number;
  
  // Advanced features
  getDetailedHistory: () => ReturnType<typeof historyManager.getDetailedHistory>;
  isEnabled: boolean;
}

export function useEnhancedHistory(
  initialState: CanvasState,
  options: UseEnhancedHistoryOptions = {}
): EnhancedHistoryResult {
  const {
    enabled = true,
    onHistoryChange
  } = options;

  // State for forcing re-renders
  const [, forceUpdate] = useState({});
  const [currentState, setCurrentState] = useState<CanvasState | null>(initialState);

  // Refs for stable callbacks
  const onHistoryChangeRef = useRef(onHistoryChange);
  const isInitialized = useRef(false);

  // Update refs
  useEffect(() => {
    onHistoryChangeRef.current = onHistoryChange;
  });

  // Initialize history manager
  useEffect(() => {
    if (!enabled || isInitialized.current) return;

    // Configure history manager
    historyManager.clearHistory();
    if (initialState) {
      historyManager.addState(initialState, 'unknown');
      setCurrentState(initialState);
    }

    isInitialized.current = true;
    console.log('📚 Enhanced history initialized');
  }, [enabled, initialState]);

  // Force component update when history changes
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
    
    // Notify about history changes
    if (onHistoryChangeRef.current) {
      const summary = historyManager.getHistorySummary();
      onHistoryChangeRef.current(summary);
    }
  }, []);

  // Add state to history
  const addToHistory = useCallback((
    state: CanvasState,
    actionType: ActionType = 'unknown',
    metadata?: HistoryEntry['metadata']
  ) => {
    if (!enabled) return;

    historyManager.addState(state, actionType, metadata);
    setCurrentState(state);
    triggerUpdate();
  }, [enabled, triggerUpdate]);

  // Undo operation
  const undo = useCallback((): CanvasState | null => {
    if (!enabled || !historyManager.canUndo()) return null;

    const previousState = historyManager.undo();
    setCurrentState(previousState);
    triggerUpdate();
    
    return previousState;
  }, [enabled, triggerUpdate]);

  // Redo operation
  const redo = useCallback((): CanvasState | null => {
    if (!enabled || !historyManager.canRedo()) return null;

    const nextState = historyManager.redo();
    setCurrentState(nextState);
    triggerUpdate();
    
    return nextState;
  }, [enabled, triggerUpdate]);

  // Jump to specific history index
  const jumpToIndex = useCallback((index: number): CanvasState | null => {
    if (!enabled) return null;

    const state = historyManager.jumpToIndex(index);
    if (state) {
      setCurrentState(state);
      triggerUpdate();
    }
    
    return state;
  }, [enabled, triggerUpdate]);

  // Clear history
  const clearHistory = useCallback(() => {
    if (!enabled) return;

    historyManager.clearHistory();
    if (currentState) {
      historyManager.addState(currentState, 'clear_all');
    }
    triggerUpdate();
  }, [enabled, currentState, triggerUpdate]);

  // Get detailed history
  const getDetailedHistory = useCallback(() => {
    return historyManager.getDetailedHistory();
  }, []);

  // Get current summary
  const summary = historyManager.getHistorySummary();

  return {
    // Current state
    currentState,
    
    // History operations
    undo,
    redo,
    addToHistory,
    jumpToIndex,
    clearHistory,
    
    // History status
    canUndo: summary.canUndo,
    canRedo: summary.canRedo,
    currentIndex: summary.currentIndex,
    totalEntries: summary.totalEntries,
    lastAction: summary.lastAction,
    memoryUsage: summary.memoryUsage,
    
    // Advanced features
    getDetailedHistory,
    isEnabled: enabled
  };
}