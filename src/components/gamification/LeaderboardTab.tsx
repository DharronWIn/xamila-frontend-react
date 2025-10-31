import { useEffect, useState } from 'react';
import { useGamification } from '@/lib/apiComponent/hooks';
import { useGamificationStore } from '@/stores/gamificationStore';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
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
    Crown,
    Target
} from 'lucide-react';
import { LeaderboardType } from '@/types/gamification';

interface LeaderboardTabProps {
  className?: string;
}

export function LeaderboardTab({ className = "" }: LeaderboardTabProps) {
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
    ? leaderboard.filter((_, index) => {
        const myIndex = leaderboard.findIndex(u => u.userId === myPosition.userId);
        return index >= Math.max(0, myIndex - 2) && index <= Math.min(leaderboard.length - 1, myIndex + 2);
      })
    : rest;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-amber-700';
    return 'bg-gray-100';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading && leaderboard.length === 0) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Classement
          </h2>
          <p className="text-muted-foreground mt-1">
            Votre position dans le classement global
          </p>
        </div>
      </div>

      {/* My Position Card */}
      {myPosition && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getRankIcon(myPosition.rank)}
                  <span className="text-lg font-bold">#{myPosition.rank}</span>
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={myPosition.avatar} />
                  <AvatarFallback>{myPosition.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{myPosition.username}</h3>
                  <p className="text-sm text-gray-600">{myPosition.xp} XP</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(myPosition.trend)}
                  <span className="text-sm text-gray-600">
                    {myPosition.trend === 'up' ? 'En hausse' : 
                     myPosition.trend === 'down' ? 'En baisse' : 'Stable'}
                  </span>
                </div>
                <Badge variant="secondary" className="mt-1">
                  {myPosition.rank <= 3 ? 'Top 3' : 
                   myPosition.rank <= 10 ? 'Top 10' : 
                   myPosition.rank <= 50 ? 'Top 50' : 'Top 100'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={currentType} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="GLOBAL">Global</TabsTrigger>
          <TabsTrigger value="MONTHLY">Mensuel</TabsTrigger>
          <TabsTrigger value="WEEKLY">Hebdomadaire</TabsTrigger>
        </TabsList>

        <TabsContent value="GLOBAL" className="space-y-4">
          <LeaderboardContent 
            top3={top3}
            rest={displayedUsers}
            showSurrounding={showSurrounding}
            onToggleSurrounding={() => setShowSurrounding(!showSurrounding)}
            myPosition={myPosition}
          />
        </TabsContent>

        <TabsContent value="MONTHLY" className="space-y-4">
          <LeaderboardContent 
            top3={top3}
            rest={displayedUsers}
            showSurrounding={showSurrounding}
            onToggleSurrounding={() => setShowSurrounding(!showSurrounding)}
            myPosition={myPosition}
          />
        </TabsContent>

        <TabsContent value="WEEKLY" className="space-y-4">
          <LeaderboardContent 
            top3={top3}
            rest={displayedUsers}
            showSurrounding={showSurrounding}
            onToggleSurrounding={() => setShowSurrounding(!showSurrounding)}
            myPosition={myPosition}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Leaderboard Content Component
interface LeaderboardContentProps {
  top3: any[];
  rest: any[];
  showSurrounding: boolean;
  onToggleSurrounding: () => void;
  myPosition: any;
}

function LeaderboardContent({ 
  top3, 
  rest, 
  showSurrounding, 
  onToggleSurrounding, 
  myPosition 
}: LeaderboardContentProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-amber-700';
    return 'bg-gray-100';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <>
      {/* Podium */}
      {top3.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Podium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-end space-x-4">
              {top3.map((user, index) => (
                <div key={user.userId} className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2 ${getRankColor(user.rank)}`}>
                    {user.rank}
                  </div>
                  <Avatar className="h-12 w-12 mx-auto mb-2">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-sm">{user.username}</h3>
                  <p className="text-xs text-gray-600">{user.xp} XP</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rest of the leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Classement complet</CardTitle>
            {myPosition && myPosition.rank > 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleSurrounding}
              >
                {showSurrounding ? 'Voir tout' : 'Autour de moi'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rest.map((user, index) => (
              <div
                key={user.userId}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  myPosition && user.userId === myPosition.userId
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(user.rank)}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{user.username}</h4>
                    <p className="text-sm text-gray-600">{user.xp} XP</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(user.trend)}
                  <Badge variant="secondary">
                    {user.rank <= 10 ? 'Top 10' : 
                     user.rank <= 50 ? 'Top 50' : 'Top 100'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Skeleton component
function LeaderboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
