import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PremiumModalProvider } from "@/components/premium/PremiumModalProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// User pages
import UserDashboard from "./pages/UserDashboard";
import Dashboard from "./pages/Dashboard";
import DashboardSimple from "./pages/DashboardSimple";
import Transactions from "./pages/Transactions";
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
import DefisPage from "./pages/DefisPage";
import MyChallenge from "./pages/MyChallenge";
import TestPage from "./pages/TestPage";
import Settings from "./pages/Settings";
import VerifyEmail from "./pages/VerifyEmail";

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

const AdminStats = () => <div className="p-6"><h1 className="text-2xl font-bold">Statistiques</h1><p>Admin - Statistiques en construction</p></div>;
const AdminResources = () => <div className="p-6"><h1 className="text-2xl font-bold">Gestion des ressources</h1><p>Admin - Gestion des ressources en construction</p></div>;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <PremiumModalProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
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
          <Route path="/user-dashboard/transactions" element={
            <ProtectedRoute>
              <AppLayout><Transactions /></AppLayout>
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
          <Route path="/user-dashboard/feed-simple" element={
            <ProtectedRoute>
              <AppLayout><FeedSimple /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard/feed-test" element={
            <ProtectedRoute>
              <AppLayout><FeedTest /></AppLayout>
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
          <Route path="/admin-dashboard/stats" element={
            <ProtectedRoute requireAdmin>
              <AppLayout><AdminStats /></AppLayout>
            </ProtectedRoute>
          } />
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
        </BrowserRouter>
        </PremiumModalProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
