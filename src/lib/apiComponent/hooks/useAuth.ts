import { useState, useEffect, useCallback } from 'react';
import { api, apiClient, tokenManager } from '../apiClient';
import { authEndpoints as endpoints, paymentEndpoints, userEndpoints } from '../endpoints';
import {
  LoginDto, LoginResponse,
  User, ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  UpdateProfileDto,
  OtpLoginDto
} from '../types';
import { SubscriptionPlan } from '@/types/subscription';

import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/contexts/AuthContext';

// ==================== NEW INTERFACES ====================

export interface RegisterRequest {
  // Informations personnelles
  email: string;
  firstName: string;
  lastName: string;
  gender: "M" | "F" | "Autre";
  ageRange: string;
  
  // Contact et localisation
  phone: string;
  username: string;
  country: string;
  city: string;
  whatsapp: string;
  
  // Situation professionnelle
  professionalStatus: string;
  
  // Culture d'épargne actuelle
  maxSavingsAmount: string;
  savingsHabit: string;
  currentSavingsLevel: string;
  savingsUsage: string;
  savingsChallenge: string;
  
  // Sur le challenge épargne
  previousChallengeExperience: string;
  motivation: string;
  challengeMode: SubscriptionPlan;
  challengeFormula: string;
  partnerAccounts: string;
  expenseTracking: string;
  futureInterest: string;
  concerns: string;
  
  // Configuration du compte
  challengeStartMonth: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    phone: string;
    username: string;
    firstName: string;
    lastName: string;
    name: string | null;
    pictureProfilUrl: string | null;
    country: string;
    city: string;
    gender: string;
    ageRange: string;
    whatsapp: string;
    professionalStatus: string;
    maxSavingsAmount: string;
    savingsHabit: string;
    currentSavingsLevel: string;
    savingsUsage: string;
    savingsChallenge: string;
    previousChallengeExperience: string;
    motivation: string;
    challengeMode: string;
    challengeFormula: string;
    partnerAccounts: string;
    expenseTracking: string;
    futureInterest: string;
    concerns: string;
    challengeStartMonth: string;
    isVerified: boolean;
    isActive: boolean;
    isPremium: boolean;
    isAdmin: boolean;
    approvalStatus: string;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
  };
  message: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  user: User;
  message: string[];
  errors: string[];
}

export interface FineoPayCheckoutResponse {
  success: boolean;
  message: string;
  data: {
    checkoutLink: string;
  };
}

// ==================== AUTHENTICATION HOOKS ====================

// Global auth state to prevent multiple API calls
const globalAuthState = {
  user: null as User | null,
  isAuthenticated: false,
  isLoading: false,
  lastCheck: 0,
  checkPromise: null as Promise<void> | null
};

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
          lastCheck: parsed.timestamp
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

