# Guide de la Nouvelle Structure Facebook

## 📋 Vue d'ensemble

L'interface a été complètement réorganisée selon le modèle **Facebook** pour offrir une expérience utilisateur moderne et intuitive.

## 🎨 Structure Générale

### 1. **Navbar Horizontale** (en haut)

La navbar est fixe en haut de l'écran et contient :

#### Partie Gauche
- **Logo** cliquable qui ramène au dashboard

#### Partie Centrale  
- **Onglets principaux** (icônes uniquement, sans texte)
  - 🏠 **Accueil** → `/user-dashboard`
  - 🏆 **Défis** → `/user-dashboard/defis`
  - 🎯 **Challenges** → `/user-dashboard/challenges`
  - 📈 **Flux Financier** → `/user-dashboard/transactions` (Premium)
  - 📚 **Ressources** → Menu déroulant avec toutes les ressources disponibles

#### Partie Droite
- 🔄 **Bouton Admin/User** (si admin)
- ☰ **Menu "Plus"** → Actions supplémentaires + Toggle Thème
- 💬 **Bouton Forum** → Accès rapide au forum
- 🔔 **Notifications**
- 👤 **Menu Profil**

### 2. **Sidebar Dynamique** (à gauche)

La sidebar **change automatiquement** selon l'onglet actif de la navbar :

#### Accueil
- Vue d'ensemble
  - Tableau de bord
  - Ressources
- Finances
  - Flux financier (Premium)
  - Compte bancaire

#### Défis
- Défis
  - Tous les défis
  - Mes défis
- Progression
  - Progression collective (Premium)

#### Challenges
- Challenges d'épargne
  - Tous les challenges
  - Mon challenge
- Performance
  - Progression collective (Premium)

#### Flux Financier
- Flux Financier
  - Toutes les transactions (Premium)
  - Compte bancaire
- Rapports
  - Tableau de bord
  - Progression collective (Premium)

#### Ressources
- Certificats & Cartes
  - Certificat d'engagement au challenge
  - Carte d'adhérent à la Communauté
  - Certificat de réussite au challenge
- Coaching
  - Coaching 30 mn (1ère séance)
  - Coaching personnalisé (Premium)
- Contenus Pédagogiques
  - Webinaires
  - Vidéos
  - Audios
  - Documents

#### Forum
- Communauté
  - Fil d'actualité
  - Progression collective (Premium)

#### Admin (Mode Admin uniquement)
- Administration
  - Dashboard Admin
  - Statistiques
- Gestion
  - Utilisateurs
  - Financière
  - Objectifs d'épargne
  - Sociale
  - Challenges
  - Notifications
  - Comptes bancaires

### 3. **Menu Ressources** (Dropdown dans la Navbar)

L'onglet **Ressources** dans la navbar ouvre un menu déroulant contenant :

#### Certificats & Cartes
- 📄 Certificat d'engagement au challenge personnalisé
- 🆔 Carte d'adhérent à la Communauté des Epargnants
- 🏆 Certificat de réussite au challenge épargne

#### Coaching
- 👤 Première séance de 30 mn de coaching personnalisé
- 👤 Séance de coaching personnalisé de 30 mn **(Premium)**

#### Contenus Pédagogiques
- 🎥 Webinaires
- 🎥 Ressources vidéos
- 🎧 Ressources audios
- 📚 Ressources documentaires

### 4. **Menu "Plus"** (Dropdown)

Contient les actions secondaires :
- 💳 Compte bancaire
- ⚙️ Paramètres
- ❓ Aide
- 🌙 **Toggle Thème** (Clair/Sombre)

## 📱 Responsive Design

### Desktop (> 1024px)
- Navbar complète avec tous les onglets
- Sidebar visible en permanence
- Tous les boutons visibles

### Tablet (768px - 1024px)
- Navbar avec icônes réduites
- Sidebar cachée, accessible via bouton "Menu"
- Certains boutons secondaires masqués

### Mobile (< 768px)
- Logo réduit
- Onglets navbar masqués sur très petit écran
- Sidebar accessible via Sheet (panneau latéral)
- Bouton "Menu" toujours visible
- Thème toggle masqué
- Seuls les icônes essentiels (Menu, Notifications, Profil)

## 🎯 Avantages de cette Structure

1. **Navigation Intuitive**
   - Onglets principaux toujours visibles
   - Navigation contextuelle dans la sidebar

2. **Ergonomie Optimisée**
   - Modèle familier (Facebook)
   - Moins de clics pour accéder aux fonctionnalités

3. **Responsive**
   - Adapté à tous les écrans
   - Menu mobile avec Sheet

4. **Performance**
   - Sidebar dynamique = moins de composants inutiles
   - Navigation fluide

## 🔧 Composants Créés

### `FacebookNavbar.tsx`
Navbar horizontale principale avec :
- Gestion des onglets actifs
- Navigation contextuelle
- Menu "Plus" avec actions supplémentaires
- Profil et notifications

### `DynamicSidebar.tsx`
Sidebar qui s'adapte selon la section active :
- Menus contextuels
- Carte utilisateur avec badge Premium
- Actions rapides (Paramètres, Aide, Déconnexion)
- Badges Premium sur fonctionnalités verrouillées

### `FacebookLayout.tsx`
Layout principal qui combine :
- Navbar en haut
- Sidebar à gauche (desktop) ou Sheet (mobile)
- Zone de contenu principale
- Gestion du responsive

## 🚀 Utilisation

Le layout est automatiquement appliqué à toutes les routes protégées dans `App.tsx` :

```tsx
<Route path="/user-dashboard" element={
  <ProtectedRoute>
    <FacebookLayout><UserDashboard /></FacebookLayout>
  </ProtectedRoute>
} />
```

## 🎨 Styles Personnalisés

Nouveaux styles ajoutés dans `index.css` :
- `.scrollbar-thin` - Scrollbar moderne style Facebook
- `.fade-in` - Animation d'apparition
- `.facebook-card` - Style de carte cohérent
- `.navbar-btn-active` - État actif des boutons navbar

## 📝 Notes Importantes

1. **Navigation Automatique**
   - La section active est détectée automatiquement selon l'URL
   - La sidebar se met à jour en temps réel

2. **Premium Features**
   - Certaines sections affichent un badge Premium
   - Clic sur une fonctionnalité Premium → Modal d'upgrade

3. **Mode Admin**
   - Bascule facile entre mode Admin et User
   - Sidebar adaptée au contexte

4. **Mobile First**
   - Sheet pour la sidebar mobile
   - Bouton "Menu" accessible en permanence
   - Navigation tactile optimisée

## 🔄 Migration depuis l'ancien layout

L'ancien `AppLayout` a été remplacé par `FacebookLayout` mais reste disponible si besoin.

Pour revenir à l'ancien layout :
```tsx
// Remplacer FacebookLayout par AppLayout dans App.tsx
import { AppLayout } from "@/components/layout/AppLayout";
```

---

**Date de création** : Octobre 2025  
**Version** : 2.0  
**Type** : Layout Facebook-like

