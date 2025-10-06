import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Target, MessageCircle, ArrowRight,
    DollarSign,
    PiggyBank,
    Trophy,
    BarChart3,
    CreditCard, TrendingUp, Wallet, BookOpen, Award, Clock, CheckCircle, Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useChallenges, useUserChallenges, useCurrentChallengeQuery } from "@/lib/apiComponent/hooks/useChallenges";
import { Challenge } from "@/lib/apiComponent/types";
import { useTransactions } from "@/lib/apiComponent/hooks/useFinancial";
import { usePosts } from "@/lib/apiComponent/hooks/useSocial";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Import du type Challenge de l'API

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user: userFromStore } = useAuthStore();
  const { user: userFromAuth } = useAuth();
  const user = userFromAuth || userFromStore;

  // Hooks pour récupérer les données
  const { challenges, isLoading: challengesLoading } = useChallenges();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { posts, isLoading: postsLoading } = usePosts();
  // Utiliser React Query pour synchroniser le currentChallenge entre les pages
  const { 
    data: currentChallenge,
    isLoading: currentChallengeLoading,
    error: currentChallengeError
  } = useCurrentChallengeQuery(user?.id || '');
  
  // Typer currentChallenge correctement
  const typedCurrentChallenge = currentChallenge as Challenge | null;
  
  const { 
    challengeHistory,
    challengeStats,
    isLoading: userChallengesLoading,
    getChallengeHistory,
    getUserChallengeStats
  } = useUserChallenges(user?.id || '');

  // Charger les données du challenge actuel
  useEffect(() => {
    if (user?.id) {
      getChallengeHistory();
      getUserChallengeStats();
    }
  }, [user?.id, getChallengeHistory, getUserChallengeStats]);

  // Calculer les statistiques
  const totalSavings = transactions?.reduce((sum, transaction) => 
    transaction.type === 'INCOME' ? sum + transaction.amount : sum, 0) || 0;
  
  const totalExpenses = transactions?.reduce((sum, transaction) => 
    transaction.type === 'EXPENSE' ? sum + transaction.amount : sum, 0) || 0;
  
  // Utiliser le typedCurrentChallenge de l'API au lieu de filtrer
  const activeChallenges = useMemo(() => 
    typedCurrentChallenge ? [typedCurrentChallenge] : [], 
    [typedCurrentChallenge]
  );
  
  // Calculer la progression du challenge actuel
  const challengeProgress = typedCurrentChallenge?.currentAmount && typedCurrentChallenge?.targetAmount
    ? (typedCurrentChallenge.currentAmount / typedCurrentChallenge.targetAmount) * 100 
    : 0;

  // Debug: Afficher les données du challenge actuel
  useEffect(() => {
    console.log('UserDashboard - typedCurrentChallenge:', typedCurrentChallenge);
    console.log('UserDashboard - currentChallengeLoading:', currentChallengeLoading);
    console.log('UserDashboard - currentChallengeError:', currentChallengeError);
    console.log('UserDashboard - user:', user);
    console.log('UserDashboard - userChallengesLoading:', userChallengesLoading);
    console.log('UserDashboard - activeChallenges:', activeChallenges);
    console.log('UserDashboard - challengeProgress:', challengeProgress);
  }, [typedCurrentChallenge, currentChallengeLoading, currentChallengeError, user, userChallengesLoading, activeChallenges, challengeProgress]);

  // Calculer les jours restants pour le challenge
  const daysRemaining = typedCurrentChallenge ? 
    Math.ceil((new Date(typedCurrentChallenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;

  const quickActions = [
    {
      title: "Ressources",
      description: "Guides et conseils d'épargne",
      icon: BookOpen,
      color: "bg-blue-500",
      href: "/user-dashboard/resources"
    },
    {
      title: "Challenges",
      description: "Rejoignez des défis d'épargne",
      icon: Target,
      color: "bg-green-500",
      href: "/user-dashboard/challenges"
    },
    {
      title: "Flux financier",
      description: "Gérez vos transactions",
      icon: TrendingUp,
      color: "bg-purple-500",
      href: "/user-dashboard/transactions"
    },
    {
      title: "Ouverture de compte",
      description: "Connectez votre banque",
      icon: CreditCard,
      color: "bg-orange-500",
      href: "/user-dashboard/bank-account"
    }
  ];

  const additionalFeatures = [
    {
      title: "Feed Social",
      description: "Partagez vos progrès",
      icon: MessageCircle,
      color: "bg-indigo-500",
      href: "/user-dashboard/feed"
    },
    {
      title: "Progression collective",
      description: "Voir les statistiques globales",
      icon: BarChart3,
      color: "bg-teal-500",
      href: "/user-dashboard/collective-progress"
    },
    {
      title: "Mon Challenge",
      description: "Gérer mon challenge actuel",
      icon: Wallet,
      color: "bg-rose-500",
      href: "/user-dashboard/my-challenge"
    },
    {
      title: "Défis communautaires",
      description: "Participer aux défis",
      icon: Trophy,
      color: "bg-amber-500",
      href: "/user-dashboard/defis"
    }
  ];

  const stats = [
    { 
      label: "Épargne totale", 
      value: `${totalSavings.toLocaleString()}€`, 
      change: totalSavings > 0 ? "+12%" : "0€", 
      positive: totalSavings > 0,
      icon: PiggyBank
    },
    { 
      label: "Challenges actifs", 
      value: activeChallenges.length.toString(), 
      change: activeChallenges.length > 0 ? "En cours" : "Aucun", 
      positive: activeChallenges.length > 0,
      icon: Target
    },
    { 
      label: "Posts partagés", 
      value: posts?.length?.toString() || "0", 
      change: posts?.length > 0 ? "+3" : "0", 
      positive: (posts?.length || 0) > 0,
      icon: MessageCircle
    },
    { 
      label: "Transactions", 
      value: transactions?.length?.toString() || "0", 
      change: transactions?.length > 0 ? "Ce mois" : "0", 
      positive: (transactions?.length || 0) > 0,
      icon: DollarSign
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bonjour {user?.name} ! 👋</h1>
          <p className="text-muted-foreground">Bienvenue sur votre tableau de bord personnel</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Utilisateur
          </Badge>
          {user?.isAdmin && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin-dashboard')}
              className="text-sm"
            >
              Mode Admin
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Challenge en cours */}
      {typedCurrentChallenge ? (
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{typedCurrentChallenge.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {daysRemaining > 0 ? `${daysRemaining} jours restants` : 'Challenge terminé'}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Actif
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progression */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span className="font-medium">
                  {typedCurrentChallenge.currentAmount?.toLocaleString() || 0}€ / {typedCurrentChallenge.targetAmount.toLocaleString()}€
                </span>
              </div>
              <Progress value={challengeProgress} className="h-2" />
              <div className="text-right text-sm text-muted-foreground">
                {challengeProgress.toFixed(1)}% complété
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/user-dashboard/my-challenge')}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <PiggyBank className="w-4 h-4 mr-2" />
                Aller à ma caisse
              </Button>
              <Button 
                onClick={() => navigate(`/user-dashboard/collective-progress?challengeId=${typedCurrentChallenge.id}`)}
                variant="outline"
                className="flex-1"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Voir la progression collective
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Target className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun challenge actif</h3>
            <p className="text-muted-foreground text-center mb-4">
              Rejoignez un challenge d'épargne pour commencer votre parcours !
            </p>
            <Button onClick={() => navigate('/user-dashboard/challenges')}>
              <Plus className="w-4 h-4 mr-2" />
              Voir les challenges disponibles
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(action.href)}
                >
                  Accéder
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Fonctionnalités supplémentaires */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Fonctionnalités</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {additionalFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-2`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(feature.href)}
                >
                  Accéder
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Activité récente et notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Transactions récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions && transactions.length > 0 ? (
                transactions.slice(0, 3).map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'INCOME' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description || 'Transaction'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className={`font-medium ${
                      transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}{transaction.amount.toLocaleString()}€
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune transaction récente</p>
                </div>
              )}
            </div>
            {transactions && transactions.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => navigate('/user-dashboard/transactions')}
              >
                Voir toutes les transactions
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Posts récents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Activité sociale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {posts && posts.length > 0 ? (
                posts.slice(0, 3).map((post, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-1">{post.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {post.type}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun post récent</p>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-3"
              onClick={() => navigate('/user-dashboard/feed')}
            >
              Voir le feed social
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques avancées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Solde net</p>
                <p className="text-2xl font-bold text-green-600">
                  {(totalSavings - totalExpenses).toLocaleString()}€
                </p>
              </div>
              <PiggyBank className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux d'épargne</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalSavings > 0 ? ((totalSavings / (totalSavings + totalExpenses)) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Challenges terminés</p>
                <p className="text-2xl font-bold text-purple-600">
                  {challenges?.filter(c => c.status === 'completed').length || 0}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
