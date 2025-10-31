import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Trophy,
    Clock,
    CheckCircle,
    PiggyBank,
    BarChart3,
    Target
} from "lucide-react";
import { CurrentChallengeResponse, Challenge } from "@/lib/apiComponent/types";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

// Type étendu pour le challenge disponible
interface AvailableChallenge extends Challenge {
  isUpcoming?: boolean;
  isJoined?: boolean;
  hasAbandoned?: boolean;
  collectiveTarget?: number;
  collectiveCurrentAmount?: number;
  collectiveProgress?: number;
  _count?: {
    participants?: number;
    transactions?: number;
  };
  createdByUser?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    pictureProfilUrl?: string | null;
  };
}

interface DashboardInfoCardProps {
  // Type de contenu à afficher
  type: "currentChallenge" | "availableChallenge" | "custom";
  
  // Pour currentChallenge
  currentChallenge?: CurrentChallengeResponse | null;
  daysRemaining?: number;
  
  // Pour availableChallenge
  availableChallenge?: AvailableChallenge | null;
  
  // Pour custom
  customContent?: ReactNode;
  
  // État de chargement
  isLoading?: boolean;
}

export function DashboardInfoCard({
  type,
  currentChallenge,
  daysRemaining,
  availableChallenge,
  customContent,
  isLoading = false,
}: DashboardInfoCardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="border shadow-md">
        <CardContent className="p-3 sm:p-4">
          <div className="animate-pulse space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="h-3 sm:h-4 w-full max-w-[150px] sm:max-w-[200px] bg-gray-200 rounded" />
                <div className="h-2.5 sm:h-3 w-full max-w-[100px] sm:max-w-[150px] bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded" />
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="h-8 sm:h-9 flex-1 bg-gray-200 rounded" />
              <div className="h-8 sm:h-9 flex-1 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Type: Challenge actif de l'utilisateur
  if (type === "currentChallenge" && currentChallenge) {
    // Utiliser les données du userParticipation et goal directement
    const userParticipation = currentChallenge.userParticipation;
    const goal = userParticipation?.goal;
    const currentAmount = userParticipation?.currentAmount || 0;
    const targetAmount = goal?.targetAmount || currentChallenge.targetAmount || 0;
    const challengeProgress = goal?.progress || (targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0);

    return (
      <Card className="border shadow-md">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
                    Challenge actif
                  </div>
                  <div className="font-semibold text-sm sm:text-base leading-tight line-clamp-2 break-words">
                    {currentChallenge.title}
                  </div>
                  {daysRemaining !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 sm:mt-1">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        {daysRemaining > 0
                          ? `${daysRemaining} jours restants`
                          : "Terminé"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <Progress value={challengeProgress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground gap-1 sm:gap-2">
                <span className="truncate text-[10px] sm:text-xs">
                  {currentAmount.toLocaleString()} FCFA
                </span>
                <span className="flex-shrink-0 text-xs">{challengeProgress.toFixed(0)}%</span>
                <span className="truncate text-[10px] sm:text-xs">
                  {targetAmount.toLocaleString()} FCFA
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button
                size="sm"
                className="flex-1 text-xs sm:text-sm"
                onClick={() => navigate("/user-dashboard/my-challenge")}
              >
                <PiggyBank className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Aller à ma caisse</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs sm:text-sm"
                onClick={() =>
                  navigate(
                    `/user-dashboard/collective-progress`
                  )
                }
              >
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate hidden sm:inline">Progression collective</span>
                <span className="truncate sm:hidden">Collective</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Type: Challenge disponible
  if (type === "availableChallenge" && availableChallenge) {
    return (
      <Card className="border shadow-md">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 mb-0.5 sm:mb-1 break-words">
                    {availableChallenge.title}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground mb-1 sm:mb-2 flex-wrap">
                    {availableChallenge.isUpcoming ? (
                      <>
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">À venir</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="truncate">Actif maintenant</span>
                      </>
                    )}
                  </div>
                  {availableChallenge.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                      {availableChallenge.description}
                    </p>
                  )}
                </div>
              </div>
              {availableChallenge._count?.participants && (
                <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">
                  {availableChallenge._count.participants} participant{availableChallenge._count.participants !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Informations essentielles du challenge */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 border-t">
              <div className="text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Objectif</p>
                <p className="text-xs sm:text-sm font-semibold truncate">
                  {availableChallenge.targetAmount?.toLocaleString() || 0} FCFA
                </p>
              </div>
              {availableChallenge.collectiveTarget ? (
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Collectif</p>
                  <p className="text-xs sm:text-sm font-semibold">
                    <span className="truncate block">
                      {availableChallenge.collectiveCurrentAmount?.toLocaleString() || 0} / {availableChallenge.collectiveTarget.toLocaleString()} FCFA
                    </span>
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Participants</p>
                  <p className="text-xs sm:text-sm font-semibold">
                    {availableChallenge._count?.participants || 0}
                  </p>
                </div>
              )}
            </div>

            {availableChallenge.collectiveProgress !== undefined &&
              availableChallenge.collectiveProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs gap-2">
                    <span className="text-muted-foreground truncate">
                      Progression collective
                    </span>
                    <span className="font-semibold flex-shrink-0">
                      {availableChallenge.collectiveProgress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={availableChallenge.collectiveProgress}
                    className="h-2"
                  />
                </div>
              )}

            <div className="flex gap-2 pt-1 sm:pt-2">
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs sm:text-sm"
                size="sm"
                onClick={() => navigate(`/user-dashboard/challenges`)}
              >
                <span className="truncate">Voir les challenges</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Type: Custom content
  if (type === "custom" && customContent) {
    return (
      <Card className="border shadow-md">
        <CardContent className="p-3 sm:p-4">{customContent}</CardContent>
      </Card>
    );
  }

  // Fallback: Message par défaut
  return (
    <Card className="border shadow-md">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Target className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate break-words">
              Rejoignez un challenge 6 mois c'est 6 mois
            </span>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs sm:text-sm flex-shrink-0 w-full sm:w-auto"
            size="sm"
            onClick={() => navigate("/user-dashboard/challenges")}
          >
            <span className="truncate">Découvrir</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

