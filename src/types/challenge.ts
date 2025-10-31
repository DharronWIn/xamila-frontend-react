// Types pour le système de challenges d'épargne

export interface SavingsChallenge {
  id: string;
  title: string;
  description: string;
  challengeRule?: string;
  type: 'monthly' | 'weekly' | 'daily' | 'custom';
  targetAmount: number;
  duration: number; // en jours
  startDate: string;
  endDate: string;
  isActive: boolean;
  isJoined?: boolean; // L'utilisateur a rejoint ce challenge
  userParticipation?: {
    id: string;
    status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'ABANDONED';
    currentAmount: number;
  };
  createdBy: string;
  createdByName: string;
  createdByAvatar?: string;
  createdByPictureProfilUrl?: string;
  rewards: string[];
  maxParticipants?: number;
  participants: number;
  participantsList: ChallengeParticipant[];
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeParticipant {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userPictureProfilUrl?: string;
  challengeId: string;
  mode: 'free' | 'forced';
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  bankAccountId?: string; // Pour le mode forcé
  joinedAt: string;
  status: 'upcoming' | 'active' | 'abandoned' | 'completed';
  abandonmentReason?: string;
  abandonedAt?: string;
  transactions: ChallengeTransaction[];
  lastTransactionAt?: string;
}

export interface ChallengeTransaction {
  id: string;
  challengeId: string;
  participantId: string;
  userId?: string; // ID de l'utilisateur qui a fait la transaction
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string;
  mode: 'free' | 'forced';
  bankAccountId?: string; // Pour le mode forcé
  date: string;
  createdAt: string;
  isVerified?: boolean; // Pour le mode forcé
}

export interface ChallengeGoal {
  id: string;
  challengeId: string;
  participantId: string;
  targetAmount: number;
  mode: 'free' | 'forced';
  bankAccountId?: string;
  createdAt: string;
}

export interface ChallengeAbandonment {
  id: string;
  challengeId: string;
  participantId: string;
  reason: string;
  reasonCategory: 'financial_difficulty' | 'lost_interest' | 'found_better_challenge' | 'personal_issues' | 'other';
  additionalComments?: string;
  abandonedAt: string;
}

export interface ChallengeStats {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  totalParticipants: number;
  totalAmountSaved: number;
  averageCompletionRate: number;
  mostPopularType: string;
  averageChallengeDuration: number;
}

export interface UserChallengeHistory {
  userId: string;
  challenges: {
    challenge: SavingsChallenge;
    participation: ChallengeParticipant;
    stats: {
      totalSaved: number;
      completionRate: number;
      averageMonthlySaving: number;
      longestStreak: number;
    };
  }[];
  totalSaved: number;
  totalChallenges: number;
  completedChallenges: number;
  abandonedChallenges: number;
  averageCompletionRate: number;
}

// ==================== CURRENT CHALLENGE TYPES ====================

export interface CurrentChallenge {
  challengeId: string;
  challengeTitle: string;
  challengeType: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'CUSTOM';
  challengeStatus: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  totalParticipants: number;
  collectiveTarget: number;
  collectiveCurrentAmount: number;
  collectiveProgress: number;
  averageProgress: number;
  daysRemaining: number;
  startDate: string;
  endDate: string;
}

export interface CurrentChallengeProgress {
  challengeId: string;
  challengeTitle: string;
  challengeType: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'CUSTOM';
  challengeStatus: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  totalParticipants: number;
  collectiveTarget: number;
  collectiveCurrentAmount: number;
  collectiveProgress: number;
  averageProgress: number;
  daysRemaining: number;
  startDate: string;
  endDate: string;
}

export interface LeaderboardParticipant {
  rank: number;
  participantId: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    pictureProfilUrl?: string;
  };
  currentAmount: number;
  targetAmount: number;
  progress: number;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  joinedAt: string;
  isCurrentUser: boolean;
}

export interface CurrentChallengeLeaderboard {
  challengeId: string;
  challengeTitle: string;
  participants: LeaderboardParticipant[];
  totalParticipants: number;
  currentUserRank: number;
}

export interface Milestone {
  id: string;
  name: string;
  targetPercentage: number;
  targetAmount: number;
  currentAmount: number;
  isAchieved: boolean;
  achievedAt: string | null;
}

export interface CurrentChallengeMilestones {
  challengeId: string;
  challengeTitle: string;
  milestones: Milestone[];
  totalMilestones: number;
  achievedMilestones: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CurrentChallengeAchievements {
  challengeId: string;
  challengeTitle: string;
  achievements: Achievement[];
  totalAchievements: number;
  unlockedAchievements: number;
  completionRate: number;
}

export interface TimelineEntry {
  date: string;
  totalAmount: number;
  participantCount: number;
  averageAmount: number;
  milestones: string[];
}

export interface CurrentChallengeTimeline {
  challengeId: string;
  challengeTitle: string;
  period: 'daily' | 'weekly' | 'monthly';
  timeline: TimelineEntry[];
  totalDays: number;
  currentDay: number;
  daysRemaining: number;
  startDate: string;
  endDate: string;
}
