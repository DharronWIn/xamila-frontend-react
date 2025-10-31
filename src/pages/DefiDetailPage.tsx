import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Trophy,
    Calendar,
    Users,
    Award,
    TrendingUp,
    Clock,
    Plus,
    UserCheck,
    Lock,
    Globe,
    Edit,
    Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserAvatar from "@/components/ui/UserAvatar";
import { UserBadge } from "@/components/gamification/UserBadge";
import { useDefiStore } from "@/stores/defiStore";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { JoinDefiModal } from "@/components/defis/JoinDefiModal";
import { AddTransactionModal } from "@/components/defis/AddTransactionModal";
import { toast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";

const DefiDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentDefi,
    currentParticipation,
    currentGoal,
    participants,
    transactions,
    isLoading,
    fetchDefiById,
    fetchParticipants,
    fetchTransactions,
    fetchMyGoal,
    clearCurrentDefi,
    deleteDefi
  } = useDefiStore();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDefiById(id);
      fetchParticipants(id);
      fetchTransactions(id);
      
      // Fetch user's goal if they're a participant
      if (user?.id) {
        fetchMyGoal(id).catch(() => {
          // It's ok if this fails - user might not have joined yet
        });
      }
    }

    return () => {
      clearCurrentDefi();
    };
  }, [id, user?.id]);

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

  const handleDelete = async () => {
    if (!currentDefi || !id) return;

    const confirm = window.confirm("Êtes-vous sûr de vouloir supprimer ce défi ? Cette action est irréversible.");
    if (!confirm) return;

    try {
      const success = await deleteDefi(id);
      if (success) {
        toast({
          title: "Succès",
          description: "Le défi a été supprimé avec succès",
        });
        navigate('/user-dashboard/defis');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le défi",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    if (id) {
      fetchDefiById(id);
      fetchParticipants(id);
      fetchTransactions(id);
      if (user?.id) {
        fetchMyGoal(id).catch(() => {});
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentDefi) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Trophy className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Défi non trouvé</h2>
        <Button onClick={() => navigate('/user-dashboard/defis')}>
          Retour aux défis
        </Button>
      </div>
    );
  }

  const isCreator = currentDefi.createdBy === user?.id;
  const isAdmin = user?.isAdmin;
  const canEdit = isCreator || isAdmin;
  const isParticipant = currentDefi.isJoined || !!currentParticipation;
  const isFull = !currentDefi.isUnlimited && currentDefi.maxParticipants && 
                 (currentDefi._count?.participants || 0) >= currentDefi.maxParticipants;

  const collectiveProgress = currentDefi.collectiveProgress || 0;
  const myProgress = currentGoal ? ((currentGoal.currentAmount / currentGoal.targetAmount) * 100) : 0;
  const currency = currentDefi.currency || 'XOF';
  const totalSaved = currentDefi.totalAmountSaved || currentDefi.collectiveCurrentAmount || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/user-dashboard/defis')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux défis
        </Button>

        {/* Header Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  {currentDefi.isOfficial && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                      <Trophy className="w-3 h-3 mr-1" />
                      Officiel
                    </Badge>
                  )}
                  {getStatusBadge(currentDefi.status)}
                  {getVisibilityIcon(currentDefi.visibility)}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {currentDefi.title}
                </h1>

                {currentDefi.createdByUser && (
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={currentDefi.createdByUser.pictureProfilUrl} />
                      <AvatarFallback>
                        {currentDefi.createdByUser.firstName?.charAt(0)}
                        {currentDefi.createdByUser.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-gray-500">Créé par</p>
                      <p className="font-semibold">
                        {currentDefi.createdByUser.firstName} {currentDefi.createdByUser.lastName}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {canEdit && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/user-dashboard/defis/${id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{currentDefi.description}</p>
              </CardContent>
            </Card>

            {/* My Participation (if participant) */}
            {isParticipant && currentGoal && (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Ma Participation</span>
                    <Button onClick={() => setShowTransactionModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une transaction
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Mon objectif</p>
                      <p className="text-2xl font-bold">
                        {currentGoal.targetAmount.toLocaleString()} {currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mon montant actuel</p>
                      <p className="text-2xl font-bold text-primary">
                        {currentGoal.currentAmount.toLocaleString()} {currency}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Progression</span>
                      <span className="text-sm font-semibold text-primary">
                        {myProgress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={myProgress} className="h-3" />
                  </div>

                  {currentGoal.motivation && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Ma motivation</p>
                      <p className="text-gray-700 italic">"{currentGoal.motivation}"</p>
                    </div>
                  )}

                  {/* Recent Transactions */}
                  {transactions.length > 0 && (
                    <div>
                      <p className="font-semibold mb-2">Mes dernières transactions</p>
                      <div className="space-y-2">
                        {transactions.slice(0, 3).map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                transaction.type === 'DEPOSIT' 
                                  ? 'bg-green-100' 
                                  : 'bg-red-100'
                              }`}>
                                <TrendingUp className={`w-4 h-4 ${
                                  transaction.type === 'DEPOSIT'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`} />
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {transaction.type === 'DEPOSIT' ? 'Dépôt' : 'Retrait'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(transaction.date)}
                                </p>
                              </div>
                            </div>
                            <span className={`font-bold ${
                              transaction.type === 'DEPOSIT'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {transaction.type === 'DEPOSIT' ? '+' : '-'}
                              {transaction.amount.toLocaleString()} {currency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Call to Action (if not participant) */}
            {!isParticipant && currentDefi.status === 'ACTIVE' && !isFull && (
              <Card className="border-2 border-primary bg-primary/5">
                <CardContent className="pt-6 text-center">
                  <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Rejoignez ce défi !</h3>
                  <p className="text-gray-600 mb-4">
                    Commencez votre parcours d'épargne dès maintenant
                  </p>
                  <Button 
                    size="lg" 
                    onClick={() => setShowJoinModal(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Rejoindre maintenant
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Participants */}
            {participants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Participants ({participants.length})</span>
                    {participants.length > 10 && (
                      <Button variant="outline" size="sm">
                        Voir tous
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {participants.slice(0, 10).map((participant, index) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {/* Rang */}
                          {index < 3 && (
                            <span className="text-2xl">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          )}
                          
                          {/* Avatar cliquable */}
                          <UserAvatar 
                            src={participant.user?.pictureProfilUrl}
                            alt={`${participant.user?.firstName} ${participant.user?.lastName}`}
                            userId={participant.user?.id}
                            clickable
                            size="md"
                            className="flex-shrink-0"
                          />
                          
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-semibold">
                                {participant.user?.firstName} {participant.user?.lastName}
                              </p>
                              
                              {/* Badge de gamification */}
                              {participant.user?.userLevel && (
                                <UserBadge 
                                  userLevel={participant.user.userLevel}
                                  userId={participant.user.id}
                                  size="sm"
                                  showLevel={false}
                                />
                              )}
                            </div>
                            {participant.goal && (
                              <p className="text-sm text-gray-500">
                                {participant.goal.progress.toFixed(0)}% de progression
                              </p>
                            )}
                          </div>
                        </div>
                        {participant.goal && (
                          <div className="text-right">
                            <p className="font-bold text-primary">
                              {participant.currentAmount.toLocaleString()} {currency}
                            </p>
                            <p className="text-xs text-gray-500">
                              / {participant.goal.targetAmount.toLocaleString()} {currency}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Début</p>
                    <p className="font-semibold">{formatDate(currentDefi.startDate)}</p>
                  </div>
                </div>

                {!currentDefi.hasNoEndDate && currentDefi.endDate && (
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Fin</p>
                      <p className="font-semibold">{formatDate(currentDefi.endDate)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Participants</p>
                    <p className="font-semibold">
                      {currentDefi._count?.participants || 0}
                      {!currentDefi.isUnlimited && ` / ${currentDefi.maxParticipants}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-semibold">{currentDefi.type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collective Progress */}
            {(currentDefi.collectiveTarget || totalSaved > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Progression Collective</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentDefi.collectiveTarget && (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Objectif collectif</span>
                          <span className="text-sm font-semibold">
                            {collectiveProgress.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={collectiveProgress} className="h-3" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded">
                          <p className="text-sm text-gray-600">Actuel</p>
                          <p className="font-bold text-blue-600">
                            {(totalSaved / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-gray-500">{currency}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded">
                          <p className="text-sm text-gray-600">Objectif</p>
                          <p className="font-bold text-green-600">
                            {(currentDefi.collectiveTarget / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-gray-500">{currency}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {!currentDefi.collectiveTarget && totalSaved > 0 && (
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Total épargné collectif</p>
                      <p className="text-3xl font-bold text-green-600">
                        {totalSaved.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{currency}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Rewards */}
            {currentDefi.rewards && currentDefi.rewards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Récompenses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentDefi.rewards.map((reward, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Trophy className="w-4 h-4 text-primary mt-1" />
                        <span className="text-gray-700">{reward}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Modals */}
        <JoinDefiModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          defi={currentDefi}
          onSuccess={handleRefresh}
        />

        {isParticipant && currentGoal && (
          <AddTransactionModal
            isOpen={showTransactionModal}
            onClose={() => setShowTransactionModal(false)}
            defiId={id!}
            currentBalance={currentGoal.currentAmount}
            currency={currency}
            onSuccess={handleRefresh}
          />
        )}
      </motion.div>
    </div>
  );
};

export default DefiDetailPage;

