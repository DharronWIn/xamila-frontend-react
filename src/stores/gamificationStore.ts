import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    Trophy,
    UserTrophy,
    Badge,
    UserBadge,
    UserLevel,
    XPHistoryEntry,
    LeaderboardEntry,
    LeaderboardPosition,
    UserStats,
    GamificationDashboard,
    CheckRewardsResponse,
    TrophyProgress
} from '@/types/gamification';

// ==================== STORE INTERFACES ====================

interface GamificationState {
  // Dashboard data
  dashboard: GamificationDashboard | null;
  dashboardLoading: boolean;
  dashboardError: string | null;
  lastDashboardUpdate: number | null;

  // Trophies
  allTrophies: Trophy[];
  myTrophies: UserTrophy[];
  trophiesProgress: TrophyProgress[];
  trophiesLoading: boolean;
  trophiesError: string | null;

  // Badges
  allBadges: Badge[];
  myBadges: UserBadge[];
  badgesLoading: boolean;
  badgesError: string | null;

  // Level & XP
  level: UserLevel | null;
  xpHistory: XPHistoryEntry[];
  levelLoading: boolean;
  levelError: string | null;

  // Leaderboard
  leaderboard: LeaderboardEntry[];
  myPosition: LeaderboardPosition | null;
  leaderboardLoading: boolean;
  leaderboardError: string | null;

  // Stats
  stats: UserStats | null;
  statsLoading: boolean;
  statsError: string | null;

  // Notifications
  recentlyUnlockedTrophies: Trophy[];
  showTrophyModal: boolean;
  currentUnlockedTrophy: Trophy | null;
  previousLevel: number | null;
  showLevelUpModal: boolean;

  // Actions - Dashboard
  setDashboard: (dashboard: GamificationDashboard | null) => void;
  setDashboardLoading: (loading: boolean) => void;
  setDashboardError: (error: string | null) => void;

  // Actions - Trophies
  setAllTrophies: (trophies: Trophy[]) => void;
  setMyTrophies: (trophies: UserTrophy[]) => void;
  setTrophiesProgress: (trophies: TrophyProgress[]) => void;
  setTrophiesLoading: (loading: boolean) => void;
  setTrophiesError: (error: string | null) => void;

  // Actions - Badges
  setAllBadges: (badges: Badge[]) => void;
  setMyBadges: (badges: UserBadge[]) => void;
  setBadgesLoading: (loading: boolean) => void;
  setBadgesError: (error: string | null) => void;

  // Actions - Level & XP
  setLevel: (level: UserLevel | null) => void;
  setXPHistory: (history: XPHistoryEntry[]) => void;
  setLevelLoading: (loading: boolean) => void;
  setLevelError: (error: string | null) => void;
  updateXP: (newLevel: UserLevel) => void;

  // Actions - Leaderboard
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  setMyPosition: (position: LeaderboardPosition | null) => void;
  setLeaderboardLoading: (loading: boolean) => void;
  setLeaderboardError: (error: string | null) => void;

  // Actions - Stats
  setStats: (stats: UserStats | null) => void;
  setStatsLoading: (loading: boolean) => void;
  setStatsError: (error: string | null) => void;

  // Actions - Notifications
  addRecentlyUnlockedTrophy: (trophy: Trophy) => void;
  clearRecentlyUnlockedTrophies: () => void;
  showTrophyUnlockedModal: (trophy: Trophy) => void;
  hideTrophyUnlockedModal: () => void;
  showLevelUp: () => void;
  hideLevelUp: () => void;

  // Utility actions
  reset: () => void;
  shouldRefreshDashboard: () => boolean;
}

// ==================== INITIAL STATE ====================

const initialState = {
  dashboard: null,
  dashboardLoading: false,
  dashboardError: null,
  lastDashboardUpdate: null,

  allTrophies: [],
  myTrophies: [],
  trophiesProgress: [],
  trophiesLoading: false,
  trophiesError: null,

  allBadges: [],
  myBadges: [],
  badgesLoading: false,
  badgesError: null,

  level: null,
  xpHistory: [],
  levelLoading: false,
  levelError: null,

  leaderboard: [],
  myPosition: null,
  leaderboardLoading: false,
  leaderboardError: null,

  stats: null,
  statsLoading: false,
  statsError: null,

  recentlyUnlockedTrophies: [],
  showTrophyModal: false,
  currentUnlockedTrophy: null,
  previousLevel: null,
  showLevelUpModal: false,
};

