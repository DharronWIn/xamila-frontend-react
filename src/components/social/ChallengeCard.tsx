import { motion } from "framer-motion";
import { useState } from "react";
import {
  Trophy,
  Users,
  Target,
  Calendar,
  Clock,
  Star, Crown,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocialStore } from "@/stores/socialStore";
import { Challenge } from "@/stores/socialStore";
import { getUserProfilePicture } from "@/lib/utils";

interface ChallengeCardProps {
  challenge: Challenge;
  showJoinButton?: boolean;
}

const ChallengeCard = ({ challenge, showJoinButton = true }: ChallengeCardProps) => {
  const { joinChallenge } = useSocialStore();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinChallenge = async () => {
    setIsJoining(true);
    try {
      await joinChallenge(challenge.id);
    } catch (error) {
      console.error("Error joining challenge:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'monthly':
        return <Calendar className="w-4 h-4" />;
      case 'weekly':
        return <Clock className="w-4 h-4" />;
      case 'daily':
        return <Target className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
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

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'bg-blue-100 text-blue-800';
      case 'weekly':
        return 'bg-green-100 text-green-800';
      case 'daily':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (days: number) => {
    if (days < 7) return `${days} jour${days > 1 ? 's' : ''}`;
    if (days < 30) return `${Math.floor(days / 7)} semaine${Math.floor(days / 7) > 1 ? 's' : ''}`;
    return `${Math.floor(days / 30)} mois`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const isActive = challenge.isActive && new Date(challenge.endDate) > new Date();
  const isCompleted = new Date(challenge.endDate) <= new Date();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`transition-all duration-300 ${
        isCompleted ? 'opacity-75' : 'hover:shadow-lg'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${
                isCompleted ? 'bg-gray-100' : 'bg-primary/10'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-gray-600" />
                ) : (
                  getChallengeTypeIcon(challenge.type)
                )}
              </div>
              <div>
                <CardTitle className="text-sm font-semibold line-clamp-1">
                  {challenge.title}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getChallengeTypeColor(challenge.type)}`}
                  >
                    {getChallengeTypeLabel(challenge.type)}
                  </Badge>
                  {isCompleted && (
                    <Badge variant="outline" className="text-xs">
                      Terminé
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {showJoinButton && !isCompleted && (
              <Button
                size="sm"
                onClick={handleJoinChallenge}
                disabled={isJoining}
                className="h-8 px-3 text-xs"
              >
                {isJoining ? 'Rejoindre...' : 'Rejoindre'}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {challenge.description}
          </p>

          {/* Target Amount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Objectif</span>
            </div>
            <span className="font-semibold text-lg text-primary">
              {challenge.targetAmount.toLocaleString()}€
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Durée</span>
            </div>
            <span className="text-sm font-medium">
              {formatDuration(challenge.duration)}
            </span>
          </div>

          {/* Participants */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Participants</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{challenge.participants}</span>
              {challenge.participants > 10 && (
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Populaire
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar (if challenge is active) */}
          {isActive && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progression</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          )}

          {/* Rewards */}
          {challenge.rewards.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Récompenses</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {challenge.rewards.slice(0, 2).map((reward, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {reward}
                  </Badge>
                ))}
                {challenge.rewards.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{challenge.rewards.length - 2} autres
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Creator */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={getUserProfilePicture({ avatar: challenge.createdByAvatar, pictureProfilUrl: challenge.createdByPictureProfilUrl })} />
                <AvatarFallback>{challenge.createdByName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600">
                Par {challenge.createdByName}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>
                {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
              </span>
            </div>
          </div>

          {/* Premium Badge */}
          {challenge.participants > 20 && (
            <div className="flex items-center justify-center space-x-1 pt-2 border-t">
              <Crown className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-yellow-600 font-medium">
                Défi Premium
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export { ChallengeCard };
export default ChallengeCard;
