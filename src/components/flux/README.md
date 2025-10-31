# 💰 Feature Flux Financiers - Documentation

## 📋 Vue d'ensemble

La feature **Flux Financiers** a été entièrement mise à jour pour correspondre aux spécifications de l'API. Elle permet aux utilisateurs de gérer leurs transactions financières avec un système de catégories complet et une interface utilisateur moderne.

## 🔄 Changements apportés

### 1. **Nouvelles Catégories de Transactions**

#### Revenus (INCOME)
- `Salaires` - Salaires et rémunérations
- `Dons` - Dons reçus
- `Prime` - Primes et bonus
- `Autres` - Autres revenus

#### Dépenses (EXPENSE)
- `Loyer` - Loyer et logement
- `Alimentation` - Nourriture et courses
- `Éducation` - Frais d'éducation
- `Santé` - Soins médicaux
- `Transport ou carburant` - Transport et carburant
- `Habillement` - Vêtements
- `Soins corporels` - Soins personnels
- `Communication credit et internet` - Télécommunications
- `Remboursement emprunt` - Remboursements
- `Épargne ou tontine` - Épargne et tontine
- `Loisir` - Divertissements
- `Social` - Activités sociales
- `Autre` - Autres dépenses

### 2. **Structure de l'API**

#### Endpoints supportés
- `POST /financial/transactions` - Créer une transaction
- `GET /financial/transactions` - Lister les transactions
- `GET /financial/transactions/:id` - Récupérer une transaction
- `PUT /financial/transactions/:id` - Modifier une transaction
- `DELETE /financial/transactions/:id` - Supprimer une transaction
- `GET /financial/flux/balance` - Solde du flux
- `GET /financial/flux/summary` - Résumé du flux
- `POST /financial/flux/toggle` - Activer/désactiver le flux
- `GET /financial/transactions/stats` - Statistiques
- `GET /financial/transactions/charts` - Données pour graphiques
- `GET /financial/categories` - Catégories avec types (recommandé)
- `GET /financial/transactions/categories` - Catégories (format legacy)

### 3. **Composants créés**

#### `CategorySelector`
- Sélecteur de catégories avec icônes et couleurs
- Support des types INCOME et EXPENSE
- Interface utilisateur intuitive

#### `TransactionCard`
- Affichage des transactions avec icônes de catégories
- Actions (voir, modifier, supprimer)
- Formatage des montants en FCFA
- Indicateurs d'épargne et de libération

#### `CategoryStats`
- Statistiques par catégorie
- Graphiques en secteurs
- Répartition des revenus et dépenses

#### `FluxBalance`
- Affichage du solde du flux financier
- Détails des entrées, sorties et épargne
- Indicateurs de variation

#### `FluxDashboard`
- Dashboard principal du flux financier
- Onglets (Vue d'ensemble, Transactions, Analyses)
- Intégration de tous les composants

### 4. **Constantes centralisées**

#### `financialCategories.ts`
- Définition des catégories
- Icônes et couleurs pour l'UI
- Fonctions utilitaires
- Types TypeScript

### 5. **Hooks mis à jour**

#### `useFinancial.ts`
- Support des nouveaux endpoints
- Gestion des catégories avec types
- Fonctions utilitaires pour les catégories

## 🎯 Utilisation

### Créer une transaction

```typescript
import { useTransactions } from "@/lib/apiComponent/hooks/useFinancial";

const { createTransaction } = useTransactions();

const newTransaction = {
  amount: 100000,
  type: 'INCOME',
  category: 'Salaires',
  description: 'Salaire du mois',
  date: new Date().toISOString()
};

await createTransaction(newTransaction);
```

### Utiliser le sélecteur de catégories

```tsx
import { CategorySelector } from "@/components/flux/CategorySelector";

<CategorySelector
  type="INCOME"
  value={selectedCategory}
  onValueChange={setSelectedCategory}
  placeholder="Sélectionner une catégorie"
/>
```

### Afficher les statistiques

```tsx
import { CategoryStats } from "@/components/flux/CategoryStats";

<CategoryStats
  stats={categoryStats}
  type="EXPENSE"
  showChart={true}
/>
```

## 🔧 Configuration

### Devises
- Toutes les montants sont affichés en FCFA (Franc CFA)
- Formatage automatique avec `Intl.NumberFormat`

### Validation
- Montants positifs obligatoires
- Catégories valides selon le type
- Dates au format ISO 8601

### Épargne
- L'épargne est considérée comme une sortie (EXPENSE)
- Catégorie spéciale "Épargne ou tontine"
- Indicateurs visuels pour les transactions d'épargne

## 🎨 Interface utilisateur

### Couleurs des catégories
- Chaque catégorie a une couleur unique
- Revenus en vert, dépenses en rouge
- Icônes représentatives pour chaque catégorie

### Responsive
- Design adaptatif pour mobile et desktop
- Composants optimisés pour tous les écrans

### Animations
- Transitions fluides avec Framer Motion
- États de chargement
- Feedback visuel pour les actions

## 🚀 Fonctionnalités

### Dashboard
- Vue d'ensemble du flux financier
- Transactions récentes
- Statistiques par catégorie
- Graphiques et analyses

### Gestion des transactions
- Création, modification, suppression
- Filtrage par type et catégorie
- Recherche et pagination

### Statistiques
- Répartition par catégorie
- Tendances mensuelles
- Comparaisons temporelles

## 📱 Intégration

### Premium
- Fonctionnalité premium
- Protection d'accès
- Modal d'upgrade

### Gamification
- Intégration avec le système de gamification
- XP et trophées pour les transactions d'épargne
- Badges de niveau

## 🔮 Améliorations futures

- Export des données (PDF, Excel)
- Graphiques avancés
- Notifications et rappels
- Budgets et objectifs
- Intégration bancaire

---

**Note :** Cette feature est maintenant entièrement conforme aux spécifications de l'API et prête pour la production. 🚀
