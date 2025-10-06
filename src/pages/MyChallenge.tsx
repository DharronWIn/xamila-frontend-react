import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Target,
  TrendingUp, Clock, History,
  AlertTriangle,
  CheckCircle,
  Plus, BarChart3,
  Award, DollarSign,
  ArrowUpRight,
  ArrowDownRight, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { useChallengeStore } from '@/stores/challengeStore';
import { useUserChallenges, useCurrentChallengeQuery } from '@/lib/apiComponent/hooks/useChallenges';
import { Challenge } from '@/lib/apiComponent/types';
import { ChallengeParticipant, SavingsChallenge, ChallengeTransaction } from '@/types/challenge';
// import { ChallengeTransaction } from '@/lib/apiComponent/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/lib/apiComponent/hooks';
import { api } from '@/lib/apiComponent/apiClient';
import { challengeEndpoints } from '@/lib/apiComponent/endpoints';

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

const MyChallenge = () => {
  const { user } = useAuth();
  // États locaux pour remplacer le store
  const [userParticipations, setUserParticipations] = useState<ChallengeParticipant[]>([]);
  const [challengeTransactions, setChallengeTransactions] = useState<ChallengeTransaction[]>([]);

  // Utiliser React Query pour synchroniser le currentChallenge entre les pages
  const { 
    data: currentChallenge,
    isLoading: currentChallengeLoading,
    error: currentChallengeError
  } = useCurrentChallengeQuery(user?.id || '');
  
  // Typer currentChallenge correctement
  const typedCurrentChallenge = currentChallenge as Challenge | null;
  
  // API hooks
  const {
    challengeHistory,
    challengeStats,
    isLoading: apiIsLoading,
    error: apiError,
    getChallengeHistory,
    getUserChallengeStats,
    getUserChallenges,
  } = useUserChallenges(user?.id || '');

  // Fonction optimisée pour récupérer les participations de l'utilisateur
  const fetchUserParticipations = useCallback(async (userId: string) => {
    try {
      // Utiliser l'endpoint spécifique pour les challenges de l'utilisateur
      const userChallenges = await getUserChallenges();
      console.log('fetchUserParticipations - User challenges:', userChallenges);
      
      // Convertir les challenges en participations
      const participations: ChallengeParticipant[] = userChallenges.map((challenge: unknown) => {
        const challengeData = challenge as Record<string, unknown>;
        return {
          id: (challengeData.id as string) || '',
          userId: userId,
          userName: user?.name || 'Utilisateur',
          userAvatar: user?.avatar,
          challengeId: (challengeData.id as string) || '',
          mode: 'free' as const,
          targetAmount: (challengeData.targetAmount as number) || 0,
          currentAmount: (challengeData.currentAmount as number) || 0,
          progressPercentage: challengeData.currentAmount && challengeData.targetAmount 
            ? ((challengeData.currentAmount as number) / (challengeData.targetAmount as number)) * 100 
            : 0,
          bankAccountId: undefined,
          joinedAt: (challengeData.createdAt as string) || new Date().toISOString(),
          status: (challengeData.status as 'upcoming' | 'active' | 'abandoned' | 'completed') || 'active',
          abandonmentReason: undefined,
          abandonedAt: undefined,
          transactions: [],
          challenge: challengeData as unknown as SavingsChallenge
        };
      });
      
      setUserParticipations(participations);
      console.log('fetchUserParticipations - Mapped participations:', participations);
    } catch (error) {
      console.error('Error fetching user participations:', error);
    }
  }, [getUserChallenges, user?.name, user?.avatar]);

  const fetchChallengeTransactions = useCallback(async (challengeId: string, participantId: string) => {
    try {
      // Récupérer les transactions du challenge
      const response = await api.get(challengeEndpoints.transactions(challengeId));
      const responseData = response as Record<string, unknown>;
      if (responseData && responseData.data) {
        // Filtrer les transactions du participant
        const participantTransactions = (responseData.data as unknown[]).filter((transaction: unknown) => {
          const transactionData = transaction as Record<string, unknown>;
          return transactionData.participantId === participantId;
        });
        setChallengeTransactions(participantTransactions as ChallengeTransaction[]);
      }
    } catch (error) {
      console.error('Error fetching challenge transactions:', error);
    }
  }, []);

  const canMakeTransaction = useCallback((challengeId: string, userId: string) => {
    // Logique simplifiée : vérifier si le challenge est actif
    const challenge = userParticipations.find(p => p.challengeId === challengeId);
    return challenge && challenge.status === 'active';
  }, [userParticipations]);

  const abandonChallenge = useCallback(async (challengeId: string, reason: string, category: string, comments?: string) => {
    try {
      const abandonData = {
        reason,
        reasonCategory: category,
        additionalComments: comments
      };

      await api.post(challengeEndpoints.abandonChallenge(challengeId), abandonData);
      
      // Rafraîchir les données
      if (user?.id) {
        await fetchUserParticipations(user.id);
        // typedCurrentChallenge sera automatiquement rafraîchi via React Query
      }
      
      return true;
    } catch (error) {
      console.error('Error abandoning challenge:', error);
      return false;
    }
  }, [user?.id, fetchUserParticipations]);

  const [activeParticipation, setActiveParticipation] = useState<(ChallengeParticipant & { challenge?: SavingsChallenge }) | null>(null);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isAbandonModalOpen, setIsAbandonModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);
  const [transactionData, setTransactionData] = useState({
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'deposit' as 'deposit' | 'withdrawal'
  });

  // Interface pour le body de la transaction
  interface AddTransactionBody {
    amount: number;
    description?: string;
    category?: string;
    date: string;
    type: 'deposit' | 'withdrawal';
  }
  const [abandonData, setAbandonData] = useState({
    reason: '',
    category: '',
    comments: ''
  });

  useEffect(() => {
    if (user?.id) {
      // typedCurrentChallenge est maintenant chargé automatiquement via React Query
      getChallengeHistory();
      getUserChallengeStats();
      
      // Also load from store for backward compatibility
      fetchUserParticipations(user.id);
    }
  }, [user?.id, getChallengeHistory, getUserChallengeStats, fetchUserParticipations]);

  // Helper function to map API typedCurrentChallenge to ChallengeParticipant
  const mapApiChallengeToParticipant = useCallback((apiChallenge: unknown): ChallengeParticipant & { challenge?: SavingsChallenge } => {
    const challenge = apiChallenge as Record<string, unknown>;
    
    console.log('mapApiChallengeToParticipant - Raw API challenge:', challenge);
    
    const mapped = {
      id: (challenge.id as string) || '',
      userId: (challenge.userId as string) || user?.id || '',
      userName: (challenge.userName as string) || user?.firstName || 'Utilisateur',
      userAvatar: challenge.userAvatar as string | undefined,
      challengeId: (challenge.challengeId as string) || '',
      mode: (challenge.mode as 'free' | 'forced') || 'free',
      targetAmount: (challenge.targetAmount as number) || 0,
      currentAmount: (challenge.currentAmount as number) || 0,
      progressPercentage: (challenge.progressPercentage as number) || 0,
      bankAccountId: challenge.bankAccountId as string | undefined,
      joinedAt: (challenge.joinedAt as string) || new Date().toISOString(),
      status: (challenge.status as 'upcoming' | 'active' | 'abandoned' | 'completed') || 'active',
      abandonmentReason: challenge.abandonmentReason as string | undefined,
      abandonedAt: challenge.abandonedAt as string | undefined,
      transactions: (challenge.transactions as ChallengeTransaction[]) || [],
      challenge: challenge.challenge as SavingsChallenge | undefined
    };
    
    console.log('mapApiChallengeToParticipant - Mapped result:', mapped);
    console.log('mapApiChallengeToParticipant - challengeId:', mapped.challengeId);
    
    return mapped;
  }, [user?.id, user?.firstName]);

  useEffect(() => {
    console.log('useEffect - typedCurrentChallenge:', typedCurrentChallenge);
    console.log('useEffect - userParticipations:', userParticipations);
    
    // Use API data if available, otherwise fallback to store
    if (typedCurrentChallenge) {
      const mappedParticipation = mapApiChallengeToParticipant(typedCurrentChallenge);
      console.log('useEffect - Setting activeParticipation from typedCurrentChallenge:', mappedParticipation);
      setActiveParticipation(mappedParticipation);
    } else {
      const active = userParticipations.find(p => p.status === 'active');
      console.log('useEffect - Setting activeParticipation from userParticipations:', active);
      setActiveParticipation(active);
      
      // Ne pas charger les transactions automatiquement
      // Elles seront chargées seulement quand l'utilisateur ouvre l'historique
    }
  }, [typedCurrentChallenge, userParticipations, user?.id, mapApiChallengeToParticipant]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeParticipation || !transactionData.amount || isSubmittingTransaction) return;

    // Debug: vérifier les données avant l'envoi
    console.log('handleAddTransaction - activeParticipation:', activeParticipation);
    console.log('handleAddTransaction - challengeId:', activeParticipation.challengeId);
    console.log('handleAddTransaction - transactionData:', transactionData);

    if (!activeParticipation.challengeId) {
      alert('Erreur: ID du challenge manquant. Impossible d\'ajouter la transaction.');
      return;
    }

    setIsSubmittingTransaction(true);

    try {
      // Préparer le body de la transaction
      const transactionBody: AddTransactionBody = {
        amount: transactionData.amount,
        description: transactionData.description || undefined,
        category: 'Épargne', // Catégorie par défaut
        date: new Date(transactionData.date).toISOString(),
        type: transactionData.type
      };

      console.log('handleAddTransaction - transactionBody:', transactionBody);
      console.log('handleAddTransaction - API endpoint:', challengeEndpoints.addTransaction(activeParticipation.challengeId));

      // Appel API pour ajouter la transaction
      await api.post(
        challengeEndpoints.addTransaction(activeParticipation.challengeId),
        transactionBody
      );

      // Réinitialiser le formulaire
      setTransactionData({ 
        amount: 0, 
        description: '', 
        date: new Date().toISOString().split('T')[0], 
        type: 'deposit' 
      });
      setIsAddTransactionModalOpen(false);

      // Rafraîchir les données
      if (user?.id) {
        // typedCurrentChallenge sera automatiquement rafraîchi via React Query
        fetchUserParticipations(user.id);
      }

      // Afficher un message de succès
      alert('Transaction enregistrée avec succès !');
      
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Erreur lors de l\'enregistrement de la transaction');
    } finally {
      setIsSubmittingTransaction(false);
    }
  };

  const handleAbandonChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeParticipation || !abandonData.reason || !abandonData.category) return;

    const success = await abandonChallenge(
      activeParticipation.challengeId,
      abandonData.reason,
      abandonData.category as 'financial_difficulty' | 'lost_interest' | 'found_better_challenge' | 'personal_issues' | 'other',
      abandonData.comments
    );

    if (success) {
      setAbandonData({ reason: '', category: '', comments: '' });
      setIsAbandonModalOpen(false);
      // Refresh data
      fetchUserParticipations(user?.id || '');
    }
  };

  const handleOpenHistoryModal = async () => {
    if (!activeParticipation) return;
    
    setIsHistoryModalOpen(true);
    setIsLoadingTransactions(true);
    
    try {
      // Charger les transactions seulement quand on ouvre l'historique
      await fetchChallengeTransactions(activeParticipation.challengeId, activeParticipation.id);
    } catch (error) {
      console.error('Error loading transaction history:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const getChallengeStatus = (): 'none' | 'upcoming' | 'active' | 'completed' => {
    if (!typedCurrentChallenge) {
      return 'none';
    }
    
    const now = new Date();
    const startDate = new Date(typedCurrentChallenge.startDate);
    const endDate = new Date(typedCurrentChallenge.endDate);
    
    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'active';
    return 'completed';
  };

  const getStatusBadge = () => {
    const status = getChallengeStatus();
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">À venir</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-600">En cours</Badge>;
      case 'completed':
        return <Badge variant="secondary">Terminé</Badge>;
      default:
        return <Badge variant="outline">Aucun challenge</Badge>;
    }
  };

  const getTimeInfo = () => {
    if (!typedCurrentChallenge) return '';
    
    const now = new Date();
    const startDate = new Date(typedCurrentChallenge.startDate);
    const endDate = new Date(typedCurrentChallenge.endDate);
    const status = getChallengeStatus();
    
    if (status === 'upcoming') {
      return `Commence ${formatDistanceToNow(startDate, { addSuffix: true, locale: fr })}`;
    } else if (status === 'active') {
      return `Se termine ${formatDistanceToNow(endDate, { addSuffix: true, locale: fr })}`;
    } else {
      return `Terminé ${formatDistanceToNow(endDate, { addSuffix: true, locale: fr })}`;
    }
  };

  const canMakeDeposit = () => {
    if (!typedCurrentChallenge) {
      console.log('canMakeDeposit: No current challenge');
      return false;
    }
    
    // Vérifier que nous avons les dates nécessaires
    if (!typedCurrentChallenge.startDate || !typedCurrentChallenge.endDate) {
      console.log('canMakeDeposit: Missing challenge dates');
      return false;
    }
    
    const status = getChallengeStatus();
    console.log('canMakeDeposit: Challenge status:', status);
    console.log('canMakeDeposit: Challenge dates:', {
      startDate: typedCurrentChallenge.startDate,
      endDate: typedCurrentChallenge.endDate,
      now: new Date().toISOString()
    });
    
    // Autoriser les transactions seulement si le challenge est actif
    const canDeposit = status === 'active';
    console.log('canMakeDeposit: Can deposit:', canDeposit);
    
    return canDeposit;
  };

  // Données pour les graphiques
  const chartData = challengeTransactions
    .filter(t => t.participantId === activeParticipation?.id)
    .map((transaction, index) => ({
      day: index + 1,
      amount: transaction.amount,
      cumulative: challengeTransactions
        .filter(t => t.participantId === activeParticipation?.id)
        .slice(0, index + 1)
        .reduce((sum, t) => sum + (t.type === 'deposit' ? t.amount : -t.amount), 0)
    }));

  // Loading state
  if (apiIsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <motion.div variants={fadeInUp} className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Chargement de votre challenge...
            </h2>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (apiError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <motion.div variants={fadeInUp} className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Erreur de chargement
            </h2>
            <p className="text-gray-500 mb-6">{apiError}</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // No active challenge
  if (!activeParticipation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <motion.div variants={fadeInUp} className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Aucun challenge actif
            </h2>
            <p className="text-gray-500 mb-6">
              Rejoignez un challenge d'épargne pour commencer votre parcours !
            </p>
            <Button onClick={() => window.location.href = '/user-dashboard/challenges'}>
              <Trophy className="w-4 h-4 mr-2" />
              Voir les challenges disponibles
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-primary" />
                <span>Mon Challenge d'Épargne</span>
              </h1>
              <p className="text-gray-600 mt-2">
                {activeParticipation.challenge?.title}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge()}
              <Button
                variant="outline"
                onClick={handleOpenHistoryModal}
              >
                <History className="w-4 h-4 mr-2" />
                Historique
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div variants={fadeInUp}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Épargné</p>
                    <p className="text-2xl font-bold">{activeParticipation.currentAmount.toLocaleString()}€</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Objectif</p>
                    <p className="text-2xl font-bold">{activeParticipation.targetAmount.toLocaleString()}€</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Progression</p>
                    <p className="text-2xl font-bold">{activeParticipation.progressPercentage.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Temps restant</p>
                    <p className="text-sm font-semibold">{getTimeInfo()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Section */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Progression</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression vers l'objectif</span>
                    <span>{activeParticipation.progressPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={activeParticipation.progressPercentage} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{activeParticipation.currentAmount.toLocaleString()}€</span>
                    <span>{activeParticipation.targetAmount.toLocaleString()}€</span>
                  </div>
                </div>

                {/* Chart */}
                {chartData.length > 0 && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [`${value}€`, 'Montant']}
                          labelFormatter={(label: number) => `Jour ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cumulative" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}


                {/* Quick Actions */}
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => setIsAddTransactionModalOpen(true)}
                      disabled={!canMakeDeposit()}
                      className="flex-1"
                      title={!canMakeDeposit() ? `Bouton désactivé - Status: ${getChallengeStatus()}` : 'Ajouter une transaction'}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nouvelle transaction
                    </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = `/user-dashboard/collective-progress?challengeId=${activeParticipation.challengeId}`}
                    className="flex-1"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Progression collective
                  </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setIsAbandonModalOpen(true)}
                      className="flex-1"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Abandonner
                    </Button>
                  </div>
                  
                  {/* Message d'information si le bouton est désactivé */}
                  {!canMakeDeposit() && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <p className="text-sm text-amber-800">
                          {!typedCurrentChallenge?.startDate || !typedCurrentChallenge?.endDate
                            ? 'Les informations de dates du challenge ne sont pas disponibles. Impossible de faire des transactions.'
                            : getChallengeStatus() === 'upcoming' 
                            ? 'Le challenge n\'a pas encore commencé. Vous pourrez faire des transactions une fois qu\'il sera actif.'
                            : getChallengeStatus() === 'completed'
                            ? 'Le challenge est terminé. Vous ne pouvez plus faire de nouvelles transactions.'
                            : 'Impossible de faire des transactions pour le moment.'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={fadeInUp} className="space-y-6">
            {/* Challenge Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Informations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Mode</span>
                  <Badge variant={activeParticipation.mode === 'forced' ? 'default' : 'outline'}>
                    {activeParticipation.mode === 'forced' ? 'Forcé' : 'Libre'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Début</span>
                  <span>{typedCurrentChallenge ? new Date(typedCurrentChallenge.startDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fin</span>
                  <span>{typedCurrentChallenge ? new Date(typedCurrentChallenge.endDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Dernière transaction</span>
                  <span>
                    {activeParticipation.lastTransactionAt 
                      ? formatDistanceToNow(new Date(activeParticipation.lastTransactionAt), { addSuffix: true, locale: fr })
                      : 'Aucune'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Rewards */}
            {activeParticipation.challenge?.rewards && activeParticipation.challenge.rewards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Récompenses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activeParticipation.challenge.rewards.map((reward, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{reward}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>Dernières transactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challengeTransactions
                    .filter(t => t.participantId === activeParticipation.id)
                    .slice(0, 5)
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {transaction.type === 'deposit' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          )}
                          <span className="truncate">{transaction.description}</span>
                        </div>
                        <span className={`font-semibold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount}€
                        </span>
                      </div>
                    ))}
                  {challengeTransactions.filter(t => t.participantId === activeParticipation.id).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">Aucune transaction</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Add Transaction Modal */}
        <Dialog open={isAddTransactionModalOpen} onOpenChange={setIsAddTransactionModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-primary" />
                <span>Enregistrer une transaction</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <Label>Type de transaction</Label>
                <RadioGroup 
                  value={transactionData.type} 
                  onValueChange={(value: 'deposit' | 'withdrawal') => setTransactionData({...transactionData, type: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deposit" id="deposit" />
                    <Label htmlFor="deposit">Versement (dépôt)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="withdrawal" id="withdrawal" />
                    <Label htmlFor="withdrawal">Retrait</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="amount">Montant (€) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={transactionData.amount}
                  onChange={(e) => setTransactionData({ ...transactionData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="100.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={transactionData.description}
                  onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                  placeholder="Ex: Versement mensuel, épargne bonus..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={transactionData.date}
                  onChange={(e) => setTransactionData({ ...transactionData, date: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddTransactionModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmittingTransaction}>
                  {isSubmittingTransaction ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Abandon Challenge Modal */}
        <Dialog open={isAbandonModalOpen} onOpenChange={setIsAbandonModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Abandonner le challenge</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAbandonChallenge} className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Attention :</strong> Cette action est irréversible. Vous perdrez l'accès à ce challenge et ne pourrez plus faire de versements.
                </p>
              </div>
              <div>
                <Label htmlFor="category">Raison principale *</Label>
                <Select
                  value={abandonData.category}
                  onValueChange={(value) => setAbandonData({ ...abandonData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une raison" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial_difficulty">Difficultés financières</SelectItem>
                    <SelectItem value="lost_interest">Perte d'intérêt</SelectItem>
                    <SelectItem value="found_better_challenge">Meilleur challenge trouvé</SelectItem>
                    <SelectItem value="personal_issues">Problèmes personnels</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reason">Détails *</Label>
                <Textarea
                  id="reason"
                  value={abandonData.reason}
                  onChange={(e) => setAbandonData({ ...abandonData, reason: e.target.value })}
                  placeholder="Expliquez votre décision..."
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="comments">Commentaires supplémentaires</Label>
                <Textarea
                  id="comments"
                  value={abandonData.comments}
                  onChange={(e) => setAbandonData({ ...abandonData, comments: e.target.value })}
                  placeholder="Commentaires optionnels..."
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAbandonModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="destructive">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Abandonner
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* History Modal */}
        <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Historique des transactions</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {isLoadingTransactions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Chargement de l'historique...</span>
                </div>
              ) : challengeTransactions
                .filter(t => t.participantId === activeParticipation.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {transaction.type === 'deposit' ? (
                        <ArrowUpRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount}€
                      </p>
                      {transaction.isVerified && (
                        <Badge variant="outline" className="text-xs">Vérifié</Badge>
                      )}
                    </div>
                  </div>
                ))}
              {challengeTransactions.filter(t => t.participantId === activeParticipation.id).length === 0 && (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune transaction enregistrée</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default MyChallenge;
