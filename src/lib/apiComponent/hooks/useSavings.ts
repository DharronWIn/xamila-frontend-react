import { useState, useCallback } from 'react';
import { api } from '../apiClient';
import { savingsEndpoints as endpoints } from '../endpoints';
import {
  SavingsGoal,
  SavingsGoalResponseDto,
  CreateSavingsGoalDto,
  UpdateSavingsGoalDto,
  ContributeToGoalDto,
  SavingsStatsDto,
  ChallengeResponseDto,
  CreateChallengeDto,
  ContributeToChallengeDto,
  ChallengeLeaderboardDto
} from '../types';

// ==================== SAVINGS GOALS HOOKS ====================

export const useSavingsGoals = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getGoals = useCallback(async (): Promise<SavingsGoal[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<SavingsGoal[]>(endpoints.goals);
      setGoals(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch savings goals');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createGoal = useCallback(async (goalData: CreateSavingsGoalDto): Promise<SavingsGoal> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post<SavingsGoal, CreateSavingsGoalDto>(endpoints.createGoal, goalData);
      
      // Add to local state
      setGoals(prev => [response, ...prev]);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create savings goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getGoalById = useCallback(async (id: string): Promise<SavingsGoalResponseDto> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<SavingsGoalResponseDto>(endpoints.goalById(id));
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch savings goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateGoal = useCallback(async (id: string, goalData: UpdateSavingsGoalDto): Promise<SavingsGoal> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.put<SavingsGoal, UpdateSavingsGoalDto>(endpoints.updateGoal(id), goalData);
      
      // Update in local state
      setGoals(prev => prev.map(g => g.id === id ? response : g));
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update savings goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(endpoints.deleteGoal(id));
      
      // Remove from local state
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete savings goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contributeToGoal = useCallback(async (id: string, contributionData: ContributeToGoalDto): Promise<SavingsGoal> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post<SavingsGoal, ContributeToGoalDto>(endpoints.contributeToGoal(id), contributionData);
      
      // Update in local state
      setGoals(prev => prev.map(g => g.id === id ? response : g));
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to contribute to savings goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getGoalsStats = useCallback(async (): Promise<SavingsStatsDto> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<SavingsStatsDto>(endpoints.goalsStats);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch savings stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    goals,
    isLoading,
    error,
    getGoals,
    createGoal,
    getGoalById,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    getGoalsStats,
  };
};

// ==================== SAVINGS CHALLENGES HOOKS ====================

export const useSavingsChallenges = () => {
  const [challenges, setChallenges] = useState<ChallengeResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getChallenges = useCallback(async (): Promise<ChallengeResponseDto[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ChallengeResponseDto[]>(endpoints.challenges);
      setChallenges(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch savings challenges');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createChallenge = useCallback(async (challengeData: CreateChallengeDto): Promise<ChallengeResponseDto> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post<ChallengeResponseDto, CreateChallengeDto>(endpoints.createChallenge, challengeData);
      
      // Add to local state
      setChallenges(prev => [response, ...prev]);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create savings challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChallengeById = useCallback(async (id: string): Promise<ChallengeResponseDto> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ChallengeResponseDto>(endpoints.challengeById(id));
      return response;
    } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch savings challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinChallenge = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post(endpoints.joinChallenge(id), {});
      
      // Refresh challenges to update participation status
      await getChallenges();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join savings challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getChallenges]);

  const leaveChallenge = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post(endpoints.leaveChallenge(id), {});
      
      // Refresh challenges to update participation status
      await getChallenges();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to leave savings challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getChallenges]);

  const contributeToChallenge = useCallback(async (id: string, contributionData: ContributeToChallengeDto) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post(endpoints.contributeToChallenge(id), contributionData);
      
      // Refresh challenges to update contribution data
      await getChallenges();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to contribute to savings challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getChallenges]);

  const getChallengeLeaderboard = useCallback(async (id: string): Promise<ChallengeLeaderboardDto[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ChallengeLeaderboardDto[]>(endpoints.challengeLeaderboard(id));
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch challenge leaderboard');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCollectiveProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(endpoints.collectiveProgress);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collective progress');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    challenges,
    isLoading,
    error,
    getChallenges,
    createChallenge,
    getChallengeById,
    joinChallenge,
    leaveChallenge,
    contributeToChallenge,
    getChallengeLeaderboard,
    getCollectiveProgress,
  };
};
