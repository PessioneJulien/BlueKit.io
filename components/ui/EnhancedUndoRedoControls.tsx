/**
 * Enhanced Undo/Redo Controls Component
 * 
 * Advanced undo/redo interface with history visualization and navigation
 */

import { useState } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { 
  Undo2, 
  Redo2, 
  RotateCcw, 
  History, 
  Clock,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedHistoryResult } from '@/lib/hooks/useEnhancedHistory';

interface EnhancedUndoRedoControlsProps {
  historyState: Pick<EnhancedHistoryResult, 
    'canUndo' | 'canRedo' | 'undo' | 'redo' | 'clearHistory' | 'jumpToIndex' | 
    'currentIndex' | 'totalEntries' | 'lastAction' | 'memoryUsage' | 'getDetailedHistory'
  >;
  className?: string;
  variant?: 'compact' | 'detailed' | 'minimal';
  showBadge?: boolean;
  showClearButton?: boolean;
  showHistoryPanel?: boolean;
  showMemoryUsage?: boolean;
}

export function EnhancedUndoRedoControls({ 
  historyState,
  className,
  variant = 'compact',
  showBadge = true,
  showClearButton = false,
  showHistoryPanel = false,
  showMemoryUsage = false
}: EnhancedUndoRedoControlsProps) {
  const [showHistory, setShowHistory] = useState(false);
  
  const { 
    canUndo, 
    canRedo, 
    undo, 
    redo, 
    clearHistory,
    jumpToIndex,
    currentIndex, 
    totalEntries, 
    lastAction,
    memoryUsage,
    getDetailedHistory
  } = historyState;

  const detailedHistory = getDetailedHistory();

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-2"
        >
          <Undo2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-2"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {/* Undo Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          className={cn(
            'flex items-center gap-2 transition-all duration-200',
            canUndo ? 'hover:bg-blue-500/10 hover:text-blue-400' : ''
          )}
          title={`Undo${lastAction ? `: ${lastAction}` : ''} (Ctrl+Z)`}
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
          className={cn(
            'flex items-center gap-2 transition-all duration-200',
            canRedo ? 'hover:bg-blue-500/10 hover:text-blue-400' : ''
          )}
          title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
          <span className="hidden sm:inline">Redo</span>
        </Button>

        {/* History Badge */}
        {showBadge && totalEntries > 1 && (
          <Badge 
            variant="default" 
            outline={true} 
            size="sm" 
            className="text-xs cursor-pointer hover:bg-slate-700"
            onClick={() => setShowHistory(!showHistory)}
            title="View history"
          >
            {currentIndex + 1}/{totalEntries}
          </Badge>
        )}

        {/* History Panel Toggle */}
        {showHistoryPanel && totalEntries > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
            title="Toggle history panel"
          >
            <History className="w-4 h-4" />
            <ChevronDown className={cn(
              'w-3 h-3 transition-transform duration-200',
              showHistory ? 'rotate-180' : ''
            )} />
          </Button>
        )}

        {/* Clear History Button */}
        {showClearButton && totalEntries > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="flex items-center gap-1 text-slate-400 hover:text-red-400"
            title="Clear all history"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 z-50"
            >
              <HistoryPanel
                history={detailedHistory}
                currentIndex={currentIndex}
                onJumpToIndex={jumpToIndex}
                onClear={clearHistory}
                memoryUsage={showMemoryUsage ? memoryUsage : undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Detailed variant
  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="w-4 h-4" />
          History & Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Main controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="flex items-center gap-2"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="flex items-center gap-2"
          >
            <Redo2 className="w-4 h-4" />
            Redo
          </Button>

          <div className="flex-1" />

          <Badge variant="default" size="sm">
            {currentIndex + 1}/{totalEntries}
          </Badge>
        </div>

        {/* Last action info */}
        {lastAction && (
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Last: {lastAction}</span>
          </div>
        )}

        {/* Memory usage */}
        {showMemoryUsage && (
          <div className="text-xs text-slate-500">
            Memory: {formatBytes(memoryUsage)}
          </div>
        )}

        {/* History list */}
        {showHistoryPanel && (
          <HistoryPanel
            history={detailedHistory}
            currentIndex={currentIndex}
            onJumpToIndex={jumpToIndex}
            onClear={clearHistory}
            embedded={true}
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-xs"
          >
            <MoreHorizontal className="w-3 h-3" />
            {showHistory ? 'Hide' : 'Show'} History
          </Button>

          {showClearButton && totalEntries > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400"
            >
              <RotateCcw className="w-3 h-3" />
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// History Panel Component
interface HistoryPanelProps {
  history: ReturnType<EnhancedHistoryResult['getDetailedHistory']>;
  currentIndex: number;
  onJumpToIndex: (index: number) => void;
  onClear: () => void;
  embedded?: boolean;
  memoryUsage?: number;
}

function HistoryPanel({
  history,
  currentIndex,
  onJumpToIndex,
  onClear,
  embedded = false,
  memoryUsage
}: HistoryPanelProps) {
  const containerClass = embedded 
    ? 'space-y-2' 
    : 'bg-slate-800 border border-slate-700 rounded-lg p-3 w-64 max-h-64 overflow-y-auto';

  return (
    <div className={containerClass}>
      {!embedded && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Action History</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-red-400"
          >
            Clear
          </Button>
        </div>
      )}

      <div className="space-y-1">
        {history.slice().reverse().map((item, reverseIndex) => {
          const actualIndex = history.length - 1 - reverseIndex;
          const isCurrent = item.isCurrent;
          
          return (
            <motion.button
              key={item.entry.id}
              onClick={() => onJumpToIndex(actualIndex)}
              className={cn(
                'w-full text-left p-2 rounded text-xs transition-all duration-200',
                isCurrent 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'hover:bg-slate-700 text-slate-300',
                actualIndex > currentIndex ? 'opacity-50' : ''
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">
                  {item.entry.actionDescription}
                </span>
                <span className="text-slate-500 ml-2">
                  {item.timeSinceAction}
                </span>
              </div>
              {item.entry.metadata?.nodeName && (
                <div className="text-slate-400 mt-1">
                  {item.entry.metadata.nodeName}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {memoryUsage !== undefined && (
        <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700/50">
          Memory: {formatBytes(memoryUsage)}
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}