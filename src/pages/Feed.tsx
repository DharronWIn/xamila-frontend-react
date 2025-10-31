import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  MessageCircle, Plus,
  Filter,
  Search, Target,
  Lightbulb,
  HelpCircle,
  PartyPopper,
  TrendingUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePosts } from "@/lib/apiComponent/hooks/useSocial";
import { useChallenges, useCurrentChallengeQuery } from "@/lib/apiComponent/hooks/useChallenges";
import { Challenge } from "@/lib/apiComponent/types";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostCreateModal } from "@/components/social/PostCreateModal";
import { PostCard } from "@/components/social/PostCard";
import { CommentModal } from "@/components/social/CommentModal";
import PostSkeleton from "@/components/social/PostSkeleton";
import NetworkError from "@/components/social/NetworkError";
import { PartnerAdvertisement } from "@/components/ads/PartnerAdvertisement";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Feed = () => {
  const { user } = useAuth();
  
  // API hooks
  const {
    challenges: apiChallenges,
    isLoading: challengesLoading,
    getChallenges,
    getCurrentParticipation
  } = useChallenges();
  
  // Use the API hooks for posts
  const {
    posts,
    isLoading: postsLoading,
    isLoadingMore,
    error: postsError,
    pagination,
    getPosts,
    loadMorePosts,
    refreshPosts,
    createPost,
    likePost,
    sharePost,
    incrementCommentCount,
    decrementCommentCount
  } = usePosts();
  
  // Utiliser React Query pour synchroniser le currentChallenge entre les pages
  const { 
    data: currentChallenge,
    isLoading: currentChallengeLoading,
    error: currentChallengeError
  } = useCurrentChallengeQuery(user?.id || '');
  
  // Typer currentChallenge correctement
  const typedCurrentChallenge = currentChallenge as Challenge | null;
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Publicités partenaires
  const partnerAds = [
    {
      id: "1",
      title: "Épargnez intelligemment avec Orange Money",
      description: "Rejoignez des millions d'utilisateurs pour vos transactions et votre épargne",
      imageUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=300&fit=crop",
      partnerName: "Orange Money",
      linkUrl: "https://www.orange.ci/money/",
      badge: "Partenaire Premium",
      type: "service" as const,
    },
    {
      id: "2",
      title: "Services bancaires adaptés à vos besoins",
      description: "Découvrez nos solutions d'épargne et d'investissement personnalisées",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      partnerName: "Banque Partenaire",
      linkUrl: "#",
      badge: "Nouveau",
      type: "product" as const,
    },
    {
      id: "3",
      title: "Application mobile pour gérer votre budget",
      description: "Suivez vos dépenses et atteignez vos objectifs financiers facilement",
      imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
      partnerName: "App Finance",
      linkUrl: "#",
      type: "product" as const,
    },
  ];

  // Setup infinite scroll
  const { loadingRef } = useInfiniteScroll({
    hasNext: pagination.hasNext,
    isLoading: isLoadingMore,
    onLoadMore: () => loadMorePosts(filterType === "all" ? undefined : filterType)
  });

  const loadChallenges = useCallback(async () => {
    try {
      await getChallenges();
      // currentChallenge est maintenant chargé automatiquement via React Query
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  }, [getChallenges]);

  useEffect(() => {
    // Load posts with API
    refreshPosts();
    
    // Load challenges
    //loadChallenges();
  }, [refreshPosts]);

  // Refresh posts when filter changes
  useEffect(() => {
    refreshPosts(filterType === "all" ? undefined : filterType);
  }, [filterType, refreshPosts]);

  const filteredPosts = (posts || []).filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (post.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || post.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "popular":
        return ((b.likes || 0) + (b.commentsCount || 0) + (b.shares || 0)) - ((a.likes || 0) + (a.commentsCount || 0) + (a.shares || 0));
      case "trending":
        return (b.likes || 0) - (a.likes || 0);
      default:
        return 0;
    }
  });

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'SAVINGS_MILESTONE':
        return <Target className="w-4 h-4 text-green-600" />;
      case 'MOTIVATION':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'TIP':
        return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      case 'QUESTION':
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
      case 'CELEBRATION':
        return <PartyPopper className="w-4 h-4 text-pink-600" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'SAVINGS_MILESTONE':
        return 'Objectif atteint';
      case 'MOTIVATION':
        return 'Motivation';
      case 'TIP':
        return 'Conseil';
      case 'QUESTION':
        return 'Question';
      case 'CELEBRATION':
        return 'Célébration';
      default:
        return 'Post';
    }
  };

  const handleCommentClick = (postId: string) => {
    setSelectedPost(postId);
    setShowCommentModal(true);
  };

  // Challenge functions
  const handleJoinChallenge = (challengeId: string) => {
    // This would open the join modal or navigate to challenge details
    console.log('Join challenge:', challengeId);
  };


  // Fonctions de gestion des actions pour les challenges
  const handleGoToMyChallenge = (challengeId: string) => {
    window.location.href = '/user-dashboard/my-challenge';
  };

  const handleViewCollectiveProgress = (challengeId: string) => {
    window.location.href = `/user-dashboard/collective-progress?challengeId=${challengeId}`;
  };

  // Convert API Challenge to SavingsChallenge
  const convertApiChallengeToSavingsChallenge = (apiChallenge: {
    id: string;
    title: string;
    description: string;
    type: 'monthly' | 'weekly' | 'daily' | 'custom';
    targetAmount: number;
    startDate: string;
    endDate: string;
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';
    createdBy?: string;
    createdByUser?: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    rewards?: string[];
    maxParticipants?: number;
    _count?: {
      participants: number;
    };
    createdAt: string;
    updatedAt: string;
  }) => {
    const now = new Date();
    const startDate = new Date(apiChallenge.startDate);
    const endDate = new Date(apiChallenge.endDate);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      id: apiChallenge.id,
      title: apiChallenge.title,
      description: apiChallenge.description,
      type: apiChallenge.type,
      targetAmount: apiChallenge.targetAmount,
      duration: duration,
      startDate: apiChallenge.startDate,
      endDate: apiChallenge.endDate,
      isActive: apiChallenge.status === 'active',
      createdBy: apiChallenge.createdBy || 'unknown',
      createdByName: apiChallenge.createdByUser?.firstName + ' ' + apiChallenge.createdByUser?.lastName || 'Unknown',
      createdByAvatar: apiChallenge.createdByUser?.avatar,
      rewards: apiChallenge.rewards || [],
      maxParticipants: apiChallenge.maxParticipants,
      participants: apiChallenge._count?.participants || 0,
      participantsList: [],
      status: apiChallenge.status,
      createdAt: apiChallenge.createdAt,
      updatedAt: apiChallenge.updatedAt,
      isJoined: false, // Sera déterminé dynamiquement
      userParticipation: undefined, // Sera déterminé dynamiquement
    };
  };

  console.log('Feed render:', { posts: posts || [], challenges: apiChallenges || [], postsLoading, filteredPosts });

  return (
    <div className="p-1">
      {/* Debug Info */}
      {/* <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <h3 className="font-bold">Debug Info:</h3>
        <p>Posts: {posts.length}</p>
        <p>Challenges: {apiChallenges?.length || 0}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Filtered Posts: {filteredPosts.length}</p>
      </div> */}

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Forum
          </h1>
          <p className="text-gray-600 mt-1">
            Découvrez les dernières activités de votre communauté d'épargnants
          </p>
          {postsError && (
            <div className="mt-4">
              <NetworkError 
                error={postsError} 
                onRetry={() => refreshPosts(filterType === "all" ? undefined : filterType)}
                isRetrying={postsLoading}
              />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button 
            onClick={() => refreshPosts(filterType === "all" ? undefined : filterType)}
            variant="outline"
            disabled={postsLoading}
          >
            <Search className="w-4 h-4 mr-2" />
            {postsLoading ? 'Chargement...' : 'Actualiser'}
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer un post
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {/* <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Défis actifs</p>
                <p className="text-xl font-bold">{(apiChallenges || []).filter(c => (c as any).isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Posts aujourd'hui</p>
                <p className="text-xl font-bold">
                  {posts.filter(p => 
                    new Date(p.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Engagement</p>
                <p className="text-xl font-bold">
                  {posts.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div> */}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher dans les posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="SAVINGS_MILESTONE">Objectifs</SelectItem>
                      <SelectItem value="MOTIVATION">Motivation</SelectItem>
                      <SelectItem value="TIP">Conseils</SelectItem>
                      <SelectItem value="QUESTION">Questions</SelectItem>
                      <SelectItem value="CELEBRATION">Célébrations</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Plus récent</SelectItem>
                      <SelectItem value="popular">Plus populaire</SelectItem>
                      <SelectItem value="trending">Tendance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          {postsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : sortedPosts.length > 0 ? (
            <div className="space-y-4">
              {sortedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onCommentClick={() => handleCommentClick(post.id)}
                />
              ))}
              
              {/* Infinite scroll loading indicator */}
              <div ref={loadingRef} className="flex justify-center py-8">
                {isLoadingMore ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span>Chargement de plus de posts...</span>
                    </div>
                    <div className="space-y-2">
                      <PostSkeleton />
                    </div>
                  </div>
                ) : pagination.hasNext ? (
                  <Button 
                    onClick={() => loadMorePosts(filterType === "all" ? undefined : filterType)}
                    variant="outline"
                    className="px-8"
                  >
                    Charger plus de posts
                  </Button>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p>Vous avez vu tous les posts disponibles !</p>
                    <p className="text-sm mt-1">Revenez plus tard pour de nouveaux contenus</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Aucun post trouvé</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {searchQuery ? 'Aucun post ne correspond à votre recherche.' : 'Soyez le premier à partager quelque chose !'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={() => refreshPosts(filterType === "all" ? undefined : filterType)} variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Actualiser
                  </Button>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer le premier post
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={fadeInUp} className="space-y-6">
          {/* Publicités partenaires */}
          <div className="space-y-4">
            
            {partnerAds.map((ad, index) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PartnerAdvertisement ad={ad} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <PostCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={() => refreshPosts(filterType === "all" ? undefined : filterType)}
      />
      
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        postId={selectedPost}
        onCommentCountChange={(increment) => {
          if (selectedPost) {
            if (increment) {
              incrementCommentCount(selectedPost);
            } else {
              decrementCommentCount(selectedPost);
            }
          }
        }}
      />
      </motion.div>
    </div>
  );
};

export default Feed;
