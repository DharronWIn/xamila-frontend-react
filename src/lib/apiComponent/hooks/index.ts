// ==================== API HOOKS EXPORTS ====================
// Export all custom hooks for easy importing

// Authentication hooks
export * from './useAuth';

// Challenge hooks
export * from './useChallenges';

// Defi hooks
export * from './useDefis';

// Financial hooks
export * from './useFinancial';

// Social hooks
export * from './useSocial';

// Notification hooks
export * from './useNotifications';

// Resource hooks
export * from './useResources';

// Savings hooks
export * from './useSavings';

// Gamification hooks
export * from './useGamification';

// ==================== CONVENIENCE RE-EXPORTS ====================
// Re-export commonly used types and utilities
export { apiClient, tokenManager } from '../apiClient';
export * from '../endpoints';
export * from '../types';
