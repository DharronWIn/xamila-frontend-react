export enum SubscriptionPlan {
  FREE = 'FREE',
  TRIAL = 'TRIAL', 
  PREMIUM = 'PREMIUM',
  SIX_MONTHS = 'SIX_MONTHS'
}

export interface SubscriptionPlanInfo {
  value: SubscriptionPlan;
  label: string;
  description: string;
  price?: number;
  duration?: string;
  features: string[];
}

export const subscriptionPlans: SubscriptionPlanInfo[] = [
  {
    value: SubscriptionPlan.FREE,
    label: 'Gratuit',
    description: 'Accès aux fonctionnalités de base',
    features: [
      '1 défi par mois',
      'Suivi des économies',
      'Communauté de base'
    ]
  },
  {
    value: SubscriptionPlan.PREMIUM,
    label: 'Premium',
    description: 'Accès complet à toutes les fonctionnalités',
    price: 10000,
    duration: '1 mois',
    features: [
      'Défis illimités',
      'Analyses avancées',
      'Support prioritaire 24/7',
      'Communauté premium',
      'Certificats de réussite'
    ]
  }
];
