import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    SavingsChallenge,
    ChallengeParticipant,
    ChallengeTransaction,
    ChallengeGoal,
    ChallengeAbandonment,
    ChallengeStats,
    UserChallengeHistory
} from '@/types/challenge';

interface ChallengeState {
  // Challenges
  challenges: SavingsChallenge[];
  userChallenges: SavingsChallenge[];
  currentChallenge: SavingsChallenge | null;
  
  // Participations
  userParticipations: ChallengeParticipant[];
  currentParticipation: ChallengeParticipant | null;
  
  // Transactions
  challengeTransactions: ChallengeTransaction[];
  
  // Goals
  challengeGoals: ChallengeGoal[];
  
  // Abandonments
  challengeAbandonments: ChallengeAbandonment[];
  
  // Stats
  challengeStats: ChallengeStats | null;
  userChallengeHistory: UserChallengeHistory | null;
  
  // Loading states
  isLoading: boolean;
  isJoiningChallenge: boolean;
  isAddingTransaction: boolean;
  
  // Actions
  fetchChallenges: () => Promise<void>;
  fetchUserChallenges: (userId: string) => Promise<void>;
  fetchUserParticipations: (userId: string) => Promise<void>;
  fetchChallengeTransactions: (challengeId: string, participantId: string) => Promise<void>;
  createChallenge: (challenge: Omit<SavingsChallenge, 'id' | 'createdAt' | 'updatedAt' | 'participants' | 'participantsList'>) => void;
  updateChallenge: (challengeId: string, updates: Partial<Omit<SavingsChallenge, 'id' | 'createdAt' | 'participants' | 'participantsList'>>) => Promise<boolean>;
  deleteChallenge: (challengeId: string) => Promise<boolean>;
  joinChallenge: (challengeId: string, goalData: { targetAmount: number; mode: 'free' | 'forced'; bankAccountId?: string }) => Promise<boolean>;
  leaveChallenge: (challengeId: string, reason?: string) => Promise<boolean>;
  abandonChallenge: (challengeId: string, reason: string, reasonCategory: 'financial_difficulty' | 'lost_interest' | 'found_better_challenge' | 'personal_issues' | 'other', additionalComments?: string) => Promise<boolean>;
  
  // Transactions
  addChallengeTransaction: (transaction: Omit<ChallengeTransaction, 'id' | 'createdAt'>) => Promise<boolean>;
  
  // Goals
  updateChallengeGoal: (goalId: string, updates: Partial<ChallengeGoal>) => void;
  
  // Stats
  fetchChallengeStats: () => Promise<void>;
  fetchUserChallengeHistory: (userId: string) => Promise<void>;
  
  // Utils
  canJoinChallenge: (challengeId: string, userId: string) => boolean;
  canMakeTransaction: (challengeId: string, userId: string) => boolean;
  getChallengeStatus: (challengeId: string) => 'upcoming' | 'active' | 'completed' | 'cancelled';
  getParticipantStatus: (challengeId: string, userId: string) => 'not_joined' | 'upcoming' | 'active' | 'abandoned' | 'completed';
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      challenges: [],
      userChallenges: [],
      currentChallenge: null,
      userParticipations: [],
      currentParticipation: null,
      challengeTransactions: [],
      challengeGoals: [],
      challengeAbandonments: [],
      challengeStats: null,
      userChallengeHistory: null,
      isLoading: false,
      isJoiningChallenge: false,
      isAddingTransaction: false,

