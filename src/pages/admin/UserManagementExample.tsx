import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Search, MoreHorizontal,
    UserCheck,
    UserX,
    Crown,
    Mail,
    Phone,
    Calendar,
    AlertCircle,
    CheckCircle,
    XCircle,
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
import { useAdminUsers } from "@/lib/apiComponent/hooks/useAdmin";
import { UserQueryParams, UserResponse } from "@/types/admin";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const UserManagementExample = () => {
  const {
    users,
    isLoading,
    error,
    pagination,
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
  const [premiumFilter, setPremiumFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  // Charger les utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      const query: UserQueryParams = {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        approvalStatus: statusFilter !== 'all' ? statusFilter as any : undefined,
        isPremium: premiumFilter !== 'all' ? premiumFilter === 'premium' : undefined,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any
      };

      if (showPendingOnly) {
        await getPendingUsers(query);
      } else {
        await getUsers(query);
      }
    };

    loadUsers();
  }, [currentPage, searchQuery, statusFilter, premiumFilter, sortBy, sortOrder, showPendingOnly, getUsers, getPendingUsers]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePremiumFilter = (value: string) => {
    setPremiumFilter(value);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleUserAction = async (action: string, userId: string, data?: any) => {
    try {
      switch (action) {
        case 'toggle-active':
          await toggleUserActive(userId);
          break;
        case 'toggle-verified':
          await toggleUserVerified(userId);
          break;
        case 'approve':
          await approveUser(userId);
          break;
        case 'reject':
          await rejectUser(userId, { reason: data?.reason });
          break;
        case 'upgrade-premium':
          await upgradeUserToPremium(userId, { plan: 'PREMIUM', durationInDays: 30 });
          break;
        case 'approve-and-upgrade':
          await approveAndUpgradeToPremium(userId, { plan: 'PREMIUM', durationInDays: 30 });
          break;
        case 'delete':
          if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            await deleteUser(userId);
          }
          break;
      }
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    }
  };

  const getStatusBadge = (user: UserResponse) => {
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
  };

  const getPremiumBadge = (user: UserResponse) => {
    if (user.isPremium) {
      return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">Premium</Badge>;
    }
    return <Badge variant="secondary">Gratuit</Badge>;
  };

  if (isLoading && users.length === 0) {
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
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
    <div className="p-6">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-600">
              Gérez les utilisateurs, leurs statuts et leurs abonnements
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button
              variant={showPendingOnly ? "default" : "outline"}
              onClick={() => setShowPendingOnly(!showPendingOnly)}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              {showPendingOnly ? 'Tous les utilisateurs' : 'En attente seulement'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut d'approbation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="APPROVED">Approuvé</SelectItem>
                  <SelectItem value="REJECTED">Rejeté</SelectItem>
                </SelectContent>
              </Select>

              <Select value={premiumFilter} onValueChange={handlePremiumFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type d'abonnement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les abonnements</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="free">Gratuit</SelectItem>
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Date de création (récent)</SelectItem>
                  <SelectItem value="createdAt-asc">Date de création (ancien)</SelectItem>
                  <SelectItem value="lastName-asc">Nom (A-Z)</SelectItem>
                  <SelectItem value="lastName-desc">Nom (Z-A)</SelectItem>
                  <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                  <SelectItem value="email-desc">Email (Z-A)</SelectItem>
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
              <span>Utilisateurs ({pagination.total})</span>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('lastName')}>
                      Utilisateur
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>
                      Email
                    </TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Abonnement</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                      Inscription
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.phone ? (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell>{getPremiumBadge(user)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setIsUserModalOpen(true);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserAction('toggle-active', user.id)}>
                              {user.isActive ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Désactiver
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Activer
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserAction('toggle-verified', user.id)}>
                              {user.isVerified ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Dévérifier
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Vérifier
                                </>
                              )}
                            </DropdownMenuItem>
                            {user.approvalStatus === 'PENDING' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleUserAction('approve', user.id)}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approuver
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUserAction('reject', user.id)}>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Rejeter
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUserAction('approve-and-upgrade', user.id)}>
                                  <Crown className="w-4 h-4 mr-2" />
                                  Approuver + Premium
                                </DropdownMenuItem>
                              </>
                            )}
                            {!user.isPremium && (
                              <DropdownMenuItem onClick={() => handleUserAction('upgrade-premium', user.id)}>
                                <Crown className="w-4 h-4 mr-2" />
                                Mettre à niveau Premium
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleUserAction('delete', user.id)}
                              className="text-red-600"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
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
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                  <p className="text-sm">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  <p className="text-sm">{selectedUser.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Statut</label>
                  <div className="mt-1">{getStatusBadge(selectedUser)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Abonnement</label>
                  <div className="mt-1">{getPremiumBadge(selectedUser)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date d'inscription</label>
                  <p className="text-sm">
                    {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementExample;
