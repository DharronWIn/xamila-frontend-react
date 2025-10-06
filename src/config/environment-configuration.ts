/**
 * Configuration des environnements pour l'application
 */

import {
  Environment,
  EnvironmentConfig,
  environments
} from './environments';

// Fonction pour obtenir l'environnement actuel
export function getCurrentEnvironment(): Environment {
  // 1. Vérifier les variables d'environnement Vite (priorité maximale - persistant)
  const viteEnv = (import.meta as any).env?.VITE_APP_ENV as Environment;
  if (viteEnv && environments[viteEnv]) {
    console.log(`🔧 Environnement détecté via VITE_APP_ENV (fichier env.local): ${viteEnv}`);
    return viteEnv;
  }

  // 2. Vérifier l'environnement préféré en localStorage (temporaire)
  const preferred = getPreferredEnvironment();
  if (preferred) {
    console.log(`💾 Environnement préféré utilisé (localStorage): ${preferred}`);
    return preferred;
  }

  // 3. Déterminer basé sur l'URL de la page (méthode par défaut)
  const hostname = window.location.hostname;
  console.log(`🌐 Hostname détecté: ${hostname}`);
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log(`✅ Environnement détecté via hostname: development`);
    return 'development';
  } else if (hostname.includes('preprod') || hostname.includes('staging')) {
    console.log(`✅ Environnement détecté via hostname: preproduction`);
    return 'preproduction';
  } else {
    console.log(`✅ Environnement détecté via hostname: production`);
    return 'production';
  }
}

// Fonction pour obtenir la configuration de l'environnement actuel
export function getEnvironmentConfig(): EnvironmentConfig {
  const currentEnv = getCurrentEnvironment();
  const config = environments[currentEnv];
  // console.log(`📋 Configuration utilisée:`, {
  //   environnement: currentEnv,
  //   nom: config.name,
  //   apiUrl: config.apiUrl,
  //   debug: config.debug
  // });
  return config;
}

// Fonction pour obtenir l'URL de base de l'API
export function getApiBaseUrl(): string {
  const config = getEnvironmentConfig();
  return config.apiUrl;
}

// Fonction pour vérifier si on est en mode debug
export function isDebugMode(): boolean {
  const config = getEnvironmentConfig();
  return config.debug;
}

// Export de la configuration actuelle pour utilisation directe
export const currentConfig = getEnvironmentConfig();
export const currentEnvironment = getCurrentEnvironment();
export const apiBaseUrl = getApiBaseUrl();

// Export des environnements pour le composant switcher
export { environments };

// Fonction simple pour changer d'environnement (stockage en localStorage)
export function setEnvironment(env: Environment): void {
  if (environments[env]) {
    localStorage.setItem('preferred_environment', env);
    console.log(`🔄 Environnement changé vers: ${env}`);
    console.log(`📋 Nouvelle configuration:`, environments[env]);
    // Recharger la page pour appliquer les changements
    window.location.reload();
  } else {
    console.error(`❌ Environnement invalide: ${env}`);
  }
}

// Fonction pour obtenir l'environnement préféré depuis localStorage
export function getPreferredEnvironment(): Environment | null {
  const preferred = localStorage.getItem('preferred_environment') as Environment;
  if (preferred && environments[preferred]) {
    console.log(`💾 Environnement préféré trouvé: ${preferred}`);
    return preferred;
  }
  return null;
}
