import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={cn('relative', sizes[size], className)}>
      <div className="absolute inset-0 rounded-full border-2 border-slate-700"></div>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"></div>
    </div>
  );
};

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'space-x-1',
    md: 'space-x-2',
    lg: 'space-x-3',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div className={cn('flex items-center', sizes[size], className)}>
      <div className={cn(dotSizes[size], 'bg-blue-500 rounded-full animate-bounce')} style={{ animationDelay: '0ms' }}></div>
      <div className={cn(dotSizes[size], 'bg-blue-500 rounded-full animate-bounce')} style={{ animationDelay: '150ms' }}></div>
      <div className={cn(dotSizes[size], 'bg-blue-500 rounded-full animate-bounce')} style={{ animationDelay: '300ms' }}></div>
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max = 100, 
  size = 'md', 
  variant = 'default',
  showLabel = false,
  className 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variants = {
    default: 'bg-blue-500',
    gradient: 'bg-gradient-to-r from-blue-500 to-purple-600',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-slate-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-slate-700 rounded-full overflow-hidden', sizes[size])}>
        <div 
          className={cn('h-full rounded-full transition-all duration-300 ease-out', variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'text',
  animation = 'pulse',
  width,
  height,
}) => {
  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const defaultSizes = {
    text: { width: '100%', height: '1rem' },
    circular: { width: '3rem', height: '3rem' },
    rectangular: { width: '100%', height: '10rem' },
    rounded: { width: '100%', height: '10rem' },
  };

  const finalWidth = width || defaultSizes[variant].width;
  const finalHeight = height || defaultSizes[variant].height;

  return (
    <div
      className={cn(
        'bg-slate-700/50',
        variants[variant],
        animations[animation],
        className
      )}
      style={{
        width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
        height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
      }}
    />
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  spinner?: boolean;
  blur?: boolean;
  text?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  children, 
  spinner = true,
  blur = true,
  text,
  className 
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className={cn(
          'absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center rounded-lg z-10',
          blur && 'backdrop-blur-sm'
        )}>
          {spinner && <Spinner size="lg" />}
          {text && (
            <p className="mt-4 text-sm text-slate-300">{text}</p>
          )}
        </div>
      )}
    </div>
  );
};

interface LoadingStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  title = 'Loading...', 
  description,
  icon,
  className 
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16', className)}>
      {icon || <Spinner size="lg" />}
      <h3 className="mt-4 text-lg font-medium text-slate-100">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-slate-400 text-center max-w-sm">{description}</p>
      )}
    </div>
  );
};