import { useState, useCallback } from 'react';
import { api, ApiError } from '../apiClient';
import { gamificationEndpoints } from '../endpoints';
import {
  GamificationDashboard,
  CheckRewardsResponse,
  TrophiesResponse,
  MyTrophiesResponse,
  BadgesResponse,
  MyBadgesResponse,
  XPHistoryResponse,
  UserStats,
  UserLevel,
  TrophyProgress,
  TrophyCategory,
  TrophyRarity,
} from '@/types/gamification';

export const useGamification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== DASHBOARD ====================

  const getDashboard = useCallback(async (): Promise<GamificationDashboard | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<GamificationDashboard>(gamificationEndpoints.dashboard);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Erreur lors du chargement du dashboard';
      setError(errorMessage);
      console.error('Error fetching gamification dashboard:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== REWARDS CHECK ====================

  const checkRewards = useCallback(async (): Promise<CheckRewardsResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post<CheckRewardsResponse, Record<string, never>>(gamificationEndpoints.checkTrophies, {});
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Erreur lors de la vérification des récompenses';
      setError(errorMessage);
      console.error('Error checking rewards:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== TROPHIES ====================

  const getTrophies = useCallback(async (filters?: {
    category?: TrophyCategory;
    rarity?: TrophyRarity;
    unlocked?: boolean;
    inProgress?: boolean;
  }): Promise<TrophiesResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.rarity) params.append('rarity', filters.rarity);
      if (filters?.unlocked !== undefined) params.append('unlocked', filters.unlocked.toString());
      if (filters?.inProgress !== undefined) params.append('inProgress', filters.inProgress.toString());

      const url = params.toString() 
        ? `${gamificationEndpoints.trophies}?${params.toString()}`
        : gamificationEndpoints.trophies;

      const response = await api.get<TrophiesResponse>(url);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Erreur lors du chargement des trophées';
      setError(errorMessage);
      console.error('Error fetching trophies:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyTrophies = useCallback(async (filters?: {
    category?: TrophyCategory;
    rarity?: TrophyRarity;
  }): Promise<MyTrophiesResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.rarity) params.append('rarity', filters.rarity);

      const url = params.toString() 
        ? `${gamificationEndpoints.myTrophies}?${params.toString()}`
        : gamificationEndpoints.myTrophies;

      const response = await api.get<MyTrophiesResponse>(url);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Erreur lors du chargement de mes trophées';
      setError(errorMessage);
      console.error('Error fetching my trophies:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrophiesProgress = useCallback(async (): Promise<TrophyProgress[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<TrophyProgress[]>(gamificationEndpoints.trophiesProgress);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Erreur lors du chargement de la progression des trophées';
      setError(errorMessage);
      console.error('Error fetching trophies progress:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== BADGES ====================

  const getBadges = useCallback(async (): Promise<BadgesResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<BadgesResponse>(gamificationEndpoints.badges);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Erreur lors du chargement des badges';
      setError(errorMessage);
      console.error('Error fetching badges:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyBadges = useCallback(async (): Promise<MyBadgesResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<MyBadgesResponse>(gamificationEndpoints.myBadges);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Erreur lors du chargement de mes badges';
      setError(errorMessage);
      console.error('Error fetching my badges:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== LEVEL & XP ====================

  const getLevel = useCallback(async (): Promise<UserLevel | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<UserLevel>(gamificationEndpoints.level);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Erreur lors du chargement du niveau';
      setError(errorMessage);
      console.error('Error fetching level:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStats = useCallback(async (): Promise<UserStats | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<UserStats>(gamificationEndpoints.stats);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Erreur lors du chargement des statistiques';
      setError(errorMessage);
      console.error('Error fetching stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getXPHistory = useCallback(async (page = 1, limit = 20): Promise<XPHistoryResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<XPHistoryResponse>(
        `${gamificationEndpoints.xpHistory}?page=${page}&limit=${limit}`
      );
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Erreur lors du chargement de l\'historique XP';
      setError(errorMessage);
      console.error('Error fetching XP history:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    
    // Dashboard
    getDashboard,
    
    // Rewards
    checkRewards,
    
    // Trophies
    getTrophies,
    getMyTrophies,
    getTrophiesProgress,
    
    // Badges
    getBadges,
    getMyBadges,
    
    // Level & XP
    getLevel,
    getStats,
    getXPHistory,
  };
};