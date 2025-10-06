# 🛡️ API Admin - Documentation Complète

## 📋 Vue d'ensemble

Ce module implémente toutes les API admin pour la gestion complète de la plateforme Challenge d'Épargne. Il inclut l'authentification admin, la gestion des utilisateurs, les statistiques, les paramètres système, les comptes bancaires, les notifications et les ressources.

## 🚀 Installation et Utilisation

### Import des Hooks

```typescript
import {
  useAdminAuth,
  useAdminDashboard,
  useAdminUsers,
  useAdminSystemSettings,
  useAdminBankAccounts,
  useAdminNotifications,
  useAdminResources
} from '@/lib/apiComponent/hooks/useAdmin';
```

### Import des Services

```typescript
import { adminService } from '@/lib/apiComponent/services/adminService';
```

## 🔐 Authentification Admin

### Hook useAdminAuth

```typescript
const {
  isLoading,
  error,
  login,
  getProfile,
  changePassword
} = useAdminAuth();

// Connexion admin
const handleLogin = async () => {
  try {
    const response = await login({
      identifier: 'admin@challenge-epargne.com',
      password: 'Admin123!'
    });
    console.log('Connexion réussie:', response);
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
};

// Changer le mot de passe
const handleChangePassword = async () => {
  try {
    await changePassword({
      currentPassword: 'AncienMotDePasse',
      newPassword: 'NouveauMotDePasse123!'
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

## 📊 Dashboard Admin

### Hook useAdminDashboard

```typescript
const {
  isLoading,
  error,
  getDashboardStats,
  getUserStats,
  getAdminStats
} = useAdminDashboard();

