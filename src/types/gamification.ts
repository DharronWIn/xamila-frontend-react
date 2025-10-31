// ==================== GAMIFICATION TYPES ====================
// Types pour le système de gamification (trophées, badges, niveaux, leaderboard)

// ==================== ENUMS ====================

export type TrophyCategory = 
  | 'SAVINGS'       // Épargne
  | 'CHALLENGE'     // Challenge (singulier)
  | 'SOCIAL'        // Social
  | 'MILESTONE';    // Jalons

export type TrophyRarity = 
  | 'COMMON'        // Commun - Bronze
  | 'RARE'          // Rare - Argent
  | 'EPIC'          // Épique - Or
  | 'LEGENDARY';    // Légendaire - Platine

export type BadgeType = 
  | 'LEVEL'         // Badge de niveau
  | 'EVENT'         // Badge d'événement
  | 'ACHIEVEMENT'   // Badge d'accomplissement
  | 'SEASONAL';     // Badge saisonnier

export type UserRank = 
  | 'NOVICE'            // Novice - 🌱
  | 'APPRENTICE'        // Apprenti - 🥈
  | 'EXPERT'            // Expert - 🏅
  | 'MASTER'            // Maître - 👑
  | 'LEGEND';           // Légende - ⭐

export type LeaderboardType = 
  | 'GLOBAL'        // Classement global
  | 'MONTHLY'       // Classement mensuel
  | 'WEEKLY'        // Classement hebdomadaire
  | 'CHALLENGES'    // Classement des challenges
  | 'SAVINGS'       // Classement épargne
  | 'XP';           // Classement XP

// ==================== TROPHY TYPES ====================

