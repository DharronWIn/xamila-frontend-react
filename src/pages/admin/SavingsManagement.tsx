import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  Users,
  Trophy,
  Search, Download,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  PieChart, MoreHorizontal, Loader2,
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
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useAdminSavingsGoals } from "@/lib/apiComponent/hooks/useAdmin";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { toast } from "sonner";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Interface pour les objectifs d'épargne (utilisée pour le typage local)
interface SavingsGoal {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  monthlyIncome: number;
  isVariableIncome: boolean;
  startDate: string;
  targetDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const SavingsManagement = () => {
  const { user: currentUser } = useAuth();
  
  // Utilisation des hooks admin
  const {
    savingsGoals,
    isLoading,
    error,
    getSavingsGoals,
    getSavingsGoalById,
    getSavingsGoalStats,
    updateSavingsGoal,
    deleteSavingsGoal,
    getSavingsChallenges,
    getSavingsChallengeById,
    getCollectiveProgress
  } = useAdminSavingsGoals();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        const [goalsData, statsData] = await Promise.all([
          getSavingsGoals({ page: 1, limit: 50 }),
          getSavingsGoalStats()
        ]);
        setStats(statsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadData();
  }, [getSavingsGoals, getSavingsGoalStats]);

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions pour gérer les objectifs d'épargne.</p>
        </div>
      </div>
    );
  }

  if (isLoading && savingsGoals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des objectifs d'épargne...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="w-16 h-16 text-red-500 mx-auto mb-4" />
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

  // Filter goals
  const filteredGoals = savingsGoals.filter(goal => {
    const matchesSearch = goal.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         goal.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
      const isCompleted = new Date(goal.endDate) <= new Date();
      
      switch (statusFilter) {
        case 'active':
          matchesStatus = !isCompleted && progressPercentage < 100;
          break;
        case 'completed':
          matchesStatus = isCompleted || progressPercentage >= 100;
          break;
        case 'on_track':
          matchesStatus = progressPercentage >= 50 && !isCompleted;
          break;
        case 'behind':
          matchesStatus = progressPercentage < 50 && !isCompleted;
          break;
      }
    }
    
    const matchesCurrency = currencyFilter === 'all' || goal.currency === currencyFilter;
    
    return matchesSearch && matchesStatus && matchesCurrency;
  });

  // Calculate stats - utiliser les données du backend ou les données locales
  const totalGoals = stats?.totalGoals || savingsGoals.length;
  const activeGoals = stats?.activeGoals || savingsGoals.filter(g => new Date(g.targetDate || g.endDate) > new Date()).length;
  const completedGoals = stats?.completedGoals || savingsGoals.filter(g => {
    const progressPercentage = ((g.currentAmount || 0) / (g.targetAmount || 1)) * 100;
    return progressPercentage >= 100 || new Date(g.targetDate || g.endDate) <= new Date();
  }).length;
  const totalTargetAmount = stats?.totalAmount || savingsGoals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalCurrentAmount = savingsGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const averageProgress = totalGoals > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  const chartData = savingsGoals.map(goal => ({
    name: goal.userName,
    target: goal.targetAmount || 0,
    current: goal.currentAmount || 0,
    progress: ((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100,
  }));

  const currencyStats = savingsGoals.reduce((acc, goal) => {
    acc[goal.currency || 'EUR'] = (acc[goal.currency || 'EUR'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(currencyStats).map(([currency, count], index) => ({
    name: currency,
    value: count,
    color: COLORS[index % COLORS.length],
  }));

  const getStatusBadge = (goal: SavingsGoal) => {
    const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
    const isCompleted = new Date(goal.endDate) <= new Date();
    
    if (isCompleted || progressPercentage >= 100) {
      return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
    } else if (progressPercentage >= 75) {
      return <Badge className="bg-blue-100 text-blue-800">En bonne voie</Badge>;
    } else if (progressPercentage >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">En retard</Badge>;
    }
  };

  // Fonctions de gestion
  const handleUpdateGoal = async (goalId: string, data: any) => {
    try {
      await updateSavingsGoal(goalId, data);
      toast.success('Objectif d\'épargne mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'objectif');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet objectif d\'épargne ?')) {
      try {
        await deleteSavingsGoal(goalId);
        toast.success('Objectif d\'épargne supprimé');
      } catch (error) {
        toast.error('Erreur lors de la suppression de l\'objectif');
      }
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Objectifs d'Épargne</h1>
          <p className="text-gray-600 mt-1">
            Suivi et analyse des objectifs d'épargne de tous les utilisateurs
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total objectifs</p>
                <p className="text-2xl font-bold text-blue-600">{totalGoals}</p>
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
                <p className="text-sm text-gray-600">Objectifs actifs</p>
                <p className="text-2xl font-bold text-green-600">{activeGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Objectifs terminés</p>
                <p className="text-2xl font-bold text-purple-600">{completedGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progression moyenne</p>
                <p className="text-2xl font-bold text-orange-600">{averageProgress.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="goals">Objectifs</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="leaderboard">Classement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Goals Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>Progression des objectifs</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}€`, '']} />
                      <Line type="monotone" dataKey="target" stroke="#3B82F6" strokeWidth={2} name="Objectif" />
                      <Line type="monotone" dataKey="current" stroke="#10B981" strokeWidth={2} name="Actuel" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Currency Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    <span>Répartition par devise</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({name, percentage}) => `${name} ${percentage?.toFixed(1)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} objectifs`, '']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                      Aucune donnée à afficher
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            {/* Filters */}
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
                      <SelectItem value="active">Actifs</SelectItem>
                      <SelectItem value="completed">Terminés</SelectItem>
                      <SelectItem value="on_track">En bonne voie</SelectItem>
                      <SelectItem value="behind">En retard</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue placeholder="Devise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les devises</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="XOF">XOF</SelectItem>
                      <SelectItem value="MAD">MAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Goals Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Objectifs d'épargne ({filteredGoals.length})</span>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Objectif</TableHead>
                        <TableHead>Progression</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Devise</TableHead>
                        <TableHead>Période</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGoals.map((goal) => {
                        const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
                        return (
                          <TableRow key={goal.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Users className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{goal.userName}</p>
                                  <p className="text-xs text-gray-500">{goal.userEmail}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{goal.targetAmount.toLocaleString()} {goal.currency}</p>
                                <p className="text-sm text-gray-500">
                                  {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Progress value={progressPercentage} className="h-2" />
                                <p className="text-xs text-gray-500">{progressPercentage.toFixed(1)}%</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(goal)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{goal.currency}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{new Date(goal.startDate).toLocaleDateString('fr-FR')}</p>
                                <p className="text-gray-500">
                                  au {new Date(goal.endDate).toLocaleDateString('fr-FR')}
                                </p>
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
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedGoal(goal);
                                      setIsViewModalOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Voir détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transactions d'épargne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>Fonctionnalité en cours de développement</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span>Classement global</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>Fonctionnalité en cours de développement</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Goal Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de l'objectif d'épargne</DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Utilisateur</label>
                  <p className="text-sm">{selectedGoal.userName}</p>
                  <p className="text-xs text-gray-500">{selectedGoal.userEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Objectif</label>
                  <p className="text-sm font-bold">{selectedGoal.targetAmount.toLocaleString()} {selectedGoal.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Actuel</label>
                  <p className="text-sm">{selectedGoal.currentAmount.toLocaleString()} {selectedGoal.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Progression</label>
                  <p className="text-sm">{((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Revenu mensuel</label>
                  <p className="text-sm">{selectedGoal.monthlyIncome.toLocaleString()} {selectedGoal.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type de revenu</label>
                  <p className="text-sm">{selectedGoal.isVariableIncome ? 'Variable' : 'Fixe'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Période</label>
                <p className="text-sm">
                  Du {new Date(selectedGoal.startDate).toLocaleDateString('fr-FR')} au {new Date(selectedGoal.endDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Progression</label>
                <Progress value={(selectedGoal.currentAmount / selectedGoal.targetAmount) * 100} className="h-2 mt-2" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SavingsManagement;
