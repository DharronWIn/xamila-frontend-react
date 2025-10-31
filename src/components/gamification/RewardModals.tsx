import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy as TrophyType, Badge as BadgeType, RARITY_COLORS, RARITY_LABELS } from '@/types/gamification';
import { CheckCircle, Star, Award, Crown, Trophy } from 'lucide-react';

// ==================== TROPHY UNLOCKED MODAL ====================

interface TrophyUnlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  trophies: TrophyType[];
}

export const TrophyUnlockedModal: React.FC<TrophyUnlockedModalProps> = ({
  isOpen,
  onClose,
  trophies
}) => {
  if (trophies.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Trophy className="h-8 w-8 text-yellow-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {trophies.length === 1 ? 'Trophée Débloqué !' : 'Trophées Débloqués !'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {trophies.map((trophy) => (
            <div
              key={trophy.id}
              className="flex items-center space-x-4 rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex-shrink-0">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                  style={{ backgroundColor: RARITY_COLORS[trophy.rarity] + '20' }}
                >
                  {trophy.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {trophy.nameFr}
                  </h3>
                  <Badge
                    variant="secondary"
                    style={{ 
                      backgroundColor: RARITY_COLORS[trophy.rarity] + '20',
                      color: RARITY_COLORS[trophy.rarity],
                      borderColor: RARITY_COLORS[trophy.rarity]
                    }}
                  >
                    {RARITY_LABELS[trophy.rarity].fr}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {trophy.descriptionFr}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>+{trophy.xpReward} XP</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={onClose} className="px-8">
            Continuer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ==================== BADGE UNLOCKED MODAL ====================

interface BadgeUnlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: BadgeType[];
}

export const BadgeUnlockedModal: React.FC<BadgeUnlockedModalProps> = ({
  isOpen,
  onClose,
  badges
}) => {
  if (badges.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Award className="h-8 w-8 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {badges.length === 1 ? 'Badge Obtenu !' : 'Badges Obtenus !'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center space-x-4 rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex-shrink-0">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                  style={{ backgroundColor: badge.color + '20' }}
                >
                  {badge.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {badge.nameFr}
                  </h3>
                  <Badge
                    variant="secondary"
                    style={{ 
                      backgroundColor: badge.color + '20',
                      color: badge.color,
                      borderColor: badge.color
                    }}
                  >
                    {badge.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {badge.descriptionFr}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={onClose} className="px-8">
            Continuer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ==================== LEVEL UP MODAL ====================

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelUp: {
    oldLevel: number;
    newLevel: number;
    xpGained: number;
  };
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  levelUp
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <DialogTitle className="text-3xl font-bold text-gray-900">
            🎉 Level Up ! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4">
          <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            {levelUp.oldLevel} → {levelUp.newLevel}
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-lg text-gray-600">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>+{levelUp.xpGained} XP gagné !</span>
          </div>

          <p className="text-gray-500">
            Félicitations ! Vous avez atteint le niveau {levelUp.newLevel} !
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={onClose} className="px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            Continuer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ==================== XP GAINED TOAST ====================

interface XPGainedToastProps {
  xpGained: number;
  isVisible: boolean;
  onClose: () => void;
}

export const XPGainedToast: React.FC<XPGainedToastProps> = ({
  xpGained,
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full">
      <div className="flex items-center space-x-2 rounded-lg bg-green-500 px-4 py-2 text-white shadow-lg">
        <Star className="h-5 w-5" />
        <span className="font-semibold">+{xpGained} XP</span>
        <button
          onClick={onClose}
          className="ml-2 text-white/80 hover:text-white"
        >
          ×
        </button>
      </div>
    </div>
  );
};
