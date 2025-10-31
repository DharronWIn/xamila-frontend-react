# 📱 Système de Défis d'Épargne

## 🎯 Vue d'ensemble

Le système de défis est une plateforme sociale d'épargne permettant aux utilisateurs de créer, rejoindre et gérer plusieurs défis d'épargne simultanément. C'est comme Instagram, mais pour l'épargne !

## 📁 Structure des Fichiers

### Types TypeScript
- `src/types/defi.ts` - Tous les types TypeScript pour les défis, participants, transactions, etc.

### API Layer
- `src/lib/apiComponent/endpoints.ts` - Endpoints API pour les défis
- `src/lib/apiComponent/hooks/useDefis.ts` - Hooks React pour consommer l'API des défis

### State Management
- `src/stores/defiStore.ts` - Store Zustand pour la gestion d'état des défis

### Composants UI
- `DefiCard.tsx` - Carte d'affichage d'un défi
- `CreateDefiModal.tsx` - Modal de création de défi (multi-étapes)
- `JoinDefiModal.tsx` - Modal pour rejoindre un défi
- `AddTransactionModal.tsx` - Modal pour ajouter une transaction

### Pages
- `src/pages/DefisListPage.tsx` - Page de liste de tous les défis (découverte)
- `src/pages/DefiDetailPage.tsx` - Page de détails d'un défi
- `src/pages/MyDefisPage.tsx` - Page de gestion des défis de l'utilisateur

## 🚀 Fonctionnalités Principales

### 1. Découverte des Défis
- Liste de tous les défis disponibles
- Filtrage par type, statut, créateur
- Recherche par titre/description
- Distinction entre défis officiels et communautaires
- Statistiques globales

### 2. Création de Défi
Processus multi-étapes :
- **Étape 1** : Informations de base (titre, description, type)
- **Étape 2** : Durée et dates (avec option défi permanent)
- **Étape 3** : Participants et visibilité (public/privé/amis)
- **Étape 4** : Récompenses

### 3. Participation à un Défi
- Définition de l'objectif personnel
- Configuration optionnelle (revenus, motivation, etc.)
- Suivi de la progression personnelle
- Ajout de transactions (dépôts/retraits)

### 4. Gestion des Défis
- Dashboard personnel des défis
- Onglets : Défis créés, Participations, Historique
- Modification et suppression des défis créés
- Abandon de défi avec feedback

## 📊 Types de Données Principaux

### Defi
```typescript
interface Defi {
  id: string;
  title: string;
  description: string;
  type: 'WEEKLY' | 'MONTHLY' | 'DAILY' | 'CUSTOM';
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  isOfficial: boolean;
  isUnlimited: boolean;
  hasNoEndDate: boolean;
  rewards: string[];
  // ... autres champs
}
```

### DefiParticipant
```typescript
interface DefiParticipant {
  id: string;
  userId: string;
  defiId: string;
  currentAmount: number;
  status: 'ACTIVE' | 'UPCOMING' | 'ABANDONED' | 'COMPLETED';
  // ... autres champs
}
```

### DefiGoal
```typescript
interface DefiGoal {
  id: string;
  defiId: string;
  participantId: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  isAchieved: boolean;
  // ... autres champs
}
```

### DefiTransaction
```typescript
interface DefiTransaction {
  id: string;
  defiId: string;
  participantId: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  description?: string;
  date: string;
}
```

## 🔌 API Endpoints

### Défis
- `GET /defis` - Liste tous les défis
- `GET /defis/:id` - Détails d'un défi
- `POST /defis` - Créer un défi
- `PUT /defis/:id` - Modifier un défi
- `DELETE /defis/:id` - Supprimer un défi
- `GET /defis/stats` - Statistiques globales

### Participants
- `GET /defis/:id/participants` - Liste des participants
- `POST /defis/:id/participants` - Rejoindre un défi
- `DELETE /defis/:id/participants/me` - Quitter un défi
- `POST /defis/:id/participants/me/abandon` - Abandonner un défi

### Transactions
- `GET /defis/:id/transactions` - Liste des transactions
- `POST /defis/:id/transactions` - Ajouter une transaction
- `GET /defis/:id/transactions/stats` - Statistiques des transactions

