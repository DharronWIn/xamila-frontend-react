import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { motion } from 'framer-motion';
import {
  Trophy, Search, Target,
  TrendingUp,
  Users, RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChallenges, useUserChallenges, useCurrentChallengeQuery, useInvalidateCurrentChallenge } from '@/lib/apiComponent/hooks/useChallenges';
import { Challenge } from '@/lib/apiComponent/types';
import { useAuth } from '@/lib/apiComponent/hooks/useAuth';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { ChallengeJoinModal } from '@/components/challenges/ChallengeJoinModal';
import { CurrentChallengeCard } from '@/components/challenges/CurrentChallengeCard';
import { SavingsChallenge } from '@/types/challenge';
import { toast } from 'sonner';

// Interface for the API response structure based on the user's example
interface ApiChallengeResponse {
  id: string;
  title: string;
  description: string;
  type: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'CUSTOM';
  targetAmount: number;
  duration: number;
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING' | 'CANCELLED';
  createdBy: string;
  startDate: string;
  endDate: string;
  rewards: string[];
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
  createdByUser: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  participants: Array<{
    id: string;
    userId: string;
    currentAmount: number;
    status: string;
  }>;
  _count: {
    participants: number;
  };
}

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

// Helper function to convert API Challenge to SavingsChallenge
const convertApiChallengeToSavingsChallenge = (apiChallenge: ApiChallengeResponse): SavingsChallenge => {
  return {
    id: apiChallenge.id,
    title: apiChallenge.title,
    description: apiChallenge.description,
    type: apiChallenge.type.toLowerCase() as 'monthly' | 'weekly' | 'daily' | 'custom',
    targetAmount: apiChallenge.targetAmount,
    duration: apiChallenge.duration || 30, // Default duration if not provided
    startDate: apiChallenge.startDate,
    endDate: apiChallenge.endDate,
    isActive: apiChallenge.status === 'ACTIVE',
    createdBy: apiChallenge.createdBy,
    createdByName: apiChallenge.createdByUser?.firstName + ' ' + apiChallenge.createdByUser?.lastName || 'Unknown',
    createdByAvatar: apiChallenge.createdByUser?.avatar,
    rewards: apiChallenge.rewards || [],
    maxParticipants: apiChallenge.maxParticipants,
    participants: apiChallenge._count?.participants || 0,
    participantsList: [], // Convert participants to ChallengeParticipant format if needed
    status: apiChallenge.status.toLowerCase() as 'upcoming' | 'active' | 'completed' | 'cancelled',
    createdAt: apiChallenge.createdAt,
    updatedAt: apiChallenge.updatedAt,
  };
};

