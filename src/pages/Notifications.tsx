import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Trophy,
  DollarSign,
  Calendar,
  Settings,
  Trash2,
  Eye,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNotifications } from "@/lib/apiComponent/hooks/useNotifications";
import { Notification as ApiNotification, NotificationType } from "@/lib/apiComponent/types";
import { simpleNotificationService } from "@/lib/apiComponent/services/simpleNotificationService";
import { toast } from "@/hooks/use-toast";

// Local notification interface for UI compatibility
interface LocalNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "info" | "reminder";
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

// Convert API notification to local format
const convertApiNotification = (apiNotification: ApiNotification): LocalNotification => {
  const typeMap: Record<NotificationType, "success" | "warning" | "info" | "reminder"> = {
    SUCCESS: "success",
    WARNING: "warning", 
    INFO: "info",
    REMINDER: "reminder"
  };

  return {
    id: apiNotification.id,
    title: apiNotification.title,
    message: apiNotification.message,
    type: typeMap[apiNotification.type],
    read: apiNotification.isRead,
    timestamp: apiNotification.createdAt,
    actionUrl: (apiNotification.data as { actionUrl?: string })?.actionUrl
  };
};

export default function Notifications() {
  const [notificationList, setNotificationList] = useState<LocalNotification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    savingsReminders: true,
    achievementAlerts: true
  });

  // Use the notifications hook
  const {
    notifications: apiNotifications,
    unreadCount,
    isLoading,
    error,
    isConnected,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications
  } = useNotifications();

  // Load notifications on component mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await getNotifications({ 
          page: 1, 
          limit: 50,
          status: filter === "all" ? undefined : filter === "unread" ? "unread" : "read"
        });
        await getUnreadCount();
      } catch (err) {
        console.error("Failed to load notifications:", err);
        toast({
          title: "Erreur",
          description: "Impossible de charger les notifications",
          variant: "destructive"
        });
      }
    };

    loadNotifications();
  }, [getNotifications, getUnreadCount, filter]);

  // Convert API notifications to local format
  useEffect(() => {
    if (apiNotifications && Array.isArray(apiNotifications)) {
      const localNotifications = apiNotifications.map(convertApiNotification);
      setNotificationList(localNotifications);
    } else {
      setNotificationList([]);
    }
  }, [apiNotifications]);

  // Real-time updates are handled by the polling service
  useEffect(() => {
    // Ensure polling is started when on notifications page
    if (!simpleNotificationService.getConnectionStatus()) {
      simpleNotificationService.startPolling();
    }
    
    // Cleanup: stop polling when leaving the page
    return () => {
      // Note: We don't stop polling here as it should continue for the topbar
      // The polling will be managed globally
    };
  }, []);

  const localUnreadCount = notificationList.filter(n => !n.read).length;

  const filteredNotifications = notificationList.filter(notification => {
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      toast({
        title: "Succès",
        description: "Notification marquée comme lue",
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsUnread = (id: string) => {
    setNotificationList(prev => 
      prev.map(n => n.id === id ? { ...n, read: false } : n)
    );
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      toast({
        title: "Succès",
        description: "Notification supprimée",
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification",
        variant: "destructive"
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues",
      });
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      toast({
        title: "Erreur",
        description: "Impossible de marquer toutes les notifications comme lues",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await getNotifications({ 
        page: 1, 
        limit: 50,
        status: filter === "all" ? undefined : filter === "unread" ? "unread" : "read"
      });
      await getUnreadCount();
      toast({
        title: "Actualisé",
        description: "Notifications mises à jour",
      });
    } catch (err) {
      console.error("Failed to refresh notifications:", err);
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser les notifications",
        variant: "destructive"
      });
    }
  };

  const handleStartPolling = () => {
    simpleNotificationService.startPolling();
    toast({
      title: "Polling démarré",
      description: "Les notifications seront vérifiées automatiquement",
    });
  };

  const handleStopPolling = () => {
    simpleNotificationService.stopPolling();
    toast({
      title: "Polling arrêté",
      description: "La vérification automatique des notifications est arrêtée",
    });
  };

  const handleCheckNow = async () => {
    try {
      await simpleNotificationService.checkNow();
      toast({
        title: "Vérification effectuée",
        description: "Les notifications ont été vérifiées",
      });
    } catch (err) {
      console.error("Failed to check notifications:", err);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier les notifications",
        variant: "destructive"
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-5 w-5 text-primary" />;
      case "warning": return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "info": return <Info className="h-5 w-5 text-accent" />;
      case "reminder": return <Calendar className="h-5 w-5 text-accent" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Restez informé de votre progression et des nouveautés
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-gradient-accent text-white">
            {localUnreadCount} non lues
          </Badge>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Polling actif' : 'Polling arrêté'}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            {!isConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartPolling}
              >
                Démarrer
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStopPolling}
              >
                Arrêter
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckNow}
              disabled={!isConnected}
            >
              Vérifier
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters and Actions */}
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-2">
                  <Button 
                    variant={filter === "all" ? "premium" : "outline"}
                    onClick={() => setFilter("all")}
                    size="sm"
                  >
                    Toutes ({notificationList.length})
                  </Button>
                  <Button 
                    variant={filter === "unread" ? "premium" : "outline"}
                    onClick={() => setFilter("unread")}
                    size="sm"
                  >
                    Non lues ({localUnreadCount})
                  </Button>
                  <Button 
                    variant={filter === "read" ? "premium" : "outline"}
                    onClick={() => setFilter("read")}
                    size="sm"
                  >
                    Lues ({notificationList.length - localUnreadCount})
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={localUnreadCount === 0 || isLoading}
                >
                  Tout marquer comme lu
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <div className="space-y-3">
            {isLoading && notificationList.length === 0 ? (
              <Card className="bg-gradient-card border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold mb-2">Chargement des notifications...</h3>
                  <p className="text-muted-foreground">
                    Veuillez patienter pendant que nous récupérons vos notifications.
                  </p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="bg-gradient-card border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
                  <p className="text-muted-foreground mb-4">
                    {error}
                  </p>
                  <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réessayer
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Card className={`border-0 shadow-lg hover:shadow-glow transition-all duration-300 ${
                      !notification.read 
                        ? "bg-gradient-card border-l-4 border-l-primary" 
                        : "bg-gradient-card opacity-80"
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-2" />
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              
                              <div className="flex gap-2">
                                {notification.actionUrl && (
                                  <Button variant="outline" size="sm">
                                    Voir
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => notification.read ? handleMarkAsUnread(notification.id) : handleMarkAsRead(notification.id)}
                                  disabled={isLoading}
                                >
                                  {notification.read ? (
                                    <Eye className="h-3 w-3" />
                                  ) : (
                                    <CheckCircle className="h-3 w-3" />
                                  )}
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  disabled={isLoading}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {filteredNotifications.length === 0 && (
                  <Card className="bg-gradient-card border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {filter === "unread" ? "Aucune notification non lue" : "Aucune notification"}
                      </h3>
                      <p className="text-muted-foreground">
                        {filter === "unread" 
                          ? "Toutes vos notifications ont été lues !" 
                          : "Vous n'avez aucune notification pour le moment."
                        }
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-4">
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Préférences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="text-sm">
                  Notifications email
                </Label>
                <Switch 
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({...prev, emailNotifications: checked}))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-sm">
                  Notifications push
                </Label>
                <Switch 
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({...prev, pushNotifications: checked}))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="weekly-digest" className="text-sm">
                  Résumé hebdomadaire
                </Label>
                <Switch 
                  id="weekly-digest"
                  checked={settings.weeklyDigest}
                  onCheckedChange={(checked) => setSettings(prev => ({...prev, weeklyDigest: checked}))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="savings-reminders" className="text-sm">
                  Rappels d'épargne
                </Label>
                <Switch 
                  id="savings-reminders"
                  checked={settings.savingsReminders}
                  onCheckedChange={(checked) => setSettings(prev => ({...prev, savingsReminders: checked}))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="achievement-alerts" className="text-sm">
                  Alertes de succès
                </Label>
                <Switch 
                  id="achievement-alerts"
                  checked={settings.achievementAlerts}
                  onCheckedChange={(checked) => setSettings(prev => ({...prev, achievementAlerts: checked}))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                Résumé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cette semaine</span>
                <Badge variant="secondary">5 nouvelles</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ce mois</span>
                <Badge variant="secondary">23 nouvelles</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Objectifs atteints</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary">3</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Ad Placement */}
          <Card className="bg-gradient-accent border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-white mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-2">Optimisez votre épargne</h3>
              <p className="text-white/80 text-sm mb-3">
                Découvrez nos conseils personnalisés
              </p>
              <Button variant="secondary" size="sm">
                En savoir plus
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}