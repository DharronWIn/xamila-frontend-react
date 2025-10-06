// ==================== ROOT PATHS ====================
const root = {
  auth: '/auth',
  users: '/users',
  challenges: '/challenges',
  financial: '/financial',
  social: '/social',
  notifications: '/notifications',
  resources: '/resources',
  savings: '/savings',
  bankAccounts: '/bank-accounts',
  settings: '/settings',
  admin: '/admin',
  health: '/health',
  mobileMoney: '/mobile-money',
  payments: '/payments',
  avatars: '/avatars',
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
  
  // Testing
  testEmail: `${root.auth}/test-email`,
}

// ==================== USERS ENDPOINTS ====================
export const userEndpoints = {
  profile: `${root.users}/profile`,
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

// ==================== FINANCIAL ENDPOINTS ====================
export const financialEndpoints = {
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
  challenges: `${root.challenges}`,
  challengeStats: `${root.challenges}/stats`,
  challengeDetails: (id: string) => `${root.challenges}/${id}`,
  createChallenge: `${root.challenges}`,
  updateChallenge: (id: string) => `${root.challenges}/${id}`,
  deleteChallenge: (id: string) => `${root.challenges}/${id}`,
  challengeParticipants: (id: string) => `${root.challenges}/${id}/participants`,
  challengeTransactions: (id: string) => `${root.challenges}/${id}/transactions`,
  challengeLeaderboard: (id: string) => `${root.challenges}/${id}/collective/leaderboard`,
  challengeProgress: (id: string) => `${root.challenges}/${id}/collective/progress`,
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
