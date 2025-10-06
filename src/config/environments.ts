/**
 * Configuration des environnements
 * Tableau centralisé des environnements disponibles
 */

export type Environment = 'development' | 'preproduction' | 'production';

export interface EnvironmentConfig {
  name: string;
  apiUrl: string;
  version: string;
  debug: boolean;
}

// Fonction pour obtenir l'URL API depuis les variables d'environnement
function getApiUrl(env: Environment): string {
  const envVar = `VITE_API_URL_${env.toUpperCase().substring(0, 3)}`;
  const url = (import.meta as any).env?.[envVar];
  
  if (url) {
    console.log(`🔧 URL API chargée depuis ${envVar}: ${url}`);
    return url;
  }
  
  // URLs par défaut si les variables d'environnement ne sont pas définies
  const defaultUrls = {
    development: 'http://localhost:3007/api',
    preproduction: 'https://preprod-api.ay-ecampus.com/api',
    production: 'https://api.centralapis.com/api/v1',
  };
  
  console.log(`⚠️ Variable ${envVar} non trouvée, utilisation de l'URL par défaut: ${defaultUrls[env]}`);
  return defaultUrls[env];
}

// Fonction pour obtenir le nom de l'application depuis les variables d'environnement
function getAppName(): string {
  const name = (import.meta as any).env?.VITE_APP_NAME;
  return name || 'Challenge Épargne';
}

// Fonction pour obtenir la version depuis les variables d'environnement
function getAppVersion(): string {
  const version = (import.meta as any).env?.VITE_APP_VERSION;
  return version || '1.0.0';
}

// Fonction pour obtenir le mode debug depuis les variables d'environnement
function getDebugMode(env: Environment): boolean {
  const debug = (import.meta as any).env?.VITE_DEBUG;
  if (debug !== undefined) {
    return debug === 'true' || debug === true;
  }
  
  // Mode debug par défaut selon l'environnement
  return env !== 'production';
}

// Configuration par défaut pour chaque environnement
export const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    name: `${getAppName()} (Development)`,
    apiUrl: getApiUrl('development'),
    version: getAppVersion(),
    debug: getDebugMode('development'),
  },
  preproduction: {
    name: `${getAppName()} (Preproduction)`,
    apiUrl: getApiUrl('preproduction'),
    version: getAppVersion(),
    debug: getDebugMode('preproduction'),
  },
  production: {
    name: `${getAppName()} (Production)`,
    apiUrl: getApiUrl('production'),
    version: getAppVersion(),
    debug: getDebugMode('production'),
  },
};

// Export des clés d'environnement pour validation
export const environmentKeys: Environment[] = Object.keys(environments) as Environment[];

// Fonction utilitaire pour valider un environnement
export function isValidEnvironment(env: string): env is Environment {
  return environmentKeys.includes(env as Environment);
}

// Fonction utilitaire pour obtenir la liste des environnements
export function getAvailableEnvironments(): Environment[] {
  return environmentKeys;
}
