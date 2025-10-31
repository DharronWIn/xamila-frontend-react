# 🏆 Système de Gestion des Trophées et Récompenses

## 📋 Vue d'ensemble

Ce système gère automatiquement la vérification et l'affichage des récompenses utilisateur (trophées, badges, montées de niveau) via l'API `/gamification/trophies/check`.

## 🚀 Utilisation Simple

### 1. Intégration Automatique au Dashboard

Le système est déjà intégré au dashboard principal (`UserDashboard.tsx`) et vérifie automatiquement les récompenses au chargement :

```tsx
<RewardManager 
  autoCheck={true}
  onRewardsChecked={(rewards) => {
    console.log('Récompenses vérifiées:', rewards);
  }}
/>
```

### 2. Utilisation Manuelle

```tsx
import { RewardManager } from '@/components/gamification/RewardManager';

// Bouton pour déclencher manuellement
<RewardManager 
  autoCheck={false}
  onRewardsChecked={(rewards) => {
    // Traiter les récompenses
  }}
/>
```

### 3. Hook Direct

```tsx
import { useGamificationRewards } from '@/lib/apiComponent/hooks/useGamificationRewards';

const { checkRewards, isChecking, rewards, error } = useGamificationRewards();

// Déclencher la vérification
const handleCheck = async () => {
  const rewardsData = await checkRewards();
  if (rewardsData) {
    // Traiter les récompenses
  }
};
```

## 📊 Types de Réponse API

```typescript
interface RewardsResponse {
  newTrophies: UserTrophy[];      // 🏆 Trophées débloqués
  newBadges: UserBadge[];         // 🎖️ Badges débloqués  
  levelUp: LevelUp | null;        // 📈 Montée de niveau
  xpGained: number;               // ⭐ XP gagné
  currentLevel: UserLevel;        // 📊 État actuel
}
```

## 🎯 Cas d'Affichage

| Cas | Réponse | Message Frontend |
|-----|---------|------------------|
| **Trophée** | `newTrophies: [...]` | "🏆 Nouveau trophée débloqué !" |
| **Badge** | `newBadges: [...]` | "🎖️ Nouveau badge débloqué !" |
| **Level Up** | `levelUp: {...}` | "📈 Montée de niveau !" |
| **Rank Up** | `levelUp.newRank` existe | "🎊 Nouveau rang : APPRENTICE !" |
| **COMBO** | Plusieurs débloqués | "🎉 COMBO DE RÉCOMPENSES !" |

## 🔄 Quand Appeler la Vérification

| Moment | Priorité | Exemple |
|--------|----------|---------|
| Après transaction | 🔴 OBLIGATOIRE | `createTransaction()` → `checkRewards()` |
| Après challenge complété | 🔴 OBLIGATOIRE | `completeChallenge()` → `checkRewards()` |
| Après défi créé/complété | 🔴 OBLIGATOIRE | `createDefi()` → `checkRewards()` |
| Après post/comment/like | 🟡 RECOMMANDÉ | `createPost()` → `checkRewards()` |
| **Au chargement du dashboard** | 🔴 OBLIGATOIRE | **Déjà intégré** |

## 📦 Réponse API quand RIEN de nouveau

```json
{
  "newTrophies": [],           // ⬅️ Array vide
  "newBadges": [],             // ⬅️ Array vide
  "levelUp": null,             // ⬅️ null
  "xpGained": 0,               // ⬅️ 0 (aucun XP depuis le dernier check)
  "currentLevel": {            // ⬅️ État actuel (inchangé)
    "level": 5,
    "currentXP": 45,
    "totalXP": 545,
    "xpToNextLevel": 60,
    "rank": "NOVICE"
  }
}
```

## 🎨 Composants Disponibles

- **`RewardManager`** : Composant principal qui gère tout le système
- **`RewardModal`** : Modals visuelles pour afficher les récompenses
- **`useGamificationRewards`** : Hook pour l'API et la gestion d'état

## 🔧 Configuration

Le système utilise l'endpoint existant :
- **API** : `POST /gamification/trophies/check`
- **Endpoint** : `gamificationEndpoints.checkTrophies`
- **Client** : `apiClient` (avec authentification automatique)

## ✨ Fonctionnalités

- ✅ Vérification automatique au chargement du dashboard
- ✅ Modals visuelles avec animations
- ✅ Notifications toast pour chaque type de récompense
- ✅ Gestion des combos de récompenses
- ✅ Gestion d'erreurs avec messages utilisateur
- ✅ Évitement des appels multiples simultanés
- ✅ Types TypeScript complets








