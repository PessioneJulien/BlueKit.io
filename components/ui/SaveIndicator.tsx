import { cn } from '@/lib/utils';
import { SaveStatus } from '@/lib/hooks/useAutoSave';
import { Save, Check, AlertCircle, Loader2 } from 'lucide-react';

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
  className?: string;
  showText?: boolean;
}

export function SaveIndicator({ 
  status, 
  lastSaved, 
  className,
  showText = true 
}: SaveIndicatorProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Loader2,
          text: 'Saving...',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          animate: 'animate-spin'
        };
      case 'saved':
        return {
          icon: Check,
          text: lastSaved ? `Saved ${formatRelativeTime(lastSaved)}` : 'Saved',
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          animate: ''
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Save failed',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          animate: ''
        };
      default:
        return {
          icon: Save,
          text: 'Not saved',
          color: 'text-slate-400',
          bgColor: 'bg-slate-500/20',
          animate: ''
        };
    }
  };

  const { icon: Icon, text, color, bgColor, animate } = getStatusInfo();

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all',
      bgColor,
      'border-slate-700/50',
      className
    )}>
      <Icon className={cn('w-4 h-4', color, animate)} />
      {showText && (
        <span className={cn('text-sm font-medium', color)}>
          {text}
        </span>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  
  return date.toLocaleDateString();
}