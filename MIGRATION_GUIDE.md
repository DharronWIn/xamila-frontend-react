# 🔄 Guide de Migration - Gamification

## 📋 Comment Migrer vos Composants Existants

Ce guide vous aide à migrer vos composants existants pour utiliser le nouveau système de gamification.

---

## 🎯 Composants à Migrer

### 1. **Posts Sociaux**

#### Avant
```typescript
<div className="flex items-center space-x-3">
  <Avatar>
    <AvatarImage src={post.user.pictureProfilUrl} />
  </Avatar>
  <div>
    <p className="font-semibold">{post.user.name}</p>
  </div>
</div>
```

#### Après
```typescript
import UserAvatar from '@/components/ui/UserAvatar';
import { UserBadge } from '@/components/gamification/UserBadge';

<div className="flex items-center space-x-3">
  <UserAvatar 
    src={post.user.pictureProfilUrl}
    alt={post.user.name}
    userId={post.user.id}
    clickable
    size="md"
  />
  <div>
    <div className="flex items-center space-x-2">
      <p className="font-semibold">{post.user.name}</p>
      {post.user.userLevel && (
        <UserBadge 
          userLevel={post.user.userLevel}
          userId={post.user.id}
          size="sm"
        />
      )}
    </div>
  </div>
</div>
```

---

### 2. **Classements**

#### Avant
```typescript
<div className="flex items-center space-x-3">
  <div className="rank">{entry.rank}</div>
  <Avatar>
    <AvatarImage src={entry.user.pictureProfilUrl} />
  </Avatar>
  <p>{entry.userName}</p>
</div>
```

#### Après
```typescript
import UserAvatar from '@/components/ui/UserAvatar';
import { UserBadge } from '@/components/gamification/UserBadge';

<div className="flex items-center space-x-3">
  <div className="rank">{entry.rank}</div>
  
  {!entry.isCurrentUser && (
    <UserAvatar 
      src={entry.userPictureUrl}
      alt={entry.userName}
      userId={entry.userId}
      clickable
      size="md"
    />
  )}
  
  <div className="flex-1">
    <div className="flex items-center space-x-2">
      <p>{entry.userName}</p>
      {entry.level && entry.userRank && !entry.isCurrentUser && (
        <UserBadge 
          userLevel={{
            level: entry.level,
            totalXP: entry.totalXP || 0,
            rank: entry.userRank,
            totalTrophies: 0,
            totalBadges: 0
          }}
          userId={entry.userId}
          size="sm"
          showLevel={false}
        />
      )}
    </div>
  </div>
</div>
```

---

### 3. **Participants de Défis**

#### Avant
```typescript
<div className="flex items-center space-x-3">
  <Avatar>
    <AvatarImage src={participant.user.pictureProfilUrl} />
  </Avatar>
  <div>
    <p>{participant.user.firstName} {participant.user.lastName}</p>
  </div>
</div>
```

#### Après
```typescript
import UserAvatar from '@/components/ui/UserAvatar';
import { UserBadge } from '@/components/gamification/UserBadge';

<div className="flex items-center space-x-3">
  <UserAvatar 
    src={participant.user.pictureProfilUrl}
    alt={`${participant.user.firstName} ${participant.user.lastName}`}
    userId={participant.user.id}
    clickable
    size="md"
  />
  <div>
    <div className="flex items-center space-x-2">
      <p>{participant.user.firstName} {participant.user.lastName}</p>
      {participant.user.userLevel && (
        <UserBadge 
          userLevel={participant.user.userLevel}
          userId={participant.user.id}
          size="sm"
          showLevel={false}
        />
      )}
    </div>
  </div>
</div>
```

---

## 🔧 Ajout des Récompenses

### Dans une Action Like

#### Avant
```typescript
const handleLike = async () => {
  await likePost(postId);
};
```

#### Après
```typescript
import { useGamificationRewards } from '@/hooks/useGamificationRewards';

const { checkAfterLikeReceived } = useGamificationRewards();

const handleLike = async () => {
  const wasLiked = isLiked;
  await likePost(postId);
  
  // Vérifier les récompenses si c'est un nouveau like
  if (!wasLiked) {
    await checkAfterLikeReceived();
  }
};
```

---

### Dans une Action Post

#### Avant
```typescript
const handleCreatePost = async (data) => {
  await createPost(data);
  toast.success('Post créé !');
};
```

#### Après
```typescript
import { useGamificationRewards } from '@/hooks/useGamificationRewards';

const { checkAfterPostCreated } = useGamificationRewards();

const handleCreatePost = async (data) => {
  await createPost(data);
  toast.success('Post créé !');
  
  // Vérifier les récompenses
  await checkAfterPostCreated();
};
```

---

### Dans une Action Transaction

#### Avant
```typescript
const handleSaveTransaction = async (data) => {
  await saveTransaction(data);
  toast.success('Transaction enregistrée !');
};
```

#### Après
```typescript
import { useGamificationRewards } from '@/hooks/useGamificationRewards';

const { checkAfterTransaction } = useGamificationRewards();

const handleSaveTransaction = async (data) => {
  await saveTransaction(data);
  toast.success('Transaction enregistrée !');
  
  // Vérifier les récompenses
  await checkAfterTransaction();
};
```

