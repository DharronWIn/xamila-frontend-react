import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGamification } from '@/lib/apiComponent/hooks';
import { useGamificationStore } from '@/stores/gamificationStore';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Trophy,
    Award,
    TrendingUp,
    Star,
    Medal,
    Zap,
    ArrowRight,
    Crown,
    Target,
} from 'lucide-react';
import {
    RANK_EMOJIS,
    RANK_COLORS,
    RARITY_COLORS,
    RARITY_LABELS,
} from '@/types/gamification';

export default function GamificationDashboard() {
  const navigate = useNavigate();
  const {
    getDashboard,
    loading,
    error,
  } = useGamification();

  const {
    dashboard,
    setDashboard,
    setDashboardLoading,
    setDashboardError,
    shouldRefreshDashboard,
  } = useGamificationStore();

  useEffect(() => {
    const loadDashboard = async () => {
      if (!shouldRefreshDashboard() && dashboard) {
        return;
      }

      setDashboardLoading(true);
      const data = await getDashboard();
      if (data) {
        setDashboard(data);
        setDashboardError(null);
      } else if (error) {
        setDashboardError(error);
      }
      setDashboardLoading(false);
    };

    loadDashboard();
  }, []);

  if (loading || !dashboard) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { level, totalTrophies, unlockedTrophies, totalBadges, leaderboardRank, recentTrophies, inProgressTrophies } = dashboard;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Gamification
          </h1>
          <p className="text-muted-foreground mt-1">
            Suivez votre progression et débloquez des récompenses
          </p>
        </div>
      </div>

      {/* Level & XP Card */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-300 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Niveau & Expérience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Level Badge */}
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold"
                style={{
                  background: `conic-gradient(${RANK_COLORS[level.rank]} ${level.progressPercent}%, #e5e7eb ${level.progressPercent}%)`,
                  padding: '4px',
                }}
              >
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  {level.level}
                </div>
              </div>

              {/* Level Info */}
              <div>
                <div className="text-2xl font-bold">Niveau {level.level}</div>
                <div className="text-lg text-muted-foreground flex items-center gap-2">
                  <span>{RANK_EMOJIS[level.rank]}</span>
                  <span>{level.rank}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {level.currentXP.toLocaleString()} / {(level.currentXP + level.xpToNextLevel).toLocaleString()} XP
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {level.totalXP.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">XP Total</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">{level.progressPercent.toFixed(1)}%</span>
            </div>
            <Progress value={level.progressPercent} className="h-3" />
            <div className="text-xs text-muted-foreground text-center">
              Encore {level.xpToNextLevel.toLocaleString()} XP pour le niveau {level.level + 1}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Trophies Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/gamification/trophies')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Trophées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {unlockedTrophies} / {totalTrophies}
            </div>
            <Progress
              value={(unlockedTrophies / totalTrophies) * 100}
              className="mt-3 h-2"
            />
            <div className="text-sm text-muted-foreground mt-2">
              {((unlockedTrophies / totalTrophies) * 100).toFixed(1)}% débloqués
            </div>
          </CardContent>
        </Card>

        {/* Badges Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/gamification/trophies')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-500" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBadges}</div>
            <div className="text-sm text-muted-foreground mt-3">
              Badges obtenus
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/gamification/leaderboard')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Medal className="h-4 w-4 text-orange-500" />
              Classement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">#{leaderboardRank}</span>
              {leaderboardRank <= 3 && (
                <Crown className="h-6 w-6 text-yellow-500" />
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-3">
              Position globale
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trophies */}
      {recentTrophies.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Trophées Récents
              </CardTitle>
              <CardDescription>Vos derniers débloquages</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/gamification/trophies')}>
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTrophies.slice(0, 6).map((userTrophy) => (
                <Card key={userTrophy.id} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{userTrophy.trophy.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">
                          {userTrophy.trophy.nameFr}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {userTrophy.trophy.descriptionFr}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            style={{
                              backgroundColor: RARITY_COLORS[userTrophy.trophy.rarity] + '20',
                              color: RARITY_COLORS[userTrophy.trophy.rarity],
                              borderColor: RARITY_COLORS[userTrophy.trophy.rarity],
                            }}
                            className="text-xs border"
                          >
                            {RARITY_LABELS[userTrophy.trophy.rarity].fr}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            +{userTrophy.trophy.points} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Progress Trophies */}
      {inProgressTrophies.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Progression
              </CardTitle>
              <CardDescription>Trophées proches du déblocage</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/gamification/trophies')}>
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inProgressTrophies.slice(0, 5).map((trophyProgress) => (
                <div key={trophyProgress.trophy.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{trophyProgress.trophy.icon}</span>
                      <div>
                        <div className="font-medium">
                          {trophyProgress.trophy.nameFr}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {trophyProgress.trophy.descriptionFr}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {trophyProgress.progress.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        +{trophyProgress.trophy.points} XP
                      </div>
                    </div>
                  </div>
                  <Progress value={trophyProgress.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => navigate('/gamification/trophies')} size="lg">
          <Trophy className="mr-2 h-5 w-5" />
          Voir tous les trophées
        </Button>
        <Button onClick={() => navigate('/gamification/leaderboard')} variant="outline" size="lg">
          <TrendingUp className="mr-2 h-5 w-5" />
          Voir le classement
        </Button>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-48 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

