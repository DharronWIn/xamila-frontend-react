// ==================== GAMIFICATION HOOKS EXPORTS ====================
// Centralisation de tous les hooks de gamification pour faciliter les imports

export { useGamificationRewards } from './useGamificationRewards';
export { useGamificationProgress } from './useGamificationProgress';
export { usePublicProfile } from './usePublicProfile';
export { useRewards } from './useRewards';

// Re-export des types utiles
export type { 
  UserLevelInfo,
  UserRank,
  Trophy,
  Badge,
  UserBadge,
  UserTrophy,
  PublicProfile,
  CheckRewardsResponse,
  GamificationDashboard,
  TrophyProgress,
  RANK_EMOJIS,
  RANK_COLORS,
  RANK_LABELS,
  RARITY_COLORS,
  RARITY_LABELS
} from '@/types/gamification';

// Re-export des helpers
export { gamificationHelpers } from '@/lib/gamificationHelpers';
