import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Target,
  MessageCircle,
  ArrowRight,
  DollarSign,
  PiggyBank, BarChart3,
  CreditCard,
  TrendingUp,
  Wallet,
  BookOpen, Zap,
  Star,
  TrendingDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import {
  useUserChallenges,
  useCurrentChallengeQuery,
} from "@/lib/apiComponent/hooks/useChallenges";
import { api } from "@/lib/apiComponent/apiClient";
import { challengeEndpoints } from "@/lib/apiComponent/endpoints";
import { Challenge } from "@/lib/apiComponent/types";
import {
  useTransactions,
  useFluxFinancier,
} from "@/lib/apiComponent/hooks/useFinancial";
import { usePosts } from "@/lib/apiComponent/hooks/useSocial";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { RewardManager } from "@/components/gamification/RewardManager";
import { DashboardInfoCard } from "@/components/dashboard/DashboardInfoCard";

// Type étendu pour le challenge disponible avec propriétés supplémentaires de l'API
interface AvailableChallenge extends Challenge {
  isUpcoming?: boolean;
  isJoined?: boolean;
  hasAbandoned?: boolean;
  collectiveTarget?: number;
  collectiveCurrentAmount?: number;
  collectiveProgress?: number;
  _count?: {
    participants?: number;
    transactions?: number;
  };
  createdByUser?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    pictureProfilUrl?: string | null;
  };
  userParticipation?: unknown;
}

// Type pour la réponse imbriquée de l'API firstActiveChallenge
interface NestedChallengeResponse {
  success?: boolean;
  message?: string;
  data?: AvailableChallenge;
}

