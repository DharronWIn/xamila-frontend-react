import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ 
  variant = 'outline', 
  size = 'default', 
  className,
  showLabel = true 
}: ThemeToggleProps) {
  const { currentTheme, toggleTheme } = useThemeStore();
  const isDark = currentTheme === 'dark';

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn(
          "relative overflow-hidden transition-all duration-300 hover:scale-105",
          isDark ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
          className
        )}
        title={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
      >
        <div className="relative w-5 h-5">
          <Sun 
            className={cn(
              "absolute inset-0 transition-all duration-300",
              isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
            )}
          />
          <Moon 
            className={cn(
              "absolute inset-0 transition-all duration-300",
              isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
            )}
          />
        </div>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-105 group",
        isDark ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent",
        className
      )}
    >
      <div className="flex items-center space-x-2">
        <div className="relative w-4 h-4">
          <Sun 
            className={cn(
              "absolute inset-0 transition-all duration-300",
              isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
            )}
          />
          <Moon 
            className={cn(
              "absolute inset-0 transition-all duration-300",
              isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
            )}
          />
        </div>
        {showLabel && (
          <span className="transition-all duration-300">
            {isDark ? 'Mode sombre' : 'Mode clair'}
          </span>
        )}
      </div>
    </Button>
  );
}

// Variante avec animation de glissement
export function ThemeToggleSlider({ className }: { className?: string }) {
  const { currentTheme, toggleTheme } = useThemeStore();
  const isDark = currentTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-14 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isDark ? "bg-primary" : "bg-muted",
        className
      )}
      title={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
    >
      {/* Slider */}
      <div
        className={cn(
          "absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 flex items-center justify-center",
          isDark ? "translate-x-7" : "translate-x-1"
        )}
      >
        <div className="relative w-4 h-4">
          <Sun 
            className={cn(
              "absolute inset-0 transition-all duration-300 text-yellow-500",
              isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
            )}
          />
          <Moon 
            className={cn(
              "absolute inset-0 transition-all duration-300 text-blue-500",
              isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
            )}
          />
        </div>
      </div>
    </button>
  );
}

// Variante compacte pour la navigation
export function ThemeToggleCompact({ className }: { className?: string }) {
  const { currentTheme, toggleTheme } = useThemeStore();
  const isDark = currentTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
        className
      )}
      title={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
    >
      <div className="relative w-4 h-4">
        <Sun 
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
        />
        <Moon 
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </div>
      <span className="text-sm font-medium">
        {isDark ? 'Sombre' : 'Clair'}
      </span>
    </button>
  );
}

