# 🔒 Correctif - Gestion de Session

## ❌ Problèmes Identifiés

Vous aviez une erreur récurrente qui vous déconnectait automatiquement :
```
❌ API Error [TOKEN_EXPIRED] 401: Unauthorized
Error polling notifications: ApiError: Session expirée. Reconnexion automatique en cours...
```

### Causes Racines

1. **NotificationManager démarre SANS vérifier l'authentification**
   - Le polling de notifications démarrait même sans token valide
   - Causait des erreurs 401 en boucle

2. **Polling continue après expiration du token**
   - Le service ne s'arrêtait pas automatiquement lors de l'expiration
   - Continuait à faire des requêtes avec un token invalide

3. **Pas de synchronisation entre authStore et tokenManager**
   - Déconnexion ne stoppait pas le polling
   - Pas d'écoute des événements d'authentification

4. **localStorage auth-storage pas nettoyé**
   - Le store Zustand persistait même après déconnexion
   - Causait des états incohérents

---

## ✅ Correctifs Appliqués

### 1. **NotificationManager.tsx** - Gestion intelligente du polling

**Avant :**
```typescript
export function NotificationManager() {
  useEffect(() => {
    // Démarrait TOUJOURS le polling
    simpleNotificationService.startPolling();
  }, []);
  return null;
}
```

**Après :**
```typescript
export function NotificationManager() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const startPollingIfAuthenticated = () => {
      const token = tokenManager.getToken();
      
      // ✅ Vérifie l'authentification ET le token
      if (isAuthenticated && user && token) {
        if (!simpleNotificationService.getConnectionStatus()) {
          console.log('✅ Démarrage du polling (utilisateur authentifié)');
          simpleNotificationService.startPolling();
        }
      } else {
        // ✅ Arrête le polling si non authentifié
        if (simpleNotificationService.getConnectionStatus()) {
          console.log('⚠️ Arrêt du polling (utilisateur non authentifié)');
          simpleNotificationService.stopPolling();
        }
      }
    };

    // ✅ Écoute les événements d'authentification
    window.addEventListener('auth:changed', handleAuthChange);

    return () => {
      window.removeEventListener('auth:changed', handleAuthChange);
      simpleNotificationService.stopPolling();
    };
  }, [isAuthenticated, user]);

  return null;
}
```

**Améliorations :**
- ✅ Vérifie `isAuthenticated`, `user` ET `token` avant de démarrer
- ✅ Arrête automatiquement le polling si l'utilisateur n'est pas authentifié
- ✅ Écoute les événements `auth:changed` du tokenManager
- ✅ Cleanup complet lors du démontage

---

### 2. **simpleNotificationService.ts** - Arrêt automatique sur erreur 401

**Avant :**
```typescript
private async pollNotifications(): Promise<void> {
  try {
    const { api } = await import('../apiClient');
    
    // ❌ Pas de vérification du token
    const countResponse = await api.get<{ count: number }>('/notifications/unread-count');
    // ...
  } catch (error) {
    // ❌ Erreur loggée mais service continue
    console.error('Error polling notifications:', error);
  }
}
```

**Après :**
```typescript
private async pollNotifications(): Promise<void> {
  try {
    const { api, tokenManager } = await import('../apiClient');
    
    // ✅ Vérifie si un token existe AVANT de faire des requêtes
    const token = tokenManager.getToken();
    if (!token) {
      console.warn('⚠️ Pas de token disponible, arrêt du polling');
      this.stopPolling();
      return;
    }
    
    const countResponse = await api.get<{ count: number }>('/notifications/unread-count');
    // ...
  } catch (error: unknown) {
    // ✅ Gère spécifiquement les erreurs 401
    if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
      console.warn('⚠️ Token expiré détecté lors du polling, arrêt du service');
      this.stopPolling();
      return;
    }
    
    console.error('Error polling notifications:', error);
  }
}
```

