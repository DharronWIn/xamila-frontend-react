import { useState } from 'react';
import { gamificationEndpoints } from '@/lib/apiComponent/endpoints';
import { api, ApiError } from '@/lib/apiComponent/apiClient';

// Types pour les récompenses
export interface UserTrophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt: string;
}

export interface LevelUp {
  didLevelUp: boolean;
  oldLevel: number;
  newLevel: number;
  newRank?: string;
}

export interface UserLevel {
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  rank: string;
}

export interface RewardsResponse {
  newTrophies: UserTrophy[];
  newBadges: UserBadge[];
  levelUp: LevelUp | null;
  xpGained: number;
  currentLevel: UserLevel;
}

export const useGamificationRewards = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [rewards, setRewards] = useState<RewardsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkRewards = async (): Promise<RewardsResponse | null> => {
    if (isChecking) return null; // Éviter double appel
    
    setIsChecking(true);
    setError(null);
    
    try {
      const rewardsData = await api.post<RewardsResponse, {}>(gamificationEndpoints.checkTrophies, {});
      setRewards(rewardsData);
      return rewardsData;
      
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Erreur lors de la vérification des récompenses';
      setError(errorMessage);
      console.error('Error checking rewards:', err);
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkRewards,
    isChecking,
    rewards,
    error,
    clearError: () => setError(null),
  };
};






