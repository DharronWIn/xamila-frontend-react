import { motion } from "framer-motion";
import {
  TrendingUp,
  Target,
  Wallet,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Calendar,
  PiggyBank,
  ChevronRight,
  MessageCircle,
  Trophy,
  Heart,
  FileText, Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useTransactions } from "@/lib/apiComponent/hooks/useFinancial";
import { usePosts } from "@/lib/apiComponent/hooks/useSocial";
import { useChallenges } from "@/lib/apiComponent/hooks/useChallenges";
import { useUserChallenges } from "@/lib/apiComponent/hooks/useChallenges";
import { useState, useEffect } from "react";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
import { ChallengeCard } from "@/components/social/ChallengeCard";
import { DebugInfo } from "@/components/DebugInfo";

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

const Dashboard = () => {
  const { user } = useAuth();
  
  // API hooks
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { posts, isLoading: postsLoading } = usePosts();
  const { challenges, isLoading: challengesLoading } = useChallenges();
  const { 
    currentChallenge,
    challengeHistory,
    challengeStats,
    isLoading: userChallengesLoading,
    getCurrentChallenge,
    getChallengeHistory,
    getUserChallengeStats
  } = useUserChallenges(user?.id || '');
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    console.log('Dashboard: Loading data...', { 
      user, 
      posts: posts?.length || 0, 
      challenges: challenges?.length || 0, 
      transactions: transactions?.length || 0,
      currentChallenge,
      isAuthenticated: !!user
    });
    
    // Load user challenge data
    if (user?.id) {
      getCurrentChallenge();
      getChallengeHistory();
      getUserChallengeStats();
    }
  }, [user?.id, user, getCurrentChallenge, getChallengeHistory, getUserChallengeStats, challenges?.length, currentChallenge, posts?.length, transactions?.length]);

  const isPremium = user?.isPremium || user?.isAdmin || false;

  // Use currentChallenge from API hook
  const isLoading = transactionsLoading || postsLoading || challengesLoading || userChallengesLoading;
  
  // Debug logs
  console.log('Dashboard: Current state', { 
    currentChallenge,
    challengeHistory,
    challengeStats,
    posts: posts?.length || 0,
    challenges: challenges?.length || 0,
    transactions: transactions?.length || 0,
    user: user?.id 
  });


  // Calculate time remaining for current challenge
  const getTimeRemaining = () => {
    if (!currentChallenge) return '';
    const now = new Date();
    const startDate = new Date(currentChallenge.startDate || '');
    const endDate = new Date(currentChallenge.endDate || '');
    
    if (currentChallenge.status === 'upcoming') {
      const diffTime = startDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        return `Commence dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      } else {
        return 'Commence bientôt';
      }
    } else {
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        return `${diffDays} jour${diffDays > 1 ? 's' : ''} restant${diffDays > 1 ? 's' : ''}`;
      } else {
        return 'Challenge terminé';
      }
    }
  };

  // Calculate stats
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlyTransactions = (transactions || []).filter(t => t.date.startsWith(currentMonth));
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    {
      title: "Objectif d'épargne",
      value: currentChallenge ? `${currentChallenge.currentAmount || 0}€` : "0€",
      change: currentChallenge ? `${currentChallenge.targetAmount || 0}€ objectif` : "Pas d'objectif",
      trend: currentChallenge ? ((currentChallenge.currentAmount || 0) / (currentChallenge.targetAmount || 1)) * 100 : 0,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      isPremium: true
    },
    {
      title: "Revenus ce mois",
      value: `${monthlyIncome.toLocaleString()}€`,
      change: (transactions?.length || 0) > 0 ? "+12%" : "Pas de données",
      trend: 12,
      icon: ArrowUpRight,
      color: "text-green-600",
      bgColor: "bg-green-50",
      isPremium: true
    },
    {
      title: "Dépenses ce mois",
      value: `${monthlyExpenses.toLocaleString()}€`,
      change: transactions.length > 0 ? "-8%" : "Pas de données",
      trend: -8,
      icon: ArrowDownRight,
      color: "text-red-600",
      bgColor: "bg-red-50",
      isPremium: true
    },
    {
      title: "Solde net",
      value: `${(monthlyIncome - monthlyExpenses).toLocaleString()}€`,
      change: monthlyIncome > monthlyExpenses ? "Positif" : "Négatif",
      trend: monthlyIncome - monthlyExpenses,
      icon: Wallet,
      color: monthlyIncome > monthlyExpenses ? "text-green-600" : "text-red-600",
      bgColor: monthlyIncome > monthlyExpenses ? "bg-green-50" : "bg-red-50",
      isPremium: false
    }
  ];

  const handlePremiumFeatureClick = () => {
    // Les admins ont accès à tout, même aux fonctionnalités premium
    if (!isPremium && !user?.isAdmin) {
      setShowUpgradeModal(true);
    }
  };

  return (
    <div className="p-6">
      {/* Debug Info */}
      {/* <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <h3 className="font-bold">Dashboard Debug Info:</h3>
        <p>User: {user ? user.name : 'None'}</p>
        <p>Authenticated: {user ? 'Yes' : 'No'}</p>
        <p>Goal: {goal ? 'Set' : 'Not set'}</p>
        <p>Posts: {posts?.length || 0}</p>
        <p>Challenges: {challenges?.length || 0}</p>
        <p>Transactions: {transactions?.length || 0}</p>
        <p>Premium: {user?.isPremium ? 'Yes' : 'No'}</p>
      </div> */}

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {user?.name?.split(' ')[0] || 'Utilisateur'} !
          </h1>
          <p className="text-gray-600 mt-1">
            Bienvenue dans votre espace Challenge d'Épargne
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Badge variant={isPremium ? "default" : "secondary"} className="px-3 py-1">
            {isPremium ? (
              <>
                <Crown className="w-4 h-4 mr-1" />
                Premium
              </>
            ) : 'Version Gratuite'}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Calendar className="w-4 h-4 mr-1" />
            {user?.challengeStartMonth || 'Non défini'}
          </Badge>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={stat.title} 
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
              stat.isPremium && !isPremium ? 'opacity-75 cursor-pointer' : ''
            }`}
            onClick={stat.isPremium ? handlePremiumFeatureClick : undefined}
          >
            {stat.isPremium && !isPremium && (
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <Badge className="bg-primary text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-sm ${
                  stat.trend > 0 ? 'text-green-600' : stat.trend < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions Section */}
      <motion.div variants={fadeInUp} className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-primary" />
              <span>Actions Rapides</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mes Défis */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Mes Défis</h3>
                    <p className="text-sm text-gray-600">Rejoignez des défis d'épargne</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/user-dashboard/challenges'}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Accéder
                </Button>
              </div>

              {/* Feed Social */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Feed Social</h3>
                    <p className="text-sm text-gray-600">Partagez vos progrès</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/user-dashboard/feed'}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Accéder
                </Button>
              </div>

              {/* Transactions */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Transactions</h3>
                    <p className="text-sm text-gray-600">Gérez vos finances</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/user-dashboard/transactions'}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Accéder
                </Button>
              </div>

              {/* Objectifs */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Objectifs</h3>
                    <p className="text-sm text-gray-600">Définissez vos objectifs</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/user-dashboard/savings'}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Accéder
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Challenge d'épargne Section */}
      {currentChallenge ? (
        <motion.div variants={fadeInUp} className="mb-8">
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  <span>Mon Challenge d'Épargne</span>
                </CardTitle>
                <Button 
                  onClick={() => window.location.href = '/user-dashboard/my-challenge'}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {currentChallenge.status === 'upcoming' ? 'Voir mon challenge' : 'Gérer mon challenge'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentChallenge.title || 'Challenge d\'épargne'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentChallenge.description || 'Défi d\'épargne personnel'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={`mb-1 ${
                      currentChallenge.status === 'upcoming' 
                        ? 'text-blue-600 border-blue-200' 
                        : 'text-green-600 border-green-200'
                    }`}>
                      {currentChallenge.status === 'upcoming' ? 'À venir' : 'En cours'}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {getTimeRemaining()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression vers l'objectif</span>
                    <span>{((currentChallenge as any).progressPercentage || 0).toFixed(1)}%</span>
                  </div>
                  <Progress value={(currentChallenge as any).progressPercentage || 0} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      {currentChallenge.status === 'upcoming' 
                        ? '0€ épargné (pas encore commencé)' 
                        : `${currentChallenge.currentAmount.toLocaleString()}€ épargné`
                      }
                    </span>
                    <span>Objectif: {currentChallenge.targetAmount.toLocaleString()}€</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      currentChallenge.status === 'upcoming' ? 'text-gray-400' : 'text-primary'
                    }`}>
                      {currentChallenge.status === 'upcoming' ? '0€' : `${currentChallenge.currentAmount.toLocaleString()}€`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {currentChallenge.status === 'upcoming' ? 'Pas encore commencé' : 'Épargné'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {currentChallenge.targetAmount.toLocaleString()}€
                    </div>
                    <div className="text-xs text-gray-500">Objectif total</div>
                  </div>
                </div>

                {/* Challenge Quick Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = '/user-dashboard/my-challenge'}
                      className="flex items-center space-x-2"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Gérer mon challenge</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = '/user-dashboard/challenges'}
                      className="flex items-center space-x-2"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Voir tous les challenges</span>
                    </Button>
                    {currentChallenge.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = '/user-dashboard/transactions'}
                        className="flex items-center space-x-2"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>Faire un versement</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp} className="mb-8">
          <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-primary/60 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Aucun challenge actif
              </h3>
              <p className="text-gray-600 mb-6">
                Rejoignez un challenge d'épargne pour commencer votre parcours d'épargne motivant !
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => window.location.href = '/user-dashboard/challenges'}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Voir les challenges disponibles
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/user-dashboard/resources'}
                  className="border-primary/30 text-primary hover:bg-primary/5"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Consulter les ressources
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

              {/* Social Activity Section */}
              <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Trophy className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Défis actifs</p>
                        <p className="text-xl font-bold">{(challenges || []).filter(c => (c as any).isActive).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Posts récents</p>
                        <p className="text-xl font-bold">
                          {(posts || []).filter(p => 
                            new Date(p.createdAt).toDateString() === new Date().toDateString()
                          ).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Savings Progress */}
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <Card className={`h-full ${!isPremium ? 'relative overflow-hidden cursor-pointer' : ''}`}
                onClick={!isPremium ? handlePremiumFeatureClick : undefined}>
            {!isPremium && (
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="text-center">
                  <Badge className="bg-primary text-white mb-2">
                    <Crown className="w-4 h-4 mr-1" />
                    Fonctionnalité Premium
                  </Badge>
                  <p className="text-sm text-gray-600">Débloquez le suivi détaillé de votre épargne</p>
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PiggyBank className="w-5 h-5 text-primary" />
                <span>Progression du Challenge</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentChallenge ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progression actuelle</span>
                      <span className="font-medium">
                        {currentChallenge.currentAmount || 0}€ / {currentChallenge.targetAmount || 0}€
                      </span>
                    </div>
                    <Progress value={((currentChallenge.currentAmount || 0) / (currentChallenge.targetAmount || 1)) * 100} className="h-3" />
                    <div className="text-center">
                      <span className="text-2xl font-bold text-primary">
                        {Math.round(((currentChallenge.currentAmount || 0) / (currentChallenge.targetAmount || 1)) * 100)}%
                      </span>
                      <p className="text-sm text-gray-600">de l'objectif atteint</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{currentChallenge.currentAmount || 0}€</p>
                      <p className="text-xs text-gray-600">Épargné</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {(currentChallenge.targetAmount || 0) - (currentChallenge.currentAmount || 0)}€
                      </p>
                      <p className="text-xs text-gray-600">Restant</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">6</p>
                      <p className="text-xs text-gray-600">Mois</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Aucun objectif défini</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Commencez votre challenge d'épargne en définissant un objectif
                  </p>
                  <Button size="sm">
                    Définir un objectif
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeInUp} className="space-y-6">
          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <span>Activité récente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(posts || []).slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {(post as any).userName || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{post.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(posts || []).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucune activité récente
                </p>
              )}
              <Button variant="outline" className="w-full text-sm">
                Voir toutes les actualités
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Active Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span>Défis actifs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(challenges || []).filter(c => (c as any).isActive).slice(0, 2).map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge as any} showJoinButton={false} />
              ))}
              {(challenges || []).filter(c => (c as any).isActive).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucun défi actif
                </p>
              )}
              <Button variant="outline" className="w-full text-sm">
                Voir tous les défis
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Challenge Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statut du Challenge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mois de départ</span>
                <Badge variant="outline">{user?.challengeStartMonth}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Durée</span>
                <span className="font-medium">6 mois</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Statut</span>
                <Badge className="bg-green-100 text-green-800">En cours</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={!isPremium ? handlePremiumFeatureClick : undefined}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Ajouter une transaction
                {!isPremium && <Crown className="w-3 h-3 ml-auto text-primary" />}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={!isPremium ? handlePremiumFeatureClick : undefined}
              >
                <Target className="w-4 h-4 mr-2" />
                Enregistrer épargne
                {!isPremium && <Crown className="w-3 h-3 ml-auto text-primary" />}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Voir le classement
              </Button>
            </CardContent>
          </Card>

          {/* Upgrade Card */}
          {!isPremium && (
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Crown className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Passer Premium</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Débloquez toutes les fonctionnalités avancées
                </p>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  Découvrir Premium
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
      
      <DebugInfo />
      </motion.div>
    </div>
  );
};

export default Dashboard;