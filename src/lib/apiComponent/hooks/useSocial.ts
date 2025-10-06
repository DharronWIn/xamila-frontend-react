import { useState, useCallback } from 'react';
import { api } from '../apiClient';
import { socialEndpoints as endpoints } from '../endpoints';
import {
  Post,
  CreatePostDto,
  UpdatePostDto,
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
  PostQueryParams, SocialPostsResponse
} from '../types';

// ==================== SOCIAL POSTS HOOKS ====================

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  const getPosts = useCallback(async (params?: PostQueryParams, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type) queryParams.append('type', params.type);

      const url = `${endpoints.posts}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<SocialPostsResponse['data']>(url, { isPublicRoute: true });
      
      // Debug: log the response structure
      console.log('API Response:', response);
      
      // The API client already extracts data from the response
      // So response is directly the data object: { posts: [...], total: 4, page: 1, totalPages: 1 }
      const posts = response.posts || [];
      const page = response.page || 1;
      const totalPages = response.totalPages || 1;
      
      if (append) {
        setPosts(prev => [...prev, ...posts]);
      } else {
        setPosts(posts);
      }
      
      setPagination({
        page: page,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      });
      
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      throw err;
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const createPost = useCallback(async (postData: CreatePostDto): Promise<Post> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Création du post avec les données:', postData);
      const response = await api.post<Post, CreatePostDto>(endpoints.createPost, postData);
      console.log('✅ Post créé avec succès:', response);
      
      // Add to local state
      setPosts(prev => [response, ...prev]);
      return response;
    } catch (err: unknown) {
      console.error('❌ Erreur lors de la création du post:', err);
      setError(err instanceof Error ? err.message : 'Failed to create post');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPostById = useCallback(async (id: string): Promise<Post> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<Post>(endpoints.postById(id), { isPublicRoute: true });
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch post');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (id: string, postData: UpdatePostDto): Promise<Post> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.put<Post, UpdatePostDto>(endpoints.updatePost(id), postData);
      
      // Update in local state
      setPosts(prev => prev.map(p => p.id === id ? response : p));
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(endpoints.deletePost(id));
      
      // Remove from local state
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const likePost = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post(endpoints.likePost(id), {});
      
      // Update in local state
      setPosts(prev => prev.map(p => 
        p.id === id 
          ? { 
              ...p, 
              isLikedByCurrentUser: !p.isLikedByCurrentUser, 
              likes: p.isLikedByCurrentUser ? (p.likes || 0) - 1 : (p.likes || 0) + 1 
            }
          : p
      ));
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to like post');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sharePost = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post(endpoints.sharePost(id), {});
      
      // Update in local state
      setPosts(prev => prev.map(p => 
        p.id === id 
          ? { ...p, shares: (p.shares || 0) + 1 }
          : p
      ));
      return response;
    } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to share post');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const incrementCommentCount = useCallback((postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
        : p
    ));
  }, []);

  const decrementCommentCount = useCallback((postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, commentsCount: Math.max((p.commentsCount || 0) - 1, 0) }
        : p
    ));
  }, []);

  const loadMorePosts = useCallback(async (type?: string) => {
    if (pagination.hasNext && !isLoadingMore) {
      await getPosts({ 
        page: pagination.page + 1, 
        limit: 20, 
        type: type as 'SAVINGS_MILESTONE' | 'MOTIVATION' | 'TIP' | 'QUESTION' | 'CELEBRATION' | undefined
      }, true);
    }
  }, [pagination, isLoadingMore, getPosts]);

  const refreshPosts = useCallback(async (type?: string) => {
    await getPosts({ 
      page: 1, 
      limit: 20, 
      type: type as 'SAVINGS_MILESTONE' | 'MOTIVATION' | 'TIP' | 'QUESTION' | 'CELEBRATION' | undefined 
    }, false);
  }, [getPosts]);

  return {
    posts,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    getPosts,
    loadMorePosts,
    refreshPosts,
    createPost,
    getPostById,
    updatePost,
    deletePost,
    likePost,
    sharePost,
    incrementCommentCount,
    decrementCommentCount,
  };
};

// ==================== SOCIAL COMMENTS HOOKS ====================

export const useComments = (postId: string, onCommentCountChange?: (increment: boolean) => void) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<Comment[]>(
        endpoints.postComments(postId),
        { isPublicRoute: true }
      );
      setComments(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const createComment = useCallback(async (commentData: CreateCommentDto): Promise<Comment> => {
    try {
      setIsCreating(true);
      setError(null);
      const response = await api.post<Comment, CreateCommentDto>(
        endpoints.createComment(postId),
        commentData
      );
      
      // Add to local state
      setComments(prev => [response, ...prev]);
      
      // Notify parent component to update comment count
      onCommentCountChange?.(true);
      
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create comment');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [postId, onCommentCountChange]);

  const updateComment = useCallback(async (id: string, commentData: UpdateCommentDto): Promise<Comment> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.put<Comment, UpdateCommentDto>(endpoints.updateComment(id), commentData);
      
      // Update in local state
      setComments(prev => prev.map(c => c.id === id ? response : c));
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update comment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteComment = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(endpoints.deleteComment(id));
      
      // Remove from local state
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    comments,
    isLoading,
    isCreating,
    error,
    getComments,
    createComment,
    updateComment,
    deleteComment,
  };
};
