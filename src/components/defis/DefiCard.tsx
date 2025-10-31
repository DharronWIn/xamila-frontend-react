import { motion } from "framer-motion";
import { Calendar, Users, Trophy, Award, Clock, Lock, Globe, UserCheck } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import type { Defi } from "@/types/defi";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";

interface DefiCardProps {
  defi: Defi;
  onJoin?: (defiId: string) => void;
  onView?: (defiId: string) => void;
  showJoinButton?: boolean;
}

export const DefiCard = ({ defi, onJoin, onView, showJoinButton = true }: DefiCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">À venir</Badge>;
      case 'ACTIVE':
        return <Badge className="bg-green-600 hover:bg-green-700">Actif</Badge>;
      case 'COMPLETED':
        return <Badge variant="secondary">Terminé</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Annulé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const types = {
      'WEEKLY': { label: 'Hebdomadaire', icon: Calendar, color: 'bg-purple-100 text-purple-700' },
      'MONTHLY': { label: 'Mensuel', icon: Calendar, color: 'bg-blue-100 text-blue-700' },
      'DAILY': { label: 'Quotidien', icon: Clock, color: 'bg-orange-100 text-orange-700' },
      'CUSTOM': { label: 'Personnalisé', icon: Trophy, color: 'bg-gray-100 text-gray-700' },
    };

    const typeInfo = types[type as keyof typeof types] || types.CUSTOM;
    const Icon = typeInfo.icon;

    return (
      <Badge variant="outline" className={typeInfo.color}>
        <Icon className="w-3 h-3 mr-1" />
        {typeInfo.label}
      </Badge>
    );
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return <Globe className="w-4 h-4 text-green-600" />;
      case 'PRIVATE':
        return <Lock className="w-4 h-4 text-red-600" />;
      case 'FRIENDS':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <Globe className="w-4 h-4 text-gray-600" />;
    }
  };

  const participantCount = defi._count?.participants || 0;
  const isLimited = !defi.isUnlimited && defi.maxParticipants;
  const isFull = isLimited && participantCount >= (defi.maxParticipants || 0);
  const collectiveProgress = defi.collectiveProgress || 0;
  const currency = defi.currency || 'XOF';
  const totalSaved = defi.totalAmountSaved || defi.collectiveCurrentAmount || 0;

  const formatDate = (dateString: string) => {
    try {
      return formatDistance(new Date(dateString), new Date(), { 
        addSuffix: true,
        locale: fr 
      });
    } catch {
      return 'Date inconnue';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {defi.isOfficial && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                  <Trophy className="w-3 h-3 mr-1" />
                  Officiel
                </Badge>
              )}
              {getStatusBadge(defi.status)}
            </div>
            {getVisibilityIcon(defi.visibility)}
          </div>

          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2">
            {defi.title}
          </h3>

          {defi.createdByUser && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Avatar className="w-6 h-6">
                <AvatarImage src={defi.createdByUser.pictureProfilUrl} />
                <AvatarFallback>
                  {defi.createdByUser.firstName?.charAt(0)}
                  {defi.createdByUser.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>
                Par {defi.createdByUser.firstName} {defi.createdByUser.lastName}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 pb-3 space-y-4">
          <p className="text-gray-600 text-sm line-clamp-3">
            {defi.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {getTypeBadge(defi.type)}
            {defi.hasNoEndDate && (
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                ♾️ Permanent
              </Badge>
            )}
            {defi.isUnlimited && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                Sans limite
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span>
                  {participantCount} participant{participantCount > 1 ? 's' : ''}
                  {isLimited && ` / ${defi.maxParticipants}`}
                </span>
              </div>
              {isFull && (
                <Badge variant="destructive" className="text-xs">Complet</Badge>
              )}
            </div>

            {totalSaved > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total épargné</span>
                <span className="font-semibold text-green-600">
                  {(totalSaved / 1000).toFixed(0)}K {currency}
                </span>
              </div>
            )}

            {defi.collectiveTarget && defi.collectiveTarget > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progression collective</span>
                  <span className="font-semibold text-primary">{collectiveProgress.toFixed(1)}%</span>
                </div>
                <Progress value={collectiveProgress} className="h-2" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                Début: {formatDate(defi.startDate)}
              </span>
            </div>
            {!defi.hasNoEndDate && defi.endDate && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Fin: {formatDate(defi.endDate)}
                </span>
              </div>
            )}
          </div>

          {defi.rewards && defi.rewards.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm text-gray-600 font-semibold">
                <Award className="w-4 h-4" />
                <span>Récompenses:</span>
              </div>
              <ul className="ml-6 space-y-1">
                {defi.rewards.slice(0, 3).map((reward, idx) => (
                  <li key={idx} className="text-sm text-gray-600 list-disc">
                    {reward}
                  </li>
                ))}
                {defi.rewards.length > 3 && (
                  <li className="text-sm text-gray-500 italic">
                    +{defi.rewards.length - 3} autre(s)...
                  </li>
                )}
              </ul>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 flex gap-2">
          {showJoinButton && !isFull && defi.status === 'ACTIVE' && !defi.isJoined && (
            <Button 
              onClick={() => onJoin?.(defi.id)}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Rejoindre
            </Button>
          )}
          
          {defi.isJoined && (
            <Badge variant="outline" className="flex-1 justify-center py-2 text-green-600 border-green-200">
              <UserCheck className="w-4 h-4 mr-2" />
              Déjà participant
            </Badge>
          )}

          {isFull && !defi.isJoined && (
            <Badge variant="outline" className="flex-1 justify-center py-2 text-red-600 border-red-200">
              <Lock className="w-4 h-4 mr-2" />
              Complet
            </Badge>
          )}

          <Button 
            onClick={() => onView?.(defi.id)}
            variant="outline"
            className={defi.isJoined || isFull || !showJoinButton ? "flex-1" : ""}
          >
            Voir détails
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

