#!/usr/bin/env node

/**
 * Script utilitaire pour charger les variables d'environnement depuis un fichier .env
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour charger les variables d'environnement depuis un fichier .env
export function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const envContent = fs.readFileSync(filePath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    line = line.trim();
    
    // Ignorer les commentaires et les lignes vides
    if (line.startsWith('#') || line === '') {
      return;
    }

    // Parser les variables KEY=VALUE
    const equalIndex = line.indexOf('=');
    if (equalIndex > 0) {
      const key = line.substring(0, equalIndex).trim();
      const value = line.substring(equalIndex + 1).trim();
      
      // Supprimer les guillemets si présents
      const cleanValue = value.replace(/^["']|["']$/g, '');
      envVars[key] = cleanValue;
    }
  });

  return envVars;
}

// Charger les variables d'environnement depuis .env.local si il existe
const envLocalPath = path.join(__dirname, '..', 'env.local');
const envVars = loadEnvFile(envLocalPath);

// Appliquer les variables d'environnement
Object.entries(envVars).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
});

export default envVars;
