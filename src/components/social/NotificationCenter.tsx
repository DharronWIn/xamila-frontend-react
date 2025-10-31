import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Trophy, Check, Settings, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/lib/apiComponent/hooks/useNotifications";
import { NotificationType } from "@/lib/apiComponent/types";
import { simpleNotificationService } from "@/lib/apiComponent/services/simpleNotificationService";

const NotificationCenter = () => {
  const navigate = useNavigate();

  // Use only the real-time notifications hook for API notifications
  const {
    notifications: apiNotifications,
    unreadCount: apiUnreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    getNotifications
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);

  // Use API notifications directly
  const allNotifications = Array.isArray(apiNotifications) ? apiNotifications : [];
  const totalUnreadCount = apiUnreadCount || 0;

  useEffect(() => {
    // Load notifications on mount
    getNotifications({ page: 1, limit: 10 });
    
    // Ensure polling is started for the topbar
    if (!simpleNotificationService.getConnectionStatus()) {
      simpleNotificationService.startPolling();
    }
  }, [getNotifications]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'SUCCESS':
        return <Trophy className="w-4 h-4 text-green-500" />;
      case 'WARNING':
        return <Bell className="w-4 h-4 text-yellow-500" />;
      case 'INFO':
        return <Bell className="w-4 h-4 text-blue-500" />;
      case 'REMINDER':
        return <Bell className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'SUCCESS':
        return 'bg-green-50 border-green-200';
      case 'WARNING':
        return 'bg-yellow-50 border-yellow-200';
      case 'INFO':
        return 'bg-blue-50 border-blue-200';
      case 'REMINDER':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return notificationDate.toLocaleDateString('fr-FR');
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const unreadNotificationsList = allNotifications.filter(n => !n.isRead);
  const readNotificationsList = allNotifications.filter(n => n.isRead);
  const unreadNotifications = unreadNotificationsList.length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {totalUnreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </Badge>
          )}
          {!isConnected && (
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" title="Connexion en temps réel déconnectée" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0"
        sideOffset={5}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
             {/* Header */}
             <div className="p-4 border-b">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <h3 className="font-semibold text-gray-900">Notifications</h3>
                   <div className="flex items-center gap-1">
                     <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                     <span className="text-xs text-muted-foreground">
                       {isConnected ? 'Connecté' : 'Déconnecté'}
                     </span>
                   </div>
                 </div>
                 <div className="flex items-center space-x-2">
                  {unreadNotifications > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Tout marquer comme lu
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    {/* <DropdownMenuContent align="end">
                      <DropdownMenuItem>Paramètres</DropdownMenuItem>
                      <DropdownMenuItem>Archiver tout</DropdownMenuItem>
                    </DropdownMenuContent> */}
                  </DropdownMenu>
                </div>
              </div>
            </div>

             {/* Notifications List */}
             <ScrollArea className="max-h-96">
               <div className="p-2">
                 {/* Loading State */}
                 {isLoading && allNotifications.length === 0 && (
                   <div className="text-center py-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                     <p className="text-sm text-gray-600">Chargement des notifications...</p>
                   </div>
                 )}
                {/* Unread Notifications */}
                {unreadNotificationsList.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 px-2">
                      Non lues ({unreadNotificationsList.length})
                    </h4>
                     {unreadNotificationsList.map((notification) => (
                       <motion.div
                         key={notification.id}
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${getNotificationColor(notification.type)}`}
                         onClick={() => handleNotificationClick(notification.id)}
                       >
                         <div className="flex items-start space-x-3">
                           <div className="flex-shrink-0">
                             <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                               {getNotificationIcon(notification.type)}
                             </div>
                           </div>
                           <div className="flex-1 min-w-0">
                             <h4 className="text-sm font-medium text-gray-900 mb-1">
                               {notification.title}
                             </h4>
                             <p className="text-sm text-gray-700 line-clamp-2">
                               {notification.message}
                             </p>
                             <div className="flex items-center justify-between mt-1">
                               <span className="text-xs text-gray-500">
                                 {formatTimeAgo(notification.createdAt)}
                               </span>
                               <div className="w-2 h-2 bg-primary rounded-full"></div>
                             </div>
                           </div>
                         </div>
                       </motion.div>
                     ))}
                  </div>
                )}

                {/* Read Notifications */}
                {readNotificationsList.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-600 px-2">
                      Lues ({readNotificationsList.length})
                    </h4>
                     {readNotificationsList.slice(0, 5).map((notification) => (
                       <div
                         key={notification.id}
                         className="p-3 rounded-lg border bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                         onClick={() => handleNotificationClick(notification.id)}
                       >
                         <div className="flex items-start space-x-3">
                           <div className="flex-shrink-0">
                             <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                               {getNotificationIcon(notification.type)}
                             </div>
                           </div>
                           <div className="flex-1 min-w-0">
                             <h4 className="text-sm font-medium text-gray-700 mb-1">
                               {notification.title}
                             </h4>
                             <p className="text-sm text-gray-600 line-clamp-2">
                               {notification.message}
                             </p>
                             <span className="text-xs text-gray-500">
                               {formatTimeAgo(notification.createdAt)}
                             </span>
                           </div>
                         </div>
                       </div>
                     ))}
                  </div>
                )}

                {/* Empty State */}
                {allNotifications.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Aucune notification</p>
                    <p className="text-xs text-gray-500">
                      Vous recevrez des notifications ici
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t bg-gray-50">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs hover:bg-blue-50 hover:border-blue-200"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/user-dashboard/notifications');
                }}
              >
                <Eye className="w-3 h-3 mr-2" />
                Voir toutes les notifications
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { NotificationCenter };
export default NotificationCenter;
