import { useState, useEffect } from 'react';
import { useGamificationRewards, RewardsResponse } from '@/lib/apiComponent/hooks/useGamificationRewards';
import { RewardModal } from '@/components/gamification/RewardModal';
import { toast } from 'sonner';

interface RewardManagerProps {
  autoCheck?: boolean;
  onRewardsChecked?: (rewards: RewardsResponse) => void;
}

export function RewardManager({ autoCheck = false, onRewardsChecked }: RewardManagerProps) {
  const { checkRewards, isChecking, rewards, error } = useGamificationRewards();
  const [currentModal, setCurrentModal] = useState<{
    type: 'trophy' | 'badge' | 'levelup';
    data: any;
    isOpen: boolean;
  }>({
    type: 'trophy',
    data: null,
    isOpen: false,
  });

  // Auto-check au montage du composant si activé
  useEffect(() => {
    if (autoCheck) {
      handleCheckRewards();
    }
  }, [autoCheck]);

  const handleCheckRewards = async () => {
    const rewardsData = await checkRewards();
    if (rewardsData && onRewardsChecked) {
      onRewardsChecked(rewardsData);
    }
    
    if (rewardsData) {
      showRewardsSequentially(rewardsData);
    }
    
    // Afficher les notifications toast
    if (rewardsData) {
      showToastNotifications(rewardsData);
    }
    
    if (error) {
      toast.error(error);
    }
  };

  const showRewardsSequentially = async (rewardsData: RewardsResponse) => {
    // 1. Level Up d'abord (le plus impressionnant)
    if (rewardsData.levelUp?.didLevelUp) {
      await showModal('levelup', rewardsData.levelUp);
    }
    
    // 2. Trophées
    if (rewardsData.newTrophies.length > 0) {
      await showModal('trophy', rewardsData.newTrophies);
    }
    
    // 3. Badges
    if (rewardsData.newBadges.length > 0) {
      await showModal('badge', rewardsData.newBadges);
    }
  };

  const showToastNotifications = (rewardsData: RewardsResponse) => {
    // 1. Level Up d'abord (le plus impressionnant)
    if (rewardsData.levelUp?.didLevelUp) {
      if (rewardsData.levelUp.newRank) {
        toast.success(`🎊 Nouveau rang : ${rewardsData.levelUp.newRank} !`, {
          description: `Niveau ${rewardsData.levelUp.oldLevel} → ${rewardsData.levelUp.newLevel}`,
          duration: 5000,
        });
      } else {
        toast.success(`📈 Montée de niveau !`, {
          description: `Niveau ${rewardsData.levelUp.oldLevel} → ${rewardsData.levelUp.newLevel}`,
          duration: 4000,
        });
      }
    }
    
    // 2. Trophées
    if (rewardsData.newTrophies.length > 0) {
      if (rewardsData.newTrophies.length === 1) {
        toast.success(`🏆 Nouveau trophée débloqué !`, {
          description: rewardsData.newTrophies[0].name,
          duration: 4000,
        });
      } else {
        toast.success(`🎉 COMBO DE TROPHÉES !`, {
          description: `${rewardsData.newTrophies.length} nouveaux trophées`,
          duration: 5000,
        });
      }
    }
    
    // 3. Badges
    if (rewardsData.newBadges.length > 0) {
      if (rewardsData.newBadges.length === 1) {
        toast.success(`🎖️ Nouveau badge débloqué !`, {
          description: rewardsData.newBadges[0].name,
          duration: 4000,
        });
      } else {
        toast.success(`🎉 COMBO DE BADGES !`, {
          description: `${rewardsData.newBadges.length} nouveaux badges`,
          duration: 5000,
        });
      }
    }
    
    // 4. Notification XP si pas d'autres récompenses
    if (!rewardsData.levelUp && 
        rewardsData.newTrophies.length === 0 && 
        rewardsData.newBadges.length === 0 &&
        rewardsData.xpGained > 0) {
      toast.success(`+${rewardsData.xpGained} XP 🌟`);
    }
  };

  const showModal = (type: 'trophy' | 'badge' | 'levelup', data: any): Promise<void> => {
    return new Promise((resolve) => {
      setCurrentModal({
        type,
        data,
        isOpen: true,
      });
      
      // Auto-fermeture après 5 secondes si pas d'interaction
      const timer = setTimeout(() => {
        closeModal();
        resolve();
      }, 5000);
      
      // Stocker le timer pour pouvoir l'annuler si fermeture manuelle
      (window as any).currentRewardTimer = timer;
    });
  };

  const closeModal = () => {
    setCurrentModal(prev => ({ ...prev, isOpen: false }));
    
    // Annuler le timer d'auto-fermeture
    if ((window as any).currentRewardTimer) {
      clearTimeout((window as any).currentRewardTimer);
      (window as any).currentRewardTimer = null;
    }
  };

  return (
    <>
      <RewardModal
        isOpen={currentModal.isOpen}
        onClose={closeModal}
        type={currentModal.type}
        data={currentModal.data}
      />
      
      {/* Bouton pour déclencher manuellement la vérification */}
      {!autoCheck && (
        <button
          onClick={handleCheckRewards}
          disabled={isChecking}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {isChecking ? 'Vérification...' : 'Vérifier les récompenses'}
        </button>
      )}
    </>
  );
}
