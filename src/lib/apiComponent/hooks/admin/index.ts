// ==================== ADMIN HOOKS EXPORTS ====================

export {
  useAdminAuth,
  useAdminDashboard,
  useAdminUsers,
  useAdminSystemSettings,
  useAdminBankAccounts,
  useAdminNotifications,
  useAdminResources,
  useAdminSavingsGoals,
  useAdminSocial,
  useAdminChallenges
} from '../useAdmin';

export { adminService } from '../../services/adminService';

// ==================== ADMIN TYPES EXPORTS ====================

export type {
  AdminUser,
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
  UpdateResourceRequest,
  ResourcesListResponse,
  ResourceStats,
  ApiResponse
} from '../../../types/admin';
