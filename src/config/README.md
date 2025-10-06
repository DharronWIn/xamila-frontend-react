# Configuration des Environnements

## 📁 Structure des fichiers

```
src/config/
├── environments.ts     # Tableau centralisé des environnements
├── environment.ts      # Logique de détection et gestion
└── README.md          # Cette documentation
```

## 🎯 **environments.ts** - Configuration centralisée

Ce fichier contient :
- **Types** : `Environment`, `EnvironmentConfig`
- **Tableau** : `environments` avec toutes les configurations
- **Utilitaires** : validation et listage des environnements

```typescript
export const environments = {
  development: {
    name: 'AY E-CAMPUS (Dev)',
    apiUrl: 'https://api.centralapis.com/api/v1',
    version: '1.0.0',
    debug: true,
  },
  // ...
};
```

## 🔧 **environment.ts** - Logique de gestion

Ce fichier contient :
- **Détection** : `getCurrentEnvironment()`
- **Configuration** : `getEnvironmentConfig()`
- **Utilitaires** : `getApiBaseUrl()`, `isDebugMode()`
- **Gestion** : `setEnvironment()`, `getPreferredEnvironment()`

## 🚀 **Avantages de cette organisation**

### ✅ **Séparation des responsabilités**
- `environments.ts` : Configuration pure
- `environment.ts` : Logique métier

### ✅ **Maintenance facilitée**
- Un seul endroit pour modifier les environnements
- Types partagés entre tous les fichiers

### ✅ **Réutilisabilité**
- Les scripts peuvent importer directement `environments.ts`
- Les composants utilisent la logique via `environment.ts`

## 📋 **Ordre de priorité**

1. **`VITE_APP_ENV`** (fichier `env.local`) - **PERSISTANT**
2. **`localStorage`** (interface utilisateur) - **TEMPORAIRE**
3. **Hostname** (détection automatique) - **FALLBACK**

## 🔄 **Modification des environnements**

Pour ajouter/modifier un environnement :

1. **Éditer** `src/config/environments.ts`
2. **Mettre à jour** les scripts dans `scripts/`
3. **Tester** avec `npm run env:list`

## 📝 **Exemple d'ajout d'environnement**

```typescript
// Dans environments.ts
export const environments = {
  // ... environnements existants
  staging: {
    name: 'AY E-CAMPUS (Staging)',
    apiUrl: 'https://staging-api.ay-ecampus.com/api',
    version: '1.0.0',
    debug: true,
  },
};
```

Puis mettre à jour les scripts et ajouter les commandes correspondantes.