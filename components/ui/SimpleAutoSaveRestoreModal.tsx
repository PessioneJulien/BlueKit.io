import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface SavedData {
  stackName: string;
  stackDescription: string;
  nodes: unknown[];
  connections: unknown[];
  lastSaved: number;
}

interface SimpleAutoSaveRestoreModalProps {
  isOpen: boolean;
  autoSaveData: SavedData;
  onRestore: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

export function SimpleAutoSaveRestoreModal({
  isOpen,
  autoSaveData,
  onRestore,
  onDiscard,
  onClose
}: SimpleAutoSaveRestoreModalProps) {
  if (!isOpen) return null;

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-lg mx-4 bg-slate-900 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Restore Your Work?
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
              <CheckCircle className="w-4 h-4" />
              Auto-saved work found
            </div>
            <p className="text-sm text-slate-300">
              We found work you were doing that was automatically saved{' '}
              <span className="font-medium text-blue-400">
                {formatTimeAgo(autoSaveData.lastSaved)}
              </span>.
            </p>
          </div>

          {/* Stack Preview */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h3 className="font-semibold text-white text-base mb-2">
              {autoSaveData.stackName || 'Untitled Stack'}
            </h3>
            {autoSaveData.stackDescription && (
              <p className="text-slate-300 text-sm mb-3">
                {autoSaveData.stackDescription}
              </p>
            )}
            
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Components:</span>
                <Badge variant="primary" size="sm">
                  {autoSaveData.nodes.length}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Connections:</span>
                <Badge variant="primary" size="sm">
                  {autoSaveData.connections.length}
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-400 text-sm mb-2">
              <AlertTriangle className="w-4 h-4" />
              Choose an option
            </div>
            <p className="text-xs text-slate-400">
              Restoring will replace your current work. Discarding will permanently delete the auto-saved data.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onDiscard}
              className="flex-1"
            >
              Discard Auto-save
            </Button>
            <Button
              variant="primary"
              onClick={onRestore}
              className="flex-1"
            >
              Restore My Work
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}