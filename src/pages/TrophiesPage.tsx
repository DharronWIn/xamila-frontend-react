import { useEffect, useState, useMemo } from 'react';
import { useGamification } from '@/lib/apiComponent/hooks';
import { useGamificationStore, getTrophyStatus, getTrophyProgress } from '@/stores/gamificationStore';
import {
    Card,
    CardContent, CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Trophy as TrophyIcon,
    Lock,
    CheckCircle,
    Loader,
    Filter,
} from 'lucide-react';
import {
    Trophy,
    TrophyCategory,
    TrophyRarity,
    RARITY_COLORS,
    RARITY_LABELS,
    TROPHY_CATEGORY_LABELS,
} from '@/types/gamification';

export default function TrophiesPage() {
  const {
    getTrophies,
    getMyTrophies,
    getTrophiesProgress,
    loading,
  } = useGamification();

  const {
    allTrophies,
    myTrophies,
    trophiesProgress,
    setAllTrophies,
    setMyTrophies,
    setTrophiesProgress,
  } = useGamificationStore();

  const [selectedTrophy, setSelectedTrophy] = useState<Trophy | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<TrophyCategory | 'all'>('all');
  const [rarityFilter, setRarityFilter] = useState<TrophyRarity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked' | 'in_progress'>('all');

  useEffect(() => {
    loadTrophiesData();
  }, []);

  const loadTrophiesData = async () => {
    const [trophies, myTrophiesData, progressData] = await Promise.all([
      getTrophies(),
      getMyTrophies(),
      getTrophiesProgress(),
    ]);

    if (trophies) setAllTrophies(trophies);
    if (myTrophiesData) setMyTrophies(myTrophiesData);
    if (progressData) setTrophiesProgress(progressData);
  };

  const filteredTrophies = useMemo(() => {
    let filtered = [...allTrophies];

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    // Filter by rarity
    if (rarityFilter !== 'all') {
      filtered = filtered.filter((t) => t.rarity === rarityFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => {
        const status = getTrophyStatus(t, myTrophies, trophiesProgress);
        return status === statusFilter;
      });
    }

    return filtered;
  }, [allTrophies, myTrophies, trophiesProgress, categoryFilter, rarityFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = allTrophies.length;
    const unlocked = myTrophies.filter((t) => t.isCompleted).length;
    const inProgress = trophiesProgress.filter((t) => t.progress > 0 && !t.isCompleted).length;
    const locked = total - unlocked - inProgress;

    return { total, unlocked, inProgress, locked };
  }, [allTrophies, myTrophies, trophiesProgress]);

  if (loading && allTrophies.length === 0) {
    return <TrophiesSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrophyIcon className="h-8 w-8 text-yellow-500" />
            Salle des Trophées
          </h1>
          <p className="text-muted-foreground mt-1">
            {stats.unlocked} / {stats.total} trophées débloqués ({((stats.unlocked / stats.total) * 100).toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.unlocked}
            </div>
            <div className="text-sm text-muted-foreground">Débloqués</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.inProgress}
            </div>
            <div className="text-sm text-muted-foreground">En cours</div>
          </CardContent>
        </Card>
        <Card className="border-gray-500/50 bg-gray-500/5">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {stats.locked}
            </div>
            <div className="text-sm text-muted-foreground">Verrouillés</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as TrophyCategory | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="SAVINGS">{TROPHY_CATEGORY_LABELS.SAVINGS?.fr || 'Épargne'}</SelectItem>
                  <SelectItem value="CHALLENGE">{TROPHY_CATEGORY_LABELS.CHALLENGE?.fr || 'Challenge'}</SelectItem>
                  <SelectItem value="SOCIAL">{TROPHY_CATEGORY_LABELS.SOCIAL?.fr || 'Social'}</SelectItem>
                  <SelectItem value="MILESTONE">{TROPHY_CATEGORY_LABELS.MILESTONE?.fr || 'Jalon'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rarity Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rareté</label>
              <Select value={rarityFilter} onValueChange={(value) => setRarityFilter(value as TrophyRarity | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les raretés" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="COMMON">{RARITY_LABELS.COMMON?.fr || 'Commun'}</SelectItem>
                  <SelectItem value="RARE">{RARITY_LABELS.RARE?.fr || 'Rare'}</SelectItem>
                  <SelectItem value="EPIC">{RARITY_LABELS.EPIC?.fr || 'Épique'}</SelectItem>
                  <SelectItem value="LEGENDARY">{RARITY_LABELS.LEGENDARY?.fr || 'Légendaire'}</SelectItem>
                  <SelectItem value="MYTHIC">{RARITY_LABELS.MYTHIC?.fr || 'Mythique'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="unlocked">Débloqués</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="locked">Verrouillés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(categoryFilter !== 'all' || rarityFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setCategoryFilter('all');
                setRarityFilter('all');
                setStatusFilter('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Trophies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTrophies.map((trophy) => {
          const status = getTrophyStatus(trophy, myTrophies, trophiesProgress);
          const progress = getTrophyProgress(trophy, myTrophies, trophiesProgress);

          return (
            <TrophyCard
              key={trophy.id}
              trophy={trophy}
              status={status}
              progress={progress}
              onClick={() => setSelectedTrophy(trophy)}
            />
          );
        })}
      </div>

      {filteredTrophies.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <TrophyIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Aucun trophée ne correspond aux filtres sélectionnés
            </p>
          </CardContent>
        </Card>
      )}

      {/* Trophy Details Modal */}
      {selectedTrophy && (
        <TrophyDetailsModal
          trophy={selectedTrophy}
          status={getTrophyStatus(selectedTrophy, myTrophies, trophiesProgress)}
          progress={getTrophyProgress(selectedTrophy, myTrophies, trophiesProgress)}
          onClose={() => setSelectedTrophy(null)}
        />
      )}
    </div>
  );
}

interface TrophyCardProps {
  trophy: Trophy;
  status: 'unlocked' | 'in_progress' | 'locked';
  progress: number;
  onClick: () => void;
}

function TrophyCard({ trophy, status, progress, onClick }: TrophyCardProps) {
  const isLocked = status === 'locked';
  const isUnlocked = status === 'unlocked';
  const isInProgress = status === 'in_progress';

  return (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-all ${
        isUnlocked ? 'border-green-500/50 bg-green-500/5' : ''
      } ${isInProgress ? 'border-blue-500/50 bg-blue-500/5' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Icon & Status */}
          <div className="flex items-start justify-between">
            <div
              className={`text-5xl ${isLocked ? 'grayscale opacity-50' : ''}`}
            >
              {trophy.icon}
            </div>
            <div>
              {isUnlocked && <CheckCircle className="h-5 w-5 text-green-500" />}
              {isInProgress && <Loader className="h-5 w-5 text-blue-500" />}
              {isLocked && <Lock className="h-5 w-5 text-gray-400" />}
            </div>
          </div>

          {/* Name */}
          <div>
            <h3 className={`font-semibold ${isLocked && trophy.isSecret ? 'blur-sm' : ''}`}>
              {trophy.isSecret && isLocked ? '???' : trophy.nameFr}
            </h3>
            <p className={`text-xs text-muted-foreground line-clamp-2 mt-1 ${isLocked && trophy.isSecret ? 'blur-sm' : ''}`}>
              {trophy.isSecret && isLocked ? 'Trophée secret' : trophy.descriptionFr}
            </p>
          </div>

          {/* Rarity Badge */}
          <Badge
            style={{
              backgroundColor: RARITY_COLORS[trophy.rarity] + '20',
              color: RARITY_COLORS[trophy.rarity],
              borderColor: RARITY_COLORS[trophy.rarity],
            }}
            className="text-xs border"
          >
            {RARITY_LABELS[trophy.rarity]?.fr || trophy.rarity}
          </Badge>

          {/* Points */}
          <div className="text-sm font-medium text-muted-foreground">
            +{trophy.points} XP
          </div>

          {/* Progress Bar */}
          {(isInProgress || isUnlocked) && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {progress.toFixed(0)}%
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface TrophyDetailsModalProps {
  trophy: Trophy;
  status: 'unlocked' | 'in_progress' | 'locked';
  progress: number;
  onClose: () => void;
}

function TrophyDetailsModal({ trophy, status, progress, onClose }: TrophyDetailsModalProps) {
  const isLocked = status === 'locked';
  const isUnlocked = status === 'unlocked';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className={`text-5xl ${isLocked ? 'grayscale opacity-50' : ''}`}>
              {trophy.icon}
            </span>
            <div className="flex-1">
              <div className={isLocked && trophy.isSecret ? 'blur-sm' : ''}>
                {trophy.isSecret && isLocked ? '???' : trophy.nameFr}
              </div>
              <div className="text-sm font-normal text-muted-foreground flex items-center gap-2 mt-1">
                <Badge
                  style={{
                    backgroundColor: RARITY_COLORS[trophy.rarity] + '20',
                    color: RARITY_COLORS[trophy.rarity],
                    borderColor: RARITY_COLORS[trophy.rarity],
                  }}
                  className="border"
                >
                  {RARITY_LABELS[trophy.rarity]?.fr || trophy.rarity}
                </Badge>
                <span>•</span>
                <span>{TROPHY_CATEGORY_LABELS[trophy.category]?.fr || trophy.category}</span>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className={isLocked && trophy.isSecret ? 'blur-sm' : ''}>
            {trophy.isSecret && isLocked ? 'Trophée secret - Déverrouillez-le pour en savoir plus' : trophy.descriptionFr}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress */}
          {!isLocked && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          )}

          {/* Reward */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">Récompense</span>
            <span className="text-lg font-bold">+{trophy.points} XP</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Statut</span>
              <div className="font-medium mt-1 flex items-center gap-2">
                {isUnlocked && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Débloqué
                  </>
                )}
                {status === 'in_progress' && (
                  <>
                    <Loader className="h-4 w-4 text-blue-500" />
                    En cours
                  </>
                )}
                {isLocked && (
                  <>
                    <Lock className="h-4 w-4 text-gray-400" />
                    Verrouillé
                  </>
                )}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Débloqué par</span>
              <div className="font-medium mt-1">
                {trophy.totalUnlocked.toLocaleString()} joueurs
              </div>
            </div>
          </div>

          {/* Secret Badge */}
          {trophy.isSecret && (
            <Badge variant="secondary" className="w-full justify-center">
              🤫 Trophée Secret
            </Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TrophiesSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}

