import { useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import {
  AdminLoginRequest,
  AdminLoginResponse,
  ChangePasswordRequest,
  UserQueryParams,
  UsersListResponse,
  UserResponse,
  UpdateUserRequest,
  UpgradeUserRequest,
  RejectUserRequest,
  DashboardStatsQuery,
  DashboardStats,
  UserStats,
  AdminStats,
  SystemSettingQuery,
  SystemSettingsListResponse,
  SystemSetting,
  CreateSystemSettingRequest,
  UpdateSystemSettingRequest,
  SettingsByCategory,
  BankAccountApplicationsResponse,
  BankAccountStats,
  ReviewBankAccountRequest,
  BroadcastNotificationRequest,
  NotificationsListResponse,
  NotificationStats,
  Resource,
  CreateResourceRequest,
  Challenge,
  CreateChallengeRequest,
  UpdateChallengeRequest,
  ChallengeQueryParams,
  ChallengesListResponse,
  ChallengeStats,
  ChallengeDetails,
  ChallengeParticipant,
  UpdateResourceRequest,
  ResourceStats,
  ApiResponse,
  BankAccountApplication,
  NotificationResponse,
  SocialPost,
  SocialPostQueryParams, UpdateSocialPostRequest,
  SocialComment,
  SocialCommentQueryParams,
  SocialStats,
  Defi,
  CreateDefiRequest,
  UpdateDefiRequest,
  DefiQueryParams,
  DefisListResponse,
  DefiStats,
  DefiParticipant,
  FinancialTransaction,
  FinancialTransactionQueryParams,
  FinancialTransactionsListResponse,
  FinancialTransactionStats,
  UpdateFinancialTransactionRequest,
  FinancialGlobalFlux,
  SavingsGoal,
  SavingsGoalQueryParams, UpdateSavingsGoalRequest,
  SavingsChallenge,
  SavingsStats,
  Trophy,
  CreateTrophyRequest,
  UpdateTrophyRequest,
  TrophyQueryParams,
  TrophiesListResponse,
  Badge,
  CreateBadgeRequest,
  UpdateBadgeRequest,
  BadgeQueryParams,
  BadgesListResponse,
  GamificationUserData,
  GamificationStats,
  GamificationLeaderboardEntry,
  FineoPayPayment,
  FineoPayPaymentQueryParams,
  FineoPayPaymentsListResponse,
  FineoPayPaymentStats,
  FineoPayPaymentsByStatusParams,
  FineoPayRevenueQuery,
  FineoPayRevenue,
  Subscription,
  SubscriptionQueryParams,
  SubscriptionsListResponse,
  SubscriptionStats,
  ExtendSubscriptionRequest,
  SubscriptionRevenueQuery,
  SubscriptionRevenue,
  CoachingRequest,
  CoachingRequestQueryParams,
  CoachingRequestsListResponse,
  UpdateCoachingRequestStatusRequest
} from '../../../types/admin';

// ==================== ADMIN AUTHENTICATION HOOKS ====================

export const useAdminAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: AdminLoginRequest): Promise<AdminLoginResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.auth.login(credentials);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.auth.getProfile();
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du profil';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordRequest): Promise<ApiResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.auth.changePassword(data);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    login,
    getProfile,
    changePassword
  };
};

// ==================== DASHBOARD HOOKS ====================

export const useAdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDashboardStats = useCallback(async (query?: DashboardStatsQuery): Promise<DashboardStats | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.dashboard.getDashboardStats(query);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserStats = useCallback(async (): Promise<UserStats | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.dashboard.getUserStats();
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques utilisateurs';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAdminStats = useCallback(async (): Promise<AdminStats | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.dashboard.getAdminStats();
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques admins';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getDashboardStats,
    getUserStats,
    getAdminStats
  };
};

// ==================== USER MANAGEMENT HOOKS ====================

