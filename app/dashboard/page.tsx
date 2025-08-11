'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Rocket, Crown, Sparkles } from 'lucide-react';
import { useUserStore } from '@/lib/stores/userStore';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  const { subscription, loading } = useSubscription();
  const [showSuccess, setShowSuccess] = useState(false);
  const planFromUrl = searchParams.get('plan') || (typeof window !== 'undefined' ? localStorage.getItem('pending_upgrade') : null);

  useEffect(() => {
    // Vérifier si on vient de Stripe
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      
      // Sauvegarder le plan dans localStorage pour ne pas le perdre
      const plan = searchParams.get('plan');
      if (plan) {
        localStorage.setItem('pending_upgrade', plan);
      }
      
      // Masquer le message après 10 secondes (plus de temps)
      setTimeout(() => setShowSuccess(false), 10000);

      // Nettoyer l'URL après 8 secondes (plus de temps pour cliquer)
      setTimeout(() => {
        window.history.replaceState({}, '', '/dashboard');
      }, 8000);
    }
  }, [searchParams]);

  // Rediriger si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'starter':
        return <Sparkles className="w-6 h-6 text-blue-400" />;
      case 'professional':
        return <Rocket className="w-6 h-6 text-purple-400" />;
      case 'enterprise':
        return <Crown className="w-6 h-6 text-amber-400" />;
      default:
        return <Check className="w-6 h-6 text-gray-400" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'professional':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'enterprise':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-16">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-green-400 mb-2">
                  Paiement réussi ! Votre abonnement devrait être actif.
                </p>
                
                {/* Debug info */}
                <div className="text-xs text-slate-500 mb-2 p-2 bg-slate-800/50 rounded">
                  <p>Plan URL: {planFromUrl}</p>
                  <p>Plan actuel: {subscription.plan}</p>
                  <p>Statut: {subscription.status}</p>
                  <p>Condition bouton: {(planFromUrl && planFromUrl !== subscription.plan) ? 'TRUE' : 'FALSE'}</p>
                  <p>Plans différents: {planFromUrl !== subscription.plan ? 'OUI' : 'NON'}</p>
                </div>

                {/* Afficher le bouton si le plan URL est différent du plan actuel */}
                {planFromUrl && planFromUrl !== subscription.plan && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">
                      Le webhook n'est pas encore configuré. Activez manuellement votre plan :
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/test-subscription', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ plan: planFromUrl }),
                          });
                          if (response.ok) {
                            // Supprimer le pending upgrade
                            localStorage.removeItem('pending_upgrade');
                            // Rediriger vers le builder pour voir les changements
                            window.location.href = '/builder?upgraded=true';
                          } else {
                            alert('Erreur lors de l\'activation du plan');
                          }
                        } catch (error) {
                          console.error('Error:', error);
                          alert('Erreur lors de l\'activation du plan');
                        }
                      }}
                    >
                      Activer le plan {planFromUrl}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Tableau de bord
          </h1>
          <p className="text-xl text-slate-300">
            Bienvenue, {user?.email}
          </p>
        </div>

        {/* Subscription Info */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                {getPlanIcon(subscription.plan)}
                Mon abonnement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Plan actuel</p>
                  <Badge 
                    variant="primary" 
                    size="lg"
                    className={getPlanColor(subscription.plan)}
                  >
                    {subscription.plan === 'free' ? 'Gratuit' :
                     subscription.plan === 'starter' ? 'Starter' :
                     subscription.plan === 'professional' ? 'Professional' :
                     'Enterprise'}
                  </Badge>
                </div>

                {subscription.status && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Statut</p>
                    <p className="text-white">
                      {subscription.status === 'active' ? 'Actif' :
                       subscription.status === 'canceled' ? 'Annulé' :
                       subscription.status === 'past_due' ? 'En retard' :
                       subscription.status}
                    </p>
                  </div>
                )}

                {subscription.currentPeriodEnd && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Renouvellement</p>
                    <p className="text-white">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Limits */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Limites du plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Stacks</span>
                  <span className="text-white">
                    {subscription.limits.stacks === -1 ? 'Illimité' : subscription.limits.stacks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Composants/stack</span>
                  <span className="text-white">
                    {subscription.limits.components === -1 ? 'Illimité' : subscription.limits.components}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Exports/mois</span>
                  <span className="text-white">
                    {subscription.limits.exports === -1 ? 'Illimité' : subscription.limits.exports}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/builder">
                  <Button variant="primary" className="w-full">
                    Créer une stack
                  </Button>
                </Link>
                <Link href="/stacks">
                  <Button variant="secondary" className="w-full">
                    Mes stacks
                  </Button>
                </Link>
                {subscription.plan === 'free' && (
                  <Link href="/pricing">
                    <Button variant="secondary" className="w-full">
                      Passer au premium
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manage Subscription */}
        {subscription.plan !== 'free' && (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => {
                // TODO: Implémenter le customer portal
                alert('Le portail client sera bientôt disponible');
              }}
            >
              Gérer mon abonnement
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}