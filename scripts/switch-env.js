#!/usr/bin/env node

/**
 * Script simple pour changer d'environnement
 * Utilise uniquement le tableau d'environnements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnvFile } from './load-env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environment = process.argv[2];

if (!environment) {
  console.log('🌍 Changer d\'environnement');
  console.log('');
  console.log('Usage: node scripts/switch-env.js <environment>');
  console.log('');
  console.log('Environnements disponibles:');
  console.log('  dev       - Développement (localhost:3000)');
  console.log('  preprod   - Préproduction (preprod-api.ay-ecampus.com)');
  console.log('  prod      - Production (api.centralapis.com)');
  console.log('');
  console.log('Exemples:');
  console.log('  node scripts/switch-env.js dev');
  console.log('  node scripts/switch-env.js preprod');
  console.log('  node scripts/switch-env.js prod');
  process.exit(0);
}

const validEnvironments = ['dev', 'preprod', 'prod'];
if (!validEnvironments.includes(environment)) {
  console.error(`❌ Environnement invalide: ${environment}`);
  console.log('Environnements valides:', validEnvironments.join(', '));
  process.exit(1);
}

// Mapping des environnements
const envMapping = {
  dev: 'development',
  preprod: 'preproduction', 
  prod: 'production'
};

const fullEnvironment = envMapping[environment];

// Charger les variables d'environnement depuis .env.local si il existe
const envLocalPath = path.join(__dirname, '..', 'env.local');
const envVars = loadEnvFile(envLocalPath);

// Appliquer les variables d'environnement
Object.entries(envVars).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
});

// Configuration des environnements avec variables d'environnement
const environments = {
  development: {
    name: 'Challenge Épargne (Development)',
    apiUrl: process.env.VITE_API_URL_DEV || 'http://localhost:3007/api',
    version: process.env.VITE_APP_VERSION || '1.0.0',
    debug: process.env.VITE_DEBUG === 'true' || process.env.VITE_DEBUG === true || true,
  },
  preproduction: {
    name: 'Challenge Épargne (Preproduction)',
    apiUrl: process.env.VITE_API_URL_PREPROD || 'https://preprod-api.ay-ecampus.com/api',
    version: process.env.VITE_APP_VERSION || '1.0.0',
    debug: process.env.VITE_DEBUG === 'true' || process.env.VITE_DEBUG === true || true,
  },
  production: {
    name: 'Challenge Épargne (Production)',
    apiUrl: process.env.VITE_API_URL_PROD || 'https://xamila-app-backend-nestjs.onrender.com/api',
    version: process.env.VITE_APP_VERSION || '1.0.0',
    debug: process.env.VITE_DEBUG === 'true' || process.env.VITE_DEBUG === true || false,
  },
};

const config = environments[fullEnvironment];

console.log(`🔄 Changement d'environnement vers: ${fullEnvironment}`);
console.log(`📋 Configuration:`);
console.log(`   Nom: ${config.name}`);
console.log(`   URL API: ${config.apiUrl}`);
console.log(`   Debug: ${config.debug ? 'Activé' : 'Désactivé'}`);
console.log('');

// Sauvegarder dans un fichier .env.local pour persistance
const envContent = `# Environnement actuel (sauvegardé automatiquement)
VITE_APP_ENV=${fullEnvironment}

# URLs des APIs pour chaque environnement
VITE_API_URL_DEV=${environments.development.apiUrl}
VITE_API_URL_PREPROD=${environments.preproduction.apiUrl}
VITE_API_URL_PROD=${environments.production.apiUrl}

# Configuration de l'application
VITE_APP_NAME=Challenge Épargne
VITE_APP_VERSION=${config.version}

# Mode debug (true/false)
VITE_DEBUG=${config.debug}
`;

const envFilePath = path.join(__dirname, '..', 'env.local');
try {
  fs.writeFileSync(envFilePath, envContent);
  console.log('💾 Environnement sauvegardé dans env.local');
} catch (error) {
  console.log('⚠️  Impossible de sauvegarder dans env.local:', error.message);
}

console.log('');
console.log('✅ Environnement configuré !');
console.log('💾 L\'environnement est sauvegardé et persistera même après effacement du navigateur.');
console.log('🚀 Lancez maintenant: npm run dev');
console.log('');
console.log('💡 L\'environnement sera automatiquement détecté par l\'application.');
