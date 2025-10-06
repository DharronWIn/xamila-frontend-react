import { useState, useEffect, useCallback } from 'react';
import { api, apiClient } from '../apiClient';
import { authEndpoints as endpoints, paymentEndpoints } from '../endpoints';
import {
  LoginDto, LoginResponse,
  User, ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  UpdateProfileDto,
  OtpLoginDto
} from '../types';
import { SubscriptionPlan } from '@/types/subscription';

// ==================== NEW INTERFACES ====================

export interface RegisterRequest {
  // Informations personnelles
  email: string;
  firstName: string;
  lastName: string;
  gender: "masculin" | "feminin";
  ageRange: string;
  
  // Contact et localisation
  phone: string;
  country: string;
  city: string;
  
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
  // Initialize with stored state if available
  const initialAuthState = getInitialAuthState();
  const [user, setUser] = useState<User | null>(initialAuthState?.user || globalAuthState.user);
  const [isLoading, setIsLoading] = useState(globalAuthState.isLoading);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthState?.isAuthenticated || globalAuthState.isAuthenticated);

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
    const { tokenManager } = await import('../apiClient');
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

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (loginData: LoginDto): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse, LoginDto>(
      endpoints.login,
      loginData,
      { isPublicRoute: true }
    );
    
    // Gérer les tokens
    if (response.accessToken) {
      const { tokenManager } = await import('../apiClient');
      tokenManager.setTokens(response.accessToken, response.refreshToken);
    }
    
    // Update global state
    globalAuthState.user = response.user;
    globalAuthState.isAuthenticated = true;
    globalAuthState.lastCheck = Date.now();
    
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  }, []);


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
      const { tokenManager } = await import('../apiClient');
      tokenManager.clearTokens();
      
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
    const { tokenManager } = await import('../apiClient');
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

  return {
    // State
    user,
    isLoading,
    isAuthenticated,
    
    // Actions
    login,
    resendOtp,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    getProfile,
    logout,
    checkAuthStatus,
    
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ isAuthenticated: boolean }>(
        endpoints.checkAuth,
        { isPublicRoute: true }
      );
      setIsAuthenticated(response.isAuthenticated);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    isLoading,
    checkAuth,
  };
};
