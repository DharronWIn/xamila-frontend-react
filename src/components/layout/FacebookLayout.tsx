import { ReactNode, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FacebookNavbar, NavSection } from "./FacebookNavbar";
import { DynamicSidebar } from "./DynamicSidebar";
import { MobileBottomBar } from "./MobileBottomBar";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { NotificationManager } from "@/components/NotificationManager";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Settings, LogOut, User as UserIcon } from "lucide-react";
import { NotificationCenter } from "@/components/social/NotificationCenter";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface FacebookLayoutProps {
  children: ReactNode;
}

// Composant pour les actions mobiles en haut (Notifications et Profil)
function MobileTopActions() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isPremium = user?.isPremium || false;

  const handleLogout = async () => {
    await logout();
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <>
      {/* Notifications */}
      <NotificationCenter />

      {/* Profile Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-accent relative"
            title={user?.name || `${user?.firstName} ${user?.lastName}` || 'Profil'}
          >
            <UserAvatar user={user} className="w-9 h-9" disableWrapper />
            {isPremium && (
              <Badge 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-600 border-2 border-background"
              >
                <span className="text-[8px]">★</span>
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="flex items-center gap-3">
              <UserAvatar user={user} className="w-12 h-12" disableWrapper />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user?.name || `${user?.firstName} ${user?.lastName}` || 'Utilisateur'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPremium ? '⭐ Membre Premium' : 'Membre Gratuit'}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/user-dashboard/profile')}
          >
            <UserIcon className="w-4 h-4" />
            Voir le profil
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/user-dashboard/settings')}
          >
            <Settings className="w-4 h-4" />
            Paramètres
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="flex items-center gap-2 text-destructive cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function FacebookLayout({ children }: FacebookLayoutProps) {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Déterminer la section active en fonction de l'URL
  useEffect(() => {
    const path = location.pathname;
    
    if (path.startsWith('/admin-dashboard')) {
      setActiveSection('admin');
    } else if (path.includes('/resources') || path.includes('/my-resources')) {
      setActiveSection('resources');
    } else if (path.includes('/defis') || path.includes('/mes-defis')) {
      setActiveSection('defis');
    } else if (
      path.includes('/challenge') ||
      path.includes('/challenges') ||
      path.includes('/my-challenge') ||
      path.includes('/collective-progress') ||
      path.includes('/savings')
    ) {
      setActiveSection('challenges');
    } else if (path.includes('/transactions')) {
      setActiveSection('transactions');
    } else if (path.includes('/feed') || path.includes('/social')) {
      setActiveSection('social');
    } else {
      setActiveSection('dashboard');
    }
    
    // Fermer la sidebar mobile lors du changement de page
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      <NotificationManager />
      <div className="min-h-screen flex flex-col w-full bg-background">
        {/* Navbar fixe en haut - Desktop uniquement */}
        <div className="hidden lg:block">
          <FacebookNavbar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
          />
        </div>
        
        {/* Container principal avec sidebar + content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar dynamique à gauche - Desktop uniquement */}
          <div className="hidden lg:block">
            <DynamicSidebar activeSection={activeSection} />
          </div>
          
          {/* Zone de contenu principale */}
          <main className="flex-1 overflow-y-auto bg-background">
            {/* Barre mobile en haut avec Menu, Notifications et Profil */}
            <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
              <div className="flex items-center justify-between p-3">
                {/* Bouton Menu Mobile à gauche */}
                <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Menu className="w-4 h-4" />
                      Menu
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-80">
                    <DynamicSidebar activeSection={activeSection} />
                  </SheetContent>
                </Sheet>
                
                {/* Boutons Notifications et Profil à droite */}
                <div className="flex items-center gap-2">
                  <MobileTopActions />
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-20 lg:pb-6">
              {children}
            </div>
          </main>
        </div>
        
        {/* Mobile Bottom Bar */}
        <MobileBottomBar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        />
        
        <LoadingOverlay />
      </div>
    </>
  );
}

