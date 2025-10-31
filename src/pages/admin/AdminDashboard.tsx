import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Users,
    TrendingUp,
    DollarSign,
    Award,
    UserCheck, AlertCircle,
    Mail,
    Bell, Activity,
    BarChart3,
    Eye,
    Settings,
    Target,
    MessageCircle, CreditCard,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Mock data for admin dashboard
const mockStats = {
  totalUsers: 1247,
  activeUsers: 987,
  premiumUsers: 342,
  pendingApprovals: 23,
  totalRevenue: 8456,
  monthlyGrowth: 12.5,
  conversionRate: 27.4,
  avgSessionTime: '8m 32s'
};

const mockRecentActivities = [
  { id: 1, type: 'user_registration', user: 'Marie Dupont', timestamp: '2 min ago', status: 'pending' },
  { id: 2, type: 'payment', user: 'Jean Martin', amount: 24.99, timestamp: '5 min ago', status: 'completed' },
  { id: 3, type: 'goal_completed', user: 'Sophie Bernard', goal: '3000€', timestamp: '12 min ago', status: 'completed' },
  { id: 4, type: 'user_registration', user: 'Paul Rousseau', timestamp: '18 min ago', status: 'approved' },
  { id: 5, type: 'support_ticket', user: 'Alice Moreau', timestamp: '25 min ago', status: 'open' },
];