export const useAdminUsers = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const getUsers = useCallback(async (query?: UserQueryParams): Promise<UsersListResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.users.getUsers(query);
      setUsers(response.users);
      setPagination({
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrev: response.hasPrev
      });
      setIsInitialized(true);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des utilisateurs';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPendingUsers = useCallback(async (query?: UserQueryParams): Promise<UsersListResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.users.getPendingUsers(query);
      setUsers(response.users);
      setPagination({
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrev: response.hasPrev
      });
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des utilisateurs en attente';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (id: string): Promise<UserResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.users.getUserById(id);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération de l\'utilisateur';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: UpdateUserRequest): Promise<UserResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.users.updateUser(id, data);
      // Mettre à jour la liste locale en fusionnant les données
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, ...response }
          : user
      ));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'utilisateur';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleUserActive = useCallback(async (id: string): Promise<UserResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.users.toggleUserActive(id);
      // Mettre à jour seulement la propriété isActive de l'utilisateur
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, isActive: response.isActive }
          : user
      ));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification de l\'état de l\'utilisateur';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleUserVerified = useCallback(async (id: string): Promise<UserResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.users.toggleUserVerified(id);
      // Mettre à jour seulement la propriété isVerified de l'utilisateur
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, isVerified: response.isVerified }
          : user
      ));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification de l\'état de vérification';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string): Promise<ApiResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.users.deleteUser(id);
      // Retirer de la liste locale
      setUsers(prev => prev.filter(user => user.id !== id));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'utilisateur';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveUser = useCallback(async (id: string): Promise<UserResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.users.approveUser(id);
      // Mettre à jour seulement la propriété approvalStatus de l'utilisateur
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, approvalStatus: response.approvalStatus }
          : user
      ));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'approbation de l\'utilisateur';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejectUser = useCallback(async (id: string, data: RejectUserRequest): Promise<UserResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.users.rejectUser(id, data);
      // Mettre à jour seulement la propriété approvalStatus de l'utilisateur
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, approvalStatus: response.approvalStatus }
          : user
      ));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du rejet de l\'utilisateur';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upgradeUserToPremium = useCallback(async (id: string, data: UpgradeUserRequest): Promise<UserResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.users.upgradeUserToPremium(id, data);
      // Mettre à jour seulement les propriétés premium de l'utilisateur
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, isPremium: response.isPremium, premiumExpiresAt: response.premiumExpiresAt }
          : user
      ));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à niveau vers Premium';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveAndUpgradeToPremium = useCallback(async (id: string, data: UpgradeUserRequest): Promise<UserResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.users.approveAndUpgradeToPremium(id, data);
      // Mettre à jour les propriétés approvalStatus et premium de l'utilisateur
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, approvalStatus: response.approvalStatus, isPremium: response.isPremium, premiumExpiresAt: response.premiumExpiresAt }
          : user
      ));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'approbation et mise à niveau';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const regenerateUserAccess = useCallback(async (id: string): Promise<UserResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.users.regenerateUserAccess(id);
      // Mettre à jour l'utilisateur dans la liste locale
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, ...response }
          : user
      ));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la régénération des identifiants';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    pagination,
    isInitialized,
    getUsers,
    getPendingUsers,
    getUserById,
    updateUser,
    toggleUserActive,
    toggleUserVerified,
    deleteUser,
    approveUser,
    rejectUser,
    upgradeUserToPremium,
    approveAndUpgradeToPremium,
    regenerateUserAccess
  };
};

// ==================== SYSTEM SETTINGS HOOKS ====================