export interface TrophyCondition {
  type: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface Trophy {
  id: string;
  name: string;
  nameEn: string;
  nameFr: string;
  descriptionEn: string;
  descriptionFr: string;
  category: TrophyCategory;
  rarity: TrophyRarity;
  icon: string;
  xpReward: number;
  condition: TrophyCondition;
}

export interface UserTrophy {
  id: string;
  isCompleted: boolean;
  progress: number; // 0-1
  unlockedAt: string;
  trophy: Trophy;
}

export interface TrophyProgress {
  trophy: Trophy;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

// ==================== BADGE TYPES ====================

export interface Badge {
  id: string;
  name: string;
  nameEn: string;
  nameFr: string;
  descriptionEn: string;
  descriptionFr: string;
  type: BadgeType;
  icon: string;
  color: string; // Hex color
  requirement: {
    type: string;
    value: number;
  };
}

export interface UserBadge {
  id: string;
  earnedAt: string;
  badge: Badge;
}

// ==================== LEVEL & XP TYPES ====================

export interface UserLevel {
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  progressPercent: number; // 0-100
  rank: UserRank;
}

export interface XPHistoryEntry {
  id: string;
  amount: number;
  source: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ==================== LEADERBOARD TYPES ====================

export interface LeaderboardUser {
  id: string;
  name: string;
  username: string;
  pictureProfilUrl: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: LeaderboardUser;
  score: number;
  change: number; // +5, -2, 0
}

export interface LeaderboardPosition {
  myEntry: LeaderboardEntry;
  surroundingUsers: LeaderboardEntry[];
}

// ==================== STATS TYPES ====================

export interface UserStats {
  totalSavings: number;
  transactionCount: number;
  challengesCompleted: number;
  defisCompleted: number;
  postsCount: number;
  likesReceived: number;
}

// ==================== DASHBOARD TYPES ====================

export interface GamificationDashboard {
  level: UserLevel;
  totalTrophies: number;
  unlockedTrophies: number;
  totalBadges: number;
  recentTrophies: UserTrophy[];
  inProgressTrophies: TrophyProgress[];
}

// ==================== API RESPONSE TYPES ====================

export interface CheckRewardsResponse {
  newTrophies: Trophy[];
  newBadges: Badge[];
  levelUp: {
    oldLevel: number;
    newLevel: number;
    xpGained: number;
  } | null;
  xpGained: number;
  currentLevel: UserLevel;
}

export interface TrophiesResponse {
  data: Trophy[];
  total: number;
}

export interface MyTrophiesResponse {
  data: UserTrophy[];
  total: number;
}

export interface BadgesResponse {
  data: Badge[];
  total: number;
}

export interface MyBadgesResponse {
  data: UserBadge[];
  total: number;
}

export interface XPHistoryResponse {
  data: XPHistoryEntry[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserStats {
  totalXP: number;
  level: number;
  rank: UserRank;
  totalTrophies: number;
  trophiesByRarity: Record<TrophyRarity, number>;
  trophiesByCategory: Record<TrophyCategory, number>;
  totalBadges: number;
  recentXP: XPHistoryEntry[];
}

// ==================== SOCIAL TYPES WITH GAMIFICATION ====================

export interface UserLevelInfo {
  level: number;
  totalXP: number;
  rank: UserRank;
  totalTrophies: number;
  totalBadges: number;
}

export interface SocialPost {
  id: string;
  title: string;
  content: string;
  type: 'SAVINGS_MILESTONE' | 'MOTIVATION' | 'TIP' | 'QUESTION' | 'CELEBRATION';
  amount?: number;
  images: string[];
  likes: number;
  shares: number;
  commentsCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    pictureProfilUrl: string;
    userLevel: UserLevelInfo;
  };
  isLikedByCurrentUser: boolean;
}

export interface SocialComment {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    pictureProfilUrl: string;
    userLevel: UserLevelInfo;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  currentAmount: number;
  targetAmount: number;
  progressPercentage: number;
  consistency: number;
  joinedAt: string;
  lastTransactionAt: string;
  transactionCount: number;
  level: number;
  totalXP: number;
  userRank: UserRank;
}

export interface ChallengeLeaderboard {
  leaderboard: LeaderboardEntry[];
  currentUserRank: number;
  challengeId: string;
}

export interface DefiParticipant {
  id: string;
  userId: string;
  currentAmount: number;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    pictureProfilUrl: string;
    userLevel: UserLevelInfo;
  };
  goal: {
    id: string;
    targetAmount: number;
    progress: number;
  };
}

export interface PublicProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  pictureProfilUrl: string;
  isPremium: boolean;
  memberSince: string;
  gamification: {
    level: number;
    totalXP: number;
    rank: UserRank;
    totalTrophies: number;
    totalBadges: number;
    recentTrophies: UserTrophy[];
    badges: UserBadge[];
  };
  stats: {
    challengesParticipated: number;
    defisParticipated: number;
    postsCreated: number;
  };
}

// ==================== UTILITY TYPES ====================

export interface TrophyFilters {
  category?: TrophyCategory;
  rarity?: TrophyRarity;
  status?: 'all' | 'unlocked' | 'locked' | 'in_progress';
}

export interface LeaderboardFilters {
  type?: LeaderboardType;
  limit?: number;
}

// ==================== RARITY COLORS ====================

export const RARITY_COLORS: Record<TrophyRarity, string> = {
  COMMON: '#9CA3AF',      // Gris
  RARE: '#3B82F6',        // Bleu
  EPIC: '#8B5CF6',        // Violet
  LEGENDARY: '#F59E0B',   // Or
};

// ==================== RANK EMOJIS ====================

export const RANK_EMOJIS: Record<UserRank, string> = {
  NOVICE: '🌱',
  APPRENTICE: '🥈',
  EXPERT: '🏅',
  MASTER: '👑',
  LEGEND: '⭐',
};

// ==================== RANK COLORS ====================

export const RANK_COLORS: Record<UserRank, string> = {
  NOVICE: '#6B7280',          // Gris
  APPRENTICE: '#94A3B8',      // Gris clair
  EXPERT: '#3B82F6',          // Bleu
  MASTER: '#8B5CF6',          // Violet
  LEGEND: '#F59E0B',          // Or
};

// ==================== XP SOURCES ====================

export const XP_SOURCES = {
  TRANSACTION: 2,
  SAVINGS_PER_1000: 5,
  CHALLENGE_COMPLETED: 100,
  DEFI_COMPLETED: 50,
  DEFI_CREATED: 30,
  POST_CREATED: 10,
  LIKE_RECEIVED: 2,
  COMMENT_POSTED: 5,
  TROPHY_UNLOCKED_MIN: 10,
  TROPHY_UNLOCKED_MAX: 5000,
} as const;

// ==================== TROPHY CATEGORY LABELS ====================

export const TROPHY_CATEGORY_LABELS: Record<TrophyCategory, { fr: string; en: string }> = {
  SAVINGS: { fr: 'Épargne', en: 'Savings' },
  CHALLENGE: { fr: 'Challenge', en: 'Challenge' },
  SOCIAL: { fr: 'Social', en: 'Social' },
  MILESTONE: { fr: 'Jalon', en: 'Milestone' },
};

// ==================== RARITY LABELS ====================

export const RARITY_LABELS: Record<TrophyRarity, { fr: string; en: string }> = {
  COMMON: { fr: 'Commun', en: 'Common' },
  RARE: { fr: 'Rare', en: 'Rare' },
  EPIC: { fr: 'Épique', en: 'Epic' },
  LEGENDARY: { fr: 'Légendaire', en: 'Legendary' },
};

// ==================== RANK LABELS ====================

export const RANK_LABELS: Record<UserRank, { fr: string; en: string }> = {
  NOVICE: { fr: 'Novice', en: 'Novice' },
  APPRENTICE: { fr: 'Apprenti', en: 'Apprentice' },
  EXPERT: { fr: 'Expert', en: 'Expert' },
  MASTER: { fr: 'Maître', en: 'Master' },
  LEGEND: { fr: 'Légende', en: 'Legend' },
};