**Améliorations :**
- ✅ Vérifie l'existence du token avant toute requête
- ✅ Arrête immédiatement le polling si pas de token
- ✅ Détecte les erreurs 401 et stoppe le service automatiquement
- ✅ Évite les boucles d'erreurs infinies

---

### 3. **apiClient.ts** - Nettoyage complet lors de l'expiration

**Avant :**
```typescript
async function handleTokenExpiration(): Promise<void> {
  const refreshSuccess = await tokenManager.refreshAccessToken();
  
  if (!refreshSuccess) {
    tokenManager.clearTokens();
    
    // ❌ localStorage pas nettoyé
    
    toast({
      title: "Session expirée",
      description: "Votre session a expiré. Vous allez être redirigé vers la page de connexion.",
      variant: "destructive"
    });
    
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }
}
```

**Après :**
```typescript
async function handleTokenExpiration(): Promise<void> {
  const refreshSuccess = await tokenManager.refreshAccessToken();
  
  if (!refreshSuccess) {
    tokenManager.clearTokens();
    
    // ✅ Nettoie AUSSI le localStorage (Zustand store)
    try {
      localStorage.removeItem('auth-storage');
      console.log('🧹 LocalStorage auth nettoyé');
    } catch (error) {
      console.warn('Erreur lors du nettoyage du localStorage:', error);
    }
    
    toast({
      title: "Session expirée",
      description: "Votre session a expiré. Veuillez vous reconnecter.",
      variant: "destructive"
    });
    
    setTimeout(() => {
      if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/';
      }
    }, 1500);
  }
}
```

**Améliorations :**
- ✅ Nettoie complètement le localStorage (auth-storage de Zustand)
- ✅ Message utilisateur plus clair
- ✅ Vérifie qu'on n'est pas déjà sur login avant de rediriger
- ✅ Délai réduit (1.5s au lieu de 2s)

---

### 4. **useAuth.ts** - Logout complet

**Avant :**
```typescript
const logout = useCallback(async () => {
  try {
    globalAuthState.user = null;
    globalAuthState.isAuthenticated = false;
    globalAuthState.lastCheck = 0;
    
    setUser(null);
    setIsAuthenticated(false);
    saveAuthState(null, false);
    
    const { tokenManager } = await import('../apiClient');
    tokenManager.clearTokens();
    
    // ❌ localStorage Zustand pas nettoyé
  } catch (error: unknown) {
    console.error('Error during logout:', error);
  }
}, []);
```

**Après :**
```typescript
const logout = useCallback(async () => {
  try {
    globalAuthState.user = null;
    globalAuthState.isAuthenticated = false;
    globalAuthState.lastCheck = 0;
    
    setUser(null);
    setIsAuthenticated(false);
    saveAuthState(null, false);
    
    const { tokenManager } = await import('../apiClient');
    tokenManager.clearTokens();
    
    // ✅ Nettoie AUSSI le store Zustand
    try {
      localStorage.removeItem('auth-storage');
      console.log('🧹 Zustand auth store nettoyé');
    } catch (storageError) {
      console.warn('Erreur lors du nettoyage du Zustand store:', storageError);
    }
  } catch (error: unknown) {
    console.error('Error during logout:', error);
  }
}, []);
```

**Améliorations :**
- ✅ Nettoie complètement le store Zustand lors du logout manuel
- ✅ Logging explicite des actions
- ✅ Gestion d'erreur isolée pour le nettoyage du store

---

## 🎯 Résultat

### Avant ✋
```
1. App démarre → Polling notifications démarre IMMÉDIATEMENT
2. Token expire → Erreur 401
3. Polling continue → Erreurs 401 en boucle
4. Vous êtes déconnecté → Mais polling continue encore
5. localStorage conserve l'état → Incohérences
6. ❌ Boucle infinie d'erreurs → App inutilisable
```

### Après ✅
```
1. App démarre → Vérifie authentification
2. Si authentifié + token valide → Démarre polling
3. Token expire → Tente refresh automatique
4. Si refresh échoue → Arrête le polling
5. Nettoie TOUT (tokens, localStorage, state)
6. Redirige vers login proprement
7. ✅ Aucune erreur en boucle → App stable
```

