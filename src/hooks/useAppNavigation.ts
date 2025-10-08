import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useCallback } from "react";

/**
 * Hook personnalisé pour la navigation dans l'application
 * Centralise la logique de navigation et fournit des méthodes utilitaires
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Navigation vers les pages utilisateur
  const goToUserDashboard = useCallback(() => {
    navigate("/user-dashboard");
  }, [navigate]);

  const goToUserProfile = useCallback(() => {
    navigate("/user-dashboard/profile");
  }, [navigate]);

  const goToUserSettings = useCallback(() => {
    navigate("/user-dashboard/settings");
  }, [navigate]);

  const goToUserTransactions = useCallback(() => {
    navigate("/user-dashboard/transactions");
  }, [navigate]);

  const goToUserSavings = useCallback(() => {
    navigate("/user-dashboard/savings");
  }, [navigate]);

  const goToUserChallenges = useCallback(() => {
    navigate("/user-dashboard/challenges");
  }, [navigate]);

  // Navigation vers les pages admin
  const goToAdminDashboard = useCallback(() => {
    navigate("/admin-dashboard");
  }, [navigate]);

  const goToUserManagement = useCallback(() => {
    navigate("/admin-dashboard/users");
  }, [navigate]);

  const goToUserDetail = useCallback((userId: string) => {
    navigate(`/admin-dashboard/users/${userId}`);
  }, [navigate]);

  const goToChallengeDetail = useCallback((challengeId: string) => {
    navigate(`/admin-dashboard/challenges/${challengeId}`);
  }, [navigate]);

  // Navigation générale
  const goToHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goForward = useCallback(() => {
    navigate(1);
  }, [navigate]);

  // Vérifications de route
  const isUserRoute = useCallback(() => {
    return location.pathname.startsWith("/user-dashboard");
  }, [location.pathname]);

  const isAdminRoute = useCallback(() => {
    return location.pathname.startsWith("/admin-dashboard");
  }, [location.pathname]);

  const isPublicRoute = useCallback(() => {
    return !isUserRoute() && !isAdminRoute();
  }, [isUserRoute, isAdminRoute]);

  // Navigation conditionnelle basée sur le rôle
  const navigateBasedOnRole = useCallback((userRole: 'user' | 'admin' | 'public') => {
    switch (userRole) {
      case 'admin':
        goToAdminDashboard();
        break;
      case 'user':
        goToUserDashboard();
        break;
      default:
        goToHome();
    }
  }, [goToAdminDashboard, goToUserDashboard, goToHome]);

  return {
    // Navigation
    navigate,
    goToHome,
    goBack,
    goForward,
    
    // Navigation utilisateur
    goToUserDashboard,
    goToUserProfile,
    goToUserSettings,
    goToUserTransactions,
    goToUserSavings,
    goToUserChallenges,
    
    // Navigation admin
    goToAdminDashboard,
    goToUserManagement,
    goToUserDetail,
    goToChallengeDetail,
    
    // Navigation conditionnelle
    navigateBasedOnRole,
    
    // Informations de route
    location,
    params,
    isUserRoute,
    isAdminRoute,
    isPublicRoute,
  };
};