// Type pour la réponse de l'API firstActiveChallenge
interface FirstActiveChallengeResponse {
  success?: boolean;
  data?: NestedChallengeResponse | AvailableChallenge;
  message?: string[];
  errors?: string[];
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user: userFromStore } = useAuthStore();
  const { user: userFromAuth } = useAuth();
  const user = userFromAuth || userFromStore;

  // Hooks pour récupérer les données
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { posts, isLoading: postsLoading } = usePosts();
  const { fluxBalance, fluxSummary, getFluxBalance, getFluxSummary } =
    useFluxFinancier();

  const {
    data: currentChallenge,
    isLoading: currentChallengeLoading,
    error: currentChallengeError,
  } = useCurrentChallengeQuery(user?.id || "");

  const typedCurrentChallenge = currentChallenge as Challenge | null;

  // État pour le challenge disponible
  const [availableChallenge, setAvailableChallenge] = useState<AvailableChallenge | null>(null);
  const [firstActiveChallengeLoading, setFirstActiveChallengeLoading] = useState(false);

  // Récupérer le premier challenge actif disponible une seule fois au montage si l'utilisateur n'a pas de challenge actif
  useEffect(() => {
    // Ne récupérer que si l'utilisateur n'a pas de challenge actif
    if (!typedCurrentChallenge && !availableChallenge && !firstActiveChallengeLoading) {
      setFirstActiveChallengeLoading(true);
      api.get<FirstActiveChallengeResponse>(challengeEndpoints.firstActive, { isPublicRoute: true })
        .then((response) => {
          // L'API client déroule déjà la première couche, donc response contient déjà les données déroulées
          // Structure après déroulement: { success: true, message: "...", data: challenge }
          let challengeData: AvailableChallenge | null = null;
          
          // Vérifier si response a une structure avec success
          if (response && typeof response === 'object' && 'success' in response && response.success && 'data' in response) {
            const innerData = response.data;
            // Si data est un objet imbriqué avec une propriété data (NestedChallengeResponse)
            if (innerData && typeof innerData === 'object' && 'data' in innerData) {
              const nestedResponse = innerData as NestedChallengeResponse;
              if (nestedResponse.data && typeof nestedResponse.data === 'object' && 'id' in nestedResponse.data) {
                challengeData = nestedResponse.data as AvailableChallenge;
              }
            }
            // Sinon, si data est directement le challenge
            else if (innerData && typeof innerData === 'object' && 'id' in innerData) {
              challengeData = innerData as AvailableChallenge;
            }
          }
          // Sinon, vérifier si response est directement le challenge
          else if (response && typeof response === 'object' && 'id' in response) {
            challengeData = response as AvailableChallenge;
          }
          
          if (challengeData && !typedCurrentChallenge) {
            setAvailableChallenge(challengeData);
          }
        })
        .catch(() => {
          setAvailableChallenge(null);
        })
        .finally(() => {
          setFirstActiveChallengeLoading(false);
        });
    }
    
    // Réinitialiser si l'utilisateur obtient un challenge actif
    if (typedCurrentChallenge && availableChallenge) {
      setAvailableChallenge(null);
    }
  }, [typedCurrentChallenge]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    challengeHistory,
    challengeStats,
    isLoading: userChallengesLoading,
    getChallengeHistory,
    getUserChallengeStats,
  } = useUserChallenges(user?.id || "");

  useEffect(() => {
    if (user?.id) {
      getChallengeHistory();
      getUserChallengeStats();
      getFluxBalance().catch(() => {});
      getFluxSummary().catch(() => {});
    }
  }, [
    user?.id,
    getChallengeHistory,
    getUserChallengeStats,
    getFluxBalance,
    getFluxSummary,
  ]);

  // Calculer les statistiques
  const totalSavings =
    transactions?.reduce(
      (sum, transaction) =>
        transaction.type === "INCOME" ? sum + transaction.amount : sum,
      0
    ) || 0;

  const totalExpenses =
    transactions?.reduce(
      (sum, transaction) =>
        transaction.type === "EXPENSE" ? sum + transaction.amount : sum,
      0
    ) || 0;

  const activeChallenges = useMemo(
    () => (typedCurrentChallenge ? [typedCurrentChallenge] : []),
    [typedCurrentChallenge]
  );

  const challengeProgress =
    typedCurrentChallenge?.currentAmount && typedCurrentChallenge?.targetAmount
      ? (typedCurrentChallenge.currentAmount /
          typedCurrentChallenge.targetAmount) *
        100
      : 0;

  const daysRemaining = typedCurrentChallenge
    ? Math.ceil(
        (new Date(typedCurrentChallenge.endDate).getTime() -
          new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const quickActions = [
    {
      title: "Ressources",
      description: "Guides et conseils d'épargne",
      icon: BookOpen,
      gradient: "from-blue-500 to-blue-600",
      href: "/user-dashboard/resources",
    },
    {
      title: "Compte bancaire",
      description: "Gérer/Connecter votre banque",
      icon: CreditCard,
      gradient: "from-orange-500 to-orange-600",
      href: "/user-dashboard/bank-account",
    },
    {
      title: "Challenges",
      description: "Rejoignez des défis d'épargne",
      icon: Target,
      gradient: "from-green-500 to-green-600",
      href: "/user-dashboard/challenges",
    },
    {
      title: "Feed",
      description: "Fil d'actualité",
      icon: MessageCircle,
      gradient: "from-purple-500 to-purple-600",
      href: "/user-dashboard/feed",
    },
  ];

  const stats = [
    {
      label: "Épargne totale",
      value: `${totalSavings.toLocaleString()}€`,
      change: totalSavings > 0 ? "+12%" : "0€",
      positive: totalSavings > 0,
      icon: DollarSign,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Challenges actifs",
      value: activeChallenges.length.toString(),
      change: activeChallenges.length > 0 ? "En cours" : "Aucun",
      positive: activeChallenges.length > 0,
      icon: Target,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Posts partagés",
      value: posts?.length?.toString() || "0",
      change: posts?.length > 0 ? "+3 ce mois" : "0",
      positive: (posts?.length || 0) > 0,
      icon: MessageCircle,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Transactions",
      value: transactions?.length?.toString() || "0",
      change: transactions?.length > 0 ? "Ce mois" : "0",
      positive: (transactions?.length || 0) > 0,
      icon: Zap,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  const isLoading = transactionsLoading || postsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 -m-6 p-6">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Header avec background décoratif */}
        <motion.div variants={fadeInUp} className="relative overflow-hidden">
          <Card className="border-0 shadow-xl">
            {/* Backgrounds décoratifs */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-5"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-32 translate-x-32"></div>

            <CardContent className="relative p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Bonjour {user?.name || user?.firstName} ! 👋
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    Bienvenue sur votre tableau de bord personnel
                  </p>

                  <div className="flex items-center gap-3 mt-4">
                    {user?.isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2">
                        <Star className="w-4 h-4 mr-1" />
                        Premium
                      </Badge>
                    )}
                    {user?.isAdmin && (
                      <Button
                        variant="outline"
                        onClick={() => navigate("/admin-dashboard")}
                        className="border-2"
                      >
                        Mode Admin
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Card d'information réutilisable */}
                <div className="w-full lg:w-auto lg:min-w-[320px]">
                  {typedCurrentChallenge ? (
                    <DashboardInfoCard
                      type="currentChallenge"
                      currentChallenge={typedCurrentChallenge}
                      daysRemaining={daysRemaining}
                    />
                  ) : (
                    <DashboardInfoCard
                      type="availableChallenge"
                      availableChallenge={availableChallenge}
                      isLoading={firstActiveChallengeLoading}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid avec gradients colorés */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`border-0 shadow-lg bg-gradient-to-br ${stat.gradient} text-white hover:shadow-xl transition-shadow duration-300`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white/80 text-sm font-medium">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className="w-10 h-10 text-white/70" />
                  </div>
                  <div className="flex items-center text-sm text-white/90">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.change}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>


        {/* Widget Flux Financier (compact) */}
        {fluxBalance && (
          <motion.div variants={fadeInUp}>
            <Card className="border shadow-lg bg-white overflow-hidden">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Mes finances
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Vue rapide
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/user-dashboard/flux")}
                  >
                    Voir tout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <div className="md:col-span-4 rounded-lg p-4 text-center bg-gray-50">
                    <p className="text-sm text-muted-foreground mb-2">
                      Solde disponible
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        fluxBalance.soldeFlux >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {fluxBalance.soldeFlux.toLocaleString()} FCFA
                    </p>
                  </div>

                  <div className="rounded-lg p-4 text-center bg-gray-50">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-green-100 rounded">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Entrées
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {fluxBalance.totalEntrees.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg p-4 text-center bg-gray-50">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-orange-100 rounded">
                        <TrendingDown className="h-4 w-4 text-orange-600" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Sorties
                    </p>
                    <p className="text-lg font-semibold text-orange-600">
                      {fluxBalance.totalSorties.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg p-4 text-center bg-gray-50">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-blue-100 rounded">
                        <PiggyBank className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Épargnes
                    </p>
                    <p className="text-lg font-semibold text-blue-600">
                      {fluxBalance.totalEpargne.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg p-4 text-center bg-gray-50">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-purple-100 rounded">
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Transactions
                    </p>
                    <p className="text-lg font-semibold text-purple-600">
                      {fluxSummary?.recentTransactions?.length || 0}
                    </p>
                  </div>
                </div>

                {fluxSummary?.recentTransactions &&
                  fluxSummary.recentTransactions.length > 0 && (
                    <div>
                      {/* <h4 className="font-semibold mb-2 text-xs">Dernières transactions</h4>
                    <div className="space-y-1.5">
                      {fluxSummary.recentTransactions.slice(0, 2).map((transaction) => (
                        <div 
                          key={transaction.id}
                          className="flex items-center justify-between rounded-lg p-2.5 bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded ${
                              transaction.type === 'INCOME' 
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {transaction.type === 'INCOME' ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-medium leading-tight line-clamp-1">{transaction.description || transaction.category}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {formatDistanceToNow(new Date(transaction.date), {
                                  addSuffix: true,
                                  locale: fr
                                })}
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs font-bold ${
                            transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'INCOME' ? '+' : '-'}{transaction.amount.toLocaleString()} FCFA
                          </span>
                        </div>
                      ))}
                    </div> */}
                    </div>
                  )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions avec design amélioré */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
                onClick={() => navigate(action.href)}
              >
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                  <div
                    className={`h-2 bg-gradient-to-r ${action.gradient}`}
                  ></div>
                  <CardHeader className="pb-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-md`}
                    >
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center text-sm text-primary font-medium">
                      Accéder
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activité récente avec design amélioré */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Transactions récentes */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                Transactions récentes
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Dernières transactions financières (flux général)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fluxSummary?.recentTransactions && fluxSummary.recentTransactions.length > 0 ? (
                  fluxSummary.recentTransactions.slice(0, 3).map((transaction, index) => (
                    <div
                      key={transaction.id || index}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "INCOME"
                              ? "bg-gradient-to-br from-green-400 to-green-600"
                              : "bg-gradient-to-br from-red-400 to-red-600"
                          }`}
                        >
                          {transaction.type === "INCOME" ? (
                            <TrendingUp className="w-5 h-5 text-white" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.description || transaction.category || "Transaction"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.date), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-bold ${
                          transaction.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {transaction.amount.toLocaleString()} FCFA
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm">Aucune transaction récente</p>
                    <p className="text-xs mt-2 text-muted-foreground">
                      Les transactions de votre flux financier apparaîtront ici
                    </p>
                  </div>
                )}
              </div>
              {(fluxSummary?.recentTransactions && fluxSummary.recentTransactions.length > 0) && (
                <Button
                  variant="outline"
                  className="w-full mt-4 border-2"
                  onClick={() => navigate("/user-dashboard/transactions")}
                >
                  Voir toutes les transactions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Posts récents */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                Activité sociale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {posts && posts.length > 0 ? (
                  posts.slice(0, 3).map((post, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">
                          {post.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs flex-shrink-0"
                      >
                        {post.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-sm">Aucun post récent</p>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 border-2"
                onClick={() => navigate("/user-dashboard/feed")}
              >
                Voir le feed social
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistiques avancées avec gradients */}
        {/* <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Solde net</p>
                  <p className="text-4xl font-bold mt-2">
                    {(totalSavings - totalExpenses).toLocaleString()}€
                  </p>
                </div>
                <PiggyBank className="w-12 h-12 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Taux d'épargne</p>
                  <p className="text-4xl font-bold mt-2">
                    {totalSavings > 0 ? ((totalSavings / (totalSavings + totalExpenses)) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <BarChart3 className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Challenges terminés</p>
                  <p className="text-4xl font-bold mt-2">
                    {challenges?.filter(c => c.status === 'completed').length || 0}
                  </p>
                </div>
                <Award className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div> */}
      </motion.div>

      {/* Reward Manager - Vérifie automatiquement les récompenses au chargement */}
      <RewardManager
        autoCheck={true}
        onRewardsChecked={(rewards) => {
          console.log("Récompenses vérifiées:", rewards);
        }}
      />
    </div>
  );
}
