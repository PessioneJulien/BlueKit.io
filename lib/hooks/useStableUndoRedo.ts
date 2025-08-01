import { useCallback, useRef, useState } from 'react';

export interface StableUndoRedoState<T> {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  push: (newState: T) => void;
  clear: () => void;
  currentIndex: number;
  historyLength: number;
}

interface UseStableUndoRedoOptions {
  maxHistorySize?: number;
  debounceMs?: number;
}

export function useStableUndoRedo<T>(
  initialState: T,
  options: UseStableUndoRedoOptions = {}
): [T, StableUndoRedoState<T>] {
  const { maxHistorySize = 50, debounceMs = 1000 } = options;
  
  const [currentState, setCurrentState] = useState<T>(initialState);
  const historyRef = useRef<T[]>([initialState]);
  const currentIndexRef = useRef(0);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const [triggerCount, setTriggerCount] = useState(0);

  // Force re-render
  const forceUpdate = useCallback(() => {
    setTriggerCount(prev => prev + 1);
  }, []);

  // Push new state to history
  const push = useCallback((newState: T) => {
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Update current state immediately
    setCurrentState(newState);

    // Debounce history update
    debounceTimerRef.current = setTimeout(() => {
      // Remove any redo history after current index
      const newHistory = historyRef.current.slice(0, currentIndexRef.current + 1);
      
      // Add the new state
      newHistory.push(newState);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      } else {
        currentIndexRef.current++;
      }
      
      historyRef.current = newHistory;
      forceUpdate();
    }, debounceMs);
  }, [maxHistorySize, debounceMs, forceUpdate]);

  // Undo
  const undo = useCallback(() => {
    if (currentIndexRef.current > 0) {
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      currentIndexRef.current--;
      const previousState = historyRef.current[currentIndexRef.current];
      setCurrentState(previousState);
      forceUpdate();
    }
  }, [forceUpdate]);

  // Redo
  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      currentIndexRef.current++;
      const nextState = historyRef.current[currentIndexRef.current];
      setCurrentState(nextState);
      forceUpdate();
    }
  }, [forceUpdate]);

  // Clear history
  const clear = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    historyRef.current = [currentState];
    currentIndexRef.current = 0;
    forceUpdate();
  }, [currentState, forceUpdate]);

  const undoRedoState: StableUndoRedoState<T> = {
    canUndo: currentIndexRef.current > 0,
    canRedo: currentIndexRef.current < historyRef.current.length - 1,
    undo,
    redo,
    push,
    clear,
    currentIndex: currentIndexRef.current,
    historyLength: historyRef.current.length
  };

  return [currentState, undoRedoState];
}