import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/lib/supabase/auth-context';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/client';

interface UserSubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | null;
  currentPeriodEnd: Date | null;
  limits: typeof SUBSCRIPTION_PLANS[SubscriptionPlan]['limits'];
}

export function useSubscription() {
  const { user } = useSupabaseAuth();
  const [subscription, setSubscription] = useState<UserSubscription>({
    plan: 'free',
    status: null,
    currentPeriodEnd: null,
    limits: SUBSCRIPTION_PLANS.free.limits,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription({
        plan: 'free',
        status: null,
        currentPeriodEnd: null,
        limits: SUBSCRIPTION_PLANS.free.limits,
      });
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('user_profiles')
          .select('subscription_plan, subscription_status, subscription_current_period_end')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // Si la table n'existe pas ou si l'utilisateur n'a pas de profil, utiliser le plan gratuit
          console.warn('Subscription fetch warning:', error.message);
          setSubscription({
            plan: 'free',
            status: null,
            currentPeriodEnd: null,
            limits: SUBSCRIPTION_PLANS.free.limits,
          });
          setLoading(false);
          return;
        }

        if (data && data.subscription_plan && data.subscription_status === 'active') {
          // Map price ID to plan
          let plan: SubscriptionPlan = 'free';
          if (data.subscription_plan === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER) {
            plan = 'starter';
          } else if (data.subscription_plan === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL) {
            plan = 'professional';
          } else if (data.subscription_plan === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE) {
            plan = 'enterprise';
          }

          setSubscription({
            plan,
            status: data.subscription_status,
            currentPeriodEnd: data.subscription_current_period_end 
              ? new Date(data.subscription_current_period_end) 
              : null,
            limits: SUBSCRIPTION_PLANS[plan].limits,
          });
        } else {
          setSubscription({
            plan: 'free',
            status: null,
            currentPeriodEnd: null,
            limits: SUBSCRIPTION_PLANS.free.limits,
          });
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const checkLimit = (limitType: keyof typeof SUBSCRIPTION_PLANS.free.limits): boolean => {
    const limit = subscription.limits[limitType];
    return limit === -1 || limit === 'all'; // -1 means unlimited
  };

  const canUseFeature = (feature: string): boolean => {
    // Check specific features based on plan
    const planFeatures = SUBSCRIPTION_PLANS[subscription.plan].features;
    return planFeatures.some(f => f.toLowerCase().includes(feature.toLowerCase()));
  };

  return {
    subscription,
    loading,
    checkLimit,
    canUseFeature,
    isSubscribed: subscription.plan !== 'free',
    isPro: subscription.plan === 'professional' || subscription.plan === 'enterprise',
  };
}