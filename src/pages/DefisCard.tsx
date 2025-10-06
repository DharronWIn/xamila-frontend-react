import { useState } from "react";
import { motion } from "framer-motion";
import {
    Trophy,
    Calendar,
    Clock,
    Target,
    Users,
    Award, User, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getUserProfilePicture } from "@/lib/utils";

interface DefisCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    type: 'monthly' | 'weekly' | 'daily' | 'custom';
    targetAmount: number;
    duration: number;
    participants: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdBy: string;
    createdByName: string;
    createdByAvatar?: string;
    createdByPictureProfilUrl?: string;
    rewards: string[];
    participantsList: {
      userId: string;
      userName: string;
      userAvatar?: string;
      progress: number;
      amount: number;
    }[];
  };
  onJoin?: () => void;
  onViewDetails?: () => void;
  showJoinButton?: boolean;
}

const DefisCard = ({ 
  challenge, 
  onJoin, 
  onViewDetails,
  showJoinButton = true 
}: DefisCardProps) => {
  const [isJoining, setIsJoining] = useState(false);

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'monthly': return <Calendar className="w-4 h-4" />;
      case 'weekly': return <Clock className="w-4 h-4" />;
      case 'daily': return <Target className="w-4 h-4" />;
      case 'custom': return <Trophy className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly': return 'Mensuel';
      case 'weekly': return 'Hebdomadaire';
      case 'daily': return 'Quotidien';
      case 'custom': return 'Personnalisé';
      default: return 'Défi';
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'monthly': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'weekly': return 'bg-green-100 text-green-800 border-green-200';
      case 'daily': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'custom': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChallengeStatus = () => {
    const now = new Date();
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);
    
    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'active';
    return 'completed';
  };

  const getStatusBadge = () => {
    const status = getChallengeStatus();
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">À venir</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-600">Actif</Badge>;
      case 'completed':
        return <Badge variant="secondary">Terminé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getTimeInfo = () => {
    const now = new Date();
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);
    const status = getChallengeStatus();
    
    if (status === 'upcoming') {
      return `Commence ${formatDistanceToNow(startDate, { addSuffix: true, locale: fr })}`;
    } else if (status === 'active') {
      return `Se termine ${formatDistanceToNow(endDate, { addSuffix: true, locale: fr })}`;
    } else {
      return `Terminé ${formatDistanceToNow(endDate, { addSuffix: true, locale: fr })}`;
    }
  };

  const handleJoin = async () => {
    if (!onJoin) return;
    
    setIsJoining(true);
    try {
      await onJoin();
    } finally {
      setIsJoining(false);
    }
  };

  const canJoin = () => {
    const status = getChallengeStatus();
    return status === 'upcoming' || status === 'active';
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${getChallengeTypeColor(challenge.type)}`}>
                {getChallengeTypeIcon(challenge.type)}
              </div>
              <div>
                <Badge variant="outline" className={getChallengeTypeColor(challenge.type)}>
                  {getChallengeTypeLabel(challenge.type)}
                </Badge>
              </div>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="mt-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {challenge.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {challenge.description}
            </p>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Creator Info */}
          <div className="flex items-center space-x-2 mb-4">
            <Avatar className="w-6 h-6">
              <AvatarImage src={getUserProfilePicture({ avatar: challenge.createdByAvatar, pictureProfilUrl: challenge.createdByPictureProfilUrl })} />
              <AvatarFallback>
                <User className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">
              Par {challenge.createdByName}
            </span>
          </div>

          {/* Challenge Stats */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-gray-600">
                <Target className="w-4 h-4" />
                <span>Objectif</span>
              </div>
              <span className="font-semibold">{challenge.targetAmount.toLocaleString()}€</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Durée</span>
              </div>
              <span className="font-semibold">{challenge.duration} jours</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-gray-600">
                <Users className="w-4 h-4" />
                <span>Participants</span>
              </div>
              <span className="font-semibold">{challenge.participants}</span>
            </div>
          </div>

          {/* Rewards */}
          {challenge.rewards.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-1 mb-2">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Récompenses</span>
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

          {/* Time Info */}
          <div className="text-sm text-gray-500 mb-4">
            {getTimeInfo()}
          </div>

          {/* Actions */}
          <div className="mt-auto space-y-2">
            {showJoinButton && canJoin() ? (
              <Button 
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full"
                size="sm"
              >
                {isJoining ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Rejoindre...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4" />
                    <span>Rejoindre le défi</span>
                  </div>
                )}
              </Button>
            ) : !canJoin() ? (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500">
                  Ce défi n'est plus disponible
                </p>
              </div>
            ) : null}

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={onViewDetails}
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir les détails
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DefisCard;
