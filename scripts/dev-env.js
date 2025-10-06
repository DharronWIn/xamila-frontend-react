#!/usr/bin/env node

/**
 * Script pour lancer le serveur de développement avec différents environnements
 * Compatible Windows et Unix
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environment = process.argv[2];

if (!environment) {
  console.error('❌ Veuillez spécifier un environnement: preprod ou prod');
  console.log('Usage: node scripts/dev-env.js <environment>');
  process.exit(1);
}

const validEnvironments = ['preprod', 'prod'];
if (!validEnvironments.includes(environment)) {
  console.error(`❌ Environnement invalide: ${environment}`);
  console.log('Environnements valides:', validEnvironments.join(', '));
  process.exit(1);
}

// Mapping des environnements
const envMapping = {
  preprod: 'preproduction',
  prod: 'production'
};

const fullEnvironment = envMapping[environment];

console.log(`🚀 Lancement du serveur de développement pour l'environnement: ${fullEnvironment}`);

try {
  // Définir la variable d'environnement
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
