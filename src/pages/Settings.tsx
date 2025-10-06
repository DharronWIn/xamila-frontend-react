import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { ThemePreview } from "@/components/ui/theme-selector";
import { useTheme } from "@/components/ThemeProvider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Palette, Monitor, Moon, Sun } from "lucide-react";

export default function Settings() {
  const { currentTheme, themeConfig } = useTheme();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">
          Personnalisez l'apparence de votre application
        </p>
      </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sélection de thème */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Thèmes</CardTitle>
            </div>
            <CardDescription>
              Basculez entre le mode clair et sombre
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <ThemeSelector variant="card" />
              <div className="flex justify-center">
                <ThemeSelector variant="slider" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aperçu du thème actuel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Monitor className="h-5 w-5 text-primary" />
                <CardTitle>Aperçu</CardTitle>
              </div>
              <Badge variant="secondary">
                {themeConfig.displayName}
              </Badge>
            </div>
            <CardDescription>
              Aperçu de votre thème actuel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemePreview />
          </CardContent>
        </Card>
      </div>

      {/* Informations sur les thèmes */}
      <Card>
        <CardHeader>
          <CardTitle>À propos des thèmes</CardTitle>
          <CardDescription>
            Découvrez les deux modes disponibles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                  <Sun className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-medium">Mode Clair</h4>
                  <p className="text-sm text-muted-foreground">
                    Parfait pour une utilisation en journée
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground pl-12">
                Interface claire et professionnelle avec des couleurs vives et un excellent contraste pour une lecture facile.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Moon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium">Mode Sombre</h4>
                  <p className="text-sm text-muted-foreground">
                    Idéal pour une utilisation nocturne
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground pl-12">
                Interface sombre et épurée qui réduit la fatigue oculaire et offre une expérience visuelle apaisante.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Comment ça marche ?</h4>
            <p className="text-sm text-muted-foreground">
              Les thèmes modifient automatiquement toutes les couleurs de l'application, 
              y compris les boutons, les cartes, les arrière-plans et les accents. 
              Votre choix est sauvegardé et sera restauré lors de votre prochaine visite.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
