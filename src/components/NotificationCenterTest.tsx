import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationCenter } from '@/components/social/NotificationCenter';
import { useNotifications } from '@/lib/apiComponent/hooks/useNotifications';
import { Bell, RefreshCw, Wifi, WifiOff, Plus, Trash2 } from 'lucide-react';

export function NotificationCenterTest() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    getNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const [testNotifications, setTestNotifications] = useState<any[]>([]);

  const addTestNotification = () => {
    const newNotification = {
      id: `test-${Date.now()}`,
      title: `Notification de test ${testNotifications.length + 1}`,
      message: `Ceci est une notification de test générée à ${new Date().toLocaleTimeString()}`,
      type: 'INFO',
      isRead: false,
      createdAt: new Date().toISOString(),
      data: {}
    };
    
    setTestNotifications(prev => [newNotification, ...prev]);
  };

  const clearTestNotifications = () => {
    setTestNotifications([]);
  };

  const handleRefresh = async () => {
    try {
      await getNotifications({ page: 1, limit: 10 });
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setTestNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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
            Test du Centre de Notifications
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
              {unreadCount} non lues (API)
            </Badge>

            <Badge variant="secondary">
              {testNotifications.filter(n => !n.isRead).length} non lues (Test)
            </Badge>
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={addTestNotification}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter notification test
            </Button>
            
            <Button
              onClick={clearTestNotifications}
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Vider les tests
            </Button>
            
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser API
            </Button>
            
            <Button
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Tout marquer comme lu
            </Button>
          </div>

          {/* Notification Center Preview */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Aperçu du centre de notifications :</h3>
            <div className="flex justify-center">
              <NotificationCenter />
            </div>
          </div>

          {/* API Notifications */}
          <div className="space-y-2">
            <h3 className="font-medium">Notifications API ({notifications.length})</h3>
            <div className="bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune notification API</p>
              ) : (
                notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="text-xs mb-2 p-2 bg-background rounded">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-muted-foreground">{notification.message}</div>
                    <div className="text-muted-foreground">
                      Lu: {notification.isRead ? 'Oui' : 'Non'} | 
                      Type: {notification.type} | 
                      ID: {notification.id}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Test Notifications */}
          <div className="space-y-2">
            <h3 className="font-medium">Notifications de test ({testNotifications.length})</h3>
            <div className="bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">
              {testNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune notification de test</p>
              ) : (
                testNotifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="text-xs mb-2 p-2 bg-background rounded">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-muted-foreground">{notification.message}</div>
                    <div className="text-muted-foreground">
                      Lu: {notification.isRead ? 'Oui' : 'Non'} | 
                      Créé: {new Date(notification.createdAt).toLocaleTimeString()}
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
              <li>• Vérifiez que le compteur de notifications non lues est correct</li>
              <li>• Testez les actions : marquer comme lu, tout marquer comme lu</li>
              <li>• Vérifiez la navigation vers la page des notifications</li>
              <li>• Testez avec des notifications API et de test</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
