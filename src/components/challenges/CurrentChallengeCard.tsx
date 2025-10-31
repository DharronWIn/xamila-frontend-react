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
import { CurrentChallengeResponse } from "@/lib/apiComponent/types";
import { useNavigate } from "react-router-dom";

interface CurrentChallengeCardProps {
  challenge: CurrentChallengeResponse | null;
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
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="h-4 sm:h-6 w-full max-w-[200px] bg-gray-200 rounded animate-pulse" />
                <div className="h-3 sm:h-4 w-full max-w-[150px] bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-3 sm:h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="h-9 sm:h-10 flex-1 bg-gray-200 rounded animate-pulse" />
            <div className="h-9 sm:h-10 flex-1 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center text-red-600">
            <p className="font-medium text-sm sm:text-base">Erreur lors du chargement du challenge</p>
            <p className="text-xs sm:text-sm mt-1 break-words">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!challenge) {
    return (
      <Card className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center text-gray-600">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-400" />
            <p className="font-medium text-sm sm:text-base">Aucun challenge actuel</p>
            <p className="text-xs sm:text-sm mt-1">Rejoignez un challenge pour commencer votre épargne !</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculer les jours restants
  const now = new Date();
  const endDate = new Date(challenge.endDate);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Calculer le pourcentage de progression à partir du goal
  const userParticipation = challenge.userParticipation;
  const goal = userParticipation?.goal;
  const currentAmount = userParticipation?.currentAmount || 0;
  const targetAmount = goal?.targetAmount || challenge.targetAmount || 0;
  const challengeProgress = goal?.progress || (targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0);

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg lg:text-xl truncate break-words">{challenge.title}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mt-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">
                  {daysRemaining > 0 ? `${daysRemaining} jours restants` : 'Challenge terminé'}
                </span>
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 flex-shrink-0 text-xs sm:text-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Actif
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Progression */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm gap-2">
            <span className="flex-shrink-0">Progression</span>
            <span className="font-medium text-right truncate">
              {currentAmount.toLocaleString()}€ / {targetAmount.toLocaleString()}€
            </span>
          </div>
          <Progress value={challengeProgress} className="h-2" />
          <div className="text-right text-xs sm:text-sm text-muted-foreground">
            {challengeProgress.toFixed(1)}% complété
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={() => navigate('/user-dashboard/my-challenge')}
            className="flex-1 bg-primary hover:bg-primary/90 text-sm sm:text-base"
            size="sm"
          >
            <PiggyBank className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Aller à ma caisse</span>
          </Button>
          <Button 
            onClick={() => navigate(`/user-dashboard/collective-progress?challengeId=${challenge.id}`)}
            variant="outline"
            className="flex-1 text-sm sm:text-base"
            size="sm"
          >
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate hidden sm:inline">Voir la progression collective</span>
            <span className="truncate sm:hidden">Progression collective</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
