import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  outline?: boolean;
  pill?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    children, 
    className, 
    variant = 'default', 
    size = 'md',
    outline = false,
    pill = false,
    ...props 
  }, ref) => {
    const variants = {
      default: outline 
        ? 'border-slate-600 text-slate-300 bg-transparent' 
        : 'bg-slate-700 text-slate-300',
      primary: outline 
        ? 'border-blue-500 text-blue-400 bg-transparent' 
        : 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      secondary: outline 
        ? 'border-purple-500 text-purple-400 bg-transparent' 
        : 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      success: outline 
        ? 'border-green-500 text-green-400 bg-transparent' 
        : 'bg-green-500/20 text-green-400 border-green-500/30',
      warning: outline 
        ? 'border-yellow-500 text-yellow-400 bg-transparent' 
        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      danger: outline 
        ? 'border-red-500 text-red-400 bg-transparent' 
        : 'bg-red-500/20 text-red-400 border-red-500/30',
      info: outline 
        ? 'border-cyan-500 text-cyan-400 bg-transparent' 
        : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };

    const sizes = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-sm px-2.5 py-1',
      lg: 'text-base px-3 py-1.5',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium border',
          pill ? 'rounded-full' : 'rounded-md',
          variants[variant],
          sizes[size],
          'transition-colors duration-200',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gap?: 'sm' | 'md' | 'lg';
}

export const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ children, className, gap = 'md', ...props }, ref) => {
    const gaps = {
      sm: 'gap-1',
      md: 'gap-2',
      lg: 'gap-3',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-wrap items-center',
          gaps[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BadgeGroup.displayName = 'BadgeGroup';