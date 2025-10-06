import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/lib/apiComponent/hooks/useNotifications';
import { simpleNotificationService } from '@/lib/apiComponent/services/simpleNotificationService';
import { Bell, RefreshCw, Wifi, WifiOff, CheckCircle } from 'lucide-react';

export function NotificationTest() {
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
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheck(simpleNotificationService.getLastCheckTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleStartPolling = () => {
    simpleNotificationService.startPolling();
    addTestResult('Polling démarré');
  };

  const handleStopPolling = () => {
    simpleNotificationService.stopPolling();
    addTestResult('Polling arrêté');
  };

  const handleCheckNow = async () => {
    try {
      await simpleNotificationService.checkNow();
      addTestResult('Vérification manuelle effectuée');
    } catch (error) {
      addTestResult(`Erreur: ${error}`);
    }
  };

  const handleRefresh = async () => {
    try {
      await getNotifications({ page: 1, limit: 10 });
      addTestResult('Notifications actualisées');
    } catch (error) {
      addTestResult(`Erreur actualisation: ${error}`);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      addTestResult(`Notification ${id} marquée comme lue`);
    } catch (error) {
      addTestResult(`Erreur marquage: ${error}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      addTestResult('Toutes les notifications marquées comme lues');
    } catch (error) {
      addTestResult(`Erreur marquage global: ${error}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Test des Notifications
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

            {lastCheck && (
              <span className="text-xs text-muted-foreground">
                Dernière vérification: {lastCheck.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleStartPolling}
              disabled={isConnected}
              size="sm"
            >
              Démarrer polling
            </Button>
            
            <Button
              onClick={handleStopPolling}
              disabled={!isConnected}
              variant="outline"
              size="sm"
            >
              Arrêter polling
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

          {/* Test Results */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Résultats des tests:</h3>
            <div className="bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun test effectué</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    {result}
                  </div>
                ))
              )}
            </div>
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
                      
                      <div className="flex gap-1 ml-2">
                        {!notification.isRead && (
                          <Button
                            onClick={() => handleMarkAsRead(notification.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
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