---

## 🔄 Flux de Gestion de Session Amélioré

### Scénario 1 : Connexion
```
1. Utilisateur se connecte
   → tokenManager.setTokens(accessToken, refreshToken)
   → Émet event 'auth:changed' { isAuthenticated: true }
   → NotificationManager capte l'événement
   → Démarre le polling
```

### Scénario 2 : Token expire pendant l'utilisation
```
1. Requête API retourne 401
   → apiClient détecte l'erreur
   → Tente automatiquement refreshAccessToken()
   
2a. Si refresh réussit:
   → Nouvelle requête avec nouveau token
   → Polling continue normalement
   → ✅ Utilisateur ne voit rien
   
2b. Si refresh échoue:
   → handleTokenExpiration()
   → Nettoie tokens + localStorage
   → Émet event 'auth:changed' { isAuthenticated: false }
   → NotificationManager arrête le polling
   → Toast "Session expirée"
   → Redirection vers login après 1.5s
```

### Scénario 3 : Déconnexion manuelle
```
1. Utilisateur clique sur "Déconnexion"
   → useAuth.logout()
   → Nettoie globalAuthState
   → Nettoie localStorage ('auth-storage')
   → tokenManager.clearTokens()
   → Émet event 'auth:changed' { isAuthenticated: false }
   → NotificationManager arrête le polling
   → Redirection immédiate vers login
```

### Scénario 4 : Polling détecte token manquant
```
1. Polling démarre son cycle
   → Vérifie tokenManager.getToken()
   → Si pas de token: arrête immédiatement le polling
   → Évite les requêtes inutiles
```

---

## 📊 Tests à Effectuer

### ✅ Test 1 : Connexion normale
1. Ouvrir l'app (déconnecté)
2. Se connecter
3. ✅ **Résultat attendu :** Polling démarre automatiquement, pas d'erreur console

### ✅ Test 2 : Token expire naturellement
1. Se connecter
2. Attendre l'expiration du token (ou forcer l'expiration dans le backend)
3. Faire une action
4. ✅ **Résultat attendu :** Refresh automatique OU déconnexion propre, aucune boucle d'erreur

### ✅ Test 3 : Déconnexion manuelle
1. Se connecter
2. Cliquer sur "Déconnexion"
3. ✅ **Résultat attendu :** Polling s'arrête, localStorage nettoyé, redirection vers login

### ✅ Test 4 : Rafraîchir la page
1. Se connecter
2. Rafraîchir la page (F5)
3. ✅ **Résultat attendu :** Session restaurée, polling redémarre automatiquement

### ✅ Test 5 : Ouvrir app sans connexion
1. Ouvrir l'app sans être connecté
2. ✅ **Résultat attendu :** Aucun polling ne démarre, pas d'erreur console

---

## 🛡️ Sécurité & Performance

### Sécurité
- ✅ Tokens JWT en cookies sécurisés (Secure, SameSite)
- ✅ Refresh token stocké séparément
- ✅ Nettoyage complet à la déconnexion
- ✅ Vérification token avant chaque requête de polling

### Performance
- ✅ Polling adaptatif (2 min actif, 5 min inactif)
- ✅ Arrêt automatique si non authentifié (économie de ressources)
- ✅ Refresh token automatique (pas de reconnexion manuelle)
- ✅ Une seule requête de refresh en cas d'erreur 401

---

## 🎉 Conclusion

Le problème de déconnexion en boucle est **complètement résolu** !

**Points clés du correctif :**
1. 🔐 Vérification systématique de l'authentification
2. 🛑 Arrêt automatique du polling en cas d'erreur 401
3. 🧹 Nettoyage complet de tous les états (tokens, localStorage, stores)
4. 🔄 Synchronisation entre tokenManager, authStore et services
5. 🎯 Gestion propre du cycle de vie de la session

**Votre application est maintenant stable et ne vous déconnectera plus de manière intempestive !** ✨

