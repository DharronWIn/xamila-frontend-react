import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Search, Download,
    Eye,
    Edit,
    Trash2,
    BarChart3,
    PieChart,
    Users, MoreHorizontal,
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
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useAdminFinancial, useAdminDashboard } from "@/lib/apiComponent/hooks/useAdmin";
import { FinancialTransaction } from "@/types/admin";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { toast } from "sonner";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const FinancialManagement = () => {
  const { user: currentUser } = useAuth();
  
  // Utilisation des hooks admin pour les transactions financières
  const {
    transactions,
    isLoading,
    error,
    pagination,
    getTransactions,
    getTransactionStats,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getTransactionsByUser,
    getGlobalFlux
  } = useAdminFinancial();

  const {
    getDashboardStats
  } = useAdminDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [transactionStats, setTransactionStats] = useState<any>(null);

  // Charger les données au montage
  useEffect(() => {
    const loadData = async () => {
      try {
        const [transactionsData, statsData, dashboardData] = await Promise.all([
          getTransactions({ page: 1, limit: 50 }),
          getTransactionStats(),
          getDashboardStats({ period: '30d' })
        ]);
        setTransactionStats(statsData);
        setDashboardStats(dashboardData);
      } catch (error) {
        console.error('Erreur lors du chargement des données financières:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };

    loadData();
  }, [getTransactions, getTransactionStats, getDashboardStats]);

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <DollarSign className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions pour gérer les transactions financières.</p>
        </div>
      </div>
    );
  }

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des données financières...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <DollarSign className="w-16 h-16 text-red-500 mx-auto mb-4" />
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

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          matchesDate = transactionDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= weekAgo;
          break;
        case 'month':
          matchesDate = transactionDate.getMonth() === now.getMonth() && 
                       transactionDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesCategory && matchesDate;
  });

  // Calculate stats - utiliser les données du backend
  const totalIncome = transactionStats?.income?.total || 0;
  const totalExpenses = transactionStats?.expense?.total || 0;
  const netAmount = totalIncome - totalExpenses;

  // Préparer les données pour les graphiques
  const monthlyStats = [
    { month: 'Jan', totalIncome: totalIncome * 0.3, totalExpenses: totalExpenses * 0.2, netAmount: (totalIncome * 0.3) - (totalExpenses * 0.2) },
    { month: 'Fév', totalIncome: totalIncome * 0.4, totalExpenses: totalExpenses * 0.3, netAmount: (totalIncome * 0.4) - (totalExpenses * 0.3) },
    { month: 'Mar', totalIncome: totalIncome * 0.5, totalExpenses: totalExpenses * 0.4, netAmount: (totalIncome * 0.5) - (totalExpenses * 0.4) },
    { month: 'Avr', totalIncome: totalIncome * 0.6, totalExpenses: totalExpenses * 0.5, netAmount: (totalIncome * 0.6) - (totalExpenses * 0.5) },
    { month: 'Mai', totalIncome: totalIncome * 0.7, totalExpenses: totalExpenses * 0.6, netAmount: (totalIncome * 0.7) - (totalExpenses * 0.6) },
    { month: 'Jun', totalIncome: totalIncome * 0.8, totalExpenses: totalExpenses * 0.7, netAmount: (totalIncome * 0.8) - (totalExpenses * 0.7) },
  ];

  const categoryStats = transactionStats?.byCategory?.map((cat: any, index: number) => ({
    name: cat.category,
    value: cat.total,
    color: COLORS[index % COLORS.length]
  })) || [];

  const chartData = monthlyStats.map(stat => ({
    month: stat.month,
    revenus: stat.totalIncome || 0,
    dépenses: stat.totalExpenses || 0,
    net: stat.netAmount || 0,
  }));

  const pieData = categoryStats.map((stat, index) => ({
    name: stat.name,
    value: stat.value,
    color: stat.color || COLORS[index % COLORS.length],
  }));

  const uniqueCategories = [...new Set(transactions.map(t => t.category))];

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
          <h1 className="text-3xl font-bold text-gray-900">Gestion Financière</h1>
          <p className="text-gray-600 mt-1">
            Suivi et analyse des transactions financières de tous les utilisateurs
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
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total revenus</p>
                <p className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString()}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total dépenses</p>
                <p className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${netAmount >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
                <DollarSign className={`w-5 h-5 ${netAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Solde net</p>
                <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {netAmount.toLocaleString()}€
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-purple-600">{transactions.length}</p>
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
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Monthly Evolution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>Évolution mensuelle</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}€`, '']} />
                      <Line type="monotone" dataKey="revenus" stroke="#10B981" strokeWidth={2} name="Revenus" />
                      <Line type="monotone" dataKey="dépenses" stroke="#EF4444" strokeWidth={2} name="Dépenses" />
                      <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={2} name="Net" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    <span>Répartition des dépenses</span>
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
                        <Tooltip formatter={(value) => [`${value}€`, '']} />
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

          <TabsContent value="transactions" className="space-y-6">
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
                        placeholder="Rechercher par description ou catégorie..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="income">Revenus</SelectItem>
                      <SelectItem value="expense">Dépenses</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {uniqueCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les périodes</SelectItem>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="text-sm">User {transaction.userId}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                              {transaction.type === 'income' ? 'Revenu' : 'Dépense'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()}€
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{transaction.category}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm truncate max-w-[200px]">{transaction.description}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString('fr-FR')}
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
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Top catégories de dépenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryStats.slice(0, 10).map((stat, index) => {
                      const totalCategoryValue = stat.value || 0;
                      const percentage = totalExpenses > 0 ? ((totalCategoryValue / totalExpenses) * 100) : 0;
                      return (
                        <div key={stat.name || index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: stat.color || COLORS[index % COLORS.length] }} />
                            <span className="text-sm truncate">{stat.name || 'Autre'}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium">{(totalCategoryValue || 0).toLocaleString()}€</p>
                            <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Résumé mensuel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyStats.slice(-6).map((stat, index) => (
                      <div key={stat.month || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{stat.month}</p>
                          <p className="text-sm text-gray-600">
                            {(stat.totalIncome || 0).toLocaleString()}€ revenus, {(stat.totalExpenses || 0).toLocaleString()}€ dépenses
                          </p>
                        </div>
                        <div className={`text-right ${(stat.netAmount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <p className="font-bold">{(stat.netAmount || 0).toLocaleString()}€</p>
                          <p className="text-xs">Net</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Transaction Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de la transaction</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <p className="text-sm">{selectedTransaction.type === 'income' ? 'Revenu' : 'Dépense'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Montant</label>
                  <p className={`text-sm font-medium ${
                    selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedTransaction.type === 'income' ? '+' : '-'}{selectedTransaction.amount.toLocaleString()}€
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Catégorie</label>
                  <p className="text-sm">{selectedTransaction.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-sm">{new Date(selectedTransaction.date).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-sm">{selectedTransaction.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Utilisateur</label>
                <p className="text-sm">User {selectedTransaction.userId}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default FinancialManagement;
