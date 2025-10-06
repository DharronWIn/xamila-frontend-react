import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Bell,
    Users,
    MessageCircle,
    Heart,
    UserPlus,
    Trophy,
    Target,
    Search, Download,
    Eye,
    Edit,
    Trash2,
    BarChart3,
    PieChart, MoreHorizontal,
    Send,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useAdminNotifications } from "@/lib/apiComponent/hooks/useAdmin";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { toast } from "sonner";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const NotificationsManagement = () => {
  const { user: currentUser } = useAuth();
  
  // Utilisation des hooks admin
  const {
    notifications,
    isLoading,
    error,
    pagination,
    broadcastNotification,
    getNotifications,
    getNotificationStats
  } = useAdminNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationStats, setNotificationStats] = useState<any>(null);

  // Charger les notifications et statistiques
  useEffect(() => {
    const loadData = async () => {
      try {
        await getNotifications(currentPage, 20, typeFilter !== 'all' ? typeFilter : undefined, statusFilter !== 'all' ? statusFilter : undefined);
        const stats = await getNotificationStats('week');
        setNotificationStats(stats);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    loadData();
  }, [currentPage, typeFilter, statusFilter, getNotifications, getNotificationStats]);

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Bell className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions pour gérer les notifications.</p>
        </div>
      </div>
    );
  }

  if (isLoading && (!notifications || notifications.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Bell className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // Filter notifications
  const filteredNotifications = (notifications || []).filter(notification => {
    const matchesSearch = notification.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.fromUserName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'read' && notification.isRead) ||
                         (statusFilter === 'unread' && !notification.isRead);
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const notificationDate = new Date(notification.createdAt);
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          matchesDate = notificationDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = notificationDate >= weekAgo;
          break;
        case 'month':
          matchesDate = notificationDate.getMonth() === now.getMonth() && 
                       notificationDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Calculate stats
  const totalNotifications = (notifications || []).length;
  const unreadNotifications = (notifications || []).filter(n => !n.isRead).length;
  const readNotifications = (notifications || []).filter(n => n.isRead).length;
  const todayNotifications = (notifications || []).filter(n => 
    new Date(n.createdAt).toDateString() === new Date().toDateString()
  ).length;

  // Helper functions
  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'like':
        return 'Like';
      case 'comment':
        return 'Commentaire';
      case 'friend_request':
        return 'Demande d\'ami';
      case 'friend_accepted':
        return 'Ami accepté';
      case 'group_invite':
        return 'Invitation groupe';
      case 'milestone':
        return 'Objectif atteint';
      case 'challenge':
        return 'Défi';
      default:
        return 'Notification';
    }
  };

  const notificationTypeStats = (notifications || []).reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(notificationTypeStats).map(([type, count], index) => ({
    name: getNotificationTypeLabel(type),
    value: count,
    color: COLORS[index % COLORS.length],
  }));

  const dailyStats = (notifications || []).reduce((acc, notification) => {
    const date = new Date(notification.createdAt).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(dailyStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      count,
    }));

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-600" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-green-600" />;
      case 'friend_accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'group_invite':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'milestone':
        return <Target className="w-4 h-4 text-orange-600" />;
      case 'challenge':
        return <Trophy className="w-4 h-4 text-yellow-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationStatusBadge = (notification: Notification) => {
    if (notification.isRead) {
      return <Badge className="bg-green-100 text-green-800">Lu</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Non lu</Badge>;
    }
  };

  const handleSendNotification = (formData: { type: string; content: string; targetUsers: string }) => {
    // Mock implementation
    toast.success('Notification envoyée avec succès');
    setIsSendModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Notifications</h1>
          <p className="text-gray-600 mt-1">
            Envoi et suivi des notifications utilisateurs
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button 
            size="sm"
            onClick={() => setIsSendModalOpen(true)}
          >
            <Send className="w-4 h-4 mr-2" />
            Envoyer notification
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total notifications</p>
                <p className="text-2xl font-bold text-blue-600">{totalNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Non lues</p>
                <p className="text-2xl font-bold text-red-600">{unreadNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Lues</p>
                <p className="text-2xl font-bold text-green-600">{readNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aujourd'hui</p>
                <p className="text-2xl font-bold text-orange-600">{todayNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Notification Types Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    <span>Types de notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {typeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={typeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({name, percentage}) => `${name} ${percentage?.toFixed(1)}%`}
                        >
                          {typeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} notifications`, '']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                      Aucune donnée à afficher
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Daily Notifications Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>Notifications par jour</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filtres et recherche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Rechercher dans les notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="like">Likes</SelectItem>
                      <SelectItem value="comment">Commentaires</SelectItem>
                      <SelectItem value="friend_request">Demandes d'ami</SelectItem>
                      <SelectItem value="friend_accepted">Amis acceptés</SelectItem>
                      <SelectItem value="group_invite">Invitations groupe</SelectItem>
                      <SelectItem value="milestone">Objectifs</SelectItem>
                      <SelectItem value="challenge">Défis</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="read">Lues</SelectItem>
                      <SelectItem value="unread">Non lues</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les périodes</SelectItem>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Table */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications ({filteredNotifications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Contenu</TableHead>
                        <TableHead>De</TableHead>
                        <TableHead>Vers</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNotifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {getNotificationTypeIcon(notification.type)}
                              <span className="text-sm">{getNotificationTypeLabel(notification.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm truncate max-w-[200px]">{notification.content}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {notification.fromUserAvatar ? (
                                <img 
                                  src={notification.fromUserAvatar} 
                                  alt={notification.fromUserName}
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Users className="w-3 h-3 text-gray-600" />
                                </div>
                              )}
                              <span className="text-sm">{notification.fromUserName || 'Système'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">User {notification.userId}</span>
                          </TableCell>
                          <TableCell>
                            {getNotificationStatusBadge(notification)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {new Date(notification.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedNotification(notification);
                                    setIsViewModalOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Voir détails
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Read vs Unread Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Statut des notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Notifications lues</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="font-medium">{readNotifications}</span>
                        <span className="text-sm text-gray-500">
                          ({totalNotifications > 0 ? ((readNotifications / totalNotifications) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Notifications non lues</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="font-medium">{unreadNotifications}</span>
                        <span className="text-sm text-gray-500">
                          ({totalNotifications > 0 ? ((unreadNotifications / totalNotifications) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Notification Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Types les plus fréquents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {typeData.slice(0, 5).map((type, index) => (
                      <div key={type.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: type.color }} />
                          <span className="text-sm">{type.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{type.value}</p>
                          <p className="text-xs text-gray-500">
                            {totalNotifications > 0 ? ((type.value / totalNotifications) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Notification Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de la notification</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <div className="flex items-center space-x-1 mt-1">
                    {getNotificationTypeIcon(selectedNotification.type)}
                    <span className="text-sm">{getNotificationTypeLabel(selectedNotification.type)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Statut</label>
                  <div className="mt-1">{getNotificationStatusBadge(selectedNotification)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">De</label>
                  <p className="text-sm">{selectedNotification.fromUserName || 'Système'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Vers</label>
                  <p className="text-sm">User {selectedNotification.userId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-sm">{new Date(selectedNotification.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Heure</label>
                  <p className="text-sm">{new Date(selectedNotification.createdAt).toLocaleTimeString('fr-FR')}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Contenu</label>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedNotification.content}</p>
              </div>
              {selectedNotification.postId && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Post ID</label>
                  <p className="text-sm">{selectedNotification.postId}</p>
                </div>
              )}
              {selectedNotification.groupId && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Groupe ID</label>
                  <p className="text-sm">{selectedNotification.groupId}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Notification Modal */}
      <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Envoyer une notification</DialogTitle>
          </DialogHeader>
          <SendNotificationForm onSubmit={handleSendNotification} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Send Notification Form Component
interface SendNotificationFormProps {
  onSubmit: (data: { type: string; content: string; targetUsers: string }) => void;
}

function SendNotificationForm({ onSubmit }: SendNotificationFormProps) {
  const [formData, setFormData] = useState({
    type: 'challenge',
    content: '',
    targetUsers: 'all',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Type de notification</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="challenge">Défi</SelectItem>
            <SelectItem value="milestone">Objectif atteint</SelectItem>
            <SelectItem value="group_invite">Invitation groupe</SelectItem>
            <SelectItem value="friend_request">Demande d'ami</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="targetUsers">Cible</Label>
        <Select value={formData.targetUsers} onValueChange={(value) => setFormData({...formData, targetUsers: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les utilisateurs</SelectItem>
            <SelectItem value="premium">Utilisateurs Premium</SelectItem>
            <SelectItem value="active">Utilisateurs actifs</SelectItem>
            <SelectItem value="specific">Utilisateurs spécifiques</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="content">Contenu</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          placeholder="Tapez votre message ici..."
          required
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={() => setFormData({type: 'challenge', content: '', targetUsers: 'all'})}>
          Annuler
        </Button>
        <Button type="submit">
          <Send className="w-4 h-4 mr-2" />
          Envoyer
        </Button>
      </div>
    </form>
  );
}

export default NotificationsManagement;
