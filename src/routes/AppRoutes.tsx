import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "../pages/Index";
import NotFound from "../pages/NotFound";
import VerifyEmail from "../pages/VerifyEmail";
import Registration from "../pages/Registration";

// User pages
import UserDashboard from "../pages/UserDashboard";
import Dashboard from "../pages/Dashboard";
import DashboardSimple from "../pages/DashboardSimple";
import Transactions from "../pages/Transactions";
import SavingsChallenge from "../pages/SavingsChallenge";
import CollectiveProgress from "../pages/CollectiveProgress";
import Resources from "../pages/Resources";
import BankAccount from "../pages/BankAccount";
import Notifications from "../pages/Notifications";
import Feed from "../pages/Feed";
import Profile from "../pages/Profile";
import Challenges from "../pages/Challenges";
import DefisPage from "../pages/DefisPage";
import DefisListPage from "../pages/DefisListPage";
import DefiDetailPage from "../pages/DefiDetailPage";
import MyDefisPage from "../pages/MyDefisPage";
import MyChallenge from "../pages/MyChallenge";
import TestPage from "../pages/TestPage";
import Settings from "../pages/Settings";
import FluxFinancier from "../pages/FluxFinancier";
import MyResources from "../pages/MyResources";

// Gamification pages
import GamificationDashboard from "../pages/GamificationDashboard";
import TrophiesPage from "../pages/TrophiesPage";
import LeaderboardPage from "../pages/LeaderboardPage";
import { GamificationTestPage } from "../pages/GamificationTestPage";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import UserDetail from "../pages/admin/UserDetail";
import FinancialManagement from "../pages/admin/FinancialManagement";
import SavingsManagement from "../pages/admin/SavingsManagement";
import SocialManagement from "../pages/admin/SocialManagement";
import NotificationsManagement from "../pages/admin/NotificationsManagement";
import BankAccountsManagement from "../pages/admin/BankAccountsManagement";
import ChallengesManagement from "../pages/admin/ChallengesManagement";
import ChallengeDetail from "../pages/admin/ChallengeDetail";
import CoachingRequestsManagement from "../pages/admin/CoachingRequestsManagement";
import DefisManagement from "../pages/admin/DefisManagement";
import GamificationManagement from "../pages/admin/GamificationManagement";
import FineoPayManagement from "../pages/admin/FineoPayManagement";
import SubscriptionsManagement from "../pages/admin/SubscriptionsManagement";

const AdminStats = () => <div className="p-6"><h1 className="text-2xl font-bold">Statistiques</h1><p>Admin - Statistiques en construction</p></div>;
const AdminResources = () => <div className="p-6"><h1 className="text-2xl font-bold">Gestion des ressources</h1><p>Admin - Gestion des ressources en construction</p></div>;

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      
      {/* ===== USER DASHBOARD ROUTES ===== */}
      <Route path="/user-dashboard" element={
        <ProtectedRoute>
          <AppLayout><UserDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      
      {/* User Dashboard Sub-routes */}
      <Route path="/user-dashboard/overview" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/simple" element={
        <ProtectedRoute>
          <AppLayout><DashboardSimple /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/resources" element={
        <ProtectedRoute>
          <AppLayout><Resources /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/my-resources" element={
        <ProtectedRoute>
          <AppLayout><MyResources /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/transactions" element={
        <ProtectedRoute>
          <AppLayout><FluxFinancier /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/savings" element={
        <ProtectedRoute>
          <AppLayout><SavingsChallenge /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/collective-progress" element={
        <ProtectedRoute>
          <AppLayout><CollectiveProgress /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/bank-account" element={
        <ProtectedRoute>
          <AppLayout><BankAccount /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/notifications" element={
        <ProtectedRoute>
          <AppLayout><Notifications /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/feed" element={
        <ProtectedRoute>
          <AppLayout><Feed /></AppLayout>
        </ProtectedRoute>
      } />


      <Route path="/user-dashboard/profile" element={
        <ProtectedRoute>
          <AppLayout><Profile /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/challenges" element={
        <ProtectedRoute>
          <AppLayout><Challenges /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/defis" element={
        <ProtectedRoute>
          <AppLayout><DefisPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/defis-list" element={
        <ProtectedRoute>
          <AppLayout><DefisListPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/defis/:id" element={
        <ProtectedRoute>
          <AppLayout><DefiDetailPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/mes-defis" element={
        <ProtectedRoute>
          <AppLayout><MyDefisPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/my-challenge" element={
        <ProtectedRoute>
          <AppLayout><MyChallenge /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/test" element={
        <ProtectedRoute>
          <AppLayout><TestPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/settings" element={
        <ProtectedRoute>
          <AppLayout><Settings /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard/help" element={
        <ProtectedRoute>
          <AppLayout><div className="p-6"><h1 className="text-2xl font-bold">Aide</h1><p>Aide - En construction</p></div></AppLayout>
        </ProtectedRoute>
      } />

      {/* ===== GAMIFICATION ROUTES ===== */}
      <Route path="/gamification" element={
        <ProtectedRoute>
          <AppLayout><GamificationDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/gamification/trophies" element={
        <ProtectedRoute>
          <AppLayout><TrophiesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/gamification/leaderboard" element={
        <ProtectedRoute>
          <AppLayout><LeaderboardPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/gamification/test" element={
        <ProtectedRoute>
          <AppLayout><GamificationTestPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* ===== ADMIN DASHBOARD ROUTES ===== */}
      <Route path="/admin-dashboard" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><AdminDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Admin Dashboard Sub-routes */}
      <Route path="/admin-dashboard/users" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><UserManagement /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard/users/:userId" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><UserDetail /></AppLayout>
        </ProtectedRoute>
      } />
      {/* <Route path="/admin-dashboard/stats" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><AdminStats /></AppLayout>
        </ProtectedRoute>
      } /> */}
      <Route path="/admin-dashboard/resources" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><AdminResources /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard/financial" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><FinancialManagement /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard/savings" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><SavingsManagement /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard/social" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><SocialManagement /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard/notifications" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><NotificationsManagement /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard/bank-accounts" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><BankAccountsManagement /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard/challenges" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><ChallengesManagement /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard/challenges/:id" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><ChallengeDetail /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard/coaching-requests" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><CoachingRequestsManagement /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard/defis" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><DefisManagement /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard/gamification" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><GamificationManagement /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard/fineopay" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><FineoPayManagement /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard/subscriptions" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><SubscriptionsManagement /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Legacy routes - redirect to new structure */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><UserDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AppLayout><AdminDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
