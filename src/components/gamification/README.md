# 🎮 Guide d'Utilisation de la Gamification

Ce guide explique comment utiliser les composants de gamification dans l'application Xamila.

## 📋 Composants Disponibles

### 1. UserBadge
Affiche le badge de niveau d'un utilisateur avec son rang et son niveau.

```tsx
import { UserBadge } from '@/components/gamification';

<UserBadge 
  userLevel={{
    level: 15,
    totalXP: 1850,
    rank: 'APPRENTICE',
    totalTrophies: 8,
    totalBadges: 3
  }}
  size="md"
  showLevel={true}
  showRank={true}
  onPress={() => console.log('Badge cliqué')}
/>
```

### 2. Modales de Récompenses

#### TrophyUnlockedModal
Affiche les trophées débloqués.

```tsx
import { TrophyUnlockedModal } from '@/components/gamification';

<TrophyUnlockedModal
  isOpen={showTrophyModal}
  onClose={() => setShowTrophyModal(false)}
  trophies={newTrophies}
/>
```

#### BadgeUnlockedModal
Affiche les badges obtenus.

```tsx
import { BadgeUnlockedModal } from '@/components/gamification';

<BadgeUnlockedModal
  isOpen={showBadgeModal}
  onClose={() => setShowBadgeModal(false)}
  badges={newBadges}
/>
```

#### LevelUpModal
Affiche la montée de niveau.

```tsx
import { LevelUpModal } from '@/components/gamification';

<LevelUpModal
  isOpen={showLevelUpModal}
  onClose={() => setShowLevelUpModal(false)}
  levelUp={{
    oldLevel: 14,
    newLevel: 15,
    xpGained: 100
  }}
/>
```

### 3. Dashboard de Gamification

```tsx
import { GamificationDashboard } from '@/components/gamification';

<GamificationDashboard />
```

### 4. Classement avec Gamification

```tsx
import { LeaderboardWithGamification } from '@/components/gamification';

<LeaderboardWithGamification
  leaderboard={leaderboardData}
  currentUserRank={5}
  challengeId="ch_123"
  title="Classement du Challenge"
  showProgress={true}
/>
```

### 5. Profil Public avec Gamification

```tsx
import { PublicProfileWithGamification } from '@/components/gamification';

<PublicProfileWithGamification
  profile={profileData}
  onFollow={() => console.log('Suivre')}
  onMessage={() => console.log('Message')}
  isFollowing={false}
/>
```

## 🔧 Hooks Disponibles

### useGamificationRewards
Hook principal pour gérer les récompenses.

```tsx
import { useGamificationRewards } from '@/hooks/useGamificationRewards';

const {
  checkAfterTransaction,
  checkAfterSavings,
  checkAfterChallengeCompleted,
  checkAfterDefiCompleted,
  checkAfterDefiCreated,
  checkAfterPostCreated,
  checkAfterLikeReceived,
  checkAfterCommentPosted,
  showTrophyModal,
  showBadgeModal,
  showLevelUpModal,
  newTrophies,
  newBadges,
  levelUp,
  isChecking
} = useGamificationRewards();
```

### useGamification
Hook pour les appels API de gamification.

```tsx
import { useGamification } from '@/lib/apiComponent/hooks/useGamification';

const {
  getDashboard,
  checkRewards,
  getTrophies,
  getMyTrophies,
  getBadges,
  getMyBadges,
  getLevel,
  getStats,
  loading,
  error
} = useGamification();
```

## 🎯 Intégration dans les Actions

### 1. Après une Transaction
```tsx
const { checkAfterTransaction } = useGamificationRewards();

const handleTransaction = async () => {
  // ... logique de transaction
  await checkAfterTransaction(); // Vérifie les récompenses
};
```

### 2. Après la Création d'un Post
```tsx
const { checkAfterPostCreated } = useGamificationRewards();

const handleCreatePost = async () => {
  // ... logique de création de post
  await checkAfterPostCreated(); // Vérifie les récompenses
};
```

