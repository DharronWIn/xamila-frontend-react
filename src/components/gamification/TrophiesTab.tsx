import { useEffect, useState, useMemo } from 'react';
import { useGamification } from '@/lib/apiComponent/hooks';
import { useGamificationStore, getTrophyStatus, getTrophyProgress } from '@/stores/gamificationStore';
import {
    Card,
    CardContent,
    CardHeader,
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

interface TrophiesTabProps {
  className?: string;
}

export function TrophiesTab({ className = "" }: TrophiesTabProps) {
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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrophyIcon className="h-6 w-6 text-yellow-500" />
            Mes Trophées
          </h2>
          <p className="text-muted-foreground mt-1">
            {stats.unlocked} / {stats.total} trophées débloqués ({((stats.unlocked / stats.total) * 100).toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrophyIcon className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Débloqués</p>
                <p className="text-2xl font-bold text-green-600">{stats.unlocked}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Loader className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verrouillés</p>
                <p className="text-2xl font-bold text-gray-600">{stats.locked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Catégorie</label>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as TrophyCategory | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {Object.entries(TROPHY_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label.fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Rareté</label>
              <Select value={rarityFilter} onValueChange={(value) => setRarityFilter(value as TrophyRarity | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les raretés" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les raretés</SelectItem>
                  {Object.entries(RARITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label.fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Statut</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
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

// Skeleton component
function TrophiesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5" />
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-6 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="text-center">
                <Skeleton className="h-16 w-16 mx-auto mb-4 rounded-full" />
                <Skeleton className="h-4 w-24 mx-auto mb-2" />
                <Skeleton className="h-3 w-32 mx-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Trophy Card Component
interface TrophyCardProps {
  trophy: Trophy;
  status: 'unlocked' | 'locked' | 'in_progress';
  progress: number;
  onClick: () => void;
}

function TrophyCard({ trophy, status, progress, onClick }: TrophyCardProps) {
  const isUnlocked = status === 'unlocked';
  const isInProgress = status === 'in_progress';

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isUnlocked ? 'ring-2 ring-yellow-400' : ''
      } ${isInProgress ? 'ring-2 ring-blue-400' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="text-center">
          <div className={`text-4xl mb-3 ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
            {trophy.icon}
          </div>
          
          <h3 className={`font-semibold mb-2 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
            {trophy.nameFr}
          </h3>
          
          <p className={`text-sm mb-3 line-clamp-2 ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
            {trophy.descriptionFr}
          </p>

          <div className="space-y-2">
            <Badge
              variant="secondary"
              style={{
                backgroundColor: RARITY_COLORS[trophy.rarity] + '20',
                color: RARITY_COLORS[trophy.rarity],
                borderColor: RARITY_COLORS[trophy.rarity],
              }}
              className="text-xs border"
            >
              {RARITY_LABELS[trophy.rarity].fr}
            </Badge>

            {isInProgress && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progression</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {isUnlocked && (
              <div className="flex items-center justify-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Débloqué</span>
              </div>
            )}

            {status === 'locked' && (
              <div className="flex items-center justify-center gap-1 text-gray-500">
                <Lock className="h-4 w-4" />
                <span className="text-xs">Verrouillé</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Trophy Details Modal Component
interface TrophyDetailsModalProps {
  trophy: Trophy;
  status: 'unlocked' | 'locked' | 'in_progress';
  progress: number;
  onClose: () => void;
}

function TrophyDetailsModal({ trophy, status, progress, onClose }: TrophyDetailsModalProps) {
  const isUnlocked = status === 'unlocked';
  const isInProgress = status === 'in_progress';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{trophy.icon}</span>
            {trophy.nameFr}
          </DialogTitle>
          <DialogDescription>
            {trophy.descriptionFr}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rareté:</span>
            <Badge
              variant="secondary"
              style={{
                backgroundColor: RARITY_COLORS[trophy.rarity] + '20',
                color: RARITY_COLORS[trophy.rarity],
                borderColor: RARITY_COLORS[trophy.rarity],
              }}
              className="border"
            >
              {RARITY_LABELS[trophy.rarity].fr}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Catégorie:</span>
            <span className="text-sm text-gray-600">
              {TROPHY_CATEGORY_LABELS[trophy.category].fr}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Points:</span>
            <span className="text-sm font-semibold text-yellow-600">
              +{trophy.points} XP
            </span>
          </div>

          {isInProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {isUnlocked && (
            <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Trophée débloqué !
              </span>
            </div>
          )}

          {status === 'locked' && (
            <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Lock className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                Trophée verrouillé
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
