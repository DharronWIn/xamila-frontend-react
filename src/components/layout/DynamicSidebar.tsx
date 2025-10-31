import {
  Home,
  FileText,
  TrendingUp,
  Target,
  CreditCard,
  Trophy,
  Wallet,
  Users,
  DollarSign,
  MessageCircle,
  Bell,
  Building2,
  Crown,
  Medal,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Award,
  ShoppingBag,
  Receipt,
  Shield
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type { ElementType } from "react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { usePremiumProtection } from "@/hooks/usePremiumProtection";
import PremiumUpgradeModal from "@/components/premium/PremiumUpgradeModal";
import { NavSection } from "./FacebookNavbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DynamicSidebarProps {
  activeSection: NavSection;
}

interface MenuItem {
  title: string;
  url: string;
  icon: ElementType;
  isPremium: boolean;
  description?: string;
}

export function DynamicSidebar({ activeSection }: DynamicSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPremium = user?.isPremium || false;
  const isAdmin = user?.isAdmin || false;
  
  const {
    isPremium: isPremiumProtected,
    isUpgradeModalOpen,
    handlePremiumFeatureClick,
    closeUpgradeModal
  } = usePremiumProtection();

  const handleLogout = async () => {
    await logout();
    localStorage.clear();
    window.location.href = '/';
  };

  // Définir les menus contextuels selon la section active
  const getSidebarMenuForSection = (): { title: string; items: MenuItem[] }[] => {
    switch (activeSection) {
      case 'dashboard':
        return [
          {
            title: 'Vue d\'ensemble',
            items: [
              { title: 'Tableau de bord', url: '/user-dashboard', icon: Home, isPremium: false },
              { title: 'Ressources', url: '/user-dashboard/resources', icon: FileText, isPremium: false },
            ]
          },
          {
            title: 'Services',
            items: [
              { title: 'Mes finances', url: '/user-dashboard/transactions', icon: TrendingUp, isPremium: true },
              { title: 'Compte bancaire', url: '/user-dashboard/bank-account', icon: CreditCard, isPremium: false },
            ]
          },
          {
            title: 'Forum',
            items: [
              { title: 'Fil d\'actualité', url: '/user-dashboard/feed', icon: MessageCircle, isPremium: false },
            ]
          },
          {
            title: 'Gamification',
            items: [
              { title: 'Salle des Trophées', url: '/gamification/trophies', icon: Trophy, isPremium: false },
              { title: 'Classement', url: '/gamification/leaderboard', icon: Medal, isPremium: false },
              { title: 'Gamification', url: '/gamification', icon: Star, isPremium: false },
            ]
          }
        ];

      case 'defis':
        return [
          {
            title: 'Défis',
            items: [
              { title: 'Tous les défis', url: '/user-dashboard/defis', icon: Trophy, isPremium: false, description: 'Explorer les défis disponibles' },
              { title: 'Mes défis', url: '/user-dashboard/mes-defis', icon: Target, isPremium: false, description: 'Vos défis en cours' },
            ]
          }
        ];

      case 'challenges':
        return [
          {
            title: 'Challenges d\'épargne',
            items: [
              { title: 'Tous les challenges', url: '/user-dashboard/challenges', icon: Target, isPremium: false, description: 'Parcourir les challenges' },
              { title: 'Mon challenge', url: '/user-dashboard/my-challenge', icon: Wallet, isPremium: false, description: 'Votre challenge actuel' },
              { title: 'Progression collective', url: '/user-dashboard/collective-progress', icon: Trophy, isPremium: true, description: 'Performance collective du challenge en cours' },
            ]
          }
        ];

      case 'transactions':
        return [
          {
            title: 'Mes finances',
            items: [
              { title: 'Caisse principale', url: '/user-dashboard/transactions', icon: TrendingUp, isPremium: true, description: 'Gérer votre caisse principale' },
            ]
          }
        ];

      case 'social':
        return [
          {
            title: 'Communauté',
            items: [
              { title: 'Fil d\'actualité', url: '/user-dashboard/feed', icon: MessageCircle, isPremium: false, description: 'Discussions et actualités' },
              { title: 'Progression collective', url: '/user-dashboard/collective-progress', icon: Users, isPremium: true, description: 'Performance collective du challenge en cours' },
            ]
          }
        ];

      case 'resources':
        return [
          {
            title: 'Ressources',
            items: [
              { title: 'Toutes les ressources', url: '/user-dashboard/resources', icon: FileText, isPremium: false },
              { title: 'Mes ressources', url: '/user-dashboard/my-resources', icon: FileText, isPremium: false },
            ]
          },
          {
            title: 'Contenus Pédagogiques',
            items: [
              { title: 'Vidéos', url: '/user-dashboard/resources/videos', icon: Users, isPremium: false },
              { title: 'Audios', url: '/user-dashboard/resources/audios', icon: Users, isPremium: false },
              { title: 'Documents', url: '/user-dashboard/resources/documents', icon: FileText, isPremium: false },
            ]
          }
        ];

      case 'admin':
        return [
          {
            title: 'Administration',
            items: [
              { title: 'Dashboard Admin', url: '/admin-dashboard', icon: Home, isPremium: false },
              { title: 'Statistiques', url: '/admin-dashboard/stats', icon: TrendingUp, isPremium: false },
            ]
          },
          {
            title: 'Gestion',
            items: [
              { title: 'Utilisateurs', url: '/admin-dashboard/users', icon: Users, isPremium: false },
              { title: 'Financière', url: '/admin-dashboard/financial', icon: DollarSign, isPremium: false },
              { title: 'Objectifs d\'épargne', url: '/admin-dashboard/savings', icon: Target, isPremium: false },
              { title: 'Sociale', url: '/admin-dashboard/social', icon: MessageCircle, isPremium: false },
              { title: 'Challenges', url: '/admin-dashboard/challenges', icon: Trophy, isPremium: false },
              { title: 'Défis', url: '/admin-dashboard/defis', icon: Target, isPremium: false },
              { title: 'Gamification', url: '/admin-dashboard/gamification', icon: Award, isPremium: false },
              { title: 'FineoPay', url: '/admin-dashboard/fineopay', icon: Receipt, isPremium: false },
              { title: 'Abonnements', url: '/admin-dashboard/subscriptions', icon: ShoppingBag, isPremium: false },
              { title: 'Notifications', url: '/admin-dashboard/notifications', icon: Bell, isPremium: false },
              { title: 'Comptes bancaires', url: '/admin-dashboard/bank-accounts', icon: Building2, isPremium: false },
              { title: 'Demandes de coaching', url: '/admin-dashboard/coaching-requests', icon: HelpCircle, isPremium: false },
            ]
          }
        ];

      default:
        return [];
    }
  };

  const handlePremiumClick = (e: React.MouseEvent, url: string, isPremiumRequired: boolean) => {
    if (isPremiumRequired && !isPremium && !isAdmin) {
      e.preventDefault();
      handlePremiumFeatureClick();
    }
  };

  const menuGroups = getSidebarMenuForSection();

  // Ensure only one active item at a time: choose the longest URL that matches current path
  const currentPath = location.pathname;
  const allItems = menuGroups.flatMap(group => group.items);
  const activeItemUrl = allItems
    .filter(item => currentPath === item.url || currentPath.startsWith(item.url + "/"))
    .sort((a, b) => b.url.length - a.url.length)[0]?.url;
  
  // Déterminer si on est en mode admin
  const isAdminMode = currentPath.startsWith('/admin-dashboard') || currentPath === '/admin';

  return (
    <>
      <aside className="w-80 border-r border-border bg-card/30 h-[calc(100vh-3.5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <div className="p-4 space-y-6 pb-8">
          
          {/* User Info Card */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                {user?.name?.charAt(0)?.toUpperCase() || user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {user?.name || `${user?.firstName} ${user?.lastName}` || 'Utilisateur'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPremium ? '⭐ Premium' : 'Gratuit'}
                </p>
              </div>
            </div>
            
            {/* Switch Admin/User Mode Button - Juste en dessous de l'avatar */}
            {isAdmin && (
              <Button
                size="sm"
                variant={isAdminMode ? "default" : "outline"}
                className={`w-full mb-3 ${
                  isAdminMode 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'border-red-200 text-red-600 hover:bg-red-50'
                }`}
                onClick={() => {
                  if (isAdminMode) {
                    navigate('/user-dashboard');
                  } else {
                    navigate('/admin-dashboard');
                  }
                }}
              >
                {isAdminMode ? (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Mode Utilisateur
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Mode Admin
                  </>
                )}
              </Button>
            )}
            
            {!isPremium && !isAdmin && (
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white"
                onClick={handlePremiumFeatureClick}
              >
                <Crown className="w-4 h-4 mr-2" />
                Passer Premium
              </Button>
            )}
          </div>

          {/* Dynamic Menu Groups */}
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isLocked = item.isPremium && !isPremium && !isAdmin;
                  
                  return (
                    <NavLink
                      key={item.url}
                      to={item.url}
                      onClick={(e) => handlePremiumClick(e, item.url, item.isPremium)}
                      className={(() => {
                        const isActive = item.url === activeItemUrl || currentPath === item.url;
                        return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                          isActive
                            ? 'bg-primary/10 text-primary font-medium shadow-sm'
                            : isLocked
                            ? 'text-muted-foreground/50 hover:bg-accent/50'
                            : 'text-foreground hover:bg-accent hover:text-foreground'
                        }`;
                      })()}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isLocked ? 'opacity-50' : ''}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${isLocked ? 'opacity-50' : ''}`}>
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.isPremium && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ml-auto flex-shrink-0 ${
                            isPremium || isAdmin
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' 
                              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          <Crown className="w-3 h-3" />
                        </Badge>
                      )}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          <Separator />

          {/* Bottom Actions */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => navigate('/user-dashboard/settings')}
            >
              <Settings className="w-4 h-4 mr-3" />
              Paramètres
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        userEmail={user?.email || ''}
        userId={user?.id || ''}
        title="Débloquez toutes les fonctionnalités Premium"
        description="Accédez à toutes les fonctionnalités avancées de Challenge d'Épargne"
      />
    </>
  );
}

