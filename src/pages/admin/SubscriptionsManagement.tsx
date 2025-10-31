import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Users,
  TrendingUp,
  Calendar,
  Search,
  Eye,
  MoreHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminSubscriptions } from "@/lib/apiComponent/hooks/useAdmin";
import { Subscription, SubscriptionStats, SubscriptionRevenue, ExtendSubscriptionRequest } from "@/types/admin";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const SubscriptionsManagement = () => {
  const {
    subscriptions,
    isLoading,
    error,
    pagination,
    getSubscriptions,
    getSubscriptionStats,
    getSubscriptionsByUser,
    getSubscriptionById,
    cancelSubscription,
    extendSubscription,
    getSubscriptionRevenue
  } = useAdminSubscriptions();

  const [activeTab, setActiveTab] = useState<"subscriptions" | "stats" | "revenue">("subscriptions");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [revenue, setRevenue] = useState<SubscriptionRevenue | null>(null);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [extendDays, setExtendDays] = useState<number>(30);

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          getSubscriptions({ page: 1, limit: 50 }),
          getSubscriptionStats().then(statsData => {
            if (statsData) setStats(statsData);
          })
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Erreur lors du chargement des données");
      }
    };

    loadData();
  }, []);

  // Filtrer les abonnements
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = searchTerm === "" || 
      subscription.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || subscription.status === statusFilter;
    const matchesPlan = planFilter === "all" || subscription.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleViewSubscription = async (id: string) => {
    try {
      const subscription = await getSubscriptionById(id);
      if (subscription) {
        setSelectedSubscription(subscription);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      toast.error("Erreur lors de la récupération de l'abonnement");
    }
  };

  const handleCancel = async () => {
    if (!selectedSubscription) return;
    try {
      await cancelSubscription(selectedSubscription.id);
      toast.success("Abonnement annulé avec succès");
      setIsCancelModalOpen(false);
      await getSubscriptions({ page: pagination.page, limit: pagination.limit });
    } catch (error) {
      toast.error("Erreur lors de l'annulation de l'abonnement");
    }
  };

  const handleExtend = async () => {
    if (!selectedSubscription) return;
    try {
      const data: ExtendSubscriptionRequest = { durationInDays: extendDays };
      await extendSubscription(selectedSubscription.id, data);
      toast.success("Abonnement prolongé avec succès");
      setIsExtendModalOpen(false);
      await getSubscriptions({ page: pagination.page, limit: pagination.limit });
    } catch (error) {
      toast.error("Erreur lors de la prolongation de l'abonnement");
    }
  };

  const handleLoadRevenue = async () => {
    try {
      const revenueData = await getSubscriptionRevenue({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined
      });
      if (revenueData) {
        setRevenue(revenueData);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des revenus");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: any }> = {
      ACTIVE: { variant: "default", label: "Actif", icon: CheckCircle },
      CANCELLED: { variant: "destructive", label: "Annulé", icon: XCircle },
      EXPIRED: { variant: "secondary", label: "Expiré", icon: Clock },
    };
    const config = variants[status] || variants.ACTIVE;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      FREE: { variant: "outline", label: "Gratuit" },
      TRIAL: { variant: "secondary", label: "Essai" },
      PREMIUM: { variant: "default", label: "Premium" },
      SIX_MONTHS: { variant: "default", label: "6 Mois" },
    };
    const config = variants[plan] || variants.FREE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number, currency: string = "XOF") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des abonnements...</p>
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
          <h1 className="text-3xl font-bold">Gestion des Abonnements</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les abonnements des utilisateurs et les revenus
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
              <CardTitle className="text-sm font-medium">Total Abonnements</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abonnements Annulés</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.byStatus?.find(s => s.status === 'CANCELLED')?.count || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenue ? formatCurrency(revenue.totalRevenue) : "-"}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
        </TabsList>

        {/* Abonnements Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          {/* Filtres */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher (utilisateur, email)..."
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
                    <SelectItem value="ACTIVE">Actif</SelectItem>
                    <SelectItem value="CANCELLED">Annulé</SelectItem>
                    <SelectItem value="EXPIRED">Expiré</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les plans</SelectItem>
                    <SelectItem value="FREE">Gratuit</SelectItem>
                    <SelectItem value="TRIAL">Essai</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="SIX_MONTHS">6 Mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table des abonnements */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des Abonnements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Début</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {subscription.user.firstName} {subscription.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{subscription.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(subscription.plan)}</TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(subscription.startDate)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(subscription.endDate)}</div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewSubscription(subscription.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            {subscription.status === 'ACTIVE' && (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setIsExtendModalOpen(true);
                                }}>
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Prolonger
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedSubscription(subscription);
                                    setIsCancelModalOpen(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Annuler
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                  onClick={() => getSubscriptions({ page: pagination.page - 1, limit: pagination.limit })}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => getSubscriptions({ page: pagination.page + 1, limit: pagination.limit })}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Statistiques Tab */}
        <TabsContent value="stats" className="space-y-6">
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Statistiques Détaillées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.byStatus && (
                    <div>
                      <p className="text-sm font-medium mb-2">Par statut</p>
                      <div className="grid grid-cols-3 gap-4">
                        {stats.byStatus.map((status) => (
                          <div key={status.status}>
                            <p className="text-sm text-muted-foreground">{status.status}</p>
                            <p className="text-2xl font-bold">{status.count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Revenus Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  type="date"
                  placeholder="Date de début"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
                <Input
                  type="date"
                  placeholder="Date de fin"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
                <Button onClick={handleLoadRevenue}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Charger
                </Button>
              </div>
              {revenue && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenus totaux</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenue.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre de paiements</p>
                    <p className="text-2xl font-bold">{revenue.paymentCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Abonnements actifs</p>
                    <p className="text-2xl font-bold">{revenue.activeSubscriptions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenu moyen</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenue.averageRevenue)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modales */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'abonnement</DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateur</p>
                  <p>
                    {selectedSubscription.user.firstName} {selectedSubscription.user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{selectedSubscription.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  {getPlanBadge(selectedSubscription.plan)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  {getStatusBadge(selectedSubscription.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de début</p>
                  <p className="text-sm">{formatDate(selectedSubscription.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de fin</p>
                  <p className="text-sm">{formatDate(selectedSubscription.endDate)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler l'abonnement</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Êtes-vous sûr de vouloir annuler cet abonnement ?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isExtendModalOpen} onOpenChange={setIsExtendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prolonger l'abonnement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="extendDays">Nombre de jours</Label>
              <Input
                id="extendDays"
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(Number(e.target.value))}
                min={1}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsExtendModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleExtend}>
                Prolonger
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsManagement;