export const useAdminSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const getSettings = useCallback(async (query?: SystemSettingQuery): Promise<SystemSettingsListResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.system.getSettings(query);
      setSettings(response.settings);
      setPagination({
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrev: response.hasPrev
      });
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des paramètres';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSettingsByCategory = useCallback(async (): Promise<SettingsByCategory | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.system.getSettingsByCategory();
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des paramètres par catégorie';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSettingByKey = useCallback(async (key: string): Promise<SystemSetting | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.system.getSettingByKey(key);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du paramètre';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSetting = useCallback(async (data: CreateSystemSettingRequest): Promise<SystemSetting | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.system.createSetting(data);
      // Ajouter à la liste locale
      setSettings(prev => [response, ...prev]);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du paramètre';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async (key: string, data: UpdateSystemSettingRequest): Promise<SystemSetting | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.system.updateSetting(key, data);
      // Mettre à jour la liste locale
      setSettings(prev => prev.map(setting => setting.key === key ? response : setting));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du paramètre';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSetting = useCallback(async (key: string): Promise<ApiResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.system.deleteSetting(key);
      // Retirer de la liste locale
      setSettings(prev => prev.filter(setting => setting.key !== key));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du paramètre';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    settings,
    isLoading,
    error,
    pagination,
    getSettings,
    getSettingsByCategory,
    getSettingByKey,
    createSetting,
    updateSetting,
    deleteSetting
  };
};

// ==================== BANK ACCOUNTS HOOKS ====================

export const useAdminBankAccounts = () => {
  const [applications, setApplications] = useState<BankAccountApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const getApplications = useCallback(async (page: number = 1, limit: number = 20, status?: string): Promise<BankAccountApplicationsResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.bankAccounts.getApplications(page, limit, status);
      setApplications(response.applications);
      setPagination({
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrev: response.hasPrev
      });
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des demandes';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getApplicationStats = useCallback(async (): Promise<BankAccountStats | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.bankAccounts.getApplicationStats();
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveApplication = useCallback(async (id: string): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.bankAccounts.approveApplication(id);
      // Mettre à jour la liste locale
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: 'APPROVED' } : app));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'approbation';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejectApplication = useCallback(async (id: string, data: ReviewBankAccountRequest): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.bankAccounts.rejectApplication(id, data);
      // Mettre à jour la liste locale
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: 'REJECTED' } : app));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du rejet';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    applications,
    isLoading,
    error,
    pagination,
    getApplications,
    getApplicationStats,
    approveApplication,
    rejectApplication
  };
};

// ==================== NOTIFICATIONS HOOKS ====================

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const broadcastNotification = useCallback(async (data: BroadcastNotificationRequest): Promise<ApiResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.notifications.broadcastNotification(data);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la notification';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getNotifications = useCallback(async (page: number = 1, limit: number = 50, type?: string, status?: string): Promise<NotificationsListResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.notifications.getNotifications(page, limit, type, status);
      setNotifications(response.notifications);
      setPagination({
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrev: response.hasPrev
      });
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des notifications';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getNotificationStats = useCallback(async (period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<NotificationStats | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.notifications.getNotificationStats(period);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    notifications,
    isLoading,
    error,
    pagination,
    broadcastNotification,
    getNotifications,
    getNotificationStats
  };
};

// ==================== RESOURCES HOOKS ====================

export const useAdminResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createResource = useCallback(async (data: CreateResourceRequest): Promise<Resource | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.resources.createResource(data);
      // Ajouter à la liste locale
      setResources(prev => [response, ...prev]);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la ressource';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getResources = useCallback(async (): Promise<Resource[] | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.resources.getResources();
      setResources(response);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des ressources';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getResourceStats = useCallback(async (): Promise<ResourceStats | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.resources.getResourceStats();
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getResourceById = useCallback(async (id: string): Promise<Resource | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.resources.getResourceById(id);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération de la ressource';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateResource = useCallback(async (id: string, data: UpdateResourceRequest): Promise<Resource | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.resources.updateResource(id, data);
      // Mettre à jour la liste locale
      setResources(prev => prev.map(resource => resource.id === id ? response : resource));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la ressource';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteResource = useCallback(async (id: string): Promise<ApiResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.resources.deleteResource(id);
      // Retirer de la liste locale
      setResources(prev => prev.filter(resource => resource.id !== id));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la ressource';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    resources,
    isLoading,
    error,
    createResource,
    getResources,
    getResourceStats,
    getResourceById,
    updateResource,
    deleteResource
  };
};

// ==================== ADMIN SAVINGS GOALS HOOKS ====================

