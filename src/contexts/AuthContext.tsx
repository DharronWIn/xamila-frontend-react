import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, tokenManager } from '@/lib/apiComponent/apiClient';
import { authEndpoints as endpoints } from '@/lib/apiComponent/endpoints';
import { User, LoginDto, LoginResponse } from '@/lib/apiComponent/types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialized: boolean;
  login: (loginData: LoginDto) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get initial auth state from localStorage
const getInitialAuthState = () => {
  try {
    const stored = localStorage.getItem('auth_state');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if the stored data is not too old (max 1 hour)
      if (parsed.timestamp && (Date.now() - parsed.timestamp) < 3600000) {
        return {
          user: parsed.user,
          isAuthenticated: parsed.isAuthenticated,
        };
      }
    }
  } catch (error) {
    console.warn('Error parsing stored auth state:', error);
  }
  return null;
};

// Helper function to save auth state to localStorage
const saveAuthState = (user: User | null, isAuthenticated: boolean) => {
  try {
    localStorage.setItem('auth_state', JSON.stringify({
      user,
      isAuthenticated,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Error saving auth state:', error);
  }
};

// Query function for React Query
const checkAuthQuery = async (): Promise<{ isAuthenticated: boolean; user: User | null }> => {
  const token = tokenManager.getToken();
  
  if (!token) {
    return { isAuthenticated: false, user: null };
  }

  try {
    const response = await api.get<{ isAuthenticated: boolean; user: User | null }>(
      endpoints.checkAuth,
      { isPublicRoute: true }
    );
    return response;
  } catch (error) {
    console.error('Auth check failed:', error);
    tokenManager.clearTokens();
    return { isAuthenticated: false, user: null };
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();
  const [initialized, setInitialized] = useState(false);
  
  // Get initial state from localStorage once - memoized to prevent recalculation
  const initialAuthState = useMemo(() => getInitialAuthState(), []);
  const [user, setUser] = useState<User | null>(initialAuthState?.user || null);

  // Use React Query for auth check with cache
  const {
    data: authData,
    isLoading,
    refetch: refetchAuth,
  } = useQuery({
    queryKey: ['auth', 'status'],
    queryFn: checkAuthQuery,
    enabled: false, // Don't auto-fetch, we'll trigger it manually on mount
    staleTime: 5 * 60 * 1000, // 5 minutes - consider auth valid for 5 min
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    retry: false,
  });

  // Check auth status function
  const checkAuthStatus = useCallback(async () => {
    const result = await refetchAuth();
    if (result.data) {
      if (result.data.isAuthenticated && result.data.user) {
        setUser(result.data.user);
        saveAuthState(result.data.user, true);
      } else {
        setUser(null);
        saveAuthState(null, false);
        tokenManager.clearTokens();
      }
    }
  }, [refetchAuth]);

  // Initialize auth check ONCE on mount
  useEffect(() => {
    if (initialized) return; // Already initialized, skip
    
    const token = tokenManager.getToken();
    
    // If we have initial state from localStorage and it's recent, use it
    if (initialAuthState && initialAuthState.isAuthenticated && initialAuthState.user) {
      // User is already set from useState initial value, just mark as initialized
      setInitialized(true);
      
      // Still check in background to ensure validity
      // But don't block UI - use a ref or directly call refetchAuth to avoid dependency issues
      setTimeout(() => {
        refetchAuth().then((result) => {
          if (result.data) {
            if (result.data.isAuthenticated && result.data.user) {
              setUser(result.data.user);
              saveAuthState(result.data.user, true);
            } else {
              setUser(null);
              saveAuthState(null, false);
            }
          }
        }).catch(() => {
          // Ignore errors in background check
        });
      }, 100);
    } else if (token) {
      // If we have a token but no cached state, check auth
      refetchAuth().then((result) => {
        if (result.data) {
          if (result.data.isAuthenticated && result.data.user) {
            setUser(result.data.user);
            saveAuthState(result.data.user, true);
          } else {
            setUser(null);
            saveAuthState(null, false);
            tokenManager.clearTokens();
          }
        }
        setInitialized(true);
      }).catch(() => {
        setUser(null);
        saveAuthState(null, false);
        setInitialized(true);
      });
    } else {
      // No token, not authenticated
      setUser(null);
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Update user when auth data changes
  useEffect(() => {
    if (authData) {
      if (authData.isAuthenticated && authData.user) {
        setUser(authData.user);
        saveAuthState(authData.user, true);
      } else {
        setUser(null);
        saveAuthState(null, false);
      }
    }
  }, [authData]);

  // Login function
  const login = useCallback(async (loginData: LoginDto): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse, LoginDto>(
      endpoints.login,
      loginData,
      { isPublicRoute: true }
    );
    
    // Gérer les tokens
    if (response.accessToken) {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
    }
    
    // Update state
    setUser(response.user);
    saveAuthState(response.user, true);
    
    // Update auth query cache directly instead of refetching
    queryClient.setQueryData(['auth', 'status'], {
      isAuthenticated: true,
      user: response.user,
    });
    
    return response;
  }, [queryClient]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Optionally call logout endpoint if it exists
      // For now, just clear tokens locally
      // await api.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
      setUser(null);
      saveAuthState(null, false);
      
      // Clear auth query cache
      queryClient.setQueryData(['auth', 'status'], { isAuthenticated: false, user: null });
      queryClient.removeQueries({ queryKey: ['auth', 'status'] });
      
      // Clear all queries to reset app state
      queryClient.clear();
    }
  }, [queryClient]);

  // Refresh auth manually
  const refreshAuth = useCallback(async () => {
    await checkAuthStatus();
  }, [checkAuthStatus]);

  const value: AuthContextType = {
    user,
    isLoading: isLoading || !initialized,
    isAuthenticated: !!user,
    initialized,
    login,
    logout,
    refreshAuth,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

