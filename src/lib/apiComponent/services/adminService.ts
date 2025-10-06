import { api } from '../apiClient';
import {
  AdminUser,
  AdminLoginRequest,
  AdminLoginResponse,
  ChangePasswordRequest,
  UserQueryParams,
  UsersListResponse,
  ApiUsersResponse,
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
  Challenge,
  CreateChallengeRequest,
  UpdateChallengeRequest,
  ChallengeQueryParams,
  ChallengesListResponse,
  ApiChallengesResponse,
  ChallengeStats,
  ChallengeDetails,
  ChallengeParticipant,
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
  UpdateResourceRequest, ResourceStats,
  ApiResponse
} from '../../../types/admin';

// ==================== ADMIN AUTHENTICATION ====================

export const adminAuthService = {
  // Connexion admin
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await api.post<AdminLoginResponse, AdminLoginRequest>(
      '/admin/auth/login',
      credentials,
      { isPublicRoute: true }
    );
    return response;
  },

  // Profil admin
  async getProfile(): Promise<AdminUser> {
    const response = await api.get<AdminUser>('/admin/profile');
    return response;
  },

  // Changer le mot de passe
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    const response = await api.put<ApiResponse, ChangePasswordRequest>(
      '/admin/change-password',
      data
    );
    return response;
  }
};

// ==================== DASHBOARD ====================

export const adminDashboardService = {
  // Statistiques du dashboard
  async getDashboardStats(query?: DashboardStatsQuery): Promise<DashboardStats> {
    const params = new URLSearchParams();
    if (query?.period) params.append('period', query.period);
    
    const url = `/admin/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<DashboardStats>(url);
    return response;
  },

  // Statistiques utilisateurs
  async getUserStats(): Promise<UserStats> {
    const response = await api.get<UserStats>('/admin/stats/users');
    return response;
  },

  // Statistiques admins
  async getAdminStats(): Promise<AdminStats> {
    const response = await api.get<AdminStats>('/admin/stats/admins');
    return response;
  }
};

// ==================== USER MANAGEMENT ====================

export const adminUserService = {
  // Liste des utilisateurs
  async getUsers(query?: UserQueryParams): Promise<UsersListResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.isGuest !== undefined) params.append('isGuest', query.isGuest.toString());
    if (query?.isVerified !== undefined) params.append('isVerified', query.isVerified.toString());
    if (query?.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query?.isPremium !== undefined) params.append('isPremium', query.isPremium.toString());
    if (query?.isAdmin !== undefined) params.append('isAdmin', query.isAdmin.toString());
    if (query?.approvalStatus) params.append('approvalStatus', query.approvalStatus);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const url = `/admin/users${params.toString() ? `?${params.toString()}` : ''}`;
    const apiResponse = await api.get<ApiUsersResponse>(url);
    
    // Mapper la réponse de l'API vers le format attendu
    return {
      users: apiResponse.data || [],
      total: apiResponse.pagination?.total || 0,
      page: apiResponse.pagination?.page || 1,
      totalPages: apiResponse.pagination?.totalPages || 1,
      hasNext: apiResponse.pagination?.hasNext || false,
      hasPrev: apiResponse.pagination?.hasPrev || false
    };
  },

  // Utilisateurs en attente
  async getPendingUsers(query?: UserQueryParams): Promise<UsersListResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const url = `/admin/users/pending${params.toString() ? `?${params.toString()}` : ''}`;
    const apiResponse = await api.get<ApiUsersResponse>(url);
    
    // Mapper la réponse de l'API vers le format attendu
    return {
      users: apiResponse.data || [],
      total: apiResponse.pagination?.total || 0,
      page: apiResponse.pagination?.page || 1,
      totalPages: apiResponse.pagination?.totalPages || 1,
      hasNext: apiResponse.pagination?.hasNext || false,
      hasPrev: apiResponse.pagination?.hasPrev || false
    };
  },

  // Détails d'un utilisateur
  async getUserById(id: string): Promise<UserResponse> {
    const response = await api.get<UserResponse>(`/admin/users/${id}`);
    return response;
  },

  // Modifier un utilisateur
  async updateUser(id: string, data: UpdateUserRequest): Promise<UserResponse> {
    const response = await api.put<UserResponse, UpdateUserRequest>(
      `/admin/users/${id}`,
      data
    );
    return response;
  },

  // Activer/Désactiver un utilisateur
  async toggleUserActive(id: string): Promise<UserResponse> {
    const response = await api.post<UserResponse, Record<string, never>>(`/admin/users/${id}/toggle-active`, {});
    return response;
  },

  // Vérifier/Dévérifier un utilisateur
  async toggleUserVerified(id: string): Promise<UserResponse> {
    const response = await api.post<UserResponse, Record<string, never>>(`/admin/users/${id}/toggle-verified`, {});
    return response;
  },

  // Supprimer un utilisateur
  async deleteUser(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/admin/users/${id}`);
    return response;
  },

  // Approuver un utilisateur
  async approveUser(id: string): Promise<UserResponse> {
    const response = await api.post<UserResponse, Record<string, never>>(`/admin/users/${id}/approve`, {});
    return response;
  },

  // Rejeter un utilisateur
  async rejectUser(id: string, data: RejectUserRequest): Promise<UserResponse> {
    const response = await api.post<UserResponse, RejectUserRequest>(
      `/admin/users/${id}/reject`,
      data
    );
    return response;
  },

  // Mettre à niveau un utilisateur vers Premium
  async upgradeUserToPremium(id: string, data: UpgradeUserRequest): Promise<UserResponse> {
    const response = await api.post<UserResponse, UpgradeUserRequest>(
      `/admin/users/${id}/upgrade-premium`,
      data
    );
    return response;
  },

  // Approuver et mettre à niveau vers Premium
  async approveAndUpgradeToPremium(id: string, data: UpgradeUserRequest): Promise<UserResponse> {
    const response = await api.post<UserResponse, UpgradeUserRequest>(
      `/admin/users/${id}/approve-and-upgrade-premium`,
      data
    );
    return response;
  }
};

