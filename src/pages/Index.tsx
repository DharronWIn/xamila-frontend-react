import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HomePage } from "@/components/home/HeroSection";
import { RegistrationModal } from "@/components/home/RegistrationModal";
import { LoginModal } from "@/components/auth/LoginModal";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { LogIn, Home, LogOut } from "lucide-react";
import logoApp from "@/assets/images/logo-challenge-epargne.jpg";

const Index = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Removed automatic redirect - users should be able to view homepage when logged in

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Rediriger vers le bon dashboard selon le rôle
      if (user?.isAdmin) {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } else {
      setIsRegistrationOpen(true);
    }
  };

  const handleLogin = () => {
    setIsLoginOpen(true);
  };

  const handleGoToDashboard = () => {
    // Rediriger vers le bon dashboard selon le rôle
    if (user?.isAdmin) {
      navigate('/admin-dashboard');
    } else {
      navigate('/user-dashboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen relative"
    >
      {/* Top Navigation */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-0 left-0 right-0 z-20 p-6"
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src={logoApp} 
              alt="X AMILA" 
              className="h-20 w-auto" 
            />
            {/* <span className="text-white font-semibold text-lg">Challenge d'Épargne</span> */}
          </div>
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeSelector variant="toggle" />
            </div>
            
            {isAuthenticated ? (
              <>
                <Button 
                  variant="glass" 
                  size="sm"
                  onClick={handleGoToDashboard}
                  className="text-white hover:text-foreground"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Mon espace
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    await logout();
                    // Force a page refresh to ensure clean state
                    window.location.href = '/';
                  }}
                  className="text-white border-white/30 hover:bg-white hover:text-primary"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <Button 
                variant="glass" 
                size="sm"
                onClick={handleLogin}
                className="text-white hover:text-foreground"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Se connecter
              </Button>
            )}
          </div>
        </div>
      </motion.nav>
      {/* Contenu de home */}
      
      <HomePage 
        onGetStarted={handleGetStarted} 
        isAuthenticated={isAuthenticated}
        onGoToDashboard={handleGoToDashboard}
      />

      <RegistrationModal 
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />
      
      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </motion.div>
  );
};

export default Index;
