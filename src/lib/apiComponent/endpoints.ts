// ==================== ROOT PATHS ====================
const root = {
  auth: '/auth',
  users: '/users',
  challenges: '/challenges',
  defis: '/defis',
  financial: '/financial',
  social: '/social',
  notifications: '/notifications',
  resources: '/resources',
  userResources: '/user-resources',
  coachingRequests: '/coaching-requests',
  savings: '/savings',
  bankAccounts: '/bank-accounts',
  settings: '/settings',
  admin: '/admin',
  health: '/health',
  mobileMoney: '/mobile-money',
  payments: '/payments',
  avatars: '/avatars',
  gamification: '/gamification',
}

// ==================== AUTHENTICATION ENDPOINTS ====================
export const authEndpoints = {
  //Registration
  register: `${root.auth}/register`,
  login: `${root.auth}/login`,
  resendOtp: `${root.auth}/resend-otp`,
  
  // Verification & Password
  verifyEmail: `${root.auth}/verify-email`,
  verifyAccount: `${root.auth}/verify-account`,
  forgotPassword: `${root.auth}/forgot-password`,
  resetPassword: `${root.auth}/reset-password`,
  
  // Profile Management
  profile: `${root.auth}/profile`,
  me: `${root.auth}/me`,
  changePassword: `${root.auth}/change-password`,
  
  // Auth Status
  checkAuth: `${root.auth}/check-auth`,
  checkVerification: `${root.auth}/check-verification`,
  loginConfig: `${root.auth}/login-config`,
  
  // OTP Flow
  sendOtp: `${root.auth}/otp/send`,
  verifyOtp: `${root.auth}/otp/verify`,
  
  // Token Management
  refreshToken: `${root.auth}/refresh-token`,
  
  // Countries
  countries: `${root.auth}/countries`,
  
  // Testing
  testEmail: `${root.auth}/test-email`,
}

// ==================== USERS ENDPOINTS ====================
export const userEndpoints = {
  profile: `${root.users}/profile`,
  profilePublic: (userId: string) => `${root.users}/${userId}/profile-public`,
  stats: `${root.users}/stats`,
  activity: `${root.users}/activity`,
  uploadAvatar: `${root.users}/upload-avatar`,
  
  // Premium Management
  upgradePremium: `${root.users}/premium/upgrade`,
  cancelPremium: `${root.users}/premium/cancel`,
  premiumStatus: `${root.users}/premium/status`,
  premiumHistory: `${root.users}/premium/history`,
  extendPremium: `${root.users}/premium/extend`,
  startTrial: `${root.users}/premium/trial`,
}

// ==================== CHALLENGES ENDPOINTS ====================
export const challengeEndpoints = {
  // Challenge CRUD
  list: `${root.challenges}`,
  stats: `${root.challenges}/stats`,
  details: (id: string) => `${root.challenges}/${id}`,
  create: `${root.challenges}`,
  update: (id: string) => `${root.challenges}/${id}`,
  delete: (id: string) => `${root.challenges}/${id}`,
  firstActive: `${root.challenges}/active/first`,
  
  // Current User Challenge
  current: `${root.challenges}/current`,
  currentCollectiveProgress: `${root.challenges}/current/collective/progress`,
  currentLeaderboard: `${root.challenges}/current/collective/leaderboard`,
  currentMilestones: `${root.challenges}/current/collective/milestones`,
  currentAchievements: `${root.challenges}/current/collective/achievements`,
  currentTimeline: `${root.challenges}/current/collective/timeline`,
  
  // Participants
  participants: (challengeId: string) => `${root.challenges}/${challengeId}/participants`,
  joinChallenge: (challengeId: string) => `${root.challenges}/${challengeId}/participants`,
  leaveChallenge: (challengeId: string) => `${root.challenges}/${challengeId}/participants/me`,
  abandonChallenge: (challengeId: string) => `${root.challenges}/${challengeId}/participants/me/abandon`,
  
  // Transactions
  transactions: (challengeId: string) => `${root.challenges}/${challengeId}/transactions`,
  addTransaction: (challengeId: string) => `${root.challenges}/${challengeId}/transactions`,
  deleteTransaction: (challengeId: string, transactionId: string) => `${root.challenges}/${challengeId}/transactions/${transactionId}`,
  transactionStats: (challengeId: string) => `${root.challenges}/${challengeId}/transactions/stats`,
  
  // Goals
  configureGoal: (challengeId: string) => `${root.challenges}/${challengeId}/goals/configure`,
  myGoal: (challengeId: string) => `${root.challenges}/${challengeId}/goals/me`,
  updateGoal: (challengeId: string) => `${root.challenges}/${challengeId}/goals/me`,
  
  // Collective Progress
  collectiveProgress: (challengeId: string) => `${root.challenges}/${challengeId}/collective/progress`,
  leaderboard: (challengeId: string) => `${root.challenges}/${challengeId}/collective/leaderboard`,
  milestones: (challengeId: string) => `${root.challenges}/${challengeId}/collective/milestones`,
  achievements: (challengeId: string) => `${root.challenges}/${challengeId}/collective/achievements`,
  timeline: (challengeId: string) => `${root.challenges}/${challengeId}/collective/timeline`,
}

