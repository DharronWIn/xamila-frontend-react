import { useState, useCallback } from 'react';
import { useGamification } from '@/lib/apiComponent/hooks/useGamification';
import { useGamificationStore } from '@/stores/gamificationStore';
import { CheckRewardsResponse, Trophy, Badge as BadgeType } from '@/types/gamification';
import { toast } from 'sonner';

export const useGamificationRewards = () => {
  const { checkRewards } = useGamification();
  const {
    setLevel,
    addRecentlyUnlockedTrophy,
    showTrophyUnlockedModal,
    showLevelUp,
  } = useGamificationStore();

  const [isChecking, setIsChecking] = useState(false);
  const [showTrophyModal, setShowTrophyModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showXPToast, setShowXPToast] = useState(false);
  
  const [newTrophies, setNewTrophies] = useState<Trophy[]>([]);
  const [newBadges, setNewBadges] = useState<BadgeType[]>([]);
  const [levelUp, setLevelUp] = useState<{
    oldLevel: number;
    newLevel: number;
    xpGained: number;
  } | null>(null);
  const [xpGained, setXpGained] = useState(0);

  /**
   * Vérifie les nouvelles récompenses après une action importante
   * À appeler après : transaction, challenge complété, post créé, etc.
   */
  const checkAndShowRewards = useCallback(async (): Promise<CheckRewardsResponse | null> => {
    if (isChecking) return null;
    
    setIsChecking(true);
    
    try {
      const rewards = await checkRewards();
      
      if (!rewards) {
        return null;
      }

      // Mettre à jour le niveau
      setLevel(rewards.currentLevel);

      // Gérer les nouvelles récompenses
      if (rewards.newTrophies.length > 0) {
        setNewTrophies(rewards.newTrophies);
        setShowTrophyModal(true);
        
        // Ajouter aux trophées récents
        rewards.newTrophies.forEach(trophy => {
          addRecentlyUnlockedTrophy(trophy);
        });
      }

      if (rewards.newBadges.length > 0) {
        setNewBadges(rewards.newBadges);
        setShowBadgeModal(true);
      }

      if (rewards.levelUp) {
        setLevelUp(rewards.levelUp);
        setShowLevelUpModal(true);
        showLevelUp();
      } else if (rewards.xpGained > 0) {
        setXpGained(rewards.xpGained);
        setShowXPToast(true);
        
        // Auto-hide XP toast after 3 seconds
        setTimeout(() => {
          setShowXPToast(false);
        }, 3000);
      }

      return rewards;
      
    } catch (error) {
      console.error('Error checking rewards:', error);
      toast.error('Erreur lors de la vérification des récompenses');
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, checkRewards, setLevel, addRecentlyUnlockedTrophy, showLevelUp]);

  /**
   * Vérifie les récompenses après une transaction
   */
  const checkAfterTransaction = useCallback(async () => {
    await checkAndShowRewards();
  }, [checkAndShowRewards]);

  /**
   * Vérifie les récompenses après une épargne
   */
  const checkAfterSavings = useCallback(async () => {
    await checkAndShowRewards();
  }, [checkAndShowRewards]);

  /**
   * Vérifie les récompenses après la complétion d'un challenge
   */
  const checkAfterChallengeCompleted = useCallback(async () => {
    await checkAndShowRewards();
  }, [checkAndShowRewards]);

  /**
   * Vérifie les récompenses après la complétion d'un défi
   */
  const checkAfterDefiCompleted = useCallback(async () => {
    await checkAndShowRewards();
  }, [checkAndShowRewards]);

  /**
   * Vérifie les récompenses après la création d'un défi
   */
  const checkAfterDefiCreated = useCallback(async () => {
    await checkAndShowRewards();
  }, [checkAndShowRewards]);

  /**
   * Vérifie les récompenses après la création d'un post
   */
  const checkAfterPostCreated = useCallback(async () => {
    await checkAndShowRewards();
  }, [checkAndShowRewards]);

  /**
   * Vérifie les récompenses après avoir reçu un like
   */
  const checkAfterLikeReceived = useCallback(async () => {
    await checkAndShowRewards();
  }, [checkAndShowRewards]);

  /**
   * Vérifie les récompenses après avoir posté un commentaire
   */
  const checkAfterCommentPosted = useCallback(async () => {
    await checkAndShowRewards();
  }, [checkAndShowRewards]);

  // Fonctions pour fermer les modales
  const closeTrophyModal = useCallback(() => {
    setShowTrophyModal(false);
    setNewTrophies([]);
  }, []);

  const closeBadgeModal = useCallback(() => {
    setShowBadgeModal(false);
    setNewBadges([]);
  }, []);

  const closeLevelUpModal = useCallback(() => {
    setShowLevelUpModal(false);
    setLevelUp(null);
  }, []);

  const closeXPToast = useCallback(() => {
    setShowXPToast(false);
    setXpGained(0);
  }, []);

  return {
    // État des modales
    showTrophyModal,
    showBadgeModal,
    showLevelUpModal,
    showXPToast,
    
    // Données des récompenses
    newTrophies,
    newBadges,
    levelUp,
    xpGained,
    
    // État de chargement
    isChecking,
    
    // Fonctions de vérification
    checkAndShowRewards,
    checkAfterTransaction,
    checkAfterSavings,
    checkAfterChallengeCompleted,
    checkAfterDefiCompleted,
    checkAfterDefiCreated,
    checkAfterPostCreated,
    checkAfterLikeReceived,
    checkAfterCommentPosted,
    
    // Fonctions de fermeture des modales
    closeTrophyModal,
    closeBadgeModal,
    closeLevelUpModal,
    closeXPToast,
  };
};
