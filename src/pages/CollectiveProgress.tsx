import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  TrendingUp,
  Users,
  Target,
  Medal,
  Crown,
  RefreshCw,
  DollarSign,
  BarChart3,
  Star,
  Award,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { usePremiumProtection } from "@/hooks/usePremiumProtection";
import { useCurrentChallengeQuery, useInvalidateCurrentChallenge } from "@/lib/apiComponent/hooks/useChallenges";
import { Challenge } from "@/lib/apiComponent/types";
import {
  useCurrentChallengeProgress,
  useCurrentChallengeLeaderboard,
  useCurrentChallengeMilestones,
  useCurrentChallengeAchievements,
  useCurrentChallengeTimeline
} from "@/lib/apiComponent/hooks/useCurrentChallenge";
import MilestonesCard from "@/components/challenges/MilestonesCard";
import AchievementsCard from "@/components/challenges/AchievementsCard";
import PremiumUpgradeModal from "@/components/premium/PremiumUpgradeModal";

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

const CollectiveProgress = () => {
  const { user } = useAuth();
  
  const {
    isPremium,
    isUpgradeModalOpen,
    handlePremiumFeatureClick,
    closeUpgradeModal
  } = usePremiumProtection();

  // Utiliser React Query pour synchroniser le currentChallenge entre les pages
  const { 
    data: currentChallenge,
    isLoading: isLoadingChallenge,
    error: challengeError
  } = useCurrentChallengeQuery(user?.id || '');
  
  // Typer currentChallenge correctement
  const typedCurrentChallenge = currentChallenge as Challenge | null;
  
  const invalidateCurrentChallenge = useInvalidateCurrentChallenge();
  const { progress, isLoading: isLoadingProgress } = useCurrentChallengeProgress();
  const { leaderboard: currentLeaderboard, isLoading: isLoadingLeaderboard, refetch: refetchLeaderboard } = useCurrentChallengeLeaderboard();
  const { milestones, isLoading: isLoadingMilestones } = useCurrentChallengeMilestones();
  const { achievements, isLoading: isLoadingAchievements } = useCurrentChallengeAchievements();
  const { timeline, isLoading: isLoadingTimeline } = useCurrentChallengeTimeline();

  useEffect(() => {
    // Les données sont maintenant chargées via les hooks API
    // Pas besoin de refetchLeaderboard manuel
  }, [isPremium]);

  // Debug: Afficher les données du challenge actuel
  useEffect(() => {
    console.log('CollectiveProgress - typedCurrentChallenge:', typedCurrentChallenge);
    console.log('CollectiveProgress - isLoadingChallenge:', isLoadingChallenge);
    console.log('CollectiveProgress - challengeError:', challengeError);
    console.log('CollectiveProgress - user:', user);
  }, [typedCurrentChallenge, isLoadingChallenge, challengeError, user]);


  // Utiliser les données du challenge actuel si disponible, sinon fallback sur l'ancien système
  const hasCurrentChallenge = typedCurrentChallenge !== null;
  const isLoadingData = isLoadingChallenge || isLoadingProgress || isLoadingLeaderboard;
  
  // Calculer les stats collectives
  const totalParticipants = hasCurrentChallenge 
    ? (currentLeaderboard?.totalParticipants || 0)
    : 0;
    
  const totalSavedCollective = hasCurrentChallenge 
    ? (progress?.collectiveCurrentAmount || 0)
    : 0;
    
  const totalGoalCollective = hasCurrentChallenge 
    ? (progress?.collectiveTarget || 0)
    : 0;
    
  const averageProgress = hasCurrentChallenge 
    ? (progress?.collectiveProgress || 0)
    : (totalParticipants > 0 ? (totalSavedCollective / totalGoalCollective) * 100 : 0);
    
  const userRank = hasCurrentChallenge 
    ? (currentLeaderboard?.currentUserRank || null)
    : null;

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
          <h1 className="text-3xl font-bold text-gray-900">Progression Collective</h1>
          <p className="text-gray-600 mt-1">
            {hasCurrentChallenge 
              ? `Challenge actuel: ${typedCurrentChallenge?.title}`
              : 'Découvrez les performances de la communauté et comparez votre progression'
            }
          </p>
          {hasCurrentChallenge && (
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {typedCurrentChallenge?.type}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  typedCurrentChallenge?.status === 'active' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : typedCurrentChallenge?.status === 'upcoming'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}
              >
                {typedCurrentChallenge?.status === 'active' ? 'En cours' : 
                 typedCurrentChallenge?.status === 'upcoming' ? 'À venir' : 
                 typedCurrentChallenge?.status}
              </Badge>
              <span className="text-xs text-gray-500">
                {typedCurrentChallenge ? Math.ceil((new Date(typedCurrentChallenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} jours restants
              </span>
            </div>
          )}
          
          {/* Debug Info */}
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
            <strong>Debug:</strong> 
            Challenge: {typedCurrentChallenge ? '✅' : '❌'} | 
            Loading: {isLoadingChallenge ? '⏳' : '✅'} | 
            Error: {challengeError ? '❌' : '✅'} | 
            Premium: {isPremium ? '✅' : '❌'}
          </div>
          
          {/* Debug Details */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                🔍 Détails Debug (Dev Mode)
              </summary>
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
                <div><strong>typedCurrentChallenge:</strong> {JSON.stringify(typedCurrentChallenge, null, 2)}</div>
                <div><strong>progress:</strong> {JSON.stringify(progress, null, 2)}</div>
                <div><strong>currentLeaderboard:</strong> {JSON.stringify(currentLeaderboard, null, 2)}</div>
                <div><strong>hasCurrentChallenge:</strong> {hasCurrentChallenge.toString()}</div>
                <div><strong>isLoadingData:</strong> {isLoadingData.toString()}</div>
              </div>
            </details>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Badge 
            variant={isPremium ? "default" : "secondary"} 
            className={`px-3 py-1 ${isPremium ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' : ''}`}
          >
            {isPremium ? (
              <>
                <Crown className="w-4 h-4 mr-1" />
                Premium
              </>
            ) : 'Fonctionnalité Premium'}
          </Badge>
          <Button
            onClick={() => {
              if (hasCurrentChallenge) {
                refetchLeaderboard();
              } else {
                refetchLeaderboard();
              }
            }}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </Button>
          <Button
            onClick={() => {
              if (user?.id) {
                invalidateCurrentChallenge(user.id);
              }
            }}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Challenge</span>
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      {!isPremium && !hasCurrentChallenge ? (
        <motion.div variants={fadeInUp}>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-12 text-center">
              <Trophy className="w-20 h-20 text-primary mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Progression Collective Premium
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Accédez au classement global de la communauté, aux statistiques collectives 
                et comparez votre progression avec les autres participants.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <Trophy className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Classement global</h3>
                  <p className="text-sm text-gray-600">Votre position parmi tous les participants</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <BarChart3 className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Statistiques collectives</h3>
                  <p className="text-sm text-gray-600">Épargne totale et moyenne de la communauté</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <Award className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Badges et récompenses</h3>
                  <p className="text-sm text-gray-600">Système de récompenses pour vos performances</p>
                </div>
              </div>

              <Button 
                size="lg"
                onClick={handlePremiumFeatureClick}
                className="px-8"
              >
                Découvrir la Progression Collective
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : !hasCurrentChallenge ? (
        <motion.div variants={fadeInUp}>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-12 text-center">
              <Target className="w-20 h-20 text-amber-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Aucun Challenge Actuel
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Vous ne participez actuellement à aucun challenge d'épargne. 
                Rejoignez un challenge pour voir votre progression collective et comparer vos performances avec les autres participants.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <Trophy className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Rejoindre un Challenge</h3>
                  <p className="text-sm text-gray-600">Participez à un défi d'épargne communautaire</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <Users className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Progression Collective</h3>
                  <p className="text-sm text-gray-600">Comparez vos performances avec la communauté</p>
                </div>
              </div>

              <Button 
                size="lg"
                onClick={() => window.location.href = '/challenges'}
                className="px-8 bg-amber-600 hover:bg-amber-700"
              >
                Voir les Challenges Disponibles
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : hasCurrentChallenge && !isPremium ? (
        <motion.div variants={fadeInUp}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Challenge Actuel Détecté !
              </h2>
              <p className="text-gray-600 mb-6">
                Vous participez au challenge "{typedCurrentChallenge?.title}". 
                Passez à Premium pour voir la progression collective complète, le classement et les succès.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalParticipants}
                  </div>
                  <div className="text-sm text-gray-600">Participants</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalSavedCollective.toLocaleString()}€
                  </div>
                  <div className="text-sm text-gray-600">Épargné collectivement</div>
                </div>
              </div>

              <Button 
                size="lg"
                onClick={handlePremiumFeatureClick}
                className="px-8 bg-blue-600 hover:bg-blue-700"
              >
                Voir la Progression Collective Complète
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Collective Stats Overview */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-600 rounded-full">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800">Participants actifs</p>
                    <p className="text-2xl font-bold text-blue-900">{totalParticipants}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-600 rounded-full">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-800">Épargne collective</p>
                    <p className="text-2xl font-bold text-green-900">{totalSavedCollective.toLocaleString()}€</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-600 rounded-full">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-800">Objectif collectif</p>
                    <p className="text-2xl font-bold text-purple-900">{totalGoalCollective.toLocaleString()}€</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-600 rounded-full">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-800">Progression moyenne</p>
                    <p className="text-2xl font-bold text-orange-900">{averageProgress.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Collective Progress */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Progression Collective</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Épargne collective atteinte</span>
                    <span className="font-medium">
                      {totalSavedCollective.toLocaleString()}€ / {totalGoalCollective.toLocaleString()}€
                    </span>
                  </div>
                  <Progress value={averageProgress} className="h-4" />
                  <div className="text-center">
                    <span className="text-3xl font-bold text-primary">
                      {averageProgress.toFixed(1)}%
                    </span>
                    <p className="text-sm text-gray-600">de l'objectif collectif atteint</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Your Position Card */}
            {userRank && (
              <motion.div variants={fadeInUp}>
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Medal className="w-5 h-5 text-yellow-600" />
                      <span>Votre Position</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-600 mb-2">
                        #{userRank}
                      </div>
                      <p className="text-sm text-yellow-800 mb-4">
                        Sur {totalParticipants} participants
                      </p>
                      {userRank <= 3 && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Top 3
                        </Badge>
                      )}
                      {userRank <= 10 && userRank > 3 && (
                        <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Top 10
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Leaderboard */}
            <div className={userRank ? "lg:col-span-2" : "lg:col-span-3"}>
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        <span>Classement Global</span>
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => hasCurrentChallenge ? refetchLeaderboard() : refetchLeaderboard()}
                        disabled={isLoadingData}
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {hasCurrentChallenge ? (
                        currentLeaderboard?.participants?.length > 0 ? (
                          currentLeaderboard.participants.map((participant, index) => (
                          <motion.div
                            key={participant.participantId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center space-x-3 p-4 rounded-lg ${
                              participant.isCurrentUser 
                                ? 'bg-primary/10 border-2 border-primary/30' 
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                              participant.rank <= 3 
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' 
                                : participant.rank <= 10
                                ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {participant.rank}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium truncate">
                                  {participant.isCurrentUser ? 'Vous' : `${participant.user.firstName} ${participant.user.lastName}`}
                                </p>
                                {participant.rank <= 3 && (
                                  <div className="flex items-center">
                                    {participant.rank === 1 && <Trophy className="w-4 h-4 text-yellow-500" />}
                                    {participant.rank === 2 && <Medal className="w-4 h-4 text-gray-400" />}
                                    {participant.rank === 3 && <Medal className="w-4 h-4 text-amber-600" />}
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>{participant.currentAmount.toLocaleString()}€ / {participant.targetAmount.toLocaleString()}€</span>
                                  <span>{participant.progress.toFixed(1)}%</span>
                                </div>
                                <Progress 
                                  value={participant.progress} 
                                  className="h-2"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Aucun participant pour le moment</p>
                          </div>
                        )
                      ) : (
                        (currentLeaderboard?.participants || []).map((participant, index) => (
                        <motion.div
                          key={participant.participantId}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center space-x-3 p-4 rounded-lg ${
                            participant.user.id === user?.id 
                              ? 'bg-primary/10 border-2 border-primary/30' 
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            participant.rank <= 3 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' 
                              : participant.rank <= 10
                              ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {participant.rank}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium truncate">
                                {participant.user.id === user?.id ? 'Vous' : `${participant.user.firstName} ${participant.user.lastName}`}
                              </p>
                              {participant.rank <= 3 && (
                                <div className="flex items-center">
                                  {participant.rank === 1 && <Trophy className="w-4 h-4 text-yellow-500" />}
                                  {participant.rank === 2 && <Medal className="w-4 h-4 text-gray-400" />}
                                  {participant.rank === 3 && <Medal className="w-4 h-4 text-amber-600" />}
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{participant.currentAmount.toLocaleString()}€ / {participant.targetAmount.toLocaleString()}€</span>
                                <span>{participant.progress.toFixed(1)}%</span>
                              </div>
                              <Progress 
                                value={participant.progress} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        </motion.div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Motivation Section */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Ensemble, nous sommes plus forts !
                </h3>
                <p className="text-green-800 mb-4">
                  La communauté a déjà épargné {totalSavedCollective.toLocaleString()}€ 
                  ensemble. Continuez à contribuer à ce succès collectif !
                </p>
                <div className="flex justify-center space-x-4">
                  <Badge className="bg-green-600 text-white">
                    <Users className="w-3 h-3 mr-1" />
                    {totalParticipants} participants
                  </Badge>
                  <Badge className="bg-green-600 text-white">
                    <Target className="w-3 h-3 mr-1" />
                    {averageProgress.toFixed(1)}% en moyenne
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Milestones and Achievements */}
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div variants={fadeInUp}>
              <MilestonesCard 
                milestones={milestones} 
                isLoading={isLoadingMilestones}
              />
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <AchievementsCard 
                achievements={achievements} 
                isLoading={isLoadingAchievements}
              />
            </motion.div>
          </div>
        </>
      )}

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        userEmail={user?.email || ''}
        userId={user?.id || ''}
        title="Débloquez la Progression Collective Premium"
        description="Accédez aux statistiques collectives et au classement communautaire"
      />
    </motion.div>
  );
};

export default CollectiveProgress;
