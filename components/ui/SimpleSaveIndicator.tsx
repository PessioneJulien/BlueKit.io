import { Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SimpleSaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
  className?: string;
  showText?: boolean;
}

export function SimpleSaveIndicator({ 
  status, 
  lastSaved, 
  className,
  showText = true 
}: SimpleSaveIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'saving':
        return 'text-yellow-400';
      case 'saved':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
        return <Clock className="w-4 h-4 animate-pulse" />;
      case 'saved':
        return <Check className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaved ? `Saved ${formatRelativeTime(lastSaved)}` : 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return '';
    }
  };

  if (status === 'idle') return null;

  return (
    <div className={cn(
      'flex items-center gap-2 text-sm transition-colors',
      getStatusColor(),
      className
    )}>
      {getStatusIcon()}
      {showText && (
        <span className="hidden sm:inline">
          {getStatusText()}
        </span>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 10) return 'just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}