import React, { useEffect, useState } from 'react';
import { useGamification } from '@/lib/apiComponent/hooks/useGamification';
import { useGamificationStore } from '@/stores/gamificationStore';
import { UserBadge } from './UserBadge';
import { TrophyUnlockedModal, BadgeUnlockedModal, LevelUpModal, XPGainedToast } from './RewardModals';
import { useGamificationRewards } from '@/hooks/useGamificationRewards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Star, TrendingUp, Users, Target } from 'lucide-react';
import { RARITY_COLORS, RARITY_LABELS, TROPHY_CATEGORY_LABELS } from '@/types/gamification';

export const GamificationDashboard: React.FC = () => {
  const { getDashboard, loading, error } = useGamification();
  const { dashboard, setDashboard } = useGamificationStore();
  const {
    showTrophyModal,
    showBadgeModal,
    showLevelUpModal,
    showXPToast,
    newTrophies,
    newBadges,
    levelUp,
    xpGained,
    closeTrophyModal,
    closeBadgeModal,
    closeLevelUpModal,
    closeXPToast,
  } = useGamificationRewards();

  useEffect(() => {
    const loadDashboard = async () => {
      const data = await getDashboard();
      if (data) {
        setDashboard(data);
      }
    };

    loadDashboard();
  }, [getDashboard, setDashboard]);

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>Erreur lors du chargement du dashboard: {error}</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Aucune donnée de gamification disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modales de récompenses */}
      <TrophyUnlockedModal
        isOpen={showTrophyModal}
        onClose={closeTrophyModal}
        trophies={newTrophies}
      />
      
      <BadgeUnlockedModal
        isOpen={showBadgeModal}
        onClose={closeBadgeModal}
        badges={newBadges}
      />
      
      <LevelUpModal
        isOpen={showLevelUpModal}
        onClose={closeLevelUpModal}
        levelUp={levelUp || { oldLevel: 0, newLevel: 0, xpGained: 0 }}
      />
      
      <XPGainedToast
        xpGained={xpGained}
        isVisible={showXPToast}
        onClose={closeXPToast}
      />

      {/* Header avec niveau et progression */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Dashboard Gamification</CardTitle>
              <p className="text-gray-600">Votre progression et vos récompenses</p>
            </div>
            <UserBadge userLevel={dashboard.level} size="lg" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barre de progression XP */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progression vers le niveau {dashboard.level.level + 1}</span>
                <span>{dashboard.level.currentXP} / {dashboard.level.totalXP} XP</span>
              </div>
              <Progress 
                value={dashboard.level.progressPercent} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Niveau {dashboard.level.level}</span>
                <span>{dashboard.level.xpToNextLevel} XP restants</span>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{dashboard.level.level}</div>
                <div className="text-sm text-gray-600">Niveau</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{dashboard.unlockedTrophies}</div>
                <div className="text-sm text-gray-600">Trophées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{dashboard.totalBadges}</div>
                <div className="text-sm text-gray-600">Badges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{dashboard.level.totalXP}</div>
                <div className="text-sm text-gray-600">XP Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trophées récents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Trophées Récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.recentTrophies.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentTrophies.slice(0, 3).map((userTrophy) => (
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
            ) : (
              <p className="text-gray-500 text-center py-4">
                Aucun trophée débloqué récemment
              </p>
            )}
          </CardContent>
        </Card>

        {/* Trophées en cours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Trophées en Cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.inProgressTrophies.length > 0 ? (
              <div className="space-y-3">
                {dashboard.inProgressTrophies.slice(0, 3).map((trophyProgress) => (
                  <div
                    key={trophyProgress.trophy.id}
                    className="p-3 rounded-lg border bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-lg"
                        style={{ backgroundColor: RARITY_COLORS[trophyProgress.trophy.rarity] + '20' }}
                      >
                        {trophyProgress.trophy.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">
                          {trophyProgress.trophy.nameFr}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {TROPHY_CATEGORY_LABELS[trophyProgress.trophy.category].fr}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progression</span>
                        <span>{Math.round(trophyProgress.progress * 100)}%</span>
                      </div>
                      <Progress value={trophyProgress.progress * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Aucun trophée en cours
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <div className="font-medium">Mes Trophées</div>
            </button>
            <button className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="font-medium">Mes Badges</div>
            </button>
            <button className="p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-medium">Historique XP</div>
            </button>
            <button className="p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="font-medium">Classement</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
