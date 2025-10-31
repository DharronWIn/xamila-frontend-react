import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    Defi,
    DefiParticipant,
    DefiTransaction,
    DefiGoal,
    DefiStats,
    UserDefiStats,
    CreateDefiDto,
    UpdateDefiDto,
    JoinDefiDto,
    AddTransactionDto,
    AbandonDefiDto,
    ConfigureGoalDto,
    DefiQueryParams
} from '@/types/defi';
import { api } from '@/lib/apiComponent/apiClient';
import { defiEndpoints, userDefiEndpoints } from '@/lib/apiComponent/endpoints';

interface DefiState {
  // Defis
  defis: Defi[];
  currentDefi: Defi | null;
  userDefis: Defi[];
  
  // Participants
  participants: DefiParticipant[];
  currentParticipation: DefiParticipant | null;
  
  // Transactions
  transactions: DefiTransaction[];
  
  // Goals
  currentGoal: DefiGoal | null;
  
  // Stats
  defiStats: DefiStats | null;
  userDefiStats: UserDefiStats | null;
  
  // Loading states
  isLoading: boolean;
  isJoining: boolean;
  isCreating: boolean;
  isAddingTransaction: boolean;
  
  // Error
  error: string | null;
  
  // Actions - Defis
  fetchDefis: (params?: DefiQueryParams) => Promise<void>;
  fetchDefiById: (id: string) => Promise<void>;
  createDefi: (defiData: CreateDefiDto) => Promise<Defi | null>;
  updateDefi: (id: string, defiData: UpdateDefiDto) => Promise<Defi | null>;
  deleteDefi: (id: string) => Promise<boolean>;
  
  // Actions - Participants
  fetchParticipants: (defiId: string) => Promise<void>;
  joinDefi: (defiId: string, joinData: JoinDefiDto) => Promise<boolean>;
  leaveDefi: (defiId: string) => Promise<boolean>;
  abandonDefi: (defiId: string, abandonData: AbandonDefiDto) => Promise<boolean>;
  
  // Actions - Transactions
  fetchTransactions: (defiId: string) => Promise<void>;
  addTransaction: (defiId: string, transactionData: AddTransactionDto) => Promise<boolean>;
  
  // Actions - Goals
  fetchMyGoal: (defiId: string) => Promise<void>;
  configureGoal: (defiId: string, goalData: ConfigureGoalDto) => Promise<boolean>;
  
  // Actions - Stats
  fetchDefiStats: () => Promise<void>;
  fetchUserDefiStats: (userId: string) => Promise<void>;
  fetchUserDefis: (userId: string, status?: 'ACTIVE' | 'COMPLETED' | 'ABANDONED') => Promise<void>;
  
  // Utils
  clearError: () => void;
  clearCurrentDefi: () => void;
}

