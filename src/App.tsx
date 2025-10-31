import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { FacebookLayout } from "@/components/layout/FacebookLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PremiumModalProvider } from "@/components/premium/PremiumModalProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Registration from "./pages/Registration";

// User pages
import UserDashboard from "./pages/UserDashboard";
import Dashboard from "./pages/Dashboard";
import DashboardSimple from "./pages/DashboardSimple";
import SavingsChallenge from "./pages/SavingsChallenge";
import CollectiveProgress from "./pages/CollectiveProgress";
import Resources from "./pages/Resources";
import BankAccount from "./pages/BankAccount";
import Notifications from "./pages/Notifications";
import Feed from "./pages/Feed";
import FeedSimple from "./pages/FeedSimple";
import FeedTest from "./pages/FeedTest";
import Profile from "./pages/Profile";
import Challenges from "./pages/Challenges";
import DefisListPage from "./pages/DefisListPage";
import DefiDetailPage from "./pages/DefiDetailPage";
import MyDefisPage from "./pages/MyDefisPage";
import MyChallenge from "./pages/MyChallenge";
import TestPage from "./pages/TestPage";
import Settings from "./pages/Settings";
import VerifyEmail from "./pages/VerifyEmail";
import FluxFinancier from "./pages/FluxFinancier";
import MyResources from "./pages/MyResources";
import ResourcesWebinars from "./pages/ResourcesWebinars";
import ResourcesVideos from "./pages/ResourcesVideos";
import ResourcesAudios from "./pages/ResourcesAudios";
import ResourcesDocuments from "./pages/ResourcesDocuments";
import { PublicProfilePage } from "./pages/PublicProfilePage";

// Gamification pages
import GamificationDashboard from "./pages/GamificationDashboard";
import TrophiesPage from "./pages/TrophiesPage";
import LeaderboardPage from "./pages/LeaderboardPage";

// Gamification components
import { TrophyUnlockedModal } from "@/components/gamification/TrophyUnlockedModal";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import UserDetail from "./pages/admin/UserDetail";
import FinancialManagement from "./pages/admin/FinancialManagement";
import SavingsManagement from "./pages/admin/SavingsManagement";
import SocialManagement from "./pages/admin/SocialManagement";
import NotificationsManagement from "./pages/admin/NotificationsManagement";
import BankAccountsManagement from "./pages/admin/BankAccountsManagement";
import ChallengesManagement from "./pages/admin/ChallengesManagement";
import ChallengeDetail from "./pages/admin/ChallengeDetail";
import CoachingRequestsManagement from "./pages/admin/CoachingRequestsManagement";
import DefisManagement from "./pages/admin/DefisManagement";
import GamificationManagement from "./pages/admin/GamificationManagement";
import FineoPayManagement from "./pages/admin/FineoPayManagement";
import SubscriptionsManagement from "./pages/admin/SubscriptionsManagement";

const AdminStats = () => <div className="p-6"><h1 className="text-2xl font-bold">Statistiques</h1><p>Admin - Statistiques en construction</p></div>;
const AdminResources = () => <div className="p-6"><h1 className="text-2xl font-bold">Gestion des ressources</h1><p>Admin - Gestion des ressources en construction</p></div>;

