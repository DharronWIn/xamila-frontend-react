// ==================== DEFI TYPES ====================

export type DefiType = 'WEEKLY' | 'MONTHLY' | 'DAILY' | 'CUSTOM';
export type DefiStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type DefiVisibility = 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
export type ParticipantStatus = 'ACTIVE' | 'UPCOMING' | 'ABANDONED' | 'COMPLETED';
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';
export type AbandonReasonCategory = 'FINANCIAL' | 'PERSONAL' | 'TECHNICAL' | 'SATISFACTION' | 'OTHER';

// User info pour les relations
export interface DefiUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  pictureProfilUrl?: string;
}

// Helper pour formater les montants
export const formatCurrency = (amount: number, currency: string = 'XOF'): string => {
  return `${amount.toLocaleString()} ${currency}`;
};

// ==================== DEFI ====================
export interface Defi {
  id: string;
  title: string;
  description: string;
  type: DefiType;
  status: DefiStatus;
  startDate: string;
  endDate?: string;
  duration?: number; // en jours
  rewards: string[];
  maxParticipants?: number;
  isUnlimited: boolean;
  hasNoEndDate: boolean;
  isOfficial: boolean;
  visibility: DefiVisibility;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByUser?: DefiUser;
  
  // Computed fields
  _count?: {
    participants: number;
    transactions?: number;
  };
  
  // Collective progress
  targetAmount?: number;
  collectiveTarget?: number;
  collectiveCurrentAmount?: number;
  collectiveProgress?: number;
  totalAmountSaved?: number; // ⭐ NOUVEAU - Total épargné
  currency?: string; // ⭐ NOUVEAU - Devise
  
  // User specific
  isJoined?: boolean;
  hasAbandoned?: boolean;
  userParticipation?: DefiParticipant;
  
  // Relations
  participants?: DefiParticipant[];
}

// ==================== PARTICIPANT ====================
export interface DefiParticipant {
  id: string;
  userId: string;
  defiId: string;
  currentAmount: number;
  status: ParticipantStatus;
  joinedAt: string;
  abandonedAt?: string;
  completedAt?: string;
  
  // Relations
  user?: DefiUser;
  defi?: Defi;
  goal?: DefiGoal;
  transactions?: DefiTransaction[];
  abandonment?: DefiAbandonment;
}

// ==================== GOAL ====================
export interface DefiGoal {
  id: string;
  defiId: string;
  participantId: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  isAchieved: boolean;
  
  // Optional configuration
  currency?: string;
  monthlyIncome?: number;
  isVariableIncome?: boolean;
  incomeHistory?: number[];
  motivation?: string;
  additionalNotes?: string;
  bankAccountId?: string;
  
  createdAt: string;
  updatedAt: string;
  
  // Relations
  participant?: DefiParticipant;
}

// ==================== TRANSACTION ====================
export interface DefiTransaction {
  id: string;
  defiId: string;
  participantId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  date: string;
  createdAt: string;
  
  // Relations
  participant?: DefiParticipant;
}

// ==================== ABANDONMENT ====================
export interface DefiAbandonment {
  id: string;
  defiId: string;
  participantId: string;
  reasonCategory: AbandonReasonCategory;
  reason: string;
  additionalComments?: string;
  abandonedAt: string;
  
  // Relations
  participant?: DefiParticipant;
}

// ==================== STATISTICS ====================
export interface DefiStats {
  totalDefis: number;
  activeDefis: number;
  completedDefis: number;
  upcomingDefis: number;
  totalParticipants: number;
  totalTransactions: number;
  totalAmountSaved: number;
  currency: string;
}

export interface UserDefiStats {
  totalDefis: number;
  activeDefis: number;
  completedDefis: number;
  abandonedDefis: number;
  totalSaved: number;
  completionRate: number;
}

// ==================== DTOs (Data Transfer Objects) ====================

export interface CreateDefiDto {
  title: string;
  description: string;
  type: DefiType;
  startDate: string;
  endDate?: string;
  rewards: string[];
  isUnlimited: boolean;
  maxParticipants?: number;
  hasNoEndDate: boolean;
  visibility: DefiVisibility;
}

export interface UpdateDefiDto {
  title?: string;
  description?: string;
  type?: DefiType;
  startDate?: string;
  endDate?: string;
  rewards?: string[];
  maxParticipants?: number;
  isUnlimited?: boolean;
  hasNoEndDate?: boolean;
  visibility?: DefiVisibility;
  status?: DefiStatus;
}

export interface JoinDefiDto {
  targetAmount: number;
  mode: 'free' | 'forced';
  bankAccountId?: string;
  motivation?: string;
}

export interface ConfigureGoalDto {
  targetAmount: number;
  mode: 'free' | 'forced';
  currency?: string;
  monthlyIncome?: number;
  isVariableIncome?: boolean;
  incomeHistory?: number[];
  motivation?: string;
  additionalNotes?: string;
  bankAccountId?: string;
}

export interface UpdateGoalDto {
  targetAmount?: number;
  currency?: string;
  monthlyIncome?: number;
  isVariableIncome?: boolean;
  motivation?: string;
  additionalNotes?: string;
}

export interface AddTransactionDto {
  amount: number;
  type: TransactionType;
  description?: string;
  date?: string;
}

export interface AbandonDefiDto {
  reasonCategory: AbandonReasonCategory;
  reason: string;
  additionalComments?: string;
}

// ==================== QUERY PARAMS ====================
export interface DefiQueryParams {
  page?: number;
  limit?: number;
  type?: DefiType;
  status?: DefiStatus;
  search?: string;
  createdBy?: string;
  isOfficial?: boolean;
}

// ==================== RESPONSES ====================
export interface PaginatedDefiResponse {
  data: Defi[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DefiResponse {
  message: string;
  data: Defi;
}

export interface ParticipantResponse {
  message: string;
  data: {
    participant: DefiParticipant;
    goal?: DefiGoal;
  };
}

export interface TransactionResponse {
  message: string;
  data: DefiTransaction;
  newBalance: number;
}

export interface TransactionStatsResponse {
  totalTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
  currentBalance: number;
}

