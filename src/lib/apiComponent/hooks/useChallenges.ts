import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../apiClient';
import { challengeEndpoints, userChallengeEndpoints } from '../endpoints';
import {
  Challenge,
  CurrentChallengeResponse,
  ChallengeQueryParams,
  CreateChallengeDto,
  UpdateChallengeDto,
  JoinChallengeDto,
  AddTransactionDto,
  AbandonChallengeDto,
  UpdateGoalDto,
  ConfigureGoalDto,
  ChallengeParticipant,
  ChallengeTransaction,
  ChallengeStats,
  CollectiveProgress,
  LeaderboardEntry,
  Milestone,
  PaginatedResponse
} from '../types';

// ==================== CHALLENGES HOOKS ====================

// Hook React Query pour le currentChallenge (synchronisé entre les pages)
export const useCurrentChallengeQuery = (userId: string) => {
  return useQuery({
    queryKey: ['currentChallenge', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await api.get<CurrentChallengeResponse>(userChallengeEndpoints.currentChallenge(userId));
      return response;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook pour invalider le cache du currentChallenge
export const useInvalidateCurrentChallenge = () => {
  const queryClient = useQueryClient();
  
  return useCallback((userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['currentChallenge', userId] });
  }, [queryClient]);
};

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getChallenges = useCallback(async (params?: ChallengeQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `${challengeEndpoints.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<PaginatedResponse<Challenge>>(url, { isPublicRoute: true });
      
      // Handle different response structures
      let challengesData: Challenge[] = [];
      if (Array.isArray(response.data)) {
        challengesData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        const responseData = response.data as Record<string, unknown>;
        // Check for 'data' property (paginated response)
        if ('data' in responseData && Array.isArray(responseData.data)) {
          challengesData = responseData.data as Challenge[];
        }
        // Check for 'challenges' property
        else if ('challenges' in responseData && Array.isArray(responseData.challenges)) {
          challengesData = responseData.challenges as Challenge[];
        }
      }
      
      setChallenges(challengesData);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch challenges');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChallengeById = useCallback(async (id: string): Promise<Challenge> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<Challenge>(challengeEndpoints.details(id), { isPublicRoute: true });
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createChallenge = useCallback(async (challengeData: CreateChallengeDto): Promise<Challenge> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post<Challenge, CreateChallengeDto>(challengeEndpoints.create, challengeData);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateChallenge = useCallback(async (id: string, challengeData: UpdateChallengeDto): Promise<Challenge> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.put<Challenge, UpdateChallengeDto>(challengeEndpoints.update(id), challengeData);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteChallenge = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete<Challenge>(challengeEndpoints.delete(id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChallengeStats = useCallback(async (): Promise<ChallengeStats> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ChallengeStats>(challengeEndpoints.stats, { isPublicRoute: true });
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch challenge stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get first active challenge
  const getFirstActiveChallenge = useCallback(async (): Promise<unknown> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<unknown>(challengeEndpoints.firstActive, { isPublicRoute: true });
      return response;
    } catch (err: unknown) {
      // If no active challenge exists, return null instead of throwing
      const apiError = err as { response?: { status: number } };
      if (apiError.response?.status === 404) {
        return null;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch first active challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get current user participation
  const getCurrentParticipation = useCallback(async (userId: string) => {
    try {
      const response = await api.get<{ data: Challenge | unknown }>(userChallengeEndpoints.currentChallenge(userId));
      return response.data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch current participation');
      throw err;
    }
  }, []);

  // Join a challenge
  const joinChallenge = useCallback(async (challengeId: string, joinData: JoinChallengeDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post(
        challengeEndpoints.joinChallenge(challengeId),
        joinData
      );
      // Refresh challenges after joining
      await getChallenges();
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getChallenges]);

  return {
    challenges,
    isLoading,
    error,
    getChallenges,
    getChallengeById,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    getChallengeStats,
    getFirstActiveChallenge,
    getCurrentParticipation,
    joinChallenge,
  };
};

// ==================== CHALLENGE PARTICIPANTS HOOKS ====================

export const useChallengeParticipants = (challengeId: string) => {
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getParticipants = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ChallengeParticipant[]>(
        challengeEndpoints.participants(challengeId),
        { isPublicRoute: true }
      );
      setParticipants(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch participants');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  const joinChallenge = useCallback(async (joinData: JoinChallengeDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post(
        challengeEndpoints.joinChallenge(challengeId),
        joinData
      );
      // Refresh participants after joining
      await getParticipants();
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [challengeId, getParticipants]);

  const leaveChallenge = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(challengeEndpoints.leaveChallenge(challengeId));
      // Refresh participants after leaving
      await getParticipants();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to leave challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [challengeId, getParticipants]);

  const abandonChallenge = useCallback(async (abandonData: AbandonChallengeDto) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post(
        challengeEndpoints.abandonChallenge(challengeId),
        abandonData
      );
      // Refresh participants after abandoning
      await getParticipants();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to abandon challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [challengeId, getParticipants]);

  return {
    participants,
    isLoading,
    error,
    getParticipants,
    joinChallenge,
    leaveChallenge,
    abandonChallenge,
  };
};

// ==================== CHALLENGE TRANSACTIONS HOOKS ====================

export const useChallengeTransactions = (challengeId: string) => {
  const [transactions, setTransactions] = useState<ChallengeTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTransactions = useCallback(async (participantId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = participantId ? `?participantId=${participantId}` : '';
      const response = await api.get<ChallengeTransaction[]>(
        `${challengeEndpoints.transactions(challengeId)}${queryParams}`
      );
      setTransactions(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  const addTransaction = useCallback(async (transactionData: AddTransactionDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post(
        challengeEndpoints.addTransaction(challengeId),
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
  }, [challengeId, getTransactions]);

  const getTransactionStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(challengeEndpoints.transactionStats(challengeId));
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  return {
    transactions,
    isLoading,
    error,
    getTransactions,
    addTransaction,
    getTransactionStats,
  };
};

// ==================== CHALLENGE GOALS HOOKS ====================

export const useChallengeGoals = (challengeId: string) => {
  const [goal, setGoal] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMyGoal = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(challengeEndpoints.myGoal(challengeId));
      setGoal(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  const configureGoal = useCallback(async (goalData: ConfigureGoalDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post(
        challengeEndpoints.configureGoal(challengeId),
        goalData
      );
      setGoal(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to configure goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  const updateGoal = useCallback(async (goalData: UpdateGoalDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.put(
        challengeEndpoints.updateGoal(challengeId),
        goalData
      );
      setGoal(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  return {
    goal,
    isLoading,
    error,
    getMyGoal,
    configureGoal,
    updateGoal,
  };
};

// ==================== COLLECTIVE PROGRESS HOOKS ====================

// Hook pour les endpoints /current/collective/ (ne nécessite pas de challengeId)
export const useCurrentCollectiveProgress = () => {
  const [progressData, setProgressData] = useState<{
    challenge: {
      id: string;
      title: string;
      type: string;
      startDate: string;
      endDate: string;
    };
    progress: {
      totalParticipants: number;
      totalAmountSaved: number;
      collectiveTarget: number;
      averageProgress: number;
      completionRate: number;
      remainingAmount: number;
      daysRemaining: number;
    };
    achievements?: Array<{
      id: string;
      title: string;
      description: string;
      type: string;
      value: number;
      target: number;
      isUnlocked: boolean;
      badge?: string;
      rarity: number;
    }>;
    lastUpdated: string;
  } | null>(null);
  
  const [leaderboardData, setLeaderboardData] = useState<{
    leaderboard: Array<{
      rank: number;
      userId: string;
      userName: string;
      currentAmount: number;
      targetAmount: number;
      progressPercentage: number;
      consistency?: number;
      joinedAt: string;
      lastTransactionAt?: string;
      transactionCount?: number;
      level?: number;
      totalXP?: number;
      userRank?: string;
      pictureProfilUrl?: string;
      firstName?: string;
      lastName?: string;
    }>;
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    sortBy: string;
    userRank: number | null;
    lastUpdated: string;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentCollectiveProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<{
        challenge: {
          id: string;
          title: string;
          type: string;
          startDate: string;
          endDate: string;
        };
        progress: {
          totalParticipants: number;
          totalAmountSaved: number;
          collectiveTarget: number;
          averageProgress: number;
          completionRate: number;
          remainingAmount: number;
          daysRemaining: number;
        };
        achievements?: Array<{
          id: string;
          title: string;
          description: string;
          type: string;
          value: number;
          target: number;
          isUnlocked: boolean;
          badge?: string;
          rarity: number;
        }>;
        lastUpdated: string;
      }>(challengeEndpoints.currentCollectiveProgress);
      setProgressData(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collective progress');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentLeaderboard = useCallback(async (
    sortBy: 'progress' | 'amount' | 'consistency' = 'progress',
    limit: number = 10,
    page: number = 1
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const queryParams = `?sortBy=${sortBy}&limit=${limit}&page=${page}`;
      const response = await api.get<{
        leaderboard: Array<{
          rank: number;
          userId: string;
          userName: string;
          currentAmount: number;
          targetAmount: number;
          progressPercentage: number;
          consistency?: number;
          joinedAt: string;
          lastTransactionAt?: string;
          transactionCount?: number;
          level?: number;
          totalXP?: number;
          userRank?: string;
          pictureProfilUrl?: string;
          firstName?: string;
          lastName?: string;
        }>;
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
        sortBy: string;
        userRank: number | null;
        lastUpdated: string;
      }>(`${challengeEndpoints.currentLeaderboard}${queryParams}`);
      setLeaderboardData(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    progressData,
    leaderboardData,
    isLoading,
    error,
    getCurrentCollectiveProgress,
    getCurrentLeaderboard,
  };
};

export const useCollectiveProgress = (challengeId: string) => {
  const [progress, setProgress] = useState<CollectiveProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCollectiveProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<CollectiveProgress>(
        challengeEndpoints.collectiveProgress(challengeId)
      );
      setProgress(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collective progress');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  const getLeaderboard = useCallback(async (sortBy: 'progress' | 'amount' | 'consistency' = 'progress', limit: number = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      const queryParams = `?sortBy=${sortBy}&limit=${limit}`;
      const response = await api.get<LeaderboardEntry[]>(
        `${challengeEndpoints.leaderboard(challengeId)}${queryParams}`
      );
      setLeaderboard(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  const getMilestones = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<Milestone[]>(
        challengeEndpoints.milestones(challengeId)
      );
      setMilestones(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch milestones');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  const getAchievements = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(challengeEndpoints.achievements(challengeId));
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  const getTimeline = useCallback(async (period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    try {
      setIsLoading(true);
      setError(null);
      const queryParams = `?period=${period}`;
      const response = await api.get(
        `${challengeEndpoints.timeline(challengeId)}${queryParams}`
      );
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch timeline');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  return {
    progress,
    leaderboard,
    milestones,
    isLoading,
    error,
    getCollectiveProgress,
    getLeaderboard,
    getMilestones,
    getAchievements,
    getTimeline,
  };
};

// ==================== USER CHALLENGES HOOKS ====================

export const useUserChallenges = (userId: string) => {
  const [userChallenges, setUserChallenges] = useState<Challenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challengeHistory, setChallengeHistory] = useState<Challenge[]>([]);
  const [challengeStats, setChallengeStats] = useState<ChallengeStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserChallenges = useCallback(async (status?: 'upcoming' | 'active' | 'completed' | 'abandoned') => {
    try {
      setIsLoading(true);
      setError(null);
      const queryParams = status ? `?status=${status}` : '';
      const response = await api.get<Challenge[]>(
        `${userChallengeEndpoints.userChallenges(userId)}${queryParams}`
      );
      setUserChallenges(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user challenges');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const getCurrentChallenge = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<Challenge>(userChallengeEndpoints.currentChallenge(userId));
      console.log('Current challenge:', response);
      setCurrentChallenge(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch current challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const getChallengeHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<Challenge[]>(userChallengeEndpoints.challengeHistory(userId));
      setChallengeHistory(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch challenge history');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const getUserChallengeStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ChallengeStats>(userChallengeEndpoints.challengeStats(userId));
      setChallengeStats(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch challenge stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    userChallenges,
    currentChallenge,
    challengeHistory,
    challengeStats,
    isLoading,
    error,
    getUserChallenges,
    getCurrentChallenge,
    getChallengeHistory,
    getUserChallengeStats,
  };
};