// ==================== USER CHALLENGES ENDPOINTS ====================
export const userChallengeEndpoints = {
  userChallenges: (userId: string) => `${root.users}/${userId}/challenges`,
  currentChallenge: (userId: string) => `${root.users}/${userId}/challenges/current`,
  challengeHistory: (userId: string) => `${root.users}/${userId}/challenges/history`,
  challengeStats: (userId: string) => `${root.users}/${userId}/challenges/stats`,
}

// ==================== DEFIS ENDPOINTS ====================
export const defiEndpoints = {
  // Defi CRUD
  list: `${root.defis}`,
  stats: `${root.defis}/stats`,
  details: (id: string) => `${root.defis}/${id}`,
  create: `${root.defis}`,
  update: (id: string) => `${root.defis}/${id}`,
  delete: (id: string) => `${root.defis}/${id}`,
  
  // Participants
  participants: (defiId: string) => `${root.defis}/${defiId}/participants`,
  joinDefi: (defiId: string) => `${root.defis}/${defiId}/participants`,
  leaveDefi: (defiId: string) => `${root.defis}/${defiId}/participants/me`,
  abandonDefi: (defiId: string) => `${root.defis}/${defiId}/participants/me/abandon`,
  
  // Transactions
  transactions: (defiId: string) => `${root.defis}/${defiId}/transactions`,
  addTransaction: (defiId: string) => `${root.defis}/${defiId}/transactions`,
  transactionStats: (defiId: string) => `${root.defis}/${defiId}/transactions/stats`,
  
  // Goals
  configureGoal: (defiId: string) => `${root.defis}/${defiId}/goals/configure`,
  myGoal: (defiId: string) => `${root.defis}/${defiId}/goals/me`,
  updateGoal: (defiId: string) => `${root.defis}/${defiId}/goals/me`,
}

// ==================== USER DEFIS ENDPOINTS ====================
export const userDefiEndpoints = {
  userDefis: (userId: string) => `${root.users}/${userId}/defis`,
  defiStats: (userId: string) => `${root.users}/${userId}/defis/stats`,
}

// ==================== FINANCIAL ENDPOINTS ====================
export const financialEndpoints = {
  // Flux Financier
  fluxBalance: `${root.financial}/flux/balance`,
  fluxSummary: `${root.financial}/flux/summary`,
  fluxToggle: `${root.financial}/flux/toggle`,
  fluxChartByCategory: `${root.financial}/flux/chart-by-category`,
  
  // Transactions
  transactions: `${root.financial}/transactions`,
  createTransaction: `${root.financial}/transactions`,
  transactionById: (id: string) => `${root.financial}/transactions/${id}`,
  updateTransaction: (id: string) => `${root.financial}/transactions/${id}`,
  deleteTransaction: (id: string) => `${root.financial}/transactions/${id}`,
  
  // Statistics & Charts
  transactionStats: `${root.financial}/transactions/stats`,
  chartData: `${root.financial}/transactions/charts`,
  categories: `${root.financial}/transactions/categories`,
  categoriesWithType: `${root.financial}/categories`,
}

