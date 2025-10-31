// ==================== FINANCIAL CATEGORIES CONSTANTS ====================

export const INCOME_CATEGORIES = [
  'Salaires',
  'Dons',
  'Prime',
  'Autres'
] as const;

export const EXPENSE_CATEGORIES = [
  'Loyer',
  'Alimentation',
  'Éducation',
  'Santé',
  'Transport ou carburant',
  'Habillement',
  'Soins corporels',
  'Communication credit et internet',
  'Remboursement emprunt',
  'Épargne ou tontine',
  'Loisir',
  'Social',
  'Autre'
] as const;

export const ALL_CATEGORIES = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES
] as const;

export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type TransactionCategory = typeof ALL_CATEGORIES[number];

// Helper functions
export const getCategoriesByType = (type: 'INCOME' | 'EXPENSE'): readonly string[] => {
  return type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
};

export const isIncomeCategory = (category: string): boolean => {
  return INCOME_CATEGORIES.includes(category as IncomeCategory);
};

export const isExpenseCategory = (category: string): boolean => {
  return EXPENSE_CATEGORIES.includes(category as ExpenseCategory);
};

export const getCategoryType = (category: string): 'INCOME' | 'EXPENSE' | null => {
  if (isIncomeCategory(category)) return 'INCOME';
  if (isExpenseCategory(category)) return 'EXPENSE';
  return null;
};

// Category display names (for UI)
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'Salaires': 'Salaires',
  'Dons': 'Dons',
  'Prime': 'Prime',
  'Autres': 'Autres',
  'Loyer': 'Loyer',
  'Alimentation': 'Alimentation',
  'Éducation': 'Éducation',
  'Santé': 'Santé',
  'Transport ou carburant': 'Transport ou carburant',
  'Habillement': 'Habillement',
  'Soins corporels': 'Soins corporels',
  'Communication credit et internet': 'Communication credit et internet',
  'Remboursement emprunt': 'Remboursement emprunt',
  'Épargne ou tontine': 'Épargne ou tontine',
  'Loisir': 'Loisir',
  'Social': 'Social',
  'Autre': 'Autre'
};

// Category icons (for UI)
export const CATEGORY_ICONS: Record<string, string> = {
  'Salaires': '💼',
  'Dons': '🎁',
  'Prime': '⭐',
  'Autres': '💰',
  'Loyer': '🏠',
  'Alimentation': '🍽️',
  'Éducation': '📚',
  'Santé': '🏥',
  'Transport ou carburant': '🚗',
  'Habillement': '👕',
  'Soins corporels': '💄',
  'Communication credit et internet': '📱',
  'Remboursement emprunt': '💳',
  'Épargne ou tontine': '🐷',
  'Loisir': '🎮',
  'Social': '👥',
  'Autre': '📦'
};

// Category colors (for UI)
export const CATEGORY_COLORS: Record<string, string> = {
  'Salaires': '#10B981', // green
  'Dons': '#F59E0B', // amber
  'Prime': '#8B5CF6', // violet
  'Autres': '#6B7280', // gray
  'Loyer': '#EF4444', // red
  'Alimentation': '#F97316', // orange
  'Éducation': '#3B82F6', // blue
  'Santé': '#EC4899', // pink
  'Transport ou carburant': '#06B6D4', // cyan
  'Habillement': '#84CC16', // lime
  'Soins corporels': '#F43F5E', // rose
  'Communication credit et internet': '#8B5CF6', // violet
  'Remboursement emprunt': '#EF4444', // red
  'Épargne ou tontine': '#10B981', // green
  'Loisir': '#F59E0B', // amber
  'Social': '#06B6D4', // cyan
  'Autre': '#6B7280' // gray
};
