import { api } from '../apiClient';
import { challengeEndpoints } from '../endpoints';
import {
  CurrentChallenge,
  CurrentChallengeProgress,
  CurrentChallengeLeaderboard,
  CurrentChallengeMilestones,
  CurrentChallengeAchievements,
  CurrentChallengeTimeline
} from '@/types/challenge';

// Type pour les réponses API
type ApiResponse = unknown;

export const currentChallengeService = {
  // Récupérer le challenge actuel de l'utilisateur
  getCurrentChallenge: async (): Promise<CurrentChallenge | null> => {
    try {
      const response = await api.get(challengeEndpoints.current);
      
      // L'apiClient traite déjà la structure {success: true, data: {...}} et retourne directement les données
      // Donc response contient directement les données du challenge
      const challengeData = response as any;
      
      if (!challengeData) {
        return null;
      }

      // Calculer les jours restants
      const endDate = new Date(challengeData.endDate);
      const now = new Date();
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      // Transformer les données de l'API vers notre interface
      const transformedData = {
        challengeId: challengeData.id,
        challengeTitle: challengeData.title,
        challengeType: challengeData.type || 'CUSTOM',
        challengeStatus: challengeData.status || 'UPCOMING',
        totalParticipants: challengeData._count?.participants || 0,
        collectiveTarget: challengeData.collectiveTarget || challengeData.targetAmount || 0,
        collectiveCurrentAmount: challengeData.collectiveCurrentAmount || 0,
        collectiveProgress: challengeData.collectiveProgress || 0,
        averageProgress: challengeData.averageProgress || 0,
        daysRemaining: daysRemaining,
        startDate: challengeData.startDate || '',
        endDate: challengeData.endDate || ''
      };
      
      return transformedData;
    } catch (error: unknown) {
      // Si l'utilisateur n'a pas de challenge actuel, retourner null
      const apiError = error as { response?: { status: number } };
      if (apiError.response?.status === 404 || apiError.response?.status === 400) {
        return null;
      }
      throw error;
    }
  },

  // Récupérer la progression collective du challenge actuel
  getCurrentChallengeProgress: async (): Promise<CurrentChallengeProgress | null> => {
    try {
      const response = await api.get(challengeEndpoints.currentCollectiveProgress);
      return (response as any) || null;
    } catch (error: unknown) {
      const apiError = error as { response?: { status: number } };
      if (apiError.response?.status === 404 || apiError.response?.status === 400) {
        return null;
      }
      throw error;
    }
  },

  // Récupérer le classement du challenge actuel
  getCurrentChallengeLeaderboard: async (): Promise<CurrentChallengeLeaderboard | null> => {
    try {
      const response = await api.get(challengeEndpoints.currentLeaderboard);
      const leaderboardData = response as any;
      
      console.log('🔍 Debug Leaderboard - Données reçues:', leaderboardData);
      
      if (!leaderboardData) {
        return null;
      }

      // Transformer les données de l'API vers notre interface
      const transformedData = {
        challengeId: leaderboardData.challengeId || '',
        challengeTitle: leaderboardData.challengeTitle || '',
        participants: leaderboardData.leaderboard?.map((participant: any) => ({
          rank: participant.rank,
          participantId: participant.userId,
          user: {
            id: participant.userId,
            username: participant.userName,
            firstName: participant.firstName || '',
            lastName: participant.lastName || '',
            pictureProfilUrl: participant.pictureProfilUrl
          },
          currentAmount: participant.currentAmount,
          targetAmount: participant.targetAmount,
          progress: participant.progressPercentage,
          status: 'ACTIVE' as const,
          joinedAt: participant.joinedAt,
          isCurrentUser: participant.isCurrentUser || false
        })) || [],
        totalParticipants: leaderboardData.totalParticipants || 0,
        currentUserRank: leaderboardData.currentUserRank || 0
      };

      console.log('🔍 Debug Leaderboard - Données transformées:', transformedData);
      return transformedData;
    } catch (error: unknown) {
      const apiError = error as { response?: { status: number } };
      if (apiError.response?.status === 404 || apiError.response?.status === 400) {
        return null;
      }
      throw error;
    }
  },

  // Récupérer les jalons du challenge actuel
  getCurrentChallengeMilestones: async (): Promise<CurrentChallengeMilestones | null> => {
    try {
      const response = await api.get(challengeEndpoints.currentMilestones);
      return (response as any) || null;
    } catch (error: unknown) {
      const apiError = error as { response?: { status: number } };
      if (apiError.response?.status === 404 || apiError.response?.status === 400) {
        return null;
      }
      throw error;
    }
  },

  // Récupérer les succès du challenge actuel
  getCurrentChallengeAchievements: async (): Promise<CurrentChallengeAchievements | null> => {
    try {
      const response = await api.get(challengeEndpoints.currentAchievements);
      return (response as any) || null;
    } catch (error: unknown) {
      const apiError = error as { response?: { status: number } };
      if (apiError.response?.status === 404 || apiError.response?.status === 400) {
        return null;
      }
      throw error;
    }
  },

  // Récupérer la timeline du challenge actuel
  getCurrentChallengeTimeline: async (): Promise<CurrentChallengeTimeline | null> => {
    try {
      const response = await api.get(challengeEndpoints.currentTimeline);
      return (response as any) || null;
    } catch (error: unknown) {
      const apiError = error as { response?: { status: number } };
      if (apiError.response?.status === 404 || apiError.response?.status === 400) {
        return null;
      }
      throw error;
    }
  },
};