export const ChallengesPage = () => {
  const { user } = useAuth();
  
  // API hooks
  const {
    challenges: apiChallenges,
    isLoading: apiIsLoading,
    error: apiError,
    getChallenges,
    getChallengeStats,
    joinChallenge: joinChallengeApi,
  } = useChallenges();
  
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
    challengeStats: userChallengeStats,
    isLoading: userChallengesLoading,
    getChallengeHistory,
    getUserChallengeStats
  } = useUserChallenges(user?.id || '');
  
  const invalidateCurrentChallenge = useInvalidateCurrentChallenge();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedChallenge, setSelectedChallenge] = useState<SavingsChallenge | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isJoiningChallenge, setIsJoiningChallenge] = useState(false);
  
  // Use API challenges as primary source, convert to SavingsChallenge format
  const challenges = (apiChallenges || []).map((challenge: unknown) => convertApiChallengeToSavingsChallenge(challenge as ApiChallengeResponse));
  const challengeStats = null; // Will be loaded from API
  const isLoading = apiIsLoading;


  // Use typedCurrentChallenge from useUserChallenges hook
  // typedCurrentChallenge is already available from the hook
  

  // Add state to prevent multiple simultaneous API calls
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Refresh function with rate limiting protection
  const refreshData = useCallback(async () => {
    if (isRefreshing) return;
    
    // Check if we need to wait due to rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const minInterval = 2000; // Minimum 2 seconds between requests
    
    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    setIsRefreshing(true);
    setLastRequestTime(Date.now());
    
    try {
      // Load challenges from API
      await getChallenges();
      // Load challenge stats from API
      await getChallengeStats();
      
          // currentChallenge est maintenant chargé automatiquement via React Query
      
      // Reset retry count on success
      setRetryCount(0);
    } catch (error: unknown) {
      console.error('Error loading challenges:', error);
      
      // Handle specific error types
      const errorObj = error as { status?: number; message?: string };
      const isRateLimitError = errorObj?.status === 429 || 
                              errorObj?.message?.includes('ThrottlerException');
      
      if (isRateLimitError) {
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
        setRetryCount(prev => prev + 1);
        
        toast.error(`Limite de requêtes atteinte. Nouvelle tentative dans ${backoffDelay/1000}s...`);
        
        // Retry after backoff delay
        setTimeout(() => {
          if (retryCount < 3) { // Max 3 retries
            refreshData();
          } else {
            toast.error('Trop de tentatives. Veuillez réessayer plus tard.');
            setRetryCount(0);
          }
        }, backoffDelay);
      } else {
        toast.error('Erreur lors du chargement des défis');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [getChallenges, getChallengeStats, isRefreshing, lastRequestTime, retryCount]);

  // Debounced refresh function
  const debouncedRefresh = debounce(refreshData, 1000);

  // Load data only once on mount
  useEffect(() => {
    if (user?.id) {
      console.log('ChallengesPage - Loading data for user:', user.id);
      // Call the API functions directly instead of refreshData to avoid re-renders
      const loadData = async () => {
        try {
          console.log('ChallengesPage - Getting challenges...');
          await getChallenges();
          console.log('ChallengesPage - Getting challenge stats...');
          await getChallengeStats();
          // typedCurrentChallenge est maintenant chargé automatiquement via React Query
          console.log('ChallengesPage - Getting challenge history...');
          await getChallengeHistory();
          console.log('ChallengesPage - Getting user challenge stats...');
          await getUserChallengeStats();
        } catch (error) {
          console.error('Error loading challenges:', error);
          toast.error('Erreur lors du chargement des défis');
        }
      };
      loadData();
    }
  }, [user?.id, getChallenges, getChallengeStats, getChallengeHistory, getUserChallengeStats]); // Include all dependencies

  // Debug: Afficher les données chargées
  useEffect(() => {
    console.log('ChallengesPage - apiChallenges:', apiChallenges);
    console.log('ChallengesPage - challenges:', challenges);
    console.log('ChallengesPage - typedCurrentChallenge:', typedCurrentChallenge);
    console.log('ChallengesPage - currentChallengeLoading:', currentChallengeLoading);
    console.log('ChallengesPage - currentChallengeError:', currentChallengeError);
    if (typedCurrentChallenge) {
      console.log('ChallengesPage - typedCurrentChallenge.currentAmount:', typedCurrentChallenge.currentAmount);
      console.log('ChallengesPage - typedCurrentChallenge.targetAmount:', typedCurrentChallenge.targetAmount);
      console.log('ChallengesPage - typedCurrentChallenge.status:', typedCurrentChallenge.status);
    }
    console.log('ChallengesPage - challengeHistory:', challengeHistory);
    console.log('ChallengesPage - userChallengeStats:', userChallengeStats);
    console.log('ChallengesPage - apiIsLoading:', apiIsLoading);
    console.log('ChallengesPage - userChallengesLoading:', userChallengesLoading);
    console.log('ChallengesPage - apiError:', apiError);
  }, [apiChallenges, challenges, typedCurrentChallenge, currentChallengeLoading, currentChallengeError, challengeHistory, userChallengeStats, apiIsLoading, userChallengesLoading, apiError]);

  // Filter challenges
  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || challenge.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'upcoming' && new Date(challenge.startDate) > new Date()) ||
      (statusFilter === 'active' && new Date(challenge.startDate) <= new Date() && new Date(challenge.endDate) >= new Date()) ||
      (statusFilter === 'completed' && new Date(challenge.endDate) < new Date());
    
    return matchesSearch && matchesType && matchesStatus;
  });


  const handleJoinChallenge = async (challengeId: string) => {
    setSelectedChallenge(challenges.find(c => c.id === challengeId) || null);
    setIsJoinModalOpen(true);
  };

  const handleGoToMyChallenge = (challengeId: string) => {
    // Rediriger vers la page MyChallenge
    window.location.href = '/user-dashboard/my-challenge';
  };

  const handleViewCollectiveProgress = (challengeId: string) => {
    // Rediriger vers la page de progression collective
    window.location.href = `/collective-progress?challengeId=${challengeId}`;
  };

  const handleJoinConfirm = async (goalData: { 
    targetAmount: number; 
    mode: 'free' | 'forced'; 
    bankAccountId?: string;
    motivation?: string;
    goalFormData: unknown;
  }) => {
    if (!selectedChallenge) return;

    setIsJoiningChallenge(true);
    try {
      // Use the correct JoinChallengeDto format
      const joinData = {
        targetAmount: goalData.targetAmount,
        mode: goalData.mode,
        bankAccountId: goalData.bankAccountId,
        motivation: goalData.motivation || `Objectif: ${goalData.targetAmount}€ - Mode: ${goalData.mode}`
      };
      
      await joinChallengeApi(selectedChallenge.id, joinData);
      
      // Invalider le cache du typedCurrentChallenge pour forcer le rechargement
      if (user?.id) {
        invalidateCurrentChallenge(user.id);
      }
      
      // Refresh data with debouncing
      debouncedRefresh();
      
      // Close modal and show success message after loading
      setIsJoinModalOpen(false);
      setSelectedChallenge(null);
      toast.success('Challenge rejoint avec succès !');
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error('Erreur lors de la participation au challenge');
    } finally {
      setIsJoiningChallenge(false);
    }
  };

  const getStatsCards = () => {
    if (!challengeStats) return [];

    return [
      {
        title: 'Challenges actifs',
        value: challengeStats.activeChallenges,
        icon: <Trophy className="w-5 h-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        title: 'Participants total',
        value: challengeStats.totalParticipants,
        icon: <Users className="w-5 h-5" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        title: 'Montant épargné',
        value: `${(challengeStats.totalAmountSaved / 1000).toFixed(0)}k€`,
        icon: <Target className="w-5 h-5" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      {
        title: 'Taux de réussite',
        value: `${challengeStats.averageCompletionRate}%`,
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      }
    ];
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
          <h1 className="text-3xl font-bold text-gray-900">Challenges d'épargne</h1>
          <p className="text-gray-600 mt-1">
            Rejoignez des défis motivants pour atteindre vos objectifs financiers
          </p>
        </div>
        <Button
          onClick={debouncedRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </motion.div>

      {/* Error State */}
      {apiError && (
        <motion.div variants={fadeInUp} className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
              <p className="text-sm text-red-600 mt-1">{apiError}</p>
            </div>
            <div className="ml-auto">
              <Button
                onClick={debouncedRefresh}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Réessai...' : 'Réessayer'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {getStatsCards().map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Current Challenge Section */}
      <motion.div variants={fadeInUp} className="mb-8">
        <CurrentChallengeCard 
          challenge={typedCurrentChallenge}
          isLoading={currentChallengeLoading}
          error={currentChallengeError?.message || null}
        />
      </motion.div>

      {/* Available Challenges Section */}
      <motion.div variants={fadeInUp}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Target className="w-6 h-6 text-primary" />
              <span>Challenges Disponibles</span>
            </h2>
          </div>
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Rechercher un challenge..."
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
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="custom">Personnalisé</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="upcoming">À venir</SelectItem>
                      <SelectItem value="active">En cours</SelectItem>
                      <SelectItem value="completed">Terminés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Challenges Grid */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredChallenges.length > 0 ? (
                filteredChallenges.map((challenge) => {
                  // Vérifier si l'utilisateur a rejoint ce challenge
                  const isJoined = typedCurrentChallenge?.id === challenge.id || 
                                  challenge.isJoined 
                  
                  // Vérifier si l'utilisateur a abandonné ce challenge
                  const hasAbandoned = challenge.userParticipation?.status === 'ABANDONED';
                  
                  console.log('ChallengesPage - Challenge:', challenge.title, 'isJoined:', isJoined, 'hasAbandoned:', hasAbandoned, 'currentChallengeId:', typedCurrentChallenge?.id, 'challengeId:', challenge.id, 'participantsList:', challenge.participantsList, 'userParticipation:', challenge.userParticipation);
                  
                  return (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onJoin={handleJoinChallenge}
                      onGoToMyChallenge={handleGoToMyChallenge}
                      onViewCollectiveProgress={handleViewCollectiveProgress}
                      showJoinButton={true}
                      isJoined={isJoined}
                      hasAbandoned={hasAbandoned}
                    />
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Aucun challenge trouvé
                  </h3>
                  <p className="text-gray-500">
                    Essayez de modifier vos critères de recherche
                  </p>
                </div>
              )}
            </motion.div>
        </div>
      </motion.div>

      {/* Join Modal */}
        <ChallengeJoinModal
          challenge={selectedChallenge}
          isOpen={isJoinModalOpen}
          onClose={() => {
            setIsJoinModalOpen(false);
            setSelectedChallenge(null);
          }}
          onJoin={handleJoinConfirm}
          isLoading={isJoiningChallenge}
        />
    </motion.div>
  );
};
