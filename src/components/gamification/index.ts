// Gamification components exports

// Legacy components
export { TrophyUnlockedModal } from './TrophyUnlockedModal';
export { LevelUpModal } from './LevelUpModal';
export { LevelWidget } from './LevelWidget';

// New components
export { UserBadge, RankIcon, LevelDisplay, RankDisplay } from './UserBadge';
export { 
  TrophyUnlockedModal as NewTrophyUnlockedModal,
  BadgeUnlockedModal,
  LevelUpModal as NewLevelUpModal,
  XPGainedToast
} from './RewardModals';

// Dashboard and views
export { GamificationDashboard } from './GamificationDashboard';
export { LeaderboardWithGamification, SimpleLeaderboardWithGamification } from './LeaderboardWithGamification';
export { PublicProfileWithGamification } from './PublicProfileWithGamification';

// Helpers
export { gamificationHelpers } from '@/lib/gamificationHelpers';

