import { RewardManager } from '@/components/gamification/RewardManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function GamificationTest() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🎮 Test du Système de Récompenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Ce composant teste le système de vérification des récompenses.
            Les récompenses sont vérifiées automatiquement au chargement du dashboard.
          </p>
          
          <div className="flex gap-4">
            <RewardManager 
              autoCheck={false}
              onRewardsChecked={(rewards) => {
                console.log('Récompenses reçues:', rewards);
              }}
            />
          </div>
          
          <div className="text-sm text-gray-500">
            <p><strong>Fonctionnalités :</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Vérification automatique au chargement du dashboard</li>
              <li>Affichage des modals pour trophées, badges et level up</li>
              <li>Notifications toast pour chaque type de récompense</li>
              <li>Gestion des combos de récompenses</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}