// ==================== SOCIAL ENDPOINTS ====================
export const socialEndpoints = {
  // Posts
  posts: `${root.social}/posts`,
  createPost: `${root.social}/posts`,
  postById: (id: string) => `${root.social}/posts/${id}`,
  updatePost: (id: string) => `${root.social}/posts/${id}`,
  deletePost: (id: string) => `${root.social}/posts/${id}`,
  likePost: (id: string) => `${root.social}/posts/${id}/like`,
  sharePost: (id: string) => `${root.social}/posts/${id}/share`,
  
  // Comments
  postComments: (postId: string) => `${root.social}/posts/${postId}/comments`,
  createComment: (postId: string) => `${root.social}/posts/${postId}/comments`,
  updateComment: (id: string) => `${root.social}/comments/${id}`,
  deleteComment: (id: string) => `${root.social}/comments/${id}`,
}

// ==================== NOTIFICATIONS ENDPOINTS ====================
export const notificationEndpoints = {
  list: `${root.notifications}`,
  unreadCount: `${root.notifications}/unread-count`,
  details: (id: string) => `${root.notifications}/${id}`,
  markAsRead: (id: string) => `${root.notifications}/${id}/read`,
  markAllAsRead: `${root.notifications}/read-all`,
  delete: (id: string) => `${root.notifications}/${id}`,
  clearRead: `${root.notifications}/clear-read`,
}

// ==================== RESOURCES ENDPOINTS ====================
export const resourceEndpoints = {
  list: `${root.resources}`,
  categories: `${root.resources}/categories`,
  search: `${root.resources}/search`,
  details: (id: string) => `${root.resources}/${id}`,
  download: (id: string) => `${root.resources}/download/${id}`,
}

// ==================== COACHING REQUESTS ENDPOINTS ====================
export const coachingEndpoints = {
  create: `${root.coachingRequests}`,
  myRequests: `${root.coachingRequests}/me`,
}

// ==================== USER RESOURCES ENDPOINTS ====================
export const userResourceEndpoints = {
  list: (params?: { type?: string; challengeId?: string }) => {
    const qp = new URLSearchParams();
    if (params?.type) qp.append('type', params.type);
    if (params?.challengeId) qp.append('challengeId', params.challengeId);
    const query = qp.toString();
    return `${root.userResources}${query ? `?${query}` : ''}`;
  },
  details: (resourceId: string) => `${root.userResources}/${resourceId}`,
  download: (resourceId: string) => `${root.userResources}/${resourceId}/download`,
  delete: (resourceId: string) => `${root.userResources}/${resourceId}`,
  downloadCharte: `documents/charte-epargne/download`,
};

// ==================== SAVINGS ENDPOINTS ====================
export const savingsEndpoints = {
  // Goals
  goals: `${root.savings}/goals`,
  createGoal: `${root.savings}/goals`,
  goalById: (id: string) => `${root.savings}/goals/${id}`,
  updateGoal: (id: string) => `${root.savings}/goals/${id}`,
  deleteGoal: (id: string) => `${root.savings}/goals/${id}`,
  contributeToGoal: (id: string) => `${root.savings}/goals/${id}/contribute`,
  goalsStats: `${root.savings}/goals/stats`,
  
  // Challenges
  challenges: `${root.savings}/challenges`,
  createChallenge: `${root.savings}/challenges`,
  challengeById: (id: string) => `${root.savings}/challenges/${id}`,
  joinChallenge: (id: string) => `${root.savings}/challenges/${id}/join`,
  leaveChallenge: (id: string) => `${root.savings}/challenges/${id}/leave`,
  contributeToChallenge: (id: string) => `${root.savings}/challenges/${id}/contribute`,
  challengeLeaderboard: (id: string) => `${root.savings}/challenges/${id}/leaderboard`,
  
  // Collective Progress
  collectiveProgress: `${root.savings}/collective-progress`,
}

// ==================== BANK ACCOUNTS ENDPOINTS ====================
export const bankAccountEndpoints = {
  list: `${root.bankAccounts}`,
  apply: `${root.bankAccounts}/apply`,
  applicationDetails: (id: string) => `${root.bankAccounts}/application/${id}`,
  myApplications: `${root.bankAccounts}/my-applications`,
  features: `${root.bankAccounts}/features`,
}

