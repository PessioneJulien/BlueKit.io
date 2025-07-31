import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    success,
    helperText,
    options,
    placeholder = 'Select an option',
    onChange,
    value,
    ...props 
  }, ref) => {
    const selectClasses = cn(
      'w-full px-4 py-2.5 pr-10 bg-slate-800/50 border rounded-lg',
      'text-slate-100 appearance-none cursor-pointer',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      {
        'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20': !error && !success,
        'border-red-500/50 focus:border-red-500 focus:ring-red-500/20': error,
        'border-green-500/50 focus:border-green-500 focus:ring-green-500/20': success,
      },
      className
    );

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-200 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            value={value}
            onChange={handleChange}
            {...props}
          >
            <option value="" disabled className="text-slate-500">
              {placeholder}
            </option>
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
                className="bg-slate-800 text-slate-100"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-400" />
            ) : success ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
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

Select.displayName = 'Select';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'w-5 h-5 mt-0.5 bg-slate-800/50 border border-slate-700 rounded',
              'text-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0',
              'transition-all duration-200 cursor-pointer',
              'checked:bg-blue-500 checked:border-blue-500',
              error && 'border-red-500/50',
              className
            )}
            {...props}
          />
          {label && (
            <span className="text-sm text-slate-200">{label}</span>
          )}
        </label>
        {(error || helperText) && (
          <div className={cn(
            'mt-2 ml-8 text-sm',
            error ? 'text-red-400' : 'text-slate-400'
          )}>
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          ref={ref}
          type="radio"
          className={cn(
            'w-5 h-5 bg-slate-800/50 border border-slate-700',
            'text-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0',
            'transition-all duration-200 cursor-pointer',
            'checked:bg-blue-500 checked:border-blue-500',
            className
          )}
          {...props}
        />
        {label && (
          <span className="text-sm text-slate-200">{label}</span>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

interface RadioGroupProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  name: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  name,
}) => {
  const handleChange = (optionValue: string) => {
    onChange?.(optionValue);
  };

  return (
    <div className="w-full">
      {label && (
        <div className="text-sm font-medium text-slate-200 mb-3">{label}</div>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            checked={value === option.value}
            onChange={() => handleChange(option.value)}
            disabled={option.disabled}
          />
        ))}
      </div>
      {(error || helperText) && (
        <div className={cn(
          'mt-2 text-sm',
          error ? 'text-red-400' : 'text-slate-400'
        )}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};