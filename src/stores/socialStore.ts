import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  pictureProfilUrl?: string;
  bio?: string;
  totalSaved: number;
  currentGoal: number;
  progressPercentage: number;
  isOnline: boolean;
  lastSeen: string;
  badges: string[];
  friendsCount: number;
  postsCount: number;
  joinedAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userPictureProfilUrl?: string;
  content: string;
  type: 'savings_milestone' | 'motivation' | 'tip' | 'question' | 'celebration';
  images?: string[];
  amount?: number;
  goal?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}


export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'friend_request' | 'friend_accepted' | 'group_invite' | 'milestone' | 'challenge';
  fromUserId?: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  postId?: string;
  groupId?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'monthly' | 'weekly' | 'daily' | 'custom';
  targetAmount: number;
  duration: number; // in days
  participants: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  createdByAvatar?: string;
  createdByPictureProfilUrl?: string;
  rewards: string[];
  participantsList: {
    userId: string;
    userName: string;
    userAvatar?: string;
    progress: number;
    amount: number;
  }[];
}

interface SocialState {
  // User profiles
  currentUserProfile: UserProfile | null;
  userProfiles: UserProfile[];
  friends: UserProfile[];
  
  // Posts and interactions
  posts: Post[];
  comments: Comment[];
  
  
  // Notifications
  notifications: Notification[];
  unreadNotifications: number;
  
  // Challenges
  challenges: Challenge[];
  userChallenges: Challenge[];
  
  // Loading states
  isLoading: boolean;
  isPosting: boolean;
  
