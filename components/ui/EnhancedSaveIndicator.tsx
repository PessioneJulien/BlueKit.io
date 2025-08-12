/**
 * Enhanced Save Indicator Component
 * 
 * Advanced save status indicator with detailed information and actions
 */

import { cn } from '@/lib/utils';
import { SaveStatus } from '@/lib/services/autoSaveService';
import { 
  Save, 
  Check, 
  AlertCircle, 
  Loader2, 
  Clock, 
  CloudOff, 
  Cloud,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Card, CardContent } from './Card';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedSaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
  hasUnsavedChanges?: boolean;
  hasAutoSave?: boolean;
  isOnline?: boolean;
  className?: string;
  variant?: 'compact' | 'detailed' | 'minimal';
  showText?: boolean;
  onForceSave?: () => void;
  onLoadSave?: () => void;
  onClearSave?: () => void;
}

export function EnhancedSaveIndicator({ 
  status, 
  lastSaved, 
  hasUnsavedChanges = false,
  hasAutoSave = false,
  isOnline = true,
  className,
  variant = 'detailed',
  showText = true,
  onForceSave,
  onLoadSave,
  onClearSave
}: EnhancedSaveIndicatorProps) {
  
  const getStatusInfo = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Loader2,
          text: 'Saving changes...',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          animate: 'animate-spin',
          pulse: true
        };
      
      case 'saved':
        return {
          icon: Check,
          text: lastSaved ? `Saved ${formatRelativeTime(lastSaved)}` : 'All changes saved',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          animate: '',
          pulse: false
        };
      
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Save failed - check connection',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          animate: '',
          pulse: true
        };
      
      case 'conflict':
        return {
          icon: AlertTriangle,
          text: 'Sync conflict detected',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
          animate: '',
          pulse: true
        };
      
      default:
        return {
          icon: hasUnsavedChanges ? AlertCircle : Save,
          text: hasUnsavedChanges ? 'Unsaved changes' : 'Ready to save',
          color: hasUnsavedChanges ? 'text-orange-400' : 'text-slate-400',
          bgColor: hasUnsavedChanges ? 'bg-orange-500/10' : 'bg-slate-500/10',
          borderColor: hasUnsavedChanges ? 'border-orange-500/30' : 'border-slate-700/50',
          animate: '',
          pulse: hasUnsavedChanges
        };
    }
  };

  const { icon: Icon, text, color, bgColor, borderColor, animate, pulse } = getStatusInfo();

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <motion.div
          animate={pulse ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: pulse ? Infinity : 0 }}
        >
          <Icon className={cn('w-4 h-4', color, animate)} />
        </motion.div>
        {showText && (
          <span className={cn('text-sm', color)}>
            {status === 'saved' && lastSaved ? formatRelativeTime(lastSaved) : text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300',
        bgColor,
        borderColor,
        className
      )}>
        <motion.div
          animate={pulse ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: pulse ? Infinity : 0 }}
        >
          <Icon className={cn('w-4 h-4', color, animate)} />
        </motion.div>
        
        {showText && (
          <span className={cn('text-sm font-medium', color)}>
            {text}
          </span>
        )}

        {/* Offline indicator */}
        {!isOnline && (
          <CloudOff className="w-3 h-3 text-slate-500" title="Offline - local save only" />
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status icon */}
          <motion.div
            animate={pulse ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: pulse ? Infinity : 0 }}
            className={cn('p-2 rounded-lg', bgColor)}
          >
            <Icon className={cn('w-5 h-5', color, animate)} />
          </motion.div>

          {/* Status content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn('text-sm font-medium', color)}>
                {text}
              </h3>
              
              {/* Connection status */}
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Cloud className="w-3 h-3 text-green-400" title="Online - cloud sync active" />
                ) : (
                  <CloudOff className="w-3 h-3 text-slate-500" title="Offline - local save only" />
                )}
              </div>
            </div>

            {/* Additional info */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              {lastSaved && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Last: {formatRelativeTime(lastSaved)}</span>
                </div>
              )}
              
              {hasAutoSave && (
                <Badge variant="default" size="sm" className="text-xs">
                  Auto-save available
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence>
          {(status === 'error' || hasAutoSave || hasUnsavedChanges) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t border-slate-700/50"
            >
              <div className="flex items-center gap-2">
                {status === 'error' && onForceSave && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onForceSave}
                    className="flex items-center gap-1 text-xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry Save
                  </Button>
                )}
                
                {hasAutoSave && onLoadSave && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onLoadSave}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Clock className="w-3 h-3" />
                    Restore
                  </Button>
                )}
                
                {hasUnsavedChanges && onForceSave && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={onForceSave}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Save className="w-3 h-3" />
                    Save Now
                  </Button>
                )}
                
                {hasAutoSave && onClearSave && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClearSave}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  
  return date.toLocaleDateString();
}