#!/usr/bin/env node

/**
 * Script pour construire l'application avec différents environnements
 * Compatible Windows et Unix
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environment = process.argv[2];

if (!environment) {
  console.error('❌ Veuillez spécifier un environnement: dev, preprod, ou prod');
  console.log('Usage: node scripts/build-env.js <environment>');
  process.exit(1);
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

console.log(`🚀 Construction pour l'environnement: ${fullEnvironment}`);

try {
  // Définir la variable d'environnement et construire
  const envVar = `VITE_APP_ENV=${fullEnvironment}`;
  
  // Commande compatible Windows et Unix
  const command = process.platform === 'win32' 
    ? `set ${envVar} && npm run build`
    : `${envVar} npm run build`;
    
  execSync(command, { 
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname, '..')
  });
  
  console.log(`✅ Construction terminée pour ${fullEnvironment}`);
} catch (error) {
  console.error(`❌ Erreur lors de la construction:`, error.message);
  process.exit(1);
}
