'use client';

import React from 'react';
import { X, Sparkles, Rocket, Crown, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/lib/hooks/useSubscription';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'components' | 'containers' | 'stacks' | 'exports' | 'styling' | 'sharing';
  currentCount?: number;
  limit?: number;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  reason,
  currentCount,
  limit
}) => {
  const router = useRouter();
  const { subscription } = useSubscription();

  if (!isOpen) return null;

  const getReasonConfig = () => {
    switch (reason) {
      case 'components':
        return {
          icon: <Sparkles className="w-8 h-8 text-blue-400" />,
          title: 'Limite de composants atteinte',
          description: `Vous avez atteint la limite de ${limit} composants par stack.`,
          currentPlan: subscription.plan,
          feature: 'Composants par stack',
          upgradeTo: subscription.plan === 'free' ? 'starter' : 'professional'
        };
      case 'containers':
        return {
          icon: <Rocket className="w-8 h-8 text-purple-400" />,
          title: 'Conteneurs réservés aux plans payants',
          description: 'Les conteneurs Docker permettent d\'orchestrer vos services de manière professionnelle.',
          currentPlan: subscription.plan,
          feature: 'Conteneurs Docker',
          upgradeTo: 'starter'
        };
      case 'stacks':
        return {
          icon: <Crown className="w-8 h-8 text-amber-400" />,
          title: 'Limite de stacks atteinte',
          description: `Vous avez créé ${currentCount} stacks sur ${limit} autorisées.`,
          currentPlan: subscription.plan,
          feature: 'Nombre de stacks',
          upgradeTo: subscription.plan === 'free' ? 'starter' : 'professional'
        };
      case 'exports':
        return {
          icon: <ArrowRight className="w-8 h-8 text-green-400" />,
          title: 'Limite d\'exports atteinte',
          description: `Vous avez utilisé vos ${limit} exports mensuels.`,
          currentPlan: subscription.plan,
          feature: 'Exports par mois',
          upgradeTo: subscription.plan === 'free' ? 'starter' : 'professional'
        };
      case 'styling':
        return {
          icon: <Sparkles className="w-8 h-8 text-pink-400" />,
          title: 'Personnalisation réservée aux abonnés',
          description: 'Personnalisez l\'apparence de vos stacks avec des thèmes et styles avancés.',
          currentPlan: subscription.plan,
          feature: 'Personnalisation',
          upgradeTo: 'starter'
        };
      case 'sharing':
        return {
          icon: <CheckCircle className="w-8 h-8 text-indigo-400" />,
          title: 'Partage réservé aux abonnés',
          description: 'Partagez vos stacks avec votre équipe et collaborez efficacement.',
          currentPlan: subscription.plan,
          feature: 'Partage d\'équipe',
          upgradeTo: 'starter'
        };
      default:
        return {
          icon: <Sparkles className="w-8 h-8 text-blue-400" />,
          title: 'Fonctionnalité premium',
          description: 'Cette fonctionnalité est réservée aux plans payants.',
          currentPlan: subscription.plan,
          feature: 'Fonctionnalité avancée',
          upgradeTo: 'starter'
        };
    }
  };

  const config = getReasonConfig();

  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'starter':
        return {
          name: 'Starter',
          price: '19€/mois',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          icon: <Sparkles className="w-5 h-5" />,
          features: [
            '25 composants par stack',
            'Conteneurs Docker',
            '50 exports/mois',
            'Templates premium'
          ]
        };
      case 'professional':
        return {
          name: 'Professional',
          price: '49€/mois',
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/20',
          icon: <Rocket className="w-5 h-5" />,
          features: [
            'Composants illimités',
            'Stacks illimitées',
            'Exports illimités',
            'Collaboration d\'équipe'
          ]
        };
      default:
        return getPlanDetails('starter');
    }
  };

  const planDetails = getPlanDetails(config.upgradeTo);

  const handleUpgrade = () => {
    onClose();
    router.push('/pricing');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-slate-700">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-700/50 rounded-xl">
              {config.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {config.title}
              </h2>
              <p className="text-sm text-slate-400">
                Votre plan : <span className="text-slate-200 capitalize">{config.currentPlan === 'free' ? 'Gratuit' : config.currentPlan}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-300 mb-6 leading-relaxed">
            {config.description}
          </p>

          {/* Current vs Upgrade Comparison */}
          <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              {planDetails.icon}
              Débloquez avec {planDetails.name}
            </h3>
            
            <div className="space-y-3">
              {planDetails.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">À partir de</span>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="primary" 
                    className={`${planDetails.bgColor} ${planDetails.color} ${planDetails.borderColor}`}
                  >
                    {planDetails.price}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Plus tard
            </Button>
            <Button
              variant="primary"
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Voir les plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};