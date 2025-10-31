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
  UpdateResourceRequest,
  ResourceStats,
  ApiResponse,
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
  SavingsGoalQueryParams,
  SavingsGoalsListResponse,
  UpdateSavingsGoalRequest,
  SavingsChallenge,
  SavingsStats,
  SocialPost,
  SocialPostQueryParams,
  SocialPostsListResponse,
  UpdateSocialPostRequest,
  ToggleSocialPostVisibleRequest,
  SocialComment,
  SocialCommentQueryParams,
  SocialStats,
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
  async getDashboardStats(query?: DashboardStatsQuery & { startDate?: string; endDate?: string }): Promise<DashboardStats> {
    const params = new URLSearchParams();
    if (query?.period) params.append('period', query.period);
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    
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
  },

  // Régénérer les identifiants d'accès d'un utilisateur
  async regenerateUserAccess(id: string): Promise<UserResponse> {
    const response = await api.post<UserResponse, Record<string, never>>(
      `/admin/users/${id}/regenerate-access`,
      {}
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

    const url = `/admin/challenges${params.toString() ? `?${params.toString()}` : ''}`;
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
    const response = await api.get<ChallengeStats>('/admin/challenges/stats');
    return response;
  },

  // Détails d'un challenge
  async getChallengeById(id: string): Promise<ChallengeDetails> {
    const response = await api.get<ChallengeDetails>(`/admin/challenges/${id}`);
    return response;
  },

  // Créer un challenge
  async createChallenge(data: CreateChallengeRequest): Promise<Challenge> {
    const response = await api.post<Challenge, CreateChallengeRequest>(
      '/admin/challenges',
      data
    );
    return response;
  },

  // Modifier un challenge
  async updateChallenge(id: string, data: UpdateChallengeRequest): Promise<Challenge> {
    const response = await api.put<Challenge, UpdateChallengeRequest>(
      `/admin/challenges/${id}`,
      data
    );
    return response;
  },

  // Supprimer un challenge
  async deleteChallenge(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/admin/challenges/${id}`);
    return response;
  },

  // Activer/Désactiver un challenge
  async toggleChallengeActive(id: string): Promise<Challenge> {
    const response = await api.put<Challenge, Record<string, never>>(`/admin/challenges/${id}/toggle-active`, {});
    return response;
  },

  // Participants d'un challenge
  async getChallengeParticipants(id: string): Promise<ChallengeParticipant[]> {
    const response = await api.get<{ data: ChallengeParticipant[] } | ChallengeParticipant[]>(`/admin/challenges/${id}/participants`);
    // Gérer les deux structures possibles de réponse
    return Array.isArray(response) ? response : response.data || [];
  },

  // Transactions d'un challenge
  async getChallengeTransactions(id: string, participantId?: string): Promise<unknown[]> {
    const params = new URLSearchParams();
    if (participantId) params.append('participantId', participantId);
    
    const url = `/admin/challenges/${id}/transactions${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<{ data: unknown[] } | unknown[]>(url);
    // Gérer les deux structures possibles de réponse
    return Array.isArray(response) ? response : response.data || [];
  }
};

// ==================== DEFIS SERVICE ====================

const adminDefiService = {
  // Liste des défis
  async getDefis(query?: DefiQueryParams): Promise<DefisListResponse> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.type) params.append('type', query.type);
    if (query?.status) params.append('status', query.status);
    if (query?.isOfficial !== undefined) params.append('isOfficial', query.isOfficial.toString());
    if (query?.createdBy) params.append('createdBy', query.createdBy);
    if (query?.search) params.append('search', query.search);

    const url = `/admin/defis${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<DefisListResponse>(url);
    return response;
  },

  // Statistiques des défis
  async getDefiStats(): Promise<DefiStats> {
    const response = await api.get<DefiStats>('/admin/defis/stats');
    return response;
  },

  // Détails d'un défi
  async getDefiById(id: string): Promise<Defi> {
    const response = await api.get<Defi>(`/admin/defis/${id}`);
    return response;
  },

  // Créer un défi
  async createDefi(data: CreateDefiRequest): Promise<Defi> {
    const response = await api.post<Defi, CreateDefiRequest>('/admin/defis', data);
    return response;
  },

  // Modifier un défi
  async updateDefi(id: string, data: UpdateDefiRequest): Promise<Defi> {
    const response = await api.put<Defi, UpdateDefiRequest>(`/admin/defis/${id}`, data);
    return response;
  },

  // Supprimer un défi
  async deleteDefi(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/admin/defis/${id}`);
    return response;
  },

  // Marquer un défi comme officiel/non-officiel
  async toggleDefiOfficial(id: string, isOfficial: boolean): Promise<Defi> {
    const response = await api.put<Defi, { isOfficial: boolean }>(`/admin/defis/${id}/toggle-official`, { isOfficial });
    return response;
  },

  // Modifier le statut d'un défi
  async updateDefiStatus(id: string, status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'): Promise<Defi> {
    const response = await api.put<Defi, { status: string }>(`/admin/defis/${id}/status`, { status });
    return response;
  },

  // Participants d'un défi
  async getDefiParticipants(id: string): Promise<DefiParticipant[]> {
    const response = await api.get<{ data: DefiParticipant[] } | DefiParticipant[]>(`/admin/defis/${id}/participants`);
    return Array.isArray(response) ? response : response.data || [];
  },

  // Transactions d'un défi
  async getDefiTransactions(id: string, participantId?: string): Promise<unknown[]> {
    const params = new URLSearchParams();
    if (participantId) params.append('participantId', participantId);
    
    const url = `/admin/defis/${id}/transactions${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<{ data: unknown[] } | unknown[]>(url);
    return Array.isArray(response) ? response : response.data || [];
  }
};

// ==================== FINANCIAL TRANSACTIONS SERVICE ====================

const adminFinancialService = {
  // Liste des transactions
  async getTransactions(query?: FinancialTransactionQueryParams): Promise<FinancialTransactionsListResponse> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.type) params.append('type', query.type);
    if (query?.category) params.append('category', query.category);
    if (query?.userId) params.append('userId', query.userId);

    const url = `/admin/financial/transactions${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<FinancialTransactionsListResponse>(url);
    return response;
  },

  // Statistiques des transactions
  async getTransactionStats(): Promise<FinancialTransactionStats> {
    const response = await api.get<FinancialTransactionStats>('/admin/financial/transactions/stats');
    return response;
  },

  // Détails d'une transaction
  async getTransactionById(id: string): Promise<FinancialTransaction> {
    const response = await api.get<FinancialTransaction>(`/admin/financial/transactions/${id}`);
    return response;
  },

  // Modifier une transaction
  async updateTransaction(id: string, data: UpdateFinancialTransactionRequest): Promise<FinancialTransaction> {
    const response = await api.put<FinancialTransaction, UpdateFinancialTransactionRequest>(
      `/admin/financial/transactions/${id}`,
      data
    );
    return response;
  },

  // Supprimer une transaction
  async deleteTransaction(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/admin/financial/transactions/${id}`);
    return response;
  },

  // Transactions d'un utilisateur
  async getTransactionsByUser(userId: string): Promise<FinancialTransaction[]> {
    const response = await api.get<{ data: FinancialTransaction[] } | FinancialTransaction[]>(
      `/admin/financial/transactions/by-user/${userId}`
    );
    return Array.isArray(response) ? response : response.data || [];
  },

  // Vue globale du flux financier
  async getGlobalFlux(): Promise<FinancialGlobalFlux> {
    const response = await api.get<FinancialGlobalFlux>('/admin/financial/flux/global');
    return response;
  }
};

// ==================== SAVINGS GOALS SERVICE ====================

const adminSavingsService = {
  // Liste des objectifs d'épargne
  async getSavingsGoals(query?: SavingsGoalQueryParams): Promise<SavingsGoalsListResponse> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.userId) params.append('userId', query.userId);

    const url = `/admin/savings/goals${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<SavingsGoalsListResponse>(url);
    return response;
  },

  // Détails d'un objectif d'épargne
  async getSavingsGoalById(id: string): Promise<SavingsGoal> {
    const response = await api.get<SavingsGoal>(`/admin/savings/goals/${id}`);
    return response;
  },

  // Modifier un objectif d'épargne
  async updateSavingsGoal(id: string, data: UpdateSavingsGoalRequest): Promise<SavingsGoal> {
    const response = await api.put<SavingsGoal, UpdateSavingsGoalRequest>(
      `/admin/savings/goals/${id}`,
      data
    );
    return response;
  },

  // Supprimer un objectif d'épargne
  async deleteSavingsGoal(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/admin/savings/goals/${id}`);
    return response;
  },

  // Liste des challenges d'épargne
  async getSavingsChallenges(query?: SavingsGoalQueryParams): Promise<SavingsChallenge[]> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.userId) params.append('userId', query.userId);

    const url = `/admin/savings/challenges${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<{ data: SavingsChallenge[] } | SavingsChallenge[]>(url);
    return Array.isArray(response) ? response : response.data || [];
  },

  // Détails d'un challenge d'épargne
  async getSavingsChallengeById(id: string): Promise<SavingsChallenge> {
    const response = await api.get<SavingsChallenge>(`/admin/savings/challenges/${id}`);
    return response;
  },

  // Statistiques des épargnes
  async getSavingsStats(): Promise<SavingsStats> {
    const response = await api.get<SavingsStats>('/admin/savings/stats');
    return response;
  },

  // Progrès collectif global
  async getCollectiveProgress(): Promise<unknown> {
    const response = await api.get<unknown>('/admin/savings/collective-progress');
    return response;
  }
};

// ==================== SOCIAL SERVICE ====================

const adminSocialService = {
  // Liste des posts
  async getPosts(query?: SocialPostQueryParams): Promise<SocialPostsListResponse> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.type) params.append('type', query.type);
    if (query?.userId) params.append('userId', query.userId);

    const url = `/admin/social/posts${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<SocialPostsListResponse>(url);
    return response;
  },

  // Détails d'un post
  async getPostById(id: string): Promise<SocialPost> {
    const response = await api.get<SocialPost>(`/admin/social/posts/${id}`);
    return response;
  },

  // Modifier un post
  async updatePost(id: string, data: UpdateSocialPostRequest): Promise<SocialPost> {
    const response = await api.put<SocialPost, UpdateSocialPostRequest>(
      `/admin/social/posts/${id}`,
      data
    );
    return response;
  },

  // Supprimer un post
  async deletePost(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/admin/social/posts/${id}`);
    return response;
  },

  // Masquer/Afficher un post
  async togglePostVisible(id: string, visible: boolean): Promise<SocialPost> {
    const response = await api.put<SocialPost, ToggleSocialPostVisibleRequest>(
      `/admin/social/posts/${id}/toggle-visible`,
      { visible }
    );
    return response;
  },

  // Liste des commentaires
  async getComments(query?: SocialCommentQueryParams): Promise<SocialComment[]> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.postId) params.append('postId', query.postId);
    if (query?.userId) params.append('userId', query.userId);

    const url = `/admin/social/comments${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<{ data: SocialComment[] } | SocialComment[]>(url);
    return Array.isArray(response) ? response : response.data || [];
  },

  // Supprimer un commentaire
  async deleteComment(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/admin/social/comments/${id}`);
    return response;
  },

  // Statistiques sociales
  async getSocialStats(): Promise<SocialStats> {
    const response = await api.get<SocialStats>('/admin/social/stats');
    return response;
  },

  // Posts signalés
  async getReports(): Promise<unknown[]> {
    const response = await api.get<{ data: unknown[] } | unknown[]>('/admin/social/reports');
    return Array.isArray(response) ? response : response.data || [];
  }
};

