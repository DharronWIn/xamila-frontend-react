# ⚡ Quick Start - Gamification Xamila

## 🚀 En 5 Minutes

---

## 1️⃣ Afficher un Badge Utilisateur

```typescript
import { UserBadge } from '@/components/gamification';

<UserBadge 
  userLevel={{
    level: 15,
    totalXP: 1850,
    rank: 'APPRENTICE',
    totalTrophies: 8,
    totalBadges: 3
  }}
  userId="user_123"
  size="sm"
/>
```

**Rendu :** `🥈 APPRENTICE`

---

## 2️⃣ Avatar Cliquable

```typescript
import UserAvatar from '@/components/ui/UserAvatar';

<UserAvatar 
  src={user.pictureProfilUrl}
  alt={user.name}
  userId={user.id}
  clickable
  size="md"
/>
```

**Clic → `/user-dashboard/profile/:userId`**

---

## 3️⃣ Vérifier les Récompenses

```typescript
import { useGamificationRewards } from '@/hooks/useGamificationRewards';

const { checkAfterTransaction } = useGamificationRewards();

// Après une action
await checkAfterTransaction();
// Modales automatiques si récompenses !
```

---

## 4️⃣ Dashboard Gamification

```typescript
import { GamificationDashboard } from '@/components/gamification';

<GamificationDashboard />
```

**Route :** `/gamification` ou `/gamification/test`

---

## 5️⃣ Profil Public

```typescript
import { usePublicProfile } from '@/hooks/usePublicProfile';

const { profile, loadProfile } = usePublicProfile();

useEffect(() => {
  loadProfile(userId);
}, [userId]);

return <PublicProfileWithGamification profile={profile} />;
```

**Route :** `/user-dashboard/profile/:userId`

---

## 🎯 Actions Importantes

### Après chaque action, vérifier les récompenses :

```typescript
const {
  checkAfterTransaction,      // Après transaction
  checkAfterSavings,           // Après épargne
  checkAfterPostCreated,       // Après post créé
  checkAfterLikeReceived,      // Après like reçu
  checkAfterChallengeCompleted,// Après challenge terminé
  checkAfterDefiCompleted,     // Après défi terminé
} = useGamificationRewards();
```

---

## 📊 Types Essentiels

```typescript
import { 
  UserLevelInfo,
  UserRank,
  Trophy,
  Badge,
  PublicProfile 
} from '@/types/gamification';
```

---

## 🎨 Helpers Utiles

```typescript
import { gamificationHelpers } from '@/lib/gamificationHelpers';

// Icône de rang
gamificationHelpers.getRankIcon('APPRENTICE'); // '🥈'

// Couleur de rang
gamificationHelpers.getRankColor('EXPERT'); // '#3B82F6'

// Formater XP
gamificationHelpers.formatXP(1500); // '1.5K XP'

// Formater montant
gamificationHelpers.formatAmount(50000); // '50 000 XOF'
```

---

## 🧪 Tester

### Page de Test
```
http://localhost:5173/gamification/test
```

### Feed Social
```
http://localhost:5173/user-dashboard/feed
```

### Profil Public
```
http://localhost:5173/user-dashboard/profile/:userId
```

---

## ✅ Checklist Rapide

### Pour un Nouveau Composant

- [ ] Importer `UserBadge` si affichage utilisateur
- [ ] Utiliser `UserAvatar` avec `clickable` et `userId`
- [ ] Vérifier que les types incluent `userLevel` (optionnel)
- [ ] Appeler `checkAfter...` après les actions importantes

### Vérifier que ça Marche

- [ ] Les avatars sont cliquables
- [ ] Les badges s'affichent
- [ ] La navigation vers profil fonctionne
- [ ] Les modales de récompenses apparaissent

---

## 📞 Aide

### Problème ?
1. Consulter `README_GAMIFICATION.md`
2. Voir les exemples dans les composants existants
3. Tester sur `/gamification/test`

### Composants Référence
- `src/components/social/PostCard.tsx` - Feed migré ✅
- `src/pages/CollectiveProgress.tsx` - Classement migré ✅
- `src/pages/DefiDetailPage.tsx` - Participants migrés ✅

---

## 🎉 C'est Tout !

Vous êtes prêt à utiliser la gamification dans vos composants ! 🚀

---

*Quick Start Guide - Version 1.0*
*Dernière mise à jour : 29 octobre 2025*
