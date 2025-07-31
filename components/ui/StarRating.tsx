'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  maxRating = 5,
  size = 'md',
  readonly = false,
  showValue = true,
  className
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(null);
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, i) => {
          const value = i + 1;
          const isFilled = value <= displayRating;
          const isHalf = value === Math.ceil(displayRating) && displayRating % 1 !== 0;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={cn(
                'transition-all',
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors',
                  isFilled ? 'text-yellow-400 fill-current' : 'text-slate-600',
                  !readonly && 'hover:text-yellow-300'
                )}
              />
            </button>
          );
        })}
      </div>
      
      {showValue && (
        <span className={cn(
          'ml-2 font-medium',
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg',
          'text-white'
        )}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};