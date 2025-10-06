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
  activeUsers: number;
  premiumUsers: number;
  pendingUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  monthlyTransactions: number;
  totalBankAccounts: number;
  pendingBankAccounts: number;
  totalResources: number;
  totalNotifications: number;
  monthlyNotifications: number;
  userGrowth: {
    period: string;
    count: number;
  }[];
  revenueGrowth: {
    period: string;
    amount: number;
  }[];
  transactionGrowth: {
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
  startDate: string;
  endDate: string;
  rewards: string[];
}

export interface UpdateChallengeRequest {
  title?: string;
  description?: string;
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
