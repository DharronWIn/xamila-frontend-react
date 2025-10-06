import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Trophy,
    Clock,
    CheckCircle,
    PiggyBank,
    BarChart3
} from "lucide-react";
import { Challenge } from "@/lib/apiComponent/types";
import { useNavigate } from "react-router-dom";

interface CurrentChallengeCardProps {
  challenge: Challenge | null;
  isLoading?: boolean;
  error?: string | null;
}

export const CurrentChallengeCard = ({ 
  challenge, 
  isLoading = false, 
  error = null 
}: CurrentChallengeCardProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="font-medium">Erreur lors du chargement du challenge</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!challenge) {
    return (
      <Card className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="p-6">
          <div className="text-center text-gray-600">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-medium">Aucun challenge actuel</p>
            <p className="text-sm mt-1">Rejoignez un challenge pour commencer votre épargne !</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculer les jours restants
  const now = new Date();
  const endDate = new Date(challenge.endDate);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Calculer le pourcentage de progression
  const challengeProgress = challenge.currentAmount && challenge.targetAmount 
    ? (challenge.currentAmount / challenge.targetAmount) * 100 
    : 0;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{challenge.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {daysRemaining > 0 ? `${daysRemaining} jours restants` : 'Challenge terminé'}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Actif
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progression */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression</span>
            <span className="font-medium">
              {challenge.currentAmount?.toLocaleString() || 0}€ / {challenge.targetAmount.toLocaleString()}€
            </span>
          </div>
          <Progress value={challengeProgress} className="h-2" />
          <div className="text-right text-sm text-muted-foreground">
            {challengeProgress.toFixed(1)}% complété
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate('/user-dashboard/my-challenge')}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <PiggyBank className="w-4 h-4 mr-2" />
            Aller à ma caisse
          </Button>
          <Button 
            onClick={() => navigate(`/user-dashboard/collective-progress?challengeId=${challenge.id}`)}
            variant="outline"
            className="flex-1"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Voir la progression collective
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