// ==================== SETTINGS ENDPOINTS ====================
export const settingsEndpoints = {
  list: `${root.settings}`,
  profile: `${root.settings}/profile`,
  preferences: `${root.settings}/preferences`,
  notifications: `${root.settings}/notifications`,
  theme: `${root.settings}/theme`,
  changePassword: `${root.settings}/change-password`,
  deleteAccount: `${root.settings}/delete-account`,
}

// ==================== ADMIN ENDPOINTS ====================
export const adminEndpoints = {
  // Authentication
  login: `${root.admin}/auth/login`,
  profile: `${root.admin}/profile`,
  changePassword: `${root.admin}/change-password`,
  
  // Dashboard
  dashboard: `${root.admin}/dashboard`,
  userStats: `${root.admin}/stats/users`,
  adminStats: `${root.admin}/stats/admins`,
  
  // Users Management
  users: `${root.admin}/users`,
  pendingUsers: `${root.admin}/users/pending`,
  userDetails: (id: string) => `${root.admin}/users/${id}`,
  updateUser: (id: string) => `${root.admin}/users/${id}`,
  toggleUserActive: (id: string) => `${root.admin}/users/${id}/toggle-active`,
  toggleUserVerified: (id: string) => `${root.admin}/users/${id}/toggle-verified`,
  deleteUser: (id: string) => `${root.admin}/users/${id}`,
  approveUser: (id: string) => `${root.admin}/users/${id}/approve`,
  rejectUser: (id: string) => `${root.admin}/users/${id}/reject`,
  upgradeUserToPremium: (id: string) => `${root.admin}/users/${id}/upgrade-premium`,
  approveAndUpgradeToPremium: (id: string) => `${root.admin}/users/${id}/approve-and-upgrade-premium`,
  regenerateUserAccess: (id: string) => `${root.admin}/users/${id}/regenerate-access`,
  
  // System Settings
  settings: `${root.admin}/settings`,
  settingsByCategory: `${root.admin}/settings/by-category`,
  settingByKey: (key: string) => `${root.admin}/settings/${key}`,
  createSetting: `${root.admin}/settings`,
  updateSetting: (key: string) => `${root.admin}/settings/${key}`,
  deleteSetting: (key: string) => `${root.admin}/settings/${key}`,
  
  // Resources Management
  resources: `${root.admin}/resources`,
  createResource: `${root.admin}/resources`,
  updateResource: (id: string) => `${root.admin}/resources/${id}`,
  deleteResource: (id: string) => `${root.admin}/resources/${id}`,
  resourceStats: `${root.admin}/resources/stats`,
  resourceById: (id: string) => `${root.admin}/resources/${id}`,
  
  // Bank Accounts Management
  bankAccounts: `${root.admin}/bank-accounts`,
  bankAccountStats: `${root.admin}/bank-accounts/stats`,
  approveBankAccount: (id: string) => `${root.admin}/bank-accounts/${id}/approve`,
  rejectBankAccount: (id: string) => `${root.admin}/bank-accounts/${id}/reject`,
  
  // Notifications Management
  broadcastNotification: `${root.admin}/notifications/broadcast`,
  allNotifications: `${root.admin}/notifications`,
  notificationStats: `${root.admin}/notifications/stats`,
  
  // Challenges Management
  challenges: `${root.admin}/challenges`,
  challengeStats: `${root.admin}/challenges/stats`,
  challengeDetails: (id: string) => `${root.admin}/challenges/${id}`,
  createChallenge: `${root.admin}/challenges`,
  updateChallenge: (id: string) => `${root.admin}/challenges/${id}`,
  deleteChallenge: (id: string) => `${root.admin}/challenges/${id}`,
  toggleChallengeActive: (id: string) => `${root.admin}/challenges/${id}/toggle-active`,
  challengeParticipants: (id: string) => `${root.admin}/challenges/${id}/participants`,
  challengeTransactions: (id: string) => `${root.admin}/challenges/${id}/transactions`,

  // Defis Management
  defis: `${root.admin}/defis`,
  defisStats: `${root.admin}/defis/stats`,
  defiDetails: (id: string) => `${root.admin}/defis/${id}`,
  createDefi: `${root.admin}/defis`,
  updateDefi: (id: string) => `${root.admin}/defis/${id}`,
  deleteDefi: (id: string) => `${root.admin}/defis/${id}`,
  toggleDefiOfficial: (id: string) => `${root.admin}/defis/${id}/toggle-official`,
  updateDefiStatus: (id: string) => `${root.admin}/defis/${id}/status`,
  defiParticipants: (id: string) => `${root.admin}/defis/${id}/participants`,
  defiTransactions: (id: string) => `${root.admin}/defis/${id}/transactions`,

  // Financial Transactions Management
  financialTransactions: `${root.admin}/financial/transactions`,
  financialTransactionsStats: `${root.admin}/financial/transactions/stats`,
  financialTransactionDetails: (id: string) => `${root.admin}/financial/transactions/${id}`,
  updateFinancialTransaction: (id: string) => `${root.admin}/financial/transactions/${id}`,
  deleteFinancialTransaction: (id: string) => `${root.admin}/financial/transactions/${id}`,
  financialTransactionsByUser: (userId: string) => `${root.admin}/financial/transactions/by-user/${userId}`,
  financialGlobalFlux: `${root.admin}/financial/flux/global`,

  // Savings Goals Management
  savingsGoals: `${root.admin}/savings/goals`,
  savingsGoalDetails: (id: string) => `${root.admin}/savings/goals/${id}`,
  updateSavingsGoal: (id: string) => `${root.admin}/savings/goals/${id}`,
  deleteSavingsGoal: (id: string) => `${root.admin}/savings/goals/${id}`,
  savingsChallenges: `${root.admin}/savings/challenges`,
  savingsChallengeDetails: (id: string) => `${root.admin}/savings/challenges/${id}`,
  savingsStats: `${root.admin}/savings/stats`,
  savingsCollectiveProgress: `${root.admin}/savings/collective-progress`,

  // Social (Posts & Comments) Management
  socialPosts: `${root.admin}/social/posts`,
  socialPostDetails: (id: string) => `${root.admin}/social/posts/${id}`,
  updateSocialPost: (id: string) => `${root.admin}/social/posts/${id}`,
  deleteSocialPost: (id: string) => `${root.admin}/social/posts/${id}`,
  toggleSocialPostVisible: (id: string) => `${root.admin}/social/posts/${id}/toggle-visible`,
  socialComments: `${root.admin}/social/comments`,
  deleteSocialComment: (id: string) => `${root.admin}/social/comments/${id}`,
  socialStats: `${root.admin}/social/stats`,
  socialReports: `${root.admin}/social/reports`,

  // Gamification Management
  gamificationTrophies: `${root.admin}/gamification/trophies`,
  gamificationTrophyDetails: (id: string) => `${root.admin}/gamification/trophies/${id}`,
  createGamificationTrophy: `${root.admin}/gamification/trophies`,
  updateGamificationTrophy: (id: string) => `${root.admin}/gamification/trophies/${id}`,
  deleteGamificationTrophy: (id: string) => `${root.admin}/gamification/trophies/${id}`,
  gamificationBadges: `${root.admin}/gamification/badges`,
  gamificationBadgeDetails: (id: string) => `${root.admin}/gamification/badges/${id}`,
  createGamificationBadge: `${root.admin}/gamification/badges`,
  updateGamificationBadge: (id: string) => `${root.admin}/gamification/badges/${id}`,
  deleteGamificationBadge: (id: string) => `${root.admin}/gamification/badges/${id}`,
  gamificationUserData: (userId: string) => `${root.admin}/gamification/users/${userId}`,
  deleteUserTrophy: (userId: string, trophyId: string) => `${root.admin}/gamification/users/${userId}/trophies/${trophyId}`,
  gamificationStats: `${root.admin}/gamification/stats`,
  gamificationLeaderboard: `${root.admin}/gamification/leaderboard`,

  // FineoPay Payments Management
  fineopayPayments: `${root.admin}/fineopay/payments`,
  fineopayPaymentsStats: `${root.admin}/fineopay/payments/stats`,
  fineopayPaymentDetails: (id: string) => `${root.admin}/fineopay/payments/${id}`,
  fineopayPaymentsByUser: (userId: string) => `${root.admin}/fineopay/payments/by-user/${userId}`,
  fineopayPaymentsByStatus: `${root.admin}/fineopay/payments/by-status`,
  fineopayPaymentsRevenue: `${root.admin}/fineopay/payments/revenue`,
  fineopayPaymentByReference: (reference: string) => `${root.admin}/fineopay/payments/reference/${reference}`,

  // Subscriptions Management
  subscriptions: `${root.admin}/subscriptions`,
  subscriptionsStats: `${root.admin}/subscriptions/stats`,
  subscriptionsByUser: (userId: string) => `${root.admin}/subscriptions/by-user/${userId}`,
  subscriptionDetails: (id: string) => `${root.admin}/subscriptions/${id}`,
  cancelSubscription: (id: string) => `${root.admin}/subscriptions/${id}/cancel`,
  extendSubscription: (id: string) => `${root.admin}/subscriptions/${id}/extend`,
  subscriptionsRevenue: `${root.admin}/subscriptions/revenue`,

  // Coaching Requests Management
  coachingRequests: `${root.admin}/coaching-requests`,
  coachingRequestsQuery: (query: string) => `${root.admin}/coaching-requests${query ? `?${query}` : ''}`,
  updateCoachingRequestStatus: (id: string) => `${root.admin}/coaching-requests/${id}/status`,
}

