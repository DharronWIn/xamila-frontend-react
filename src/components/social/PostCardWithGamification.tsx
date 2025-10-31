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
    Clock,
    Trophy
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/ui/UserAvatar";
import { usePosts } from "@/lib/apiComponent/hooks/useSocial";
import { UserBadge } from "@/components/gamification/UserBadge";
import { useGamificationRewards } from "@/hooks/useGamificationRewards";
import { SocialPost } from "@/types/gamification";

interface PostCardWithGamificationProps {
  post: SocialPost;
  onCommentClick: () => void;
}

const PostCardWithGamification = ({ post, onCommentClick }: PostCardWithGamificationProps) => {
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

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'SAVINGS_MILESTONE':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'MOTIVATION':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'TIP':
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      case 'QUESTION':
        return <HelpCircle className="h-4 w-4 text-purple-600" />;
      case 'CELEBRATION':
        return <PartyPopper className="h-4 w-4 text-pink-600" />;
      default:
        return <Trophy className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'SAVINGS_MILESTONE':
        return 'Jalon d\'épargne';
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          {/* Header avec utilisateur et badge de gamification */}
          <div className="flex items-start space-x-3 mb-4">
            <UserAvatar
              src={post.user.pictureProfilUrl}
              alt={post.user.name}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {post.user.name}
                </h3>
                <UserBadge 
                  userLevel={post.user.userLevel}
                  userId={post.user.id}
                  size="sm"
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatDate(post.createdAt)}</span>
                <Badge variant="secondary" className="text-xs">
                  {getPostTypeLabel(post.type)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contenu du post */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              {getPostIcon(post.type)}
              <h4 className="font-medium text-gray-900">{post.title}</h4>
            </div>
            
            <p className="text-gray-700 mb-3">{post.content}</p>
            
            {/* Montant si applicable */}
            {post.amount && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    {formatAmount(post.amount)}
                  </span>
                </div>
              </div>
            )}

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {post.images.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-1 ${
                  isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onCommentClick}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-600"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{post.commentsCount}</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{post.shares} partages</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PostCardWithGamification;
