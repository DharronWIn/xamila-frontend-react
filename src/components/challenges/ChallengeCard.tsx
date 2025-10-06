import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Calendar,
  Users,
  Target,
  Clock,
  Plus,
  CheckCircle,
  AlertCircle, TrendingUp,
  Award,
  Banknote,
  PiggyBank,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/apiComponent/hooks/useAuth';
import { SavingsChallenge } from '@/types/challenge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChallengeCardProps {
  challenge: SavingsChallenge;
  onJoin?: (challengeId: string) => void;
  onViewDetails?: (challengeId: string) => void;
  onGoToMyChallenge?: (challengeId: string) => void;
  onViewCollectiveProgress?: (challengeId: string) => void;
  showJoinButton?: boolean;
  isJoined?: boolean; // Si l'utilisateur participe à ce challenge
  hasAbandoned?: boolean; // Si l'utilisateur a abandonné ce challenge
}

export const ChallengeCard = ({ 
  challenge, 
  onJoin, 
  onViewDetails, 
  onGoToMyChallenge,
  onViewCollectiveProgress,
  showJoinButton = true,
  isJoined = false,
  hasAbandoned = false
}: ChallengeCardProps) => {
  const { user: currentUser } = useAuth();
  const [isJoining, setIsJoining] = useState(false);

  const now = new Date();
  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  
  // Logique simplifiée basée sur les dates uniquement
  const isChallengeNotStarted = now < startDate; // Challenge pas encore commencé
  const isChallengeInProgress = now >= startDate && now <= endDate; // Challenge en cours
  const isChallengeFinished = now > endDate; // Challenge terminé
  
  // Conditions simplifiées
  const canJoin = isChallengeNotStarted && !isJoined && !hasAbandoned;
  
  // Debug logs
  console.log('ChallengeCard - Challenge:', challenge.title, 'isJoined:', isJoined, 'hasAbandoned:', hasAbandoned, 'canJoin:', canJoin, 'isChallengeNotStarted:', isChallengeNotStarted, 'showJoinButton:', showJoinButton, 'willShowButtons:', showJoinButton && (isJoined || canJoin));

  const getStatusBadge = () => {
    if (isChallengeNotStarted) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Clock className="w-3 h-3 mr-1" />
        À venir
      </Badge>;
    } else if (isChallengeInProgress) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">
        <TrendingUp className="w-3 h-3 mr-1" />
        En cours
      </Badge>;
    } else if (isChallengeFinished) {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Terminé
      </Badge>;
    }
    return <Badge variant="outline">Inconnu</Badge>;
  };

  const getTypeIcon = () => {
    switch (challenge.type) {
      case 'monthly':
        return <Calendar className="w-4 h-4" />;
      case 'weekly':
        return <Target className="w-4 h-4" />;
      case 'daily':
        return <Clock className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (challenge.type) {
      case 'monthly':
        return 'Mensuel';
      case 'weekly':
        return 'Hebdomadaire';
      case 'daily':
        return 'Quotidien';
      default:
        return 'Personnalisé';
    }
  };

  const handleJoin = async () => {
    if (!canJoin) return;
    
    setIsJoining(true);
    try {
      if (onJoin) {
        await onJoin(challenge.id);
      }
    } finally {
      setIsJoining(false);
    }
  };

  const getTimeInfo = () => {
    if (isChallengeNotStarted) {
      return `Commence ${formatDistanceToNow(startDate, { addSuffix: true, locale: fr })}`;
    } else if (isChallengeInProgress) {
      return `Se termine ${formatDistanceToNow(endDate, { addSuffix: true, locale: fr })}`;
    } else {
      return 'Challenge terminé';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                {getTypeIcon()}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors leading-tight">
                  {challenge.title}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  {getStatusBadge()}
                </div>
              </div>
            </div>
            
            {challenge.rewards.length > 0 && (
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-500">{challenge.rewards.length} récompenses</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {challenge.description}
          </p>

          {/* Objectif et participants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                <Banknote className="w-4 h-4 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">Objectif</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {challenge.targetAmount.toLocaleString()}€
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">Participants</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {challenge.participants}
                  {challenge.maxParticipants && `/${challenge.maxParticipants}`}
                </p>
              </div>
            </div>
          </div>

          {/* Durée et dates */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{getTimeInfo()}</span>
            </div>
            
            {/* Dates exactes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Début: {startDate.toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Fin: {endDate.toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          {/* Récompenses */}
          {challenge.rewards.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">Récompenses :</p>
              <div className="flex flex-wrap gap-1">
                {challenge.rewards.slice(0, 3).map((reward, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                    {reward}
                  </Badge>
                ))}
                {challenge.rewards.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    +{challenge.rewards.length - 3} autres
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-3">
            {showJoinButton && (isJoined || canJoin) && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {isJoined ? (
                  <>
                    <Button
                      onClick={() => onGoToMyChallenge?.(challenge.id)}
                      className="flex-1 bg-primary text-white hover:bg-primary/90 h-10"
                      size="sm"
                    >
                      <PiggyBank className="w-4 h-4 mr-2" />
                      <span className="truncate">Aller à ma caisse</span>
                    </Button>
                    <Button
                      onClick={() => onViewCollectiveProgress?.(challenge.id)}
                      variant="outline"
                      className="flex-1 h-10"
                      size="sm"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      <span className="truncate">Progression collective</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="flex-1 h-10"
                    size="sm"
                  >
                    {isJoining ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        <span className="truncate">Rejoindre...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="truncate">Rejoindre</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Messages d'information détaillés */}
          {!canJoin && !isJoined && (
            <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                {(() => {
                  if (isChallengeFinished) return 'Ce challenge est terminé.';
                  if (isChallengeInProgress) return 'Ce challenge a déjà commencé. Rejoignez le prochain !';
                  if (hasAbandoned) return 'Vous avez abandonné ce challenge précédemment.';
                  return 'Impossible de rejoindre ce challenge.';
                })()}
              </p>
            </div>
          )}

          {/* Message de confirmation pour l'utilisateur déjà dans le challenge */}
          {isJoined && (
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-700 font-medium">
                  Vous participez déjà à ce challenge !
                </p>
                {challenge.userParticipation?.currentAmount && (
                  <p className="text-xs text-green-600 mt-1 leading-relaxed">
                    Progression : {challenge.userParticipation.currentAmount.toLocaleString()}€ sur {challenge.targetAmount.toLocaleString()}€
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
