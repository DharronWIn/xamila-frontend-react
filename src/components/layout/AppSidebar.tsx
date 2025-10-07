import {
    Home,
    FileText,
    TrendingUp,
    Target,
    CreditCard,
    Bell,
    Users, HelpCircle,
    Crown,
    LogOut,
    Trophy,
    MessageCircle, DollarSign,
    Building2, Wallet
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { usePremiumProtection } from "@/hooks/usePremiumProtection";
import PremiumUpgradeModal from "@/components/premium/PremiumUpgradeModal";
import logo6Mois from "@/assets/images/logo-challenge-epargne.jpg";

const userMenuItems = [
  { title: "Tableau de bord", url: "/user-dashboard", icon: Home, isPremium: false },
  { title: "Ressources", url: "/user-dashboard/resources", icon: FileText, isPremium: false },

  //{ title: "Défis communautaires", url: "/user-dashboard/defis", icon: Trophy, isPremium: false },
  { title: "Challenges d'épargne", url: "/user-dashboard/challenges", icon: Target, isPremium: false },
  { title: "Mon Challenge", url: "/user-dashboard/my-challenge", icon: Wallet, isPremium: false },
  { title: "Flux financier", url: "/user-dashboard/transactions", icon: TrendingUp, isPremium: true },
  //{ title: "Challenge d'épargne", url: "/user-dashboard/savings", icon: Target, isPremium: true },
  { title: "Progression collective", url: "/user-dashboard/collective-progress", icon: Trophy, isPremium: true },
  { title: "Compte bancaire", url: "/user-dashboard/bank-account", icon: CreditCard, isPremium: false },
];

const adminMainItems = [
  { title: "Dashboard Admin", url: "/admin-dashboard", icon: Home, isPremium: false },
  { title: "Statistiques", url: "/admin-dashboard/stats", icon: TrendingUp, isPremium: false },
  { title: "Ressources", url: "/admin-dashboard/resources", icon: FileText, isPremium: false },
];

const adminManagementItems = [
  { title: "Gestion utilisateurs", url: "/admin-dashboard/users", icon: Users, isPremium: false },
  { title: "Gestion financière", url: "/admin-dashboard/financial", icon: DollarSign, isPremium: false },
  { title: "Objectifs d'épargne", url: "/admin-dashboard/savings", icon: Target, isPremium: false },
  { title: "Gestion sociale", url: "/admin-dashboard/social", icon: MessageCircle, isPremium: false },
  { title: "Gestion des challenges", url: "/admin-dashboard/challenges", icon: Trophy, isPremium: false },
  { title: "Notifications", url: "/admin-dashboard/notifications", icon: Bell, isPremium: false },
  { title: "Comptes bancaires", url: "/admin-dashboard/bank-accounts", icon: Building2, isPremium: false },
];

const bottomMenuItems = [
  //{ title: "Paramètres", url: "/user-dashboard/settings", icon: Settings, isPremium: false },
  { title: "Aide", url: "/user-dashboard/help", icon: HelpCircle, isPremium: false },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();
  
  const {
    isPremium,
    isUpgradeModalOpen,
    handlePremiumFeatureClick,
    closeUpgradeModal
  } = usePremiumProtection();
  
  const isAdmin = user?.isAdmin || false;
  
  // Détecter si on est en mode admin ou utilisateur
  const isAdminMode = currentPath.startsWith('/admin-dashboard');
  const isUserMode = currentPath.startsWith('/user-dashboard') || currentPath === '/dashboard';
  
  const handleSidebarPremiumClick = (e: React.MouseEvent, url: string, isPremiumRequired: boolean) => {
    // Les admins ont accès à tout, même aux fonctionnalités premium
    if (isPremiumRequired && !isPremium && !isAdmin) {
      e.preventDefault();
      handlePremiumFeatureClick();
    }
  };

  const handleLogout = async () => {
    await logout();
    // Clear any other potential storage
    localStorage.clear();
    // Force a complete page refresh to ensure clean state
    window.location.href = '/';
  };
  
  // Fonction pour vérifier si une route est active
  const isRouteActive = (url: string) => {
    // Cas spéciaux pour la route racine
    if (url === '/user-dashboard' && (currentPath === '/' || currentPath === '/dashboard' || currentPath === '/user-dashboard')) return true;
    if (url === '/admin-dashboard' && (currentPath === '/admin' || currentPath === '/admin-dashboard')) return true;
    
    // Correspondance exacte ou sous-route
    return currentPath === url || (url !== '/' && currentPath.startsWith(url + '/'));
  };

  const getNavCls = (url: string) => {
    const isActive = isRouteActive(url);
    return isActive 
      ? "sidebar-active-tab" 
      : "sidebar-hover-tab";
  };

  return (
    <Sidebar className="w-64">
      <SidebarContent>
        {/* Logo Section */}
        <div className=" border-b border-sidebar-border">
          <div className="flex items-center justify-center">
            <img 
              src={logo6Mois} 
              alt="6 MOIS Challenge Epargne" 
              className="h-16 w-auto"
            />
          </div>
        </div>
        
        {/* User Profile Section */}
        {/* <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar 
              user={user}
              size="md"
              className="w-10 h-10"
              fallbackClassName="bg-primary text-white font-semibold"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sidebar-foreground truncate">
                {user?.name || 'Utilisateur'}
              </p>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={isPremium ? "default" : "secondary"} 
                  className={`text-xs ${isPremium ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' : ''}`}
                >
                  {isPremium ? (
                    <>
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </>
                  ) : 'Gratuit'}
                </Badge>
                {isAdmin && (
                  <Badge variant="outline" className="text-xs">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {isAdmin && (
            <div className="mb-3">
              <Button 
                variant={isAdminMode ? "default" : "outline"}
                size="sm" 
                className="w-full text-xs"
                onClick={() => navigate(isAdminMode ? '/user-dashboard' : '/admin-dashboard')}
              >
                {isAdminMode ? (
                  <>
                    <User className="w-3 h-3 mr-1" />
                    Mode Utilisateur
                  </>
                ) : (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    Mode Admin
                  </>
                )}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
          
          {!isPremium && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs bg-gradient-to-r from-primary to-primary/80 border-primary text-white hover:bg-primary/90"
              onClick={handlePremiumFeatureClick}
            >
              <Crown className="w-3 h-3 mr-1" />
              Passer Premium
            </Button>
          )}
        </div> */}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {isAdminMode ? 'Administration' : 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(isAdminMode ? adminMainItems : userMenuItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls(item.url)}
                      onClick={(e) => handleSidebarPremiumClick(e, item.url, item.isPremium)}
                    >
                      <item.icon className="w-4 h-4" />
                      <div className="flex items-center justify-between flex-1">
                        <span className={item.isPremium && !isPremium ? 'text-gray-400' : ''}>
                          {item.title}
                        </span>
                        {item.isPremium && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              isPremium 
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' 
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            <Crown className="w-3 h-3 mr-1" />
                            Pro
                          </Badge>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Management Modules */}
        {isAdminMode && (
          <SidebarGroup>
            <SidebarGroupLabel>Modules de Gestion</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminManagementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={getNavCls(item.url)}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Bottom Menu */}
        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls(item.url)}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
                {/* Logout Button */}
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600">
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      
      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        userEmail={user?.email || ''}
        userId={user?.id || ''}
        title="Débloquez toutes les fonctionnalités Premium"
        description="Accédez à toutes les fonctionnalités avancées de Challenge d'Épargne"
      />
    </Sidebar>
  );
}