// ==================== CACHE DURATION ====================
const DASHBOARD_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ==================== STORE ====================

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Dashboard actions
      setDashboard: (dashboard) =>
        set({
          dashboard,
          lastDashboardUpdate: Date.now(),
        }),

      setDashboardLoading: (loading) =>
        set({ dashboardLoading: loading }),

      setDashboardError: (error) =>
        set({ dashboardError: error }),

      // Trophies actions
      setAllTrophies: (trophies) =>
        set({ allTrophies: trophies }),

      setMyTrophies: (trophies) =>
        set({ myTrophies: trophies }),

      setTrophiesProgress: (trophies) =>
        set({ trophiesProgress: trophies }),

      setTrophiesLoading: (loading) =>
        set({ trophiesLoading: loading }),

      setTrophiesError: (error) =>
        set({ trophiesError: error }),

      // Badges actions
      setAllBadges: (badges) =>
        set({ allBadges: badges }),

      setMyBadges: (badges) =>
        set({ myBadges: badges }),

      setBadgesLoading: (loading) =>
        set({ badgesLoading: loading }),

      setBadgesError: (error) =>
        set({ badgesError: error }),

      // Level & XP actions
      setLevel: (level) =>
        set({ level, previousLevel: get().level?.level ?? null }),

      setXPHistory: (history) =>
        set({ xpHistory: history }),

      setLevelLoading: (loading) =>
        set({ levelLoading: loading }),

      setLevelError: (error) =>
        set({ levelError: error }),

      updateXP: (newLevel) => {
        const currentLevel = get().level;
        const previousLevel = currentLevel?.level ?? null;

        set({
          level: newLevel,
          previousLevel,
        });

        // Check if level up
        if (previousLevel && newLevel.level > previousLevel) {
          set({ showLevelUpModal: true });
        }
      },

      // Leaderboard actions
      setLeaderboard: (leaderboard) =>
        set({ leaderboard }),

      setMyPosition: (position) =>
        set({ myPosition: position }),

      setLeaderboardLoading: (loading) =>
        set({ leaderboardLoading: loading }),

      setLeaderboardError: (error) =>
        set({ leaderboardError: error }),

      // Stats actions
      setStats: (stats) =>
        set({ stats }),

      setStatsLoading: (loading) =>
        set({ statsLoading: loading }),

      setStatsError: (error) =>
        set({ statsError: error }),

      // Notifications actions
      addRecentlyUnlockedTrophy: (trophy) =>
        set((state) => ({
          recentlyUnlockedTrophies: [trophy, ...state.recentlyUnlockedTrophies].slice(0, 10),
        })),

      clearRecentlyUnlockedTrophies: () =>
        set({ recentlyUnlockedTrophies: [] }),

      showTrophyUnlockedModal: (trophy) =>
        set({
          showTrophyModal: true,
          currentUnlockedTrophy: trophy,
        }),

      hideTrophyUnlockedModal: () =>
        set({
          showTrophyModal: false,
          currentUnlockedTrophy: null,
        }),

      showLevelUp: () =>
        set({ showLevelUpModal: true }),

      hideLevelUp: () =>
        set({ showLevelUpModal: false }),

      // Utility actions
      reset: () => set(initialState),

      shouldRefreshDashboard: () => {
        const lastUpdate = get().lastDashboardUpdate;
        if (!lastUpdate) return true;
        return Date.now() - lastUpdate > DASHBOARD_CACHE_DURATION;
      },
    }),
    {
      name: 'gamification-storage',
      partialize: (state) => ({
        // Only persist essential data
        dashboard: state.dashboard,
        lastDashboardUpdate: state.lastDashboardUpdate,
        level: state.level,
        myTrophies: state.myTrophies,
        myBadges: state.myBadges,
        recentlyUnlockedTrophies: state.recentlyUnlockedTrophies,
      }),
    }
  )
);

// ==================== SELECTORS ====================

// Selector for trophy status
export const getTrophyStatus = (
  trophy: Trophy,
  myTrophies: UserTrophy[],
  trophiesProgress: UserTrophy[]
): 'unlocked' | 'in_progress' | 'locked' => {
  const unlocked = myTrophies.find((t) => t.trophyId === trophy.id);
  if (unlocked?.isCompleted) return 'unlocked';

  const inProgress = trophiesProgress.find((t) => t.trophyId === trophy.id);
  if (inProgress && inProgress.progress > 0) return 'in_progress';

  return 'locked';
};

// Selector for trophy progress percentage
export const getTrophyProgress = (
  trophy: Trophy,
  myTrophies: UserTrophy[],
  trophiesProgress: UserTrophy[]
): number => {
  const unlocked = myTrophies.find((t) => t.trophyId === trophy.id);
  if (unlocked?.isCompleted) return 100;

  const inProgress = trophiesProgress.find((t) => t.trophyId === trophy.id);
  if (inProgress) return inProgress.progress;

  return 0;
};