// ==================== AVATAR ENDPOINTS ====================
export const avatarEndpoints = {
  avatars: `${root.avatars}`,
  avatarsByCategory: (category: string) => `${root.avatars}?category=${category}`,
  avatarById: (id: string) => `${root.avatars}/${id}`,
  updateUserPicture: (userId: string) => `${root.avatars}/users/${userId}/picture`,
  deleteUserPicture: (userId: string) => `${root.avatars}/users/${userId}/picture`,
}

// ==================== HEALTH ENDPOINTS ====================
export const healthEndpoints = {
  check: `${root.health}`,
}

// ==================== MOBILE MONEY ENDPOINTS ====================
export const mobileMoneyEndpoints = {
  initiate: `${root.mobileMoney}/initiate`,
  callback: `${root.mobileMoney}/callback`,
  status: (id: string) => `${root.mobileMoney}/status/${id}`,
}

// ==================== PAYMENTS ENDPOINTS ====================
export const paymentEndpoints = {
  // MOMO
  momoInitiate: `${root.payments}/momo/initiate`,
  momoCallback: `${root.payments}/momo/callback`,
  momoStatus: (id: string) => `${root.payments}/momo/status/${id}`,
  
  // Card
  cardInitiate: `${root.payments}/card/initiate`,
  cardConfirm: `${root.payments}/card/confirm`,
  cardStatus: (id: string) => `${root.payments}/card/status/${id}`,
  
  // Subscriptions
  createSubscription: `${root.payments}/subscriptions/create`,
  cancelSubscription: `${root.payments}/subscriptions/cancel`,
  subscriptionStatus: `${root.payments}/subscriptions/status`,
  
  // History
  history: `${root.payments}/history`,

  // fineopay
  fineopayCheckoutLink: `fineopay/checkout-link`,
}

