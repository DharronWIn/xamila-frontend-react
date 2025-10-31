import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserBadge } from './UserBadge';
import { LeaderboardEntry, UserRank, RANK_EMOJIS, RANK_COLORS } from '@/types/gamification';
import { Trophy, Medal, Crown, Target, TrendingUp } from 'lucide-react';

interface LeaderboardWithGamificationProps {
  leaderboard: LeaderboardEntry[];
  currentUserRank: number;
  challengeId: string;
  title?: string;
  showProgress?: boolean;
}

export const LeaderboardWithGamification: React.FC<LeaderboardWithGamificationProps> = ({
  leaderboard,
  currentUserRank,
  challengeId,
  title = "Classement",
  showProgress = true
}) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <Trophy className="h-4 w-4 text-gray-500" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'text-gray-600 bg-gray-50 border-gray-200';
    if (rank === 3) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-gray-500 bg-gray-50 border-gray-200';
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${Math.round(percentage)}%`;
  };

  const formatConsistency = (consistency: number) => {
    return `${Math.round(consistency * 100)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <span>{title}</span>
          <Badge variant="outline" className="ml-auto">
            {leaderboard.length} participants
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
                entry.rank === currentUserRank
                  ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              {/* Rang */}
              <div className="flex-shrink-0">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${getRankColor(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                </div>
              </div>

              {/* Avatar et nom */}
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/api/avatars/${entry.userId}`} />
                  <AvatarFallback>
                    {entry.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Informations utilisateur */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {entry.userName}
                  </h3>
                  <UserBadge 
                    userLevel={{
                      level: entry.level,
                      totalXP: entry.totalXP,
                      rank: entry.userRank,
                      totalTrophies: 0, // Pas disponible dans LeaderboardEntry
                      totalBadges: 0,   // Pas disponible dans LeaderboardEntry
                    }}
                    size="sm"
                    showLevel={false}
                  />
                </div>
                
                {/* Statistiques */}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <Target className="h-3 w-3" />
                    <span>{entry.transactionCount} transactions</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{formatConsistency(entry.consistency)} consistance</span>
                  </span>
                </div>
              </div>

              {/* Progression */}
              {showProgress && (
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatAmount(entry.currentAmount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    sur {formatAmount(entry.targetAmount)}
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${entry.progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatPercentage(entry.progressPercentage)}
                  </div>
                </div>
              )}

              {/* Montant total */}
              {!showProgress && (
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatAmount(entry.currentAmount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatPercentage(entry.progressPercentage)} complété
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Position de l'utilisateur actuel si pas dans le top */}
          {currentUserRank > leaderboard.length && (
            <div className="pt-4 border-t border-gray-200">
              <div className="text-center text-gray-500 text-sm">
                Votre position: #{currentUserRank}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Composant pour afficher un classement simple (sans progression)
export const SimpleLeaderboardWithGamification: React.FC<{
  leaderboard: LeaderboardEntry[];
  title?: string;
}> = ({ leaderboard, title = "Classement" }) => {
  return (
    <LeaderboardWithGamification
      leaderboard={leaderboard}
      currentUserRank={0}
      challengeId=""
      title={title}
      showProgress={false}
    />
  );
};
