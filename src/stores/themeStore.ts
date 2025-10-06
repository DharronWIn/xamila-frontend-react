import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  name: string;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    muted: string;
    border: string;
    sidebar: {
      background: string;
      foreground: string;
      primary: string;
      accent: string;
      border: string;
    };
  };
  gradients: {
    primary: string;
    accent: string;
    hero: string;
  };
}

export const themeConfigs: Record<Theme, ThemeConfig> = {
  light: {
    name: 'light',
    displayName: 'Clair',
    description: 'Thème clair et professionnel',
    colors: {
      primary: '142 76% 36%',
      secondary: '213 100% 96%',
      accent: '213 85% 55%',
      background: '0 0% 99%',
      foreground: '210 15% 15%',
      card: '0 0% 100%',
      muted: '210 40% 96%',
      border: '214 31% 91%',
      sidebar: {
        background: '0 0% 99%',
        foreground: '210 15% 25%',
        primary: '142 76% 36%',
        accent: '210 40% 96%',
        border: '214 31% 91%',
      },
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(142 76% 36%), hsl(142 65% 45%))',
      accent: 'linear-gradient(135deg, hsl(213 85% 55%), hsl(213 75% 65%))',
      hero: 'linear-gradient(135deg, hsl(142 76% 36%) 0%, hsl(213 85% 55%) 100%)',
    },
  },
  dark: {
    name: 'dark',
    displayName: 'Sombre',
    description: 'Thème sombre épuré style Discord',
    colors: {
      primary: '235 86% 65%',
      secondary: '220 13% 18%',
      accent: '235 86% 65%',
      background: '220 13% 9%',
      foreground: '220 13% 95%',
      card: '220 13% 11%',
      muted: '220 13% 15%',
      border: '220 13% 20%',
      sidebar: {
        background: '220 13% 9%',
        foreground: '220 13% 90%',
        primary: '235 86% 65%',
        accent: '220 13% 15%',
        border: '220 13% 20%',
      },
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(235 86% 65%), hsl(235 80% 70%))',
      accent: 'linear-gradient(135deg, hsl(235 86% 65%), hsl(235 80% 70%))',
      hero: 'linear-gradient(135deg, hsl(235 86% 65%) 0%, hsl(220 13% 20%) 100%)',
    },
  },
};

interface ThemeStore {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  getCurrentThemeConfig: () => ThemeConfig;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: 'light',
      toggleTheme: () => {
        const newTheme = get().currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
      setTheme: (theme: Theme) => {
        set({ currentTheme: theme });
        // Appliquer le thème au document
        const themeConfig = themeConfigs[theme];
        const root = document.documentElement;
        
        // Mettre à jour les variables CSS principales
        root.style.setProperty('--primary', themeConfig.colors.primary);
        root.style.setProperty('--secondary', themeConfig.colors.secondary);
        root.style.setProperty('--accent', themeConfig.colors.accent);
        root.style.setProperty('--background', themeConfig.colors.background);
        root.style.setProperty('--foreground', themeConfig.colors.foreground);
        root.style.setProperty('--card', themeConfig.colors.card);
        root.style.setProperty('--muted', themeConfig.colors.muted);
        root.style.setProperty('--border', themeConfig.colors.border);
        root.style.setProperty('--gradient-primary', themeConfig.gradients.primary);
        root.style.setProperty('--gradient-accent', themeConfig.gradients.accent);
        root.style.setProperty('--gradient-hero', themeConfig.gradients.hero);
        
        // Mettre à jour les variables CSS de la sidebar
        root.style.setProperty('--sidebar-background', themeConfig.colors.sidebar.background);
        root.style.setProperty('--sidebar-foreground', themeConfig.colors.sidebar.foreground);
        root.style.setProperty('--sidebar-primary', themeConfig.colors.sidebar.primary);
        root.style.setProperty('--sidebar-accent', themeConfig.colors.sidebar.accent);
        root.style.setProperty('--sidebar-border', themeConfig.colors.sidebar.border);
        
        // Mettre à jour les couleurs dérivées
        const primaryHsl = themeConfig.colors.primary.split(' ');
        const primaryH = parseInt(primaryHsl[0]);
        const primaryS = parseInt(primaryHsl[1].replace('%', ''));
        const primaryL = parseInt(primaryHsl[2].replace('%', ''));
        
        root.style.setProperty('--primary-foreground', primaryL > 50 ? '0 0% 0%' : '0 0% 100%');
        root.style.setProperty('--primary-light', `${primaryH} ${Math.max(0, primaryS - 10)}% ${Math.min(100, primaryL + 10)}%`);
        root.style.setProperty('--primary-dark', `${primaryH} ${Math.min(100, primaryS + 10)}% ${Math.max(0, primaryL - 10)}%`);
        
        const accentHsl = themeConfig.colors.accent.split(' ');
        const accentH = parseInt(accentHsl[0]);
        const accentS = parseInt(accentHsl[1].replace('%', ''));
        const accentL = parseInt(accentHsl[2].replace('%', ''));
        
        root.style.setProperty('--accent-foreground', accentL > 50 ? '0 0% 0%' : '0 0% 100%');
        root.style.setProperty('--accent-light', `${accentH} ${Math.max(0, accentS - 10)}% ${Math.min(100, accentL + 10)}%`);
        root.style.setProperty('--accent-dark', `${accentH} ${Math.min(100, accentS + 10)}% ${Math.max(0, accentL - 10)}%`);
      },
      getCurrentThemeConfig: () => themeConfigs[get().currentTheme],
    }),
    {
      name: 'theme-storage',
    }
  )
);
