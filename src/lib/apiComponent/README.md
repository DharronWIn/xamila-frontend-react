# API Component - Challenge Épargne

Ce module contient tous les composants nécessaires pour interagir avec l'API backend de Challenge Épargne.

## 📁 Structure

```
src/lib/apiComponent/
├── apiClient.ts          # Client API principal avec gestion JWT
├── endpoints.ts          # Toutes les routes API organisées par module
├── types.ts             # Types TypeScript correspondant aux DTOs backend
├── useApi.ts            # Hooks génériques pour les appels API
├── hooks/               # Hooks spécialisés par module
│   ├── useAuth.ts       # Authentification et gestion utilisateur
│   ├── useChallenges.ts # Gestion des challenges d'épargne
│   ├── useFinancial.ts  # Transactions financières
│   ├── useSocial.ts     # Posts et commentaires sociaux
│   ├── useNotifications.ts # Notifications
│   ├── useResources.ts  # Ressources et documents
│   ├── useSavings.ts    # Objectifs d'épargne
│   └── index.ts         # Export de tous les hooks
└── README.md           # Cette documentation
```

## 🚀 Utilisation

### 1. Configuration

L'API est configurée pour pointer vers votre backend NestJS. Assurez-vous que votre backend fonctionne sur `http://localhost:3000/api`.

### 2. Hooks d'Authentification

```typescript
import { useAuth } from '@/lib/apiComponent/hooks';

function LoginComponent() {
  const { login, register, user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // L'utilisateur est maintenant connecté
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  if (isLoading) return <div>Chargement...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Bonjour {user?.firstName}!</p>
      ) : (
        <button onClick={handleLogin}>Se connecter</button>
      )}
    </div>
  );
}
```

### 3. Hooks de Challenges

```typescript
import { useChallenges, useChallengeParticipants } from '@/lib/apiComponent/hooks';

function ChallengesPage() {
  const { 
    challenges, 
    isLoading, 
    getChallenges, 
    createChallenge 
  } = useChallenges();

  const { 
    joinChallenge, 
    leaveChallenge 
  } = useChallengeParticipants(challengeId);

  useEffect(() => {
    getChallenges();
  }, []);

  return (
    <div>
      {challenges.map(challenge => (
        <div key={challenge.id}>
          <h3>{challenge.title}</h3>
          <p>{challenge.description}</p>
          <button onClick={() => joinChallenge({ goalAmount: 1000 })}>
            Rejoindre
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 4. Hooks Financiers

```typescript
import { useTransactions, useTransactionStats } from '@/lib/apiComponent/hooks';

function FinancialDashboard() {
  const { 
    transactions, 
    createTransaction, 
    getTransactions 
  } = useTransactions();

  const { 
    stats, 
    chartData, 
    getStats 
  } = useTransactionStats();

  const addTransaction = async (data) => {
    await createTransaction({
      amount: data.amount,
      type: 'INCOME',
      category: 'Salaire',
      description: 'Salaire mensuel'
    });
  };

  return (
    <div>
      <h2>Mes Transactions</h2>
      {transactions.map(transaction => (
        <div key={transaction.id}>
          {transaction.amount} - {transaction.category}
        </div>
      ))}
    </div>
  );
}
```

### 5. Hooks Sociaux

```typescript
import { usePosts, useComments } from '@/lib/apiComponent/hooks';

function SocialFeed() {
  const { 
    posts, 
    getPosts, 
    createPost, 
    likePost 
  } = usePosts();

  const { 
    comments, 
    createComment 
  } = useComments(postId);

  const createNewPost = async (content) => {
    await createPost({
      content,
      type: 'MOTIVATION',
      isPublic: true
    });
  };

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <p>{post.content}</p>
          <button onClick={() => likePost(post.id)}>
            Like ({post.likesCount})
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 6. Hooks de Notifications

```typescript
import { useNotifications } from '@/lib/apiComponent/hooks';

function NotificationCenter() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  return (
    <div>
      <h2>Notifications ({unreadCount} non lues)</h2>
      {notifications.map(notification => (
        <div 
          key={notification.id}
          onClick={() => markAsRead(notification.id)}
          style={{ 
            fontWeight: notification.isRead ? 'normal' : 'bold' 
          }}
        >
          {notification.title}
        </div>
      ))}
      <button onClick={markAllAsRead}>
        Tout marquer comme lu
      </button>
    </div>
  );
}
```

## 🔧 Configuration Avancée

### Variables d'Environnement

Vous pouvez configurer l'URL de l'API via les variables d'environnement :

```env
VITE_APP_ENV=development
```

### Gestion des Erreurs

Tous les hooks gèrent automatiquement les erreurs et les affichent dans la propriété `error` :

```typescript
const { data, error, isLoading } = useChallenges();

if (error) {
  return <div>Erreur: {error.message}</div>;
}
```

### Routes Publiques

Certaines routes sont publiques et ne nécessitent pas d'authentification :

```typescript
const { data } = useGet('/public/endpoint', { isPublicRoute: true });
```

## 📚 Types TypeScript

Tous les types sont exportés depuis `types.ts` :

```typescript
import { 
  User, 
  Challenge, 
  Transaction, 
  Post, 
  Notification 
} from '@/lib/apiComponent/types';
```

## 🔄 Gestion des Tokens

L'apiClient gère automatiquement :
- Stockage des tokens JWT
- Rafraîchissement automatique des tokens expirés
- Redirection vers la page de connexion si nécessaire
- Nettoyage des tokens lors de la déconnexion

## 🎯 Exemples d'Intégration

### Page de Connexion

```typescript
import { useAuth } from '@/lib/apiComponent/hooks';

function LoginPage() {
  const { login, isLoading, error } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await login({
        login: formData.get('email'),
        password: formData.get('password')
      });
      // Redirection automatique après connexion
    } catch (err) {
      console.error('Erreur de connexion:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>
      {error && <p style={{color: 'red'}}>{error.message}</p>}
    </form>
  );
}
```

### Dashboard Principal

```typescript
import { 
  useAuth, 
  useChallenges, 
  useTransactionStats,
  useNotifications 
} from '@/lib/apiComponent/hooks';

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { challenges, getChallenges } = useChallenges();
  const { stats } = useTransactionStats();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    if (isAuthenticated) {
      getChallenges();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div>Veuillez vous connecter</div>;
  }

  return (
    <div>
      <h1>Bonjour {user?.firstName}!</h1>
      <p>Notifications: {unreadCount}</p>
      
      <h2>Mes Challenges</h2>
      {challenges.map(challenge => (
        <div key={challenge.id}>
          {challenge.title}
        </div>
      ))}
      
      <h2>Statistiques</h2>
      <p>Revenus: {stats?.totalIncome}</p>
      <p>Dépenses: {stats?.totalExpenses}</p>
    </div>
  );
}
```

## 🛠️ Développement

### Ajout de Nouveaux Hooks

1. Créez un nouveau fichier dans `hooks/`
2. Suivez le pattern des hooks existants
3. Exportez depuis `hooks/index.ts`

### Ajout de Nouveaux Endpoints

1. Ajoutez l'endpoint dans `endpoints.ts`
2. Ajoutez les types correspondants dans `types.ts`
3. Créez les hooks appropriés

## 📝 Notes

- Tous les hooks gèrent automatiquement l'état de chargement
- Les erreurs sont capturées et exposées via la propriété `error`
- Les données sont mises en cache localement pour de meilleures performances
- L'authentification est gérée automatiquement par l'apiClient
