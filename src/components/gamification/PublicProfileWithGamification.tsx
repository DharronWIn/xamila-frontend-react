import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UserBadge } from './UserBadge';
import { PublicProfile, RARITY_COLORS, RARITY_LABELS, TROPHY_CATEGORY_LABELS } from '@/types/gamification';
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  Users, 
  MessageCircle, 
  Calendar,
  Crown,
  TrendingUp
} from 'lucide-react';

interface PublicProfileWithGamificationProps {
  profile: PublicProfile;
  onFollow?: () => void;
  onMessage?: () => void;
  isFollowing?: boolean;
}

export const PublicProfileWithGamification: React.FC<PublicProfileWithGamificationProps> = ({
  profile,
  onFollow,
  onMessage,
  isFollowing = false
}) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header du profil */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.pictureProfilUrl} />
              <AvatarFallback className="text-2xl">
                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Informations principales */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.name}
                  </h1>
                  <p className="text-gray-600">@{profile.username}</p>
                  
                  {/* Badge de gamification */}
                  <div className="mt-2">
                    <UserBadge 
                      userLevel={{
                        level: profile.gamification.level,
                        totalXP: profile.gamification.totalXP,
                        rank: profile.gamification.rank,
                        totalTrophies: profile.gamification.totalTrophies,
                        totalBadges: profile.gamification.totalBadges,
                      }}
                      size="lg"
                    />
                  </div>

                  {/* Membre depuis */}
                  <div className="flex items-center space-x-1 mt-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Membre depuis {formatDate(profile.memberSince)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {onFollow && (
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      onClick={onFollow}
                    >
                      {isFollowing ? "Suivi" : "Suivre"}
                    </Button>
                  )}
                  {onMessage && (
                    <Button variant="outline" onClick={onMessage}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques de gamification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span>Progression</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {profile.gamification.level}
              </div>
              <div className="text-sm text-gray-600">Niveau</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {profile.gamification.totalTrophies}
              </div>
              <div className="text-sm text-gray-600">Trophées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {profile.gamification.totalBadges}
              </div>
              <div className="text-sm text-gray-600">Badges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {profile.gamification.totalXP.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">XP Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trophées récents */}
      {profile.gamification.recentTrophies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span>Trophées Récents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.gamification.recentTrophies.slice(0, 4).map((userTrophy) => (
                <div
                  key={userTrophy.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border bg-gray-50"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
                    style={{ backgroundColor: RARITY_COLORS[userTrophy.trophy.rarity] + '20' }}
                  >
                    {userTrophy.trophy.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">
                        {userTrophy.trophy.nameFr}
                      </h4>
                      <Badge
                        variant="secondary"
                        style={{ 
                          backgroundColor: RARITY_COLORS[userTrophy.trophy.rarity] + '20',
                          color: RARITY_COLORS[userTrophy.trophy.rarity]
                        }}
                      >
                        {RARITY_LABELS[userTrophy.trophy.rarity].fr}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {TROPHY_CATEGORY_LABELS[userTrophy.trophy.category].fr}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      {profile.gamification.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span>Badges</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.gamification.badges.map((userBadge) => (
                <div
                  key={userBadge.id}
                  className="flex flex-col items-center space-y-2 p-3 rounded-lg border bg-gray-50"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                    style={{ backgroundColor: userBadge.badge.color + '20' }}
                  >
                    {userBadge.badge.icon}
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {userBadge.badge.nameFr}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {userBadge.badge.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques d'activité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Activité</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {profile.stats.challengesParticipated}
              </div>
              <div className="text-sm text-gray-600">Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {profile.stats.defisParticipated}
              </div>
              <div className="text-sm text-gray-600">Défis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {profile.stats.postsCreated}
              </div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
