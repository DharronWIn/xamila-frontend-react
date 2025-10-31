import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Users,
  Trophy,
  Search, Download,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  PieChart, MoreHorizontal,
  Heart,
  Share2,
  MessageSquare,
  Target,
  Lightbulb,
  HelpCircle,
  PartyPopper,
  TrendingUp,
  Plus,
  Loader2,
  RefreshCw,
  Euro,
  Calendar,
  Clock,
  Award,
  X
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
import { useAdminSocial, useAdminChallenges } from "@/lib/apiComponent/hooks/useAdmin";
import { usePosts } from "@/lib/apiComponent/hooks/useSocial";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { toast } from "sonner";
import { Challenge } from "@/stores/socialStore";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SocialManagement = () => {
  const { user: currentUser } = useAuth();
  
  // Utilisation des hooks admin
  const {
    posts,
    isLoading,
    error,
    getPosts,
    getComments,
    getSocialStats,
    deletePost,
    deleteComment,
    updatePost,
    togglePostVisible
  } = useAdminSocial();
  
  // Hook pour les défis (si nécessaire pour deleteChallenge et createChallenge)
  const {
    deleteChallenge: deleteChallengeFromApi,
    createChallenge: createChallengeAdmin,
    isLoading: isChallengeLoading,
    getChallenges: refreshChallenges
  } = useAdminChallenges();
  
  // Hook pour créer des posts (on utilise le hook client car pas de méthode admin spécifique)
  const { createPost, isLoading: isPosting } = usePosts();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [postTypeFilter, setPostTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [challengeTypeFilter, setChallengeTypeFilter] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isCreateChallengeModalOpen, setIsCreateChallengeModalOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        const [postsData, statsData] = await Promise.all([
          getPosts({ page: 1, limit: 50 }),
          getSocialStats()
        ]);
        setStats(statsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };

    loadData();
  }, [getPosts, getSocialStats]);

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions pour gérer le contenu social.</p>
        </div>
      </div>
    );
  }

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement du contenu social...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = postTypeFilter === 'all' || post.type === postTypeFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const postDate = new Date(post.createdAt);
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          matchesDate = postDate.toDateString() === now.toDateString();
          break;
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = postDate >= weekAgo;
          break;
        }
        case 'month':
          matchesDate = postDate.getMonth() === now.getMonth() && 
                       postDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Filter challenges - utiliser les stats de l'API
  const challengesList = Array.isArray(stats?.challenges) ? stats.challenges : [];
  const filteredChallenges = challengesList.filter((challenge: any) => {
    const matchesSearch = challenge.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = challengeTypeFilter === 'all' || challenge.type === challengeTypeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate challenge stats
  const activeChallenges = challengesList.filter((ch: any) => ch.isActive !== false).length;
  const totalParticipants = challengesList.reduce((sum: number, ch: any) => {
    return sum + (ch.participants?.length || ch._count?.participants || 0);
  }, 0);

  // Calculate stats - utiliser les données du backend
  const totalPosts = stats?.posts?.total || posts.length;
  const totalLikes = stats?.likes?.total || posts.reduce((sum, post) => sum + (post.likesCount || post.likes || 0), 0);
  const totalComments = stats?.comments?.total || posts.reduce((sum, post) => sum + (post.commentsCount || 0), 0);
  const totalShares = stats?.posts?.totalShares || posts.reduce((sum, post) => sum + (post.shares || 0), 0);
  const totalEngagement = totalLikes + totalComments + totalShares;

  // Helper functions
  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'savings_milestone':
        return 'Objectif atteint';
      case 'motivation':
        return 'Motivation';
      case 'tip':
        return 'Conseil';
      case 'question':
        return 'Question';
      case 'celebration':
        return 'Célébration';
      default:
        return 'Post';
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'Mensuel';
      case 'weekly':
        return 'Hebdomadaire';
      case 'daily':
        return 'Quotidien';
      case 'custom':
        return 'Personnalisé';
      default:
        return 'Défi';
    }
  };

  const postTypeStats = posts.reduce((acc, post) => {
    acc[post.type] = (acc[post.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Utiliser les stats depuis l'API ou un tableau vide pour éviter l'erreur
  const challengesFromStats = stats?.challenges || [];
  const challengeTypeStats = (Array.isArray(challengesFromStats) ? challengesFromStats : []).reduce((acc: Record<string, number>, challenge: any) => {
    if (challenge?.type) {
    acc[challenge.type] = (acc[challenge.type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const postTypeData = Object.entries(postTypeStats).map(([type, count], index) => ({
    name: getPostTypeLabel(type),
    value: count,
    color: COLORS[index % COLORS.length],
  }));

  const challengeTypeData = Object.entries(challengeTypeStats).map(([type, count], index) => ({
    name: getChallengeTypeLabel(type),
    value: count,
    color: COLORS[index % COLORS.length],
  }));

  const engagementData = posts.map(post => ({
    name: post.user?.firstName && post.user?.lastName 
      ? `${post.user.firstName} ${post.user.lastName}` 
      : post.user?.email || 'Utilisateur',
    likes: post.likesCount || post.likes || 0,
    comments: post.commentsCount || 0,
    shares: post.shares || 0,
    total: (post.likesCount || post.likes || 0) + (post.commentsCount || 0) + (post.shares || 0),
  })).sort((a, b) => b.total - a.total).slice(0, 10);

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'savings_milestone':
        return <Target className="w-4 h-4 text-green-600" />;
      case 'motivation':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      case 'question':
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
      case 'celebration':
        return <PartyPopper className="w-4 h-4 text-pink-600" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPostStatusBadge = (post: any) => {
    const engagement = (post.likesCount || post.likes || 0) + (post.commentsCount || 0) + (post.shares || 0);
    if (engagement > 50) {
      return <Badge className="bg-green-100 text-green-800">Viral</Badge>;
    } else if (engagement > 20) {
      return <Badge className="bg-blue-100 text-blue-800">Populaire</Badge>;
    } else if (engagement > 5) {
      return <Badge className="bg-yellow-100 text-yellow-800">Engagé</Badge>;
    } else {
      return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getChallengeStatusBadge = (challenge: Challenge) => {
    if (challenge.isActive) {
      return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
    } else {
      return <Badge variant="outline">Terminé</Badge>;
    }
  };

  // Fonctions de gestion
  const handleDeletePost = async (postId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      try {
        await deletePost(postId);
        toast.success('Post supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression du post');
      }
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce défi ?')) {
      try {
        await deleteChallengeFromApi(challengeId);
        toast.success('Défi supprimé avec succès');
        // Recharger les stats pour mettre à jour la liste
        const statsData = await getSocialStats();
        setStats(statsData);
      } catch (error) {
        toast.error('Erreur lors de la suppression du défi');
      }
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
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion Sociale</h1>
          <p className="text-gray-600 mt-1">
            Modération et analyse du contenu communautaire
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button 
            size="sm"
            onClick={() => setIsCreatePostModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau post
          </Button>
          <Button 
            size="sm"
            onClick={() => setIsCreateChallengeModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Nouveau défi
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total posts</p>
                <p className="text-2xl font-bold text-blue-600">{totalPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Défis actifs</p>
                <p className="text-2xl font-bold text-green-600">{activeChallenges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Heart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Engagement total</p>
                <p className="text-2xl font-bold text-purple-600">{totalEngagement}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Participants</p>
                <p className="text-2xl font-bold text-orange-600">{totalParticipants}</p>
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
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="challenges">Défis</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Post Types Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    <span>Types de posts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {postTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={postTypeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({name, percentage}) => `${name} ${percentage?.toFixed(1)}%`}
                        >
                          {postTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} posts`, '']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                      Aucune donnée à afficher
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Challenge Types Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span>Types de défis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {challengeTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={challengeTypeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({name, percentage}) => `${name} ${percentage?.toFixed(1)}%`}
                        >
                          {challengeTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} défis`, '']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                      Aucune donnée à afficher
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
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
                        placeholder="Rechercher dans les posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <Select value={postTypeFilter} onValueChange={setPostTypeFilter}>
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue placeholder="Type de post" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="savings_milestone">Objectifs</SelectItem>
                      <SelectItem value="motivation">Motivation</SelectItem>
                      <SelectItem value="tip">Conseils</SelectItem>
                      <SelectItem value="question">Questions</SelectItem>
                      <SelectItem value="celebration">Célébrations</SelectItem>
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

            {/* Posts Table */}
            <Card>
              <CardHeader>
                <CardTitle>Posts ({filteredPosts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Auteur</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Contenu</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPosts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="text-sm">
                                {post.user?.firstName && post.user?.lastName 
                                  ? `${post.user.firstName} ${post.user.lastName}` 
                                  : post.user?.email || 'Utilisateur'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {getPostTypeIcon(post.type)}
                              <span className="text-sm">{getPostTypeLabel(post.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm truncate max-w-[200px]">{post.content}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="flex items-center">
                                <Heart className="w-3 h-3 mr-1" />
                                {post.likesCount || post.likes || 0}
                              </span>
                              <span className="flex items-center">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                {post.commentsCount || 0}
                              </span>
                              <span className="flex items-center">
                                <Share2 className="w-3 h-3 mr-1" />
                                {post.shares || 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getPostStatusBadge(post)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString('fr-FR')}
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
                                    setSelectedPost(post);
                                    setIsViewModalOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Voir détails
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Modérer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeletePost(post.id)}
                                >
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

          <TabsContent value="challenges" className="space-y-6">
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
                        placeholder="Rechercher dans les défis..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <Select value={challengeTypeFilter} onValueChange={setChallengeTypeFilter}>
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue placeholder="Type de défi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="custom">Personnalisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Challenges Table */}
            <Card>
              <CardHeader>
                <CardTitle>Défis ({filteredChallenges.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant cible</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Créateur</TableHead>
                        <TableHead>Période</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredChallenges.map((challenge) => (
                        <TableRow key={challenge.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{challenge.title}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">{challenge.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{getChallengeTypeLabel(challenge.type)}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{challenge.targetAmount ? challenge.targetAmount.toLocaleString() : '0'}€</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{challenge.participants}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getChallengeStatusBadge(challenge)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{challenge.createdByName}</span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{new Date(challenge.startDate).toLocaleDateString('fr-FR')}</p>
                              <p className="text-gray-500">
                                au {new Date(challenge.endDate).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
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
                                    setSelectedChallenge(challenge);
                                    setIsChallengeModalOpen(true);
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
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteChallenge(challenge.id)}
                                >
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

          <TabsContent value="engagement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Top engagement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="likes" stroke="#EF4444" strokeWidth={2} name="Likes" />
                    <Line type="monotone" dataKey="comments" stroke="#3B82F6" strokeWidth={2} name="Commentaires" />
                    <Line type="monotone" dataKey="shares" stroke="#10B981" strokeWidth={2} name="Partages" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Post Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails du post</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Auteur</label>
                  <p className="text-sm">{selectedPost.userName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <div className="flex items-center space-x-1">
                    {getPostTypeIcon(selectedPost.type)}
                    <span className="text-sm">{getPostTypeLabel(selectedPost.type)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Likes</label>
                  <p className="text-sm">{selectedPost.likes}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Commentaires</label>
                  <p className="text-sm">{selectedPost.comments}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Partages</label>
                  <p className="text-sm">{selectedPost.shares}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-sm">{new Date(selectedPost.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Contenu</label>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedPost.content}</p>
              </div>
              {selectedPost.amount && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Montant</label>
                  <p className="text-sm font-bold">{selectedPost.amount.toLocaleString()}€</p>
                </div>
              )}
              {selectedPost.goal && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Objectif</label>
                  <p className="text-sm">{selectedPost.goal}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Challenge Details Modal */}
      <Dialog open={isChallengeModalOpen} onOpenChange={setIsChallengeModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails du défi</DialogTitle>
          </DialogHeader>
          {selectedChallenge && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Titre</label>
                  <p className="text-sm font-bold">{selectedChallenge.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <p className="text-sm">{getChallengeTypeLabel(selectedChallenge.type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Montant cible</label>
                  <p className="text-sm font-bold">{(selectedChallenge.targetAmount || 0).toLocaleString()}€</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Participants</label>
                  <p className="text-sm">{selectedChallenge.participants?.length || selectedChallenge._count?.participants || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Créateur</label>
                  <p className="text-sm">{selectedChallenge.createdByName || selectedChallenge.createdByUser?.username || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Statut</label>
                  <div className="mt-1">{getChallengeStatusBadge(selectedChallenge as Challenge)}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedChallenge.description || 'Aucune description'}</p>
              </div>
              {selectedChallenge.startDate && (
              <div>
                <label className="text-sm font-medium text-gray-600">Période</label>
                <p className="text-sm">
                    Du {new Date(selectedChallenge.startDate).toLocaleDateString('fr-FR')} 
                    {selectedChallenge.endDate && ` au ${new Date(selectedChallenge.endDate).toLocaleDateString('fr-FR')}`}
                </p>
              </div>
              )}
              {selectedChallenge.rewards && Array.isArray(selectedChallenge.rewards) && selectedChallenge.rewards.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Récompenses</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedChallenge.rewards.map((reward: any, index: number) => (
                      <Badge key={index} variant="outline">{reward}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Post Modal */}
      <CreatePostForm 
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={async () => {
          await getPosts({ page: 1, limit: 50 });
          const statsData = await getSocialStats();
          setStats(statsData);
        }}
      />

      {/* Create Challenge Modal */}
      <CreateChallengeForm 
        isOpen={isCreateChallengeModalOpen}
        onClose={() => setIsCreateChallengeModalOpen(false)}
        onChallengeCreated={async () => {
          await refreshChallenges({ page: 1, limit: 50 });
          const statsData = await getSocialStats();
          setStats(statsData);
        }}
      />
    </motion.div>
  );
};

// Create Post Form Component - Identique au composant client
interface CreatePostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

function CreatePostForm({ isOpen, onClose, onPostCreated }: CreatePostFormProps) {
  const { user: currentUser } = useAuth();
  const { createPost, isLoading: isPosting } = usePosts();

  const [content, setContent] = useState("");
  const [type, setType] = useState("MOTIVATION");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [goal, setGoal] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const postTypes = [
    {
      value: "SAVINGS_MILESTONE",
      label: "Objectif atteint",
      icon: Target,
      color: "bg-green-100 text-green-800",
      description: "Partagez vos réussites d'épargne",
    },
    {
      value: "MOTIVATION",
      label: "Motivation",
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-800",
      description: "Encouragez la communauté",
    },
    {
      value: "TIP",
      label: "Conseil",
      icon: Lightbulb,
      color: "bg-yellow-100 text-yellow-800",
      description: "Partagez vos astuces",
    },
    {
      value: "QUESTION",
      label: "Question",
      icon: HelpCircle,
      color: "bg-purple-100 text-purple-800",
      description: "Demandez de l'aide",
    },
    {
      value: "CELEBRATION",
      label: "Célébration",
      icon: PartyPopper,
      color: "bg-pink-100 text-pink-800",
      description: "Célébrez vos succès",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    const postData = {
      content: content.trim(),
      type: type as
        | "SAVINGS_MILESTONE"
        | "MOTIVATION"
        | "TIP"
        | "QUESTION"
        | "CELEBRATION",
      ...(title && { title: title.trim() }),
      ...(amount && { amount: parseFloat(amount) }),
      ...(goal && { goal: goal.trim() }),
      ...(images.length > 0 && { images }),
    };

    try {
      await createPost(postData);
      toast.success("Post publié ! 🎉");
      
      if (onPostCreated) {
        onPostCreated();
      }
      
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la création du post:", error);
      toast.error("Impossible de publier votre post. Veuillez réessayer.");
    }
  };

  const handleClose = () => {
    setContent("");
    setType("MOTIVATION");
    setTitle("");
    setAmount("");
    setGoal("");
    setImages([]);
    onClose();
  };

  const selectedType = postTypes.find((t) => t.value === type);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <span>Créer un nouveau post</span>
            {selectedType && (
              <Badge className={selectedType.color}>
                <selectedType.icon className="w-3 h-3 mr-1" />
                {selectedType.label}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post Type Selection */}
            <div className="space-y-3">
              <Label>Type de post</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {postTypes.map((postType) => (
                  <motion.div
                    key={postType.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      type="button"
                      onClick={() => setType(postType.value)}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        type === postType.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <postType.icon className="w-4 h-4" />
                        <span className="font-medium text-sm">
                          {postType.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 text-left">
                        {postType.description}
                      </p>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                placeholder="Ajoutez un titre accrocheur..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Un titre peut rendre votre post plus visible</span>
                <span>{title.length}/100</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <Label htmlFor="content">Contenu du post</Label>
        <Textarea
          id="content"
                placeholder="Partagez votre expérience avec la communauté..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Utilisez des hashtags pour plus de visibilité</span>
                <span>{content.length}/500</span>
      </div>
      </div>

            {/* Additional Fields based on type */}
            {(type === "SAVINGS_MILESTONE" || type === "CELEBRATION") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant épargné (€)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10"
        />
      </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal">Objectif</Label>
        <Input
                    id="goal"
                    placeholder="ex: Vacances d'été"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
        />
      </div>
              </div>
            )}

            {/* Preview */}
            {content && (
              <div className="space-y-3">
                <Label>Aperçu</Label>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {currentUser?.firstName?.charAt(0) || currentUser?.email?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {currentUser?.firstName && currentUser?.lastName
                          ? `${currentUser.firstName} ${currentUser.lastName}`
                          : currentUser?.email || "Admin"}
                      </p>
                      <p className="text-xs text-gray-500">Maintenant</p>
                    </div>
                  </div>
                  {title && (
                    <h4 className="font-bold text-gray-900 text-base mb-2">
                      {title}
                    </h4>
                  )}
                  <p className="text-sm">{content}</p>
                  {amount && (
                    <div className="mt-3 p-2 bg-green-100 rounded text-sm">
                      <span className="font-semibold text-green-800">
                        {amount}€
                      </span>
                      {goal && (
                        <span className="text-green-600"> pour {goal}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
          Annuler
        </Button>
              <Button
                type="submit"
                disabled={!content.trim() || isPosting}
                className="bg-primary hover:bg-primary/90"
              >
                {isPosting ? "Publication..." : "Publier"}
        </Button>
      </div>
    </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Create Challenge Form Component - Identique au composant client
interface CreateChallengeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengeCreated?: () => void;
}

function CreateChallengeForm({ isOpen, onClose, onChallengeCreated }: CreateChallengeFormProps) {
  const { user: currentUser } = useAuth();
  const { createChallenge: createChallengeAdmin, isLoading: isChallengeLoading } = useAdminChallenges();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("monthly");
  const [targetAmount, setTargetAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [rewards, setRewards] = useState<string[]>([]);
  const [newReward, setNewReward] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const challengeTypes = [
    {
      value: "monthly",
      label: "Mensuel",
      icon: Calendar,
      description: "Défi sur un mois",
      color: "bg-blue-100 text-blue-800"
    },
    {
      value: "weekly",
      label: "Hebdomadaire",
      icon: Clock,
      description: "Défi sur une semaine",
      color: "bg-green-100 text-green-800"
    },
    {
      value: "daily",
      label: "Quotidien",
      icon: Target,
      description: "Défi quotidien",
      color: "bg-purple-100 text-purple-800"
    },
    {
      value: "custom",
      label: "Personnalisé",
      icon: Trophy,
      description: "Durée personnalisée",
      color: "bg-orange-100 text-orange-800"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !targetAmount || !duration) return;

    // Calculer les dates de début et fin à partir de la durée
    const startDate = new Date();
    const endDate = new Date();
    const durationNum = parseInt(duration);
    
    if (type === "daily") {
      endDate.setDate(startDate.getDate() + durationNum);
    } else if (type === "weekly") {
      endDate.setDate(startDate.getDate() + (durationNum * 7));
    } else if (type === "monthly") {
      endDate.setMonth(startDate.getMonth() + durationNum);
    } else {
      // Custom - utiliser une durée de 30 jours par défaut
      endDate.setDate(startDate.getDate() + durationNum);
    }

    const challengeData = {
      title: title.trim(),
      description: description.trim(),
      type: type as any,
      targetAmount: parseFloat(targetAmount),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isActive: true,
      rewards: rewards.filter(r => r.trim()),
      ...(isPrivate && { isPrivate: true }),
    };

    try {
      await createChallengeAdmin(challengeData);
      toast.success("Défi créé avec succès ! 🎉");
      handleClose();
      if (onChallengeCreated) {
        onChallengeCreated();
      }
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error("Impossible de créer le défi. Veuillez réessayer.");
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setType("monthly");
    setTargetAmount("");
    setDuration("");
    setRewards([]);
    setNewReward("");
    setIsPrivate(false);
    onClose();
  };

  const addReward = () => {
    if (newReward.trim() && rewards.length < 5) {
      setRewards(prev => [...prev, newReward.trim()]);
      setNewReward("");
    }
  };

  const removeReward = (index: number) => {
    setRewards(prev => prev.filter((_, i) => i !== index));
  };

  const selectedType = challengeTypes.find(t => t.value === type);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span>Créer un nouveau défi</span>
            {selectedType && (
              <Badge className={selectedType.color}>
                <selectedType.icon className="w-3 h-3 mr-1" />
                {selectedType.label}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Challenge Type Selection */}
          <div className="space-y-3">
            <Label>Type de défi</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {challengeTypes.map((challengeType) => (
                <motion.div
                  key={challengeType.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="button"
                    onClick={() => setType(challengeType.value)}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      type === challengeType.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <challengeType.icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{challengeType.label}</span>
                    </div>
                    <p className="text-xs text-gray-600 text-left">
                      {challengeType.description}
                    </p>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
        <Label htmlFor="title">Titre du défi *</Label>
        <Input
          id="title"
                placeholder="ex: Défi Épargne de Noël"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Montant cible (€) *</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="500"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
      </div>

          <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
              placeholder="Décrivez le défi, ses objectifs et les règles..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Décrivez clairement les objectifs et règles</span>
              <span>{description.length}/500</span>
            </div>
      </div>

          {/* Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Durée *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="flex-1"
                />
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
                    <SelectItem value="daily">jours</SelectItem>
                    <SelectItem value="weekly">semaines</SelectItem>
                    <SelectItem value="monthly">mois</SelectItem>
            </SelectContent>
          </Select>
        </div>
        </div>
            <div className="space-y-2">
              <Label>Visibilité</Label>
              <Select value={isPrivate ? "private" : "public"} onValueChange={(value) => setIsPrivate(value === "private")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Privé</SelectItem>
                </SelectContent>
              </Select>
      </div>
        </div>

          {/* Rewards */}
          <div className="space-y-3">
            <Label>Récompenses (optionnel)</Label>
            <div className="space-y-2">
              <div className="flex space-x-2">
          <Input
                  placeholder="ex: Badge Économiste"
                  value={newReward}
                  onChange={(e) => setNewReward(e.target.value)}
                  maxLength={30}
                />
                <Button
                  type="button"
                  onClick={addReward}
                  disabled={!newReward.trim() || rewards.length >= 5}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
        </div>
              {rewards.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {rewards.map((reward, index) => (
                    <Badge key={index} variant="outline" className="flex items-center space-x-1">
                      <Award className="w-3 h-3" />
                      <span>{reward}</span>
                      <button
                        type="button"
                        onClick={() => removeReward(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
      </div>
              )}
              <p className="text-xs text-gray-500">
                Ajoutez jusqu'à 5 récompenses pour motiver les participants
              </p>
            </div>
      </div>

          {/* Preview */}
          {title && description && targetAmount && duration && (
            <div className="space-y-3">
              <Label>Aperçu</Label>
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{title}</h3>
                  <Badge className={selectedType?.color}>
                    {selectedType?.label}
                  </Badge>
      </div>
                <p className="text-sm text-gray-600 mb-3">{description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Euro className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{targetAmount}€</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{duration} {type === 'daily' ? 'jours' : type === 'weekly' ? 'semaines' : 'mois'}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>0 participants</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
          Annuler
        </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || !description.trim() || !targetAmount || !duration || isChallengeLoading}
              className="bg-primary hover:bg-primary/90"
            >
          <Trophy className="w-4 h-4 mr-2" />
              {isChallengeLoading ? "Création..." : "Créer le défi"}
        </Button>
      </div>
    </form>
      </DialogContent>
    </Dialog>
  );
}

export default SocialManagement;
