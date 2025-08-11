import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe.js with publishable key
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    description: 'Pour découvrir BlueKit',
    price: 0,
    features: [
      '3 stacks maximum',
      'Composants de base',
      'Export JSON uniquement',
      'Support communautaire'
    ],
    limits: {
      maxStacks: 3,
      maxComponentsPerStack: 10,
      exportFormats: ['json'],
      supportLevel: 'community'
    }
  },
  starter: {
    name: 'Starter',
    description: 'Pour les développeurs individuels',
    price: 19,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER,
    features: [
      '10 stacks maximum',
      'Tous les composants',
      'Export JSON, YAML, Docker',
      'Support par email',
      'Templates premium'
    ],
    limits: {
      maxStacks: 10,
      maxComponentsPerStack: 25,
      exportFormats: ['json', 'yaml', 'docker'],
      supportLevel: 'email'
    }
  },
  professional: {
    name: 'Professional',
    description: 'Pour les équipes',
    price: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL,
    features: [
      'Stacks illimitées',
      'Tous les composants',
      'Tous les formats d\'export',
      'Support prioritaire',
      'Collaboration d\'équipe',
      'Intégrations CI/CD',
      'Analytics avancées'
    ],
    limits: {
      maxStacks: -1, // unlimited
      maxComponentsPerStack: -1,
      exportFormats: ['all'],
      supportLevel: 'priority',
      teamMembers: 5
    }
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Solutions sur mesure',
    price: 'custom',
    priceId: null, // Custom pricing, no fixed Price ID
    features: [
      'Tout de Professional',
      'Membres d\'équipe illimités',
      'Support dédié 24/7',
      'Formation personnalisée',
      'SLA garanti',
      'Déploiement on-premise',
      'Personnalisation complète'
    ],
    limits: {
      maxStacks: -1,
      maxComponentsPerStack: -1,
      exportFormats: ['all'],
      supportLevel: 'dedicated',
      teamMembers: -1,
      customFeatures: true
    }
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;