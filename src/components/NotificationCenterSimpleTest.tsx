import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationCenter } from '@/components/social/NotificationCenter';
import { useNotifications } from '@/lib/apiComponent/hooks/useNotifications';
import { simpleNotificationService } from '@/lib/apiComponent/services/simpleNotificationService';
import { Bell, RefreshCw, Wifi, WifiOff, Play, Pause } from 'lucide-react';

export function NotificationCenterSimpleTest() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    getNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const handleRefresh = async () => {
    try {
      await getNotifications({ page: 1, limit: 10 });
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  };

  const handleStartPolling = () => {
    simpleNotificationService.startPolling();
  };

  const handleStopPolling = () => {
    simpleNotificationService.stopPolling();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Test Simple du Centre de Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
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

            <Badge variant="secondary">
              {notifications.length} total
            </Badge>
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            
            {!isConnected ? (
              <Button
                onClick={handleStartPolling}
                size="sm"
              >
                <Play className="h-4 w-4 mr-1" />
                Démarrer polling
              </Button>
            ) : (
              <Button
                onClick={handleStopPolling}
                variant="outline"
                size="sm"
              >
                <Pause className="h-4 w-4 mr-1" />
                Arrêter polling
              </Button>
            )}
            
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                size="sm"
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>

          {/* Notification Center Preview */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Centre de notifications :</h3>
            <div className="flex justify-center">
              <NotificationCenter />
            </div>
          </div>

          {/* Debug Info */}
          <div className="space-y-2">
            <h3 className="font-medium">Informations de débogage</h3>
            <div className="bg-muted p-3 rounded-lg text-xs font-mono">
              <div>Notifications: {notifications.length}</div>
              <div>Non lues: {unreadCount}</div>
              <div>Chargement: {isLoading ? 'Oui' : 'Non'}</div>
              <div>Connecté: {isConnected ? 'Oui' : 'Non'}</div>
              <div>Polling actif: {simpleNotificationService.getConnectionStatus() ? 'Oui' : 'Non'}</div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-2">
            <h3 className="font-medium">Notifications API ({notifications.length})</h3>
            <div className="bg-muted p-3 rounded-lg max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune notification</p>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="text-xs mb-2 p-2 bg-background rounded border">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-muted-foreground">{notification.message}</div>
                    <div className="text-muted-foreground">
                      Type: {notification.type} | 
                      Lu: {notification.isRead ? 'Oui' : 'Non'} | 
                      ID: {notification.id}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-2">Instructions de test :</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Cliquez sur l'icône de notification pour ouvrir le menu déroulant</li>
              <li>• Vérifiez que le compteur affiche le bon nombre de notifications non lues</li>
              <li>• Testez les actions : marquer comme lu, tout marquer comme lu</li>
              <li>• Vérifiez la navigation vers la page des notifications</li>
              <li>• Testez le démarrage/arrêt du polling</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
