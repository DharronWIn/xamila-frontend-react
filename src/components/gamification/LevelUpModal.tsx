import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGamificationStore } from '@/stores/gamificationStore';
import {
    RANK_EMOJIS,
    RANK_COLORS,
    RANK_LABELS,
} from '@/types/gamification';

export function LevelUpModal() {
  const navigate = useNavigate();

  const {
    showLevelUpModal,
    level,
    previousLevel,
    hideLevelUp,
  } = useGamificationStore();

  if (!level || previousLevel === null) return null;

  const levelUp = level.level - (previousLevel || 0);
  const hasRankUp = previousLevel && level.rank !== (previousLevel as any);

  const handleViewProgress = () => {
    hideLevelUp();
    navigate('/gamification');
  };

  return (
    <Dialog open={showLevelUpModal} onOpenChange={hideLevelUp}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-6 py-6">
            {/* Level Badge with Animation */}
            <div className="relative inline-block">
              <div
                className="relative w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold animate-pulse"
                style={{
                  background: `conic-gradient(${RANK_COLORS[level.rank]} 100%, transparent 0%)`,
                  padding: '6px',
                }}
              >
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  {level.level}
                </div>
              </div>
              <div className="absolute -top-4 -right-4 text-5xl animate-bounce">
                ⭐
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                Niveau Supérieur !
              </DialogTitle>
              <DialogDescription className="text-xl font-semibold">
                Niveau {level.level} atteint
              </DialogDescription>
            </div>

            {/* Level Progress */}
            {levelUp > 1 && (
              <Badge variant="secondary" className="text-sm">
                +{levelUp} niveaux
              </Badge>
            )}

            {/* Rank Badge */}
            <div className="flex items-center justify-center gap-3">
              <div
                className="px-4 py-2 rounded-full border-2 font-semibold"
                style={{
                  borderColor: RANK_COLORS[level.rank],
                  backgroundColor: RANK_COLORS[level.rank] + '20',
                  color: RANK_COLORS[level.rank],
                }}
              >
                <span className="text-2xl mr-2">{RANK_EMOJIS[level.rank]}</span>
                <span>{RANK_LABELS[level.rank].fr}</span>
              </div>
            </div>

            {/* New Rank Notification */}
            {hasRankUp && (
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  <div className="font-semibold">Nouveau Rang Débloqué !</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Vous êtes maintenant un <strong>{RANK_LABELS[level.rank].fr}</strong>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {level.totalXP.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">XP Total</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {level.xpToNextLevel.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Prochain niveau</div>
              </div>
            </div>

            {/* Motivational Message */}
            <div className="text-sm text-muted-foreground italic">
              "Continue comme ça ! Tu es sur la bonne voie ! 🚀"
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleViewProgress}
              className="w-full sm:w-auto"
            >
              <Zap className="mr-2 h-4 w-4" />
              Voir ma progression
            </Button>
            <Button
              onClick={hideLevelUp}
              className="w-full sm:w-auto"
            >
              Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}

