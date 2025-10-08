import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Users,
    Search, MoreHorizontal,
    UserCheck,
    UserX,
    Crown, Eye,
    Edit,
    Trash2,
    Plus,
    Download,
    Loader2,
    RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useAdminUsers } from "@/lib/apiComponent/hooks/useAdmin";
import { UserQueryParams, UserResponse } from "@/types/admin";
import { toast } from "sonner";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'inactive' | 'suspended';
  plan: 'free' | 'monthly' | 'quarterly' | 'annual';
  joinDate: string;
  lastLogin: string;
  totalSpent: number;
  challengeProgress: number;
  country: string;
}


const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Utilisation des hooks admin
  const {
    users,
    isLoading,
    error,
    pagination,
    isInitialized,
    getUsers,
    getPendingUsers,
    getUserById,
    updateUser,
    toggleUserActive,
    toggleUserVerified,
    deleteUser,
    approveUser,
    rejectUser,
    upgradeUserToPremium,
    approveAndUpgradeToPremium
  } = useAdminUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    const loadInitialUsers = async () => {
      const query: UserQueryParams = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt' as 'email' | 'firstName' | 'lastName' | 'createdAt' | 'updatedAt' | 'lastLoginAt',
        sortOrder: 'desc' as 'asc' | 'desc'
      };

      try {
        await getUsers(query);
      } catch (error) {
        console.error('Erreur lors du chargement initial des utilisateurs:', error);
      }
    };

    loadInitialUsers();
  }, [getUsers]); // Seulement au montage

  // Charger les utilisateurs quand les filtres changent
  useEffect(() => {
    const loadUsers = async () => {
      // Mapper les filtres de l'interface vers les paramètres API
      let approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | undefined = undefined;
      let isActive: boolean | undefined = undefined;
      
      if (statusFilter !== 'all') {
        switch (statusFilter) {
          case 'pending':
            approvalStatus = 'PENDING';
            break;
          case 'approved':
            approvalStatus = 'APPROVED';
            break;
          case 'rejected':
            approvalStatus = 'REJECTED';
            break;
          case 'active':
            isActive = true;
            break;
          case 'inactive':
            isActive = false;
            break;
        }
      }

      const query: UserQueryParams = {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        approvalStatus,
        isActive,
        isPremium: planFilter !== 'all' ? planFilter === 'premium' : undefined,
        sortBy: 'createdAt' as 'email' | 'firstName' | 'lastName' | 'createdAt' | 'updatedAt' | 'lastLoginAt',
        sortOrder: 'desc' as 'asc' | 'desc'
      };

      try {
        if (showPendingOnly) {
          await getPendingUsers(query);
        } else {
          await getUsers(query);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    };

    // Ne pas charger si c'est le montage initial (déjà géré par le premier useEffect)
    if (currentPage !== 1 || searchQuery || statusFilter !== 'all' || planFilter !== 'all' || showPendingOnly) {
      loadUsers();
    }
  }, [currentPage, searchQuery, statusFilter, planFilter, showPendingOnly, getUsers, getPendingUsers]);

  const handleApproveUser = async (userId: string) => {
    try {
      await approveUser(userId);
      toast.success('Utilisateur approuvé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'approbation');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await toggleUserActive(userId);
      toast.success('Statut de l\'utilisateur modifié');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteUser(userId);
        toast.success('Utilisateur supprimé');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleUpgradeToPremium = async (userId: string) => {
    try {
      await upgradeUserToPremium(userId, { plan: 'PREMIUM', durationInDays: 30 });
      toast.success('Utilisateur mis à niveau vers Premium');
    } catch (error) {
      toast.error('Erreur lors de la mise à niveau');
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      await rejectUser(userId, { reason: 'Rejeté par l\'administrateur' });
      toast.success('Utilisateur rejeté');
    } catch (error) {
      toast.error('Erreur lors du rejet');
    }
  };

  const handleToggleUserVerified = async (userId: string) => {
    try {
      await toggleUserVerified(userId);
      toast.success('Statut de vérification modifié');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleApproveAndUpgradeToPremium = async (userId: string) => {
    try {
      await approveAndUpgradeToPremium(userId, { plan: 'PREMIUM', durationInDays: 30 });
      toast.success('Utilisateur approuvé et mis à niveau vers Premium');
    } catch (error) {
      toast.error('Erreur lors de l\'approbation et mise à niveau');
    }
  };

  const getStatusBadge = (user: UserResponse) => {
    // Le statut principal est basé sur isActive
    if (!user.isActive) {
      return <Badge variant="outline" className="text-gray-600 border-gray-600">Inactif</Badge>;
    }
    return <Badge variant="outline" className="text-green-600 border-green-600">Actif</Badge>;
  };

  const getPlanBadge = (user: UserResponse) => {
    if (user.isPremium) {
      return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">Premium</Badge>;
    }
    return <Badge variant="secondary">Gratuit</Badge>;
  };

  const getApprovalBadge = (user: UserResponse) => {
    if (user.approvalStatus === 'PENDING') {
      return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
    }
    if (user.approvalStatus === 'APPROVED') {
      return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
    }
    if (user.approvalStatus === 'REJECTED') {
      return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
    }
    return <Badge variant="secondary">Inconnu</Badge>;
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions pour gérer les utilisateurs.</p>
        </div>
      </div>
    );
  }

  if (isLoading && !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
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
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600 mt-1">
            Gérez les comptes utilisateurs, approbations et abonnements
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total utilisateurs</p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {(users || []).filter(u => u.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Premium</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(users || []).filter(u => u.isPremium).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserX className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(users || []).filter(u => u.approvalStatus === 'PENDING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Filtres et recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les plans</SelectItem>
                  <SelectItem value="free">Gratuit</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                  <SelectItem value="quarterly">Trimestriel</SelectItem>
                  <SelectItem value="annual">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Liste des utilisateurs ({pagination.total})</span>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Approbation</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Email Vérifié</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(users || []).map((user, index) => {
                    // DEBUG: Log des conditions des boutons pour chaque utilisateur
                    console.log(`🔍 DEBUG User ${user.id}:`, {
                      approvalStatus: user.approvalStatus,
                      isPremium: user.isPremium,
                      isActive: user.isActive,
                      isVerified: user.isVerified,
                      showApproveButtons: user.approvalStatus === 'PENDING',
                      showUpgradeButton: !user.isPremium,
                      showApproveAndUpgrade: user.approvalStatus === 'PENDING' && !user.isPremium
                    });
                    
                    return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div 
                          className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                          onClick={() => navigate(`/admin-dashboard/users/${user.id}`)}
                        >
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>
                      <TableCell>
                        {getApprovalBadge(user)}
                      </TableCell>
                      <TableCell>
                        {getPlanBadge(user)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{user.phone || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isVerified ? "default" : "secondary"}>
                          {user.isVerified ? 'Vérifié' : 'Non vérifié'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => navigate(`/admin-dashboard/users/${user.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {/* Actions d'approbation - basées sur approvalStatus */}
                            {user.approvalStatus === 'PENDING' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApproveUser(user.id)}>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Approuver
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRejectUser(user.id)}>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Rejeter
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleApproveAndUpgradeToPremium(user.id)}>
                                  <Crown className="w-4 h-4 mr-2" />
                                  Approuver + Premium
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {/* Actions premium - disponibles pour tous les utilisateurs non-premium */}
                            {!user.isPremium && (
                              <DropdownMenuItem onClick={() => handleUpgradeToPremium(user.id)}>
                                <Crown className="w-4 h-4 mr-2" />
                                Mettre à niveau Premium
                              </DropdownMenuItem>
                            )}
                            
                            {/* Action activer/désactiver - basée sur isActive */}
                            <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                              <UserX className="w-4 h-4 mr-2" />
                              {user.isActive ? 'Désactiver' : 'Activer'}
                            </DropdownMenuItem>
                            
                            {/* Action vérifier/dévérifier email - basée sur isVerified */}
                            <DropdownMenuItem onClick={() => handleToggleUserVerified(user.id)}>
                              <UserCheck className="w-4 h-4 mr-2" />
                              {user.isVerified ? 'Dévérifier email' : 'Vérifier email'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} sur {pagination.totalPages} ({pagination.total} utilisateurs)
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrev || isLoading}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNext || isLoading}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserDetailsModal user={selectedUser} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <EditUserModal 
              user={selectedUser} 
              onSave={(updatedUser) => {
                // Ici on pourrait appeler updateUser avec les nouvelles données
                setIsEditModalOpen(false);
                toast.success('Utilisateur modifié avec succès');
              }}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// User Details Modal Component
interface UserDetailsModalProps {
  user: UserResponse;
}

function UserDetailsModal({ user }: UserDetailsModalProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profil</TabsTrigger>
        <TabsTrigger value="activity">Activité</TabsTrigger>
        <TabsTrigger value="billing">Facturation</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Nom complet</Label>
            <p className="text-sm">{user.name}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Email</Label>
            <p className="text-sm">{user.email}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Prénom</Label>
            <p className="text-sm">{user.firstName}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Nom de famille</Label>
            <p className="text-sm">{user.lastName}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Username</Label>
            <p className="text-sm">{user.username || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Téléphone</Label>
            <p className="text-sm">{user.phone || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">WhatsApp</Label>
            <p className="text-sm">{user.whatsapp || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Pays</Label>
            <p className="text-sm">{user.country || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Ville</Label>
            <p className="text-sm">{user.city || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Genre</Label>
            <p className="text-sm">{user.gender || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Tranche d'âge</Label>
            <p className="text-sm">{user.ageRange || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Statut professionnel</Label>
            <p className="text-sm">{user.professionalStatus || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Montant max d'épargne</Label>
            <p className="text-sm">{user.maxSavingsAmount || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Habitude d'épargne</Label>
            <p className="text-sm">{user.savingsHabit || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Niveau d'épargne actuel</Label>
            <p className="text-sm">{user.currentSavingsLevel || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Usage de l'épargne</Label>
            <p className="text-sm">{user.savingsUsage || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Challenge d'épargne</Label>
            <p className="text-sm">{user.savingsChallenge || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Expérience challenge précédent</Label>
            <p className="text-sm">{user.previousChallengeExperience || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Motivation</Label>
            <p className="text-sm">{user.motivation || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Mode de challenge</Label>
            <p className="text-sm">{user.challengeMode || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Formule de challenge</Label>
            <p className="text-sm">{user.challengeFormula || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Comptes partenaires</Label>
            <p className="text-sm">{user.partnerAccounts || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Suivi des dépenses</Label>
            <p className="text-sm">{user.expenseTracking || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Intérêts futurs</Label>
            <p className="text-sm">{user.futureInterest || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Préoccupations</Label>
            <p className="text-sm">{user.concerns || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Mois de début du challenge</Label>
            <p className="text-sm">{user.challengeStartMonth || '-'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Statut</Label>
            <div className="mt-1">{getStatusBadge(user)}</div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Plan</Label>
            <div className="mt-1">{getPlanBadge(user)}</div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="activity" className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Date d'inscription</span>
            <span className="text-sm">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Dernière mise à jour</span>
            <span className="text-sm">{new Date(user.updatedAt).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Dernière connexion</span>
            <span className="text-sm">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR') : 'Jamais'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Email vérifié</span>
            <span className="text-sm">{user.isVerified ? 'Oui' : 'Non'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Compte actif</span>
            <span className="text-sm">{user.isActive ? 'Oui' : 'Non'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Statut d'approbation</span>
            <span className="text-sm">{user.approvalStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Admin</span>
            <span className="text-sm">{user.isAdmin ? 'Oui' : 'Non'}</span>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="billing" className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Premium</span>
            <span className="text-sm font-bold">{user.isPremium ? 'Oui' : 'Non'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Plan actuel</span>
            <div>{getPlanBadge(user)}</div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );

  function getStatusBadge(user: UserResponse) {
    if (user.approvalStatus === 'PENDING') {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">En attente</Badge>;
    }
    if (user.approvalStatus === 'REJECTED') {
      return <Badge variant="outline" className="text-red-600 border-red-600">Rejeté</Badge>;
    }
    if (!user.isActive) {
      return <Badge variant="outline" className="text-gray-600 border-gray-600">Inactif</Badge>;
    }
    return <Badge variant="outline" className="text-green-600 border-green-600">Actif</Badge>;
  }

  function getPlanBadge(user: UserResponse) {
    if (user.isPremium) {
      return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">Premium</Badge>;
    }
    return <Badge variant="secondary">Gratuit</Badge>;
  }
}

// Edit User Modal Component
interface EditUserModalProps {
  user: UserResponse;
  onSave: (user: UserResponse) => void;
  onCancel: () => void;
}

function EditUserModal({ user, onSave, onCancel }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username || '',
    whatsapp: user.whatsapp || '',
    country: user.country || '',
    city: user.city || '',
    gender: user.gender || '',
    ageRange: user.ageRange || '',
    professionalStatus: user.professionalStatus || '',
    maxSavingsAmount: user.maxSavingsAmount || '',
    savingsHabit: user.savingsHabit || '',
    currentSavingsLevel: user.currentSavingsLevel || '',
    savingsUsage: user.savingsUsage || '',
    savingsChallenge: user.savingsChallenge || '',
    previousChallengeExperience: user.previousChallengeExperience || '',
    motivation: user.motivation || '',
    challengeMode: user.challengeMode || '',
    challengeFormula: user.challengeFormula || '',
    partnerAccounts: user.partnerAccounts || '',
    expenseTracking: user.expenseTracking || '',
    futureInterest: user.futureInterest || '',
    concerns: user.concerns || '',
    challengeStartMonth: user.challengeStartMonth || '',
    isVerified: user.isVerified,
    isActive: user.isActive,
    isPremium: user.isPremium,
    isAdmin: user.isAdmin,
    approvalStatus: user.approvalStatus
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ici on pourrait appeler updateUser avec les nouvelles données
      // Pour l'instant, on simule juste la sauvegarde
      onSave({ ...user, ...formData } as UserResponse);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nom complet</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Nom de famille</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="country">Pays</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({...formData, country: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="gender">Genre</Label>
          <Input
            id="gender"
            value={formData.gender}
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ageRange">Tranche d'âge</Label>
          <Input
            id="ageRange"
            value={formData.ageRange}
            onChange={(e) => setFormData({...formData, ageRange: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="professionalStatus">Statut professionnel</Label>
          <Input
            id="professionalStatus"
            value={formData.professionalStatus}
            onChange={(e) => setFormData({...formData, professionalStatus: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="challengeMode">Mode de challenge</Label>
          <Select value={formData.challengeMode} onValueChange={(value) => setFormData({...formData, challengeMode: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FREE">Gratuit</SelectItem>
              <SelectItem value="PREMIUM">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="approvalStatus">Statut d'approbation</Label>
          <Select value={formData.approvalStatus} onValueChange={(value: 'PENDING' | 'APPROVED' | 'REJECTED') => setFormData({...formData, approvalStatus: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="APPROVED">Approuvé</SelectItem>
              <SelectItem value="REJECTED">Rejeté</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isVerified"
            checked={formData.isVerified}
            onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
          />
          <Label htmlFor="isVerified">Email vérifié</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
          />
          <Label htmlFor="isActive">Compte actif</Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPremium"
            checked={formData.isPremium}
            onChange={(e) => setFormData({...formData, isPremium: e.target.checked})}
          />
          <Label htmlFor="isPremium">Premium</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isAdmin"
            checked={formData.isAdmin}
            onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})}
          />
          <Label htmlFor="isAdmin">Admin</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          Sauvegarder
        </Button>
      </div>
    </form>
  );
}

export default UserManagement;
