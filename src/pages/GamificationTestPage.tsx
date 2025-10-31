import React from 'react';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';
import { useGamificationRewards } from '@/hooks/useGamificationRewards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Award, Star, Zap } from 'lucide-react';

export const GamificationTestPage: React.FC = () => {
  const {
    checkAfterTransaction,
    checkAfterSavings,
    checkAfterChallengeCompleted,
    checkAfterDefiCompleted,
    checkAfterDefiCreated,
    checkAfterPostCreated,
    checkAfterLikeReceived,
    checkAfterCommentPosted,
    isChecking,
  } = useGamificationRewards();

  const testActions = [
    {
      label: 'Simuler Transaction',
      description: 'Gain typique: +2 XP',
      icon: <Zap className="h-4 w-4" />,
      action: checkAfterTransaction,
    },
    {
      label: 'Simuler Épargne',
      description: 'Gain typique: +5 XP par 1000 F',
      icon: <Star className="h-4 w-4" />,
      action: checkAfterSavings,
    },
    {
      label: 'Simuler Challenge Complété',
      description: 'Gain typique: +100 XP',
      icon: <Trophy className="h-4 w-4" />,
      action: checkAfterChallengeCompleted,
    },
    {
      label: 'Simuler Défi Complété',
      description: 'Gain typique: +50 XP',
      icon: <Award className="h-4 w-4" />,
      action: checkAfterDefiCompleted,
    },
    {
      label: 'Simuler Défi Créé',
      description: 'Gain typique: +30 XP',
      icon: <Award className="h-4 w-4" />,
      action: checkAfterDefiCreated,
    },
    {
      label: 'Simuler Post Créé',
      description: 'Gain typique: +10 XP',
      icon: <Star className="h-4 w-4" />,
      action: checkAfterPostCreated,
    },
    {
      label: 'Simuler Like Reçu',
      description: 'Gain typique: +2 XP',
      icon: <Star className="h-4 w-4" />,
      action: checkAfterLikeReceived,
    },
    {
      label: 'Simuler Commentaire Posté',
      description: 'Gain typique: +5 XP',
      icon: <Star className="h-4 w-4" />,
      action: checkAfterCommentPosted,
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Test de Gamification
        </h1>
        <p className="text-gray-600">
          Testez les différentes actions et leurs récompenses
        </p>
      </div>

      {/* Actions de test */}
      <Card>
        <CardHeader>
          <CardTitle>Actions de Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {testActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                disabled={isChecking}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                {action.icon}
                <div className="text-center">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
          
          {isChecking && (
            <div className="mt-4 text-center text-blue-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Vérification des récompenses...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard de gamification */}
      <GamificationDashboard />
    </div>
  );
};
