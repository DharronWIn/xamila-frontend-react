import { useCallback } from 'react';
import { useGamification } from '@/lib/apiComponent/hooks/useGamification';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useGamificationRewards } from './useGamificationRewards';

/**
 * Hook pour vérifier et mettre à jour la progression de gamification
 * après les actions importantes de l'utilisateur
 */
export const useGamificationProgress = () => {
  const { getLevel } = useGamification();
  const { level, setLevel } = useGamificationStore();
  const {
    checkAfterTransaction,
    checkAfterSavings,
    checkAfterChallengeCompleted,
    checkAfterDefiCompleted,
    checkAfterDefiCreated,
    checkAfterPostCreated,
    checkAfterLikeReceived,
    checkAfterCommentPosted,
  } = useGamificationRewards();

  /**
   * Vérifie si l'utilisateur a gagné de l'XP et si des trophées ont été débloqués
   * À appeler après chaque action importante (transaction, challenge complété, etc.)
   */
  const checkProgress = useCallback(async () => {
    try {
      // Récupérer le nouveau niveau
      const newLevel = await getLevel();
      
      if (newLevel) {
        // Mettre à jour le niveau
        setLevel(newLevel);
      }
    } catch (error) {
      console.error('Error checking gamification progress:', error);
    }
  }, [getLevel, setLevel]);

  /**
   * Force une vérification complète de la progression
   * À utiliser avec parcimonie (coûteux en termes d'API)
   */
  const forceCheckProgress = useCallback(async () => {
    await checkProgress();
  }, [checkProgress]);

  return {
    // Vérification générique
    checkProgress,
    forceCheckProgress,
    
    // Vérifications spécifiques par action (utilisent le nouveau système de récompenses)
    checkProgressAfterTransaction,
    checkProgressAfterSavings,
    checkProgressAfterChallengeCompleted,
    checkProgressAfterDefiCompleted,
    checkProgressAfterDefiCreated,
    checkProgressAfterPostCreated,
    checkProgressAfterLikeReceived,
    checkProgressAfterCommentPosted,
  };
};

