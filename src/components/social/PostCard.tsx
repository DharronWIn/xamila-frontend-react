import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Target,
  Lightbulb,
  HelpCircle,
  PartyPopper,
  TrendingUp,
  Clock, Trophy
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/ui/UserAvatar";
import { UserBadge } from "@/components/gamification/UserBadge";
import { usePosts } from "@/lib/apiComponent/hooks/useSocial";
import { useGamificationRewards } from "@/hooks/useGamificationRewards";
import { Post } from "@/lib/apiComponent/types";

interface PostCardProps {
  post: Post;
  onCommentClick: () => void;
}

const PostCard = ({ post, onCommentClick }: PostCardProps) => {
  const { likePost } = usePosts();
  const { checkAfterLikeReceived } = useGamificationRewards();
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser || false);
  const [likes, setLikes] = useState(post.likes || 0);

  // Synchronize local state with post data
  useEffect(() => {
    setIsLiked(post.isLikedByCurrentUser || false);
    setLikes(post.likes || 0);
  }, [post.isLikedByCurrentUser, post.likes]);

  const handleLike = async () => {
    const previousLiked = isLiked;
    const previousLikes = likes;
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    
    try {
      await likePost(post.id);
      
      // Si c'est un nouveau like (pas un unlike), vérifier les récompenses
      if (!previousLiked) {
        await checkAfterLikeReceived();
      }
    } catch (error) {
      console.error('Error liking post:', error);
      // Rollback on error
      setIsLiked(previousLiked);
      setLikes(previousLikes);
    }
  };


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

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'SAVINGS_MILESTONE':
        return 'bg-green-100 text-green-800';
      case 'MOTIVATION':
        return 'bg-blue-100 text-blue-800';
      case 'TIP':
        return 'bg-yellow-100 text-yellow-800';
      case 'QUESTION':
        return 'bg-purple-100 text-purple-800';
      case 'CELEBRATION':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return postDate.toLocaleDateString('fr-FR');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-500 ease-out group-hover:shadow-2xl group-hover:shadow-primary/10">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <CardContent className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <UserAvatar 
                user={post.user}
                userId={post.user?.id}
                clickable
                size="lg"
                className="w-12 h-12 ring-2 ring-white shadow-lg group-hover:ring-primary/20 transition-all duration-300"
                fallbackClassName="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-bold text-lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-1 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors duration-300">
                    {post.user?.name || 'Utilisateur'}
                  </h3>
                  {post.user?.userLevel && (
                    <UserBadge 
                      userLevel={post.user.userLevel}
                      userId={post.user.id}
                      size="sm"
                    />
                  )}
                  <Badge 
                    variant="outline" 
                    className={`${getPostTypeColor(post.type)} border-2 font-medium px-3 py-1 rounded-full shadow-sm group-hover:shadow-md transition-all duration-300`}
                  >
                    {getPostTypeIcon(post.type)}
                    <span className="ml-2 font-semibold">{getPostTypeLabel(post.type)}</span>
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{formatTimeAgo(post.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            {/* Title - Mise en avant */}
            {post.title && (
              <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border-l-4 border-primary shadow-sm group-hover:shadow-md group-hover:border-primary/60 transition-all duration-300">
                <h3 className="font-bold text-gray-900 text-2xl leading-tight group-hover:text-primary transition-colors duration-300">
                  {post.title}
                </h3>
                <div className="mt-2 w-12 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full"></div>
              </div>
            )}
            
            <div className="relative">
              <p className="text-gray-800 leading-relaxed text-base font-medium group-hover:text-gray-900 transition-colors duration-300">
                {post.content}
              </p>
              {/* Decorative line */}
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 to-primary/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            
            {/* Amount and Goal Display */}
            {(post.amount || post.goal) && (
              <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20 shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all duration-300">
                <div className="flex items-center justify-between">
                  {post.amount && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/20 rounded-full">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-primary/70 font-medium">Montant épargné</p>
                        <p className="font-bold text-primary text-lg">
                          {post.amount.toLocaleString('fr-FR')} XOF
                        </p>
                      </div>
                    </div>
                  )}
                  {post.goal && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/20 rounded-full">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-primary/70 font-medium">Objectif</p>
                        <p className="font-semibold text-primary">{post.goal}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="mt-4">
                {post.images.length === 1 ? (
                  // Single image - Facebook style
                  <div className="relative group cursor-pointer">
                    <img
                      src={post.images[0]}
                      alt={`Post image`}
                      className="w-full max-h-96 object-cover rounded-lg hover:opacity-95 transition-opacity"
                      style={{ maxHeight: '500px' }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg"></div>
                  </div>
                ) : post.images.length === 2 ? (
                  // Two images - side by side
                  <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
                    {post.images.map((image, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img
                          src={image}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-48 object-cover hover:opacity-95 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
                      </div>
                    ))}
                  </div>
                ) : post.images.length === 3 ? (
                  // Three images - one large, two small
                  <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
                    <div className="relative group cursor-pointer row-span-2">
                      <img
                        src={post.images[0]}
                        alt={`Post image 1`}
                        className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                        style={{ height: '200px' }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
                    </div>
                    <div className="space-y-1">
                      {post.images.slice(1, 3).map((image, index) => (
                        <div key={index + 1} className="relative group cursor-pointer">
                          <img
                            src={image}
                            alt={`Post image ${index + 2}`}
                            className="w-full h-24 object-cover hover:opacity-95 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : post.images.length === 4 ? (
                  // Four images - 2x2 grid
                  <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
                    {post.images.map((image, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img
                          src={image}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-32 object-cover hover:opacity-95 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // More than 4 images - show first 4 with overlay
                  <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
                    {post.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img
                          src={image}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-32 object-cover hover:opacity-95 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
                        {index === 3 && post.images.length > 4 && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              +{post.images.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 group-hover:border-primary/20 transition-colors duration-300">
            <div className="flex items-center space-x-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isLiked 
                    ? 'text-red-600 bg-red-50 hover:bg-red-100 shadow-sm' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-5 h-5 transition-transform duration-200 ${isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-semibold">{likes || 0}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onCommentClick}
                className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-600 hover:text-primary hover:bg-primary/10 transition-all duration-300 group-hover:scale-105"
              >
                <MessageCircle className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="font-semibold">{post.commentsCount || 0}</span>
              </Button>
            </div>

            {/* Achievement Badge */}
            {post.type === 'CELEBRATION' && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-full shadow-sm group-hover:shadow-md transition-all duration-300">
                <div className="p-1 bg-yellow-400 rounded-full">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-yellow-800">Succès !</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export { PostCard };
export default PostCard;