export const useDefiStore = create<DefiState>()(
  persist(
    (set, get) => ({
      // Initial state
      defis: [],
      currentDefi: null,
      userDefis: [],
      participants: [],
      currentParticipation: null,
      transactions: [],
      currentGoal: null,
      defiStats: null,
      userDefiStats: null,
      isLoading: false,
      isJoining: false,
      isCreating: false,
      isAddingTransaction: false,
      error: null,

      // Actions - Defis
      fetchDefis: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          if (params?.type) queryParams.append('type', params.type);
          if (params?.status) queryParams.append('status', params.status);
          if (params?.search) queryParams.append('search', params.search);
          if (params?.page) queryParams.append('page', params.page.toString());
          if (params?.limit) queryParams.append('limit', params.limit.toString());
          if (params?.createdBy) queryParams.append('createdBy', params.createdBy);
          if (params?.isOfficial !== undefined) queryParams.append('isOfficial', params.isOfficial.toString());

          const url = `${defiEndpoints.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
          const response = await api.get<{ data: Defi[]; meta?: unknown }>(url, { isPublicRoute: true });
          
          // Handle different response structures
          let defisData: Defi[] = [];
          if (Array.isArray(response)) {
            defisData = response;
          } else if (response && typeof response === 'object' && 'data' in response) {
            defisData = response.data;
          }
          
          set({ defis: defisData, isLoading: false });
        } catch (error) {
          console.error('Error fetching defis:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch defis',
            isLoading: false 
          });
        }
      },

      fetchDefiById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const defi = await api.get<Defi>(defiEndpoints.details(id), { isPublicRoute: true });
          set({ currentDefi: defi, isLoading: false });
        } catch (error) {
          console.error('Error fetching defi:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch defi',
            isLoading: false 
          });
        }
      },

      createDefi: async (defiData) => {
        set({ isCreating: true, error: null });
        try {
          const response = await api.post<{ message: string; data: Defi }, CreateDefiDto>(
            defiEndpoints.create,
            defiData
          );
          
          // Extract the defi from response
          const defi = response && typeof response === 'object' && 'data' in response 
            ? response.data 
            : response as unknown as Defi;
          
          set((state) => ({
            defis: [defi, ...state.defis],
            isCreating: false
          }));
          
          return defi;
        } catch (error) {
          console.error('Error creating defi:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create defi',
            isCreating: false 
          });
          return null;
        }
      },

      updateDefi: async (id, defiData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put<{ message: string; data: Defi }, UpdateDefiDto>(
            defiEndpoints.update(id),
            defiData
          );
          
          // Extract the defi from response
          const defi = response && typeof response === 'object' && 'data' in response 
            ? response.data 
            : response as unknown as Defi;
          
          set((state) => ({
            defis: state.defis.map(d => d.id === id ? defi : d),
            currentDefi: state.currentDefi?.id === id ? defi : state.currentDefi,
            isLoading: false
          }));
          
          return defi;
        } catch (error) {
          console.error('Error updating defi:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update defi',
            isLoading: false 
          });
          return null;
        }
      },

      deleteDefi: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(defiEndpoints.delete(id));
          
          set((state) => ({
            defis: state.defis.filter(d => d.id !== id),
            currentDefi: state.currentDefi?.id === id ? null : state.currentDefi,
            isLoading: false
          }));
          
          return true;
        } catch (error) {
          console.error('Error deleting defi:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete defi',
            isLoading: false 
          });
          return false;
        }
      },

      // Actions - Participants
      fetchParticipants: async (defiId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get<{ data: DefiParticipant[]; total: number }>(
            defiEndpoints.participants(defiId),
            { isPublicRoute: true }
          );
          
          // Handle different response structures
          let participantsData: DefiParticipant[] = [];
          if (Array.isArray(response)) {
            participantsData = response;
          } else if (response && typeof response === 'object' && 'data' in response) {
            participantsData = response.data;
          }
          
          set({ participants: participantsData, isLoading: false });
        } catch (error) {
          console.error('Error fetching participants:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch participants',
            isLoading: false 
          });
        }
      },

      joinDefi: async (defiId, joinData) => {
        set({ isJoining: true, error: null });
        try {
          const response = await api.post<{ message: string; data: { participant: DefiParticipant; goal?: DefiGoal } }, JoinDefiDto>(
            defiEndpoints.joinDefi(defiId),
            joinData
          );
          
          const { participant, goal } = response.data;
          
          set((state) => ({
            currentParticipation: participant,
            currentGoal: goal || null,
            isJoining: false
          }));
          
          // Refresh the current defi
          await get().fetchDefiById(defiId);
          
          return true;
        } catch (error) {
          console.error('Error joining defi:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to join defi',
            isJoining: false 
          });
          return false;
        }
      },

      leaveDefi: async (defiId) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(defiEndpoints.leaveDefi(defiId));
          
          set({
            currentParticipation: null,
            currentGoal: null,
            isLoading: false
          });
          
          // Refresh the current defi
          await get().fetchDefiById(defiId);
          
          return true;
        } catch (error) {
          console.error('Error leaving defi:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to leave defi',
            isLoading: false 
          });
          return false;
        }
      },

      abandonDefi: async (defiId, abandonData) => {
        set({ isLoading: true, error: null });
        try {
          await api.post<{ message: string }, AbandonDefiDto>(
            defiEndpoints.abandonDefi(defiId),
            abandonData
          );
          
          set((state) => ({
            currentParticipation: state.currentParticipation 
              ? { ...state.currentParticipation, status: 'ABANDONED' as const }
              : null,
            isLoading: false
          }));
          
          // Refresh the current defi
          await get().fetchDefiById(defiId);
          
          return true;
        } catch (error) {
          console.error('Error abandoning defi:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to abandon defi',
            isLoading: false 
          });
          return false;
        }
      },

      // Actions - Transactions
      fetchTransactions: async (defiId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get<{ data: DefiTransaction[]; total: number }>(
            defiEndpoints.transactions(defiId)
          );
          
          // Handle different response structures
          let transactionsData: DefiTransaction[] = [];
          if (Array.isArray(response)) {
            transactionsData = response;
          } else if (response && typeof response === 'object' && 'data' in response) {
            transactionsData = response.data;
          }
          
          set({ transactions: transactionsData, isLoading: false });
        } catch (error) {
          console.error('Error fetching transactions:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch transactions',
            isLoading: false 
          });
        }
      },

      addTransaction: async (defiId, transactionData) => {
        set({ isAddingTransaction: true, error: null });
        try {
          const response = await api.post<{ message: string; data: DefiTransaction; newBalance: number }, AddTransactionDto>(
            defiEndpoints.addTransaction(defiId),
            transactionData
          );
          
          const transaction = response.data;
          
          set((state) => ({
            transactions: [transaction, ...state.transactions],
            currentParticipation: state.currentParticipation
              ? { ...state.currentParticipation, currentAmount: response.newBalance }
              : null,
            isAddingTransaction: false
          }));
          
          // Refresh the current defi and goal
          await get().fetchDefiById(defiId);
          await get().fetchMyGoal(defiId);
          
          return true;
        } catch (error) {
          console.error('Error adding transaction:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add transaction',
            isAddingTransaction: false 
          });
          return false;
        }
      },

      // Actions - Goals
      fetchMyGoal: async (defiId) => {
        set({ isLoading: true, error: null });
        try {
          const goal = await api.get<DefiGoal>(defiEndpoints.myGoal(defiId));
          set({ currentGoal: goal, isLoading: false });
        } catch (error) {
          console.error('Error fetching goal:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch goal',
            isLoading: false 
          });
        }
      },

      configureGoal: async (defiId, goalData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<{ message: string; data: { participant: DefiParticipant; goal: DefiGoal } }, ConfigureGoalDto>(
            defiEndpoints.configureGoal(defiId),
            goalData
          );
          
          const { goal } = response.data;
          
          set({ currentGoal: goal, isLoading: false });
          
          return true;
        } catch (error) {
          console.error('Error configuring goal:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to configure goal',
            isLoading: false 
          });
          return false;
        }
      },

      // Actions - Stats
      fetchDefiStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const stats = await api.get<DefiStats>(defiEndpoints.stats, { isPublicRoute: true });
          set({ defiStats: stats, isLoading: false });
        } catch (error) {
          console.error('Error fetching defi stats:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch stats',
            isLoading: false 
          });
        }
      },

      fetchUserDefiStats: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const stats = await api.get<UserDefiStats>(userDefiEndpoints.defiStats(userId));
          set({ userDefiStats: stats, isLoading: false });
        } catch (error) {
          console.error('Error fetching user defi stats:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch user stats',
            isLoading: false 
          });
        }
      },

      fetchUserDefis: async (userId, status) => {
        set({ isLoading: true, error: null });
        try {
          const queryParams = status ? `?status=${status}` : '';
          const response = await api.get<{ data: Defi[]; total: number }>(
            `${userDefiEndpoints.userDefis(userId)}${queryParams}`
          );
          
          // Handle different response structures
          let defisData: Defi[] = [];
          if (Array.isArray(response)) {
            defisData = response;
          } else if (response && typeof response === 'object' && 'data' in response) {
            defisData = response.data;
          }
          
          set({ userDefis: defisData, isLoading: false });
        } catch (error) {
          console.error('Error fetching user defis:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch user defis',
            isLoading: false 
          });
        }
      },

      // Utils
      clearError: () => set({ error: null }),
      clearCurrentDefi: () => set({ currentDefi: null, currentParticipation: null, currentGoal: null }),
    }),
    {
      name: 'defi-storage',
      partialize: (state) => ({
        defis: state.defis,
        userDefis: state.userDefis,
      }),
    }
  )
);

