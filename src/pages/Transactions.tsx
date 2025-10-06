import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    TrendingUp,
    TrendingDown, DollarSign,
    PieChart,
    BarChart3,
    Download,
    Edit,
    Trash2,
    Crown,
    Search,
    Eye,
    EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useTransactions, useTransactionStats } from "@/lib/apiComponent/hooks/useFinancial";
import { Transaction } from "@/lib/apiComponent/types";
import { usePremiumProtection } from "@/hooks/usePremiumProtection";
import PremiumUpgradeModal from "@/components/premium/PremiumUpgradeModal";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface TransactionFormData {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
}

const Transactions = () => {
  const { user } = useAuth();
  const {
    isPremium,
    isUpgradeModalOpen,
    handlePremiumFeatureClick,
    closeUpgradeModal
  } = usePremiumProtection();
  
  // API hooks
  const {
    transactions: apiTransactions,
    isLoading: transactionsLoading,
    error: transactionsError,
    getTransactions,
    createTransaction,
    updateTransaction: updateTransactionApi,
    deleteTransaction: deleteTransactionApi
  } = useTransactions();
  
  const {
    stats: transactionStats,
    chartData: apiChartData,
    categories: apiCategories,
    isLoading: statsLoading,
    error: statsError,
    getStats,
    getChartData,
    getCategories
  } = useTransactionStats();
  
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showCharts, setShowCharts] = useState(false);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Use API data with useMemo to prevent unnecessary re-renders
  const transactions = useMemo(() => apiTransactions || [], [apiTransactions]);
  const isLoading = transactionsLoading || statsLoading;
  const error = transactionsError || statsError;

  // Debug logs
  console.log('Transactions state:', { 
    apiTransactions: apiTransactions?.length || 0, 
    transactions: transactions.length, 
    isLoading, 
    error 
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading transaction data...');
        await getTransactions();
        await getStats();
        await getChartData();
        await getCategories();
        console.log('Transaction data loaded successfully');
      } catch (err) {
        console.error('Error loading transaction data:', err);
        toast.error('Erreur lors du chargement des données');
      }
    };
    
    if (user?.id) {
      loadData();
    }
  }, [user?.id, getTransactions, getStats, getChartData, getCategories]);

  // Calculate stats from API data or use API stats
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  
  const totalIncome = transactionStats?.monthlyIncome || 
    monthlyTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
      
  const totalExpenses = transactionStats?.monthlyExpenses || 
    monthlyTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
      
  const balance = transactionStats?.monthlyNet || (totalIncome - totalExpenses);

  // Filter transactions with useMemo to prevent timing issues
  const filteredTransactions = useMemo(() => {
    console.log('Filtering transactions:', { transactions: transactions.length, filter, searchQuery });
    
    return transactions.filter(transaction => {
      const matchesFilter = filter === 'all' || 
        (filter === 'income' && transaction.type === 'INCOME') ||
        (filter === 'expense' && transaction.type === 'EXPENSE');
      const matchesSearch = (transaction.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, searchQuery]);

  // Debug effect to monitor transactions changes
  useEffect(() => {
    console.log('Transactions updated:', { 
      apiTransactions: apiTransactions?.length || 0, 
      transactions: transactions.length,
      filteredTransactions: filteredTransactions.length 
    });
  }, [apiTransactions, transactions, filteredTransactions]);


  const handleAddTransaction = async (formData: TransactionFormData) => {
    if (!isPremium) {
      handlePremiumFeatureClick();
      return;
    }

    setIsAddingTransaction(true);
    try {
      await createTransaction(formData);
      setIsAddModalOpen(false);
      toast.success('Transaction ajoutée avec succès');
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Erreur lors de l\'ajout de la transaction');
    } finally {
      setIsAddingTransaction(false);
    }
  };

  const handleEditTransaction = async (formData: TransactionFormData) => {
    if (!isPremium || !editingTransaction) return;

    try {
      await updateTransactionApi(editingTransaction.id, formData);
      setEditingTransaction(null);
      toast.success('Transaction modifiée avec succès');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Erreur lors de la modification de la transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!isPremium) {
      handlePremiumFeatureClick();
      return;
    }

    try {
      await deleteTransactionApi(id);
      toast.success('Transaction supprimée');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Erreur lors de la suppression de la transaction');
    }
  };

  const handleExport = async () => {
    if (!isPremium) {
      handlePremiumFeatureClick();
      return;
    }

    setIsExporting(true);
    try {
      // Créer un CSV des transactions
      const csvContent = [
        ['Date', 'Type', 'Catégorie', 'Description', 'Montant'],
        ...transactions.map(t => [
          new Date(t.date).toLocaleDateString('fr-FR'),
          t.type === 'INCOME' ? 'Revenu' : 'Dépense',
          t.category,
          t.description || '',
          t.amount.toString()
        ])
      ].map(row => row.join(',')).join('\n');

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Export réussi');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Erreur lors de l\'exportation');
    } finally {
      setIsExporting(false);
    }
  };

  const handleMonthlyReport = async () => {
    if (!isPremium) {
      handlePremiumFeatureClick();
      return;
    }

    setIsGeneratingReport(true);
    try {
      // Calculer les statistiques du mois en cours
      const currentMonth = new Date().toISOString().substring(0, 7);
      const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
      
      const incomeTransactions = monthlyTransactions.filter(t => t.type === 'INCOME');
      const expenseTransactions = monthlyTransactions.filter(t => t.type === 'EXPENSE');
      
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
      const netAmount = totalIncome - totalExpenses;
      
      // Calculer les catégories de dépenses
      const categoryBreakdown = expenseTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
      
      // Générer le rapport HTML
      const reportHtml = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rapport Mensuel - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { display: flex; justify-content: space-around; margin: 20px 0; }
            .summary-card { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; min-width: 150px; }
            .income { border-left: 4px solid #10B981; }
            .expense { border-left: 4px solid #EF4444; }
            .net { border-left: 4px solid #3B82F6; }
            .positive { color: #10B981; }
            .negative { color: #EF4444; }
            .transactions-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .transactions-table th, .transactions-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .transactions-table th { background-color: #f2f2f2; }
            .category-breakdown { margin: 20px 0; }
            .category-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; margin-top: 30px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rapport Mensuel</h1>
            <h2>${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
            <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card income">
              <h3>Revenus</h3>
              <p style="font-size: 24px; font-weight: bold; color: #10B981;">${totalIncome.toLocaleString()} FCFA</p>
              <p>${incomeTransactions.length} transaction(s)</p>
            </div>
            <div class="summary-card expense">
              <h3>Dépenses</h3>
              <p style="font-size: 24px; font-weight: bold; color: #EF4444;">${totalExpenses.toLocaleString()} FCFA</p>
              <p>${expenseTransactions.length} transaction(s)</p>
            </div>
            <div class="summary-card net">
              <h3>Solde Net</h3>
              <p style="font-size: 24px; font-weight: bold;" class="${netAmount >= 0 ? 'positive' : 'negative'}">${netAmount.toLocaleString()} FCFA</p>
              <p>${netAmount >= 0 ? 'Excédent' : 'Déficit'}</p>
            </div>
          </div>
          
          <h3>Détail des Transactions</h3>
          <table class="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Catégorie</th>
                <th>Description</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyTransactions.map(t => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString('fr-FR')}</td>
                  <td>${t.type === 'INCOME' ? 'Revenu' : 'Dépense'}</td>
                  <td>${t.category}</td>
                  <td>${t.description || '-'}</td>
                  <td style="color: ${t.type === 'INCOME' ? '#10B981' : '#EF4444'};">
                    ${t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()} FCFA
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="category-breakdown">
            <h3>Répartition des Dépenses par Catégorie</h3>
            ${Object.entries(categoryBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => `
                <div class="category-item">
                  <span>${category}</span>
                  <span style="font-weight: bold;">${amount.toLocaleString()} FCFA</span>
                </div>
              `).join('')}
          </div>
          
          <div class="footer">
            <p>Rapport généré par Save Up Quest</p>
            <p>${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </body>
        </html>
      `;

      // Créer et télécharger le rapport HTML
      const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rapport_mensuel_${currentMonth}.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Rapport mensuel généré avec succès');
    } catch (error) {
      console.error('Error generating monthly report:', error);
      toast.error('Erreur lors de la génération du rapport');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Use API stats or calculate from transactions
  const monthlyStats = transactionStats?.monthlyTrend || [];
  const categoryStats = transactionStats?.categoryBreakdown || [];

  // Si pas de données API, calculer à partir des transactions
  const lineChartData = monthlyStats.length > 0 ? monthlyStats.map(stat => ({
    month: stat.month,
    revenus: stat.income,
    dépenses: stat.expenses,
    net: stat.net,
  })) : (() => {
    // Calculer les données mensuelles à partir des transactions
    const monthlyData: { [key: string]: { income: number; expenses: number; net: number } } = {};
    
    transactions.forEach(transaction => {
      const month = transaction.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0, net: 0 };
      }
      
      if (transaction.type === 'INCOME') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expenses += transaction.amount;
      }
      monthlyData[month].net = monthlyData[month].income - monthlyData[month].expenses;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: month,
        revenus: data.income,
        dépenses: data.expenses,
        net: data.net,
      }));
  })();

  const pieData = categoryStats.length > 0 ? categoryStats.map((stat, index) => ({
    name: stat.category,
    value: stat.amount,
    color: COLORS[index % COLORS.length],
  })) : (() => {
    // Calculer les données de catégorie à partir des transactions
    const categoryData: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(transaction => {
        categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount;
      });

    return Object.entries(categoryData)
      .map(([category, amount], index) => ({
        name: category,
        value: amount,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  })();

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Loading State */}
      {isLoading && (
        <motion.div variants={fadeInUp} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-600 mr-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Chargement des transactions</h3>
              <p className="text-sm text-blue-600 mt-1">Veuillez patienter...</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div variants={fadeInUp} className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">
              <div className="w-5 h-5">⚠️</div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Capture du flux financier</h1>
          <p className="text-gray-600 mt-1">
            Interface moderne de gestion financière - Suivez vos revenus et dépenses
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={!isPremium ? handlePremiumFeatureClick : handleExport}
            disabled={isExporting}
          >
            <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-spin' : ''}`} />
            {isExporting ? 'Export...' : 'Exporter'}
            {!isPremium && <Crown className="w-3 h-3 ml-2 text-primary" />}
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={!isPremium ? handlePremiumFeatureClick : undefined}
                className="bg-primary hover:bg-primary/90"
                disabled={isAddingTransaction}
              >
                <Plus className={`h-4 w-4 mr-2 ${isAddingTransaction ? 'animate-spin' : ''}`} />
                {isAddingTransaction ? 'Ajout...' : 'Nouvelle transaction'}
                {!isPremium && <Crown className="w-3 h-3 ml-2" />}
              </Button>
            </DialogTrigger>
            {isPremium && (
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nouvelle transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm onSubmit={handleAddTransaction} isLoading={isAddingTransaction} />
              </DialogContent>
            )}
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={`transition-all duration-300 hover:shadow-lg ${!isPremium ? 'relative overflow-hidden cursor-pointer' : ''}`}
              onClick={!isPremium ? handlePremiumFeatureClick : undefined}>
          {!isPremium && (
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenus ce mois
            </CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString()} €</div>
            <p className="text-xs text-gray-500 mt-1">
              {transactions.filter(t => t.type === 'INCOME').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 hover:shadow-lg ${!isPremium ? 'relative overflow-hidden cursor-pointer' : ''}`}
              onClick={!isPremium ? handlePremiumFeatureClick : undefined}>
          {!isPremium && (
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Dépenses ce mois
            </CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()} €</div>
            <p className="text-xs text-gray-500 mt-1">
              {transactions.filter(t => t.type === 'EXPENSE').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 hover:shadow-lg ${!isPremium ? 'relative overflow-hidden cursor-pointer' : ''}`}
              onClick={!isPremium ? handlePremiumFeatureClick : undefined}>
          {!isPremium && (
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Solde net
            </CardTitle>
            <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-4 w-4 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {balance.toLocaleString()} €
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {balance >= 0 ? 'Excédent' : 'Déficit'} mensuel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total transactions
            </CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{transactions.length}</div>
            <p className="text-xs text-gray-500 mt-1">Toutes périodes</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Section */}
      {isPremium && monthlyStats.length > 0 && (
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Analyse financière</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCharts(!showCharts)}
                >
                  {showCharts ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showCharts ? 'Masquer' : 'Afficher'} les graphiques
                </Button>
              </div>
            </CardHeader>
            {showCharts && (
              <CardContent className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Line Chart */}
                  <div>
                    <h3 className="font-semibold mb-4">Évolution mensuelle</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={lineChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}€`, '']} />
                        <Line type="monotone" dataKey="revenus" stroke="#10B981" strokeWidth={2} />
                        <Line type="monotone" dataKey="dépenses" stroke="#EF4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie Chart */}
                  <div>
                    <h3 className="font-semibold mb-4">Répartition des dépenses</h3>
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
                        Aucune dépense à afficher
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Historique des transactions
                </CardTitle>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-auto"
                    />
                  </div>
                  
                  <Select value={filter} onValueChange={(value: 'all' | 'income' | 'expense') => setFilter(value)}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="income">Revenus</SelectItem>
                      <SelectItem value="expense">Dépenses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!isPremium ? (
                <div className="text-center py-12">
                  <Crown className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Fonctionnalité Premium
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Accédez au suivi complet de vos transactions avec l'interface Premium
                  </p>
                  <Button onClick={handlePremiumFeatureClick}>
                    Découvrir Premium
                  </Button>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucune transaction
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Commencez à suivre vos finances en ajoutant votre première transaction
                  </p>
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une transaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'INCOME' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'INCOME' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {transaction.category} • {new Date(transaction.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`font-semibold ${
                          transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'INCOME' ? '+' : '-'}{transaction.amount.toLocaleString()} €
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTransaction(transaction)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Category Stats */}
          {isPremium && categoryStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Top catégories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryStats.slice(0, 5).map((stat, index) => (
                    <div key={stat.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm truncate">{stat.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{stat.amount.toLocaleString()}€</p>
                        <p className="text-xs text-gray-500">{stat.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={!isPremium ? handlePremiumFeatureClick : () => setIsAddModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle transaction
                {!isPremium && <Crown className="w-3 h-3 ml-auto text-primary" />}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={!isPremium ? handlePremiumFeatureClick : handleExport}
                disabled={isExporting}
              >
                <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-spin' : ''}`} />
                {isExporting ? 'Export...' : 'Exporter les données'}
                {!isPremium && <Crown className="w-3 h-3 ml-auto text-primary" />}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={!isPremium ? handlePremiumFeatureClick : handleMonthlyReport}
                disabled={isGeneratingReport}
              >
                <BarChart3 className={`w-4 h-4 mr-2 ${isGeneratingReport ? 'animate-spin' : ''}`} />
                {isGeneratingReport ? 'Génération...' : 'Rapport mensuel'}
                {!isPremium && <Crown className="w-3 h-3 ml-auto text-primary" />}
              </Button>
            </CardContent>
          </Card>

          {/* Ad Placement */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold text-blue-900 mb-2">💰 Partenaire Bancaire</h3>
              <p className="text-blue-800 text-sm mb-3">
                Ouvrez un compte épargne avec notre partenaire et bénéficiez d'un taux avantageux
              </p>
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-200">
                En savoir plus
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingTransaction && isPremium && (
        <Dialog open={true} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modifier la transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm 
              transaction={editingTransaction}
              onSubmit={handleEditTransaction}
              isLoading={isAddingTransaction}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        userEmail={user?.email || ''}
        userId={user?.id || ''}
        title="Débloquez le Suivi Financier Premium"
        description="Accédez au suivi complet de vos transactions et aux analyses avancées"
      />
    </motion.div>
  );
};

// Transaction Form Component
interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: TransactionFormData) => void;
  isLoading?: boolean;
}

function TransactionForm({ transaction, onSubmit, isLoading = false }: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: transaction?.type || 'EXPENSE',
    amount: transaction?.amount || 0,
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const incomeCategories = ['Salaire', 'Freelance', 'Bonus', 'Investissements', 'Autres revenus'];
  const expenseCategories = ['Logement', 'Transport', 'Nourriture', 'Loisirs', 'Santé', 'Shopping', 'Éducation', 'Autres dépenses'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value: 'INCOME' | 'EXPENSE') => 
            setFormData({...formData, type: value, category: ''})
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Revenu</SelectItem>
              <SelectItem value="EXPENSE">Dépense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Montant (€)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
            required
            min="0"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Catégorie</Label>
        <Select value={formData.category} onValueChange={(value) => 
          setFormData({...formData, category: value})
        }>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {(formData.type === 'INCOME' ? incomeCategories : expenseCategories).map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Description de la transaction"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {transaction ? 'Modification...' : 'Ajout...'}
          </>
        ) : (
          transaction ? 'Modifier' : 'Ajouter'
        )}
      </Button>
    </form>
  );
}

export default Transactions;