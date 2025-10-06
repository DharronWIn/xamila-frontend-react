import { useAuthStore } from "@/stores/authStore";
import { useSavingsStore } from "@/stores/savingsStore";
import { useFinancialStore } from "@/stores/financialStore";
import { useSocialStore } from "@/stores/socialStore";
import { ThemeSelector, ThemePreview } from "@/components/ui/theme-selector";
import { useTheme } from "@/components/ThemeProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PremiumButton from "@/components/premium/PremiumButton";
import PremiumExample from "@/components/premium/PremiumExample";
import { usePremiumModalContext } from "@/components/premium/PremiumModalProvider";
import RegistrationDebug from "@/components/debug/RegistrationDebug";
import PremiumProtectionTest from "@/components/debug/PremiumProtectionTest";

export default function TestPage() {
  const auth = useAuthStore();
  const savings = useSavingsStore();
  const financial = useFinancialStore();
  const social = useSocialStore();
  const { currentTheme, themeConfig } = useTheme();
  const { showPremiumModal } = usePremiumModalContext();

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Test Page</h1>
        <Badge variant="secondary">
          Thème actuel: {themeConfig.displayName}
        </Badge>
      </div>

      {/* Theme Demonstration */}
      <Card>
        <CardHeader>
          <CardTitle>Démonstration des Thèmes</CardTitle>
          <CardDescription>
            Testez les différents thèmes pour voir comment ils s'appliquent à tous les composants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Sélection de thème</h3>
              <div className="space-y-4">
                <ThemeSelector variant="card" />
                <div className="flex justify-center space-x-4">
                  <ThemeSelector variant="toggle" />
                  <ThemeSelector variant="slider" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Aperçu du thème actuel</h3>
              <ThemePreview />
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Composants avec le thème appliqué</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Boutons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Button size="sm" className="w-full">Bouton principal</Button>
                    <Button variant="secondary" size="sm" className="w-full">Bouton secondaire</Button>
                    <Button variant="outline" size="sm" className="w-full">Bouton contour</Button>
                    <Button variant="ghost" size="sm" className="w-full">Bouton fantôme</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Badges & Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Par défaut</Badge>
                    <Badge variant="secondary">Secondaire</Badge>
                    <Badge variant="outline">Contour</Badge>
                  </div>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Input de test" 
                      className="w-full h-8 px-3 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground"
                    />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="w-full h-8 px-3 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Palette de couleurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-primary"></div>
                      <span className="text-sm">Primary</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-accent"></div>
                      <span className="text-sm">Accent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-muted"></div>
                      <span className="text-sm">Muted</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-secondary"></div>
                      <span className="text-sm">Secondary</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Démonstration de l'impact sur la sidebar */}
      <Card>
        <CardHeader>
          <CardTitle>Impact sur la Sidebar</CardTitle>
          <CardDescription>
            Les couleurs de la sidebar changent automatiquement avec le thème sélectionné
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Couleurs de la sidebar</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-sidebar-background border border-sidebar-border"></div>
                  <div>
                    <div className="text-sm font-medium">Arrière-plan</div>
                    <div className="text-xs text-muted-foreground">sidebar-background</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-sidebar-accent border border-sidebar-border"></div>
                  <div>
                    <div className="text-sm font-medium">Accent</div>
                    <div className="text-xs text-muted-foreground">sidebar-accent</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-sidebar-primary border border-sidebar-border"></div>
                  <div>
                    <div className="text-sm font-medium">Primaire</div>
                    <div className="text-xs text-muted-foreground">sidebar-primary</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Simulation de la sidebar</h4>
              <div className="bg-sidebar-background border border-sidebar-border rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 p-2 rounded bg-sidebar-accent">
                  <div className="w-4 h-4 rounded bg-sidebar-primary"></div>
                  <span className="text-sm text-sidebar-foreground">Menu Item 1</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded hover:bg-sidebar-accent/50">
                  <div className="w-4 h-4 rounded bg-muted"></div>
                  <span className="text-sm text-sidebar-foreground">Menu Item 2</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded hover:bg-sidebar-accent/50">
                  <div className="w-4 h-4 rounded bg-muted"></div>
                  <span className="text-sm text-sidebar-foreground">Menu Item 3</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Auth Store</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm">Authenticated: {auth.isAuthenticated ? 'Yes' : 'No'}</p>
            <p className="text-sm">User: {auth.user?.name || 'None'}</p>
            <p className="text-sm">Email: {auth.user?.email || 'None'}</p>
            <p className="text-sm">Premium: {auth.user?.isPremium ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Savings Store</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm">Goal: {savings.goal ? 'Set' : 'Not set'}</p>
            <p className="text-sm">Target: {savings.goal?.targetAmount || 0}€</p>
            <p className="text-sm">Current: {savings.goal?.currentAmount || 0}€</p>
            <p className="text-sm">Transactions: {savings.transactions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Store</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm">Transactions: {financial.transactions.length}</p>
            <p className="text-sm">Loading: {financial.isLoading ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Social Store</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm">Posts: {social.posts.length}</p>
            <p className="text-sm">Challenges: {social.challenges.length}</p>
            <p className="text-sm">Friends: {social.friends.length}</p>
            <p className="text-sm">Notifications: {social.notifications.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button
          onClick={() => {
            console.log('Auth:', auth);
            console.log('Savings:', savings);
            console.log('Financial:', financial);
            console.log('Social:', social);
          }}
        >
          Log All Stores
        </Button>
      </div>

      {/* Premium Modal Test Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Test Modal Premium</span>
            <Badge variant="outline">Nouveau</Badge>
          </CardTitle>
          <CardDescription>
            Testez le système de modal premium et de vérification d'email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Boutons Premium</h3>
              <div className="space-y-2">
                <PremiumButton variant="default" size="sm">
                  Petit bouton
                </PremiumButton>
                <PremiumButton variant="outline" size="default">
                  Bouton normal
                </PremiumButton>
                <PremiumButton variant="ghost" size="lg">
                  Grand bouton
                </PremiumButton>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Actions</h3>
              <div className="space-y-2">
                <Button 
                  onClick={showPremiumModal}
                  variant="outline"
                  className="w-full"
                >
                  Ouvrir Modal Premium
                </Button>
                <Button 
                  onClick={() => window.open('/verify-email?token=test-token', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  Tester Vérification Email
                </Button>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Exemple d'utilisation</h3>
            <PremiumExample />
          </div>
        </CardContent>
      </Card>

      {/* Registration Debug Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Test Formulaire d'Inscription</span>
            <Badge variant="outline">Debug</Badge>
          </CardTitle>
          <CardDescription>
            Testez l'envoi de tous les champs du formulaire d'inscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationDebug />
        </CardContent>
      </Card>

      {/* Premium Protection Test Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Test Protection Premium</span>
            <Badge variant="outline">Debug</Badge>
          </CardTitle>
          <CardDescription>
            Testez le système de protection premium et l'intégration FineoPay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PremiumProtectionTest />
        </CardContent>
      </Card>
    </div>
  );
}
