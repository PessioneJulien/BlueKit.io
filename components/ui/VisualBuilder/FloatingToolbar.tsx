'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface FloatingToolbarProps {
  title: string;
  icon: ReactNode;
  iconColor?: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}

/**
 * Unified floating toolbar component for all configuration panels
 * Used by connections, nodes, and containers configuration
 */
export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  title,
  icon,
  iconColor = 'text-blue-400',
  children,
  onClose,
  className
}) => {
  return (
    <div className={cn(
      "bg-slate-800/95 backdrop-blur-md border-b border-slate-700 px-3 py-2",
      "flex items-center gap-3 text-sm overflow-x-auto",
      className
    )}>
      {/* Title Section */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className={iconColor}>
          {icon}
        </div>
        <span className="font-medium text-slate-200 text-xs">
          {title}
        </span>
      </div>

      {/* Content */}
      {children}

      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="ml-auto p-1 h-6 w-6 flex-shrink-0"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
};