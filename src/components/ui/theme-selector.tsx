import { useState } from 'react';
import { useThemeStore, themeConfigs, type Theme } from '@/stores/themeStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Palette, Sparkles, Moon, Sun } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle, ThemeToggleSlider } from './theme-toggle';

interface ThemeSelectorProps {
  variant?: 'button' | 'card' | 'dropdown' | 'toggle' | 'slider';
  className?: string;
}

export function ThemeSelector({ variant = 'button', className }: ThemeSelectorProps) {
  const { currentTheme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
    setIsOpen(false);
  };

  if (variant === 'toggle') {
    return <ThemeToggle className={className} />;
  }

  if (variant === 'slider') {
    return <ThemeToggleSlider className={className} />;
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <Palette className="h-4 w-4 mr-2" />
            {themeConfigs[currentTheme].displayName}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {Object.entries(themeConfigs).map(([key, config]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => handleThemeChange(key as Theme)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{
                    backgroundColor: `hsl(${config.colors.primary})`,
                  }}
                />
                <span>{config.displayName}</span>
              </div>
              {currentTheme === key && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Choisir un thème</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(themeConfigs).map(([key, config]) => (
            <Card
              key={key}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                currentTheme === key
                  ? 'ring-2 ring-primary shadow-lg'
                  : 'hover:scale-105'
              }`}
              onClick={() => handleThemeChange(key as Theme)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    {key === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span>{config.displayName}</span>
                  </CardTitle>
                  {currentTheme === key && (
                    <Badge variant="default" className="text-xs">
                      Actuel
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {config.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {/* Aperçu des couleurs */}
                  <div className="flex space-x-1">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: `hsl(${config.colors.primary})` }}
                      title="Couleur principale"
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: `hsl(${config.colors.accent})` }}
                      title="Couleur d'accent"
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: `hsl(${config.colors.background})` }}
                      title="Arrière-plan"
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: `hsl(${config.colors.card})` }}
                      title="Carte"
                    />
                  </div>
                  
                  {/* Aperçu du gradient */}
                  <div
                    className="w-full h-8 rounded"
                    style={{ background: config.gradients.hero }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Variant button par défaut
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {Object.entries(themeConfigs).map(([key, config]) => (
        <Button
          key={key}
          variant={currentTheme === key ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleThemeChange(key as Theme)}
          className="flex items-center space-x-2"
        >
          <div
            className="w-3 h-3 rounded-full border"
            style={{
              backgroundColor: `hsl(${config.colors.primary})`,
            }}
          />
          <span>{config.displayName}</span>
          {currentTheme === key && <Check className="h-3 w-3" />}
        </Button>
      ))}
    </div>
  );
}

// Composant pour afficher un aperçu rapide des thèmes
export function ThemePreview() {
  const { currentTheme, getCurrentThemeConfig } = useThemeStore();
  const config = getCurrentThemeConfig();

  return (
    <div className="p-4 rounded-lg border" style={{ backgroundColor: `hsl(${config.colors.card})` }}>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: `hsl(${config.colors.primary})` }}
          />
          <span className="font-medium" style={{ color: `hsl(${config.colors.foreground})` }}>
            {config.displayName}
          </span>
        </div>
        
        <div
          className="h-16 rounded"
          style={{ background: config.gradients.hero }}
        />
        
        <div className="space-y-2">
          <div
            className="h-3 rounded"
            style={{ backgroundColor: `hsl(${config.colors.primary})` }}
          />
          <div
            className="h-3 rounded w-3/4"
            style={{ backgroundColor: `hsl(${config.colors.accent})` }}
          />
          <div
            className="h-3 rounded w-1/2"
            style={{ backgroundColor: `hsl(${config.colors.muted})` }}
          />
        </div>
      </div>
    </div>
  );
}