// Configure React Query with optimal cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh for 5 min
      gcTime: 10 * 60 * 1000, // 10 minutes - cache time (formerly cacheTime)
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Don't refetch on component mount if data is fresh
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
        <PremiumModalProvider>
          <Toaster />
          <Sonner />
          <TrophyUnlockedModal />
          <LevelUpModal />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
          {/* ===== USER DASHBOARD ROUTES ===== */}
          <Route path="/user-dashboard" element={
            <ProtectedRoute>
              <FacebookLayout><UserDashboard /></FacebookLayout>
            </ProtectedRoute>
          } />
          
          {/* User Dashboard Sub-routes */}
          <Route path="/user-dashboard/overview" element={
            <ProtectedRoute>
              <FacebookLayout><Dashboard /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/simple" element={
            <ProtectedRoute>
              <FacebookLayout><DashboardSimple /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/resources" element={
            <ProtectedRoute>
              <FacebookLayout><Resources /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/resources/webinars" element={
            <ProtectedRoute>
              <FacebookLayout><ResourcesWebinars /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/resources/videos" element={
            <ProtectedRoute>
              <FacebookLayout><ResourcesVideos /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/resources/audios" element={
            <ProtectedRoute>
              <FacebookLayout><ResourcesAudios /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/resources/documents" element={
            <ProtectedRoute>
              <FacebookLayout><ResourcesDocuments /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/my-resources" element={
            <ProtectedRoute>
              <FacebookLayout><MyResources /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/transactions" element={
            <ProtectedRoute>
              <FacebookLayout><FluxFinancier /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/savings" element={
            <ProtectedRoute>
              <FacebookLayout><SavingsChallenge /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/collective-progress" element={
            <ProtectedRoute>
              <FacebookLayout><CollectiveProgress /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/bank-account" element={
            <ProtectedRoute>
              <FacebookLayout><BankAccount /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/notifications" element={
            <ProtectedRoute>
              <FacebookLayout><Notifications /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/feed" element={
            <ProtectedRoute>
              <FacebookLayout><Feed /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/feed-simple" element={
            <ProtectedRoute>
              <FacebookLayout><FeedSimple /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/feed-test" element={
            <ProtectedRoute>
              <FacebookLayout><FeedTest /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/profile" element={
            <ProtectedRoute>
              <FacebookLayout><Profile /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/profile/:userId" element={
            <ProtectedRoute>
              <FacebookLayout><PublicProfilePage /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/challenges" element={
            <ProtectedRoute>
              <FacebookLayout><Challenges /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/defis" element={
            <ProtectedRoute>
              <FacebookLayout><DefisListPage /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/defis/:id" element={
            <ProtectedRoute>
              <FacebookLayout><DefiDetailPage /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/mes-defis" element={
            <ProtectedRoute>
              <FacebookLayout><MyDefisPage /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/my-challenge" element={
            <ProtectedRoute>
              <FacebookLayout><MyChallenge /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/test" element={
            <ProtectedRoute>
              <FacebookLayout><TestPage /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/settings" element={
            <ProtectedRoute>
              <FacebookLayout><Settings /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/help" element={
            <ProtectedRoute>
              <FacebookLayout><div className="p-6"><h1 className="text-2xl font-bold">Aide</h1><p>Aide - En construction</p></div></FacebookLayout>
            </ProtectedRoute>
          } />

          {/* ===== GAMIFICATION ROUTES ===== */}
          <Route path="/gamification" element={
            <ProtectedRoute>
              <FacebookLayout><GamificationDashboard /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/gamification/trophies" element={
            <ProtectedRoute>
              <FacebookLayout><TrophiesPage /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/gamification/leaderboard" element={
            <ProtectedRoute>
              <FacebookLayout><LeaderboardPage /></FacebookLayout>
            </ProtectedRoute>
          } />
          
          {/* ===== ADMIN DASHBOARD ROUTES ===== */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><AdminDashboard /></FacebookLayout>
            </ProtectedRoute>
          } />
          
          {/* Admin Dashboard Sub-routes */}
          <Route path="/admin-dashboard/users" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><UserManagement /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/users/:userId" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><UserDetail /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/stats" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><AdminStats /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/resources" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><AdminResources /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/financial" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><FinancialManagement /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/savings" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><SavingsManagement /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/social" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><SocialManagement /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/notifications" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><NotificationsManagement /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/bank-accounts" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><BankAccountsManagement /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/challenges" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><ChallengesManagement /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/challenges/:id" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><ChallengeDetail /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/coaching-requests" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><CoachingRequestsManagement /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/defis" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><DefisManagement /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/gamification" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><GamificationManagement /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/fineopay" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><FineoPayManagement /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/subscriptions" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><SubscriptionsManagement /></FacebookLayout>
            </ProtectedRoute>
          } />

          {/* Legacy routes - redirect to new structure */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <FacebookLayout><UserDashboard /></FacebookLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <FacebookLayout><AdminDashboard /></FacebookLayout>
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </PremiumModalProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
