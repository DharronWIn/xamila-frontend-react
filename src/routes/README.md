# Système de Routing - Guide d'utilisation

## Vue d'ensemble

Ce projet utilise React Router DOM v6 avec une architecture modulaire et des layouts conditionnels.

## Structure des fichiers

```
src/routes/
├── AppRoutes.tsx          # Configuration principale des routes
├── RouteConfig.tsx        # Configuration déclarative des routes
└── README.md             # Ce fichier

src/hooks/
└── useAppNavigation.ts   # Hook personnalisé pour la navigation

src/components/layout/
└── ConditionalLayout.tsx # Layout conditionnel selon la route
```

## Utilisation

### 1. Navigation dans les composants

```tsx
import { useAppNavigation } from "@/hooks/useAppNavigation";

function MyComponent() {
  const { 
    goToUserDashboard, 
    goToAdminDashboard, 
    isUserRoute,
    navigate 
  } = useAppNavigation();

  return (
    <div>
      <button onClick={goToUserDashboard}>
        Aller au dashboard utilisateur
      </button>
      
      <button onClick={() => navigate("/user-dashboard/profile")}>
        Aller au profil
      </button>
      
      {isUserRoute() && <p>Vous êtes dans une section utilisateur</p>}
    </div>
  );
}
```

### 2. Layout conditionnel

```tsx
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

function App() {
  return (
    <ConditionalLayout
      publicLayout={<PublicLayout />}
      userLayout={<UserLayout />}
      adminLayout={<AdminLayout />}
    >
      <Routes>
        {/* Vos routes ici */}
      </Routes>
    </ConditionalLayout>
  );
}
```

### 3. Configuration déclarative des routes

```tsx
import { RouteConfig, generateRoutes } from "@/routes/RouteConfig";

const myRoutes: RouteConfig[] = [
  {
    path: "/my-page",
    element: <MyPage />,
    requireAuth: true,
    useLayout: true
  }
];

const routes = generateRoutes(myRoutes);
```

## Types de routes

### Routes publiques
- Accessibles sans authentification
- Pas de layout par défaut
- Exemples: `/`, `/verify-email/:token`

### Routes utilisateur
- Requièrent une authentification
- Utilisent `AppLayout`
- Préfixe: `/user-dashboard`
- Exemples: `/user-dashboard/profile`, `/user-dashboard/settings`

### Routes admin
- Requièrent une authentification admin
- Utilisent `AppLayout`
- Préfixe: `/admin-dashboard`
- Exemples: `/admin-dashboard/users`, `/admin-dashboard/stats`

## Protection des routes

```tsx
// Route protégée simple
<Route path="/protected" element={
  <ProtectedRoute>
    <MyComponent />
  </ProtectedRoute>
} />

// Route protégée admin
<Route path="/admin" element={
  <ProtectedRoute requireAdmin>
    <AdminComponent />
  </ProtectedRoute>
} />
```

## Navigation programmatique

```tsx
import { useNavigate, useParams } from "react-router-dom";

function MyComponent() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const handleClick = () => {
    navigate(`/admin-dashboard/users/${userId}`);
  };

  return <button onClick={handleClick}>Voir l'utilisateur</button>;
}
```

## Bonnes pratiques

1. **Utilisez le hook `useAppNavigation`** pour la navigation courante
2. **Groupez les routes** par type (public, user, admin)
3. **Utilisez des layouts conditionnels** pour éviter la duplication
4. **Protégez vos routes** avec `ProtectedRoute`
5. **Organisez vos routes** dans des fichiers séparés pour la maintenabilité

## Migration depuis l'ancienne structure

Si vous migrez depuis l'ancienne structure, voici les étapes :

1. Remplacez les imports directs par `AppRoutes`
2. Utilisez `useAppNavigation` au lieu de `useNavigate` directement
3. Migrez vers des routes imbriquées pour réduire la duplication
4. Utilisez `ConditionalLayout` pour les layouts complexes
