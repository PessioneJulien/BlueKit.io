import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
  preventDefault?: boolean;
}

interface UseStableKeyboardShortcutsOptions {
  enabled?: boolean;
}

export function useStableKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseStableKeyboardShortcutsOptions = {}
) {
  const { enabled = true } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs
    const activeElement = document.activeElement;
    if (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      activeElement?.getAttribute('contenteditable') === 'true'
    ) {
      return;
    }

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const altMatches = !!shortcut.altKey === event.altKey;
      const metaMatches = !!shortcut.metaKey === event.metaKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.callback();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

// Predefined shortcuts
export const createStableUndoRedoShortcuts = (
  undo: () => void,
  redo: () => void,
  canUndo: boolean,
  canRedo: boolean
): KeyboardShortcut[] => [
  {
    key: 'z',
    ctrlKey: true,
    callback: () => {
      if (canUndo) undo();
    }
  },
  {
    key: 'y',
    ctrlKey: true,
    callback: () => {
      if (canRedo) redo();
    }
  },
  {
    key: 'z',
    ctrlKey: true,
    shiftKey: true,
    callback: () => {
      if (canRedo) redo();
    }
  }
];

export const createStableSaveShortcuts = (
  save: () => void,
  canSave: boolean = true
): KeyboardShortcut[] => [
  {
    key: 's',
    ctrlKey: true,
    callback: () => {
      if (canSave) save();
    }
  }
];