### Goals (Objectifs)
- `GET /defis/:id/goals/me` - Mon objectif
- `POST /defis/:id/goals/configure` - Configurer l'objectif
- `PUT /defis/:id/goals/me` - Modifier l'objectif

### Utilisateur
- `GET /users/:userId/defis` - Défis de l'utilisateur
- `GET /users/:userId/defis/stats` - Statistiques utilisateur

## 🎨 Design System

### Couleurs par contexte

**Défis Officiels**
- Badge : Dégradé or (#FFD700)
- Icône : 🏆

**Statuts**
- Actif : Vert (#10B981)
- À venir : Bleu (#3B82F6)
- Terminé : Gris (#6B7280)
- Annulé : Rouge (#EF4444)

**Types de transaction**
- Dépôt : Vert (#10B981)
- Retrait : Rouge (#EF4444)

**Visibilité**
- Public : Globe vert
- Privé : Lock rouge
- Amis : UserCheck bleu

## 🛠️ Utilisation

### Créer un défi
```tsx
import { CreateDefiModal } from '@/components/defis/CreateDefiModal';

<CreateDefiModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    // Rafraîchir la liste des défis
  }}
/>
```

### Rejoindre un défi
```tsx
import { JoinDefiModal } from '@/components/defis/JoinDefiModal';

<JoinDefiModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  defi={selectedDefi}
  onSuccess={() => {
    // Rafraîchir le défi
  }}
/>
```

### Ajouter une transaction
```tsx
import { AddTransactionModal } from '@/components/defis/AddTransactionModal';

<AddTransactionModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  defiId={defiId}
  currentBalance={currentAmount}
  onSuccess={() => {
    // Rafraîchir les données
  }}
/>
```

### Utiliser le Store
```tsx
import { useDefiStore } from '@/stores/defiStore';

const MyComponent = () => {
  const { 
    defis, 
    isLoading, 
    fetchDefis, 
    createDefi,
    joinDefi 
  } = useDefiStore();

  useEffect(() => {
    fetchDefis({ status: 'ACTIVE' });
  }, [fetchDefis]);

  return (
    // Votre composant
  );
};
```

### Utiliser les Hooks
```tsx
import { useDefis, useDefiParticipants } from '@/lib/apiComponent/hooks/useDefis';

const MyComponent = () => {
  const { defis, isLoading, getDefis } = useDefis();
  const { participants, joinDefi } = useDefiParticipants(defiId);

  // Utiliser les données
};
```

## 📱 Routes

- `/user-dashboard/defis` - Liste de tous les défis
- `/user-dashboard/defis/:id` - Détails d'un défi
- `/user-dashboard/mes-defis` - Mes défis (créés, participations, historique)

## 🔒 Permissions

### Créer un défi
- Tous les utilisateurs authentifiés

### Modifier/Supprimer un défi
- Créateur du défi OU
- Admin

### Rejoindre un défi
- Défi actif ou à venir
- Pas déjà participant
- Places disponibles (si limité)
- Visibilité appropriée

### Ajouter une transaction
- Participant au défi
- Défi actif
- Solde valide pour les retraits

## 🎯 Best Practices

1. **Toujours valider les données** avant de soumettre
2. **Gérer les états de chargement** pour une meilleure UX
3. **Afficher des messages d'erreur clairs** à l'utilisateur
4. **Rafraîchir les données** après chaque action importante
5. **Utiliser des animations** pour les transitions
6. **Optimiser les requêtes API** avec React Query ou le Store

## 🚧 Améliorations Futures

- [ ] Notifications push pour les rappels
- [ ] Chat intégré pour les participants
- [ ] Badges et achievements
- [ ] Classements et leaderboards
- [ ] Export des données en PDF/CSV
- [ ] Partage sur les réseaux sociaux
- [ ] Intégration avec les comptes bancaires
- [ ] Suggestions de défis personnalisées
- [ ] Défis récurrents automatiques

## 📞 Support

Pour toute question ou problème, consultez :
- La documentation complète : `DEFIS_FRONTEND_SPEC.md`
- Les exemples d'API : `src/defis/EXAMPLES.http`
- Le code source : `src/components/defis/`

