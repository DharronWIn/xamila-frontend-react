import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, CheckCircle, XCircle } from "lucide-react";

export function PremiumTest() {
  const { user, isAuthenticated } = useAuth();
  const isPremium = user?.isPremium || false;

  const premiumFeatures = [
    { name: "Flux financier", required: true, description: "Gestion des transactions" },
    { name: "Challenge d'épargne", required: true, description: "Défis d'épargne personnalisés" },
    { name: "Progression collective", required: true, description: "Classement et statistiques" },
    { name: "Ressources premium", required: true, description: "Contenu éducatif avancé" },
    { name: "Tableau de bord", required: false, description: "Vue d'ensemble des finances" },
    { name: "Défis communautaires", required: false, description: "Participation aux défis" },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Test des fonctionnalités Premium
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* État de l'utilisateur */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">État de l'utilisateur</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Connecté:</strong> {isAuthenticated ? "Oui" : "Non"}
            </div>
            <div>
              <strong>Premium:</strong> 
              <Badge 
                variant={isPremium ? "default" : "secondary"} 
                className={`ml-2 ${isPremium ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' : ''}`}
              >
                {isPremium ? (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </>
                ) : (
                  "Gratuit"
                )}
              </Badge>
            </div>
            {user && (
              <>
                <div>
                  <strong>Nom:</strong> {user.name || `${user.firstName} ${user.lastName}`}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                {user.premiumExpiresAt && (
                  <div className="col-span-2">
                    <strong>Expiration Premium:</strong> {new Date(user.premiumExpiresAt).toLocaleDateString()}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Test des fonctionnalités */}
        <div>
          <h3 className="font-semibold mb-3">Test des fonctionnalités</h3>
          <div className="space-y-2">
            {premiumFeatures.map((feature) => {
              const hasAccess = !feature.required || isPremium;
              return (
                <div 
                  key={feature.name}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    hasAccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {hasAccess ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium">{feature.name}</div>
                      <div className="text-sm text-gray-600">{feature.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {feature.required && (
                      <Badge variant="outline" className="text-xs">
                        Premium requis
                      </Badge>
                    )}
                    <Badge 
                      variant={hasAccess ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {hasAccess ? "Accès autorisé" : "Accès refusé"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions de test */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions de test</h3>
          <ul className="text-sm space-y-1">
            <li>• Connectez-vous avec un utilisateur premium pour voir l'accès complet</li>
            <li>• Connectez-vous avec un utilisateur gratuit pour voir les restrictions</li>
            <li>• Vérifiez que les fonctionnalités premium sont correctement bloquées</li>
            <li>• Testez la navigation dans l'AppSidebar avec les restrictions premium</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
