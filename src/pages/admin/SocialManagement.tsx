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
import { useAdminSocial } from "@/lib/apiComponent/hooks/useAdmin";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { toast } from "sonner";
import { Post, Challenge } from "@/stores/socialStore";

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
    challenges,
    isLoading,
    error,
    getPosts,
    getChallenges,
    getSocialStats,
    deletePost,
    deleteChallenge
  } = useAdminSocial();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [postTypeFilter, setPostTypeFilter] = useState<string>('all');
  const [challengeTypeFilter, setChallengeTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
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
        const [postsData, challengesData, statsData] = await Promise.all([
          getPosts(),
          getChallenges(),
          getSocialStats()
        ]);
        setStats(statsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadData();
  }, [getPosts, getChallenges, getSocialStats]);

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

  if (isLoading && posts.length === 0 && challenges.length === 0) {
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
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.userName.toLowerCase().includes(searchQuery.toLowerCase());
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

  // Filter challenges
  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = challengeTypeFilter === 'all' || challenge.type === challengeTypeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate stats - utiliser les données du backend ou les données locales
  const totalPosts = stats?.totalPosts || posts.length;
  const totalChallenges = stats?.totalChallenges || challenges.length;
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);
  const totalShares = posts.reduce((sum, post) => sum + (post.shares || 0), 0);
  const totalEngagement = totalLikes + totalComments + totalShares;
  const activeChallenges = stats?.activeChallenges || challenges.filter(c => c.isActive || c.status === 'active').length;
  const totalParticipants = stats?.totalParticipants || challenges.reduce((sum, c) => sum + (c.participants || 0), 0);

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

  const challengeTypeStats = challenges.reduce((acc, challenge) => {
    acc[challenge.type] = (acc[challenge.type] || 0) + 1;
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
    name: post.userName,
    likes: post.likes,
    comments: post.comments,
    shares: post.shares,
    total: post.likes + post.comments + post.shares,
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

  const getPostStatusBadge = (post: Post) => {
    const engagement = post.likes + post.comments + post.shares;
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
        await deleteChallenge(challengeId);
        toast.success('Défi supprimé avec succès');
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
                              <span className="text-sm">{post.userName}</span>
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
                                {post.likes}
                              </span>
                              <span className="flex items-center">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                {post.comments}
                              </span>
                              <span className="flex items-center">
                                <Share2 className="w-3 h-3 mr-1" />
                                {post.shares}
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
                  <p className="text-sm font-bold">{selectedChallenge.targetAmount.toLocaleString()}€</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Participants</label>
                  <p className="text-sm">{selectedChallenge.participants}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Créateur</label>
                  <p className="text-sm">{selectedChallenge.createdByName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Statut</label>
                  <div className="mt-1">{getChallengeStatusBadge(selectedChallenge)}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedChallenge.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Période</label>
                <p className="text-sm">
                  Du {new Date(selectedChallenge.startDate).toLocaleDateString('fr-FR')} au {new Date(selectedChallenge.endDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {selectedChallenge.rewards.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Récompenses</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedChallenge.rewards.map((reward, index) => (
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
      <Dialog open={isCreatePostModalOpen} onOpenChange={setIsCreatePostModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Créer un nouveau post</span>
            </DialogTitle>
          </DialogHeader>
          <CreatePostForm onClose={() => setIsCreatePostModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Create Challenge Modal */}
      <Dialog open={isCreateChallengeModalOpen} onOpenChange={setIsCreateChallengeModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-green-600" />
              <span>Créer un nouveau défi</span>
            </DialogTitle>
          </DialogHeader>
          <CreateChallengeForm onClose={() => setIsCreateChallengeModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Create Post Form Component
interface CreatePostFormProps {
  onClose: () => void;
}

function CreatePostForm({ onClose }: CreatePostFormProps) {
  const [formData, setFormData] = useState({
    content: '',
    type: 'motivation',
    imageUrl: '',
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock implementation - in real app, this would call an API
    console.log('Creating post:', formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="content">Contenu du post *</Label>
        <Textarea
          id="content"
          placeholder="Écrivez votre post..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="mt-1"
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Type de post</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="motivation">Motivation</SelectItem>
            <SelectItem value="tip">Conseil</SelectItem>
            <SelectItem value="savings_milestone">Objectif atteint</SelectItem>
            <SelectItem value="question">Question</SelectItem>
            <SelectItem value="celebration">Célébration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="imageUrl">URL de l'image (optionnel)</Label>
        <Input
          id="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
        <Input
          id="tags"
          placeholder="épargne, motivation, conseil"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="mt-1"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Créer le post
        </Button>
      </div>
    </form>
  );
}

// Create Challenge Form Component
interface CreateChallengeFormProps {
  onClose: () => void;
}

function CreateChallengeForm({ onClose }: CreateChallengeFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'monthly',
    targetAmount: '',
    startDate: '',
    endDate: '',
    rewards: '',
    maxParticipants: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock implementation - in real app, this would call an API
    console.log('Creating challenge:', formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre du défi *</Label>
        <Input
          id="title"
          placeholder="Ex: Défi d'épargne mensuel"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Décrivez le défi..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type de défi</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensuel</SelectItem>
              <SelectItem value="weekly">Hebdomadaire</SelectItem>
              <SelectItem value="daily">Quotidien</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="targetAmount">Montant cible (€)</Label>
          <Input
            id="targetAmount"
            type="number"
            placeholder="1000"
            value={formData.targetAmount}
            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Date de début *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="endDate">Date de fin *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="mt-1"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="rewards">Récompenses (séparées par des virgules)</Label>
        <Input
          id="rewards"
          placeholder="Badge spécial, Points bonus, Certificat"
          value={formData.rewards}
          onChange={(e) => setFormData({ ...formData, rewards: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="maxParticipants">Nombre max de participants</Label>
        <Input
          id="maxParticipants"
          type="number"
          placeholder="100"
          value={formData.maxParticipants}
          onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
          className="mt-1"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          <Trophy className="w-4 h-4 mr-2" />
          Créer le défi
        </Button>
      </div>
    </form>
  );
}

export default SocialManagement;
