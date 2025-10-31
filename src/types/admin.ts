// ==================== ADMIN TYPES ====================

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AdminLoginRequest {
  identifier: string; // email ou username
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  admin: AdminUser;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ==================== USER MANAGEMENT TYPES ====================

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isGuest?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  isPremium?: boolean;
  isAdmin?: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  sortBy?: 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'firstName' | 'lastName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  isActive?: boolean;
  isVerified?: boolean;
  isPremium?: boolean;
  isAdmin?: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// Types pour les relations
export interface UserSubscription {
  id: string;
  plan: 'FREE' | 'PREMIUM' | 'PRO';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
}

export interface UserBankAccountApplication {
  id: string;
  bankName: string;
  accountType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface UserChallengeParticipant {
  id: string;
  challengeId: string;
  currentAmount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  mode: 'FREE' | 'PREMIUM';
  bankAccountId?: string;
  motivation?: string;
  abandonReason?: string;
  abandonCategory?: string;
  joinedAt: string;
  completedAt?: string;
  abandonedAt?: string;
  challenge: {
    id: string;
    title: string;
    type: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'CUSTOM';
    status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  };
}

export interface UserChallenge {
  id: string;
  title: string;
  description: string;
  type: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'CUSTOM';
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface UserSavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'SAVINGS' | 'TRANSFER';
  amount: number;
  category: string;
  description: string;
  createdAt: string;
}

export interface UserPost {
  id: string;
  content: string;
  createdAt: string;
}

export interface UserNotification {
  id: string;
  type: 'CHALLENGE_REMINDER' | 'GOAL_ACHIEVED' | 'PAYMENT_SUCCESS' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserPayment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  method: 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CARD';
  createdAt: string;
}

export interface UserComment {
  id: string;
  content: string;
  postId: string;
  createdAt: string;
}

export interface UserLike {
  id: string;
  postId: string;
  createdAt: string;
}

export interface UserCounts {
  challengeParticipants: number;
  challenges: number;
  savingsGoals: number;
  transactions: number;
  posts: number;
  notifications: number;
  payments: number;
  bankAccountApplications: number;
}

export interface UserResponse {
  // ===== INFORMATIONS DE BASE =====
  id: string;
  email: string;
  phone?: string;
  username?: string;
  firstName: string;
  lastName: string;
  name: string;
  avatar?: string;
  
  // ===== INFORMATIONS GÉOGRAPHIQUES =====
  country?: string;
  city?: string;
  gender?: string;
  ageRange?: string;
  whatsapp?: string;
  
  // ===== INFORMATIONS PROFESSIONNELLES =====
  professionalStatus?: string;
  
  // ===== INFORMATIONS FINANCIÈRES =====
  maxSavingsAmount?: number;
  savingsHabit?: string;
  currentSavingsLevel?: string;
  savingsUsage?: string;
  savingsChallenge?: string;
  previousChallengeExperience?: string;
  motivation?: string;
  challengeMode?: 'FREE' | 'PREMIUM' | 'PRO';
  challengeFormula?: string;
  partnerAccounts?: string;
  expenseTracking?: string;
  futureInterest?: string;
  concerns?: string;
  challengeStartMonth?: string;
  
  // ===== STATUTS ET PERMISSIONS =====
  isGuest: boolean;
  isVerified: boolean;
  isActive: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  premiumExpiresAt?: string;
  
  // ===== TIMESTAMPS =====
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  
  // ===== RELATIONS =====
  subscriptions?: UserSubscription[];
  bankAccountApplications?: UserBankAccountApplication[];
  challengeParticipants?: UserChallengeParticipant[];
  challenges?: UserChallenge[];
  savingsGoals?: UserSavingsGoal[];
  transactions?: UserTransaction[];
  posts?: UserPost[];
  notifications?: UserNotification[];
  payments?: UserPayment[];
  comments?: UserComment[];
  likes?: UserLike[];
  
  // ===== COMPTEURS =====
  _count?: UserCounts;
}

// Réponse brute de l'API
export interface ApiUsersResponse {
  data: UserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Réponse mappée pour l'utilisation interne
export interface UsersListResponse {
  users: UserResponse[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UpgradeUserRequest {
  plan?: 'PREMIUM' | 'SIX_MONTHS';
  durationInDays?: number;
}

export interface RejectUserRequest {
  reason?: string;
}

// ==================== DASHBOARD TYPES ====================

export interface DashboardStatsQuery {
  period?: '7d' | '30d' | '90d' | '1y';
}

export interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalGuests: number;
  verifiedUsers: number;
  activeUsers: number;
  premiumUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  userGrowth: {
    date: string;
    count: number;
  }[];
  systemHealth: {
    status: string;
    uptime: number;
    database: string;
    cache: string;
  };
  // Propriétés optionnelles pour compatibilité
  pendingUsers?: number;
  totalRevenue?: number;
  monthlyRevenue?: number;
  totalTransactions?: number;
  monthlyTransactions?: number;
  totalBankAccounts?: number;
  pendingBankAccounts?: number;
  totalResources?: number;
  totalNotifications?: number;
  monthlyNotifications?: number;
  revenueGrowth?: {
    period: string;
    amount: number;
  }[];
  transactionGrowth?: {
    period: string;
    count: number;
  }[];
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  pendingUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  userGrowth: {
    period: string;
    count: number;
  }[];
  premiumGrowth: {
    period: string;
    count: number;
  }[];
  verificationRate: number;
  premiumConversionRate: number;
}

export interface AdminStats {
  totalAdmins: number;
  activeAdmins: number;
  adminActivity: {
    period: string;
    actions: number;
  }[];
}

// ==================== SYSTEM SETTINGS TYPES ====================

export interface SystemSettingQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
  sortBy?: 'createdAt' | 'updatedAt' | 'key';
  sortOrder?: 'asc' | 'desc';
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CreateSystemSettingRequest {
  key: string;
  value: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category?: string;
  isPublic?: boolean;
}

export interface UpdateSystemSettingRequest {
  value: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category?: string;
  isPublic?: boolean;
}

export interface SystemSettingsListResponse {
  settings: SystemSetting[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SettingsByCategory {
  [category: string]: SystemSetting[];
}

// ==================== BANK ACCOUNTS TYPES ====================

export interface BankAccountApplication {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  documents: {
    id: string;
    type: string;
    url: string;
    uploadedAt: string;
  }[];
}

export interface BankAccountApplicationsResponse {
  applications: BankAccountApplication[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BankAccountStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  approvalRate: number;
  averageProcessingTime: number;
  monthlyApplications: {
    period: string;
    count: number;
  }[];
}

export interface ReviewBankAccountRequest {
  notes?: string;
}

// ==================== NOTIFICATIONS TYPES ====================

export interface BroadcastNotificationRequest {
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  targetUsers?: string[]; // IDs des utilisateurs cibles (optionnel)
  targetGroups?: string[]; // Groupes cibles (optionnel)
  scheduledFor?: string; // Date de programmation (optionnel)
  isUrgent?: boolean;
}

export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  isUrgent: boolean;
  scheduledFor?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsListResponse {
  notifications: NotificationResponse[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface NotificationStats {
  totalNotifications: number;
  sentNotifications: number;
  deliveredNotifications: number;
  readNotifications: number;
  failedNotifications: number;
  deliveryRate: number;
  readRate: number;
  monthlyNotifications: {
    period: string;
    count: number;
  }[];
  notificationsByType: {
    type: string;
    count: number;
  }[];
}

// ==================== RESOURCES TYPES ====================

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LINK' | 'COURSE';
  category: string;
  isPremium: boolean;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // en secondes
  fileSize?: number; // en bytes
  downloadCount: number;
  viewCount: number;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateResourceRequest {
  title: string;
  description: string;
  type: 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LINK' | 'COURSE';
  category: string;
  isPremium: boolean;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  tags?: string[];
}

export interface UpdateResourceRequest {
  title?: string;
  description?: string;
  type?: 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LINK' | 'COURSE';
  category?: string;
  isPremium?: boolean;
  url?: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  isActive?: boolean;
  tags?: string[];
}

export interface ResourcesListResponse {
  resources: Resource[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ResourceStats {
  totalResources: number;
  activeResources: number;
  premiumResources: number;
  freeResources: number;
  totalDownloads: number;
  totalViews: number;
  averageRating: number;
  resourcesByType: {
    type: string;
    count: number;
  }[];
  resourcesByCategory: {
    category: string;
    count: number;
  }[];
  monthlyDownloads: {
    period: string;
    count: number;
  }[];
  monthlyViews: {
    period: string;
    count: number;
  }[];
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ==================== CHALLENGE TYPES ====================

export interface Challenge {
  id: string;
  title: string;
  description: string;
  challengeRule?: string;
  type: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'CUSTOM';
  targetAmount?: number;
  duration?: number;
  startDate: string;
  endDate: string;
  rewards: string[];
  maxParticipants?: number;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  participants?: Array<{
    id: string;
    userId: string;
    currentAmount: number;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByUser?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  _count?: {
    participants: number;
  };
}

export interface CreateChallengeRequest {
  title: string;
  description: string;
  challengeRule?: string;
  startDate: string;
  endDate: string;
  rewards: string[];
}

export interface UpdateChallengeRequest {
  title?: string;
  description?: string;
  challengeRule?: string;
  startDate?: string;
  endDate?: string;
  rewards?: string[];
  status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface ChallengeQueryParams {
  status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'participants';
  sortOrder?: 'asc' | 'desc';
}

export interface ChallengesListResponse {
  challenges: Challenge[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiChallengesResponse {
  data: Challenge[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ChallengeStats {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  upcomingChallenges: number;
  totalParticipants: number;
  totalAmountSaved: number;
  averageParticipantsPerChallenge: number;
  successRate: number;
}

export interface ChallengeParticipant {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  challengeId: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  status: 'active' | 'completed' | 'abandoned';
  joinedAt: string;
  completedAt?: string;
  abandonedAt?: string;
}

export interface ChallengeDetails {
  id: string;
  title: string;
  description: string;
  type: 'monthly' | 'weekly' | 'daily' | 'custom';
  targetAmount?: number;
  startDate: string;
  endDate: string;
  rewards: string[];
  maxParticipants?: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  participantCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  participants: ChallengeParticipant[];
  totalParticipants: number;
  totalAmountSaved: number;
  averageProgress: number;
  leaderboard: ChallengeParticipant[];
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    targetAmount: number;
    achievedAt?: string;
    achievedBy?: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    achievedAt: string;
    achievedBy: string;
  }>;
}

// ==================== DEFIS TYPES ====================

export interface Defi {
  id: string;
  title: string;
  description: string;
  type: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'CUSTOM';
  targetAmount?: number;
  startDate: string;
  endDate: string;
  isOfficial: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDefiRequest {
  title: string;
  description: string;
  type: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'CUSTOM';
  targetAmount?: number;
  startDate: string;
  endDate: string;
  isOfficial?: boolean;
}

export interface UpdateDefiRequest {
  title?: string;
  description?: string;
  type?: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'CUSTOM';
  targetAmount?: number;
  startDate?: string;
  endDate?: string;
  isOfficial?: boolean;
  status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface DefiQueryParams {
  page?: number;
  limit?: number;
  type?: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'CUSTOM';
  status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  isOfficial?: boolean;
  createdBy?: string;
  search?: string;
}

export interface DefisListResponse {
  defis: Defi[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DefiStats {
  total: number;
  active: number;
  completed: number;
  upcoming: number;
  cancelled: number;
  totalParticipants: number;
  totalAmountSaved: number;
}

export interface DefiParticipant {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  defiId: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  status: 'active' | 'completed' | 'abandoned';
  joinedAt: string;
  completedAt?: string;
  abandonedAt?: string;
}

// ==================== FINANCIAL TRANSACTIONS TYPES ====================

export interface FinancialTransaction {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  date: string;
  isEpargne: boolean;
  isLiberation: boolean;
  challengeId?: string;
  defiId?: string;
  createdAt: string;
}

export interface FinancialTransactionQueryParams {
  page?: number;
  limit?: number;
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
  userId?: string;
}

export interface FinancialTransactionsListResponse {
  transactions: FinancialTransaction[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FinancialTransactionStats {
  total: number;
  income: {
    total: number;
    count: number;
    average: number;
  };
  expense: {
    total: number;
    count: number;
    average: number;
  };
  byCategory: Array<{
    category: string;
    total: number;
    count: number;
  }>;
}

export interface UpdateFinancialTransactionRequest {
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
}

export interface FinancialGlobalFlux {
  totalUsers: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

// ==================== SAVINGS GOALS TYPES ====================

export interface SavingsGoal {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface SavingsGoalQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
}

export interface SavingsGoalsListResponse {
  goals: SavingsGoal[];
  total: number;
  page: number;
}

export interface UpdateSavingsGoalRequest {
  title?: string;
  targetAmount?: number;
  deadline?: string;
}

export interface SavingsChallenge {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  title: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface SavingsStats {
  goals: {
    total: number;
    totalTargetAmount: number;
    totalCurrentAmount: number;
    averageTargetAmount: number;
  };
  challenges: {
    total: number;
    totalSaved: number;
  };
  global: {
    totalTargetAmount: number;
    totalCurrentAmount: number;
  };
}

// ==================== SOCIAL TYPES ====================

export interface SocialPost {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  title?: string;
  content: string;
  type: 'SAVINGS_MILESTONE' | 'MOTIVATION' | 'TIP' | 'QUESTION' | 'CELEBRATION';
  amount?: number;
  goal?: string;
  images: string[];
  likes: number;
  shares: number;
  commentsCount: number;
  likesCount: number;
  createdAt: string;
}

export interface SocialPostQueryParams {
  page?: number;
  limit?: number;
  type?: 'SAVINGS_MILESTONE' | 'MOTIVATION' | 'TIP' | 'QUESTION' | 'CELEBRATION';
  userId?: string;
}

export interface SocialPostsListResponse {
  posts: SocialPost[];
  total: number;
  page: number;
}

export interface UpdateSocialPostRequest {
  title?: string;
  content?: string;
}

export interface ToggleSocialPostVisibleRequest {
  visible: boolean;
}

export interface SocialComment {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  postId: string;
  content: string;
  createdAt: string;
}

export interface SocialCommentQueryParams {
  page?: number;
  limit?: number;
  postId?: string;
  userId?: string;
}

export interface SocialStats {
  posts: {
    total: number;
    totalLikes: number;
    totalShares: number;
  };
  comments: {
    total: number;
  };
  likes: {
    total: number;
  };
}

// ==================== GAMIFICATION TYPES ====================

export interface Trophy {
  id: string;
  name: string;
  nameEn: string;
  nameFr: string;
  description?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  category: 'SAVINGS' | 'CHALLENGE' | 'SOCIAL' | 'GENERAL';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  icon: string;
  points: number;
  condition: {
    type: string;
    value: number;
  };
  isSecret: boolean;
  isActive: boolean;
  totalUnlocked?: number;
  unlockedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrophyRequest {
  name: string;
  nameEn: string;
  nameFr: string;
  description?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  category: 'SAVINGS' | 'CHALLENGE' | 'SOCIAL' | 'GENERAL';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  icon: string;
  points: number;
  condition: {
    type: string;
    value: number;
  };
  isSecret?: boolean;
}

export interface UpdateTrophyRequest {
  name?: string;
  nameEn?: string;
  nameFr?: string;
  description?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  category?: 'SAVINGS' | 'CHALLENGE' | 'SOCIAL' | 'GENERAL';
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  icon?: string;
  points?: number;
  condition?: {
    type: string;
    value: number;
  };
  isSecret?: boolean;
  isActive?: boolean;
}

export interface TrophyQueryParams {
  page?: number;
  limit?: number;
  category?: 'SAVINGS' | 'CHALLENGE' | 'SOCIAL' | 'GENERAL';
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface TrophiesListResponse {
  trophies: Trophy[];
  total: number;
  page: number;
}

export interface Badge {
  id: string;
  name: string;
  nameEn: string;
  nameFr: string;
  description?: string;
  type: 'RANK' | 'ACHIEVEMENT' | 'SPECIAL';
  icon: string;
  color: string;
  requirement: {
    type: string;
    value: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBadgeRequest {
  name: string;
  nameEn: string;
  nameFr: string;
  description?: string;
  type: 'RANK' | 'ACHIEVEMENT' | 'SPECIAL';
  icon: string;
  color: string;
  requirement: {
    type: string;
    value: number;
  };
}

export interface UpdateBadgeRequest {
  name?: string;
  nameEn?: string;
  nameFr?: string;
  description?: string;
  type?: 'RANK' | 'ACHIEVEMENT' | 'SPECIAL';
  icon?: string;
  color?: string;
  requirement?: {
    type: string;
    value: number;
  };
}

export interface BadgeQueryParams {
  page?: number;
  limit?: number;
  type?: 'RANK' | 'ACHIEVEMENT' | 'SPECIAL';
}

export interface BadgesListResponse {
  badges: Badge[];
  total: number;
  page: number;
}

export interface GamificationUserData {
  trophies: Trophy[];
  badges: Badge[];
  level: {
    level: number;
    currentXP: number;
    totalXP: number;
    xpToNextLevel: number;
    rank: string;
  };
}

export interface GamificationStats {
  trophies: {
    total: number;
    totalUnlocked: number;
    averagePoints: number;
  };
  badges: {
    total: number;
  };
  levels: {
    totalUsers: number;
    averageLevel: number;
    averageXP: number;
    maxLevel: number;
    maxXP: number;
  };
  topUsers: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    level: number;
    totalXP: number;
    trophiesCount: number;
    badgesCount: number;
  }>;
}

export interface GamificationLeaderboardEntry {
  rank: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  level: number;
  totalXP: number;
  rankName: string;
  trophiesCount: number;
  badgesCount: number;
}

// ==================== FINEOPAY PAYMENTS TYPES ====================

export interface FineoPayPayment {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'SUBSCRIPTION' | 'CHALLENGE';
  method: 'MOMO' | 'CARD' | 'BANK_TRANSFER';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'DONE' | 'SUSPECT' | 'FAILURE';
  transactionRef: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface FineoPayPaymentQueryParams {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'DONE' | 'SUSPECT' | 'FAILURE';
  userId?: string;
  method?: 'MOMO' | 'CARD' | 'BANK_TRANSFER';
}

export interface FineoPayPaymentsListResponse {
  payments: FineoPayPayment[];
  total: number;
  page: number;
}

export interface FineoPayPaymentStats {
  total: number;
  success: {
    total: number;
    count: number;
    average: number;
  };
  pending: {
    total: number;
    count: number;
  };
  failed: {
    total: number;
    count: number;
  };
  byMethod: Array<{
    method: string;
    total: number;
    count: number;
  }>;
  byStatus: Array<{
    status: string;
    total: number;
    count: number;
  }>;
}

export interface FineoPayPaymentsByStatusParams {
  status: string;
  page?: number;
  limit?: number;
}

export interface FineoPayRevenueQuery {
  startDate?: string;
  endDate?: string;
}

export interface FineoPayRevenue {
  total: {
    revenue: number;
    count: number;
  };
  today: {
    revenue: number;
    count: number;
  };
  monthly: Array<{
    period: string;
    revenue: number;
    count: number;
  }>;
}

// ==================== SUBSCRIPTIONS TYPES ====================

export interface Subscription {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  plan: 'FREE' | 'TRIAL' | 'PREMIUM' | 'SIX_MONTHS';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  cancelledAt?: string;
  createdAt: string;
}

export interface SubscriptionQueryParams {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  plan?: 'FREE' | 'TRIAL' | 'PREMIUM' | 'SIX_MONTHS';
  userId?: string;
}

export interface SubscriptionsListResponse {
  subscriptions: Subscription[];
  total: number;
  page: number;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  byStatus: Array<{
    status: string;
    count: number;
  }>;
  byPlan: Array<{
    plan: string;
    count: number;
  }>;
}

export interface ExtendSubscriptionRequest {
  durationInDays: number;
}

export interface SubscriptionRevenueQuery {
  startDate?: string;
  endDate?: string;
}

export interface SubscriptionRevenue {
  totalRevenue: number;
  paymentCount: number;
  activeSubscriptions: number;
  averageRevenue: number;
}

// ==================== COACHING REQUESTS TYPES ====================

export interface CoachingRequest {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  subject: string;
  message: string;
  preferredTimes?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
  createdAt: string;
}

export interface CoachingRequestQueryParams {
  page?: number;
  limit?: number;
  status?: 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
  search?: string;
}

export interface CoachingRequestsListResponse {
  requests: CoachingRequest[];
  total: number;
  page: number;
}

export interface UpdateCoachingRequestStatusRequest {
  status: 'PENDING' | 'IN_PROGRESS' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
}
