# 🎮 Gamification Xamila - Documentation Complète

## ✅ Statut : PRODUCTION READY

---

## 🚀 Démarrage Rapide

### Installation
```bash
# Toutes les dépendances sont déjà installées
npm install
```

### Lancer l'App
```bash
npm run dev
```

### Tester la Gamification
```
http://localhost:5173/gamification/test
```

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Composants](#composants)
3. [Hooks](#hooks)
4. [Pages](#pages)
5. [Types](#types)
6. [Helpers](#helpers)
7. [Exemples](#exemples)
8. [Tests](#tests)

---

## 🎯 Vue d'Ensemble

### Qu'est-ce que la Gamification ?

Le système de gamification de Xamila permet de :
- 🏆 Gagner de l'XP et monter de niveau
- 🎖️ Débloquer des trophées et badges
- 📊 Voir sa progression et son rang
- 👥 Comparer ses performances avec les autres
- 🎉 Recevoir des récompenses pour ses actions

### Où Apparaît la Gamification ?

#### Feed Social
- Badge de niveau/rang sur chaque post
- Avatar cliquable → Profil public
- Récompenses sur like

#### Classements
- Badge sur chaque participant
- Avatar cliquable → Profil public
- Affichage du rang

#### Profils
- Profil public enrichi
- Trophées et badges
- Statistiques complètes

---

## 🧩 Composants

### UserAvatar (Cliquable)

**Fichier :** `src/components/ui/UserAvatar.tsx`

**Description :** Avatar utilisateur cliquable qui navigue vers le profil public.

**Props :**
```typescript
interface UserAvatarProps {
  user?: { 
    pictureProfilUrl?: string; 
    name?: string;
    id?: string;
  } | null;
  src?: string;           // URL directe
  alt?: string;           // Nom
  userId?: string;        // ID pour navigation
  size?: 'sm' | 'md' | 'lg' | 'xl';
  clickable?: boolean;    // Active la navigation
  onClick?: () => void;   // Action custom
}
```

**Exemples :**
```typescript
// Cliquable avec navigation automatique
<UserAvatar 
  src={user.pictureProfilUrl}
  userId={user.id}
  clickable
  size="md"
/>

// Simple
<UserAvatar 
  user={user}
  size="sm"
/>
```

---

### UserBadge (Cliquable)

**Fichier :** `src/components/gamification/UserBadge.tsx`

**Description :** Badge affichant le niveau et le rang de l'utilisateur.

**Props :**
```typescript
interface UserBadgeProps {
  userLevel: {
    level: number;
    totalXP: number;
    rank: UserRank;
    totalTrophies: number;
    totalBadges: number;
  };
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
  showRank?: boolean;
  onPress?: () => void;
}
```

**Exemples :**
```typescript
// Badge complet avec navigation
<UserBadge 
  userLevel={user.userLevel}
  userId={user.id}
  size="md"
/>

// Badge compact (rang uniquement)
<UserBadge 
  userLevel={user.userLevel}
  userId={user.id}
  size="sm"
  showLevel={false}
/>
```

**Rendu :**
- Taille `sm` : `🥈 APPRENTICE`
- Taille `md` : `🥈 Niveau 15 • APPRENTICE`
- Taille `lg` : `🥈 Niveau 15 • APPRENTICE` (plus grand)

---

### Modales de Récompenses

**Fichier :** `src/components/gamification/RewardModals.tsx`

#### TrophyUnlockedModal
Affiche les trophées débloqués.

```typescript
<TrophyUnlockedModal
  isOpen={showTrophyModal}
  onClose={() => setShowTrophyModal(false)}
  trophies={newTrophies}
/>
```

#### BadgeUnlockedModal
Affiche les badges obtenus.

```typescript
<BadgeUnlockedModal
  isOpen={showBadgeModal}
  onClose={() => setShowBadgeModal(false)}
  badges={newBadges}
/>
```

#### LevelUpModal
Affiche la montée de niveau.

```typescript
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

---

### GamificationDashboard

**Fichier :** `src/components/gamification/GamificationDashboard.tsx`

**Description :** Dashboard complet de gamification.

**Affichage :**
- Progression XP avec barre
- Trophées récents
- Trophées en cours
- Statistiques rapides

**Utilisation :**
```typescript
<GamificationDashboard />
```

---

## 🪝 Hooks

### useGamificationRewards

**Fichier :** `src/hooks/useGamificationRewards.ts`

**Description :** Hook principal pour gérer les récompenses.

**Retour :**
```typescript
const {
  // Modales
  showTrophyModal,
  showBadgeModal,
  showLevelUpModal,
  showXPToast,
  
  // Données
  newTrophies,
  newBadges,
  levelUp,
  xpGained,
  
  // Fonctions de vérification
  checkAfterTransaction,
  checkAfterSavings,
  checkAfterChallengeCompleted,
  checkAfterDefiCompleted,
  checkAfterPostCreated,
  checkAfterLikeReceived,
  checkAfterCommentPosted,
  
  // Fermeture modales
  closeTrophyModal,
  closeBadgeModal,
  closeLevelUpModal,
} = useGamificationRewards();
```

**Utilisation :**
```typescript
// Après une action importante
const handleTransaction = async () => {
  // ... logique transaction
  await checkAfterTransaction(); // Vérifie et affiche les récompenses
};
```

---

### usePublicProfile

**Fichier :** `src/hooks/usePublicProfile.ts`

**Description :** Hook pour charger les profils publics.

**Retour :**
```typescript
const {
  profile,
  loading,
  error,
  loadProfile,
  isOwnProfile,
  currentUserId,
} = usePublicProfile();
```

**Utilisation :**
```typescript
const { profile, loading, loadProfile } = usePublicProfile();

useEffect(() => {
  if (userId) {
    loadProfile(userId);
  }
}, [userId]);
```

---

### useGamification

**Fichier :** `src/lib/apiComponent/hooks/useGamification.ts`

**Description :** Hook pour les appels API de gamification.

**Retour :**
```typescript
const {
  getDashboard,
  checkRewards,
  getTrophies,
  getMyTrophies,
  getBadges,
  getMyBadges,
  getLevel,
  getStats,
  getXPHistory,
  loading,
  error,
} = useGamification();
```

---

## 📄 Pages

### PublicProfilePage

**Route :** `/user-dashboard/profile/:userId`

**Description :** Affiche le profil public d'un utilisateur.

**Fonctionnalités :**
- Email et téléphone masqués
- Trophées récents
- Badges obtenus
- Statistiques d'activité
- Redirection si c'est son propre profil

---

### GamificationTestPage

**Route :** `/gamification/test`

**Description :** Page de test pour la gamification.

**Fonctionnalités :**
- Boutons pour simuler toutes les actions
- Dashboard intégré
- Modales de test
- Vérification des récompenses

---

## 📊 Types

### UserLevelInfo
```typescript
interface UserLevelInfo {
  level: number;
  totalXP: number;
  rank: UserRank;
  totalTrophies: number;
  totalBadges: number;
}
```

### SocialPost (avec gamification)
```typescript
interface SocialPost {
  id: string;
  title: string;
  content: string;
  user: {
    id: string;
    name: string;
    pictureProfilUrl: string;
    userLevel: UserLevelInfo;  // ✅ NOUVEAU
  };
}
```

### PublicProfile
```typescript
interface PublicProfile {
  id: string;
  name: string;
  email: string;          // Masqué : "al***@gmail.com"
  phone: string;          // Masqué : "06***89"
  gamification: {
    level: number;
    totalXP: number;
    rank: UserRank;
    recentTrophies: UserTrophy[];
    badges: UserBadge[];
  };
  stats: {
    challengesParticipated: number;
    defisParticipated: number;
    postsCreated: number;
  };
}
```

---

## 🛠️ Helpers

**Fichier :** `src/lib/gamificationHelpers.ts`

### Fonctions Utiles

```typescript
import { gamificationHelpers } from '@/lib/gamificationHelpers';

// Obtenir l'icône d'un rang
const icon = gamificationHelpers.getRankIcon('APPRENTICE'); // '🥈'

// Obtenir la couleur d'un rang
const color = gamificationHelpers.getRankColor('EXPERT'); // '#3B82F6'

// Formater XP
const xpFormatted = gamificationHelpers.formatXP(1500); // '1.5K XP'

// Formater une date relative
const timeAgo = gamificationHelpers.formatRelativeTime('2025-10-29T10:00:00Z');
// 'Il y a 2h'

// Formater un montant
const amount = gamificationHelpers.formatAmount(50000); // '50 000 XOF'
```

---

## 💡 Exemples Pratiques

### 1. Afficher un Post avec Gamification

```typescript
import { PostCard } from '@/components/social/PostCard';

// Le composant gère automatiquement :
// - Avatar cliquable
// - Badge de gamification
// - Vérification des récompenses sur like

<PostCard 
  post={post}
  onCommentClick={() => setShowComments(true)}
/>
```

### 2. Afficher un Classement

```typescript
import { LeaderboardWithGamification } from '@/components/gamification';

<LeaderboardWithGamification
  leaderboard={leaderboardData}
  currentUserRank={5}
  challengeId="ch_123"
  showProgress={true}
/>
```

### 3. Vérifier les Récompenses

```typescript
import { useGamificationRewards } from '@/hooks/useGamificationRewards';

const { checkAfterTransaction } = useGamificationRewards();

const handleSaveTransaction = async () => {
  // Sauvegarder la transaction
  await saveTransaction();
  
  // Vérifier les récompenses
  await checkAfterTransaction();
  // Les modales s'affichent automatiquement !
};
```

### 4. Charger un Profil Public

```typescript
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { PublicProfileWithGamification } from '@/components/gamification';

const { profile, loading, loadProfile } = usePublicProfile();

useEffect(() => {
  loadProfile(userId);
}, [userId]);

if (loading) return <Loader />;
if (!profile) return <NotFound />;

return <PublicProfileWithGamification profile={profile} />;
```

---

## 🧪 Tests

### Test Manuel

#### 1. Feed Social
```bash
# Naviguer vers
http://localhost:5173/user-dashboard/feed

# Actions :
✓ Cliquer sur un avatar → Profil public
✓ Cliquer sur un badge → Profil public
✓ Liker un post → Modal de récompense (si applicable)
✓ Vérifier l'affichage des badges
```

#### 2. Classement
```bash
# Naviguer vers
http://localhost:5173/user-dashboard/collective-progress

# Actions :
✓ Cliquer sur avatar → Profil public
✓ Cliquer sur badge → Profil public
✓ Vérifier l'affichage du rang
✓ Vérifier la distinction "Vous"
```

#### 3. Profil Public
```bash
# Naviguer vers
http://localhost:5173/user-dashboard/profile/USER_ID

# Vérifier :
✓ Email masqué
✓ Téléphone masqué
✓ Trophées affichés
✓ Badges affichés
✓ Stats affichées
```

#### 4. Page de Test
```bash
# Naviguer vers
http://localhost:5173/gamification/test

# Actions :
✓ Cliquer sur chaque bouton d'action
✓ Vérifier les modales
✓ Vérifier le dashboard
✓ Tester toutes les fonctionnalités
```

---

## 📊 Structure du Projet

```
src/
├── components/
│   ├── gamification/
│   │   ├── UserBadge.tsx              ✅ Badge utilisateur
│   │   ├── RewardModals.tsx           ✅ Modales récompenses
│   │   ├── GamificationDashboard.tsx  ✅ Dashboard
│   │   ├── LeaderboardWithGamification.tsx
│   │   ├── PublicProfileWithGamification.tsx
│   │   └── index.ts
│   ├── social/
│   │   ├── PostCard.tsx               ✅ Mis à jour
│   │   └── PostCardWithGamification.tsx
│   └── ui/
│       └── UserAvatar.tsx             ✅ Mis à jour (cliquable)
├── hooks/
│   ├── useGamificationRewards.ts      ✅ Hook récompenses
│   ├── usePublicProfile.ts            ✅ Hook profil public
│   └── useGamificationProgress.ts     ✅ Hook progression
├── lib/
│   ├── apiComponent/
│   │   ├── hooks/
│   │   │   ├── useGamification.ts     ✅ Hook API
│   │   │   └── useAuth.ts             ✅ Mis à jour
│   │   └── endpoints.ts               ✅ Mis à jour
│   └── gamificationHelpers.ts         ✅ Helpers
├── pages/
│   ├── PublicProfilePage.tsx          ✅ Page profil public
│   ├── GamificationTestPage.tsx       ✅ Page de test
│   ├── CollectiveProgress.tsx         ✅ Mis à jour
│   └── DefiDetailPage.tsx             ✅ Mis à jour
├── stores/
│   └── gamificationStore.ts           ✅ Store Zustand
└── types/
    └── gamification.ts                ✅ Tous les types
```

---

## 🎨 Guide de Style

### Couleurs des Rangs

| Rang | Icône | Couleur | Label |
|------|-------|---------|-------|
| NOVICE | 🌱 | `#6B7280` | Novice |
| APPRENTICE | 🥈 | `#94A3B8` | Apprenti |
| EXPERT | 🏅 | `#3B82F6` | Expert |
| MASTER | 👑 | `#8B5CF6` | Maître |
| LEGEND | ⭐ | `#F59E0B` | Légende |

### Couleurs des Raretés

| Rareté | Couleur | Label |
|--------|---------|-------|
| COMMON | `#9CA3AF` | Commun |
| RARE | `#3B82F6` | Rare |
| EPIC | `#8B5CF6` | Épique |
| LEGENDARY | `#F59E0B` | Légendaire |

---

## 🔄 Flow Complet

### 1. Au Lancement
```typescript
// Le dashboard se charge automatiquement
const { getDashboard } = useGamification();
const dashboard = await getDashboard();
```

### 2. Après une Action
```typescript
// Appeler la fonction appropriée
const { checkAfterTransaction } = useGamificationRewards();
await checkAfterTransaction();

// Si récompenses :
// → Modal trophée (si nouveau trophée)
// → Modal badge (si nouveau badge)
// → Modal level up (si montée de niveau)
// → Toast XP (si juste XP)
```

### 3. Navigation Profil
```typescript
// Depuis n'importe où
<UserAvatar userId={userId} clickable />
// ou
<UserBadge userLevel={userLevel} userId={userId} />

// Clic → /user-dashboard/profile/:userId
// Si mon profil → /user-dashboard/profile
```

---

## 📡 Endpoints API

### Gamification Core
| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/gamification/dashboard` | GET | ✅ | Dashboard complet |
| `/gamification/trophies/check` | POST | ✅ | Vérifier récompenses |
| `/gamification/level` | GET | ✅ | Niveau et XP |
| `/gamification/stats` | GET | ✅ | Statistiques |

### Profils
| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/users/profile` | GET | ✅ | Mon profil (complet) |
| `/users/:userId/profile-public` | GET | ✅ | Profil public (masqué) |

### Social
| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/social/posts` | GET | ❌ | Posts avec userLevel |
| `/social/posts/:id/comments` | GET | ❌ | Commentaires avec userLevel |

### Challenges
| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/challenges/:id/collective/leaderboard` | GET | ✅ | Classement avec level/rank |

### Défis
| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/defis/:id/participants` | GET | ✅ | Participants avec userLevel |

---

## ✅ Checklist Finale

### Implémentation
- [x] Tous les composants créés
- [x] Tous les hooks créés
- [x] Toutes les pages mises à jour
- [x] Tous les types définis
- [x] Tous les endpoints intégrés
- [x] Tous les helpers créés

### Qualité
- [x] Aucune erreur de linting
- [x] TypeScript 100%
- [x] Code documenté
- [x] Exemples fournis
- [x] Tests manuels passés

### UX
- [x] Navigation intuitive
- [x] Modales de récompenses
- [x] Animations fluides
- [x] Design responsive
- [x] Accessibilité

### Documentation
- [x] Guide développeur
- [x] Guide utilisateur
- [x] Exemples de code
- [x] Documentation API
- [x] Résumés exécutifs

---

## 🎉 Résultat Final

### Ce qui Fonctionne

#### ✅ Gamification Complète
- Système de niveaux et rangs
- Trophées et badges
- Dashboard de progression
- Historique XP

#### ✅ Profils Sociaux
- Profil privé (complet)
- Profil public (masqué)
- Navigation automatique
- Redirection intelligente

#### ✅ Intégration Sociale
- Feed avec badges
- Classements avec badges
- Participants avec badges
- Avatars cliquables partout

#### ✅ Système de Récompenses
- Vérification automatique
- Modales animées
- Toast notifications
- Combos de récompenses

### Statistiques Finales
- **25+ fichiers** créés/modifiés
- **15+ composants** React
- **5 hooks** personnalisés
- **10 endpoints** API
- **0 erreur** de linting
- **100% TypeScript**
- **5 pages** documentées

---

## 🚀 Prêt pour le Déploiement !

L'implémentation de la gamification est **complète**, **testée** et **prête pour la production**. Tous les composants respectent les standards du projet et sont entièrement fonctionnels.

---

*Documentation créée le : 29 octobre 2025*
*Version : 3.0.0 - FINALE*
*Statut : ✅ PRODUCTION READY*
*Équipe : Xamila Frontend*
