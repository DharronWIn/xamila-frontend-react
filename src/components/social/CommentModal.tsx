import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    X,
    Send,
    Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/ui/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useComments } from "@/lib/apiComponent/hooks/useSocial";
import { api } from "@/lib/apiComponent/apiClient";
import { socialEndpoints } from "@/lib/apiComponent/endpoints";
import { Post } from "@/lib/apiComponent/types";
import { useToast } from "@/hooks/use-toast";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
  onCommentCountChange?: (increment: boolean) => void;
}

const CommentModal = ({ isOpen, onClose, postId, onCommentCountChange }: CommentModalProps) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  // Use API hooks for comments
  const {
    comments,
    isLoading: commentsLoading,
    isCreating: isCreatingComment,
    error: commentsError,
    getComments,
    createComment
  } = useComments(postId || '', onCommentCountChange);
  
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [postLoading, setPostLoading] = useState(false);

  const postComments = comments;

  // Debug: log the postId and currentPost
  useEffect(() => {
    console.log('CommentModal - postId:', postId);
    console.log('CommentModal - currentPost:', currentPost);
    console.log('CommentModal - comments:', comments);
  }, [postId, currentPost, comments]);

  // Function to fetch post directly
  const fetchPost = useCallback(async (id: string) => {
    try {
      setPostLoading(true);
      const response = await api.get<Post>(socialEndpoints.postById(id), { isPublicRoute: true });
      setCurrentPost(response);
    } catch (error) {
      console.error('Error fetching post:', error);
      setCurrentPost(null);
    } finally {
      setPostLoading(false);
    }
  }, []);

  // Load post and comments when modal opens
  useEffect(() => {
    if (isOpen && postId) {
      fetchPost(postId);
      getComments();
    }
  }, [isOpen, postId, fetchPost, getComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !postId || isCreatingComment) return;

    const commentData = {
      content: newComment.trim(),
      ...(replyingTo && { parentId: replyingTo })
    };
    
    try {
      const newCommentResponse = await createComment(commentData);
      setNewComment("");
      setReplyingTo(null);
      
      // Toast de succès
      toast({
        title: "Commentaire publié !",
        description: "Votre commentaire a été ajouté avec succès.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      
      // Toast d'erreur
      toast({
        title: "Erreur de publication",
        description: "Impossible de publier votre commentaire. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };


  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return commentDate.toLocaleDateString('fr-FR');
  };

  const handleClose = () => {
    setNewComment("");
    setReplyingTo(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center justify-between text-lg font-semibold">
            <span className="text-gray-900">Commentaires</span>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {postComments.length} commentaire{postComments.length !== 1 ? 's' : ''}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {currentPost ? `Commentaires pour le post de ${currentPost.user?.name || 'Utilisateur'}` : 'Chargement des commentaires...'}
          </DialogDescription>
        </DialogHeader>
        
        {commentsLoading || postLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">
                {postLoading ? 'Chargement du post...' : 'Chargement des commentaires...'}
              </p>
            </div>
          </div>
        ) : (

        <div className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-4 pr-2">
              {/* Original Post */}
              {currentPost ? (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-md relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-full -translate-y-8 translate-x-8 opacity-30"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-indigo-100 rounded-full translate-y-6 -translate-x-6 opacity-20"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start space-x-3">
                      <UserAvatar 
                        user={currentPost.user}
                        size="md"
                        className="w-10 h-10 ring-2 ring-white shadow-sm"
                        fallbackClassName="bg-blue-500 text-white font-bold"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-bold text-sm text-gray-900">{currentPost.user?.name || 'Utilisateur'}</h4>
                          <span className="text-xs text-blue-600 flex items-center font-medium">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeAgo(currentPost.createdAt)}
                          </span>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                          <p className="text-sm text-gray-800 leading-relaxed font-medium">{currentPost.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-100 border-2 border-gray-300 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-bold">?</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium italic">Post original non disponible</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Separator */}
              <div className="flex items-center space-x-3 py-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <span className="text-xs text-gray-500 font-medium bg-white px-3 py-1 rounded-full border border-gray-200">
                  Commentaires
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
              {commentsError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  Erreur lors du chargement des commentaires: {commentsError}
                </div>
              )}
              {commentsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-3 animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : postComments.length > 0 ? (
                postComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex space-x-3 p-3 bg-gray-50 border-l-4 border-gray-200 rounded-r-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                  >
                    <UserAvatar 
                      user={comment.user}
                      size="sm"
                      className="w-8 h-8"
                      fallbackClassName="bg-gray-400 text-white text-sm font-medium"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-sm text-gray-700">{comment.user?.name || 'Utilisateur'}</h5>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">Aucun commentaire pour le moment</p>
                  <p className="text-gray-400 text-xs mt-1">Soyez le premier à commenter !</p>
                </div>
              )}
            </div>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="space-y-4 flex-shrink-0 border-t border-gray-200 pt-6">
            {replyingTo && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-medium">Réponse à un commentaire</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex space-x-4">
              <UserAvatar 
                user={user}
                size="md"
                className="w-10 h-10"
                fallbackClassName="bg-primary/10 text-primary font-semibold"
              />
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Ajouter un commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] resize-none border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {newComment.length}/500 caractères
                  </span>
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={!newComment.trim() || isCreatingComment}
                    className="bg-primary hover:bg-primary/90 rounded-lg px-6"
                  >
                    {isCreatingComment ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Publication...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Publier
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { CommentModal };
export default CommentModal;