---

## 📊 Mise à Jour des Types

### Types de Post

#### Avant
```typescript
interface Post {
  id: string;
  title: string;
  user: {
    id: string;
    name: string;
    pictureProfilUrl: string;
  };
}
```

#### Après
```typescript
import { UserLevelInfo } from '@/types/gamification';

interface Post {
  id: string;
  title: string;
  user: {
    id: string;
    name: string;
    pictureProfilUrl: string;
    userLevel?: UserLevelInfo;  // ✅ NOUVEAU
  };
}
```

---

### Types de Participant

#### Avant
```typescript
interface Participant {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}
```

#### Après
```typescript
import { UserLevelInfo } from '@/types/gamification';

interface Participant {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    userLevel?: UserLevelInfo;  // ✅ NOUVEAU
  };
}
```

---

## 🎯 Checklist de Migration

### Pour chaque composant affichant un utilisateur :

- [ ] Importer `UserAvatar` depuis `@/components/ui/UserAvatar`
- [ ] Importer `UserBadge` depuis `@/components/gamification/UserBadge`
- [ ] Remplacer `<Avatar>` par `<UserAvatar clickable userId={user.id} />`
- [ ] Ajouter `<UserBadge>` à côté du nom si `userLevel` existe
- [ ] Vérifier que les types incluent `userLevel` (optionnel)

### Pour chaque action importante :

- [ ] Importer `useGamificationRewards`
- [ ] Appeler la fonction de vérification appropriée
- [ ] Tester que les modales s'affichent

---

## 🧪 Test de Migration

### Checklist de Test

1. **Avatar Cliquable**
   - [ ] L'avatar est cliquable
   - [ ] Le clic navigue vers le profil
   - [ ] Hover effect visible
   - [ ] Focus ring présent

2. **Badge Affiché**
   - [ ] Le badge s'affiche si `userLevel` existe
   - [ ] Le badge est cliquable
   - [ ] Les couleurs sont correctes
   - [ ] L'icône correspond au rang

3. **Récompenses**
   - [ ] La vérification se fait après l'action
   - [ ] Les modales s'affichent correctement
   - [ ] Le toast XP apparaît
   - [ ] Pas de double appel

4. **Navigation**
   - [ ] Navigation vers profil public
   - [ ] Redirection si c'est son profil
   - [ ] Profil public affiche données masquées
   - [ ] Retour fonctionne

---

## 🚨 Pièges à Éviter

### 1. **UserLevel Optionnel**
```typescript
// ❌ Mauvais
<UserBadge userLevel={post.user.userLevel} />

// ✅ Bon
{post.user?.userLevel && (
  <UserBadge userLevel={post.user.userLevel} />
)}
```

### 2. **Double Vérification**
```typescript
// ❌ Mauvais - Vérifie à chaque render
useEffect(() => {
  checkAfterTransaction();
}, []);

// ✅ Bon - Vérifie uniquement après l'action
const handleAction = async () => {
  await saveData();
  await checkAfterTransaction();
};
```

### 3. **Navigation Infinie**
```typescript
// ❌ Mauvais - Peut créer une boucle
<UserBadge userId={currentUser.id} />

// ✅ Bon - Désactiver pour soi-même
{!isCurrentUser && (
  <UserBadge userId={user.id} />
)}
```

---

## 📚 Ressources

### Documentation
- `README_GAMIFICATION.md` - Documentation complète
- `GAMIFICATION_COMPLETE_GUIDE.md` - Guide technique
- `src/components/gamification/README.md` - Guide composants

### Exemples
- `src/pages/GamificationTestPage.tsx` - Page de test
- `src/components/social/PostCard.tsx` - Post migré
- `src/pages/CollectiveProgress.tsx` - Classement migré
- `src/pages/DefiDetailPage.tsx` - Participants migrés

### Outils
- `src/lib/gamificationHelpers.ts` - Fonctions utilitaires
- `src/hooks/useGamificationRewards.ts` - Hook principal
- `src/types/gamification.ts` - Tous les types

---

## 🎯 Prochaines Étapes

### Composants à Migrer (Optionnel)

1. **Commentaires** (`src/components/social/CommentSection.tsx`)
   - Ajouter badges aux commentaires
   - Rendre avatars cliquables

2. **Liste des Défis** (`src/pages/DefisListPage.tsx`)
   - Badges sur les créateurs
   - Avatars cliquables

3. **Mon Profil** (`src/pages/Profile.tsx`)
   - Intégrer le dashboard gamification
   - Afficher trophées et badges

### Nouvelles Fonctionnalités (Optionnel)

1. **Animations**
   - Animation de gain de niveau
   - Confettis sur trophée rare

2. **Graphiques**
   - Évolution XP au fil du temps
   - Comparaison avec la moyenne

3. **Social**
   - Système de follow/unfollow
   - Messagerie directe
   - Notifications de visite de profil

---

## ✅ Conclusion

La migration vers le nouveau système de gamification est **simple et rapide** grâce aux composants prêts à l'emploi. Suivez ce guide pour migrer vos composants en quelques minutes !

---

*Dernière mise à jour : 29 octobre 2025*
*Version : 1.0.0*
