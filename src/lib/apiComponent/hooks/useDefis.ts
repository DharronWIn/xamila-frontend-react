import { useState, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '../apiClient';
import { defiEndpoints, userDefiEndpoints } from '../endpoints';
import type {
    Defi,
    DefiQueryParams,
    CreateDefiDto,
    UpdateDefiDto,
    JoinDefiDto,
    AddTransactionDto,
    AbandonDefiDto,
    UpdateGoalDto,
    ConfigureGoalDto,
    DefiParticipant,
    DefiTransaction,
    DefiStats,
    UserDefiStats,
    PaginatedDefiResponse,
    DefiResponse,
    ParticipantResponse,
    TransactionResponse,
    TransactionStatsResponse,
    DefiGoal
} from '@/types/defi';

// ==================== DEFIS HOOKS ====================

export const useDefis = () => {
  const [defis, setDefis] = useState<Defi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDefis = useCallback(async (params?: DefiQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.createdBy) queryParams.append('createdBy', params.createdBy);
      if (params?.isOfficial !== undefined) queryParams.append('isOfficial', params.isOfficial.toString());

      const url = `${defiEndpoints.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<PaginatedDefiResponse>(url, { isPublicRoute: true });
      
      // Handle different response structures
      let defisData: Defi[] = [];
      if (Array.isArray(response)) {
        defisData = response;
      } else if (response && typeof response === 'object') {
        if ('data' in response && Array.isArray(response.data)) {
          defisData = response.data;
        }
      }
      
      setDefis(defisData);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch defis');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDefiById = useCallback(async (id: string): Promise<Defi> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<Defi>(defiEndpoints.details(id), { isPublicRoute: true });
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch defi');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDefi = useCallback(async (defiData: CreateDefiDto): Promise<Defi> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post<DefiResponse, CreateDefiDto>(defiEndpoints.create, defiData);
      
      // Extract the defi from the response
      let defi: Defi;
      if (response && typeof response === 'object' && 'data' in response) {
        defi = response.data;
      } else {
        defi = response as unknown as Defi;
      }
      
      return defi;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create defi');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDefi = useCallback(async (id: string, defiData: UpdateDefiDto): Promise<Defi> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.put<DefiResponse, UpdateDefiDto>(defiEndpoints.update(id), defiData);
      
      // Extract the defi from the response
      let defi: Defi;
      if (response && typeof response === 'object' && 'data' in response) {
        defi = response.data;
      } else {
        defi = response as unknown as Defi;
      }
      
      return defi;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update defi');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDefi = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(defiEndpoints.delete(id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete defi');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDefiStats = useCallback(async (): Promise<DefiStats> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<DefiStats>(defiEndpoints.stats, { isPublicRoute: true });
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch defi stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    defis,
    isLoading,
    error,
    getDefis,
    getDefiById,
    createDefi,
    updateDefi,
    deleteDefi,
    getDefiStats,
  };
};

// ==================== DEFI PARTICIPANTS HOOKS ====================

export const useDefiParticipants = (defiId: string) => {
  const [participants, setParticipants] = useState<DefiParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getParticipants = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
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
      
      setParticipants(participantsData);
      return participantsData;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch participants');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [defiId]);

  const joinDefi = useCallback(async (joinData: JoinDefiDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post<ParticipantResponse, JoinDefiDto>(
        defiEndpoints.joinDefi(defiId),
        joinData
      );
      // Refresh participants after joining
      await getParticipants();
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join defi');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [defiId, getParticipants]);

  const leaveDefi = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(defiEndpoints.leaveDefi(defiId));
      // Refresh participants after leaving
      await getParticipants();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to leave defi');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [defiId, getParticipants]);

  const abandonDefi = useCallback(async (abandonData: AbandonDefiDto) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post<{ message: string }, AbandonDefiDto>(
        defiEndpoints.abandonDefi(defiId),
        abandonData
      );
      // Refresh participants after abandoning
      await getParticipants();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to abandon defi');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [defiId, getParticipants]);

  return {
    participants,
    isLoading,
    error,
    getParticipants,
    joinDefi,
    leaveDefi,
    abandonDefi,
  };
};

// ==================== DEFI TRANSACTIONS HOOKS ====================

export const useDefiTransactions = (defiId: string) => {
  const [transactions, setTransactions] = useState<DefiTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
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
      
      setTransactions(transactionsData);
      return transactionsData;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [defiId]);

  const addTransaction = useCallback(async (transactionData: AddTransactionDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post<TransactionResponse, AddTransactionDto>(
        defiEndpoints.addTransaction(defiId),
        transactionData
      );
      // Refresh transactions after adding
      await getTransactions();
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [defiId, getTransactions]);

  const getTransactionStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<TransactionStatsResponse>(defiEndpoints.transactionStats(defiId));
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [defiId]);

  return {
    transactions,
    isLoading,
    error,
    getTransactions,
    addTransaction,
    getTransactionStats,
  };
};

// ==================== DEFI GOALS HOOKS ====================

export const useDefiGoals = (defiId: string) => {
  const [goal, setGoal] = useState<DefiGoal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMyGoal = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<DefiGoal>(defiEndpoints.myGoal(defiId));
      setGoal(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [defiId]);

  const configureGoal = useCallback(async (goalData: ConfigureGoalDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post<{ message: string; data: { participant: DefiParticipant; goal: DefiGoal } }, ConfigureGoalDto>(
        defiEndpoints.configureGoal(defiId),
        goalData
      );
      
      // Extract the goal from the response
      let goalResult: DefiGoal;
      if (response && typeof response === 'object' && 'data' in response && response.data.goal) {
        goalResult = response.data.goal;
      } else {
        goalResult = response as unknown as DefiGoal;
      }
      
      setGoal(goalResult);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to configure goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [defiId]);

  const updateGoal = useCallback(async (goalData: UpdateGoalDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.put<{ message: string; data: DefiGoal }, UpdateGoalDto>(
        defiEndpoints.updateGoal(defiId),
        goalData
      );
      
      // Extract the goal from the response
      let goalResult: DefiGoal;
      if (response && typeof response === 'object' && 'data' in response) {
        goalResult = response.data;
      } else {
        goalResult = response as unknown as DefiGoal;
      }
      
      setGoal(goalResult);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [defiId]);

  return {
    goal,
    isLoading,
    error,
    getMyGoal,
    configureGoal,
    updateGoal,
  };
};

// ==================== USER DEFIS HOOKS ====================

export const useUserDefis = (userId: string) => {
  const [userDefis, setUserDefis] = useState<Defi[]>([]);
  const [userDefiStats, setUserDefiStats] = useState<UserDefiStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserDefis = useCallback(async (status?: 'ACTIVE' | 'COMPLETED' | 'ABANDONED') => {
    try {
      setIsLoading(true);
      setError(null);
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
      
      setUserDefis(defisData);
      return defisData;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user defis');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const getUserDefiStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<UserDefiStats>(userDefiEndpoints.defiStats(userId));
      setUserDefiStats(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch defi stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    userDefis,
    userDefiStats,
    isLoading,
    error,
    getUserDefis,
    getUserDefiStats,
  };
};

// ==================== REACT QUERY HOOKS ====================

// Hook pour obtenir tous les défis avec React Query
export const useDefisQuery = (params?: DefiQueryParams) => {
  return useQuery({
    queryKey: ['defis', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.createdBy) queryParams.append('createdBy', params.createdBy);
      if (params?.isOfficial !== undefined) queryParams.append('isOfficial', params.isOfficial.toString());

      const url = `${defiEndpoints.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await api.get<PaginatedDefiResponse>(url, { isPublicRoute: true });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour obtenir un défi par ID avec React Query
export const useDefiQuery = (defiId: string) => {
  return useQuery({
    queryKey: ['defi', defiId],
    queryFn: async () => {
      return await api.get<Defi>(defiEndpoints.details(defiId), { isPublicRoute: true });
    },
    enabled: !!defiId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour rejoindre un défi avec React Query
export const useJoinDefi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ defiId, joinData }: { defiId: string; joinData: JoinDefiDto }) => {
      return await api.post<ParticipantResponse, JoinDefiDto>(
        defiEndpoints.joinDefi(defiId),
        joinData
      );
    },
    onSuccess: (_, variables) => {
      // Invalider le cache pour ce défi
      queryClient.invalidateQueries({ queryKey: ['defi', variables.defiId] });
      queryClient.invalidateQueries({ queryKey: ['defis'] });
      queryClient.invalidateQueries({ queryKey: ['userDefis'] });
    },
  });
};

// Hook pour ajouter une transaction avec React Query
export const useAddDefiTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ defiId, transactionData }: { defiId: string; transactionData: AddTransactionDto }) => {
      return await api.post<TransactionResponse, AddTransactionDto>(
        defiEndpoints.addTransaction(defiId),
        transactionData
      );
    },
    onSuccess: (_, variables) => {
      // Invalider le cache pour ce défi et ses transactions
      queryClient.invalidateQueries({ queryKey: ['defi', variables.defiId] });
      queryClient.invalidateQueries({ queryKey: ['defiTransactions', variables.defiId] });
      queryClient.invalidateQueries({ queryKey: ['defiGoal', variables.defiId] });
    },
  });
};

