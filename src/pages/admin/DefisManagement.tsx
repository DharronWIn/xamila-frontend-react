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
  ChevronRight,
  Award,
  CheckCircle
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminDefis } from "@/lib/apiComponent/hooks/useAdmin";
import { Defi, CreateDefiRequest, UpdateDefiRequest, DefiStats, DefiQueryParams } from "@/types/admin";
import { toast } from "sonner";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const DefisManagement = () => {
  const navigate = useNavigate();
  const {
    defis,
    isLoading,
    error,
    pagination,
    getDefis,
    getDefiStats,
    getDefiById,
    createDefi,
    updateDefi,
    deleteDefi,
    toggleDefiOfficial,
    updateDefiStatus,
    getDefiParticipants,
    getDefiTransactions,
  } = useAdminDefis();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDefi, setSelectedDefi] = useState<Defi | null>(null);
  const [stats, setStats] = useState<DefiStats | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        const query: DefiQueryParams = {
          page: 1,
          limit: 10,
        };
        
        const [defisData, statsData] = await Promise.all([
          getDefis(query),
          getDefiStats(),
        ]);
        
        if (statsData) {
          setStats(statsData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Erreur lors du chargement des défis");
      }
    };

    loadData();
  }, []);

  // Recharger les défis avec les filtres
  useEffect(() => {
    const loadDefis = async () => {
      try {
        const query: DefiQueryParams = {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm || undefined,
          status: statusFilter !== "all" ? statusFilter as any : undefined,
          type: typeFilter !== "all" ? typeFilter as any : undefined,
        };

        await getDefis(query);
      } catch (error) {
        console.error("Erreur lors du chargement des défis:", error);
      }
    };

    loadDefis();
  }, [searchTerm, statusFilter, typeFilter, pagination.page, pagination.limit]);

  const handleCreate = async (formData: CreateDefiRequest) => {
    try {
      setIsCreating(true);
      await createDefi(formData);
      toast.success("Défi créé avec succès");
      setIsCreateModalOpen(false);
      await getDefis({ page: pagination.page, limit: pagination.limit });
    } catch (error) {
      toast.error("Erreur lors de la création du défi");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string, formData: UpdateDefiRequest) => {
    try {
      setIsUpdating(true);
      await updateDefi(id, formData);
      toast.success("Défi modifié avec succès");
      setIsEditModalOpen(false);
      await getDefis({ page: pagination.page, limit: pagination.limit });
    } catch (error) {
      toast.error("Erreur lors de la modification du défi");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await deleteDefi(id);
      toast.success("Défi supprimé avec succès");
      setIsDeleteModalOpen(false);
      await getDefis({ page: pagination.page, limit: pagination.limit });
    } catch (error) {
      toast.error("Erreur lors de la suppression du défi");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleOfficial = async (id: string, isOfficial: boolean) => {
    try {
      await toggleDefiOfficial(id, !isOfficial);
      toast.success(`Défi ${!isOfficial ? 'marqué comme officiel' : 'retiré des défis officiels'}`);
      await getDefis({ page: pagination.page, limit: pagination.limit });
    } catch (error) {
      toast.error("Erreur lors de la modification");
    }
  };

  const getStatusBadge = (status: Defi['status']) => {
    const variants: Record<Defi['status'], { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      UPCOMING: { variant: "outline", label: "À venir" },
      ACTIVE: { variant: "default", label: "Actif" },
      COMPLETED: { variant: "secondary", label: "Terminé" },
      CANCELLED: { variant: "destructive", label: "Annulé" },
    };
    const config = variants[status] || variants.UPCOMING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const filteredDefis = (defis || []).filter((defi) => {
    const matchesSearch = searchTerm === "" || 
      defi.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defi.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || defi.status === statusFilter;
    const matchesType = typeFilter === "all" || defi.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        transition={fadeInUp.transition}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Gestion des Défis</h1>
          <p className="text-muted-foreground mt-2">
            Gérez tous les défis d'épargne des utilisateurs
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Créer un défi
        </Button>
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
              <CardTitle className="text-sm font-medium">Total Défis</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Défis Actifs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Défis Officiels</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.official || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants || 0}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un défi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="MONTHLY">Mensuel</SelectItem>
                <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
                <SelectItem value="DAILY">Quotidien</SelectItem>
                <SelectItem value="CUSTOM">Personnalisé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Défis</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (defis?.length === 0 || !defis) ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Officiel</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDefis.map((defi) => (
                  <TableRow key={defi.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{defi.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{defi.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{defi.type}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(defi.status)}</TableCell>
                    <TableCell>
                      {defi.isOfficial ? (
                        <Badge variant="default">
                          <Award className="w-3 h-3 mr-1" />
                          Officiel
                        </Badge>
                      ) : (
                        <Badge variant="outline">Non officiel</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>Du {formatDate(defi.startDate)}</p>
                        <p>Au {formatDate(defi.endDate)}</p>
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
                          <DropdownMenuItem onClick={() => navigate(`/admin-dashboard/defis/${defi.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleOfficial(defi.id, defi.isOfficial)}>
                            {defi.isOfficial ? (
                              <>
                                <Target className="w-4 h-4 mr-2" />
                                Retirer des officiels
                              </>
                            ) : (
                              <>
                                <Award className="w-4 h-4 mr-2" />
                                Marquer comme officiel
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedDefi(defi);
                            setIsEditModalOpen(true);
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedDefi(defi);
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
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {pagination.page} sur {pagination.totalPages}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => getDefis({ page: pagination.page - 1, limit: pagination.limit })}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => getDefis({ page: pagination.page + 1, limit: pagination.limit })}
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modales à implémenter pour créer/modifier/supprimer */}
      {/* ... */}
    </div>
  );
};

export default DefisManagement;

