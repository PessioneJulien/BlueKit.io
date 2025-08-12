/**
 * Enhanced Auto-Save Restore Modal
 * 
 * Advanced modal for handling auto-save restoration with conflict resolution
 */

import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import { 
  Clock, 
  AlertTriangle, 
  FileText, 
  Download,
  Trash2,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CanvasState } from '@/lib/services/historyManager';
import { motion } from 'framer-motion';

interface SaveData {
  canvasState: CanvasState;
  lastSaved: Date;
  source: 'local' | 'cloud';
  size?: number;
  version?: number;
}

interface EnhancedAutoSaveRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  localSave?: SaveData | null;
  cloudSave?: SaveData | null;
  currentState?: CanvasState | null;
  onRestore: (state: CanvasState, source: 'local' | 'cloud') => void;
  onDiscard: (source?: 'local' | 'cloud' | 'all') => void;
  onPreview?: (state: CanvasState) => void;
  showConflictResolution?: boolean;
}

export function EnhancedAutoSaveRestoreModal({
  isOpen,
  onClose,
  localSave,
  cloudSave,
  currentState,
  onRestore,
  onDiscard,
  onPreview,
  showConflictResolution = true
}: EnhancedAutoSaveRestoreModalProps) {
  const [selectedSave, setSelectedSave] = useState<'local' | 'cloud' | null>(null);

  const hasConflict = localSave && cloudSave && 
    localSave.canvasState !== cloudSave.canvasState;

  const handleRestore = (save: SaveData) => {
    onRestore(save.canvasState, save.source);
    onClose();
  };

  const handleDiscard = (source?: 'local' | 'cloud' | 'all') => {
    onDiscard(source);
    if (source === 'all') {
      onClose();
    }
  };

  const handlePreview = (save: SaveData) => {
    if (onPreview) {
      onPreview(save.canvasState);
    }
  };

  const getMostRecent = (): SaveData | null => {
    if (!localSave && !cloudSave) return null;
    if (!localSave) return cloudSave;
    if (!cloudSave) return localSave;
    
    return localSave.lastSaved > cloudSave.lastSaved ? localSave : cloudSave;
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHour < 24) return `${diffHour} hours ago`;
    return `${diffDay} days ago`;
  };

  const formatSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStackSummary = (state: CanvasState): string => {
    const nodeCount = state.nodes.length;
    const connectionCount = state.connections.length;
    return `${nodeCount} components, ${connectionCount} connections`;
  };

  const mostRecent = getMostRecent();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restore Auto-Saved Stack"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Header Info */}
        {hasConflict ? (
          <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-400">Multiple saves detected</h3>
              <p className="text-sm text-orange-300/80 mt-1">
                We found both local and cloud saves. Choose which one to restore, or compare them first.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-400">Auto-save available</h3>
              <p className="text-sm text-blue-300/80 mt-1">
                We found a previously saved version of your stack. Would you like to restore it?
              </p>
            </div>
          </div>
        )}

        {/* Save Options */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Local Save */}
          {localSave && (
            <SaveCard
              save={localSave}
              isSelected={selectedSave === 'local'}
              onSelect={() => setSelectedSave('local')}
              onRestore={() => handleRestore(localSave)}
              onPreview={() => handlePreview(localSave)}
              onDiscard={() => handleDiscard('local')}
              getSummary={getStackSummary}
              formatTime={formatRelativeTime}
              formatSize={formatSize}
            />
          )}

          {/* Cloud Save */}
          {cloudSave && (
            <SaveCard
              save={cloudSave}
              isSelected={selectedSave === 'cloud'}
              onSelect={() => setSelectedSave('cloud')}
              onRestore={() => handleRestore(cloudSave)}
              onPreview={() => handlePreview(cloudSave)}
              onDiscard={() => handleDiscard('cloud')}
              getSummary={getStackSummary}
              formatTime={formatRelativeTime}
              formatSize={formatSize}
            />
          )}
        </div>

        {/* Current State Info */}
        {currentState && (
          <Card className="border-slate-600/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Current State
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                {getStackSummary(currentState)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Unsaved changes will be lost if you restore a previous version
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Quick restore most recent */}
          {mostRecent && !showConflictResolution && (
            <Button
              variant="default"
              onClick={() => handleRestore(mostRecent)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Restore Latest ({mostRecent.source})
            </Button>
          )}

          {/* Individual restore buttons when there's a conflict */}
          {hasConflict && showConflictResolution && (
            <>
              {localSave && (
                <Button
                  variant="outline"
                  onClick={() => handleRestore(localSave)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Restore Local Save
                </Button>
              )}
              {cloudSave && (
                <Button
                  variant="outline"
                  onClick={() => handleRestore(cloudSave)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Restore Cloud Save
                </Button>
              )}
            </>
          )}

          <div className="flex-1" />

          {/* Secondary actions */}
          <Button
            variant="ghost"
            onClick={() => handleDiscard('all')}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
            Discard All
          </Button>

          <Button
            variant="ghost"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </Button>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 p-4 bg-slate-800/50 rounded-lg">
          <p>💡 <strong>Tip:</strong> Auto-saves are created every few minutes while you work. 
          Local saves are stored in your browser, while cloud saves are synchronized across devices when you&apos;re logged in.</p>
        </div>
      </div>
    </Modal>
  );
}

// Save Card Component
interface SaveCardProps {
  save: SaveData;
  isSelected: boolean;
  onSelect: () => void;
  onRestore: () => void;
  onPreview: () => void;
  onDiscard: () => void;
  getSummary: (state: CanvasState) => string;
  formatTime: (date: Date) => string;
  formatSize: (size: number) => string;
}

function SaveCard({
  save,
  isSelected,
  onSelect,
  onRestore,
  onPreview,
  onDiscard,
  getSummary,
  formatTime,
  formatSize
}: SaveCardProps) {
  const isLocal = save.source === 'local';
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          'cursor-pointer transition-all duration-200',
          isSelected 
            ? 'border-blue-500/50 bg-blue-500/10' 
            : 'border-slate-700/50 hover:border-slate-600'
        )}
        onClick={onSelect}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              {isLocal ? (
                <div className="w-2 h-2 bg-green-400 rounded-full" />
              ) : (
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
              )}
              {isLocal ? 'Local Save' : 'Cloud Save'}
            </CardTitle>
            <Badge variant={isLocal ? 'default' : 'secondary'} size="sm">
              {isLocal ? 'Browser' : 'Synced'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Save info */}
          <div>
            <div className="text-sm font-medium">
              {save.canvasState.name || 'Unnamed Stack'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {getSummary(save.canvasState)}
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>{formatTime(save.lastSaved)}</span>
          </div>

          {/* Size and version */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {save.size ? formatSize(save.size) : 'Unknown size'}
            </span>
            {save.version && (
              <span className="text-slate-500">
                v{save.version}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                onRestore();
              }}
              className="flex items-center gap-1 text-xs"
            >
              <CheckCircle className="w-3 h-3" />
              Restore
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className="flex items-center gap-1 text-xs"
            >
              <Eye className="w-3 h-3" />
              Preview
            </Button>
            
            <div className="flex-1" />
            
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDiscard();
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}