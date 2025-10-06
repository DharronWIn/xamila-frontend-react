import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AuthDebug() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Debug - État d'authentification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>État de chargement:</strong></p>
            <Badge variant={isLoading ? "default" : "secondary"}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Chargement...
                </div>
              ) : (
                "Chargé"
              )}
            </Badge>
          </div>
          <div>
            <p><strong>Authentifié:</strong></p>
            <Badge variant={isAuthenticated ? "default" : "destructive"}>
              {isAuthenticated ? "Oui" : "Non"}
            </Badge>
          </div>
        </div>
        
        {user && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Données utilisateur:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Nom:</strong> {user.name || `${user.firstName} ${user.lastName}`}</p>
              <p><strong>Username:</strong> {user.username || 'N/A'}</p>
              <div><strong>Admin:</strong> 
                <Badge variant={user.isAdmin ? "default" : "secondary"} className="ml-2">
                  {user.isAdmin ? "Oui" : "Non"}
                </Badge>
              </div>
              <div><strong>Premium:</strong> 
                <Badge variant={user.isPremium ? "default" : "secondary"} className="ml-2">
                  {user.isPremium ? "Oui" : "Non"}
                </Badge>
              </div>
              <div><strong>Vérifié:</strong> 
                <Badge variant={user.isVerified ? "default" : "destructive"} className="ml-2">
                  {user.isVerified ? "Oui" : "Non"}
                </Badge>
              </div>
              <div><strong>Statut:</strong> 
                <Badge variant={user.approvalStatus === 'APPROVED' ? "default" : "destructive"} className="ml-2">
                  {user.approvalStatus}
                </Badge>
              </div>
              <div><strong>Actif:</strong> 
                <Badge variant={user.isActive ? "default" : "destructive"} className="ml-2">
                  {user.isActive ? "Oui" : "Non"}
                </Badge>
              </div>
              <p><strong>Dernière connexion:</strong> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
