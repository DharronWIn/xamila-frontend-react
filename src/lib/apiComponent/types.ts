// ==================== API TYPES ====================
// Types TypeScript correspondant aux DTOs du backend NestJS

// ==================== COMMON TYPES ====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string[];
  errors: string[];
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SocialPostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    total: number;
    page: number;
    totalPages: number;
  };
  message: string[];
  errors: string[];
}

export interface TransactionListResponse {
  success: boolean;
  data: {
    page: number;
    total: number;
    totalPages: number;
    transactions: Transaction[];
  };
  message: string[];
  errors: string[];
}

// ==================== AUTHENTICATION TYPES ====================
export interface GuestLoginDto {
  deviceId?: string;
  username?: string;
}

export interface RegisterDto {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  username?: string;
  country?: string;
  city?: string;
  gender?: 'M' | 'F' | 'Autre';
  ageRange?: string;
  whatsapp?: string;
  professionalStatus?: string;
  maxSavingsAmount?: string;
  password: string;
}

export interface LoginDto {
  login: string; // email or phone
  password: string;
}

export interface VerifyAccountDto {
  code: string;
}

export interface GuestConvertDto {
  email?: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateProfileDto {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  target: string; // email or phone
}

export interface ResetPasswordDto {
  target: string;
  code: string;
  newPassword: string;
}

export interface OtpLoginDto {
  target: string; // email or phone
}

export interface OtpVerifyDto {
  target: string;
  code: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  username?: string;
  deviceId?: string;
  firstName: string;
  lastName: string;
  name: string;
  avatar?: string;
  pictureProfilUrl?: string;
  country?: string;
  city?: string;
  gender?: string;
  ageRange?: string;
  whatsapp?: string;
  professionalStatus?: string;
  maxSavingsAmount?: string;
  savingsHabit?: string;
  currentSavingsLevel?: string;
  savingsUsage?: string;
  savingsChallenge?: string;
  previousChallengeExperience?: string;
  motivation?: string;
  challengeMode?: string;
  challengeFormula?: string;
  partnerAccounts?: string;
  expenseTracking?: string;
  futureInterest?: string;
  concerns?: string;
  challengeStartMonth?: string;
  isVerified: boolean;
  isActive: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// ==================== USER TYPES ====================
export interface UserStatsDto {
  totalSavings: number;
  activeGoals: number;
  completedChallenges: number;
  totalTransactions: number;
  monthlySavings: number;
  yearlySavings: number;
}

export interface UserActivityDto {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: unknown;
}

export interface UpgradePremiumDto {
  plan: 'FREE' | 'TRIAL' | 'PREMIUM' | 'SIX_MONTHS';
  durationInDays?: number;
}

export interface DowngradePremiumDto {
  reason?: string;
  effectiveDate?: string;
}

export interface StartTrialDto {
  startDate?: string;
}

export interface PremiumStatusResponseDto {
  isPremium: boolean;
  plan: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isTrial: boolean;
  canExtend: boolean;
  canCancel: boolean;
}

export interface SubscriptionHistoryDto {
  id: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
}

// ==================== CHALLENGE TYPES ====================
export interface CreateChallengeDto {
  title: string;
  description: string;
  type: 'monthly' | 'weekly' | 'daily' | 'custom';
  targetAmount: number;
  startDate: string;
  endDate: string;
  rewards: string[];
  maxParticipants?: number;
}

export interface UpdateChallengeDto {
  title?: string;
  description?: string;
  targetAmount?: number;
  startDate?: string;
  endDate?: string;
  rewards?: string[];
  maxParticipants?: number;
}

export interface JoinChallengeDto {
  targetAmount: number;
  mode: 'free' | 'forced';
  bankAccountId?: string;
  motivation?: string;
}

export interface AddTransactionDto {
  amount: number;
  description?: string;
  category?: string;
  date?: string;
}

export interface AbandonChallengeDto {
  reason: string;
  reasonCategory: 'financial_difficulty' | 'lost_interest' | 'found_better_challenge' | 'personal_issues' | 'other';
  additionalComments?: string;
}

export interface UpdateGoalDto {
  goalAmount?: number;
  personalMessage?: string;
}

export interface ConfigureGoalDto {
  goalAmount: number;
  personalMessage?: string;
  financialDetails?: {
    monthlyIncome?: number;
    monthlyExpenses?: number;
    savingsCapacity?: number;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'monthly' | 'weekly' | 'daily' | 'custom';
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  rewards: string[];
  maxParticipants?: number;
  participantCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ChallengeParticipant {
  id: string;
  userId: string;
  challengeId: string;
  goalAmount: number;
  currentAmount: number;
  personalMessage?: string;
  status: 'active' | 'completed' | 'abandoned';
  joinedAt: string;
  user: User;
}

export interface ChallengeTransaction {
  id: string;
  challengeId: string;
  participantId: string;
  amount: number;
  description?: string;
  category?: string;
  date: string;
  createdAt: string;
  participant: ChallengeParticipant;
}

export interface ChallengeStats {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  totalParticipants: number;
  totalAmount: number;
  averageParticipation: number;
}

export interface CollectiveProgress {
  challengeId: string;
  totalParticipants: number;
  totalAmount: number;
  targetAmount: number;
  progressPercentage: number;
  averageContribution: number;
  topContributors: ChallengeParticipant[];
  recentTransactions: ChallengeTransaction[];
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  challengeId: string;
  targetAmount: number;
  achievedAt: string;
  description: string;
}

export interface LeaderboardEntry {
  rank: number;
  participant: ChallengeParticipant;
  progressPercentage: number;
  consistency: number;
}

// ==================== FINANCIAL TYPES ====================
export interface CreateTransactionDto {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description?: string;
  date?: string;
}

export interface UpdateTransactionDto {
  amount?: number;
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
  description?: string;
  date?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionStatsDto {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNet: number;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface TransactionChartDataDto {
  incomeData: number[];
  expenseData: number[];
  labels: string[];
  categories: string[];
}

export const TRANSACTION_CATEGORIES = [
  'Alimentation',
  'Transport',
  'Logement',
  'Santé',
  'Éducation',
  'Divertissement',
  'Vêtements',
  'Épargne',
  'Investissement',
  'Autres',
] as const;

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number];

// ==================== SOCIAL TYPES ====================
export interface CreatePostDto {
  content: string;
  type: 'SAVINGS_MILESTONE' | 'MOTIVATION' | 'TIP' | 'QUESTION' | 'CELEBRATION';
  title?: string;
  amount?: number;
  goal?: string;
  images?: string[];
  isPublic?: boolean;
}

export interface UpdatePostDto {
  content?: string;
  type?: 'SAVINGS_MILESTONE' | 'MOTIVATION' | 'TIP' | 'QUESTION' | 'CELEBRATION';
  images?: string[];
  isPublic?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  type: 'SAVINGS_MILESTONE' | 'MOTIVATION' | 'TIP' | 'QUESTION' | 'CELEBRATION';
  title?: string | null;
  amount?: number | null;
  goal?: string | null;
  images?: string[];
  isPublic: boolean;
  likes?: number;
  shares?: number;
  commentsCount?: number;
  isLikedByCurrentUser?: boolean;
  isShared?: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  content: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  replies?: Comment[];
}

// ==================== NOTIFICATION TYPES ====================
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'SUCCESS' | 'WARNING' | 'INFO' | 'REMINDER';
  isRead: boolean;
  data?: unknown;
  createdAt: string;
  readAt?: string;
}

export interface NotificationResponseDto {
  id: string;
  title: string;
  message: string;
  type: 'SUCCESS' | 'WARNING' | 'INFO' | 'REMINDER';
  isRead: boolean;
  data?: unknown;
  createdAt: string;
  readAt?: string;
}

export type NotificationType = 'SUCCESS' | 'WARNING' | 'INFO' | 'REMINDER';

// ==================== RESOURCE TYPES ====================
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'PDF' | 'VIDEO' | 'TOOL';
  url: string;
  isPremium: boolean;
  category: string;
  downloadCount: number;
  fileSize?: number;
  duration?: number; // for videos
  createdAt: string;
  updatedAt: string;
}

export interface ResourceResponseDto {
  id: string;
  title: string;
  description: string;
  type: 'PDF' | 'VIDEO' | 'TOOL';
  url: string;
  isPremium: boolean;
  category: string;
  downloadCount: number;
  fileSize?: number;
  duration?: number;
  canDownload: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== SAVINGS TYPES ====================
export interface CreateSavingsGoalDto {
  title: string;
  description?: string;
  targetAmount: number;
  targetDate: string;
  category?: string;
  isPublic?: boolean;
}

export interface UpdateSavingsGoalDto {
  title?: string;
  description?: string;
  targetAmount?: number;
  targetDate?: string;
  category?: string;
  isPublic?: boolean;
}

export interface ContributeToGoalDto {
  amount: number;
  description?: string;
  date?: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category?: string;
  isPublic: boolean;
  isCompleted: boolean;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoalResponseDto {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category?: string;
  isPublic: boolean;
  isCompleted: boolean;
  progressPercentage: number;
  contributions: GoalContribution[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  description?: string;
  date: string;
  createdAt: string;
}

export interface SavingsStatsDto {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalSaved: number;
  monthlySaved: number;
  yearlySaved: number;
  averageGoalAmount: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface ChallengeResponseDto {
  id: string;
  title: string;
  description: string;
  type: 'monthly' | 'weekly' | 'daily' | 'custom';
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  rewards: string[];
  maxParticipants?: number;
  participantCount: number;
  isParticipant: boolean;
  userGoal?: UserGoal;
  createdAt: string;
  updatedAt: string;
}

export interface UserGoal {
  id: string;
  challengeId: string;
  userId: string;
  goalAmount: number;
  currentAmount: number;
  personalMessage?: string;
  status: 'active' | 'completed' | 'abandoned';
  joinedAt: string;
  progressPercentage: number;
}

export interface ContributeToChallengeDto {
  amount: number;
  description?: string;
  date?: string;
}

export interface ChallengeLeaderboardDto {
  rank: number;
  user: User;
  goalAmount: number;
  currentAmount: number;
  progressPercentage: number;
  consistency: number;
  joinedAt: string;
}

// ==================== BANK ACCOUNT TYPES ====================
export interface BankAccount {
  id: string;
  name: string;
  code: string;
  logo?: string;
  isActive: boolean;
  features: string[];
  requirements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountApplication {
  id: string;
  userId: string;
  bankId: string;
  accountType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  bank: BankAccount;
  user: User;
}

export interface CreateBankAccountApplicationDto {
  bankId: string;
  accountType: string;
  additionalInfo?: string;
}

// ==================== SETTINGS TYPES ====================
export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  challengeUpdates: boolean;
  goalReminders: boolean;
  socialActivity: boolean;
  systemUpdates: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showSavings: boolean;
  showChallenges: boolean;
  showSocialActivity: boolean;
}

export interface UpdateSettingsDto {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  currency?: string;
  notifications?: Partial<NotificationSettings>;
  privacy?: Partial<PrivacySettings>;
}

// ==================== ADMIN TYPES ====================
export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalChallenges: number;
  activeChallenges: number;
  totalSavings: number;
  monthlyRevenue: number;
  recentActivity: AdminActivity[];
  systemHealth: SystemHealth;
}

export interface AdminActivity {
  id: string;
  type: string;
  description: string;
  userId?: string;
  adminId: string;
  timestamp: string;
  metadata?: unknown;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  databaseStatus: 'connected' | 'disconnected';
  lastBackup: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string;
  lastLoginAt?: string;
  totalSavings: number;
  challengeCount: number;
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    premium: number;
    newThisMonth: number;
  };
  challenges: {
    total: number;
    active: number;
    completed: number;
    totalParticipants: number;
  };
  financial: {
    totalSavings: number;
    monthlySavings: number;
    averageSavings: number;
    revenue: number;
  };
  system: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    databaseSize: number;
  };
}

// ==================== PAYMENT TYPES ====================
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'SUBSCRIPTION' | 'CHALLENGE' | 'GOAL';
  method: 'MOMO' | 'CARD' | 'BANK_TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  reference: string;
  description?: string;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface MomoPaymentDto {
  amount: number;
  phone: string;
  description?: string;
}

export interface CardPaymentDto {
  amount: number;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  description?: string;
}

export interface PaymentStatusResponse {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount: number;
  reference: string;
  method: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

// ==================== QUERY PARAMETERS ====================
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ChallengeQueryParams extends PaginationParams {
  type?: 'monthly' | 'weekly' | 'daily' | 'custom';
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled';
  search?: string;
}

export interface TransactionQueryParams extends PaginationParams {
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
  year?: number;
  month?: number;
}

export interface PostQueryParams extends PaginationParams {
  type?: 'SAVINGS_MILESTONE' | 'MOTIVATION' | 'TIP' | 'QUESTION' | 'CELEBRATION';
}

export interface NotificationQueryParams extends PaginationParams {
  type?: NotificationType;
  status?: 'all' | 'read' | 'unread';
}

export interface ResourceQueryParams extends PaginationParams {
  category?: string;
  type?: 'PDF' | 'VIDEO' | 'TOOL';
  isPremium?: boolean;
}

// ==================== ERROR TYPES ====================
export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
  timestamp: string;
  path: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// ==================== ENUMS ====================
export enum ChallengeType {
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  DAILY = 'daily',
  CUSTOM = 'custom',
}

export enum ChallengeStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum PostType {
  SAVINGS_MILESTONE = 'SAVINGS_MILESTONE',
  MOTIVATION = 'MOTIVATION',
  TIP = 'TIP',
  QUESTION = 'QUESTION',
  CELEBRATION = 'CELEBRATION',
}

export type ResourceType = 'PDF' | 'VIDEO' | 'TOOL';

export type PaymentMethod = 'MOMO' | 'CARD' | 'BANK_TRANSFER';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  TRIAL = 'TRIAL',
  PREMIUM = 'PREMIUM',
  SIX_MONTHS = 'SIX_MONTHS',
}
