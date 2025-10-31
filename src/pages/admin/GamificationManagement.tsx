import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Award,
  Users,
  Star,
  TrendingUp,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Target
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminGamification } from "@/lib/apiComponent/hooks/useAdmin";
import { Trophy as TrophyType, Badge as BadgeType, GamificationStats, CreateTrophyRequest, UpdateTrophyRequest, CreateBadgeRequest, UpdateBadgeRequest } from "@/types/admin";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const GamificationManagement = () => {
  const {
    trophies,
    badges,
    isLoading,
    error,
    getTrophies,
    getTrophyById,
    createTrophy,
    updateTrophy,
    deleteTrophy,
    getBadges,
    getBadgeById,
    createBadge,
    updateBadge,
    deleteBadge,
    getUserGamificationData,
    deleteUserTrophy,
    getGamificationStats,
    getLeaderboard
  } = useAdminGamification();

  const [activeTab, setActiveTab] = useState<"trophies" | "badges" | "leaderboard">("trophies");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [badgeTypeFilter, setBadgeTypeFilter] = useState<string>("all");
  const [isCreateTrophyModalOpen, setIsCreateTrophyModalOpen] = useState(false);
  const [isEditTrophyModalOpen, setIsEditTrophyModalOpen] = useState(false);
  const [isDeleteTrophyModalOpen, setIsDeleteTrophyModalOpen] = useState(false);
  const [isCreateBadgeModalOpen, setIsCreateBadgeModalOpen] = useState(false);
  const [isEditBadgeModalOpen, setIsEditBadgeModalOpen] = useState(false);
  const [isDeleteBadgeModalOpen, setIsDeleteBadgeModalOpen] = useState(false);
  const [selectedTrophy, setSelectedTrophy] = useState<TrophyType | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          getTrophies(),
          getBadges(),
          getGamificationStats().then(statsData => {
            if (statsData) setStats(statsData);
          }),
          getLeaderboard(100).then(leaderboardData => {
            setLeaderboard(leaderboardData);
          })
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Erreur lors du chargement des données");
      }
    };

    loadData();
  }, []);

  // Filtrer les trophées
  const filteredTrophies = trophies.filter(trophy => {
    const matchesSearch = searchTerm === "" || 
      trophy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trophy.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || trophy.category === categoryFilter;
    const matchesRarity = rarityFilter === "all" || trophy.rarity === rarityFilter;
    return matchesSearch && matchesCategory && matchesRarity;
  });

  // Filtrer les badges
  const filteredBadges = badges.filter(badge => {
    const matchesSearch = searchTerm === "" || 
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = badgeTypeFilter === "all" || badge.type === badgeTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateTrophy = async (formData: CreateTrophyRequest) => {
    try {
      setIsCreating(true);
      await createTrophy(formData);
      toast.success("Trophée créé avec succès");
      setIsCreateTrophyModalOpen(false);
      await getTrophies();
    } catch (error) {
      toast.error("Erreur lors de la création du trophée");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTrophy = async (id: string, formData: UpdateTrophyRequest) => {
    try {
      setIsUpdating(true);
      await updateTrophy(id, formData);
      toast.success("Trophée modifié avec succès");
      setIsEditTrophyModalOpen(false);
      await getTrophies();
    } catch (error) {
      toast.error("Erreur lors de la modification du trophée");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTrophy = async (id: string) => {
    try {
      setIsDeleting(true);
      await deleteTrophy(id);
      toast.success("Trophée supprimé avec succès");
      setIsDeleteTrophyModalOpen(false);
      await getTrophies();
    } catch (error) {
      toast.error("Erreur lors de la suppression du trophée");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateBadge = async (formData: CreateBadgeRequest) => {
    try {
      setIsCreating(true);
      await createBadge(formData);
      toast.success("Badge créé avec succès");
      setIsCreateBadgeModalOpen(false);
      await getBadges();
    } catch (error) {
      toast.error("Erreur lors de la création du badge");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateBadge = async (id: string, formData: UpdateBadgeRequest) => {
    try {
      setIsUpdating(true);
      await updateBadge(id, formData);
      toast.success("Badge modifié avec succès");
      setIsEditBadgeModalOpen(false);
      await getBadges();
    } catch (error) {
      toast.error("Erreur lors de la modification du badge");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBadge = async (id: string) => {
    try {
      setIsDeleting(true);
      await deleteBadge(id);
      toast.success("Badge supprimé avec succès");
      setIsDeleteBadgeModalOpen(false);
      await getBadges();
    } catch (error) {
      toast.error("Erreur lors de la suppression du badge");
    } finally {
      setIsDeleting(false);
    }
  };

  const getRarityBadge = (rarity: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      COMMON: { variant: "outline", label: "Commun" },
      RARE: { variant: "secondary", label: "Rare" },
      EPIC: { variant: "default", label: "Épique" },
      LEGENDARY: { variant: "destructive", label: "Légendaire" },
    };
    const config = variants[rarity] || variants.COMMON;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading && trophies.length === 0 && badges.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des données de gamification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        transition={fadeInUp.transition}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Gestion de la Gamification</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les trophées, badges et le leaderboard
          </p>
        </div>
      </motion.div>

      {/* Statistiques */}
      {stats && (
        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={fadeInUp.transition}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trophées</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrophies || trophies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBadges || badges.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trophées Débloqués</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUnlockedTrophies || 0}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="trophies">Trophées</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Trophées Tab */}
        <TabsContent value="trophies" className="space-y-6">
          {/* Filtres */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un trophée..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="SAVINGS">Épargne</SelectItem>
                    <SelectItem value="CHALLENGES">Défis</SelectItem>
                    <SelectItem value="SOCIAL">Social</SelectItem>
                    <SelectItem value="MILESTONE">Jalons</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={rarityFilter} onValueChange={setRarityFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Rareté" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les raretés</SelectItem>
                    <SelectItem value="COMMON">Commun</SelectItem>
                    <SelectItem value="RARE">Rare</SelectItem>
                    <SelectItem value="EPIC">Épique</SelectItem>
                    <SelectItem value="LEGENDARY">Légendaire</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setIsCreateTrophyModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un trophée
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Table des trophées */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des Trophées</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Rareté</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrophies.map((trophy) => (
                    <TableRow key={trophy.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{trophy.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{trophy.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{trophy.category}</Badge>
                      </TableCell>
                      <TableCell>{getRarityBadge(trophy.rarity)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{trophy.points}</span>
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
                            <DropdownMenuItem onClick={() => {
                              getTrophyById(trophy.id).then(data => {
                                if (data) {
                                  setSelectedTrophy(data);
                                  // Ouvrir un modal de détails
                                }
                              });
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedTrophy(trophy);
                              setIsEditTrophyModalOpen(true);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedTrophy(trophy);
                                setIsDeleteTrophyModalOpen(true);
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          {/* Filtres */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un badge..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={badgeTypeFilter} onValueChange={setBadgeTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="ACHIEVEMENT">Réalisation</SelectItem>
                    <SelectItem value="SOCIAL">Social</SelectItem>
                    <SelectItem value="MILESTONE">Jalon</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setIsCreateBadgeModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un badge
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Table des badges */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBadges.map((badge) => (
                    <TableRow key={badge.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-500" />
                          <p className="font-medium">{badge.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{badge.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-500 line-clamp-1">{badge.description}</p>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              getBadgeById(badge.id).then(data => {
                                if (data) {
                                  setSelectedBadge(data);
                                  // Ouvrir un modal de détails
                                }
                              });
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedBadge(badge);
                              setIsEditBadgeModalOpen(true);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedBadge(badge);
                                setIsDeleteBadgeModalOpen(true);
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rang</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>XP Total</TableHead>
                    <TableHead>Trophées</TableHead>
                    <TableHead>Badges</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.slice(0, 100).map((entry, index) => (
                    <TableRow key={entry.userId || index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index < 3 && (
                            <Trophy className={`w-5 h-5 ${
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' :
                              'text-orange-500'
                            }`} />
                          )}
                          <span className="font-bold">#{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.userName || `Utilisateur ${entry.userId}`}</p>
                          {entry.userEmail && (
                            <p className="text-sm text-gray-500">{entry.userEmail}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{entry.level || 1}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{entry.totalXP || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>{entry.trophiesCount || 0}</TableCell>
                      <TableCell>{entry.badgesCount || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modales à implémenter pour créer/modifier/supprimer */}
      {/* ... */}
    </div>
  );
};

export default GamificationManagement;