### 3. Après avoir Reçu un Like
```tsx
const { checkAfterLikeReceived } = useGamificationRewards();

const handleLike = async () => {
  // ... logique de like
  await checkAfterLikeReceived(); // Vérifie les récompenses
};
```

## 📊 Types Principaux

### UserLevelInfo
```tsx
interface UserLevelInfo {
  level: number;
  totalXP: number;
  rank: UserRank;
  totalTrophies: number;
  totalBadges: number;
}
```

### SocialPost
```tsx
interface SocialPost {
  id: string;
  title: string;
  content: string;
  type: 'SAVINGS_MILESTONE' | 'MOTIVATION' | 'TIP' | 'QUESTION' | 'CELEBRATION';
  amount?: number;
  images: string[];
  likes: number;
  shares: number;
  commentsCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    pictureProfilUrl: string;
    userLevel: UserLevelInfo;
  };
  isLikedByCurrentUser: boolean;
}
```

### LeaderboardEntry
```tsx
interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  currentAmount: number;
  targetAmount: number;
  progressPercentage: number;
  consistency: number;
  joinedAt: string;
  lastTransactionAt: string;
  transactionCount: number;
  level: number;
  totalXP: number;
  userRank: UserRank;
}
```

## 🎨 Personnalisation

### Couleurs des Rangs
```tsx
import { RANK_COLORS } from '@/types/gamification';

const rankColor = RANK_COLORS['APPRENTICE']; // '#94A3B8'
```

### Icônes des Rangs
```tsx
import { RANK_EMOJIS } from '@/types/gamification';

const rankIcon = RANK_EMOJIS['APPRENTICE']; // '🥈'
```

### Couleurs des Raretés
```tsx
import { RARITY_COLORS } from '@/types/gamification';

const rarityColor = RARITY_COLORS['RARE']; // '#3B82F6'
```

## 🚀 Exemples d'Intégration

### 1. Dans un Feed Social
```tsx
import { PostCardWithGamification } from '@/components/social/PostCardWithGamification';

<PostCardWithGamification
  post={post}
  onCommentClick={() => setShowComments(true)}
/>
```

### 2. Dans un Classement
```tsx
import { LeaderboardWithGamification } from '@/components/gamification';

<LeaderboardWithGamification
  leaderboard={challengeLeaderboard.leaderboard}
  currentUserRank={challengeLeaderboard.currentUserRank}
  challengeId={challengeId}
  title="Classement du Challenge"
/>
```

### 3. Dans un Profil
```tsx
import { PublicProfileWithGamification } from '@/components/gamification';

<PublicProfileWithGamification
  profile={userProfile}
  onFollow={handleFollow}
  onMessage={handleMessage}
  isFollowing={isFollowing}
/>
```

## 🔄 Flow d'Utilisation

1. **Au lancement de l'app** : Charger le dashboard de gamification
2. **Après chaque action importante** : Appeler la fonction de vérification appropriée
3. **Afficher les récompenses** : Les modales s'affichent automatiquement
4. **Mettre à jour l'UI** : Les composants se mettent à jour avec les nouvelles données

## 📱 Responsive Design

Tous les composants sont responsives et s'adaptent aux différentes tailles d'écran :
- `sm` : Mobile
- `md` : Tablette
- `lg` : Desktop

## 🎯 Bonnes Pratiques

1. **Toujours vérifier les récompenses** après les actions importantes
2. **Utiliser les hooks appropriés** pour chaque type d'action
3. **Gérer les états de chargement** pour une meilleure UX
4. **Personnaliser les couleurs** selon le design system
5. **Tester les modales** sur différents appareils

## 🐛 Dépannage

### Les récompenses ne s'affichent pas
- Vérifiez que l'API retourne les bonnes données
- Assurez-vous d'appeler la fonction de vérification appropriée
- Vérifiez les logs de la console

### Les badges ne s'affichent pas correctement
- Vérifiez que les données `userLevel` sont complètes
- Assurez-vous que les types correspondent aux interfaces

### Erreurs de TypeScript
- Vérifiez que vous importez les bons types
- Assurez-vous que les interfaces correspondent aux données API
