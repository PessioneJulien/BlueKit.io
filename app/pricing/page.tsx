'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Building2, Rocket } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { loadStripe } from '@stripe/stripe-js';
import { useUserStore } from '@/lib/stores/userStore';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planKey: string) => {
    if (planKey === 'free') {
      router.push('/auth/signup');
      return;
    }

    if (planKey === 'enterprise') {
      router.push('/contact?type=enterprise');
      return;
    }

    setLoading(planKey);
    try {
      // Vérifier si l'utilisateur est connecté
      if (!user) {
        // Sauvegarder le plan choisi pour après la connexion
        localStorage.setItem('pending_plan', planKey);
        router.push('/auth/login?redirect=/pricing');
        return;
      }

      // Charger Stripe
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Obtenir le priceId correspondant
      let priceId: string;
      switch (planKey) {
        case 'starter':
          priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || 'price_1RupVsIEoBYk9xtj4VQZv9pD';
          break;
        case 'professional':
          priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL || 'price_1RupVsIEoBYk9xtjZqHidfqe';
          break;
        default:
          throw new Error('Invalid plan');
      }

      // Créer la session de checkout via l'API
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          planName: planKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      console.log('Checkout response:', data);

      // Utiliser directement l'URL si disponible (plus simple)
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      // Fallback avec redirectToCheckout si seulement sessionId
      if (data.sessionId) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (error) {
          console.error('Stripe redirect error:', error);
          alert(error.message);
        }
      } else {
        throw new Error('No session ID or URL received from server');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <Badge variant="primary" size="lg" className="mb-4">
            Tarification
          </Badge>
          <h1 className="text-5xl font-bold text-white mb-6">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Des solutions adaptées à chaque étape de votre croissance, 
            du développeur solo à l&apos;entreprise
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Free Plan */}
          <div className="relative bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-8 hover:border-slate-600 transition-all">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <p className="text-slate-400 mb-4">Pour découvrir BlueKit</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-white">0€</span>
                <span className="text-slate-400 ml-2">/mois</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {SUBSCRIPTION_PLANS.free.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => handleSubscribe('free')}
            >
              Commencer gratuitement
            </Button>
          </div>

          {/* Starter Plan */}
          <div className="relative bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-8 hover:border-slate-600 transition-all">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-2xl font-bold text-white">Starter</h3>
              </div>
              <p className="text-slate-400 mb-4">Pour les développeurs</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-white">19€</span>
                <span className="text-slate-400 ml-2">/mois</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {SUBSCRIPTION_PLANS.starter.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => handleSubscribe('starter')}
              disabled={loading === 'starter'}
            >
              {loading === 'starter' ? 'Chargement...' : 'S\'abonner'}
            </Button>
          </div>

          {/* Professional Plan - Most Popular */}
          <div className="relative bg-gradient-to-b from-blue-900/20 to-slate-800/50 backdrop-blur-md rounded-2xl border-2 border-blue-500/50 p-8 hover:border-blue-400/60 transition-all">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge variant="primary" size="lg">
                Plus populaire
              </Badge>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-blue-400" />
                <h3 className="text-2xl font-bold text-white">Professional</h3>
              </div>
              <p className="text-slate-400 mb-4">Pour les équipes</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-white">49€</span>
                <span className="text-slate-400 ml-2">/mois</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {SUBSCRIPTION_PLANS.professional.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="primary"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
              onClick={() => handleSubscribe('professional')}
              disabled={loading === 'professional'}
            >
              {loading === 'professional' ? 'Chargement...' : 'S\'abonner'}
            </Button>
          </div>

          {/* Enterprise Plan */}
          <div className="relative bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-8 hover:border-slate-600 transition-all">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-2xl font-bold text-white">Enterprise</h3>
              </div>
              <p className="text-slate-400 mb-4">Solutions sur mesure</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-white">Sur devis</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {SUBSCRIPTION_PLANS.enterprise.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => handleSubscribe('enterprise')}
            >
              Nous contacter
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Questions fréquentes
          </h2>
          
          <div className="space-y-6">
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p className="text-slate-400">
                Oui, vous pouvez upgrader ou downgrader votre abonnement à tout moment. 
                Les changements seront appliqués à votre prochaine période de facturation.
              </p>
            </div>

            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                Y a-t-il une période d&apos;essai ?
              </h3>
              <p className="text-slate-400">
                Le plan Free vous permet de tester les fonctionnalités de base sans limite de temps. 
                Pour les plans payants, nous offrons une garantie de remboursement de 14 jours.
              </p>
            </div>

            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                Comment fonctionne la facturation ?
              </h3>
              <p className="text-slate-400">
                La facturation est mensuelle et automatique. Vous pouvez gérer vos informations 
                de paiement et télécharger vos factures depuis votre tableau de bord.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}