const mockChartData = [
  { month: 'Jan', users: 650, revenue: 3200, premium: 180 },
  { month: 'Fév', users: 720, revenue: 4100, premium: 210 },
  { month: 'Mar', users: 890, revenue: 5400, premium: 270 },
  { month: 'Avr', users: 980, revenue: 6700, premium: 310 },
  { month: 'Mai', users: 1120, revenue: 7800, premium: 340 },
  { month: 'Juin', users: 1247, revenue: 8456, premium: 342 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
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
    navigate(`/admin/${module}`);
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

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

  // Utiliser les données réelles de l'API, avec fallback sur mock si nécessaire
  const stats = dashboardStats || mockStats;
  
  // Préparer les données de croissance pour les graphiques
  const userGrowthData = dashboardStats?.userGrowth 
    ? dashboardStats.userGrowth.map(item => ({ 
        date: item.date, 
        count: item.count 
      }))
    : userStats?.userGrowth 
    ? userStats.userGrowth.map(item => ({ 
        date: item.period, 
        count: item.count 
      }))
    : mockChartData.map(item => ({ 
        date: item.month, 
        count: item.users 
      }));
  
  const revenueData = dashboardStats?.revenueGrowth || mockChartData.map(item => ({ 
    date: item.month, 
    amount: item.revenue 
  }));

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">
            Vue d'ensemble et gestion de la plateforme Challenge d'Épargne
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={`${dashboardStats?.systemHealth?.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <Activity className="w-4 h-4 mr-1" />
            {dashboardStats?.systemHealth?.status === 'healthy' ? 'Système opérationnel' : 'Système en alerte'}
            {dashboardStats?.systemHealth?.database && ` • DB: ${dashboardStats.systemHealth.database}`}
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Utilisateurs totaux
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{(stats.totalUsers || 0).toLocaleString()}</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">
                +{(stats.newUsersThisMonth || 0)} ce mois
              </span>
            </div>
            {stats.totalAdmins && (
              <div className="text-xs text-gray-500 mt-1">
                {stats.totalAdmins} admins, {stats.totalGuests || 0} invités
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Utilisateurs Premium
            </CardTitle>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{(stats.premiumUsers || 0).toLocaleString()}</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-500">
                {stats.totalUsers ? (((stats.premiumUsers || 0) / stats.totalUsers) * 100).toFixed(1) : 0}% de conversion
              </span>
            </div>
            {stats.verifiedUsers && (
              <div className="text-xs text-gray-500 mt-1">
                {stats.verifiedUsers} vérifiés
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stats.totalRevenue !== undefined ? 'Revenus mensuels' : 'Nouveaux utilisateurs'}
            </CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              {stats.totalRevenue !== undefined ? (
              <DollarSign className="h-4 w-4 text-green-600" />
              ) : (
                <Users className="h-4 w-4 text-green-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {stats.totalRevenue !== undefined ? (
              <>
                <div className="text-2xl font-bold text-green-600">{(stats.totalRevenue || 0).toLocaleString()}€</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+15% vs mois dernier</span>
            </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">+{(stats.newUsersToday || 0)}</div>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500">
                    Aujourd'hui • {stats.newUsersThisWeek || 0} cette semaine
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stats.pendingUsers !== undefined ? 'Approbations en attente' : 'Système'}
            </CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              {stats.pendingUsers !== undefined ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <Activity className="h-4 w-4 text-red-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {stats.pendingUsers !== undefined ? (
              <>
                <div className="text-2xl font-bold text-red-600">{(stats.pendingUsers || 0).toLocaleString()}</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-red-500">Demandes à traiter</span>
            </div>
              </>
            ) : (
              <>
                <div className={`text-2xl font-bold ${stats.systemHealth?.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.systemHealth?.status === 'healthy' ? '✓ Opérationnel' : '⚠ Problème'}
                </div>
                {stats.systemHealth && (
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">
                      Uptime: {Math.floor((stats.systemHealth.uptime || 0) / 3600)}h
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts and Analytics */}
      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="revenue">Revenus</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>Croissance mensuelle</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowthData.length > 0 ? userGrowthData : mockChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={userGrowthData.length > 0 ? "date" : "month"} />
                      <YAxis />
                      <Tooltip />
                      {userGrowthData.length > 0 ? (
                        <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} name="Utilisateurs" />
                      ) : (
                        <>
                      <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} name="Utilisateurs" />
                      <Line type="monotone" dataKey="premium" stroke="#F59E0B" strokeWidth={2} name="Premium" />
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span>Évolution des revenus</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}€`, 'Revenus']} />
                      <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* User Stats */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Statistiques utilisateurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{(stats.activeUsers || 0).toLocaleString()}</div>
                      <p className="text-sm text-blue-800">Utilisateurs actifs</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.totalUsers && stats.premiumUsers 
                          ? (((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1))
                          : '0'}%
                      </div>
                      <p className="text-sm text-green-800">Taux de conversion</p>
                    </div>
                  </div>
                  
                  {stats.verifiedUsers !== undefined && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{(stats.verifiedUsers || 0).toLocaleString()}</div>
                        <p className="text-sm text-purple-800">Utilisateurs vérifiés</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{(stats.newUsersToday || 0).toLocaleString()}</div>
                        <p className="text-sm text-yellow-800">Nouveaux aujourd'hui</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Utilisateurs Premium</span>
                      <span>{(stats.premiumUsers || 0).toLocaleString()} / {(stats.totalUsers || 0).toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={stats.totalUsers && stats.premiumUsers 
                        ? ((stats.premiumUsers / stats.totalUsers) * 100) 
                        : 0} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Approuver les inscriptions
                    <Badge variant="secondary" className="ml-auto">
                      {(stats.pendingUsers || 0).toLocaleString()}
                    </Badge>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer une newsletter
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Notification globale
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Voir tous les utilisateurs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des revenus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Abonnements mensuels</span>
                      <span className="font-medium">4,580€</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Abonnements trimestriels</span>
                      <span className="font-medium">2,876€</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Abonnements annuels</span>
                      <span className="font-medium">1,000€</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total</span>
                        <span>{(stats.totalRevenue || stats.monthlyRevenue || 0).toLocaleString()}€</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métriques de performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(stats.totalRevenue || stats.monthlyRevenue) && stats.totalUsers && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenu par utilisateur (ARPU)</span>
                      <span className="font-medium">
                        {((stats.totalRevenue || stats.monthlyRevenue || 0) / stats.totalUsers).toFixed(2)}€
                      </span>
                  </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taux de rétention</span>
                    <span className="font-medium">84%</span>
                  </div>
                  {stats.newUsersThisMonth && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nouveaux utilisateurs ce mois</span>
                      <span className="font-medium">+{stats.newUsersThisMonth}</span>
                    </div>
                  )}
                  {stats.newUsersThisWeek && (
                  <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nouveaux cette semaine</span>
                      <span className="font-medium">+{stats.newUsersThisWeek}</span>
                  </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taux de désabonnement</span>
                    <span className="font-medium">3.2%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span>Activité récente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'user_registration' ? 'bg-blue-100' :
                          activity.type === 'payment' ? 'bg-green-100' :
                          activity.type === 'goal_completed' ? 'bg-yellow-100' :
                          'bg-purple-100'
                        }`}>
                          {activity.type === 'user_registration' && <Users className="w-5 h-5 text-blue-600" />}
                          {activity.type === 'payment' && <DollarSign className="w-5 h-5 text-green-600" />}
                          {activity.type === 'goal_completed' && <Award className="w-5 h-5 text-yellow-600" />}
                          {activity.type === 'support_ticket' && <Mail className="w-5 h-5 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{activity.user}</p>
                          <p className="text-sm text-gray-600">
                            {activity.type === 'user_registration' && 'Nouvelle inscription'}
                            {activity.type === 'payment' && `Paiement de ${activity.amount}€`}
                            {activity.type === 'goal_completed' && `Objectif atteint: ${activity.goal}`}
                            {activity.type === 'support_ticket' && 'Ticket de support ouvert'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            activity.status === 'completed' ? 'default' :
                            activity.status === 'pending' ? 'secondary' :
                            activity.status === 'approved' ? 'default' :
                            'destructive'
                          }
                          className="mb-1"
                        >
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* User Management */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Gestion des utilisateurs</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Gérez les comptes utilisateurs, approbations et abonnements
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {(stats.totalUsers || 0).toLocaleString()} utilisateurs
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigateToModule('users')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Gérer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Management */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span>Gestion financière</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Suivi et analyse des transactions financières
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {(stats.totalRevenue || stats.monthlyRevenue || 0).toLocaleString()}€ de revenus
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigateToModule('financial')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Gérer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Savings Management */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span>Objectifs d'épargne</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Suivi des objectifs d'épargne et des défis
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      156 objectifs actifs
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigateToModule('savings')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Gérer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Social Management */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-orange-600" />
                    <span>Gestion sociale</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Modération du contenu communautaire
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      1,247 posts, 89 défis
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigateToModule('social')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Gérer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications Management */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-red-600" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Envoi et suivi des notifications
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      2,456 notifications
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigateToModule('notifications')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Gérer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Accounts Management */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span>Comptes bancaires</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Gestion des comptes bancaires liés
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      89 comptes connectés
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigateToModule('bank-accounts')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Gérer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
