import {
    Home,
    Trophy,
    Target,
    Users,
    TrendingUp,
    Bell,
    Menu as MenuIcon,
    Shield,
    MessageCircle,
    BookOpen,
    Medal,
    Star,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { NotificationCenter } from "@/components/social/NotificationCenter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { UserAvatar } from "../ui/UserAvatar";
import logo6Mois from "@/assets/images/logo-challenge-epargne.jpg";
import {
    Settings,
    HelpCircle,
    LogOut,
    CreditCard, DollarSign,
    Building2,
    User as UserIcon
} from "lucide-react";

// Type pour les sections principales de la navbar
export type NavSection = 'dashboard' | 'defis' | 'challenges' | 'social' | 'transactions' | 'resources' | 'admin' | 'gamification';

interface FacebookNavbarProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
}

export function FacebookNavbar({ activeSection, onSectionChange }: FacebookNavbarProps) {
  const { user, logout } = useAuth();
  const isPremium = user?.isPremium || false;
  const isAdmin = user?.isAdmin || false;
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAdminMode = location.pathname.startsWith('/admin-dashboard');

  const handleLogout = async () => {
    await logout();
    localStorage.clear();
    window.location.href = '/';
  };


  // Définir le menu gamification
  const gamificationMenu = [
    { icon: Star, label: 'Dashboard Gamification', path: '/gamification', isPremium: false },
    { icon: Trophy, label: 'Salle des Trophées', path: '/gamification/trophies', isPremium: false },
    { icon: Medal, label: 'Classement', path: '/gamification/leaderboard', isPremium: false },
  ];

  // Définir les onglets principaux de la navbar (icônes uniquement)
  const navTabs = isAdminMode ? [
    { 
      id: 'admin' as NavSection, 
      icon: Shield, 
      label: 'Admin Dashboard',
      path: '/admin-dashboard'
    },
    { 
      id: 'dashboard' as NavSection, 
      icon: TrendingUp, 
      label: 'Statistiques',
      path: '/admin-dashboard/stats'
    },
  ] : [
    { 
      id: 'dashboard' as NavSection, 
      icon: Home, 
      label: 'Accueil',
      path: '/user-dashboard'
    },
    { 
      id: 'defis' as NavSection, 
      icon: Trophy, 
      label: 'Défis',
      path: '/user-dashboard/defis'
    },
    { 
      id: 'challenges' as NavSection, 
      icon: Target, 
      label: 'Challenges',
      path: '/user-dashboard/challenges'
    },
    { 
      id: 'transactions' as NavSection, 
      icon: TrendingUp, 
      label: 'Mes finances',
      path: '/user-dashboard/transactions'
    },
  ];

  // Menu "Plus" avec actions supplémentaires
  const moreMenuItems = isAdminMode ? [
    { icon: Users, label: 'Gestion utilisateurs', path: '/admin-dashboard/users' },
    { icon: DollarSign, label: 'Gestion financière', path: '/admin-dashboard/financial' },
    { icon: Target, label: 'Objectifs d\'épargne', path: '/admin-dashboard/savings' },
    { icon: MessageCircle, label: 'Gestion sociale', path: '/admin-dashboard/social' },
    { icon: Trophy, label: 'Gestion des challenges', path: '/admin-dashboard/challenges' },
    { icon: Bell, label: 'Notifications', path: '/admin-dashboard/notifications' },
    { icon: Building2, label: 'Comptes bancaires', path: '/admin-dashboard/bank-accounts' },
  ] : [
    { icon: FileText, label: 'Mes Ressources', path: '/user-dashboard/resources' },
    { icon: Star, label: 'Gamification', path: '/gamification' },
    { icon: Trophy, label: 'Salle des Trophées', path: '/gamification/trophies' },
    { icon: Medal, label: 'Classement', path: '/gamification/leaderboard' },
    { icon: CreditCard, label: 'Compte bancaire', path: '/user-dashboard/bank-account' },
    { icon: Settings, label: 'Paramètres', path: '/user-dashboard/settings' },
    { icon: HelpCircle, label: 'Aide', path: '/user-dashboard/help' },
    { icon: null, label: 'theme-toggle', path: null }, // Placeholder for theme toggle
  ];

  const handleTabClick = (tab: typeof navTabs[0]) => {
    onSectionChange(tab.id);
    navigate(tab.path);
  };

  return (
    <header className="h-14 border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="h-full flex items-center justify-between px-2 sm:px-4 max-w-full">
        
        {/* Left Section: Logo */}
        <div className="flex items-center gap-2 min-w-[140px] sm:min-w-[200px]">
          <img 
            src={logo6Mois} 
            alt="6 MOIS Challenge" 
            className="h-8 sm:h-10 w-auto cursor-pointer"
            onClick={() => navigate(isAdminMode ? '/admin-dashboard' : '/user-dashboard')}
          />
        </div>

        {/* Center Section: Main Navigation Tabs (Icons only) - Hidden on small mobile */}
        <div className="hidden sm:flex items-center justify-center flex-1 gap-1 md:gap-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="icon"
                onClick={() => handleTabClick(tab)}
                className={`
                  relative h-12 w-12 md:w-16 rounded-lg transition-all
                  ${isActive 
                    ? 'text-primary border-b-4 border-primary rounded-b-none bg-accent/50' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }
                `}
                title={tab.label}
              >
                <Icon className={`w-5 md:w-6 h-5 md:h-6 ${isActive ? 'scale-110' : ''}`} />
              </Button>
            );
          })}
          
          {/* Ressources Button - Mode User uniquement */}
          {!isAdminMode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onSectionChange('resources');
                navigate('/user-dashboard/resources');
              }}
              className={`
                relative h-12 w-12 md:w-16 rounded-lg transition-all
                ${activeSection === 'resources' 
                  ? 'text-primary border-b-4 border-primary rounded-b-none bg-accent/50' 
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }
              `}
              title="Ressources"
            >
              <BookOpen className={`w-5 md:w-6 h-5 md:h-6 ${activeSection === 'resources' ? 'scale-110' : ''}`} />
            </Button>
          )}

          {/* {!isAdminMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`
                    relative h-12 w-12 md:w-16 rounded-lg transition-all
                    ${activeSection === 'gamification' 
                      ? 'text-primary border-b-4 border-primary rounded-b-none bg-accent/50' 
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }
                  `}
                  title="Gamification"
                >
                  <Award className={`w-5 md:w-6 h-5 md:h-6 ${activeSection === 'gamification' ? 'scale-110' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64">
                <DropdownMenuLabel className="text-base font-semibold">🏆 Gamification</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {gamificationMenu.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <DropdownMenuItem 
                      key={item.path}
                      onClick={() => {
                        onSectionChange('gamification');
                        navigate(item.path);
                      }}
                      className="flex items-center gap-3 cursor-pointer py-2.5"
                    >
                      <ItemIcon className="w-4 h-4" />
                      <span className="flex-1">{item.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )} */}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 justify-end">
          
          {/* Menu "Plus" */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-accent"
                title="Menu"
              >
                <MenuIcon className="w-4 sm:w-5 h-4 sm:h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Menu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {moreMenuItems.map((item, index) => {
                // Afficher le ThemeToggle pour l'item spécial
                if (item.label === 'theme-toggle') {
                  return (
                    <div key={index} className="px-2 py-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Thème</span>
                        <ThemeToggle variant="icon" />
                      </div>
                    </div>
                  );
                }
                
                const Icon = item.icon;
                return (
                  <DropdownMenuItem 
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Forum Button - Remplace le Theme Toggle - Mode User uniquement */}
          {!isAdminMode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onSectionChange('social');
                navigate('/user-dashboard/feed');
              }}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-accent"
              title="Forum"
            >
              <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5" />
            </Button>
          )}

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
        </div>
      </div>
    </header>
  );
}

