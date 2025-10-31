import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Trophy,
    Search, Plus,
    Target,
    Calendar,
    Users,
    TrendingUp,
    Award,
    Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSocialStore } from "@/stores/socialStore";
import { useAuthStore } from "@/stores/authStore";
import DefisCard from "./DefisCard";
import { ChallengeCreateModal } from "@/components/social/ChallengeCreateModal";

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

const DefisPage = () => {
  const { 
    challenges, 
    userChallenges,
    isLoading, 
    fetchChallenges,
    joinChallenge
  } = useSocialStore();
  const { user } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || challenge.type === typeFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && challenge.isActive) ||
      (statusFilter === "upcoming" && !challenge.isActive && new Date(challenge.startDate) > new Date()) ||
      (statusFilter === "completed" && !challenge.isActive && new Date(challenge.endDate) < new Date());
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case "popular":
        return b.participants - a.participants;
      case "trending":
        return b.participants - a.participants;
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

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

  const getChallengeStatus = (challenge: typeof challenges[0]) => {
    const now = new Date();
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);
    
    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'active';
    return 'completed';
  };

  const getStatusBadge = (status: string) => {
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

  const handleJoinChallenge = (challengeId: string) => {
    joinChallenge(challengeId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-1 py-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-primary" />
                <span>Défis Communautaires</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Rejoignez des défis amusants et motivants avec la communauté
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un défi
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-1">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Défis</p>
                  <p className="text-2xl font-bold">{challenges.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-1">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Participants</p>
                  <p className="text-2xl font-bold">
                    {challenges.reduce((sum, c) => sum + c.participants, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-1">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Défis Actifs</p>
                  <p className="text-2xl font-bold">
                    {challenges.filter(c => c.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mes Défis</p>
                  <p className="text-2xl font-bold">{userChallenges.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={fadeInUp} className="mb-8">
          <Card>
            <CardContent className="p-1">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher un défi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Type de défi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="upcoming">À venir</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Plus récent</SelectItem>
                    <SelectItem value="popular">Plus populaire</SelectItem>
                    <SelectItem value="trending">Tendance</SelectItem>
                    <SelectItem value="title">Titre A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Challenges Grid */}
        <motion.div variants={staggerContainer} className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : sortedChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedChallenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <DefisCard
                    challenge={challenge}
                    onJoin={() => handleJoinChallenge(challenge.id)}
                    showJoinButton={getChallengeStatus(challenge) === 'upcoming' || getChallengeStatus(challenge) === 'active'}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div variants={fadeInUp} className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucun défi trouvé
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Soyez le premier à créer un défi communautaire !"
                }
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un défi
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Modals */}
        <ChallengeCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </motion.div>
    </div>
  );
};

export default DefisPage;
