import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search, MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users, Target,
  Trophy,
  TrendingUp,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminChallenges } from "@/lib/apiComponent/hooks/useAdmin";
import { Challenge, CreateChallengeRequest, UpdateChallengeRequest, ChallengeStats, ChallengeQueryParams } from "@/types/admin";
import { toast } from "sonner";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const ChallengesManagement = () => {
  const navigate = useNavigate();
  const {
    challenges,
    isLoading,
    error,
    pagination,
    isInitialized,
    getChallenges,
    getChallengeStats,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    toggleChallengeActive,
    getChallengeParticipants,
    getChallengeTransactions,
  } = useAdminChallenges();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [challengesData, statsData] = await Promise.all([
          getChallenges({
            page: 1,
            limit: 10,
            sortBy: sortBy as ChallengeQueryParams['sortBy'],
            sortOrder,
          }),
          getChallengeStats(),
        ]);
        
        if (statsData) {
          setStats(statsData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    loadData();
  }, [getChallenges, getChallengeStats, sortBy, sortOrder]);

  // Recharger les données quand les filtres changent
  useEffect(() => {
    if (isInitialized) {
        const query: ChallengeQueryParams = {
          page: 1,
          limit: 10,
          sortBy: sortBy as ChallengeQueryParams['sortBy'],
          sortOrder,
        };

      if (searchTerm) query.search = searchTerm;
      if (statusFilter && statusFilter !== 'all') query.status = statusFilter as ChallengeQueryParams['status'];

      getChallenges(query);
    }
  }, [searchTerm, statusFilter, sortBy, sortOrder, isInitialized, getChallenges]);


  const handleCreateChallenge = async (data: CreateChallengeRequest) => {
    try {
      setIsCreating(true);
      await createChallenge(data);
      toast.success("Défi créé avec succès");
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la création du défi");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateChallenge = async (data: UpdateChallengeRequest) => {
    if (!selectedChallenge) return;
    try {
      setIsUpdating(true);
      await updateChallenge(selectedChallenge.id, data);
      toast.success("Défi modifié avec succès");
      setIsEditModalOpen(false);
      setSelectedChallenge(null);
    } catch (error) {
      toast.error("Erreur lors de la modification du défi");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteChallenge = async () => {
    if (!selectedChallenge) return;
    try {
      setIsDeleting(true);
      await deleteChallenge(selectedChallenge.id);
      toast.success("Défi supprimé avec succès");
      setIsDeleteModalOpen(false);
      setSelectedChallenge(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression du défi");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = async (page: number) => {
    try {
      setIsLoadingPage(true);
      const query: ChallengeQueryParams = {
        page,
        limit: pagination.limit,
        sortBy: sortBy as ChallengeQueryParams['sortBy'],
        sortOrder,
      };
      if (searchTerm) query.search = searchTerm;
      if (statusFilter && statusFilter !== 'all') query.status = statusFilter as ChallengeQueryParams['status'];
      await getChallenges(query);
    } catch (error) {
      toast.error("Erreur lors du chargement de la page");
    } finally {
      setIsLoadingPage(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return <Badge className="bg-blue-100 text-blue-800">À venir</Badge>;
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case "COMPLETED":
        return <Badge className="bg-gray-100 text-gray-800">Terminé</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount);
  };

  if (isLoading && !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des défis...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des challenges</h1>
          <p className="text-gray-600 mt-1">
            Gérez les défis d'épargne et leurs participants
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
            <Plus className="w-4 h-4 mr-2" />
              Nouveau Challenge
          </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau challenge</DialogTitle>
            </DialogHeader>
            <CreateChallengeForm
              onSubmit={handleCreateChallenge}
              onCancel={() => setIsCreateModalOpen(false)}
              isLoading={isCreating}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                  <p className="text-sm text-gray-600">Total Challenges</p>
                  <p className="text-2xl font-bold">{stats.totalChallenges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                  <p className="text-sm text-gray-600">Challenges Actifs</p>
                  <p className="text-2xl font-bold">{stats.activeChallenges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                  <p className="text-sm text-gray-600">Participants</p>
                  <p className="text-2xl font-bold">{stats.totalParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Target className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                  <p className="text-sm text-gray-600">Taux de Réussite</p>
                  <p className="text-2xl font-bold">
                    {Math.round(stats.successRate * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      )}

            {/* Filters */}
      <motion.div variants={fadeInUp}>
            <Card>
          <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Rechercher un challenge..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="UPCOMING">À venir</SelectItem>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                  <SelectItem value="CANCELLED">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                  <SelectItem value="createdAt">Date de création</SelectItem>
                  <SelectItem value="startDate">Date de début</SelectItem>
                  <SelectItem value="endDate">Date de fin</SelectItem>
                  <SelectItem value="participants">Participants</SelectItem>
                    </SelectContent>
                  </Select>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
                </div>
              </CardContent>
            </Card>
      </motion.div>

            {/* Challenges Table */}
      <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
            <CardTitle>Liste des Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                  <TableHead>Statut</TableHead>
                        <TableHead>Objectif</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Période</TableHead>
                  <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                {(challenges || []).map((challenge) => (
                        <TableRow key={challenge.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{challenge.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                                {challenge.description}
                              </p>
                            </div>
                          </TableCell>
                    <TableCell>{getStatusBadge(challenge.status)}</TableCell>
                          <TableCell>
                      {challenge.targetAmount
                        ? formatCurrency(challenge.targetAmount)
                        : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{challenge._count?.participants || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                        <p>Début: {formatDate(challenge.startDate)}</p>
                        <p>Fin: {formatDate(challenge.endDate)}</p>
                            </div>
                          </TableCell>
                    <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                            onClick={() => {
                              navigate(`/admin-dashboard/challenges/${challenge.id}`);
                            }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Voir détails
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                            onClick={async () => {
                              try {
                                await toggleChallengeActive(challenge.id);
                                toast.success(`Challenge ${challenge.isActive ? 'désactivé' : 'activé'} avec succès`);
                                await getChallenges({
                                  page: pagination.page,
                                  limit: pagination.limit,
                                  sortBy: sortBy as ChallengeQueryParams['sortBy'],
                                  sortOrder,
                                });
                              } catch (error) {
                                toast.error('Erreur lors de la modification du statut');
                              }
                            }}
                                >
                                  <Target className="w-4 h-4 mr-2" />
                                  {challenge.isActive ? 'Désactiver' : 'Activer'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                            onClick={() => {
                              setSelectedChallenge(challenge);
                              setIsEditModalOpen(true);
                            }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Modifier le challenge
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                            onClick={() => {
                              setSelectedChallenge(challenge);
                              setIsDeleteModalOpen(true);
                            }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

            {(!challenges || challenges.length === 0) && !isLoading && (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun challenge trouvé</p>
                          </div>
            )}
                </CardContent>
              </Card>
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-gray-600">
            Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} sur{" "}
            {pagination.total} challenges
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev || isLoadingPage}
            >
              {isLoadingPage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext || isLoadingPage}
            >
              Suivant
              {isLoadingPage ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
            </div>
        </motion.div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier le challenge</DialogTitle>
          </DialogHeader>
          <EditChallengeForm 
            challenge={selectedChallenge}
            onSubmit={handleUpdateChallenge}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedChallenge(null);
            }} 
            isLoading={isUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Êtes-vous sûr de vouloir supprimer ce défi ? Cette action est
              irréversible.
            </p>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedChallenge(null);
                }}
              >
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteChallenge}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Create Challenge Form Component
interface CreateChallengeFormProps {
  onSubmit: (data: CreateChallengeRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function CreateChallengeForm({ onSubmit, onCancel, isLoading = false }: CreateChallengeFormProps) {
  const [formData, setFormData] = useState<CreateChallengeRequest>({
    title: "",
    description: "",
    challengeRule: "",
    startDate: "",
    endDate: "",
    rewards: [],
  });

  const [rewardsInput, setRewardsInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addReward = () => {
    if (rewardsInput.trim()) {
      setFormData({
        ...formData,
        rewards: [...formData.rewards, rewardsInput.trim()],
      });
      setRewardsInput("");
    }
  };

  const removeReward = (index: number) => {
    setFormData({
      ...formData,
      rewards: formData.rewards.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
          <Label htmlFor="title">Titre *</Label>
        <Input
            id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="challengeRule">Règles du challenge</Label>
        <Textarea
          id="challengeRule"
          placeholder="Décrivez ici les règles et conditions du challenge..."
          value={formData.challengeRule}
          onChange={(e) => setFormData({ ...formData, challengeRule: e.target.value })}
          className="min-h-[120px]"
        />
      </div>


      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Date de début *</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">Date de fin *</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div>
        <Label>Récompenses</Label>
        <div className="flex space-x-2">
        <Input
            value={rewardsInput}
            onChange={(e) => setRewardsInput(e.target.value)}
            placeholder="Ajouter une récompense"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addReward();
              }
            }}
          />
          <Button type="button" onClick={addReward}>
            Ajouter
          </Button>
      </div>
        {formData.rewards.length > 0 && (
          <div className="mt-2 space-y-1">
            {formData.rewards.map((reward, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-100 px-2 py-1 rounded"
              >
                <span className="text-sm">{reward}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReward(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Création...
            </>
          ) : (
            "Créer le défi"
          )}
        </Button>
      </div>
    </form>
  );
}

// Edit Challenge Form Component
interface EditChallengeFormProps {
  challenge: Challenge | null;
  onSubmit: (data: UpdateChallengeRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function EditChallengeForm({
  challenge,
  onSubmit,
  onCancel,
  isLoading = false,
}: EditChallengeFormProps) {
  const [formData, setFormData] = useState<UpdateChallengeRequest>({
    title: challenge?.title || "",
    description: challenge?.description || "",
    challengeRule: (challenge as any)?.challengeRule || "",
    startDate: challenge?.startDate || "",
    endDate: challenge?.endDate || "",
    rewards: challenge?.rewards || [],
    status: challenge?.status || "UPCOMING",
  });

  const [rewardsInput, setRewardsInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addReward = () => {
    if (rewardsInput.trim()) {
      setFormData({
        ...formData,
        rewards: [...(formData.rewards || []), rewardsInput.trim()],
      });
      setRewardsInput("");
    }
  };

  const removeReward = (index: number) => {
    setFormData({
      ...formData,
      rewards: (formData.rewards || []).filter((_, i) => i !== index),
    });
  };

  if (!challenge) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
          <Label htmlFor="title">Titre</Label>
        <Input
            id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div>
        <Label htmlFor="challengeRule">Règles du challenge</Label>
        <Textarea
          id="challengeRule"
          placeholder="Règles et conditions du challenge"
          value={formData.challengeRule}
          onChange={(e) => setFormData({ ...formData, challengeRule: e.target.value })}
          className="min-h-[120px]"
        />
      </div>


      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Date de début</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="endDate">Date de fin</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Statut</Label>
        <Select
          value={formData.status}
          onValueChange={(value: UpdateChallengeRequest['status']) =>
            setFormData({ ...formData, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UPCOMING">À venir</SelectItem>
            <SelectItem value="ACTIVE">Actif</SelectItem>
            <SelectItem value="COMPLETED">Terminé</SelectItem>
            <SelectItem value="CANCELLED">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Récompenses</Label>
        <div className="flex space-x-2">
        <Input
            value={rewardsInput}
            onChange={(e) => setRewardsInput(e.target.value)}
            placeholder="Ajouter une récompense"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addReward();
              }
            }}
          />
          <Button type="button" onClick={addReward}>
            Ajouter
          </Button>
      </div>
        {(formData.rewards || []).length > 0 && (
          <div className="mt-2 space-y-1">
            {(formData.rewards || []).map((reward, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-100 px-2 py-1 rounded"
              >
                <span className="text-sm">{reward}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReward(index)}
                >
                  ×
        </Button>
            </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Modification...
            </>
          ) : (
            "Modifier le défi"
          )}
        </Button>
      </div>
    </form>
  );
}

export default ChallengesManagement;