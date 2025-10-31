import { useState, useEffect, useMemo } from "react";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFluxFinancier, useTransactions, useTransactionStats } from "@/lib/apiComponent/hooks/useFinancial";
import { Transaction } from "@/lib/apiComponent/types";
import { AddTransactionModal } from "./AddTransactionModal";
import { TransactionList } from "./TransactionCard";
import { FluxBalance, FluxSummary } from "./FluxBalance";
import { CategoryBreakdown } from "./CategoryStats";
import { FluxChartByCategory } from "./FluxChartByCategory";
import { toast } from "sonner";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface FluxDashboardProps {
  className?: string;
}

export function FluxDashboard({ className = "" }: FluxDashboardProps) {
  // Hooks
  const {
    fluxBalance,
    fluxSummary,
    chartByCategory,
    isLoading: fluxLoading,
    error: fluxError,
    getFluxBalance,
    getFluxSummary,
    getChartByCategory,
    updateFluxData
  } = useFluxFinancier();

  const {
    transactions,
    isLoading: transactionsLoading,
    getTransactions
  } = useTransactions();

  const {
    stats,
    isLoading: statsLoading,
    getStats
  } = useTransactionStats();

  // Local state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          getFluxBalance(),
          getFluxSummary(),
          getChartByCategory(),
          getTransactions({ limit: 10 }),
          getStats()
        ]);
      } catch (error) {
        console.error('Error loading flux data:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };

    loadData();
  }, [getFluxBalance, getFluxSummary, getChartByCategory, getTransactions, getStats]);

  const handleTransactionAdded = (response?: { balance: any; summary: any }) => {
    if (response?.balance && response?.summary) {
      // Mettre à jour directement avec les données de la réponse API
      updateFluxData(response.balance, response.summary);
      // Rafraîchir seulement le graphique par catégorie et les stats (car non inclus dans la réponse)
      getChartByCategory();
      getStats();
      // Mettre à jour la liste des transactions (la nouvelle transaction est déjà dans le state du hook)
      getTransactions({ limit: 10 });
    } else {
      // Fallback: rafraîchir toutes les données si la réponse n'est pas disponible
      getFluxBalance();
      getFluxSummary();
      getChartByCategory();
      getTransactions({ limit: 10 });
      getStats();
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info('Fonctionnalité d\'export en cours de développement');
  };

  const isLoading = fluxLoading || transactionsLoading || statsLoading;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Prepare chart data
  const monthlyTrend = useMemo(() => {
    if (stats?.monthlyTrend && stats.monthlyTrend.length > 0) {
      return stats.monthlyTrend.map((m: any) => ({
        month: m.month,
        revenus: m.income,
        dépenses: m.expenses,
        net: m.net,
      }));
    }
    // Fallback compute from transactions
    const monthly: Record<string, { income: number; expenses: number; net: number }> = {};
    (transactions || []).forEach((t: Transaction) => {
      const key = (t.date || '').substring(0, 7);
      if (!monthly[key]) monthly[key] = { income: 0, expenses: 0, net: 0 };
      if (t.type === 'INCOME') monthly[key].income += t.amount; else monthly[key].expenses += t.amount;
      monthly[key].net = monthly[key].income - monthly[key].expenses;
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, revenus: v.income, dépenses: v.expenses, net: v.net }));
  }, [stats?.monthlyTrend, transactions]);

  const categoryData = useMemo(() => {
    if (stats?.categoryBreakdown && stats.categoryBreakdown.length > 0) {
      return stats.categoryBreakdown
        .filter((c: any) => c.type === 'EXPENSE' || c.category !== 'INCOME')
        .map((c: any, idx: number) => ({ name: c.category, value: c.amount, color: COLORS[idx % COLORS.length] }));
    }
    const byCat: Record<string, number> = {};
    (transactions || []).forEach((t: Transaction) => {
      if (t.type === 'EXPENSE') {
        byCat[t.category] = (byCat[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(byCat)
      .map(([name, value], idx) => ({ name, value, color: COLORS[idx % COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [stats?.categoryBreakdown, transactions]);

  if (fluxError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erreur lors du chargement des données</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Flux Financier</h1>
          <p className="text-gray-600">Gérez vos transactions et suivez votre flux financier</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exporter</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nouvelle transaction</span>
            <span className="sm:hidden">Nouvelle</span>
          </Button>
        </div>
      </div>

      {/* Balance Overview */}
      {fluxBalance && (
        <FluxBalance
          balance={fluxBalance}
          isLoading={fluxLoading}
          showDetails={showDetails}
          onToggleDetails={() => setShowDetails(!showDetails)}
        />
      )}

      {/* Summary Cards */}
      {fluxBalance && (
        <FluxSummary
          balance={fluxBalance}
          isLoading={fluxLoading}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transactions récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <TransactionList
                  transactions={transactions.slice(0, 5)}
                  showActions={false}
                />
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          {stats && stats.categoryBreakdown && (
            <CategoryBreakdown
              incomeStats={stats.categoryBreakdown
                .filter((cat: any) => cat.type === 'INCOME' || cat.category === 'INCOME')
                .map((cat: any) => ({
                  category: cat.category,
                  amount: cat.amount,
                  percentage: cat.percentage || 0,
                  transactionCount: cat.count || 0
                }))}
              expenseStats={stats.categoryBreakdown
                .filter((cat: any) => cat.type === 'EXPENSE' || (cat.category !== 'INCOME' && cat.type !== 'INCOME'))
                .map((cat: any) => ({
                  category: cat.category,
                  amount: cat.amount,
                  percentage: cat.percentage || 0,
                  transactionCount: cat.count || 0
                }))}
            />
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <TransactionList
                  transactions={transactions}
                  showActions={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Graphiques par catégorie (nouveau) */}
          <FluxChartByCategory 
            data={chartByCategory}
            isLoading={fluxLoading}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tendance mensuelle</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}€`, '']} />
                      <Line type="monotone" dataKey="revenus" stroke="#10B981" strokeWidth={2} />
                      <Line type="monotone" dataKey="dépenses" stroke="#EF4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">Aucune donnée à afficher</div>
                )}
              </CardContent>
            </Card>

            {/* Category Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Analyse par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <RechartsPieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}€`, '']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">Aucune dépense à afficher</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleTransactionAdded}
      />
    </div>
  );
}