export const useAuth = () => {
  // Always try to use AuthContext first (new centralized system)
  // useContext must be called unconditionally (React rules)
  let contextAuth: AuthContextType | undefined = undefined;
  try {
    const contextValue = useContext(AuthContext);
    // Only use if it's actually provided (not the default undefined)
    if (contextValue !== undefined) {
      contextAuth = contextValue;
    }
  } catch {
    // AuthContext not available in this tree, will use fallback
    contextAuth = undefined;
  }

  // Always declare hooks (React rules)
  const initialAuthState = getInitialAuthState();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Use context if available and initialized
  const useContextAuth = contextAuth !== undefined && contextAuth.initialized !== undefined;

  const checkAuthStatus = useCallback(async () => {
    // If already checking, wait for the existing promise
    if (globalAuthState.checkPromise) {
      await globalAuthState.checkPromise;
      setUser(globalAuthState.user);
      setIsAuthenticated(globalAuthState.isAuthenticated);
      setIsLoading(globalAuthState.isLoading);
      return;
    }

    // If checked recently (within 30 seconds), use cached data
    const now = Date.now();
    if (globalAuthState.lastCheck && (now - globalAuthState.lastCheck) < 30000) {
      setUser(globalAuthState.user);
      setIsAuthenticated(globalAuthState.isAuthenticated);
      setIsLoading(false);
      return;
    }

    // Check if we have a token first
    const token = tokenManager.getToken();
    
    if (!token) {
      // No token, user is not authenticated
      globalAuthState.user = null;
      globalAuthState.isAuthenticated = false;
      setUser(null);
      setIsAuthenticated(false);
      globalAuthState.lastCheck = now;
      setIsLoading(false);
      return;
    }

    try {
      globalAuthState.isLoading = true;
      setIsLoading(true);
      
      const checkPromise = (async () => {
        const response = await api.get<{ isAuthenticated: boolean; user: User | null }>(
          endpoints.checkAuth,
          { isPublicRoute: true }
        );
        console.log("response CheckAuth", response);
        
        if (response.isAuthenticated && response.user) {
          globalAuthState.user = response.user;
          globalAuthState.isAuthenticated = true;
          setUser(response.user);
          setIsAuthenticated(true);
          saveAuthState(response.user, true);
        } else {
          globalAuthState.user = null;
          globalAuthState.isAuthenticated = false;
          setUser(null);
          setIsAuthenticated(false);
          saveAuthState(null, false);
          // Clear invalid tokens
          tokenManager.clearTokens();
        }
        globalAuthState.lastCheck = now;
      })();

      globalAuthState.checkPromise = checkPromise;
      await checkPromise;
    } catch (error: unknown) {
      console.error('Error checking auth status:', error);
      globalAuthState.user = null;
      globalAuthState.isAuthenticated = false;
      setUser(null);
      setIsAuthenticated(false);
      saveAuthState(null, false);
      // Clear tokens on error
      tokenManager.clearTokens();
      globalAuthState.lastCheck = now;
    } finally {
      globalAuthState.isLoading = false;
      globalAuthState.checkPromise = null;
      setIsLoading(false);
    }
  }, []);

  // Check authentication status on mount - only if needed
  // BUT: Skip if using AuthContext (which handles auth check centrally)
  useEffect(() => {
    // If using context, don't check here - context handles it
    if (contextAuth !== undefined && contextAuth.initialized !== undefined) {
      // Sync state with context but don't trigger check
      setUser(contextAuth.user);
      setIsAuthenticated(contextAuth.isAuthenticated);
      setIsLoading(contextAuth.isLoading);
      return;
    }

    // Fallback system: Only check if needed
    const now = Date.now();
    const hasRecentCheck = globalAuthState.lastCheck && (now - globalAuthState.lastCheck) < 30000;
    const hasValidState = globalAuthState.user && globalAuthState.isAuthenticated;
    const hasToken = tokenManager.getToken();
    
    // Only check if:
    // 1. We don't have a recent check (within 30 seconds)
    // 2. OR we don't have a valid state but we have a token
    // 3. OR there's already a check in progress (to sync state)
    if (!hasRecentCheck || (!hasValidState && hasToken) || globalAuthState.checkPromise) {
    checkAuthStatus();
    } else {
      // Use cached state without API call
      setUser(globalAuthState.user);
      setIsAuthenticated(globalAuthState.isAuthenticated);
      setIsLoading(false);
    }
  }, [checkAuthStatus, contextAuth]);

  const login = useCallback(async (loginData: LoginDto): Promise<LoginResponse> => {
    // If using context, delegate to context login
    if (useContextAuth && contextAuth) {
      return contextAuth.login(loginData);
    }

    // Fallback: use old system
    const response = await api.post<LoginResponse, LoginDto>(
      endpoints.login,
      loginData,
      { isPublicRoute: true }
    );
    
    // Gérer les tokens
    if (response.accessToken) {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
    }
    
    // Update global state
    globalAuthState.user = response.user;
    globalAuthState.isAuthenticated = true;
    globalAuthState.lastCheck = Date.now();
    
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  }, [useContextAuth, contextAuth]);


  const resendOtp = useCallback(async (target: string) => {
    const response = await api.post(
      endpoints.resendOtp,
      { target },
      { isPublicRoute: true }
    );
    return response;
  }, []);

  const forgotPassword = useCallback(async (forgotData: ForgotPasswordDto) => {
    const response = await api.post(
      endpoints.forgotPassword,
      forgotData,
      { isPublicRoute: true }
    );
    return response;
  }, []);

  const resetPassword = useCallback(async (resetData: ResetPasswordDto) => {
    const response = await api.post(
      endpoints.resetPassword,
      resetData,
      { isPublicRoute: true }
    );
    return response;
  }, []);

  const changePassword = useCallback(async (passwordData: ChangePasswordDto) => {
    const response = await api.post(
      endpoints.changePassword,
      passwordData
    );
    return response;
  }, []);

  const updateProfile = useCallback(async (profileData: UpdateProfileDto) => {
    const response = await api.put(
      endpoints.profile,
      profileData
    );
    
    // Update user data after profile update
    if (response && typeof response === 'object' && 'user' in response) {
      setUser((response as { user: User }).user);
    }
    return response;
  }, []);

  const getProfile = useCallback(async (): Promise<User> => {
    const response = await api.get<User>(endpoints.profile);
    setUser(response);
    return response;
  }, []);

  const getPublicProfile = useCallback(async (userId: string) => {
    const response = await api.get(userEndpoints.profilePublic(userId));
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      // Clear global state
      globalAuthState.user = null;
      globalAuthState.isAuthenticated = false;
      globalAuthState.lastCheck = 0;
      
      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear saved auth state
      saveAuthState(null, false);
      
      // Clear tokens from storage
      tokenManager.clearTokens();
      
      // Clear Zustand auth store from localStorage
      try {
        localStorage.removeItem('auth-storage');
        console.log('🧹 Zustand auth store nettoyé');
      } catch (storageError) {
        console.warn('Erreur lors du nettoyage du Zustand store:', storageError);
      }
      
      // Optionally call logout endpoint if it exists
      // await api.post(endpoints.logout);
    } catch (error: unknown) {
      console.error('Error during logout:', error);
    }
  }, []);

  // OTP Login Flow
  const sendOtp = useCallback(async (otpData: OtpLoginDto) => {
    const response = await api.post(
      endpoints.sendOtp,
      otpData,
      { isPublicRoute: true }
    );
    return response;
  }, []);


  const checkVerification = useCallback(async (loginData: LoginDto) => {
    const response = await api.post(
      endpoints.checkVerification,
      loginData,
      { isPublicRoute: true }
    );
    return response;
  }, []);

  const getLoginConfig = useCallback(async () => {
    const response = await api.get(
      endpoints.loginConfig,
      { isPublicRoute: true }
    );
    return response;
  }, []);

  // ==================== NEW AUTH FUNCTIONS ====================

  const registerWithPlan = useCallback(async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse, RegisterRequest>(
      endpoints.register,
      data,
      { isPublicRoute: true }
    );
    
    // L'apiClient extrait déjà les données, donc response contient directement { user, message }
    // Pas de tokens dans cette réponse - l'utilisateur doit vérifier son email d'abord
    
    // Mettre à jour l'utilisateur dans le store avec les données de la réponse API
    const userData: User = {
      id: response.user.id,
      email: response.user.email,
      phone: response.user.phone,
      username: response.user.username,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
      name: response.user.name || `${response.user.firstName} ${response.user.lastName}`,
      pictureProfilUrl: response.user.pictureProfilUrl,
      country: response.user.country,
      city: response.user.city,
      gender: response.user.gender,
      ageRange: response.user.ageRange,
      whatsapp: response.user.whatsapp,
      professionalStatus: response.user.professionalStatus,
      maxSavingsAmount: response.user.maxSavingsAmount,
      savingsHabit: response.user.savingsHabit,
      currentSavingsLevel: response.user.currentSavingsLevel,
      savingsUsage: response.user.savingsUsage,
      savingsChallenge: response.user.savingsChallenge,
      previousChallengeExperience: response.user.previousChallengeExperience,
      motivation: response.user.motivation,
      challengeMode: response.user.challengeMode,
      challengeFormula: response.user.challengeFormula,
      partnerAccounts: response.user.partnerAccounts,
      expenseTracking: response.user.expenseTracking,
      futureInterest: response.user.futureInterest,
      concerns: response.user.concerns,
      challengeStartMonth: response.user.challengeStartMonth,
      isVerified: response.user.isVerified,
      isActive: response.user.isActive,
      isPremium: response.user.isPremium,
      isAdmin: response.user.isAdmin,
      approvalStatus: response.user.approvalStatus,
      createdAt: response.user.createdAt,
      updatedAt: response.user.updatedAt,
      lastLoginAt: response.user.lastLoginAt,
    };
    
    setUser(userData);
    setIsAuthenticated(false); // Pas de token = pas authentifié
    saveAuthState(userData, false);
    
    return response;
  }, [setUser, setIsAuthenticated]);

  const verifyEmailWithToken = useCallback(async (token: string): Promise<VerifyEmailResponse> => {
    console.log('🔧 verifyEmailWithToken called with:', { token });
    
    const response = await apiClient<VerifyEmailResponse, { token: string }>(
      endpoints.verifyEmail,
      "POST",
      { 
        body: { token },
        isPublicRoute: true, // Route publique - pas besoin de token d'authentification
      }
    );
    
    console.log('🔧 verifyEmailWithToken response:', response);
    
    // Mettre à jour l'utilisateur dans le store avec les données de la réponse
    const userData: User = {
      id: response.user.id,
      email: response.user.email,
      phone: response.user.phone,
      username: response.user.username,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
      name: response.user.name || `${response.user.firstName} ${response.user.lastName}`,
      pictureProfilUrl: response.user.pictureProfilUrl,
      country: response.user.country,
      city: response.user.city,
      gender: response.user.gender,
      ageRange: response.user.ageRange,
      whatsapp: response.user.whatsapp,
      professionalStatus: response.user.professionalStatus,
      maxSavingsAmount: response.user.maxSavingsAmount,
      savingsHabit: response.user.savingsHabit,
      currentSavingsLevel: response.user.currentSavingsLevel,
      savingsUsage: response.user.savingsUsage,
      savingsChallenge: response.user.savingsChallenge,
      previousChallengeExperience: response.user.previousChallengeExperience,
      motivation: response.user.motivation,
      challengeMode: response.user.challengeMode,
      challengeFormula: response.user.challengeFormula,
      partnerAccounts: response.user.partnerAccounts,
      expenseTracking: response.user.expenseTracking,
      futureInterest: response.user.futureInterest,
      concerns: response.user.concerns,
      challengeStartMonth: response.user.challengeStartMonth,
      isVerified: response.user.isVerified,
      isActive: response.user.isActive,
      isPremium: response.user.isPremium,
      isAdmin: response.user.isAdmin,
      approvalStatus: response.user.approvalStatus,
      createdAt: response.user.createdAt,
      updatedAt: response.user.updatedAt,
      lastLoginAt: response.user.lastLoginAt,
    };
    
    //setUser(userData);
    //setIsAuthenticated(true); // L'utilisateur est maintenant vérifié et connecté
    //saveAuthState(userData, true);
    
    return response;
  }, []);

  const getFineoPayCheckoutLink = useCallback(async (data: { userId: string; amount: number }): Promise<FineoPayCheckoutResponse> => {
    // Récupérer le token d'authentification
    const authToken = tokenManager.getToken();
    
    const response = await apiClient<FineoPayCheckoutResponse, { userId: string; amount: number }>(
      paymentEndpoints.fineopayCheckoutLink,
      "POST",
      { 
        body: data,
        isPublicRoute: false,
        token: authToken || ''
      }
    );
    
    return response;
  }, []);

  // If using context, use context values; otherwise use local state
  const finalUser = useContextAuth && contextAuth ? contextAuth.user : user;
  const finalIsLoading = useContextAuth && contextAuth ? contextAuth.isLoading : isLoading;
  const finalIsAuthenticated = useContextAuth && contextAuth ? contextAuth.isAuthenticated : isAuthenticated;
  const finalLogin = useContextAuth && contextAuth ? contextAuth.login : login;
  const finalLogout = useContextAuth && contextAuth ? contextAuth.logout : logout;
  const finalCheckAuthStatus = useContextAuth && contextAuth ? (contextAuth.checkAuthStatus || (async () => {})) : checkAuthStatus;

  return {
    // State (from context if available, otherwise from local state)
    user: finalUser,
    isLoading: finalIsLoading,
    isAuthenticated: finalIsAuthenticated,
    
    // Actions
    login: finalLogin,
    logout: finalLogout,
    checkAuthStatus: finalCheckAuthStatus,
    refreshAuth: useContextAuth && contextAuth ? (contextAuth.refreshAuth || (async () => {})) : (async () => {}),
    
    // Additional methods (always use fallback implementations)
    resendOtp,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    getProfile,
    getPublicProfile,
    
    // OTP Flow
    sendOtp,
    checkVerification,
    getLoginConfig,
    
    // New Auth Functions
    registerWithPlan,
    verifyEmailWithToken,
    getFineoPayCheckoutLink,
  };
};

