import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, X } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    success,
    helperText,
    icon,
    iconPosition = 'left',
    type = 'text',
    ...props 
  }, ref) => {
    const hasIcon = Boolean(icon);
    const hasLeftIcon = hasIcon && iconPosition === 'left';
    const hasRightIcon = hasIcon && iconPosition === 'right';
    
    const inputClasses = cn(
      'w-full px-4 py-2.5 bg-slate-800/50 border rounded-lg',
      'text-slate-100 placeholder-slate-500',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      {
        'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20': !error && !success,
        'border-red-500/50 focus:border-red-500 focus:ring-red-500/20': error,
        'border-green-500/50 focus:border-green-500 focus:ring-green-500/20': success,
        'pl-10': hasLeftIcon,
        'pr-10': hasRightIcon,
      },
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-200 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {hasLeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={inputClasses}
            {...props}
          />
          {hasRightIcon && !error && !success && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
              <X className="w-5 h-5" />
            </div>
          )}
          {success && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
              <Check className="w-5 h-5" />
            </div>
          )}
        </div>
        {(error || helperText) && (
          <div className={cn(
            'mt-2 text-sm flex items-start gap-1',
            error ? 'text-red-400' : 'text-slate-400'
          )}>
            {error && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <span>{error || helperText}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    className, 
    label, 
    error, 
    success,
    helperText,
    ...props 
  }, ref) => {
    const textAreaClasses = cn(
      'w-full px-4 py-2.5 bg-slate-800/50 border rounded-lg',
      'text-slate-100 placeholder-slate-500',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'resize-y min-h-[100px]',
      {
        'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20': !error && !success,
        'border-red-500/50 focus:border-red-500 focus:ring-red-500/20': error,
        'border-green-500/50 focus:border-green-500 focus:ring-green-500/20': success,
      },
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-200 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={textAreaClasses}
          {...props}
        />
        {(error || helperText) && (
          <div className={cn(
            'mt-2 text-sm flex items-start gap-1',
            error ? 'text-red-400' : 'text-slate-400'
          )}>
            {error && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <span>{error || helperText}</span>
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';