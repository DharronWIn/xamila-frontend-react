import { useEffect, useState } from 'react';
import { useGamification } from '@/lib/apiComponent/hooks';
import { useGamificationStore } from '@/stores/gamificationStore';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Trophy,
    Medal,
    TrendingUp,
    TrendingDown,
    Minus,
    Crown, Target
} from 'lucide-react';
import { LeaderboardType } from '@/types/gamification';

export default function LeaderboardPage() {
  const {
    getLeaderboard,
    getLeaderboardPosition,
    loading,
  } = useGamification();

  const {
    leaderboard,
    myPosition,
    setLeaderboard,
    setMyPosition,
    setLeaderboardLoading,
  } = useGamificationStore();

  const [currentType, setCurrentType] = useState<LeaderboardType>('GLOBAL');
  const [showSurrounding, setShowSurrounding] = useState(false);

  useEffect(() => {
    loadLeaderboard(currentType);
  }, [currentType]);

  const loadLeaderboard = async (type: LeaderboardType) => {
    setLeaderboardLoading(true);
    const [leaderboardData, positionData] = await Promise.all([
      getLeaderboard(type, 100),
      getLeaderboardPosition(type),
    ]);

    if (leaderboardData) setLeaderboard(leaderboardData);
    if (positionData) setMyPosition(positionData);
    setLeaderboardLoading(false);
  };

  const handleTabChange = (value: string) => {
    setCurrentType(value as LeaderboardType);
    setShowSurrounding(false);
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const displayedUsers = showSurrounding && myPosition
    ? myPosition.surroundingUsers
    : rest;

  if (loading && leaderboard.length === 0) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Classement
          </h1>
          <p className="text-muted-foreground mt-1">
            Comparez vos performances avec la communauté
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentType} onValueChange={handleTabChange}>
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="GLOBAL">Global</TabsTrigger>
          <TabsTrigger value="MONTHLY">Mensuel</TabsTrigger>
          <TabsTrigger value="WEEKLY">Hebdomadaire</TabsTrigger>
        </TabsList>

        <TabsContent value={currentType} className="space-y-6 mt-6">
          {/* Podium */}
          {top3.length > 0 && (
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-300 dark:border-yellow-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Top 3
                </CardTitle>
                <CardDescription>Les meilleurs joueurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 2nd Place */}
                  {top3[1] && (
                    <div className="order-2 md:order-1">
                      <PodiumCard entry={top3[1]} position={2} />
                    </div>
                  )}

                  {/* 1st Place */}
                  {top3[0] && (
                    <div className="order-1 md:order-2">
                      <PodiumCard entry={top3[0]} position={1} />
                    </div>
                  )}

                  {/* 3rd Place */}
                  {top3[2] && (
                    <div className="order-3">
                      <PodiumCard entry={top3[2]} position={3} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* My Position */}
          {myPosition && (
            <Card className="border-blue-500/50 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-blue-500" />
                  Ma Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      #{myPosition.myEntry.rank}
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={myPosition.myEntry.user.pictureProfilUrl} />
                      <AvatarFallback>
                        {myPosition.myEntry.user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {myPosition.myEntry.user.name || myPosition.myEntry.user.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        @{myPosition.myEntry.user.username}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {myPosition.myEntry.score.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">XP</div>
                    {myPosition.myEntry.change !== 0 && (
                      <div className={`text-sm flex items-center gap-1 justify-end mt-1 ${
                        myPosition.myEntry.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {myPosition.myEntry.change > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {Math.abs(myPosition.myEntry.change)}
                      </div>
                    )}
                  </div>
                </div>

                {myPosition.myEntry.rank > 10 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowSurrounding(!showSurrounding)}
                  >
                    {showSurrounding ? 'Voir le Top 100' : 'Voir autour de moi'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Leaderboard List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-orange-500" />
                {showSurrounding ? 'Classement autour de moi' : 'Top 100'}
              </CardTitle>
              <CardDescription>
                {showSurrounding
                  ? 'Joueurs proches de votre position'
                  : 'Les 100 meilleurs joueurs'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {displayedUsers.map((entry, index) => (
                  <LeaderboardRow
                    key={entry.userId}
                    entry={entry}
                    isMe={myPosition?.myEntry.userId === entry.userId}
                    isTop10={!showSurrounding && index < 7}
                  />
                ))}

                {displayedUsers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucun joueur dans le classement
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PodiumCardProps {
  entry: any;
  position: 1 | 2 | 3;
}

function PodiumCard({ entry, position }: PodiumCardProps) {
  const podiumConfig = {
    1: {
      height: 'md:h-72',
      bgColor: 'from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-500',
      icon: '🥇',
      iconSize: 'text-6xl',
      crownSize: 'h-8 w-8',
    },
    2: {
      height: 'md:h-64',
      bgColor: 'from-gray-400/20 to-gray-500/20',
      borderColor: 'border-gray-400',
      icon: '🥈',
      iconSize: 'text-5xl',
      crownSize: 'h-6 w-6',
    },
    3: {
      height: 'md:h-56',
      bgColor: 'from-orange-600/20 to-orange-700/20',
      borderColor: 'border-orange-600',
      icon: '🥉',
      iconSize: 'text-4xl',
      crownSize: 'h-5 w-5',
    },
  };

  const config = podiumConfig[position];

  return (
    <Card className={`${config.height} flex flex-col justify-end bg-gradient-to-br ${config.bgColor} ${config.borderColor} border-2`}>
      <CardContent className="p-4 space-y-3 text-center">
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarImage src={entry.user.pictureProfilUrl} />
              <AvatarFallback className="text-2xl">
                {entry.user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {position === 1 && (
              <Crown className={`absolute -top-2 -right-2 ${config.crownSize} text-yellow-500`} />
            )}
          </div>
        </div>

        <div className={config.iconSize}>{config.icon}</div>

        <div>
          <div className="font-bold text-lg">
            {entry.user.name || entry.user.username}
          </div>
          <div className="text-sm text-muted-foreground">
            @{entry.user.username}
          </div>
        </div>

        <div className="text-2xl font-bold">
          {entry.score.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground">XP</div>

        {entry.change !== 0 && (
          <Badge
            variant={entry.change > 0 ? 'default' : 'destructive'}
            className="gap-1"
          >
            {entry.change > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(entry.change)}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

interface LeaderboardRowProps {
  entry: any;
  isMe: boolean;
  isTop10: boolean;
}

function LeaderboardRow({ entry, isMe, isTop10 }: LeaderboardRowProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
        isMe
          ? 'bg-blue-500/10 border border-blue-500/50'
          : 'hover:bg-muted/50'
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Rank */}
        <div className="w-12 text-center">
          <div className={`text-lg font-bold ${isTop10 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
            #{entry.rank}
          </div>
        </div>

        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarImage src={entry.user.pictureProfilUrl} />
          <AvatarFallback>
            {entry.user.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">
            {entry.user.name || entry.user.username}
            {isMe && (
              <Badge variant="outline" className="ml-2 text-xs">
                Vous
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            @{entry.user.username}
          </div>
        </div>
      </div>

      {/* Score & Change */}
      <div className="text-right flex items-center gap-4">
        <div>
          <div className="text-lg font-bold">
            {entry.score.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">XP</div>
        </div>

        {/* Change Indicator */}
        <div className="w-12">
          {entry.change > 0 && (
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">{entry.change}</span>
            </div>
          )}
          {entry.change < 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">{Math.abs(entry.change)}</span>
            </div>
          )}
          {entry.change === 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Minus className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-12 w-full md:w-96" />
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-32 w-full" />
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}

