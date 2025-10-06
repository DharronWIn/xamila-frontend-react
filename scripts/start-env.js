#!/usr/bin/env node

/**
 * Script pour lancer le serveur avec un environnement spécifique
 * Utilise uniquement le tableau d'environnements
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnvFile } from './load-env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environment = process.argv[2];

if (!environment) {
  console.log('🚀 Lancer le serveur avec un environnement spécifique');
  console.log('');
  console.log('Usage: node scripts/start-env.js <environment>');
  console.log('');
  console.log('Environnements disponibles:');
  console.log('  dev       - Développement (localhost:3000)');
  console.log('  preprod   - Préproduction (preprod-api.ay-ecampus.com)');
  console.log('  prod      - Production (api.centralapis.com)');
  console.log('');
  console.log('Exemples:');
  console.log('  node scripts/start-env.js dev');
  console.log('  node scripts/start-env.js preprod');
  console.log('  node scripts/start-env.js prod');
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
    apiUrl: process.env.VITE_API_URL_PROD || 'https://api.centralapis.com/api/v1',
    version: process.env.VITE_APP_VERSION || '1.0.0',
    debug: process.env.VITE_DEBUG === 'true' || process.env.VITE_DEBUG === true || false,
  },
};

const config = environments[fullEnvironment];

console.log(`🚀 Lancement du serveur pour l'environnement: ${fullEnvironment}`);
console.log(`📋 Configuration:`);
console.log(`   Nom: ${config.name}`);
console.log(`   URL API: ${config.apiUrl}`);
console.log(`   Debug: ${config.debug ? 'Activé' : 'Désactivé'}`);
console.log('');

try {
  // Définir la variable d'environnement pour forcer l'environnement
  const env = {
    ...process.env,
    VITE_APP_ENV: fullEnvironment
  };
  
  // Lancer Vite avec la variable d'environnement
  const viteProcess = spawn('npx', ['vite', '--host'], {
    env,
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname, '..')
  });
  
  // Gérer l'arrêt du processus
  process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt du serveur de développement...');
    viteProcess.kill('SIGINT');
    process.exit(0);
  });
  
  viteProcess.on('close', (code) => {
    console.log(`✅ Serveur de développement arrêté avec le code: ${code}`);
    process.exit(code);
  });
  
} catch (error) {
  console.error(`❌ Erreur lors du lancement:`, error.message);
  process.exit(1);
}