// ==================== GAMIFICATION SERVICE ====================

const adminGamificationService = {
  // Liste des trophées
  async getTrophies(query?: TrophyQueryParams): Promise<TrophiesListResponse> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.category) params.append('category', query.category);
    if (query?.rarity) params.append('rarity', query.rarity);

    const url = `/admin/gamification/trophies${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<TrophiesListResponse>(url);
    return response;
  },

  // Détails d'un trophée
  async getTrophyById(id: string): Promise<Trophy> {
    const response = await api.get<Trophy>(`/admin/gamification/trophies/${id}`);
    return response;
  },

  // Créer un trophée
  async createTrophy(data: CreateTrophyRequest): Promise<Trophy> {
    const response = await api.post<Trophy, CreateTrophyRequest>(
      '/admin/gamification/trophies',
      data
    );
    return response;
  },

  // Modifier un trophée
  async updateTrophy(id: string, data: UpdateTrophyRequest): Promise<Trophy> {
    const response = await api.put<Trophy, UpdateTrophyRequest>(
      `/admin/gamification/trophies/${id}`,
      data
    );
    return response;
  },

  // Supprimer un trophée
  async deleteTrophy(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/admin/gamification/trophies/${id}`);
    return response;
  },

  // Liste des badges
  async getBadges(query?: BadgeQueryParams): Promise<BadgesListResponse> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.type) params.append('type', query.type);

    const url = `/admin/gamification/badges${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<BadgesListResponse>(url);
    return response;
  },

  // Détails d'un badge
  async getBadgeById(id: string): Promise<Badge> {
    const response = await api.get<Badge>(`/admin/gamification/badges/${id}`);
    return response;
  },

  // Créer un badge
  async createBadge(data: CreateBadgeRequest): Promise<Badge> {
    const response = await api.post<Badge, CreateBadgeRequest>(
      '/admin/gamification/badges',
      data
    );
    return response;
  },

  // Modifier un badge
  async updateBadge(id: string, data: UpdateBadgeRequest): Promise<Badge> {
    const response = await api.put<Badge, UpdateBadgeRequest>(
      `/admin/gamification/badges/${id}`,
      data
    );
    return response;
  },

  // Supprimer un badge
  async deleteBadge(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/admin/gamification/badges/${id}`);
    return response;
  },

  // Données gamification d'un utilisateur
  async getUserGamificationData(userId: string): Promise<GamificationUserData> {
    const response = await api.get<GamificationUserData>(`/admin/gamification/users/${userId}`);
    return response;
  },

  // Retirer un trophée à un utilisateur
  async deleteUserTrophy(userId: string, trophyId: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(
      `/admin/gamification/users/${userId}/trophies/${trophyId}`
    );
    return response;
  },

  // Statistiques globales de gamification
  async getGamificationStats(): Promise<GamificationStats> {
    const response = await api.get<GamificationStats>('/admin/gamification/stats');
    return response;
  },

  // Leaderboard global
  async getLeaderboard(limit: number = 100): Promise<GamificationLeaderboardEntry[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    const url = `/admin/gamification/leaderboard${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<GamificationLeaderboardEntry[]>(url);
    return response;
  }
};

// ==================== FINEOPAY PAYMENTS SERVICE ====================

const adminFineoPayService = {
  // Liste des paiements
  async getPayments(query?: FineoPayPaymentQueryParams): Promise<FineoPayPaymentsListResponse> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);
    if (query?.userId) params.append('userId', query.userId);
    if (query?.method) params.append('method', query.method);

    const url = `/admin/fineopay/payments${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<FineoPayPaymentsListResponse>(url);
    return response;
  },

  // Statistiques des paiements
  async getPaymentStats(): Promise<FineoPayPaymentStats> {
    const response = await api.get<FineoPayPaymentStats>('/admin/fineopay/payments/stats');
    return response;
  },

  // Détails d'un paiement
  async getPaymentById(id: string): Promise<FineoPayPayment> {
    const response = await api.get<FineoPayPayment>(`/admin/fineopay/payments/${id}`);
    return response;
  },

  // Paiements d'un utilisateur
  async getPaymentsByUser(userId: string, limit: number = 50): Promise<FineoPayPayment[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    const url = `/admin/fineopay/payments/by-user/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<{ data: FineoPayPayment[] } | FineoPayPayment[]>(url);
    return Array.isArray(response) ? response : response.data || [];
  },

  // Paiements par statut
  async getPaymentsByStatus(params: FineoPayPaymentsByStatusParams): Promise<FineoPayPaymentsListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/admin/fineopay/payments/by-status${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<FineoPayPaymentsListResponse>(url);
    return response;
  },

  // Statistiques financières (revenus)
  async getRevenue(query?: FineoPayRevenueQuery): Promise<FineoPayRevenue> {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    
    const url = `/admin/fineopay/payments/revenue${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<FineoPayRevenue>(url);
    return response;
  },

  // Récupérer un paiement par référence
  async getPaymentByReference(reference: string): Promise<FineoPayPayment> {
    const response = await api.get<FineoPayPayment>(`/admin/fineopay/payments/reference/${reference}`);
    return response;
  }
};

// ==================== SUBSCRIPTIONS SERVICE ====================

const adminSubscriptionService = {
  // Liste des abonnements
  async getSubscriptions(query?: SubscriptionQueryParams): Promise<SubscriptionsListResponse> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);
    if (query?.plan) params.append('plan', query.plan);
    if (query?.userId) params.append('userId', query.userId);

    const url = `/admin/subscriptions${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<SubscriptionsListResponse>(url);
    return response;
  },

  // Statistiques des abonnements
  async getSubscriptionStats(): Promise<SubscriptionStats> {
    const response = await api.get<SubscriptionStats>('/admin/subscriptions/stats');
    return response;
  },

  // Abonnements d'un utilisateur
  async getSubscriptionsByUser(userId: string): Promise<Subscription[]> {
    const response = await api.get<{ data: Subscription[] } | Subscription[]>(
      `/admin/subscriptions/by-user/${userId}`
    );
    return Array.isArray(response) ? response : response.data || [];
  },

  // Détails d'un abonnement
  async getSubscriptionById(id: string): Promise<Subscription> {
    const response = await api.get<Subscription>(`/admin/subscriptions/${id}`);
    return response;
  },

  // Annuler un abonnement
  async cancelSubscription(id: string): Promise<Subscription> {
    const response = await api.put<Subscription, Record<string, never>>(
      `/admin/subscriptions/${id}/cancel`,
      {}
    );
    return response;
  },

  // Prolonger un abonnement
  async extendSubscription(id: string, data: ExtendSubscriptionRequest): Promise<Subscription> {
    const response = await api.put<Subscription, ExtendSubscriptionRequest>(
      `/admin/subscriptions/${id}/extend`,
      data
    );
    return response;
  },

  // Revenus des abonnements
  async getSubscriptionRevenue(query?: SubscriptionRevenueQuery): Promise<SubscriptionRevenue> {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    
    const url = `/admin/subscriptions/revenue${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<SubscriptionRevenue>(url);
    return response;
  }
};

// ==================== COACHING REQUESTS SERVICE ====================

const adminCoachingService = {
  // Liste des demandes de coaching
  async getCoachingRequests(query?: CoachingRequestQueryParams): Promise<CoachingRequestsListResponse> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);
    if (query?.search) params.append('search', query.search);

    const url = `/admin/coaching-requests${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<CoachingRequestsListResponse>(url);
    return response;
  },

  // Mettre à jour le statut d'une demande
  async updateCoachingRequestStatus(
    id: string,
    data: UpdateCoachingRequestStatusRequest
  ): Promise<CoachingRequest> {
    const response = await api.patch<CoachingRequest, UpdateCoachingRequestStatusRequest>(
      `/admin/coaching-requests/${id}/status`,
      data
    );
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
  challenges: adminChallengeService,
  defis: adminDefiService,
  financial: adminFinancialService,
  savings: adminSavingsService,
  social: adminSocialService,
  gamification: adminGamificationService,
  fineopay: adminFineoPayService,
  subscriptions: adminSubscriptionService,
  coaching: adminCoachingService
};
