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
  ArrowDownRight, Settings,
  Trash2
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
// import { useChallengeStore } from '@/stores/challengeStore';
import { useUserChallenges, useCurrentChallengeQuery, useInvalidateCurrentChallenge } from '@/lib/apiComponent/hooks/useChallenges';
import { useQueryClient } from '@tanstack/react-query';
import { CurrentChallengeResponse } from '@/lib/apiComponent/types';
import { ChallengeTransaction } from '@/types/challenge';
// import { ChallengeTransaction } from '@/lib/apiComponent/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/lib/apiComponent/hooks';
import { useUserResources } from '@/lib/apiComponent/hooks/useUserResources';
import { api } from '@/lib/apiComponent/apiClient';
import { challengeEndpoints } from '@/lib/apiComponent/endpoints';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
  const { list: listUserResources, download: downloadUserResource } = useUserResources();
  const queryClient = useQueryClient();
  const invalidateCurrentChallenge = useInvalidateCurrentChallenge();
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [certificateResourceId, setCertificateResourceId] = useState<string | null>(null);
  const [hasPromptedCertificate, setHasPromptedCertificate] = useState(false);
  const [isCertificateAvailable, setIsCertificateAvailable] = useState(false);
  const [isChallengeCompletedModalOpen, setIsChallengeCompletedModalOpen] = useState(false);
  const [isCertificateReady, setIsCertificateReady] = useState(false);
  // États locaux pour les transactions
  const [challengeTransactions, setChallengeTransactions] = useState<ChallengeTransaction[]>([]);

  // Utiliser React Query pour synchroniser le currentChallenge entre les pages
  const { 
    data: currentChallenge,
    isLoading: currentChallengeLoading,
    error: currentChallengeError
  } = useCurrentChallengeQuery(user?.id || '');
  
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


  const fetchChallengeTransactions = useCallback(async (challengeId: string, participantId?: string) => {
    try {
      // Récupérer les transactions du challenge
      // apiClient extrait déjà data, donc on reçoit { data: [...], total: 3 }
      const response = await api.get<{
        data?: Array<{
          id: string;
          challengeId: string;
          participantId: string;
          userId: string;
          amount: number;
          type: string;
          description: string;
          date: string;
          createdAt: string;
        }>;
        total?: number;
      }>(challengeEndpoints.transactions(challengeId));
      
      // Extraire les transactions
      let transactions: ChallengeTransaction[] = [];
      
      if (response && typeof response === 'object') {
        const responseObj = response as Record<string, unknown>;
        
        // apiClient extrait déjà data, donc response = { data: [...], total: 3 }
        if (responseObj.data && Array.isArray(responseObj.data)) {
          transactions = responseObj.data as ChallengeTransaction[];
        }
        // Si response est directement un tableau (fallback)
        else if (Array.isArray(response)) {
          transactions = response as ChallengeTransaction[];
        }
      }
      
      // Les transactions retournées sont déjà pour l'utilisateur actuel dans ce challenge
      // Filtrer par userId pour s'assurer qu'on n'affiche que les transactions de l'utilisateur actuel
      const userId = user?.id;
      const filteredTransactions = userId 
        ? transactions.filter((transaction: ChallengeTransaction) => {
            return transaction.userId === userId;
          })
        : transactions;
      
      setChallengeTransactions(filteredTransactions);
    } catch (error) {
      setChallengeTransactions([]);
    }
  }, [user?.id]);

  const canMakeTransaction = useCallback((challengeId: string, userId: string) => {
    // Vérifier si le challenge est actif et que l'utilisateur participe
    if (!currentChallenge || currentChallenge.id !== challengeId) return false;
    return currentChallenge.status === 'ACTIVE' && currentChallenge.userParticipation?.status === 'ACTIVE';
  }, [currentChallenge]);

  const abandonChallenge = useCallback(async (challengeId: string, reason: string, category: string, comments?: string) => {
    try {
      const abandonData = {
        reason,
        reasonCategory: category,
        additionalComments: comments
      };

      await api.post(challengeEndpoints.abandonChallenge(challengeId), abandonData);
      
      // Rafraîchir les données (React Query se chargera de rafraîchir automatiquement)
      // L'invalidation se fera automatiquement via React Query
      
      return true;
      } catch (error) {
        return false;
    }
  }, []);

  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isAbandonModalOpen, setIsAbandonModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
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
      // currentChallenge est maintenant chargé automatiquement via React Query
      getChallengeHistory();
      getUserChallengeStats();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Charger les transactions au démarrage si un challenge existe
  useEffect(() => {
    if (currentChallenge?.id && user?.id) {
      fetchChallengeTransactions(currentChallenge.id);
    }
  }, [currentChallenge?.id, user?.id, fetchChallengeTransactions]);

  // Récupérer directement les données du currentChallenge
  const userParticipation = currentChallenge?.userParticipation;
  const challengeGoal = userParticipation?.goal;
  
  // Vérifier si le challenge est complété
  const isChallengeCompleted = userParticipation?.status === 'COMPLETED' || challengeGoal?.isAchieved === true;
  const completionDate = challengeGoal?.achievedAt || userParticipation?.completedAt;

  // Prompt certificate when challenge reaches 100% completion
  // useEffect(() => {
  //   const checkCertificate = async () => {
  //     try {
  //       const challengeId = currentChallenge?.id;
  //       if (challengeId) {
  //         const resources = await listUserResources({ type: 'CERTIFICATE', challengeId });
  //         const availableResource = (resources || []).find(r => r.available);
  //         if (availableResource?.id) {
  //           setCertificateResourceId(availableResource.id);
  //           setIsCertificateAvailable(true);
  //           setIsCertificateModalOpen(true);
  //           setHasPromptedCertificate(true);
  //         } else if ((resources || []).length > 0) {
  //           setCertificateResourceId(resources[0].id);
  //           setIsCertificateAvailable(false);
  //           setIsCertificateModalOpen(true);
  //           setHasPromptedCertificate(true);
  //         }
  //       }
  //     } catch (e) {
  //       console.warn('Failed to fetch certificate resource on completion', e);
  //     }
  //   };

  //   const progress = challengeGoal?.progress ?? 0;
  //   if (!hasPromptedCertificate && progress >= 100) {
  //     checkCertificate();
  //   }
  // }, [challengeGoal?.progress, currentChallenge?.id, hasPromptedCertificate, listUserResources]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChallenge || !userParticipation || !transactionData.amount || isSubmittingTransaction) return;

    const challengeId = currentChallenge.id;
    
    if (!challengeId) {
      toast.error('Erreur: ID du challenge manquant. Impossible d\'ajouter la transaction.');
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


      // Type de la réponse API
      // apiClient extrait déjà data, donc response contient directement les propriétés du challenge
      // D'après les logs: response = { id, title, description, userParticipation, participant, isCertificateReady, ... }
      type TransactionResponse = CurrentChallengeResponse & {
        participant?: {
          id: string;
          challengeId: string;
          userId: string;
          currentAmount: number;
          targetAmount: number;
          status: string;
          mode: string;
          bankAccountId: string | null;
          motivation: string;
          joinedAt: string;
          completedAt?: string;
          abandonedAt: string | null;
          isCurrentChallenge: boolean;
          goal?: {
            id: string;
            targetAmount: number;
            currentAmount: number;
            progress: number;
            isAchieved: boolean;
            achievedAt?: string;
          };
        };
        isCertificateReady?: boolean;
      };

      // Appel API pour ajouter la transaction
      const response = await api.post<TransactionResponse, AddTransactionBody>(
        challengeEndpoints.addTransaction(challengeId),
        transactionBody
      );

      // apiClient extrait déjà data, donc response devrait contenir directement les propriétés du challenge
      // D'après les logs console, response.data contient { id, title, description, userParticipation, ... }
      // Mais comme apiClient extrait data, response devrait être directement le challenge
      // Vérifier la structure réelle de la réponse
      let updatedChallenge: CurrentChallengeResponse | null = null;
      
      if (response && typeof response === 'object') {
        const responseObj = response as unknown as Record<string, unknown>;
        
        // Si response a directement les propriétés du challenge (apiClient a extrait data)
        if ('id' in responseObj && 'title' in responseObj && 'userParticipation' in responseObj) {
          // Exclure participant et isCertificateReady pour créer un CurrentChallengeResponse propre
          const { participant, isCertificateReady, ...challengeData } = responseObj;
          updatedChallenge = challengeData as unknown as CurrentChallengeResponse;
        }
        // Sinon, essayer response.data (peut-être que apiClient n'extrait pas pour POST)
        else if ('data' in responseObj && responseObj.data && typeof responseObj.data === 'object') {
          const dataObj = responseObj.data as Record<string, unknown>;
          if ('id' in dataObj && 'title' in dataObj && 'userParticipation' in dataObj) {
            const { participant, isCertificateReady, ...challengeData } = dataObj;
            updatedChallenge = challengeData as unknown as CurrentChallengeResponse;
          }
        }
      }

      // Extraire participant et isCertificateReady de la réponse AVANT la mise à jour du cache
      // Le type TransactionResponse est CurrentChallengeResponse & { participant?, isCertificateReady? }
      // Donc response contient directement participant et isCertificateReady au même niveau que les propriétés du challenge
      const participant = (response as TransactionResponse).participant;
      const certificateReady = Boolean((response as TransactionResponse).isCertificateReady);
      
      // Vérifier si le challenge est complété AVANT la mise à jour du cache
      // Utiliser les données de la réponse API directement
      // Vérifier dans participant ET dans updatedChallenge.userParticipation
      const participantCompleted = participant?.status === 'COMPLETED' || participant?.goal?.isAchieved === true;
      const challengeCompleted = updatedChallenge?.userParticipation?.status === 'COMPLETED' || 
                                   updatedChallenge?.userParticipation?.goal?.isAchieved === true;
      const isChallengeCompleted = participantCompleted || challengeCompleted;

      // Mettre à jour le cache React Query avec les nouvelles données du challenge
      if (updatedChallenge && user?.id) {
        queryClient.setQueryData(['currentChallenge', user.id], updatedChallenge);
      } else {
        // Fallback: invalider le cache pour forcer un refresh
        if (user?.id) {
          queryClient.invalidateQueries({ queryKey: ['currentChallenge', user.id] });
        }
      }

      // Rafraîchir les transactions pour afficher la nouvelle transaction
      if (challengeId) {
        await fetchChallengeTransactions(challengeId);
      }

      // Réinitialiser le formulaire
      setTransactionData({ 
        amount: 0, 
        description: '', 
        date: new Date().toISOString().split('T')[0], 
        type: 'deposit' 
      });
      setIsAddTransactionModalOpen(false);

      // Afficher un message de succès
      toast.success('Transaction enregistrée avec succès !');

      // Gérer le certificat
      setIsCertificateReady(certificateReady);
      
      // Afficher le modal de félicitations si le challenge est complété
      // Double vérification : avant et après mise à jour du cache
      const finalCheckCompleted = isChallengeCompleted || 
                                   updatedChallenge?.userParticipation?.status === 'COMPLETED' ||
                                   updatedChallenge?.userParticipation?.goal?.isAchieved === true;
      
      if (finalCheckCompleted) {
        setIsChallengeCompletedModalOpen(true);
        
        // Si le certificat est prêt, récupérer son ID
        if (certificateReady) {
          try {
            const certChallengeId = challengeId || currentChallenge?.id || updatedChallenge?.id;
            if (certChallengeId) {
              const resources = await listUserResources({ type: 'CERTIFICATE', challengeId: certChallengeId });
              const availableResource = (resources || []).find(r => r.available);
              if (availableResource?.id) {
                setCertificateResourceId(availableResource.id);
                setIsCertificateAvailable(true);
              } else if ((resources || []).length > 0) {
                setCertificateResourceId(resources[0].id);
                setIsCertificateAvailable(false);
              }
            }
          } catch (e) {
            // Ignorer l'erreur silencieusement
          }
        }
      } else {
        // Si le challenge n'est pas complété mais qu'un certificat existe, l'afficher normalement
        try {
          const certChallengeId = challengeId || currentChallenge?.id || updatedChallenge?.id;
          if (certChallengeId && certificateReady) {
            const resources = await listUserResources({ type: 'CERTIFICATE', challengeId: certChallengeId });
            const availableResource = (resources || []).find(r => r.available);
            if (availableResource?.id) {
              setCertificateResourceId(availableResource.id);
              setIsCertificateAvailable(true);
              setIsCertificateModalOpen(true);
            } else if ((resources || []).length > 0) {
              setCertificateResourceId(resources[0].id);
              setIsCertificateAvailable(false);
              setIsCertificateModalOpen(true);
            }
          }
        } catch (e) {
          // Ignorer l'erreur silencieusement
        }
      }

    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de la transaction');
    } finally {
      setIsSubmittingTransaction(false);
    }
  };

  const handleAbandonChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChallenge || !abandonData.reason || !abandonData.category) return;
    
    const challengeId = currentChallenge.id;
    
    if (!challengeId) {
      toast.error('Erreur: ID du challenge manquant. Impossible d\'abandonner le challenge.');
      return;
    }

    const success = await abandonChallenge(
      challengeId,
      abandonData.reason,
      abandonData.category as 'financial_difficulty' | 'lost_interest' | 'found_better_challenge' | 'personal_issues' | 'other',
      abandonData.comments
    );

    if (success) {
      setAbandonData({ reason: '', category: '', comments: '' });
      setIsAbandonModalOpen(false);
      // React Query se chargera automatiquement de rafraîchir les données
    }
  };

  const handleOpenHistoryModal = async () => {
    if (!currentChallenge) return;
    
    setIsHistoryModalOpen(true);
    setIsLoadingTransactions(true);
    
    try {
      const challengeId = currentChallenge.id;
      
      if (!challengeId) {
        toast.error('Erreur: ID du challenge manquant. Impossible de charger l\'historique.');
        setIsLoadingTransactions(false);
        return;
      }
      
      // Charger les transactions seulement quand on ouvre l'historique
      // L'API retourne déjà les transactions du challenge pour l'utilisateur actuel
      await fetchChallengeTransactions(challengeId);
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!currentChallenge) return;
    
    // Demander confirmation avant suppression
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible.')) {
      return;
    }
    
    const challengeId = currentChallenge.id;
    
    if (!challengeId) {
      toast.error('Erreur: ID du challenge manquant. Impossible de supprimer la transaction.');
      return;
    }
    
    setDeletingTransactionId(transactionId);
    
    try {
      // Type de la réponse API (identique à addTransaction)
      // apiClient extrait déjà data, donc response contient directement les propriétés du challenge
      type DeleteTransactionResponse = CurrentChallengeResponse & {
        participant?: {
          id: string;
          challengeId: string;
          userId: string;
          currentAmount: number;
          targetAmount: number;
          status: string;
          mode: string;
          bankAccountId: string | null;
          motivation: string;
          joinedAt: string;
          completedAt?: string;
          abandonedAt: string | null;
          isCurrentChallenge: boolean;
          goal?: {
            id: string;
            targetAmount: number;
            currentAmount: number;
            progress: number;
            isAchieved: boolean;
            achievedAt?: string;
          };
        };
        isCertificateReady?: boolean;
      };
      
      // Appel API pour supprimer la transaction
      const response = await api.delete<DeleteTransactionResponse>(
        challengeEndpoints.deleteTransaction(challengeId, transactionId)
      );

      // apiClient extrait déjà data, donc response devrait contenir directement les propriétés du challenge
      let updatedChallenge: CurrentChallengeResponse | null = null;
      
      if (response && typeof response === 'object') {
        const responseObj = response as unknown as Record<string, unknown>;
        
        // Si response a directement les propriétés du challenge (apiClient a extrait data)
        if ('id' in responseObj && 'title' in responseObj && 'userParticipation' in responseObj) {
          // Exclure participant et isCertificateReady pour créer un CurrentChallengeResponse propre
          const { participant, isCertificateReady, ...challengeData } = responseObj;
          updatedChallenge = challengeData as unknown as CurrentChallengeResponse;
        }
        // Sinon, essayer response.data (peut-être que apiClient n'extrait pas pour DELETE)
        else if ('data' in responseObj && responseObj.data && typeof responseObj.data === 'object') {
          const dataObj = responseObj.data as Record<string, unknown>;
          if ('id' in dataObj && 'title' in dataObj && 'userParticipation' in dataObj) {
            const { participant, isCertificateReady, ...challengeData } = dataObj;
            updatedChallenge = challengeData as unknown as CurrentChallengeResponse;
          }
        }
      }

      // Mettre à jour le cache React Query avec les nouvelles données du challenge
      if (updatedChallenge && user?.id) {
        queryClient.setQueryData(['currentChallenge', user.id], updatedChallenge);
      } else {
        // Fallback: invalider le cache pour forcer un refresh
        if (user?.id) {
          queryClient.invalidateQueries({ queryKey: ['currentChallenge', user.id] });
        }
      }

      // Retirer la transaction de la liste
      setChallengeTransactions(prev => prev.filter(t => t.id !== transactionId));

      // Rafraîchir les transactions pour avoir la liste à jour
      if (challengeId) {
        await fetchChallengeTransactions(challengeId);
      }
      
      // Afficher un message de succès
      toast.success('Transaction supprimée avec succès !');
      
    } catch (error) {
      toast.error('Erreur lors de la suppression de la transaction');
    } finally {
      setDeletingTransactionId(null);
    }
  };

  const getChallengeStatus = (): 'none' | 'upcoming' | 'active' | 'completed' => {
    if (!currentChallenge) {
      return 'none';
    }
    
    const now = new Date();
    const startDate = new Date(currentChallenge.startDate);
    const endDate = new Date(currentChallenge.endDate);
    
    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'active';
    return 'completed';
  };

  const getStatusBadge = () => {
    if (isChallengeCompleted) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
          <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="font-semibold">Complété</span>
        </Badge>
      );
    }
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
    if (!currentChallenge) return '';
    
    const now = new Date();
    const startDate = new Date(currentChallenge.startDate);
    const endDate = new Date(currentChallenge.endDate);
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
    if (!currentChallenge) {
      return false;
    }
    
    // Vérifier que nous avons les dates nécessaires
    if (!currentChallenge.startDate || !currentChallenge.endDate) {
      return false;
    }
    
    const status = getChallengeStatus();
    
    // Autoriser les transactions si le challenge est actif OU si le challenge est complété
    // L'utilisateur peut toujours faire des transactions même après avoir complété le challenge
    const canDeposit = status === 'active' || isChallengeCompleted;
    
    return canDeposit;
  };

  // Données pour les graphiques
  const chartData = challengeTransactions
    .map((transaction, index) => ({
      day: index + 1,
      amount: transaction.amount,
      cumulative: challengeTransactions
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
  if (!currentChallenge || !userParticipation) {
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
              Vous ne participez à aucun challenge
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
        className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <Trophy className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex-shrink-0 ${isChallengeCompleted ? 'text-yellow-500' : 'text-primary'}`} />
                <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-medium">
                  {isChallengeCompleted ? 'Challenge Complété' : 'Mon Challenge d\'Épargne'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 break-words">
                {currentChallenge?.title || 'Challenge d\'Épargne'}
              </h1>
              {currentChallenge?.description && (
                <p className="text-sm sm:text-base text-gray-600 mt-2 line-clamp-2">
                  {currentChallenge.description}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {getStatusBadge()}
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
                onClick={handleOpenHistoryModal}
              >
                <History className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Historique</span>
                <span className="sm:hidden">Hist.</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Challenge Completed Banner */}
        {isChallengeCompleted && (
          <motion.div
            variants={fadeInUp}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 sm:mb-6 lg:mb-8"
          >
            <Card className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-50 border-2 border-yellow-300 shadow-lg">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <Trophy className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 text-2xl sm:text-3xl animate-bounce">🎉</div>
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-900 mb-2">
                      🎊 Félicitations ! Challenge Complété 🎊
                    </h2>
                    <p className="text-sm sm:text-base lg:text-lg text-yellow-800 mb-3">
                      Vous avez atteint votre objectif d'épargne ! Votre détermination a porté ses fruits.
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                      {completionDate && (
                        <Badge variant="outline" className="bg-white/50 border-yellow-400 text-yellow-900 text-xs sm:text-sm">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Complété le {new Date(completionDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Badge>
                      )}
                      <Badge variant="outline" className="bg-white/50 border-yellow-400 text-yellow-900 text-xs sm:text-sm">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {challengeGoal?.progress?.toFixed(0) || 100}% atteint
                      </Badge>
                      <Badge variant="outline" className="bg-white/50 border-yellow-400 text-yellow-900 text-xs sm:text-sm">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {userParticipation?.currentAmount.toLocaleString() || 0}€ épargnés
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div variants={staggerContainer} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <motion.div variants={fadeInUp}>
            <Card className={isChallengeCompleted ? 'border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50' : ''}>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${isChallengeCompleted ? 'bg-yellow-400' : 'bg-green-100'}`}>
                    <DollarSign className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${isChallengeCompleted ? 'text-white' : 'text-green-600'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm truncate ${isChallengeCompleted ? 'text-yellow-800 font-medium' : 'text-gray-600'}`}>
                      Épargné {isChallengeCompleted && '✓'}
                    </p>
                    <p className={`text-lg sm:text-xl lg:text-2xl font-bold truncate ${isChallengeCompleted ? 'text-yellow-900' : ''}`}>
                      {userParticipation?.currentAmount.toLocaleString() || 0}€
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Objectif</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{challengeGoal?.targetAmount.toLocaleString() || 0}€</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className={isChallengeCompleted ? 'border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50' : ''}>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${isChallengeCompleted ? 'bg-yellow-400' : 'bg-purple-100'}`}>
                    <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${isChallengeCompleted ? 'text-white' : 'text-purple-600'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm truncate ${isChallengeCompleted ? 'text-yellow-800 font-medium' : 'text-gray-600'}`}>
                      Progression {isChallengeCompleted && '✓'}
                    </p>
                    <p className={`text-lg sm:text-xl lg:text-2xl font-bold truncate ${isChallengeCompleted ? 'text-yellow-900' : ''}`}>
                      {challengeGoal?.progress.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Temps restant</p>
                    <p className="text-xs sm:text-sm font-semibold truncate">{getTimeInfo()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Progress Section */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Progression</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={isChallengeCompleted ? 'font-semibold text-yellow-700' : ''}>
                      {isChallengeCompleted ? '✅ Objectif atteint !' : 'Progression vers l\'objectif'}
                    </span>
                    <span className={`font-semibold ${isChallengeCompleted ? 'text-yellow-700' : ''}`}>
                      {challengeGoal?.progress.toFixed(1) || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={isChallengeCompleted ? 100 : (challengeGoal?.progress || 0)} 
                    className={`h-3 ${isChallengeCompleted ? 'bg-yellow-200' : ''}`}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className={isChallengeCompleted ? 'font-semibold text-yellow-700' : ''}>
                      {userParticipation?.currentAmount.toLocaleString() || 0}€
                      {isChallengeCompleted && ' ✓'}
                    </span>
                    <span>{challengeGoal?.targetAmount.toLocaleString() || 0}€</span>
                  </div>
                </div>

                {/* Chart */}
                {chartData.length > 0 ? (
                  <div className="h-48 sm:h-56 lg:h-64 w-full overflow-x-auto">
                    <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="day" 
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          width={50}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`${value.toLocaleString()}€`, 'Montant cumulé']}
                          labelFormatter={(label: number) => `Transaction ${label}`}
                          contentStyle={{ fontSize: '12px' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cumulative" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 sm:h-56 lg:h-64 w-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-gray-500">
                        Aucune transaction pour le moment
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Le graphique s'affichera après votre première transaction
                      </p>
                    </div>
                  </div>
                )}


                {/* Quick Actions */}
                <div className="space-y-3">
                  {isChallengeCompleted && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 rounded-lg p-3 sm:p-4 mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm sm:text-base font-semibold text-yellow-900 mb-1">
                            Challenge réussi !
                          </p>
                          <p className="text-xs sm:text-sm text-yellow-800">
                            Votre objectif est atteint. Vous pouvez continuer à ajouter des transactions si vous le souhaitez, voir vos statistiques et votre historique.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button 
                      onClick={() => setIsAddTransactionModalOpen(true)}
                      disabled={!canMakeDeposit()}
                      className="flex-1 text-sm sm:text-base"
                      size="sm"
                      title={!canMakeDeposit() ? `Bouton désactivé - Status: ${getChallengeStatus()}` : 'Ajouter une transaction'}
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Nouvelle transaction</span>
                      <span className="sm:hidden">Transaction</span>
                    </Button>
                  <Button 
                    variant="outline"
                      onClick={() => {
                        const challengeId = currentChallenge?.id || '';
                        if (challengeId) {
                          window.location.href = `/user-dashboard/collective-progress?challengeId=${challengeId}`;
                        } else {
                          toast.error('Erreur: ID du challenge manquant.');
                        }
                      }}
                      className="flex-1 text-sm sm:text-base"
                      size="sm"
                  >
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden md:inline">Progression collective</span>
                      <span className="md:hidden">Collective</span>
                  </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setIsAbandonModalOpen(true)}
                      className="flex-1 text-sm sm:text-base"
                      size="sm"
                    >
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Abandonner
                    </Button>
                  </div>
                  
                  {/* Message d'information si le bouton est désactivé */}
                  {(!canMakeDeposit() || isChallengeCompleted) && (
                    <div className={`border rounded-lg p-2 sm:p-3 ${isChallengeCompleted ? 'bg-yellow-50 border-yellow-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex items-start space-x-2">
                        {isChallengeCompleted ? (
                          <CheckCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-xs sm:text-sm leading-relaxed ${isChallengeCompleted ? 'text-yellow-800' : 'text-amber-800'}`}>
                          {isChallengeCompleted
                            ? '🎉 Félicitations ! Votre challenge est complété. Vous avez atteint votre objectif d\'épargne. Vous pouvez consulter vos statistiques et télécharger votre certificat de réussite.'
                            : !currentChallenge?.startDate || !currentChallenge?.endDate
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
          <motion.div variants={fadeInUp} className="space-y-4 sm:space-y-6">
            {/* Challenge Info */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Informations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Mode</span>
                  <Badge variant={userParticipation?.mode === 'FORCED' ? 'default' : 'outline'}>
                    {userParticipation?.mode === 'FORCED' ? 'Forcé' : 'Libre'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Début</span>
                  <span>{currentChallenge ? new Date(currentChallenge.startDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fin</span>
                  <span>{currentChallenge ? new Date(currentChallenge.endDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                  <span className="text-gray-600 flex-shrink-0">Dernière transaction</span>
                  <span className="text-right truncate ml-2">
                    {challengeTransactions.length > 0
                      ? formatDistanceToNow(new Date(challengeTransactions[0].date), { addSuffix: true, locale: fr })
                      : 'Aucune'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Rewards */}
            {currentChallenge?.rewards && currentChallenge.rewards.length > 0 && (
              <Card className={isChallengeCompleted ? 'border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50' : ''}>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <Award className={`w-4 h-4 sm:w-5 sm:h-5 ${isChallengeCompleted ? 'text-yellow-600' : ''}`} />
                    <span>{isChallengeCompleted ? 'Récompenses Débloquées' : 'Récompenses'}</span>
                    {isChallengeCompleted && (
                      <Badge className="ml-2 bg-yellow-500 text-white">
                        <Trophy className="w-3 h-3 mr-1" />
                        Débloqué
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-2">
                    {currentChallenge.rewards.map((reward, index) => (
                      <div key={index} className={`flex items-center space-x-2 p-2 rounded-lg ${isChallengeCompleted ? 'bg-white/50' : ''}`}>
                        <CheckCircle className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${isChallengeCompleted ? 'text-yellow-600' : 'text-green-600'}`} />
                        <span className={`text-xs sm:text-sm break-words ${isChallengeCompleted ? 'font-medium text-yellow-900' : ''}`}>{reward}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certificate Download Section - Si challenge complété */}
            {isChallengeCompleted && (
              <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                    <span>Certificat de Réussite</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3">
                  <p className="text-xs sm:text-sm text-yellow-800">
                    {isCertificateReady
                      ? '🎊 Votre certificat de réussite est disponible !'
                      : 'Votre certificat sera disponible prochainement. Consultez vos ressources pour le récupérer.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs sm:text-sm border-yellow-400 text-yellow-900 hover:bg-yellow-100"
                      onClick={() => window.location.href = '/user-dashboard/my-resources'}
                    >
                      <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Voir mes ressources
                    </Button>
                    {isCertificateReady && certificateResourceId && (
                      <Button
                        size="sm"
                        className="flex-1 text-xs sm:text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                        onClick={async () => {
                          if (certificateResourceId) {
                            try {
                              await downloadUserResource(certificateResourceId);
                              toast.success('Certificat téléchargé avec succès !');
                            } catch (error) {
                              toast.error('Erreur lors du téléchargement du certificat');
                            }
                          }
                        }}
                      >
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Télécharger
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Transactions */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <History className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Dernières transactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {challengeTransactions
                    .slice(0, 5)
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between text-xs sm:text-sm gap-2 group">
                        <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
                          {transaction.type === 'deposit' ? (
                            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                          )}
                          <span className="truncate min-w-0">{transaction.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold flex-shrink-0 ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount}€
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 sm:h-7 sm:w-7 text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            disabled={deletingTransactionId === transaction.id}
                            title="Supprimer cette transaction"
                          >
                            {deletingTransactionId === transaction.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-600 border-t-transparent"></div>
                            ) : (
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  {challengeTransactions.length === 0 && (
                    <p className="text-xs sm:text-sm text-gray-500 text-center py-2">Aucune transaction</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Add Transaction Modal */}
        <Dialog open={isAddTransactionModalOpen} onOpenChange={setIsAddTransactionModalOpen}>
          <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
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
          <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
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
          <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
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
              ) : challengeTransactions.length > 0 ? (
                challengeTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transaction) => (
                  <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-2 sm:gap-3">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      {transaction.type === 'deposit' ? (
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{transaction.description}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
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
                    <div className="flex items-center justify-end sm:justify-start gap-2 sm:gap-3">
                      <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right gap-2 sm:gap-1">
                        <p className={`font-semibold text-sm sm:text-base ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount}€
                        </p>
                        {transaction.isVerified && (
                          <Badge variant="outline" className="text-xs">Vérifié</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        disabled={deletingTransactionId === transaction.id}
                        title="Supprimer cette transaction"
                      >
                        {deletingTransactionId === transaction.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune transaction enregistrée</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        {/* Challenge Completed Modal */}
        <Dialog open={isChallengeCompletedModalOpen} onOpenChange={setIsChallengeCompletedModalOpen}>
          <DialogContent className="w-[95vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-center justify-center">
                <div className="relative">
                  <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 animate-bounce" />
                  <div className="absolute -top-2 -right-2 text-2xl animate-pulse">🎉</div>
                </div>
                <span className="text-xl sm:text-2xl">Félicitations !</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-center py-4">
              <div className="space-y-2">
                <p className="text-lg sm:text-xl font-semibold text-gray-900">
                  Vous avez complété votre challenge !
                </p>
                <p className="text-sm sm:text-base text-gray-600">
                  {currentChallenge?.title || 'Challenge d\'Épargne'}
                </p>
              </div>
              
              {isCertificateReady && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <p className="text-sm sm:text-base text-green-800">
                    🎊 Votre certificat de réussite est prêt à être téléchargé !
                  </p>
                </div>
              )}
              
              {!isCertificateReady && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-blue-800">
                    Votre certificat sera disponible prochainement. Consultez vos ressources pour le récupérer.
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <Button
                variant="outline"
                className="text-xs sm:text-sm"
                onClick={() => {
                  setIsChallengeCompletedModalOpen(false);
                  window.location.href = '/user-dashboard/resources';
                }}
              >
                Voir mes ressources
              </Button>
              {isCertificateReady && certificateResourceId && (
                <Button
                  className="text-xs sm:text-sm"
                  onClick={async () => {
                    if (certificateResourceId) {
                      try {
                        await downloadUserResource(certificateResourceId);
                        setIsChallengeCompletedModalOpen(false);
                        toast.success('Certificat téléchargé avec succès !');
                      } catch (error) {
                        toast.error('Erreur lors du téléchargement du certificat');
                      }
                    }
                  }}
                >
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Télécharger le certificat
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Certificate Modal (pour les cas non-complétés) */}
        <Dialog open={isCertificateModalOpen} onOpenChange={setIsCertificateModalOpen}>
          <DialogContent className="w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                Félicitations ! Votre certificat est prêt
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs sm:text-sm text-gray-600">
              <p>Téléchargez votre certificat de réussite maintenant ou consultez vos ressources.</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
                onClick={() => {
                  setIsCertificateModalOpen(false);
                  window.location.href = '/user-dashboard/my-resources';
                }}
              >
                Voir mes ressources
              </Button>
              {isCertificateAvailable && certificateResourceId && (
                <Button
                  size="sm"
                  className="text-xs sm:text-sm"
                  onClick={async () => {
                    if (certificateResourceId) {
                      try {
                      await downloadUserResource(certificateResourceId);
                        setIsCertificateModalOpen(false);
                        toast.success('Certificat téléchargé avec succès !');
                      } catch (error) {
                        toast.error('Erreur lors du téléchargement du certificat');
                      }
                    }
                  }}
                >
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Télécharger
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default MyChallenge;