export const useAdminSavingsGoals = () => {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSavingsGoals = useCallback(async (query?: SavingsGoalQueryParams): Promise<SavingsGoal[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.savings.getSavingsGoals(query);
      setSavingsGoals(response.goals);
      return response.goals;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des objectifs d\'épargne';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSavingsGoalStats = useCallback(async (): Promise<SavingsStats> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.savings.getSavingsStats();
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSavingsGoal = useCallback(async (id: string, data: UpdateSavingsGoalRequest): Promise<SavingsGoal> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.savings.updateSavingsGoal(id, data);
      setSavingsGoals(prev => prev.map(goal => goal.id === id ? response : goal));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'objectif';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSavingsGoal = useCallback(async (id: string): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.savings.deleteSavingsGoal(id);
      setSavingsGoals(prev => prev.filter(goal => goal.id !== id));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'objectif';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSavingsGoalById = useCallback(async (id: string): Promise<SavingsGoal | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.savings.getSavingsGoalById(id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération de l\'objectif';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSavingsChallenges = useCallback(async (query?: SavingsGoalQueryParams): Promise<SavingsChallenge[]> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.savings.getSavingsChallenges(query);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des challenges';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSavingsChallengeById = useCallback(async (id: string): Promise<SavingsChallenge | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.savings.getSavingsChallengeById(id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du challenge';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCollectiveProgress = useCallback(async (): Promise<unknown> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.savings.getCollectiveProgress();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du progrès';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    savingsGoals,
    isLoading,
    error,
    getSavingsGoals,
    getSavingsGoalById,
    getSavingsGoalStats,
    updateSavingsGoal,
    deleteSavingsGoal,
    getSavingsChallenges,
    getSavingsChallengeById,
    getCollectiveProgress
  };
};

// ==================== ADMIN SOCIAL MANAGEMENT HOOKS ====================

export const useAdminSocial = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPosts = useCallback(async (query?: SocialPostQueryParams): Promise<SocialPost[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.social.getPosts(query);
      setPosts(response.posts);
      return response.posts;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des posts';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getComments = useCallback(async (query?: SocialCommentQueryParams): Promise<SocialComment[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.social.getComments(query);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des commentaires';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSocialStats = useCallback(async (): Promise<SocialStats> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.social.getSocialStats();
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (postId: string): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.social.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du post';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.social.deleteComment(commentId);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du commentaire';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (id: string, data: UpdateSocialPostRequest): Promise<SocialPost> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.social.updatePost(id, data);
      setPosts(prev => prev.map(post => post.id === id ? response : post));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du post';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const togglePostVisible = useCallback(async (id: string, visible: boolean): Promise<SocialPost> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.social.togglePostVisible(id, visible);
      setPosts(prev => prev.map(post => post.id === id ? response : post));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification de la visibilité';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPostById = useCallback(async (id: string): Promise<SocialPost | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.social.getPostById(id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du post';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReports = useCallback(async (): Promise<unknown[]> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.social.getReports();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des signalements';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    posts,
    isLoading,
    error,
    getPosts,
    getPostById,
    getComments,
    getSocialStats,
    deletePost,
    deleteComment,
    updatePost,
    togglePostVisible,
    getReports
  };
};

// ==================== ADMIN CHALLENGES MANAGEMENT HOOKS ====================

export const useAdminChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const getChallenges = useCallback(async (query?: ChallengeQueryParams): Promise<ChallengesListResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.challenges.getChallenges(query);
      setChallenges(response.challenges);
      setPagination({
        page: response.page,
        limit: query?.limit || 10,
        total: response.total,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrev: response.hasPrev
      });
      setIsInitialized(true);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des défis';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChallengeStats = useCallback(async (): Promise<ChallengeStats | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.challenges.getChallengeStats();
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChallengeById = useCallback(async (id: string): Promise<ChallengeDetails | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.challenges.getChallengeById(id);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du défi';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createChallenge = useCallback(async (data: CreateChallengeRequest): Promise<Challenge | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.challenges.createChallenge(data);
      // Recharger la liste des challenges
      await getChallenges();
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du défi';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getChallenges]);

  const updateChallenge = useCallback(async (id: string, data: UpdateChallengeRequest): Promise<Challenge | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.challenges.updateChallenge(id, data);
      // Mettre à jour la liste locale
      setChallenges(prev => prev.map(challenge => 
        challenge.id === id ? { ...challenge, ...response } : challenge
      ));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du défi';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteChallenge = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await adminService.challenges.deleteChallenge(id);
      // Retirer de la liste locale
      setChallenges(prev => prev.filter(challenge => challenge.id !== id));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du défi';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChallengeParticipants = useCallback(async (id: string): Promise<ChallengeParticipant[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.challenges.getChallengeParticipants(id);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des participants';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChallengeTransactions = useCallback(async (id: string, participantId?: string): Promise<unknown[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.challenges.getChallengeTransactions(id, participantId);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des transactions';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleChallengeActive = useCallback(async (id: string): Promise<Challenge | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.challenges.toggleChallengeActive(id);
      setChallenges(prev => prev.map(challenge => challenge.id === id ? response : challenge));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'activation/désactivation';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    challenges,
    isLoading,
    error,
    pagination,
    isInitialized,
    getChallenges,
    getChallengeStats,
    getChallengeById,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    toggleChallengeActive,
    getChallengeParticipants,
    getChallengeTransactions
  };
};

// ==================== ADMIN DEFIS MANAGEMENT HOOKS ====================

export const useAdminDefis = () => {
  const [defis, setDefis] = useState<Defi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const getDefis = useCallback(async (query?: DefiQueryParams): Promise<DefisListResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.defis.getDefis(query);
      setDefis(response.defis);
      setPagination({
        page: response.page,
        limit: query?.limit || 10,
        total: response.total,
        totalPages: response.totalPages
      });
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des défis';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDefiStats = useCallback(async (): Promise<DefiStats | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.defis.getDefiStats();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDefiById = useCallback(async (id: string): Promise<Defi | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.defis.getDefiById(id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du défi';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDefi = useCallback(async (data: CreateDefiRequest): Promise<Defi | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.defis.createDefi(data);
      setDefis(prev => [...prev, response]);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du défi';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDefi = useCallback(async (id: string, data: UpdateDefiRequest): Promise<Defi | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.defis.updateDefi(id, data);
      setDefis(prev => prev.map(defi => defi.id === id ? response : defi));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du défi';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDefi = useCallback(async (id: string): Promise<ApiResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.defis.deleteDefi(id);
      setDefis(prev => prev.filter(defi => defi.id !== id));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du défi';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleDefiOfficial = useCallback(async (id: string, isOfficial: boolean): Promise<Defi | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.defis.toggleDefiOfficial(id, isOfficial);
      setDefis(prev => prev.map(defi => defi.id === id ? response : defi));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDefiStatus = useCallback(async (id: string, status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'): Promise<Defi | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.defis.updateDefiStatus(id, status);
      setDefis(prev => prev.map(defi => defi.id === id ? response : defi));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDefiParticipants = useCallback(async (id: string): Promise<DefiParticipant[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.defis.getDefiParticipants(id);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des participants';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDefiTransactions = useCallback(async (id: string, participantId?: string): Promise<unknown[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.defis.getDefiTransactions(id, participantId);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des transactions';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    defis,
    isLoading,
    error,
    pagination,
    getDefis,
    getDefiStats,
    getDefiById,
    createDefi,
    updateDefi,
    deleteDefi,
    toggleDefiOfficial,
    updateDefiStatus,
    getDefiParticipants,
    getDefiTransactions
  };
};

// ==================== ADMIN FINANCIAL MANAGEMENT HOOKS ====================

export const useAdminFinancial = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const getTransactions = useCallback(async (query?: FinancialTransactionQueryParams): Promise<FinancialTransactionsListResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.financial.getTransactions(query);
      setTransactions(response.transactions);
      setPagination({
        page: response.page,
        limit: query?.limit || 20,
        total: response.total,
        totalPages: response.totalPages
      });
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des transactions';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTransactionStats = useCallback(async (): Promise<FinancialTransactionStats | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.financial.getTransactionStats();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTransactionById = useCallback(async (id: string): Promise<FinancialTransaction | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.financial.getTransactionById(id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération de la transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, data: UpdateFinancialTransactionRequest): Promise<FinancialTransaction | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.financial.updateTransaction(id, data);
      setTransactions(prev => prev.map(t => t.id === id ? response : t));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string): Promise<ApiResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.financial.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTransactionsByUser = useCallback(async (userId: string): Promise<FinancialTransaction[]> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.financial.getTransactionsByUser(userId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getGlobalFlux = useCallback(async (): Promise<FinancialGlobalFlux | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.financial.getGlobalFlux();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du flux global';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    transactions,
    isLoading,
    error,
    pagination,
    getTransactions,
    getTransactionStats,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getTransactionsByUser,
    getGlobalFlux
  };
};

// ==================== ADMIN GAMIFICATION MANAGEMENT HOOKS ====================

export const useAdminGamification = () => {
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTrophies = useCallback(async (query?: TrophyQueryParams): Promise<TrophiesListResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.gamification.getTrophies(query);
      setTrophies(response.trophies);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des trophées';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBadges = useCallback(async (query?: BadgeQueryParams): Promise<BadgesListResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.gamification.getBadges(query);
      setBadges(response.badges);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des badges';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getGamificationStats = useCallback(async (): Promise<GamificationStats | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.gamification.getGamificationStats();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTrophyById = useCallback(async (id: string): Promise<Trophy | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.gamification.getTrophyById(id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du trophée';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTrophy = useCallback(async (data: CreateTrophyRequest): Promise<Trophy | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.gamification.createTrophy(data);
      setTrophies(prev => [...prev, response]);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du trophée';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTrophy = useCallback(async (id: string, data: UpdateTrophyRequest): Promise<Trophy | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.gamification.updateTrophy(id, data);
      setTrophies(prev => prev.map(trophy => trophy.id === id ? response : trophy));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du trophée';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTrophy = useCallback(async (id: string): Promise<ApiResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.gamification.deleteTrophy(id);
      setTrophies(prev => prev.filter(trophy => trophy.id !== id));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du trophée';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBadgeById = useCallback(async (id: string): Promise<Badge | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.gamification.getBadgeById(id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du badge';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBadge = useCallback(async (data: CreateBadgeRequest): Promise<Badge | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.gamification.createBadge(data);
      setBadges(prev => [...prev, response]);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du badge';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBadge = useCallback(async (id: string, data: UpdateBadgeRequest): Promise<Badge | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.gamification.updateBadge(id, data);
      setBadges(prev => prev.map(badge => badge.id === id ? response : badge));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du badge';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBadge = useCallback(async (id: string): Promise<ApiResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.gamification.deleteBadge(id);
      setBadges(prev => prev.filter(badge => badge.id !== id));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du badge';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserGamificationData = useCallback(async (userId: string): Promise<GamificationUserData | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.gamification.getUserGamificationData(userId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des données';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUserTrophy = useCallback(async (userId: string, trophyId: string): Promise<ApiResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.gamification.deleteUserTrophy(userId, trophyId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du trophée';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLeaderboard = useCallback(async (limit: number = 100): Promise<GamificationLeaderboardEntry[]> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.gamification.getLeaderboard(limit);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du leaderboard';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    trophies,
    badges,
    isLoading,
    error,
    getTrophies,
    getTrophyById,
    createTrophy,
    updateTrophy,
    deleteTrophy,
    getBadges,
    getBadgeById,
    createBadge,
    updateBadge,
    deleteBadge,
    getUserGamificationData,
    deleteUserTrophy,
    getGamificationStats,
    getLeaderboard
  };
};

// ==================== ADMIN FINEOPAY PAYMENTS HOOKS ====================

export const useAdminFineoPay = () => {
  const [payments, setPayments] = useState<FineoPayPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  const getPayments = useCallback(async (query?: FineoPayPaymentQueryParams): Promise<FineoPayPaymentsListResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.fineopay.getPayments(query);
      setPayments(response.payments);
      setPagination({
        page: response.page,
        limit: query?.limit || 20,
        total: response.total
      });
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des paiements';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPaymentStats = useCallback(async (): Promise<FineoPayPaymentStats | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.fineopay.getPaymentStats();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPaymentById = useCallback(async (id: string): Promise<FineoPayPayment | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.fineopay.getPaymentById(id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du paiement';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPaymentsByUser = useCallback(async (userId: string, limit: number = 50): Promise<FineoPayPayment[]> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.fineopay.getPaymentsByUser(userId, limit);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des paiements';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPaymentsByStatus = useCallback(async (params: FineoPayPaymentsByStatusParams): Promise<FineoPayPaymentsListResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.fineopay.getPaymentsByStatus(params);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des paiements';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRevenue = useCallback(async (query?: FineoPayRevenueQuery): Promise<FineoPayRevenue | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.fineopay.getRevenue(query);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des revenus';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPaymentByReference = useCallback(async (reference: string): Promise<FineoPayPayment | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.fineopay.getPaymentByReference(reference);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du paiement';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    payments,
    isLoading,
    error,
    pagination,
    getPayments,
    getPaymentStats,
    getPaymentById,
    getPaymentsByUser,
    getPaymentsByStatus,
    getRevenue,
    getPaymentByReference
  };
};

// ==================== ADMIN SUBSCRIPTIONS HOOKS ====================

export const useAdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  const getSubscriptions = useCallback(async (query?: SubscriptionQueryParams): Promise<SubscriptionsListResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.subscriptions.getSubscriptions(query);
      setSubscriptions(response.subscriptions);
      setPagination({
        page: response.page,
        limit: query?.limit || 20,
        total: response.total
      });
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des abonnements';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSubscriptionStats = useCallback(async (): Promise<SubscriptionStats | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.subscriptions.getSubscriptionStats();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSubscriptionsByUser = useCallback(async (userId: string): Promise<Subscription[]> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.subscriptions.getSubscriptionsByUser(userId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des abonnements';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSubscriptionById = useCallback(async (id: string): Promise<Subscription | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.subscriptions.getSubscriptionById(id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération de l\'abonnement';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async (id: string): Promise<Subscription | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.subscriptions.cancelSubscription(id);
      setSubscriptions(prev => prev.map(sub => sub.id === id ? response : sub));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'annulation';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const extendSubscription = useCallback(async (id: string, data: ExtendSubscriptionRequest): Promise<Subscription | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.subscriptions.extendSubscription(id, data);
      setSubscriptions(prev => prev.map(sub => sub.id === id ? response : sub));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la prolongation';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSubscriptionRevenue = useCallback(async (query?: SubscriptionRevenueQuery): Promise<SubscriptionRevenue | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await adminService.subscriptions.getSubscriptionRevenue(query);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des revenus';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    subscriptions,
    isLoading,
    error,
    pagination,
    getSubscriptions,
    getSubscriptionStats,
    getSubscriptionsByUser,
    getSubscriptionById,
    cancelSubscription,
    extendSubscription,
    getSubscriptionRevenue
  };
};

// ==================== ADMIN COACHING REQUESTS HOOKS ====================

export const useAdminCoaching = () => {
  const [requests, setRequests] = useState<CoachingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  const getCoachingRequests = useCallback(async (query?: CoachingRequestQueryParams): Promise<CoachingRequestsListResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.coaching.getCoachingRequests(query);
      setRequests(response.requests);
      setPagination({
        page: response.page,
        limit: query?.limit || 20,
        total: response.total
      });
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des demandes';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCoachingRequestStatus = useCallback(async (id: string, data: UpdateCoachingRequestStatusRequest): Promise<CoachingRequest | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.coaching.updateCoachingRequestStatus(id, data);
      setRequests(prev => prev.map(req => req.id === id ? response : req));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    requests,
    isLoading,
    error,
    pagination,
    getCoachingRequests,
    updateCoachingRequestStatus
  };
};