// ==================== SYSTEM SETTINGS ====================

export const adminSystemService = {
  // Liste des paramètres système
  async getSettings(query?: SystemSettingQuery): Promise<SystemSettingsListResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const url = `/admin/settings${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<SystemSettingsListResponse>(url);
    return response;
  },

  // Paramètres par catégorie
  async getSettingsByCategory(): Promise<SettingsByCategory> {
    const response = await api.get<SettingsByCategory>('/admin/settings/by-category');
    return response;
  },

  // Détails d'un paramètre
  async getSettingByKey(key: string): Promise<SystemSetting> {
    const response = await api.get<SystemSetting>(`/admin/settings/${key}`);
    return response;
  },

  // Créer un paramètre
  async createSetting(data: CreateSystemSettingRequest): Promise<SystemSetting> {
    const response = await api.post<SystemSetting, CreateSystemSettingRequest>(
      '/admin/settings',
      data
    );
    return response;
  },

  // Modifier un paramètre
  async updateSetting(key: string, data: UpdateSystemSettingRequest): Promise<SystemSetting> {
    const response = await api.put<SystemSetting, UpdateSystemSettingRequest>(
      `/admin/settings/${key}`,
      data
    );
    return response;
  },

  // Supprimer un paramètre
  async deleteSetting(key: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/admin/settings/${key}`);
    return response;
  }
};

// ==================== BANK ACCOUNTS ====================

export const adminBankAccountService = {
  // Liste des demandes de comptes bancaires
  async getApplications(page: number = 1, limit: number = 20, status?: string): Promise<BankAccountApplicationsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const url = `/admin/bank-accounts${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<BankAccountApplicationsResponse>(url);
    return response;
  },

  // Statistiques des comptes bancaires
  async getApplicationStats(): Promise<BankAccountStats> {
    const response = await api.get<BankAccountStats>('/admin/bank-accounts/stats');
    return response;
  },

  // Approuver une demande
  async approveApplication(id: string): Promise<ApiResponse> {
    const response = await api.put<ApiResponse, Record<string, never>>(`/admin/bank-accounts/${id}/approve`, {});
    return response;
  },

  // Rejeter une demande
  async rejectApplication(id: string, data: ReviewBankAccountRequest): Promise<ApiResponse> {
    const response = await api.put<ApiResponse, ReviewBankAccountRequest>(
      `/admin/bank-accounts/${id}/reject`,
      data
    );
    return response;
  }
};

// ==================== NOTIFICATIONS ====================

export const adminNotificationService = {
  // Diffuser une notification
  async broadcastNotification(data: BroadcastNotificationRequest): Promise<ApiResponse> {
    const response = await api.post<ApiResponse, BroadcastNotificationRequest>(
      '/admin/notifications/broadcast',
      data
    );
    return response;
  },

  // Liste des notifications
  async getNotifications(page: number = 1, limit: number = 50, type?: string, status?: string): Promise<NotificationsListResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (type) params.append('type', type);
    if (status) params.append('status', status);

    const url = `/admin/notifications${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<NotificationsListResponse>(url);
    return response;
  },

  // Statistiques des notifications
  async getNotificationStats(period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<NotificationStats> {
    const params = new URLSearchParams();
    params.append('period', period);

    const url = `/admin/notifications/stats${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<NotificationStats>(url);
    return response;
  }
};

// ==================== RESOURCES ====================

export const adminResourceService = {
  // Créer une ressource
  async createResource(data: CreateResourceRequest): Promise<Resource> {
    const response = await api.post<Resource, CreateResourceRequest>(
      '/admin/resources',
      data
    );
    return response;
  },

  // Liste des ressources
  async getResources(): Promise<Resource[]> {
    const response = await api.get<Resource[]>('/admin/resources');
    return response;
  },

  // Statistiques des ressources
  async getResourceStats(): Promise<ResourceStats> {
    const response = await api.get<ResourceStats>('/admin/resources/stats');
    return response;
  },

  // Détails d'une ressource
  async getResourceById(id: string): Promise<Resource> {
    const response = await api.get<Resource>(`/admin/resources/${id}`);
    return response;
  },

  // Modifier une ressource
  async updateResource(id: string, data: UpdateResourceRequest): Promise<Resource> {
    const response = await api.put<Resource, UpdateResourceRequest>(
      `/admin/resources/${id}`,
      data
    );
    return response;
  },

  // Supprimer une ressource
  async deleteResource(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/admin/resources/${id}`);
    return response;
  }
};

