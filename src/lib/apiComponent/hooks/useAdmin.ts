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
  UpdateResourceRequest, ResourceStats,
  ApiResponse
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
      // Mettre à jour la liste locale
      setUsers(prev => prev.map(user => user.id === id ? response : user));
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
      // Mettre à jour la liste locale
      setUsers(prev => prev.map(user => user.id === id ? response : user));
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
      // Mettre à jour la liste locale
      setUsers(prev => prev.map(user => user.id === id ? response : user));
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
      // Mettre à jour la liste locale
      setUsers(prev => prev.map(user => user.id === id ? response : user));
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
      // Mettre à jour la liste locale
      setUsers(prev => prev.map(user => user.id === id ? response : user));
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
      // Mettre à jour la liste locale
      setUsers(prev => prev.map(user => user.id === id ? response : user));
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
      // Mettre à jour la liste locale
      setUsers(prev => prev.map(user => user.id === id ? response : user));
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'approbation et mise à niveau';
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
    approveAndUpgradeToPremium
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
  const [applications, setApplications] = useState<any[]>([]);
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

  const approveApplication = useCallback(async (id: string): Promise<any> => {
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

  const rejectApplication = useCallback(async (id: string, data: ReviewBankAccountRequest): Promise<any> => {
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
  const [notifications, setNotifications] = useState<any[]>([]);
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
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSavingsGoals = useCallback(async (): Promise<any[]> => {
    try {
      setIsLoading(true);
      setError(null);
      // Pour l'instant, retourner des données mock en attendant l'implémentation backend
      const mockGoals = [
        {
          id: '1',
          userId: '1',
          userName: 'Marie Dupont',
          userEmail: 'marie@example.com',
          targetAmount: 5000,
          currentAmount: 2500,
          currency: 'EUR',
          monthlyIncome: 3000,
          isVariableIncome: false,
          startDate: '2025-01-01',
          targetDate: '2025-12-31',
          status: 'active',
          category: 'vacation',
          description: 'Vacances d\'été',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-20T00:00:00Z'
        },
        {
          id: '2',
          userId: '2',
          userName: 'Jean Martin',
          userEmail: 'jean@example.com',
          targetAmount: 10000,
          currentAmount: 7500,
          currency: 'EUR',
          monthlyIncome: 4000,
          isVariableIncome: true,
          startDate: '2024-06-01',
          targetDate: '2025-06-01',
          status: 'active',
          category: 'house',
          description: 'Achat d\'une maison',
          createdAt: '2024-06-01T00:00:00Z',
          updatedAt: '2025-01-20T00:00:00Z'
        }
      ];
      setSavingsGoals(mockGoals);
      return mockGoals;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des objectifs d\'épargne';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSavingsGoalStats = useCallback(async (): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      // Pour l'instant, retourner des stats mock
      const mockStats = {
        totalGoals: 150,
        activeGoals: 120,
        completedGoals: 25,
        totalAmount: 500000,
        averageGoalAmount: 3333,
        completionRate: 0.75
      };
      return mockStats;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSavingsGoal = useCallback(async (id: string, data: any): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      // Pour l'instant, simuler une mise à jour
      setSavingsGoals(prev => prev.map(goal => goal.id === id ? { ...goal, ...data } : goal));
      return { ...data, id };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'objectif';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSavingsGoal = useCallback(async (id: string): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      setSavingsGoals(prev => prev.filter(goal => goal.id !== id));
      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'objectif';
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
    getSavingsGoalStats,
    updateSavingsGoal,
    deleteSavingsGoal
  };
};

// ==================== ADMIN SOCIAL MANAGEMENT HOOKS ====================

export const useAdminSocial = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPosts = useCallback(async (): Promise<any[]> => {
    try {
      setIsLoading(true);
      setError(null);
      // Pour l'instant, retourner des données mock en attendant l'implémentation backend
      const mockPosts = [
        {
          id: '1',
          userId: '1',
          userName: 'Marie Dupont',
          userEmail: 'marie@example.com',
          content: 'J\'ai atteint mon objectif d\'épargne de 1000€ ! 🎉',
          type: 'achievement',
          likes: 15,
          comments: 3,
          shares: 2,
          createdAt: '2025-01-20T10:30:00Z',
          status: 'published'
        },
        {
          id: '2',
          userId: '2',
          userName: 'Jean Martin',
          userEmail: 'jean@example.com',
          content: 'Conseil du jour : Épargnez 10% de vos revenus chaque mois',
          type: 'tip',
          likes: 8,
          comments: 1,
          shares: 5,
          createdAt: '2025-01-19T14:20:00Z',
          status: 'published'
        }
      ];
      setPosts(mockPosts);
      return mockPosts;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des posts';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChallenges = useCallback(async (): Promise<any[]> => {
    try {
      setIsLoading(true);
      setError(null);
      // Pour l'instant, retourner des données mock
      const mockChallenges = [
        {
          id: '1',
          title: 'Défi 30 jours sans dépenses inutiles',
          description: 'Évitez les achats impulsifs pendant 30 jours',
          participants: 25,
          status: 'active',
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          createdAt: '2024-12-15T00:00:00Z'
        },
        {
          id: '2',
          title: 'Épargne de 500€ en un mois',
          description: 'Atteignez 500€ d\'épargne en un mois',
          participants: 18,
          status: 'completed',
          startDate: '2024-12-01',
          endDate: '2024-12-31',
          createdAt: '2024-11-15T00:00:00Z'
        }
      ];
      setChallenges(mockChallenges);
      return mockChallenges;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des défis';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSocialStats = useCallback(async (): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      // Pour l'instant, retourner des stats mock
      const mockStats = {
        totalPosts: 150,
        totalChallenges: 25,
        activeChallenges: 8,
        totalParticipants: 200,
        engagementRate: 0.75
      };
      return mockStats;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (postId: string): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      setPosts(prev => prev.filter(post => post.id !== postId));
      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du post';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteChallenge = useCallback(async (challengeId: string): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      setChallenges(prev => prev.filter(challenge => challenge.id !== challengeId));
      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du défi';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    posts,
    challenges,
    isLoading,
    error,
    getPosts,
    getChallenges,
    getSocialStats,
    deletePost,
    deleteChallenge
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

  const getChallengeLeaderboard = useCallback(async (id: string, sortBy?: string, limit?: number): Promise<ChallengeParticipant[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.challenges.getChallengeLeaderboard(id, sortBy, limit);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du classement';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChallengeProgress = useCallback(async (id: string): Promise<unknown> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.challenges.getChallengeProgress(id);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération de la progression';
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
    getChallengeParticipants,
    getChallengeTransactions,
    getChallengeLeaderboard,
    getChallengeProgress
  };
};