// ==================== GAMIFICATION ENDPOINTS ====================
export const gamificationEndpoints = {
  // Dashboard
  dashboard: `${root.gamification}/dashboard`,
  
  // Trophées
  checkTrophies: `${root.gamification}/trophies/check`,
  trophies: `${root.gamification}/trophies`,
  myTrophies: `${root.gamification}/trophies/my`,
  trophiesProgress: `${root.gamification}/trophies/progress`,
  
  // Badges
  badges: `${root.gamification}/badges`,
  myBadges: `${root.gamification}/badges/my`,
  
  // XP & Niveaux
  level: `${root.gamification}/level`,
  stats: `${root.gamification}/stats`,
  xpHistory: `${root.gamification}/xp/history`,
}


// ==================== LEGACY COMPATIBILITY ====================
// Keep some legacy endpoints for backward compatibility
export const legacyEndpoints = {
  login: authEndpoints.login,
  signup: authEndpoints.register,
  register: authEndpoints.register,
  logout: '/auth/logout', // Note: This endpoint doesn't exist in the backend
  refreshToken: authEndpoints.resendOtp, // Note: This might need adjustment
  user: authEndpoints.me,
  users: userEndpoints.profile,
  verifyEmail: authEndpoints.verifyAccount,
  forgotPassword: authEndpoints.forgotPassword,
  resetPassword: authEndpoints.resetPassword,
}
