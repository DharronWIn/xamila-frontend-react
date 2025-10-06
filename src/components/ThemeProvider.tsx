import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { currentTheme, setTheme } = useThemeStore();

  useEffect(() => {
    // Appliquer le thème au chargement de l'application
    setTheme(currentTheme);
  }, []); // Seulement au montage du composant

  // Appliquer le thème quand il change
  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme, setTheme]);

  return <>{children}</>;
}

// Hook pour utiliser le thème dans les composants
export function useTheme() {
  const { currentTheme, setTheme, getCurrentThemeConfig } = useThemeStore();
  
  return {
    currentTheme,
    setTheme,
    themeConfig: getCurrentThemeConfig(),
  };
}
