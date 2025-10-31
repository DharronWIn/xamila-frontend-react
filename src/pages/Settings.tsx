import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { ThemePreview } from "@/components/ui/theme-selector";
import { useTheme } from "@/components/ThemeProvider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Palette, Monitor, Moon, Sun, Wallet, Info, AlertCircle } from "lucide-react";
import { useFluxFinancier } from "@/lib/apiComponent/hooks/useFinancial";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { currentTheme, themeConfig } = useTheme();
  const { toggleFlux } = useFluxFinancier();
  
  // État local pour le flux
  const [fluxEnabled, setFluxEnabled] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFluxState, setPendingFluxState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Charger l'état actuel du flux depuis les settings ou localStorage
  useEffect(() => {
    const savedFluxState = localStorage.getItem('fluxEnabled');
    if (savedFluxState !== null) {
      setFluxEnabled(savedFluxState === 'true');
    }
  }, []);

  const handleFluxToggle = async (checked: boolean) => {
    if (!checked) {
      // Si on désactive, montrer la confirmation
      setPendingFluxState(checked);
      setShowConfirmDialog(true);
    } else {
      // Si on active, pas besoin de confirmation
      await updateFluxState(checked);
    }
  };

  const updateFluxState = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      await toggleFlux(enabled);
      setFluxEnabled(enabled);
      localStorage.setItem('fluxEnabled', String(enabled));
      toast.success(
        enabled
          ? 'Flux financier activé avec succès'
          : 'Flux financier désactivé'
      );
    } catch (error) {
      console.error('Error toggling flux:', error);
      toast.error('Erreur lors de la modification du flux');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmToggle = async () => {
    setShowConfirmDialog(false);
    await updateFluxState(pendingFluxState);
  };

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

      {/* Flux Financier */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-primary" />
            <CardTitle>💳 Flux Financier</CardTitle>
          </div>
          <CardDescription>
            Gérez le suivi de vos transactions financières
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="flux-toggle" className="text-base font-medium">
                Activer le suivi du flux financier
              </Label>
              <p className="text-sm text-muted-foreground">
                {fluxEnabled 
                  ? 'Le flux est actuellement activé'
                  : 'Le flux est actuellement désactivé'
                }
              </p>
            </div>
            <Switch
              id="flux-toggle"
              checked={fluxEnabled}
              onCheckedChange={handleFluxToggle}
              disabled={isLoading}
            />
          </div>

          {/* Informations */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Qu'est-ce que le Flux Financier ?
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Le flux financier est votre compte principal centralisé qui vous permet de suivre 
                  toutes vos transactions en un seul endroit. Il intègre automatiquement vos épargnes 
                  de challenges et défis pour vous donner une vision complète de votre situation financière.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Quand le flux est activé :
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Toutes vos transactions manuelles sont enregistrées</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Les épargnes des challenges et défis sont automatiquement intégrées</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Vous avez accès à votre solde global en temps réel</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Des graphiques et statistiques détaillées sont disponibles</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Quand le flux est désactivé :
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Les transactions manuelles continuent de fonctionner</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Les challenges et défis fonctionnent normalement</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Pas de calcul de solde global</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Les épargnes ne sont plus tracées dans le flux</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          {fluxEnabled && (
            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/user-dashboard/transactions'}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Accéder au Flux Financier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver le Flux Financier ?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Êtes-vous sûr de vouloir désactiver le flux financier ? 
              </p>
              <p className="text-amber-600 dark:text-amber-400 font-medium">
                Vos données seront conservées mais le suivi sera désactivé.
              </p>
              <p>
                Les challenges et défis continueront de fonctionner normalement, mais ne créeront 
                plus de transactions dans le flux.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              Oui, désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
