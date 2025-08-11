'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { Crown, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface PremiumGateProps {
  children: ReactNode;
  feature: string;
  plan?: 'starter' | 'professional' | 'enterprise';
  fallback?: ReactNode;
  className?: string;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  children,
  feature,
  plan = 'starter',
  fallback,
  className
}) => {
  const { subscription, canUseFeature, isSubscribed } = useSubscription();
  const router = useRouter();

  // Check if user can access this feature
  const hasAccess = canUseFeature(feature) || 
    (plan === 'starter' && (subscription.plan === 'starter' || subscription.plan === 'professional' || subscription.plan === 'enterprise')) ||
    (plan === 'professional' && (subscription.plan === 'professional' || subscription.plan === 'enterprise')) ||
    (plan === 'enterprise' && subscription.plan === 'enterprise');

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback or default premium gate
  if (fallback) {
    return <>{fallback}</>;
  }

  const planColors = {
    starter: 'from-blue-600 to-blue-500',
    professional: 'from-purple-600 to-purple-500',
    enterprise: 'from-amber-600 to-amber-500',
  };

  const planIcons = {
    starter: <Sparkles className="w-5 h-5" />,
    professional: <Crown className="w-5 h-5" />,
    enterprise: <Crown className="w-6 h-6" />,
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/30 backdrop-blur-sm",
      className
    )}>
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5",
        planColors[plan]
      )} />
      
      <div className="relative p-8 text-center">
        {/* Icon */}
        <div className={cn(
          "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br text-white mb-4",
          planColors[plan]
        )}>
          {planIcons[plan]}
        </div>

        {/* Badge */}
        <Badge 
          variant="primary" 
          size="lg" 
          className={cn("mb-4 bg-gradient-to-r text-white border-0", planColors[plan])}
        >
          {plan.charAt(0).toUpperCase() + plan.slice(1)} requis
        </Badge>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-2">
          Fonctionnalité Premium
        </h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Cette fonctionnalité &ldquo;{feature}&rdquo; nécessite un abonnement {plan.charAt(0).toUpperCase() + plan.slice(1)} ou supérieur.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button
            variant="primary"
            onClick={() => router.push('/pricing')}
            className={cn("bg-gradient-to-r text-white border-0", planColors[plan])}
          >
            Voir les tarifs
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          {isSubscribed && (
            <Button
              variant="ghost"
              onClick={() => router.push('/account')}
              className="text-slate-400 hover:text-white"
            >
              Gérer mon compte
            </Button>
          )}
        </div>

        {/* Feature preview (blurred) */}
        <div className="absolute inset-4 bg-slate-900/50 backdrop-blur-sm rounded-lg pointer-events-none" />
      </div>
    </div>
  );
};