// Charger les statistiques du dashboard
useEffect(() => {
  const loadStats = async () => {
    try {
      const [dashboard, users, admins] = await Promise.all([
        getDashboardStats({ period: '30d' }),
        getUserStats(),
        getAdminStats()
      ]);
      
      console.log('Statistiques dashboard:', dashboard);
      console.log('Statistiques utilisateurs:', users);
      console.log('Statistiques admins:', admins);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  loadStats();
}, []);
```

## 👥 Gestion des Utilisateurs

### Hook useAdminUsers

```typescript
const {
  users,
  isLoading,
  error,
  pagination,
  getUsers,
  getPendingUsers,
  updateUser,
  toggleUserActive,
  toggleUserVerified,
  approveUser,
  rejectUser,
  upgradeUserToPremium,
  deleteUser
} = useAdminUsers();

// Charger les utilisateurs avec filtres
const loadUsers = async () => {
  try {
    await getUsers({
      page: 1,
      limit: 10,
      search: 'john',
      isPremium: true,
      approvalStatus: 'PENDING',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Approuver un utilisateur
const handleApprove = async (userId: string) => {
  try {
    await approveUser(userId);
    console.log('Utilisateur approuvé');
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Mettre à niveau vers Premium
const handleUpgrade = async (userId: string) => {
  try {
    await upgradeUserToPremium(userId, {
      plan: 'PREMIUM',
      durationInDays: 30
    });
    console.log('Utilisateur mis à niveau');
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

## ⚙️ Paramètres Système

### Hook useAdminSystemSettings

```typescript
const {
  settings,
  isLoading,
  error,
  getSettings,
  createSetting,
  updateSetting,
  deleteSetting
} = useAdminSystemSettings();

// Créer un paramètre
const handleCreateSetting = async () => {
  try {
    await createSetting({
      key: 'app_name',
      value: 'Challenge d\'Épargne',
      type: 'string',
      description: 'Nom de l\'application',
      category: 'general',
      isPublic: true
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Modifier un paramètre
const handleUpdateSetting = async (key: string) => {
  try {
    await updateSetting(key, {
      value: 'Nouvelle valeur',
      type: 'string'
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

## 🏦 Comptes Bancaires

### Hook useAdminBankAccounts

```typescript
const {
  applications,
  isLoading,
  error,
  getApplications,
  getApplicationStats,
  approveApplication,
  rejectApplication
} = useAdminBankAccounts();

// Charger les demandes
const loadApplications = async () => {
  try {
    await getApplications(1, 20, 'PENDING');
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Approuver une demande
const handleApprove = async (applicationId: string) => {
  try {
    await approveApplication(applicationId);
    console.log('Demande approuvée');
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Rejeter une demande
const handleReject = async (applicationId: string) => {
  try {
    await rejectApplication(applicationId, {
      notes: 'Documents insuffisants'
    });
    console.log('Demande rejetée');
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

## 🔔 Notifications

### Hook useAdminNotifications

```typescript
const {
  notifications,
  isLoading,
  error,
  broadcastNotification,
  getNotifications,
  getNotificationStats
} = useAdminNotifications();

// Diffuser une notification
const handleBroadcast = async () => {
  try {
    await broadcastNotification({
      title: 'Maintenance programmée',
      message: 'La plateforme sera en maintenance demain de 2h à 4h',
      type: 'INFO',
      isUrgent: false
    });
    console.log('Notification diffusée');
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Charger les notifications
const loadNotifications = async () => {
  try {
    await getNotifications(1, 50, 'INFO', 'SENT');
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

## 📚 Ressources

### Hook useAdminResources

```typescript
const {
  resources,
  isLoading,
  error,
  createResource,
  getResources,
  updateResource,
  deleteResource
} = useAdminResources();

// Créer une ressource
const handleCreateResource = async () => {
  try {
    await createResource({
      title: 'Guide d\'épargne',
      description: 'Guide complet pour bien épargner',
      type: 'DOCUMENT',
      category: 'education',
      isPremium: true,
      url: 'https://example.com/guide.pdf',
      tags: ['épargne', 'guide', 'éducation']
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Modifier une ressource
const handleUpdateResource = async (resourceId: string) => {
  try {
    await updateResource(resourceId, {
      title: 'Nouveau titre',
      isPremium: false
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

## 🎯 Exemples d'Intégration

### Composant Dashboard Admin

```typescript
import { useAdminDashboard } from '@/lib/apiComponent/hooks/useAdmin';

const AdminDashboard = () => {
  const { getDashboardStats, isLoading, error } = useAdminDashboard();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats({ period: '30d' });
        setStats(data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    loadStats();
  }, []);

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h1>Dashboard Admin</h1>
      {stats && (
        <div>
          <p>Utilisateurs totaux: {stats.totalUsers}</p>
          <p>Utilisateurs premium: {stats.premiumUsers}</p>
          <p>Revenus totaux: {stats.totalRevenue} FCFA</p>
        </div>
      )}
    </div>
  );
};
```

### Composant Gestion Utilisateurs

```typescript
import { useAdminUsers } from '@/lib/apiComponent/hooks/useAdmin';

const UserManagement = () => {
  const {
    users,
    isLoading,
    getUsers,
    approveUser,
    rejectUser
  } = useAdminUsers();

  useEffect(() => {
    getUsers({ page: 1, limit: 10 });
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await approveUser(userId);
      // Rafraîchir la liste
      getUsers({ page: 1, limit: 10 });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <h1>Gestion des Utilisateurs</h1>
      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <div>
          {users.map(user => (
            <div key={user.id}>
              <span>{user.name}</span>
              <button onClick={() => handleApprove(user.id)}>
                Approuver
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 🔧 Configuration

### Variables d'Environnement

Assurez-vous que les variables d'environnement suivantes sont configurées :

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ADMIN_API_BASE_URL=http://localhost:3000/api/admin
```

### Authentification

Les API admin nécessitent une authentification via JWT. Le token est automatiquement inclus dans les requêtes via le système d'authentification existant.

## 📝 Types TypeScript

Tous les types sont exportés depuis `@/types/admin` :

```typescript
import type {
  AdminUser,
  UserResponse,
  DashboardStats,
  SystemSetting,
  // ... autres types
} from '@/types/admin';
```

## 🚨 Gestion d'Erreurs

Tous les hooks incluent une gestion d'erreurs robuste :

```typescript
const { error, isLoading } = useAdminUsers();

if (error) {
  console.error('Erreur:', error);
  // Afficher un message d'erreur à l'utilisateur
}

if (isLoading) {
  // Afficher un indicateur de chargement
}
```

## 🔄 Pagination

Les hooks qui gèrent des listes incluent la pagination :

```typescript
const { pagination } = useAdminUsers();

console.log('Page actuelle:', pagination.page);
console.log('Total de pages:', pagination.totalPages);
console.log('Total d\'éléments:', pagination.total);
console.log('Page suivante disponible:', pagination.hasNext);
console.log('Page précédente disponible:', pagination.hasPrev);
```

## 🎨 Interface Utilisateur

Les composants d'exemple incluent :
- `AdminDashboardExample.tsx` - Dashboard avec statistiques en temps réel
- `UserManagementExample.tsx` - Gestion complète des utilisateurs

Ces composants peuvent être utilisés comme base pour créer vos propres interfaces admin.

## 📚 Endpoints Disponibles

Tous les endpoints sont définis dans `endpoints.ts` :

- **Authentification** : `/admin/auth/login`, `/admin/profile`, `/admin/change-password`
- **Dashboard** : `/admin/dashboard`, `/admin/stats/users`, `/admin/stats/admins`
- **Utilisateurs** : `/admin/users`, `/admin/users/pending`, `/admin/users/:id/*`
- **Paramètres** : `/admin/settings`, `/admin/settings/by-category`
- **Comptes bancaires** : `/admin/bank-accounts`, `/admin/bank-accounts/stats`
- **Notifications** : `/admin/notifications/broadcast`, `/admin/notifications`
- **Ressources** : `/admin/resources`, `/admin/resources/stats`

## 🚀 Prochaines Étapes

1. Intégrer les hooks dans vos composants admin existants
2. Personnaliser les interfaces selon vos besoins
3. Ajouter des fonctionnalités supplémentaires si nécessaire
4. Tester toutes les fonctionnalités avec des données réelles

---

**Note** : Cette implémentation est complète et prête à l'emploi. Tous les endpoints du backend admin sont couverts et les hooks React facilitent l'intégration dans vos composants.
