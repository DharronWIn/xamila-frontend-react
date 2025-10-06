import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/lib/apiComponent/hooks/useNotifications';
import { simpleNotificationService } from '@/lib/apiComponent/services/simpleNotificationService';
import { Bug, RefreshCw, Database, AlertTriangle } from 'lucide-react';

export function NotificationDebug() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    isConnected,
    getNotifications,
    getUnreadCount
  } = useNotifications();

  const [debugInfo, setDebugInfo] = useState<any>({});
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheck(simpleNotificationService.getLastCheckTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    try {
      await getNotifications({ page: 1, limit: 10 });
      await getUnreadCount();
      
      setDebugInfo({
        notificationsType: typeof notifications,
        notificationsIsArray: Array.isArray(notifications),
        notificationsLength: notifications?.length || 0,
        unreadCountType: typeof unreadCount,
        unreadCountValue: unreadCount,
        isLoading,
        error,
        isConnected,
        lastCheck: simpleNotificationService.getLastCheckTime(),
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Debug refresh error:', err);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debug des Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{unreadCount || 0}</div>
              <div className="text-xs text-muted-foreground">Non lues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{notifications?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Polling</div>
            </div>
            <div className="text-center">
              <Badge variant={isLoading ? 'secondary' : 'outline'}>
                {isLoading ? 'Chargement' : 'Idle'}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">État</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button onClick={handleRefresh} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button 
              onClick={() => simpleNotificationService.startPolling()} 
              disabled={isConnected}
              variant="outline"
              size="sm"
            >
              Démarrer
            </Button>
            <Button 
              onClick={() => simpleNotificationService.stopPolling()} 
              disabled={!isConnected}
              variant="outline"
              size="sm"
            >
              Arrêter
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="font-medium text-destructive">Erreur</span>
              </div>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Debug Information */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Informations de débogage
            </h3>
            <div className="bg-muted p-3 rounded-lg text-xs font-mono max-h-64 overflow-y-auto">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          </div>

          {/* Notifications Preview */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Aperçu des notifications</h3>
            <div className="bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">
              {notifications && Array.isArray(notifications) ? (
                notifications.length > 0 ? (
                  notifications.slice(0, 3).map((notification, index) => (
                    <div key={notification.id || index} className="text-xs mb-2 p-2 bg-background rounded">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-muted-foreground">{notification.message}</div>
                      <div className="text-muted-foreground">
                        ID: {notification.id} | Lu: {notification.isRead ? 'Oui' : 'Non'}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Aucune notification</p>
                )
              ) : (
                <p className="text-destructive">
                  Erreur: notifications n'est pas un tableau ({typeof notifications})
                </p>
              )}
            </div>
          </div>

          {/* Last Check Time */}
          {lastCheck && (
            <div className="text-xs text-muted-foreground">
              Dernière vérification: {lastCheck.toLocaleString('fr-FR')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
