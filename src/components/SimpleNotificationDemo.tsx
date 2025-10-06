import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/lib/apiComponent/hooks/useNotifications';
import { simpleNotificationService } from '@/lib/apiComponent/services/simpleNotificationService';
import { Bell, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export function SimpleNotificationDemo() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    getNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheck(simpleNotificationService.getLastCheckTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleConnect = () => {
    simpleNotificationService.startPolling();
  };

  const handleDisconnect = () => {
    simpleNotificationService.stopPolling();
  };

  const handleRefresh = async () => {
    await getNotifications({ page: 1, limit: 10 });
  };

  const handleCheckNow = async () => {
    await simpleNotificationService.checkNow();
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Demo (Polling)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {isConnected ? 'Polling actif' : 'Polling arrêté'}
              </span>
            </div>
            
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {unreadCount} non lues
            </Badge>

            {lastCheck && (
              <span className="text-xs text-muted-foreground">
                Dernière vérification: {lastCheck.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleConnect}
              disabled={isConnected}
              size="sm"
            >
              Démarrer le polling
            </Button>
            
            <Button
              onClick={handleDisconnect}
              disabled={!isConnected}
              variant="outline"
              size="sm"
            >
              Arrêter le polling
            </Button>
            
            <Button
              onClick={handleCheckNow}
              disabled={!isConnected}
              variant="outline"
              size="sm"
            >
              Vérifier maintenant
            </Button>
            
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>

          {/* Notifications List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Notifications ({notifications.length})</h3>
              {notifications.length > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  size="sm"
                >
                  Tout marquer comme lu
                </Button>
              )}
            </div>
            
            {isLoading ? (
              <div className="text-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-4">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune notification</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.isRead 
                        ? 'bg-muted/50' 
                        : 'bg-primary/5 border-primary/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      
                      {!notification.isRead && (
                        <Button
                          onClick={() => handleMarkAsRead(notification.id)}
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                        >
                          Marquer comme lu
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
