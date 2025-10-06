import { Bell, User, LogOut, Settings, MessageCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationCenter } from "@/components/social/NotificationCenter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function TopNavigation() {
  const { user, logout } = useAuth();
  const isPremium = user?.isPremium || false;
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-sidebar-accent" />
        
        {/* <div className="hidden md:flex items-center gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-10 bg-background/50"
            />
          </div>
        </div> */}
      </div>

      <div className="flex items-center gap-4">
        {/* Actualités */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/user-dashboard/feed')}
          className="flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden md:inline">Actualités</span>
        </Button>

        {/* Plan épargne */}
        <Button 
          variant="default" 
          size="sm"
          onClick={() => navigate('/user-dashboard/savings')}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
        >
          <Target className="w-4 h-4" />
          <span className="hidden md:inline font-semibold">Plan épargne</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle variant="icon" />

        {/* Notifications */}
        <NotificationCenter />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-primary text-white text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name || `${user?.firstName} ${user?.lastName}` || 'Utilisateur'}</p>
                <p className="text-xs text-muted-foreground">
                  {isPremium ? 'Membre Premium' : 'Membre Gratuit'}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center gap-2"
              onClick={() => navigate('/user-dashboard/profile')}
            >
              <User className="w-4 h-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2"
              onClick={() => navigate('/user-dashboard/notifications')}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </DropdownMenuItem>
            {/* <DropdownMenuItem 
              className="flex items-center gap-2"
              onClick={() => navigate('/user-dashboard/settings')}
            >
              <Settings className="w-4 h-4" />
              Paramètres
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center gap-2 text-destructive"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}