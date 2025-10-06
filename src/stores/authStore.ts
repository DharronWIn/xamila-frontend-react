import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SubscriptionPlan } from '@/types/subscription';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  isAdmin: boolean;
  isPremium: boolean;
  isVerified?: boolean;
  approvalStatus?: string;
  premiumExpiresAt?: string; // Date d'expiration de l'abonnement premium
  challengeStartMonth: string;
  avatar?: string;
  pictureProfilUrl?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  setUser: (user: User) => void;
  upgradeToPremium: () => void;
  isPremiumValid: () => boolean; // Vérifie si l'abonnement premium est encore valide
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  challengeStartMonth: string;
  challengeMode: SubscriptionPlan;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        id: '1',
        email: 'test@challenge.fr',
        name: 'John Doe',
        phone: '+33123456789',
        isAdmin: false,
        isPremium: true,
        challengeStartMonth: '2025-01',
        createdAt: new Date().toISOString(),
      },
      isAuthenticated: true,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // Simulation d'un appel API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock user data
          const mockUser: User = {
            id: '1',
            email,
            name: 'John Doe',
            phone: '+33123456789',
            isAdmin: email === 'admin@challenge.fr',
            isPremium: false,
            challengeStartMonth: '2025-01',
            createdAt: new Date().toISOString(),
          };

          set({ user: mockUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Clear localStorage to ensure complete logout
        localStorage.removeItem('auth-storage');
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          // Simulation d'un appel API
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const newUser: User = {
            id: Date.now().toString(),
            email: data.email,
            name: data.name,
            phone: data.phone,
            isAdmin: false,
            isPremium: false,
            challengeStartMonth: data.challengeStartMonth,
            createdAt: new Date().toISOString(),
          };

          set({ user: newUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      upgradeToPremium: () => {
        const { user } = get();
        if (user) {
          // Calculer la date d'expiration dans 6 mois
          const expirationDate = new Date();
          expirationDate.setMonth(expirationDate.getMonth() + 6);
          
          set({ 
            user: { 
              ...user, 
              isPremium: true,
              premiumExpiresAt: expirationDate.toISOString()
            } 
          });
        }
      },

      isPremiumValid: () => {
        const { user } = get();
        if (!user || !user.isPremium || !user.premiumExpiresAt) {
          return false;
        }
        
        const now = new Date();
        const expirationDate = new Date(user.premiumExpiresAt);
        
        // Si l'abonnement a expiré, le désactiver
        if (now > expirationDate) {
          set({ 
            user: { 
              ...user, 
              isPremium: false,
              premiumExpiresAt: undefined
            } 
          });
          return false;
        }
        
        return true;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
