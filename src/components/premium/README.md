# Système Premium et Vérification Email

Ce dossier contient tous les composants liés au système premium et à la vérification d'email.

## Composants

### 1. PremiumModal
Modal réutilisable pour l'abonnement premium (10M FCFA).

**Utilisation :**
```tsx
import PremiumModal from '@/components/premium/PremiumModal';

<PremiumModal
  isOpen={isOpen}
  onClose={handleClose}
  onSuccess={handleSuccess}
  userEmail="user@example.com"
  title="Passez au Premium"
  description="Débloquez toutes les fonctionnalités"
  showSkipOption={true}
/>
```

### 2. PremiumModalProvider
Provider context pour gérer le modal premium dans toute l'application.

**Utilisation :**
```tsx
import { PremiumModalProvider } from '@/components/premium/PremiumModalProvider';

// Envelopper votre app
<PremiumModalProvider>
  <App />
</PremiumModalProvider>
```

### 3. PremiumButton
Bouton réutilisable pour déclencher le modal premium.

**Utilisation :**
```tsx
import PremiumButton from '@/components/premium/PremiumButton';

<PremiumButton variant="default" size="lg">
  Passer au Premium
</PremiumButton>
```

### 4. PremiumExample
Exemple d'utilisation du modal premium.

## Hook

### usePremiumModal
Hook personnalisé pour gérer l'état du modal premium.

**Utilisation :**
```tsx
import { usePremiumModal } from '@/hooks/usePremiumModal';

const { showPremiumModal, hidePremiumModal, isOpen } = usePremiumModal();
```

## Page de Vérification Email

### VerifyEmail
Page de vérification d'email accessible via `/verify-email?token=TOKEN`.

**Fonctionnalités :**
- Récupération du token depuis l'URL
- Requête de vérification vers l'API
- États de chargement, succès et erreur
- Redirection automatique vers le modal premium après succès
- Redirection vers le dashboard après paiement ou skip

## Configuration

### Prix Premium
- Prix : 10,000,000 FCFA (10M FCFA)
- Formatage automatique en devise locale
- Support des méthodes de paiement Mobile Money et Carte bancaire

### Intégration API
- Endpoint de vérification : `authEndpoints.verifyAccount`
- Gestion des erreurs et états de chargement
- Redirection automatique après succès

## Utilisation dans l'App

1. **Envelopper l'application avec le provider :**
```tsx
// Dans App.tsx
import { PremiumModalProvider } from '@/components/premium/PremiumModalProvider';

<PremiumModalProvider>
  {/* Votre app */}
</PremiumModalProvider>
```

2. **Utiliser le bouton premium :**
```tsx
import PremiumButton from '@/components/premium/PremiumButton';

<PremiumButton>Débloquer Premium</PremiumButton>
```

3. **Utiliser le context dans n'importe quel composant :**
```tsx
import { usePremiumModalContext } from '@/components/premium/PremiumModalProvider';

const { showPremiumModal } = usePremiumModalContext();
```

## Routes

- `/verify-email?token=TOKEN` - Page de vérification d'email
- Redirection automatique vers `/user-dashboard` après succès
