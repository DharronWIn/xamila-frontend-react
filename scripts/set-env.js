#!/usr/bin/env node

/**
 * Script simple pour changer d'environnement en copiant le bon fichier .env
 * Compatible Windows et Unix
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environment = process.argv[2];

if (!environment) {
  console.error('❌ Veuillez spécifier un environnement: dev, preprod, ou prod');
  console.log('Usage: node scripts/set-env.js <environment>');
  process.exit(1);
}

const validEnvironments = ['dev', 'preprod', 'prod'];
if (!validEnvironments.includes(environment)) {
  console.error(`❌ Environnement invalide: ${environment}`);
  console.log('Environnements valides:', validEnvironments.join(', '));
  process.exit(1);
}

const projectRoot = path.resolve(__dirname, '..');
const sourceFile = path.join(projectRoot, `env.${environment}`);
const targetFile = path.join(projectRoot, '.env.local');

try {
  // Vérifier que le fichier source existe
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Fichier d'environnement non trouvé: ${sourceFile}`);
    process.exit(1);
  }

  // Copier le fichier
  fs.copyFileSync(sourceFile, targetFile);
  
  console.log(`✅ Environnement changé vers: ${environment}`);
  console.log(`📁 Fichier copié: ${sourceFile} → ${targetFile}`);
  console.log('🔄 Redémarrez votre serveur de développement pour appliquer les changements');
  
} catch (error) {
  console.error(`❌ Erreur lors du changement d'environnement:`, error.message);
  process.exit(1);
}
