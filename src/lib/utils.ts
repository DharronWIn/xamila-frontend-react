import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "./apiComponent/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retourne l'URL de la photo de profil de l'utilisateur
 * Priorité : pictureProfilUrl > avatar > avatar généré par initiales
 */
export function getUserProfilePicture(user: User | null | undefined): string | undefined {
  if (!user) return undefined;
  
  // Priorité 1: pictureProfilUrl
  if (user.pictureProfilUrl && user.pictureProfilUrl.trim() !== '') {
    return user.pictureProfilUrl;
  }
  
  // Priorité 3: générer un avatar basé sur les initiales
  if (user.firstName && user.lastName) {
    return generateAvatarFromInitials(`${user.firstName} ${user.lastName}`);
  } else if (user.name) {
    return generateAvatarFromInitials(user.name);
  }
  
  return undefined;
}

/**
 * Génère une URL d'avatar basée sur les initiales du nom
 * Utilise l'API avatar.iran.liara.run
 */
export function generateAvatarFromInitials(name: string): string {
  // Nettoyer le nom et extraire les initiales
  const cleanName = name.trim().replace(/\s+/g, ' ');
  const initials = cleanName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2); // Maximum 2 initiales
  
  // Encoder le nom pour l'URL
  const encodedName = encodeURIComponent(cleanName);
  
  // Retourner l'URL de l'API d'avatar
  return `https://avatar.iran.liara.run/username?username=${encodedName}`;
}
