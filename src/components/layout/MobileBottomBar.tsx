import {
    Home,
    Trophy,
    Target,
    TrendingUp,
    BookOpen,
    MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { NavSection } from "./FacebookNavbar";

interface MobileBottomBarProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
}

export function MobileBottomBar({ activeSection, onSectionChange }: MobileBottomBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAdminMode = location.pathname.startsWith('/admin-dashboard');

  // Définir les onglets principaux pour mobile
  const mobileTabs = isAdminMode ? [
    { 
      id: 'admin' as NavSection, 
      icon: Home, 
      label: 'Admin',
      path: '/admin-dashboard'
    },
    { 
      id: 'dashboard' as NavSection, 
      icon: TrendingUp, 
      label: 'Stats',
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
      label: 'Flux',
      path: '/user-dashboard/transactions'
    },
    { 
      id: 'resources' as NavSection, 
      icon: BookOpen, 
      label: 'Ressources',
      path: '/user-dashboard/resources'
    },
  ];

  const handleTabClick = (tab: typeof mobileTabs[0]) => {
    onSectionChange(tab.id);
    navigate(tab.path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {/* Onglets principaux */}
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => handleTabClick(tab)}
              className={`
                flex flex-col items-center gap-1 h-12 px-2 py-1 rounded-lg transition-all
                ${isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          );
        })}

        {/* Bouton Forum - Mode User uniquement */}
        {!isAdminMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSectionChange('social');
              navigate('/user-dashboard/feed');
            }}
            className={`
              flex flex-col items-center gap-1 h-12 px-2 py-1 rounded-lg transition-all
              ${activeSection === 'social' 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }
            `}
          >
            <MessageCircle className={`w-5 h-5 ${activeSection === 'social' ? 'scale-110' : ''}`} />
            <span className="text-xs font-medium">Forum</span>
          </Button>
        )}
      </div>
    </div>
  );
}
