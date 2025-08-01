import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AutoSaveData } from '@/lib/hooks/useAutoSave';
import { Clock, FileText, Layers, X } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface AutoSaveRestoreModalProps {
  isOpen: boolean;
  autoSaveData: AutoSaveData;
  onRestore: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

export function AutoSaveRestoreModal({
  isOpen,
  autoSaveData,
  onRestore,
  onDiscard,
  onClose
}: AutoSaveRestoreModalProps) {
  if (!isOpen) return null;

  const lastSavedDate = new Date(autoSaveData.lastSaved);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 bg-slate-900 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Auto-saved Work Found
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
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="space-y-3">
              {/* Stack Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300">Stack Details</span>
                </div>
                <h3 className="font-semibold text-white">
                  {autoSaveData.stackName || 'Untitled Stack'}
                </h3>
                {autoSaveData.stackDescription && (
                  <p className="text-sm text-slate-400 mt-1">
                    {autoSaveData.stackDescription}
                  </p>
                )}
              </div>

              {/* Components Count */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">
                    {autoSaveData.nodes.length} components
                  </span>
                </div>
                {autoSaveData.connections.length > 0 && (
                  <Badge variant="outline" size="sm">
                    {autoSaveData.connections.length} connections
                  </Badge>
                )}
              </div>

              {/* Last Saved */}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                <span>
                  Last saved {formatRelativeTime(lastSavedDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-sm text-blue-300">
              Would you like to restore your previous work or start fresh?
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={onRestore}
              className="flex-1"
            >
              Restore Work
            </Button>
            <Button
              variant="outline"
              onClick={onDiscard}
              className="flex-1"
            >
              Start Fresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}