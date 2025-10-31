import { useState } from 'react';
import { toast } from 'sonner';
import { useGamificationRewards } from './useGamificationRewards';

// Re-export des types depuis le nouveau système
export type { CheckRewardsResponse as RewardsResponse } from '@/types/gamification';

export const useRewards = () => {
  // Utilise le nouveau système de gamification
  const {
    checkAndShowRewards,
    isChecking,
    newTrophies,
    newBadges,
    levelUp,
    xpGained,
  } = useGamificationRewards();

  // Wrapper pour la compatibilité avec l'ancien système
  const rewards = {
    newTrophies,
    newBadges,
    levelUp,
    xpGained,
  };

  return { 
    checkAndShowRewards, 
    isChecking, 
    rewards 
  };
};
