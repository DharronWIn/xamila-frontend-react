import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "./AppLayout";

interface ConditionalLayoutProps {
  children: ReactNode;
  publicLayout?: ReactNode;
  userLayout?: ReactNode;
  adminLayout?: ReactNode;
}

/**
 * Composant qui applique automatiquement le bon layout selon la route
 */
export const ConditionalLayout = ({ 
  children, 
  publicLayout,
  userLayout,
  adminLayout 
}: ConditionalLayoutProps) => {
  const location = useLocation();

  // Détermine le type de route
  const isUserRoute = location.pathname.startsWith("/user-dashboard");
  const isAdminRoute = location.pathname.startsWith("/admin-dashboard");
  const isPublicRoute = !isUserRoute && !isAdminRoute;

  // Applique le layout approprié
  if (isAdminRoute && adminLayout) {
    return <>{adminLayout}</>;
  }

  if (isUserRoute && userLayout) {
    return <>{userLayout}</>;
  }

  if (isPublicRoute && publicLayout) {
    return <>{publicLayout}</>;
  }

  // Layout par défaut (AppLayout pour les routes protégées)
  if (isUserRoute || isAdminRoute) {
    return <AppLayout>{children}</AppLayout>;
  }

  // Pas de layout pour les routes publiques par défaut
  return <>{children}</>;
};

/**
 * Hook pour déterminer le type de layout nécessaire
 */
export const useLayoutType = () => {
  const location = useLocation();

  if (location.pathname.startsWith("/admin-dashboard")) {
    return "admin";
  }

  if (location.pathname.startsWith("/user-dashboard")) {
    return "user";
  }

  return "public";
};
