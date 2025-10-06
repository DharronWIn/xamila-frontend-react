import { useState, useEffect, useCallback } from 'react';
import { currentChallengeService } from '../services/currentChallengeService';
import {
    CurrentChallenge,
    CurrentChallengeProgress,
    CurrentChallengeLeaderboard,
    CurrentChallengeMilestones,
    CurrentChallengeAchievements,
    CurrentChallengeTimeline
} from '@/types/challenge';

export const useCurrentChallenge = () => {
  const [currentChallenge, setCurrentChallenge] = useState<CurrentChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentChallenge = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const challenge = await currentChallengeService.getCurrentChallenge();
      setCurrentChallenge(challenge);
    } catch (err: any) {
      console.log('🔍 Debug Hook - Erreur lors de la récupération:', err);
      setError(err.message || 'Erreur lors de la récupération du challenge actuel');
    } finally {
      setIsLoading(false);
    }
  }, []); // Supprimer les dépendances qui causent la boucle infinie

  useEffect(() => {
    fetchCurrentChallenge();
  }, [fetchCurrentChallenge]);

  return {
    currentChallenge,
    isLoading,
    error,
    refetch: fetchCurrentChallenge
  };
};

export const useCurrentChallengeProgress = () => {
  const [progress, setProgress] = useState<CurrentChallengeProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const progressData = await currentChallengeService.getCurrentChallengeProgress();
      setProgress(progressData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération de la progression');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    refetch: fetchProgress
  };
};

export const useCurrentChallengeLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<CurrentChallengeLeaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const leaderboardData = await currentChallengeService.getCurrentChallengeLeaderboard();
      setLeaderboard(leaderboardData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération du classement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    isLoading,
    error,
    refetch: fetchLeaderboard
  };
};

export const useCurrentChallengeMilestones = () => {
  const [milestones, setMilestones] = useState<CurrentChallengeMilestones | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const milestonesData = await currentChallengeService.getCurrentChallengeMilestones();
      setMilestones(milestonesData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des jalons');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  return {
    milestones,
    isLoading,
    error,
    refetch: fetchMilestones
  };
};

export const useCurrentChallengeAchievements = () => {
  const [achievements, setAchievements] = useState<CurrentChallengeAchievements | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const achievementsData = await currentChallengeService.getCurrentChallengeAchievements();
      setAchievements(achievementsData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des succès');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    isLoading,
    error,
    refetch: fetchAchievements
  };
};

export const useCurrentChallengeTimeline = () => {
  const [timeline, setTimeline] = useState<CurrentChallengeTimeline | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const timelineData = await currentChallengeService.getCurrentChallengeTimeline();
      setTimeline(timelineData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération de la timeline');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return {
    timeline,
    isLoading,
    error,
    refetch: fetchTimeline
  };
};
