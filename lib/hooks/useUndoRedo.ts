import { useCallback, useRef, useState, useMemo } from 'react';

export interface UndoRedoState<T> {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  execute: (newState: T) => void;
  clear: () => void;
  currentIndex: number;
  historyLength: number;
}

interface UseUndoRedoOptions {
  maxHistorySize?: number;
  debounceMs?: number;
}

export function useUndoRedo<T>(
  initialState: T,
  options: UseUndoRedoOptions = {}
): [T, UndoRedoState<T>] {
  const { maxHistorySize = 50, debounceMs = 500 } = options;
  
  const [currentState, setCurrentState] = useState<T>(initialState);
  const historyRef = useRef<T[]>([initialState]);
  const currentIndexRef = useRef(0);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const pendingStateRef = useRef<T | null>(null);

  const [, forceUpdate] = useState({});
  const triggerUpdate = () => forceUpdate({});

  // Execute a new action (with debouncing)
  const execute = useCallback((newState: T) => {
    // Clear any pending debounced state
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Store the pending state
    pendingStateRef.current = newState;
    setCurrentState(newState);

    // Debounce the history update
    debounceTimerRef.current = setTimeout(() => {
      if (pendingStateRef.current) {
        const stateToAdd = pendingStateRef.current;
        pendingStateRef.current = null;

        // Remove any redo history after current index
        const newHistory = historyRef.current.slice(0, currentIndexRef.current + 1);
        
        // Add the new state
        newHistory.push(stateToAdd);
        
        // Limit history size
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
        } else {
          currentIndexRef.current++;
        }
        
        historyRef.current = newHistory;
        triggerUpdate();
      }
    }, debounceMs);
  }, [maxHistorySize, debounceMs]);

  // Undo the last action
  const undo = useCallback(() => {
    if (currentIndexRef.current > 0) {
      // Clear any pending debounced state
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        pendingStateRef.current = null;
      }

      currentIndexRef.current--;
      const previousState = historyRef.current[currentIndexRef.current];
      setCurrentState(previousState);
      triggerUpdate();
    }
  }, []);

  // Redo the next action
  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      // Clear any pending debounced state
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        pendingStateRef.current = null;
      }

      currentIndexRef.current++;
      const nextState = historyRef.current[currentIndexRef.current];
      setCurrentState(nextState);
      triggerUpdate();
    }
  }, []);

  // Clear history
  const clear = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      pendingStateRef.current = null;
    }
    
    historyRef.current = [currentState];
    currentIndexRef.current = 0;
    triggerUpdate();
  }, [currentState]);

  // Computed properties (stable references)
  const canUndo = currentIndexRef.current > 0;
  const canRedo = currentIndexRef.current < historyRef.current.length - 1;

  return [
    currentState,
    {
      canUndo,
      canRedo,
      undo,
      redo,
      execute,
      clear,
      currentIndex: currentIndexRef.current,
      historyLength: historyRef.current.length
    }
  ];
}