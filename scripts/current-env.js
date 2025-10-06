#!/usr/bin/env node

/**
 * Script pour afficher l'environnement actuel
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnvFile } from './load-env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

console.log('🌍 Environnements disponibles:');
console.log('');

Object.entries(environments).forEach(([key, config]) => {
  console.log(`📋 ${key.toUpperCase()}:`);
  console.log(`   Nom: ${config.name}`);
  console.log(`   URL API: ${config.apiUrl}`);
  console.log(`   Debug: ${config.debug ? 'Activé' : 'Désactivé'}`);
  console.log('');
});

console.log('💡 Pour changer d\'environnement:');
console.log('   npm run env:dev      - Développement');
console.log('   npm run env:preprod  - Préproduction');
console.log('   npm run env:prod     - Production');
console.log('');
console.log('💡 Pour lancer avec un environnement spécifique:');
console.log('   npm run dev:dev      - Serveur + dev');
console.log('   npm run dev:preprod  - Serveur + preprod');
console.log('   npm run dev:prod     - Serveur + prod');
