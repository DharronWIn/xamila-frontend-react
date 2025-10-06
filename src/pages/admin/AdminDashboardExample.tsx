import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Users, DollarSign,
    Award, AlertCircle, Bell, Settings, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useAdminDashboard } from "@/lib/apiComponent/hooks/useAdmin";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboardExample = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
  // Utilisation des hooks admin
  const {
    isLoading: dashboardLoading,
    error: dashboardError,
    getDashboardStats,
    getUserStats,
    getAdminStats
  } = useAdminDashboard();

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [dashboard, users, admins] = await Promise.all([
          getDashboardStats({ period: selectedPeriod as any }),
          getUserStats(),
          getAdminStats()
        ]);
        
        setDashboardStats(dashboard);
        setUserStats(users);
        setAdminStats(admins);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadDashboardData();
  }, [selectedPeriod, getDashboardStats, getUserStats, getAdminStats]);

  // Navigation functions for modules
  const navigateToModule = (module: string) => {
    navigate(`/admin-dashboard/${module}`);
  };

  // Mock data fallback si les données ne sont pas encore chargées
  const stats = dashboardStats || {
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    pendingUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    monthlyTransactions: 0,
    totalBankAccounts: 0,
    pendingBankAccounts: 0,
    totalResources: 0,
    totalNotifications: 0,
    monthlyNotifications: 0
  };

  const userGrowthData = userStats?.userGrowth || [
    { period: 'Jan', count: 100 },
    { period: 'Fév', count: 150 },
    { period: 'Mar', count: 200 },
    { period: 'Avr', count: 180 },
    { period: 'Mai', count: 250 },
    { period: 'Juin', count: 300 }
  ];

  const revenueData = dashboardStats?.revenueGrowth || [
    { period: 'Jan', amount: 1000 },
    { period: 'Fév', amount: 1500 },
    { period: 'Mar', amount: 2000 },
    { period: 'Avr', amount: 1800 },
    { period: 'Mai', amount: 2500 },
    { period: 'Juin', amount: 3000 }
  ];

  const transactionData = dashboardStats?.transactionGrowth || [
    { period: 'Jan', count: 50 },
    { period: 'Fév', count: 75 },
    { period: 'Mar', count: 100 },
    { period: 'Avr', count: 90 },
    { period: 'Mai', count: 125 },
    { period: 'Juin', count: 150 }
  ];

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement du dashboard admin...</p>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">{dashboardError}</p>
          <Button onClick={() => window.location.reload()}>
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
              Dashboard Administrateur
            </h1>
            <p className="text-gray-600">
              Bienvenue, {user?.name || 'Administrateur'} - Vue d'ensemble de la plateforme
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Badge variant="default" className="px-3 py-1">
              <Award className="w-4 h-4 mr-1" />
              Administrateur
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div variants={fadeInUp}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Totaux</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeUsers} actifs
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Premium</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% du total
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRevenue.toLocaleString()} FCFA
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.monthlyRevenue.toLocaleString()} FCFA ce mois
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingUsers}</div>
              <p className="text-xs text-muted-foreground">
                Approbations nécessaires
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={fadeInUp} className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#0088FE" 
                    strokeWidth={2}
                    dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeInUp} className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigateToModule('users')}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm">Gestion Utilisateurs</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigateToModule('financial')}
              >
                <DollarSign className="w-6 h-6" />
                <span className="text-sm">Gestion Financière</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigateToModule('notifications')}
              >
                <Bell className="w-6 h-6" />
                <span className="text-sm">Notifications</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigateToModule('settings')}
              >
                <Settings className="w-6 h-6" />
                <span className="text-sm">Paramètres</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nouvel utilisateur inscrit</p>
                  <p className="text-xs text-muted-foreground">Il y a 5 minutes</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Paiement Premium reçu</p>
                  <p className="text-xs text-muted-foreground">Il y a 15 minutes</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Demande d'approbation en attente</p>
                  <p className="text-xs text-muted-foreground">Il y a 1 heure</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboardExample;
