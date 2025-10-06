# Modifications de l'API Client - Gestion des Routes Publiques

## Problème résolu

L'API client bloquait toutes les requêtes lorsque le token était expiré, même pour les routes publiques qui ne nécessitent pas d'authentification. Cela empêchait l'accès aux endpoints publics comme `/auth/login` ou `/auth/register`.

## Solution implémentée

### 1. Modification du comportement de l'API client

- **Avant** : Si le token était expiré, l'API client levait une erreur et bloquait la requête
- **Après** : L'API client envoie toujours le token s'il est disponible (même expiré), mais laisse le backend décider si le token est requis

### 2. Nouvelle option `isPublicRoute`

Ajout d'une option `isPublicRoute` pour distinguer les routes publiques des routes protégées :

```typescript
interface ApiOptions<T = any> {
  body?: T;
  headers?: Record<string, string>;
  token?: string;
  schema?: ZodSchema;
  isPublicRoute?: boolean; // NOUVEAU
}
```

### 3. Comportement différencié selon le type de route

#### Routes protégées (comportement par défaut)
- Si token expiré → tentative de refresh automatique
- Si refresh échoue → redirection vers login
- Si erreur 401 → gestion automatique de l'expiration

#### Routes publiques (`isPublicRoute: true`)
- Token envoyé s'il existe (même expiré)
- Pas de tentative de refresh automatique
- Pas de redirection automatique sur erreur 401
- Le backend décide si le token est nécessaire

## Utilisation

### API directe

```typescript
// Route protégée (comportement par défaut)
const userData = await api.get<User>('/auth/user');

// Route publique
const publicData = await api.get<PublicData>('/public/data', { 
  isPublicRoute: true 
});

// Route publique avec validation
const response = await api.post<LoginResponse, LoginData>('/auth/login', loginData, { 
  schema: loginResponseSchema,
  isPublicRoute: true 
});
```

### Hooks React

```typescript
// Route protégée
const { data, loading, error } = useGet<User>('/auth/user');

// Route publique
const { execute: login } = usePost<LoginResponse>('/auth/login', { 
  isPublicRoute: true 
});
```

## Exemple concret

La page de login a été mise à jour pour utiliser cette nouvelle option :

```javascript
// Avant
const { execute: loginExecute } = usePost(endpoints.login)

// Après
const { execute: loginExecute } = usePost(endpoints.login, { isPublicRoute: true })
```

## Avantages

1. **Flexibilité** : Le backend contrôle quelles routes nécessitent une authentification
2. **Robustesse** : Les routes publiques fonctionnent même avec un token expiré
3. **Transparence** : Le token est toujours envoyé quand disponible
4. **Rétrocompatibilité** : Le comportement par défaut reste inchangé pour les routes existantes

## Migration

Pour migrer les routes existantes vers ce nouveau système :

1. **Routes publiques** : Ajouter `{ isPublicRoute: true }` aux appels d'API
2. **Routes protégées** : Aucun changement nécessaire (comportement par défaut)

## Tests recommandés

- [ ] Login avec token expiré → doit fonctionner
- [ ] Signup sans token → doit fonctionner  
- [ ] Routes protégées avec token valide → doit fonctionner
- [ ] Routes protégées avec token expiré → refresh automatique
- [ ] Routes protégées sans token → redirection vers login