// ==================== ADMIN CHALLENGES SERVICE ====================

const adminChallengeService = {
  // Liste des challenges
  async getChallenges(query?: ChallengeQueryParams): Promise<ChallengesListResponse> {
    const params = new URLSearchParams();
    
    if (query?.status) params.append('status', query.status);
    if (query?.search) params.append('search', query.search);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const url = `/challenges${params.toString() ? `?${params.toString()}` : ''}`;
    const apiResponse = await api.get<ApiChallengesResponse>(url);
    
    // Mapper la réponse de l'API vers le format attendu
    return {
      challenges: apiResponse.data || [],
      total: apiResponse.meta?.total || 0,
      page: apiResponse.meta?.page || 1,
      totalPages: apiResponse.meta?.totalPages || 1,
      hasNext: (apiResponse.meta?.page || 1) < (apiResponse.meta?.totalPages || 1),
      hasPrev: (apiResponse.meta?.page || 1) > 1
    };
  },

  // Statistiques des challenges
  async getChallengeStats(): Promise<ChallengeStats> {
    const response = await api.get<ChallengeStats>('/challenges/stats');
    return response;
  },

  // Détails d'un challenge
  async getChallengeById(id: string): Promise<ChallengeDetails> {
    const response = await api.get<ChallengeDetails>(`/challenges/${id}`);
    return response;
  },

  // Créer un challenge
  async createChallenge(data: CreateChallengeRequest): Promise<Challenge> {
    const response = await api.post<Challenge, CreateChallengeRequest>(
      '/challenges',
      data
    );
    return response;
  },

  // Modifier un challenge
  async updateChallenge(id: string, data: UpdateChallengeRequest): Promise<Challenge> {
    const response = await api.put<Challenge, UpdateChallengeRequest>(
      `/challenges/${id}`,
      data
    );
    return response;
  },

  // Supprimer un challenge
  async deleteChallenge(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/challenges/${id}`);
    return response;
  },

  // Participants d'un challenge
  async getChallengeParticipants(id: string): Promise<ChallengeParticipant[]> {
    const response = await api.get<{ data: ChallengeParticipant[] } | ChallengeParticipant[]>(`/challenges/${id}/participants`);
    // Gérer les deux structures possibles de réponse
    return Array.isArray(response) ? response : response.data || [];
  },

  // Transactions d'un challenge
  async getChallengeTransactions(id: string, participantId?: string): Promise<unknown[]> {
    const params = new URLSearchParams();
    if (participantId) params.append('participantId', participantId);
    
    const url = `/challenges/${id}/transactions${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<{ data: unknown[] } | unknown[]>(url);
    // Gérer les deux structures possibles de réponse
    return Array.isArray(response) ? response : response.data || [];
  },

  // Leaderboard d'un challenge
  async getChallengeLeaderboard(id: string, sortBy?: string, limit?: number): Promise<ChallengeParticipant[]> {
    const params = new URLSearchParams();
    if (sortBy) params.append('sortBy', sortBy);
    if (limit) params.append('limit', limit.toString());
    
    const url = `/challenges/${id}/collective/leaderboard${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<ChallengeParticipant[]>(url);
    return response;
  },

  // Progression collective d'un challenge
  async getChallengeProgress(id: string): Promise<unknown> {
    const response = await api.get<unknown>(`/challenges/${id}/collective/progress`);
    return response;
  }
};

// ==================== EXPORT ALL SERVICES ====================

export const adminService = {
  auth: adminAuthService,
  dashboard: adminDashboardService,
  users: adminUserService,
  system: adminSystemService,
  bankAccounts: adminBankAccountService,
  notifications: adminNotificationService,
  resources: adminResourceService,
  challenges: adminChallengeService
};
