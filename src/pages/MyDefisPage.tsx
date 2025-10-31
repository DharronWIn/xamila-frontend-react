import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Plus, Target, Award, TrendingUp, Clock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDefiStore } from "@/stores/defiStore";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { CreateDefiModal } from "@/components/defis/CreateDefiModal";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import type { Defi } from "@/types/defi";

const MyDefisPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    userDefis,
    userDefiStats,
    isLoading,
    fetchUserDefis,
    fetchUserDefiStats,
  } = useDefiStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("created");

  useEffect(() => {
    if (user?.id) {
      fetchUserDefis(user.id);
      fetchUserDefiStats(user.id);
    }
  }, [user?.id, fetchUserDefis, fetchUserDefiStats]);

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

  const createdDefis = userDefis.filter(d => d.createdBy === user?.id);
  const participatedDefis = userDefis.filter(d => d.createdBy !== user?.id && d.isJoined);
  const completedDefis = userDefis.filter(d => d.status === 'COMPLETED');

  const renderDefiCard = (defi: Defi, showCreatorBadge = false) => {
    const collectiveProgress = defi.collectiveProgress || 0;
    const participantCount = defi._count?.participants || 0;

    return (
      <Card
        key={defi.id}
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate(`/user-dashboard/defis/${defi.id}`)}
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex flex-wrap gap-2">
              {defi.isOfficial && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                  <Trophy className="w-3 h-3 mr-1" />
                  Officiel
                </Badge>
              )}
              {showCreatorBadge && (
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  <Award className="w-3 h-3 mr-1" />
                  Créateur
                </Badge>
              )}
              {getStatusBadge(defi.status)}
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
            {defi.title}
          </h3>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {defi.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Participants</span>
              <span className="font-semibold">{participantCount}</span>
            </div>

            {defi.collectiveTarget && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progression</span>
                  <span className="font-semibold text-primary">
                    {collectiveProgress.toFixed(1)}%
                  </span>
                </div>
                <Progress value={collectiveProgress} className="h-2" />
              </>
            )}
          </div>

           {defi.userParticipation?.goal && (
             <div className="p-3 bg-primary/10 rounded-lg">
               <div className="flex items-center justify-between text-sm mb-2">
                 <span className="text-gray-700 font-semibold">Mon objectif</span>
                 <span className="font-bold text-primary">
                   {defi.userParticipation.goal.progress.toFixed(0)}%
                 </span>
               </div>
               <Progress value={defi.userParticipation.goal.progress} className="h-2" />
               <div className="flex items-center justify-between text-xs mt-2 text-gray-600">
                 <span>{defi.userParticipation.goal.currentAmount.toLocaleString()} {defi.currency || 'XOF'}</span>
                 <span>{defi.userParticipation.goal.targetAmount.toLocaleString()} {defi.currency || 'XOF'}</span>
               </div>
             </div>
           )}

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(defi.startDate)}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-8">
              <Eye className="w-4 h-4 mr-1" />
              Voir
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleRefresh = () => {
    if (user?.id) {
      fetchUserDefis(user.id);
      fetchUserDefiStats(user.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center space-x-3">
                <Trophy className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                <span>Mes Défis</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez vos défis d'épargne et suivez vos progrès
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer un défi
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Défis</p>
                  <p className="text-2xl font-bold">{userDefiStats?.totalDefis || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Défis Actifs</p>
                  <p className="text-2xl font-bold">{userDefiStats?.activeDefis || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Complétés</p>
                  <p className="text-2xl font-bold">{userDefiStats?.completedDefis || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Épargné</p>
                  <p className="text-2xl font-bold">
                    {((userDefiStats?.totalSaved || 0) / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="created">
              Défis créés ({createdDefis.length})
            </TabsTrigger>
            <TabsTrigger value="participating">
              Participations ({participatedDefis.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              Historique ({completedDefis.length})
            </TabsTrigger>
          </TabsList>

          {/* Created Defis Tab */}
          <TabsContent value="created" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : createdDefis.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {createdDefis.map((defi) => renderDefiCard(defi, true))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Aucun défi créé
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Créez votre premier défi et invitez d'autres à rejoindre !
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un défi
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Participating Defis Tab */}
          <TabsContent value="participating" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : participatedDefis.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {participatedDefis.map((defi) => renderDefiCard(defi))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Aucune participation
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Explorez les défis disponibles et commencez votre parcours d'épargne !
                  </p>
                  <Button onClick={() => navigate('/user-dashboard/defis')}>
                    <Trophy className="w-4 h-4 mr-2" />
                    Explorer les défis
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : completedDefis.length > 0 ? (
              <>
                {userDefiStats && (
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Statistiques globales</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div>
                         <p className="text-sm text-gray-600">Total épargné</p>
                         <p className="text-xl font-bold text-green-600">
                           {((userDefiStats.totalSaved || 0) / 1000).toFixed(0)}K
                         </p>
                         <p className="text-xs text-gray-500">XOF</p>
                       </div>
                        <div>
                          <p className="text-sm text-gray-600">Défis complétés</p>
                          <p className="text-xl font-bold text-blue-600">
                            {userDefiStats.completedDefis}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Taux de réussite</p>
                          <p className="text-xl font-bold text-purple-600">
                            {userDefiStats.completionRate.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Abandons</p>
                          <p className="text-xl font-bold text-red-600">
                            {userDefiStats.abandonedDefis}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedDefis.map((defi) => renderDefiCard(defi))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Aucun historique
                  </h3>
                  <p className="text-gray-500">
                    Vos défis terminés et abandonnés apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Defi Modal */}
        <CreateDefiModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleRefresh}
        />
      </motion.div>
    </div>
  );
};

export default MyDefisPage;

