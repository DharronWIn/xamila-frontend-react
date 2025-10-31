import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Search, Plus, TrendingUp, Award, Users, Filter, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDefiStore } from "@/stores/defiStore";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { DefiCard } from "@/components/defis/DefiCard";
import { CreateDefiModal } from "@/components/defis/CreateDefiModal";
import { JoinDefiModal } from "@/components/defis/JoinDefiModal";
import type { DefiType, DefiStatus } from "@/types/defi";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const DefisListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    defis, 
    defiStats,
    isLoading, 
    fetchDefis,
    fetchDefiStats,
  } = useDefiStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DefiType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<DefiStatus | "ALL">("ALL");
  const [creatorFilter, setCreatorFilter] = useState<"ALL" | "OFFICIAL" | "COMMUNITY">("ALL");
  const [sortBy, setSortBy] = useState("recent");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedDefi, setSelectedDefi] = useState<typeof defis[0] | null>(null);

  useEffect(() => {
    const params: { 
      search?: string; 
      type?: DefiType; 
      status?: DefiStatus; 
      isOfficial?: boolean 
    } = {};
    
    if (searchQuery) params.search = searchQuery;
    if (typeFilter !== "ALL") params.type = typeFilter;
    if (statusFilter !== "ALL") params.status = statusFilter;
    if (creatorFilter === "OFFICIAL") params.isOfficial = true;
    if (creatorFilter === "COMMUNITY") params.isOfficial = false;
    
    fetchDefis(params);
    fetchDefiStats();
  }, [fetchDefis, fetchDefiStats, searchQuery, typeFilter, statusFilter, creatorFilter]);

  const handleJoinDefi = (defiId: string) => {
    const defi = defis.find(d => d.id === defiId);
    if (defi) {
      setSelectedDefi(defi);
      setShowJoinModal(true);
    }
  };

  const handleViewDefi = (defiId: string) => {
    navigate(`/user-dashboard/defis/${defiId}`);
  };

  const handleRefresh = () => {
    const params: { 
      search?: string; 
      type?: DefiType; 
      status?: DefiStatus; 
      isOfficial?: boolean 
    } = {};
    
    if (searchQuery) params.search = searchQuery;
    if (typeFilter !== "ALL") params.type = typeFilter;
    if (statusFilter !== "ALL") params.status = statusFilter;
    if (creatorFilter === "OFFICIAL") params.isOfficial = true;
    if (creatorFilter === "COMMUNITY") params.isOfficial = false;
    
    fetchDefis(params);
  };

  const sortedDefis = [...defis].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "popular":
        return (b._count?.participants || 0) - (a._count?.participants || 0);
      case "progress":
        return (b.collectiveProgress || 0) - (a.collectiveProgress || 0);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const officialDefis = sortedDefis.filter(d => d.isOfficial);
  const communityDefis = sortedDefis.filter(d => !d.isOfficial);

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center space-x-3">
                <Trophy className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                <span>Défis d'Épargne</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Rejoignez des défis motivants et épargnez ensemble
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
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Défis</p>
                  <p className="text-2xl font-bold">{defiStats?.totalDefis || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Défis Actifs</p>
                  <p className="text-2xl font-bold">{defiStats?.activeDefis || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">À Venir</p>
                  <p className="text-2xl font-bold">{defiStats?.upcomingDefis || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Participants</p>
                  <p className="text-2xl font-bold">{defiStats?.totalParticipants || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Épargné</p>
                  <p className="text-2xl font-bold">
                    {((defiStats?.totalAmountSaved || 0) / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-gray-500">{defiStats?.currency || 'XOF'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeInUp} className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher un défi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Filter Tabs */}
                <Tabs value={creatorFilter} onValueChange={(v) => setCreatorFilter(v as typeof creatorFilter)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ALL">Tous</TabsTrigger>
                    <TabsTrigger value="OFFICIAL">
                      <Trophy className="w-4 h-4 mr-2" />
                      Officiels
                    </TabsTrigger>
                    <TabsTrigger value="COMMUNITY">
                      <Users className="w-4 h-4 mr-2" />
                      Communautaires
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Advanced Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de défi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tous les types</SelectItem>
                      <SelectItem value="DAILY">Quotidien</SelectItem>
                      <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
                      <SelectItem value="MONTHLY">Mensuel</SelectItem>
                      <SelectItem value="CUSTOM">Personnalisé</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tous les statuts</SelectItem>
                      <SelectItem value="UPCOMING">À venir</SelectItem>
                      <SelectItem value="ACTIVE">Actif</SelectItem>
                      <SelectItem value="COMPLETED">Terminé</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Plus récent</SelectItem>
                      <SelectItem value="popular">Plus populaire</SelectItem>
                      <SelectItem value="progress">Progression</SelectItem>
                      <SelectItem value="title">Titre A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Defis List */}
        <motion.div variants={staggerContainer} className="space-y-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : sortedDefis.length > 0 ? (
            <>
              {/* Official Defis Section */}
              {creatorFilter !== "COMMUNITY" && officialDefis.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <span>Défis Officiels</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {officialDefis.map((defi) => (
                      <motion.div
                        key={defi.id}
                        variants={fadeInUp}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <DefiCard
                          defi={defi}
                          onJoin={handleJoinDefi}
                          onView={handleViewDefi}
                          showJoinButton={defi.status === 'ACTIVE' || defi.status === 'UPCOMING'}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Defis Section */}
              {creatorFilter !== "OFFICIAL" && communityDefis.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                    <Users className="w-6 h-6 text-blue-500" />
                    <span>Défis Communautaires</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communityDefis.map((defi) => (
                      <motion.div
                        key={defi.id}
                        variants={fadeInUp}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <DefiCard
                          defi={defi}
                          onJoin={handleJoinDefi}
                          onView={handleViewDefi}
                          showJoinButton={defi.status === 'ACTIVE' || defi.status === 'UPCOMING'}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <motion.div variants={fadeInUp} className="text-center py-12">
              <Trophy className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Aucun défi trouvé
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || typeFilter !== "ALL" || statusFilter !== "ALL"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Soyez le premier à créer un défi !"
                }
              </p>
              <div className="flex justify-center space-x-4">
                {(searchQuery || typeFilter !== "ALL" || statusFilter !== "ALL") && (
                  <Button onClick={handleRefresh} variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Réinitialiser les filtres
                  </Button>
                )}
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un défi
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Modals */}
        <CreateDefiModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleRefresh}
        />
        
        <JoinDefiModal
          isOpen={showJoinModal}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedDefi(null);
          }}
          defi={selectedDefi}
          onSuccess={handleRefresh}
        />
      </motion.div>
    </div>
  );
};

export default DefisListPage;

