import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function TestLogin() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginType, setLoginType] = useState<'user' | 'admin' | null>(null);
  const navigate = useNavigate();

  const handleTestLogin = async () => {
    try {
      setIsLoggingIn(true);
      setLoginType('user');
      const response = await login({
        login: "user@example.com",
        password: "password"
      });
      
      // Rediriger vers le dashboard utilisateur
      navigate('/user-dashboard');
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoggingIn(false);
      setLoginType(null);
    }
  };

  const handleTestAdminLogin = async () => {
    try {
      setIsLoggingIn(true);
      setLoginType('admin');
      const response = await login({
        login: "admin@example.com", 
        password: "password"
      });
      
      // Rediriger vers le dashboard admin
      navigate('/admin-dashboard');
    } catch (error) {
      console.error("Admin login failed:", error);
    } finally {
      setIsLoggingIn(false);
      setLoginType(null);
    }
  };

  if (isAuthenticated && user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Utilisateur connecté</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Nom:</strong> {user.name || `${user.firstName} ${user.lastName}`}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Username:</strong> {user.username || 'N/A'}</p>
            <p><strong>Admin:</strong> {user.isAdmin ? 'Oui' : 'Non'}</p>
            <p><strong>Premium:</strong> {user.isPremium ? 'Oui' : 'Non'}</p>
            <p><strong>Vérifié:</strong> {user.isVerified ? 'Oui' : 'Non'}</p>
            <p><strong>Statut:</strong> {user.approvalStatus}</p>
          </div>
          <Button onClick={logout} variant="destructive" className="w-full">
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test de connexion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleTestLogin} 
          disabled={isLoggingIn}
          className="w-full"
        >
          {isLoggingIn && loginType === 'user' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            "Se connecter (Utilisateur)"
          )}
        </Button>
        <Button 
          onClick={handleTestAdminLogin} 
          disabled={isLoggingIn}
          variant="outline" 
          className="w-full"
        >
          {isLoggingIn && loginType === 'admin' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connexion admin en cours...
            </>
          ) : (
            "Se connecter (Admin)"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
