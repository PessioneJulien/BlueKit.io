import React from 'react';
import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { 
  GripVertical, 
  Star, 
  Clock, 
  DollarSign,
  ExternalLink,
  Info,
  Check} from 'lucide-react';

export interface Technology {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'other' | 'testing' | 'ui-ux' | 'state-management' | 'routing' | 'documentation' | 'build-tools' | 'linting';
  description: string;
  logoUrl?: string;
  documentationUrl?: string;
  setupTimeHours: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  pricing: 'free' | 'freemium' | 'paid' | 'enterprise';
  stars?: number;
  compatibility?: {
    compatible: string[];
    incompatible: string[];
  };
}

interface TechnologyCardProps {
  technology: Technology;
  isDragging?: boolean;
  isCompact?: boolean;
  showDetails?: boolean;
  onSelect?: () => void;
  selected?: boolean;
  className?: string;
}

export const TechnologyCard: React.FC<TechnologyCardProps> = ({
  technology,
  isDragging = false,
  isCompact = false,
  showDetails = true,
  onSelect,
  selected = false,
  className,
}) => {
  const categoryColors = {
    frontend: 'primary',
    backend: 'secondary',
    database: 'success',
    devops: 'warning',
    mobile: 'danger',
    ai: 'info',
    other: 'default',
    testing: 'info',
    'ui-ux': 'primary',
    'state-management': 'secondary',
    routing: 'warning',
    documentation: 'success',
    'build-tools': 'warning',
    linting: 'info',
  } as const;

  const difficultyColors = {
    beginner: 'success',
    intermediate: 'warning',
    expert: 'danger',
  } as const;

  const pricingIcons = {
    free: <span className="text-green-400">Free</span>,
    freemium: <span className="text-yellow-400">Freemium</span>,
    paid: <span className="text-orange-400">Paid</span>,
    enterprise: <span className="text-red-400">Enterprise</span>,
  };

  if (isCompact) {
    return (
      <Card
        variant="glass"
        className={cn(
          'p-3 cursor-pointer transition-all',
          isDragging && 'opacity-50',
          selected && 'ring-2 ring-blue-500',
          'hover:bg-slate-800/40',
          className
        )}
        onClick={onSelect}
      >
        <div className="flex items-center gap-3">
          {technology.logoUrl ? (
            <Image 
              src={technology.logoUrl} 
              alt={technology.name}
              width={32}
              height={32}
              className="object-contain"
            />
          ) : (
            <div className="w-8 h-8 bg-slate-700 rounded-md flex items-center justify-center">
              <span className="text-xs font-bold text-slate-400">
                {technology.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-sm font-medium text-slate-100">{technology.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={categoryColors[technology.category]} size="sm">
                {technology.category}
              </Badge>
              <Badge variant={difficultyColors[technology.difficulty]} size="sm" outline>
                {technology.difficulty}
              </Badge>
            </div>
          </div>
          {selected && <Check className="w-5 h-5 text-green-400" />}
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="glass"
      className={cn(
        'relative overflow-hidden transition-all',
        isDragging && 'opacity-50 scale-105',
        selected && 'ring-2 ring-blue-500',
        'hover:bg-slate-800/40',
        className
      )}
      hover={!isDragging}
    >
      <div className="absolute top-3 right-3 p-2 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-slate-500" />
      </div>

      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          {technology.logoUrl ? (
            <Image 
              src={technology.logoUrl} 
              alt={technology.name}
              width={48}
              height={48}
              className="object-contain"
            />
          ) : (
            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-slate-400">
                {technology.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-slate-100">{technology.name}</h3>
              {technology.documentationUrl && (
                <a 
                  href={technology.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-300 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={categoryColors[technology.category]}>
                {technology.category}
              </Badge>
              <Badge variant={difficultyColors[technology.difficulty]} outline size="sm">
                {technology.difficulty}
              </Badge>
              {technology.stars && (
                <div className="flex items-center gap-1 text-sm text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{technology.stars}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {showDetails && (
          <>
            <p className="text-sm text-slate-300 mb-4">
              {technology.description}
            </p>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{technology.setupTimeHours}h setup</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <DollarSign className="w-4 h-4" />
                {pricingIcons[technology.pricing]}
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Info className="w-4 h-4" />
                <span className="capitalize">{technology.difficulty}</span>
              </div>
            </div>
          </>
        )}

        {onSelect && (
          <button
            onClick={onSelect}
            className={cn(
              'mt-4 w-full py-2 rounded-lg font-medium transition-colors',
              selected
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
            )}
          >
            {selected ? 'Selected' : 'Select'}
          </button>
        )}
      </div>
    </Card>
  );
};

interface DraggableTechnologyCardProps extends TechnologyCardProps {
  id: string;
}

export const DraggableTechnologyCard: React.FC<DraggableTechnologyCardProps> = ({
  id,
  ...props
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TechnologyCard {...props} isDragging={isDragging} />
    </div>
  );
};