      fetchChallenges: async () => {
        set({ isLoading: true });
        try {
          // Mock data - dans une vraie app, ceci ferait un appel API
          const mockChallenges: SavingsChallenge[] = [
            {
              id: '1',
              title: 'Défi Épargne de Noël 2024',
              description: 'Économisez 500€ pour les fêtes de fin d\'année. Un défi parfait pour préparer vos vacances !',
              type: 'monthly',
              targetAmount: 500,
              duration: 30,
              startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
              endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(), // Dans 37 jours
              isActive: true,
              createdBy: 'admin',
              createdByName: 'Administration',
              rewards: ['Badge Économiste', 'Certificat de réussite', 'Points bonus'],
              maxParticipants: 100,
              participants: 0,
              participantsList: [],
              status: 'upcoming',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '2',
              title: 'Challenge 52 semaines',
              description: 'Épargnez progressivement : 1€ la première semaine, 2€ la deuxième, etc. Un total de 1378€ en un an !',
              type: 'weekly',
              targetAmount: 1378,
              duration: 365,
              startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
              endDate: new Date(Date.now() + 372 * 24 * 60 * 60 * 1000).toISOString(),
              isActive: true,
              createdBy: 'admin',
              createdByName: 'Administration',
              rewards: ['Badge Persévérance', 'Trophée 52 semaines', 'Certificat spécial'],
              maxParticipants: 50,
              participants: 0,
              participantsList: [],
              status: 'upcoming',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '3',
              title: 'Défi Vacances d\'été',
              description: 'Préparez vos vacances d\'été en épargnant 2000€ sur 6 mois',
              type: 'monthly',
              targetAmount: 2000,
              duration: 180,
              startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Dans 14 jours
              endDate: new Date(Date.now() + 194 * 24 * 60 * 60 * 1000).toISOString(), // Dans 194 jours
              isActive: true,
              createdBy: 'admin',
              createdByName: 'Administration',
              rewards: ['Badge Vacancier', 'Guide de voyage', 'Réduction partenaires'],
              maxParticipants: 200,
              participants: 0,
              participantsList: [],
              status: 'upcoming',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          ];

          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ challenges: mockChallenges, isLoading: false });
        } catch (error) {
          console.error('Error fetching challenges:', error);
          set({ isLoading: false });
        }
      },

      fetchUserChallenges: async (userId: string) => {
        set({ isLoading: true });
        try {
          // Mock data - dans une vraie app, ceci ferait un appel API
          const { challenges, userParticipations } = get();
          const userChallengeIds = userParticipations
            .filter(p => p.userId === userId)
            .map(p => p.challengeId);
          
          const userChallenges = challenges.filter(c => userChallengeIds.includes(c.id));
          
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ userChallenges, isLoading: false });
        } catch (error) {
          console.error('Error fetching user challenges:', error);
          set({ isLoading: false });
        }
      },

      fetchUserParticipations: async (userId: string) => {
        set({ isLoading: true });
        try {
          // S'assurer que les challenges sont chargés d'abord
          const { challenges } = get();
          if (challenges.length === 0) {
            await get().fetchChallenges();
          }
          
          // Mock data - dans une vraie app, ceci ferait un appel API
          // L'utilisateur n'a aucun challenge par défaut
          const mockParticipations: (ChallengeParticipant & { challenge?: SavingsChallenge })[] = [];

          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('fetchUserParticipations: Created participations', { userId, mockParticipations });
          set({ userParticipations: mockParticipations, isLoading: false });
        } catch (error) {
          console.error('Error fetching user participations:', error);
          set({ isLoading: false });
        }
      },

      fetchChallengeTransactions: async (challengeId: string, participantId: string) => {
        try {
          // Mock data - dans une vraie app, ceci ferait un appel API
          // Aucune transaction par défaut
          const mockTransactions: ChallengeTransaction[] = [];

          await new Promise(resolve => setTimeout(resolve, 300));
          set({ challengeTransactions: mockTransactions });
        } catch (error) {
          console.error('Error fetching challenge transactions:', error);
        }
      },

      createChallenge: (challengeData) => {
        const newChallenge: SavingsChallenge = {
          ...challengeData,
          id: Date.now().toString(),
          participants: 0,
          participantsList: [],
          status: 'upcoming',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          challenges: [newChallenge, ...state.challenges]
        }));
      },

      updateChallenge: async (challengeId, updates) => {
        try {
          const { challenges } = get();
          const challenge = challenges.find(c => c.id === challengeId);
          
          if (!challenge) {
            throw new Error('Challenge not found');
          }

          // Vérifier si le challenge peut être modifié
          const now = new Date();
          const startDate = new Date(challenge.startDate);
          
          // Si le challenge a déjà commencé, on ne peut modifier que certains champs
          if (now >= startDate && updates.startDate) {
            throw new Error('Cannot modify start date of an active challenge');
          }

          const updatedChallenge: SavingsChallenge = {
            ...challenge,
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            challenges: state.challenges.map(c => 
              c.id === challengeId ? updatedChallenge : c
            )
          }));

          return true;
        } catch (error) {
          console.error('Error updating challenge:', error);
          return false;
        }
      },

      deleteChallenge: async (challengeId) => {
        try {
          const { challenges } = get();
          const challenge = challenges.find(c => c.id === challengeId);
          
          if (!challenge) {
            throw new Error('Challenge not found');
          }

          // Vérifier si le challenge peut être supprimé
          const now = new Date();
          const startDate = new Date(challenge.startDate);
          
          // Si le challenge a déjà commencé, on ne peut pas le supprimer
          if (now >= startDate) {
            throw new Error('Cannot delete an active or completed challenge');
          }

          set((state) => ({
            challenges: state.challenges.filter(c => c.id !== challengeId)
          }));

          return true;
        } catch (error) {
          console.error('Error deleting challenge:', error);
          return false;
        }
      },

      joinChallenge: async (challengeId, goalData) => {
        set({ isJoiningChallenge: true });
        try {
          const { challenges, userParticipations } = get();
          const challenge = challenges.find(c => c.id === challengeId);
          
          if (!challenge) {
            throw new Error('Challenge not found');
          }

          // Vérifier si l'utilisateur peut rejoindre
          if (!get().canJoinChallenge(challengeId, 'current-user')) {
            throw new Error('Cannot join this challenge');
          }

          // Vérifier si l'utilisateur n'est pas déjà dans un challenge actif OU à venir
          const hasCurrentChallenge = userParticipations.some(p => 
            p.userId === 'current-user' && (p.status === 'active' || p.status === 'upcoming')
          );
          
          if (hasCurrentChallenge) {
            throw new Error('You are already participating in a challenge');
          }

          // Déterminer le statut de la participation en fonction du statut du challenge
          const now = new Date();
          const startDate = new Date(challenge.startDate);
          const endDate = new Date(challenge.endDate);
          const isUpcoming = now < startDate;
          const isActive = now >= startDate && now <= endDate;
          
          const participationStatus = isUpcoming ? 'upcoming' : isActive ? 'active' : 'completed';

          const newParticipation: ChallengeParticipant = {
            id: Date.now().toString(),
            userId: 'current-user',
            userName: 'Current User',
            challengeId,
            mode: goalData.mode,
            targetAmount: goalData.targetAmount,
            currentAmount: 0,
            progressPercentage: 0,
            bankAccountId: goalData.bankAccountId,
            joinedAt: new Date().toISOString(),
            status: participationStatus,
            transactions: [],
          };

          const newGoal: ChallengeGoal = {
            id: Date.now().toString(),
            challengeId,
            participantId: newParticipation.id,
            targetAmount: goalData.targetAmount,
            mode: goalData.mode,
            bankAccountId: goalData.bankAccountId,
            createdAt: new Date().toISOString(),
          };

          // Mettre à jour le challenge
          const updatedChallenge = {
            ...challenge,
            participants: challenge.participants + 1,
            participantsList: [...challenge.participantsList, newParticipation]
          };

          set((state) => ({
            challenges: state.challenges.map(c => c.id === challengeId ? updatedChallenge : c),
            userParticipations: [...state.userParticipations, newParticipation],
            challengeGoals: [...state.challengeGoals, newGoal],
            isJoiningChallenge: false
          }));

          return true;
        } catch (error) {
          console.error('Error joining challenge:', error);
          set({ isJoiningChallenge: false });
          return false;
        }
      },

      leaveChallenge: async (challengeId, reason) => {
        try {
          const { userParticipations } = get();
          const participation = userParticipations.find(p => 
            p.challengeId === challengeId && p.userId === 'current-user'
          );

          if (!participation) {
            throw new Error('Participation not found');
          }

          // Si le challenge n'a pas encore commencé, on peut simplement quitter
          const challenge = get().challenges.find(c => c.id === challengeId);
          const now = new Date();
          const startDate = new Date(challenge?.startDate || '');
          
          if (now < startDate) {
            // Challenge pas encore commencé - quitter simplement
            set((state) => ({
              userParticipations: state.userParticipations.filter(p => p.id !== participation.id),
              challenges: state.challenges.map(c => 
                c.id === challengeId 
                  ? { ...c, participants: Math.max(0, c.participants - 1) }
                  : c
              )
            }));
            return true;
          } else {
            // Challenge déjà commencé - c'est un abandon
            return get().abandonChallenge(challengeId, reason || 'User left', 'other');
          }
        } catch (error) {
          console.error('Error leaving challenge:', error);
          return false;
        }
      },

      abandonChallenge: async (challengeId, reason, reasonCategory, additionalComments) => {
        try {
          const { userParticipations } = get();
          const participation = userParticipations.find(p => 
            p.challengeId === challengeId && p.userId === 'current-user'
          );

          if (!participation) {
            throw new Error('Participation not found');
          }

          const abandonment: ChallengeAbandonment = {
            id: Date.now().toString(),
            challengeId,
            participantId: participation.id,
            reason,
            reasonCategory,
            additionalComments,
            abandonedAt: new Date().toISOString(),
          };

          set((state) => ({
            userParticipations: state.userParticipations.map(p => 
              p.id === participation.id 
                ? { ...p, status: 'abandoned', abandonmentReason: reason, abandonedAt: abandonment.abandonedAt }
                : p
            ),
            challengeAbandonments: [...state.challengeAbandonments, abandonment]
          }));

          return true;
        } catch (error) {
          console.error('Error abandoning challenge:', error);
          return false;
        }
      },

      addChallengeTransaction: async (transactionData) => {
        set({ isAddingTransaction: true });
        try {
          const { userParticipations } = get();
          const participation = userParticipations.find(p => 
            p.challengeId === transactionData.challengeId && 
            p.userId === 'current-user' &&
            p.status === 'active'
          );

          if (!participation) {
            throw new Error('Active participation not found');
          }

          // Vérifier si on peut faire des transactions
          if (!get().canMakeTransaction(transactionData.challengeId, 'current-user')) {
            throw new Error('Cannot make transactions for this challenge');
          }

          const newTransaction: ChallengeTransaction = {
            ...transactionData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          };

          // Mettre à jour le montant actuel
          const updatedAmount = participation.currentAmount + 
            (transactionData.type === 'deposit' ? transactionData.amount : -transactionData.amount);
          
          const updatedParticipation = {
            ...participation,
            currentAmount: Math.max(0, updatedAmount),
            progressPercentage: (Math.max(0, updatedAmount) / participation.targetAmount) * 100,
            lastTransactionAt: new Date().toISOString(),
            transactions: [...participation.transactions, newTransaction]
          };

          set((state) => ({
            userParticipations: state.userParticipations.map(p => 
              p.id === participation.id ? updatedParticipation : p
            ),
            challengeTransactions: [...state.challengeTransactions, newTransaction],
            isAddingTransaction: false
          }));

          return true;
        } catch (error) {
          console.error('Error adding transaction:', error);
          set({ isAddingTransaction: false });
          return false;
        }
      },

      updateChallengeGoal: (goalId, updates) => {
        set((state) => ({
          challengeGoals: state.challengeGoals.map(g => 
            g.id === goalId ? { ...g, ...updates } : g
          )
        }));
      },

      fetchChallengeStats: async () => {
        set({ isLoading: true });
        try {
          // Mock data - dans une vraie app, ceci ferait un appel API
          const mockStats: ChallengeStats = {
            totalChallenges: 15,
            activeChallenges: 8,
            completedChallenges: 5,
            totalParticipants: 234,
            totalAmountSaved: 125000,
            averageCompletionRate: 68.5,
            mostPopularType: 'monthly',
            averageChallengeDuration: 45
          };

          await new Promise(resolve => setTimeout(resolve, 800));
          set({ challengeStats: mockStats, isLoading: false });
        } catch (error) {
          console.error('Error fetching stats:', error);
          set({ isLoading: false });
        }
      },

      fetchUserChallengeHistory: async (userId) => {
        set({ isLoading: true });
        try {
          // Mock data - dans une vraie app, ceci ferait un appel API
          const mockHistory: UserChallengeHistory = {
            userId,
            challenges: [],
            totalSaved: 2500,
            totalChallenges: 3,
            completedChallenges: 2,
            abandonedChallenges: 1,
            averageCompletionRate: 66.7
          };

          await new Promise(resolve => setTimeout(resolve, 600));
          set({ userChallengeHistory: mockHistory, isLoading: false });
        } catch (error) {
          console.error('Error fetching user history:', error);
          set({ isLoading: false });
        }
      },

      // Utils
      canJoinChallenge: (challengeId, userId) => {
        const challenge = get().challenges.find(c => c.id === challengeId);
        if (!challenge) return false;

        const now = new Date();
        const startDate = new Date(challenge.startDate);
        const endDate = new Date(challenge.endDate);
        
        // On ne peut rejoindre que si le challenge n'a pas encore commencé OU s'il est actif
        // mais pas s'il est terminé
        const isUpcoming = now < startDate;
        const isActive = now >= startDate && now <= endDate;
        
        return isUpcoming || isActive;
      },

      canMakeTransaction: (challengeId, userId) => {
        const challenge = get().challenges.find(c => c.id === challengeId);
        if (!challenge) return false;

        const now = new Date();
        const startDate = new Date(challenge.startDate);
        const endDate = new Date(challenge.endDate);
        
        // On peut faire des transactions seulement pendant la période active
        return now >= startDate && now <= endDate;
      },

      getChallengeStatus: (challengeId) => {
        const challenge = get().challenges.find(c => c.id === challengeId);
        if (!challenge) return 'cancelled';

        const now = new Date();
        const startDate = new Date(challenge.startDate);
        const endDate = new Date(challenge.endDate);

        if (now < startDate) return 'upcoming';
        if (now > endDate) return 'completed';
        return 'active';
      },

      getParticipantStatus: (challengeId, userId) => {
        const participation = get().userParticipations.find(p => 
          p.challengeId === challengeId && p.userId === userId
        );
        
        if (!participation) return 'not_joined';
        return participation.status;
      },
    }),
    {
      name: 'challenge-storage',
      partialize: (state) => ({
        challenges: state.challenges,
        userParticipations: state.userParticipations,
        challengeTransactions: state.challengeTransactions,
        challengeGoals: state.challengeGoals,
        challengeAbandonments: state.challengeAbandonments,
      }),
    }
  )
);
