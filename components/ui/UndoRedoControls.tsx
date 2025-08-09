import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UndoRedoState } from '@/lib/hooks/useUndoRedo';
import { Undo2, Redo2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UndoRedoControlsProps {
  undoRedoState: UndoRedoState<unknown>;
  className?: string;
  showBadge?: boolean;
  showClearButton?: boolean;
}

export function UndoRedoControls({ 
  undoRedoState, 
  className,
  showBadge = true,
  showClearButton = false 
}: UndoRedoControlsProps) {
  const { canUndo, canRedo, undo, redo, clear, currentIndex, historyLength } = undoRedoState;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Undo Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={undo}
        disabled={!canUndo}
        className="flex items-center gap-1"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
        <span className="hidden sm:inline">Undo</span>
      </Button>

      {/* Redo Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={redo}
        disabled={!canRedo}
        className="flex items-center gap-1"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="w-4 h-4" />
        <span className="hidden sm:inline">Redo</span>
      </Button>

      {/* History Badge */}
      {showBadge && historyLength > 1 && (
        <Badge variant="default" outline={true} size="sm" className="text-xs">
          {currentIndex + 1}/{historyLength}
        </Badge>
      )}

      {/* Clear History Button */}
      {showClearButton && historyLength > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clear}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
          title="Clear History"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}