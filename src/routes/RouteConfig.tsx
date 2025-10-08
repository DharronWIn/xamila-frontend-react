import { ReactElement } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Types pour la configuration des routes
export interface RouteConfig {
  path: string;
  element: ReactElement;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  useLayout?: boolean;
  children?: RouteConfig[];
}

// Configuration des routes publiques
export const publicRoutes: RouteConfig[] = [
  {
    path: "/",
    element: <div>Home Page</div>, // Remplacez par votre composant Index
    useLayout: false
  },
  {
    path: "/verify-email/:token",
    element: <div>Verify Email</div>, // Remplacez par votre composant VerifyEmail
    useLayout: false
  }
];

// Configuration des routes utilisateur
export const userRoutes: RouteConfig[] = [
  {
    path: "/user-dashboard",
    element: <div>User Dashboard</div>, // Remplacez par votre composant UserDashboard
    requireAuth: true,
    useLayout: true,
    children: [
      {
        path: "overview",
        element: <div>Dashboard Overview</div>,
        requireAuth: true,
        useLayout: true
      },
      {
        path: "profile",
        element: <div>User Profile</div>,
        requireAuth: true,
        useLayout: true
      },
      {
        path: "settings",
        element: <div>User Settings</div>,
        requireAuth: true,
        useLayout: true
      }
    ]
  }
];

// Configuration des routes admin
export const adminRoutes: RouteConfig[] = [
  {
    path: "/admin-dashboard",
    element: <div>Admin Dashboard</div>, // Remplacez par votre composant AdminDashboard
    requireAuth: true,
    requireAdmin: true,
    useLayout: true,
    children: [
      {
        path: "users",
        element: <div>User Management</div>,
        requireAuth: true,
        requireAdmin: true,
        useLayout: true
      },
      {
        path: "users/:userId",
        element: <div>User Detail</div>,
        requireAuth: true,
        requireAdmin: true,
        useLayout: true
      }
    ]
  }
];

// Fonction utilitaire pour créer un élément de route avec protection
export const createRouteElement = (config: RouteConfig): ReactElement => {
  let element = config.element;

  // Ajouter la protection admin si nécessaire
  if (config.requireAdmin) {
    element = <ProtectedRoute requireAdmin>{element}</ProtectedRoute>;
  } else if (config.requireAuth) {
    element = <ProtectedRoute>{element}</ProtectedRoute>;
  }

  // Ajouter le layout si nécessaire
  if (config.useLayout) {
    element = <AppLayout>{element}</AppLayout>;
  }

  return element;
};

// Fonction pour générer toutes les routes
export const generateRoutes = (routes: RouteConfig[]): RouteConfig[] => {
  return routes.map(route => ({
    ...route,
    element: createRouteElement(route),
    children: route.children ? generateRoutes(route.children) : undefined
  }));
};