// ==================== PROFILE HOOKS ====================

export const useProfile = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<User>(endpoints.me);
      setProfile(response);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: UpdateProfileDto) => {
    try {
      setIsLoading(true);
      const response = await api.put<User, UpdateProfileDto>(
        endpoints.profile,
        profileData
      );
      setProfile(response);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    profile,
    isLoading,
    getProfile,
    updateProfile,
  };
};

// ==================== AUTH STATUS HOOK ====================

export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(globalAuthState.isAuthenticated);
  const [isLoading, setIsLoading] = useState(false);

  const checkAuth = useCallback(async () => {
    // If already checking, wait for the existing promise
    if (globalAuthState.checkPromise) {
      await globalAuthState.checkPromise;
      setIsAuthenticated(globalAuthState.isAuthenticated);
      setIsLoading(false);
      return;
    }

    // If checked recently (within 30 seconds), use cached data
    const now = Date.now();
    if (globalAuthState.lastCheck && (now - globalAuthState.lastCheck) < 30000) {
      setIsAuthenticated(globalAuthState.isAuthenticated);
      setIsLoading(false);
      return;
    }

    // Check if we have a token first
    const token = tokenManager.getToken();
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get<{ isAuthenticated: boolean }>(
        endpoints.checkAuth,
        { isPublicRoute: true }
      );
      setIsAuthenticated(response.isAuthenticated);
      globalAuthState.isAuthenticated = response.isAuthenticated;
      globalAuthState.lastCheck = now;
    } catch {
      setIsAuthenticated(false);
      globalAuthState.isAuthenticated = false;
      globalAuthState.lastCheck = now;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const now = Date.now();
    const hasRecentCheck = globalAuthState.lastCheck && (now - globalAuthState.lastCheck) < 30000;
    const hasToken = tokenManager.getToken();
    
    // Only check if we don't have a recent check and we have a token
    if (!hasRecentCheck && hasToken) {
    checkAuth();
    } else if (hasRecentCheck) {
      // Use cached state without API call
      setIsAuthenticated(globalAuthState.isAuthenticated);
      setIsLoading(false);
    } else {
      // No token, not authenticated
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [checkAuth]);

  return {
    isAuthenticated,
    isLoading,
    checkAuth,
  };
};
