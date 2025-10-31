import { UserRank, TrophyRarity, RANK_EMOJIS, RANK_COLORS, RANK_LABELS, RARITY_COLORS, RARITY_LABELS } from '@/types/gamification';

// ==================== RANK HELPERS ====================

/**
 * Obtient l'icône d'un rang
 */
export const getRankIcon = (rank: UserRank): string => {
  return RANK_EMOJIS[rank] || RANK_EMOJIS.NOVICE;
};

/**
 * Obtient la couleur d'un rang
 */
export const getRankColor = (rank: UserRank): string => {
  return RANK_COLORS[rank] || RANK_COLORS.NOVICE;
};

/**
 * Obtient le label d'un rang (en français)
 */
export const getRankLabel = (rank: UserRank): string => {
  return RANK_LABELS[rank]?.fr || RANK_LABELS.NOVICE.fr;
};

/**
 * Obtient le label d'un rang (en anglais)
 */
export const getRankLabelEn = (rank: UserRank): string => {
  return RANK_LABELS[rank]?.en || RANK_LABELS.NOVICE.en;
};

/**
 * Formate un rang pour l'affichage
 */
export const formatRank = (rank: UserRank, lang: 'fr' | 'en' = 'fr'): string => {
  return lang === 'fr' ? getRankLabel(rank) : getRankLabelEn(rank);
};

// ==================== RARITY HELPERS ====================

/**
 * Obtient la couleur d'une rareté
 */
export const getRarityColor = (rarity: TrophyRarity): string => {
  return RARITY_COLORS[rarity] || RARITY_COLORS.COMMON;
};

/**
 * Obtient le label d'une rareté (en français)
 */
export const getRarityLabel = (rarity: TrophyRarity): string => {
  return RARITY_LABELS[rarity]?.fr || RARITY_LABELS.COMMON.fr;
};

/**
 * Obtient le label d'une rareté (en anglais)
 */
export const getRarityLabelEn = (rarity: TrophyRarity): string => {
  return RARITY_LABELS[rarity]?.en || RARITY_LABELS.COMMON.en;
};

/**
 * Formate une rareté pour l'affichage
 */
export const formatRarity = (rarity: TrophyRarity, lang: 'fr' | 'en' = 'fr'): string => {
  return lang === 'fr' ? getRarityLabel(rarity) : getRarityLabelEn(rarity);
};

// ==================== XP HELPERS ====================

/**
 * Formate un montant d'XP
 */
export const formatXP = (xp: number): string => {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M XP`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K XP`;
  }
  return `${xp} XP`;
};

/**
 * Calcule le pourcentage de progression vers le niveau suivant
 */
export const calculateLevelProgress = (currentXP: number, xpToNextLevel: number): number => {
  const totalXPForLevel = currentXP + xpToNextLevel;
  return totalXPForLevel > 0 ? (currentXP / totalXPForLevel) * 100 : 0;
};

// ==================== LEVEL HELPERS ====================

/**
 * Obtient le rang basé sur le niveau
 */
export const getRankFromLevel = (level: number): UserRank => {
  if (level >= 50) return 'LEGEND';
  if (level >= 30) return 'MASTER';
  if (level >= 20) return 'EXPERT';
  if (level >= 10) return 'APPRENTICE';
  return 'NOVICE';
};

/**
 * Obtient le prochain rang
 */
export const getNextRank = (currentRank: UserRank): UserRank | null => {
  const ranks: UserRank[] = ['NOVICE', 'APPRENTICE', 'EXPERT', 'MASTER', 'LEGEND'];
  const currentIndex = ranks.indexOf(currentRank);
  return currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : null;
};

/**
 * Obtient le niveau requis pour un rang
 */
export const getLevelForRank = (rank: UserRank): number => {
  switch (rank) {
    case 'NOVICE': return 1;
    case 'APPRENTICE': return 10;
    case 'EXPERT': return 20;
    case 'MASTER': return 30;
    case 'LEGEND': return 50;
  }
};

// ==================== TROPHY HELPERS ====================

/**
 * Filtre les trophées par catégorie
 */
export const filterTrophiesByCategory = (trophies: any[], category: string) => {
  return trophies.filter(t => t.trophy.category === category);
};

/**
 * Filtre les trophées par rareté
 */
export const filterTrophiesByRarity = (trophies: any[], rarity: TrophyRarity) => {
  return trophies.filter(t => t.trophy.rarity === rarity);
};

/**
 * Trie les trophées par date de déverrouillage
 */
export const sortTrophiesByUnlockDate = (trophies: any[]) => {
  return [...trophies].sort((a, b) => 
    new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
  );
};

// ==================== FORMATTING HELPERS ====================

/**
 * Formate une date relative (ex: "Il y a 2h")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'À l\'instant';
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
  if (diffInHours < 24) return `Il y a ${diffInHours}h`;
  if (diffInDays === 1) return 'Hier';
  if (diffInDays < 7) return `Il y a ${diffInDays}j`;
  
  return date.toLocaleDateString('fr-FR');
};

/**
 * Formate une date complète
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formate un montant monétaire
 */
export const formatAmount = (amount: number, currency: string = 'XOF'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formate un pourcentage
 */
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

// ==================== VALIDATION HELPERS ====================

/**
 * Vérifie si un rang est valide
 */
export const isValidRank = (rank: string): rank is UserRank => {
  return ['NOVICE', 'APPRENTICE', 'EXPERT', 'MASTER', 'LEGEND'].includes(rank);
};

/**
 * Vérifie si une rareté est valide
 */
export const isValidRarity = (rarity: string): rarity is TrophyRarity => {
  return ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(rarity);
};

// ==================== GAMIFICATION STATE HELPERS ====================

/**
 * Vérifie si l'utilisateur a gagné un niveau
 */
export const hasLeveledUp = (oldLevel: number, newLevel: number): boolean => {
  return newLevel > oldLevel;
};

/**
 * Vérifie si l'utilisateur a changé de rang
 */
export const hasRankChanged = (oldRank: UserRank, newRank: UserRank): boolean => {
  return oldRank !== newRank;
};

/**
 * Calcule le nombre d'XP gagnés
 */
export const calculateXPGained = (oldXP: number, newXP: number): number => {
  return Math.max(0, newXP - oldXP);
};

// ==================== EXPORT ALL ====================

export const gamificationHelpers = {
  // Rank
  getRankIcon,
  getRankColor,
  getRankLabel,
  getRankLabelEn,
  formatRank,
  
  // Rarity
  getRarityColor,
  getRarityLabel,
  getRarityLabelEn,
  formatRarity,
  
  // XP
  formatXP,
  calculateLevelProgress,
  
  // Level
  getRankFromLevel,
  getNextRank,
  getLevelForRank,
  
  // Trophy
  filterTrophiesByCategory,
  filterTrophiesByRarity,
  sortTrophiesByUnlockDate,
  
  // Formatting
  formatRelativeTime,
  formatDate,
  formatAmount,
  formatPercentage,
  
  // Validation
  isValidRank,
  isValidRarity,
  
  // State
  hasLeveledUp,
  hasRankChanged,
  calculateXPGained,
};