  // Actions
  setCurrentUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  createPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments' | 'shares' | 'isLiked' | 'isShared'>) => void;
  likePost: (postId: string) => void;
  sharePost: (postId: string) => void;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'likes' | 'isLiked' | 'replies'>) => void;
  likeComment: (commentId: string) => void;
  createChallenge: (challenge: Omit<Challenge, 'id' | 'createdAt' | 'participants' | 'participantsList'>) => void;
  joinChallenge: (challengeId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  fetchPosts: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchChallenges: () => Promise<void>;
  fetchFriends: () => Promise<void>;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => {
      // Default data
      const defaultData = {
        currentUserProfile: {
          id: '1',
          name: 'John Doe',
          email: 'test@challenge.fr',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          bio: 'Passionné d\'épargne et de finances personnelles',
          totalSaved: 2500,
          currentGoal: 5000,
          progressPercentage: 50,
          isOnline: true,
          lastSeen: new Date().toISOString(),
          badges: ['Économiste', 'Persévérant'],
          friendsCount: 5,
          postsCount: 12,
          joinedAt: '2024-01-15',
        },
        userProfiles: [],
        friends: [
          {
            id: '2',
            name: 'Marie Martin',
            email: 'marie@example.com',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            bio: 'Passionnée d\'épargne et de finances personnelles',
            totalSaved: 3200,
            currentGoal: 5000,
            progressPercentage: 64,
            isOnline: true,
            lastSeen: new Date().toISOString(),
            badges: ['Économiste', 'Persévérant'],
            friendsCount: 8,
            postsCount: 15,
            joinedAt: '2024-01-10',
          },
          {
            id: '3',
            name: 'Pierre Dupont',
            email: 'pierre@example.com',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            bio: 'Expert en budget et épargne',
            totalSaved: 4500,
            currentGoal: 8000,
            progressPercentage: 56,
            isOnline: false,
            lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            badges: ['Expert', 'Mentor'],
            friendsCount: 12,
            postsCount: 23,
            joinedAt: '2024-01-05',
          },
          {
            id: '4',
            name: 'Sophie Bernard',
            email: 'sophie@example.com',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            bio: 'Débutante en épargne, motivée !',
            totalSaved: 800,
            currentGoal: 2000,
            progressPercentage: 40,
            isOnline: true,
            lastSeen: new Date().toISOString(),
            badges: ['Débutant'],
            friendsCount: 3,
            postsCount: 5,
            joinedAt: '2024-02-01',
          },
        ],
        posts: [
          {
            id: '1',
            userId: '2',
            userName: 'Marie Martin',
            userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            content: '🎉 J\'ai atteint mon objectif d\'épargne de 1000€ ce mois ! Merci à tous pour vos encouragements !',
            type: 'celebration',
            amount: 1000,
            goal: 'Vacances d\'été',
            likes: 24,
            comments: 8,
            shares: 3,
            isLiked: false,
            isShared: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            userId: '3',
            userName: 'Pierre Dupont',
            userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            content: '💡 Conseil du jour : J\'utilise la règle des 50/30/20 pour gérer mon budget. 50% pour les besoins, 30% pour les envies, 20% pour l\'épargne !',
            type: 'tip',
            likes: 18,
            comments: 5,
            shares: 7,
            isLiked: true,
            isShared: false,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            userId: '4',
            userName: 'Sophie Bernard',
            userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            content: '🤔 Question : Comment vous motivez-vous quand vous avez envie d\'abandonner votre objectif d\'épargne ?',
            type: 'question',
            likes: 12,
            comments: 15,
            shares: 2,
            isLiked: false,
            isShared: false,
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
        ],
        comments: [],
        notifications: [
          {
            id: '1',
            userId: '1',
            type: 'like',
            fromUserId: '2',
            fromUserName: 'Marie Martin',
            fromUserAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            postId: '1',
            content: 'Marie Martin a aimé votre post',
            isRead: false,
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            userId: '1',
            type: 'comment',
            fromUserId: '3',
            fromUserName: 'Pierre Dupont',
            fromUserAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            postId: '1',
            content: 'Pierre Dupont a commenté votre post',
            isRead: false,
            createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          },
        ],
        unreadNotifications: 2,
        challenges: [
          {
            id: '1',
            title: 'Défi Épargne de Noël',
            description: 'Économisez 500€ pour les fêtes de fin d\'année',
            type: 'monthly',
            targetAmount: 500,
            duration: 30,
            participants: 45,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            createdBy: '2',
            createdByName: 'Marie Martin',
            createdByAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            rewards: ['Badge Économiste', 'Certificat de réussite'],
            participantsList: [],
          },
          {
            id: '2',
            title: 'Challenge 52 semaines',
            description: 'Épargnez 1€ la première semaine, 2€ la deuxième, etc.',
            type: 'weekly',
            targetAmount: 1378,
            duration: 365,
            participants: 23,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            createdBy: '3',
            createdByName: 'Pierre Dupont',
            createdByAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            rewards: ['Badge Persévérance', 'Trophée 52 semaines'],
            participantsList: [],
          },
        ],
        userChallenges: [],
        isLoading: false,
        isPosting: false,
      };

      return {
        ...defaultData,

        // Profile actions
        setCurrentUserProfile: (profile) => {
          set({ currentUserProfile: profile });
        },

      updateUserProfile: (updates) => {
        const { currentUserProfile } = get();
        if (currentUserProfile) {
          set({ 
            currentUserProfile: { ...currentUserProfile, ...updates }
          });
        }
      },

      // Post actions
      createPost: (postData) => {
        const { currentUserProfile } = get();
        if (!currentUserProfile) return;

        const newPost: Post = {
          ...postData,
          id: Date.now().toString(),
          userName: currentUserProfile.name,
          userAvatar: currentUserProfile.avatar,
          likes: 0,
          comments: 0,
          shares: 0,
          isLiked: false,
          isShared: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          posts: [newPost, ...state.posts],
          isPosting: false
        }));

        // Create notification for friends
        const { friends } = get();
        friends.forEach(friend => {
          const notification: Notification = {
            id: `notif_${Date.now()}_${friend.id}`,
            userId: friend.id,
            type: 'milestone',
            fromUserId: currentUserProfile.id,
            fromUserName: currentUserProfile.name,
            fromUserAvatar: currentUserProfile.avatar,
            postId: newPost.id,
            content: `${currentUserProfile.name} a partagé un nouveau post !`,
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          
          set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadNotifications: state.unreadNotifications + 1
          }));
        });
      },

      likePost: (postId) => {
        set((state) => ({
          posts: state.posts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  isLiked: !post.isLiked,
                  likes: post.isLiked ? post.likes - 1 : post.likes + 1
                }
              : post
          )
        }));
      },

      sharePost: (postId) => {
        set((state) => ({
          posts: state.posts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  isShared: !post.isShared,
                  shares: post.isShared ? post.shares - 1 : post.shares + 1
                }
              : post
          )
        }));
      },

      addComment: (commentData) => {
        const { currentUserProfile } = get();
        if (!currentUserProfile) return;

        const newComment: Comment = {
          ...commentData,
          id: Date.now().toString(),
          userName: currentUserProfile.name,
          userAvatar: currentUserProfile.avatar,
          likes: 0,
          isLiked: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          comments: [newComment, ...state.comments],
          posts: state.posts.map(post => 
            post.id === commentData.postId 
              ? { ...post, comments: post.comments + 1 }
              : post
          )
        }));
      },

      likeComment: (commentId) => {
        set((state) => ({
          comments: state.comments.map(comment => 
            comment.id === commentId 
              ? { 
                  ...comment, 
                  isLiked: !comment.isLiked,
                  likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
                }
              : comment
          )
        }));
      },


      // Challenge actions
      createChallenge: (challengeData) => {
        const { currentUserProfile } = get();
        if (!currentUserProfile) return;

        const newChallenge: Challenge = {
          ...challengeData,
          id: Date.now().toString(),
          participants: 1,
          participantsList: [{
            userId: currentUserProfile.id,
            userName: currentUserProfile.name,
            userAvatar: currentUserProfile.avatar,
            progress: 0,
            amount: 0,
          }],
        };

        set((state) => ({
          challenges: [newChallenge, ...state.challenges],
          userChallenges: [newChallenge, ...state.userChallenges]
        }));
      },

      joinChallenge: (challengeId) => {
        const { currentUserProfile, challenges } = get();
        if (!currentUserProfile) return;

        const challenge = challenges.find(c => c.id === challengeId);
        if (challenge) {
          const updatedChallenge = {
            ...challenge,
            participants: challenge.participants + 1,
            participantsList: [
              ...challenge.participantsList,
              {
                userId: currentUserProfile.id,
                userName: currentUserProfile.name,
                userAvatar: currentUserProfile.avatar,
                progress: 0,
                amount: 0,
              }
            ]
          };

          set((state) => ({
            challenges: state.challenges.map(c => c.id === challengeId ? updatedChallenge : c),
            userChallenges: [...state.userChallenges, updatedChallenge]
          }));
        }
      },

      // Notification actions
      markNotificationAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          ),
          unreadNotifications: Math.max(0, state.unreadNotifications - 1)
        }));
      },

      markAllNotificationsAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(notif => ({ ...notif, isRead: true })),
          unreadNotifications: 0
        }));
      },

      // Fetch actions (mock data)
      fetchPosts: async () => {
        set({ isLoading: true });
        
        // Mock posts data
        const mockPosts: Post[] = [
          {
            id: '1',
            userId: '2',
            userName: 'Marie Martin',
            userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            content: '🎉 J\'ai atteint mon objectif d\'épargne de 1000€ ce mois ! Merci à tous pour vos encouragements !',
            type: 'celebration',
            amount: 1000,
            goal: 'Vacances d\'été',
            likes: 24,
            comments: 8,
            shares: 3,
            isLiked: false,
            isShared: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            userId: '3',
            userName: 'Pierre Dupont',
            userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            content: '💡 Conseil du jour : J\'utilise la règle des 50/30/20 pour gérer mon budget. 50% pour les besoins, 30% pour les envies, 20% pour l\'épargne !',
            type: 'tip',
            likes: 18,
            comments: 5,
            shares: 7,
            isLiked: true,
            isShared: false,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            userId: '4',
            userName: 'Sophie Bernard',
            userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            content: '🤔 Question : Comment vous motivez-vous quand vous avez envie d\'abandonner votre objectif d\'épargne ?',
            type: 'question',
            likes: 12,
            comments: 15,
            shares: 2,
            isLiked: false,
            isShared: false,
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
        ];

        await new Promise(resolve => setTimeout(resolve, 1000));
        set({ posts: mockPosts, isLoading: false });
      },


      fetchNotifications: async () => {
        set({ isLoading: true });
        
        const mockNotifications: Notification[] = [
          {
            id: '1',
            userId: '1',
            type: 'like',
            fromUserId: '2',
            fromUserName: 'Marie Martin',
            fromUserAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            postId: '1',
            content: 'Marie Martin a aimé votre post',
            isRead: false,
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            userId: '1',
            type: 'comment',
            fromUserId: '3',
            fromUserName: 'Pierre Dupont',
            fromUserAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            postId: '1',
            content: 'Pierre Dupont a commenté votre post',
            isRead: false,
            createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            userId: '1',
            type: 'friend_request',
            fromUserId: '4',
            fromUserName: 'Sophie Bernard',
            fromUserAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            content: 'Sophie Bernard vous a envoyé une demande d\'ami',
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
        ];

        await new Promise(resolve => setTimeout(resolve, 600));
        set({ 
          notifications: mockNotifications, 
          unreadNotifications: mockNotifications.filter(n => !n.isRead).length,
          isLoading: false 
        });
      },

      fetchChallenges: async () => {
        set({ isLoading: true });
        
        const mockChallenges: Challenge[] = [
          {
            id: '1',
            title: 'Défi Épargne de Noël',
            description: 'Économisez 500€ pour les fêtes de fin d\'année',
            type: 'monthly',
            targetAmount: 500,
            duration: 30,
            participants: 45,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            createdBy: '2',
            createdByName: 'Marie Martin',
            createdByAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            rewards: ['Badge Économiste', 'Certificat de réussite'],
            participantsList: [],
          },
          {
            id: '2',
            title: 'Challenge 52 semaines',
            description: 'Épargnez 1€ la première semaine, 2€ la deuxième, etc.',
            type: 'weekly',
            targetAmount: 1378,
            duration: 365,
            participants: 23,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            createdBy: '3',
            createdByName: 'Pierre Dupont',
            createdByAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            rewards: ['Badge Persévérance', 'Trophée 52 semaines'],
            participantsList: [],
          },
        ];

        await new Promise(resolve => setTimeout(resolve, 700));
        set({ challenges: mockChallenges, isLoading: false });
      },

      fetchFriends: async () => {
        set({ isLoading: true });
        
        const mockFriends: UserProfile[] = [
          {
            id: '2',
            name: 'Marie Martin',
            email: 'marie@example.com',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            bio: 'Passionnée d\'épargne et de finances personnelles',
            totalSaved: 3200,
            currentGoal: 5000,
            progressPercentage: 64,
            isOnline: true,
            lastSeen: new Date().toISOString(),
            badges: ['Économiste', 'Persévérant'],
            friendsCount: 8,
            postsCount: 15,
            joinedAt: '2024-01-10',
          },
          {
            id: '3',
            name: 'Pierre Dupont',
            email: 'pierre@example.com',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            bio: 'Expert en budget et épargne',
            totalSaved: 4500,
            currentGoal: 8000,
            progressPercentage: 56,
            isOnline: false,
            lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            badges: ['Expert', 'Mentor'],
            friendsCount: 12,
            postsCount: 23,
            joinedAt: '2024-01-05',
          },
          {
            id: '4',
            name: 'Sophie Bernard',
            email: 'sophie@example.com',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            bio: 'Débutante en épargne, motivée !',
            totalSaved: 800,
            currentGoal: 2000,
            progressPercentage: 40,
            isOnline: true,
            lastSeen: new Date().toISOString(),
            badges: ['Débutant'],
            friendsCount: 3,
            postsCount: 5,
            joinedAt: '2024-02-01',
          },
        ];

        await new Promise(resolve => setTimeout(resolve, 500));
        set({ friends: mockFriends, isLoading: false });
      },
      };
    },
    {
      name: 'social-storage',
      partialize: (state) => ({
        currentUserProfile: state.currentUserProfile,
        posts: state.posts,
        comments: state.comments,
        notifications: state.notifications,
        challenges: state.challenges,
        userChallenges: state.userChallenges,
        friends: state.friends,
      }),
    }
  )
);
