import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGamificationStore } from '@/stores/gamificationStore';
import {
    RARITY_COLORS,
    RARITY_LABELS,
    TROPHY_CATEGORY_LABELS,
} from '@/types/gamification';

export function TrophyUnlockedModal() {
  const navigate = useNavigate();

  const {
    showTrophyModal,
    currentUnlockedTrophy,
    hideTrophyUnlockedModal,
  } = useGamificationStore();

  if (!currentUnlockedTrophy) return null;

  const handleShare = () => {
    const text = `🎉 J'ai débloqué le trophée "${currentUnlockedTrophy.nameFr}" sur X-Amila ! 🏆`;
    const url = window.location.origin;

    if (navigator.share) {
      navigator
        .share({
          title: 'Trophée Débloqué',
          text,
          url,
        })
        .catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${text}\n${url}`);
    }
  };

  const handleViewTrophies = () => {
    hideTrophyUnlockedModal();
    navigate('/gamification/trophies');
  };

  return (
    <Dialog open={showTrophyModal} onOpenChange={hideTrophyUnlockedModal}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-6 py-6">
            {/* Trophy Icon with Animation */}
            <div className="relative">
              <div className="text-8xl animate-bounce">
                {currentUnlockedTrophy.icon}
              </div>
              <div className="absolute inset-0 animate-ping opacity-75">
                <div className="text-8xl">{currentUnlockedTrophy.icon}</div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold">
                🎉 Trophée Débloqué !
              </DialogTitle>
              <DialogDescription className="text-lg font-semibold">
                {currentUnlockedTrophy.nameFr}
              </DialogDescription>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              {currentUnlockedTrophy.descriptionFr}
            </p>

            {/* Badges */}
            <div className="flex items-center justify-center gap-3">
              <Badge
                style={{
                  backgroundColor: RARITY_COLORS[currentUnlockedTrophy.rarity] + '20',
                  color: RARITY_COLORS[currentUnlockedTrophy.rarity],
                  borderColor: RARITY_COLORS[currentUnlockedTrophy.rarity],
                }}
                className="border text-sm px-3 py-1"
              >
                {RARITY_LABELS[currentUnlockedTrophy.rarity].fr}
              </Badge>

              <Badge variant="secondary" className="text-sm px-3 py-1">
                {TROPHY_CATEGORY_LABELS[currentUnlockedTrophy.category].fr}
              </Badge>
            </div>

            {/* XP Reward */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Récompense</div>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                +{currentUnlockedTrophy.points} XP
              </div>
            </div>

            {/* Special Badge */}
            {currentUnlockedTrophy.isSecret && (
              <Badge variant="secondary" className="text-sm">
                🤫 Trophée Secret
              </Badge>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleShare}
              className="w-full sm:w-auto"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Partager
            </Button>
            <Button
              variant="outline"
              onClick={handleViewTrophies}
              className="w-full sm:w-auto"
            >
              <Eye className="mr-2 h-4 w-4" />
              Voir mes trophées
            </Button>
            <Button
              onClick={hideTrophyUnlockedModal}
              className="w-full sm:w-auto"
            >
              Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}

