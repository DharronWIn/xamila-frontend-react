import { ZodSchema } from "zod";
import { getApiBaseUrl, isDebugMode } from "../../config/environment-configuration";
import { toast } from "../../hooks/use-toast";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// ✅ Gestion centralisée des tokens côté client
let authToken: string | undefined = undefined;
let refreshToken: string | undefined = undefined;

export const tokenManager = {
  setTokens: (accessToken: string, refreshTokenValue?: string) => {
    authToken = accessToken;
    document.cookie = `jwt=${accessToken}; path=/; SameSite=Strict; Secure=${window.location.protocol === 'https:'}`;
    
    if (refreshTokenValue) {
      refreshToken = refreshTokenValue;
      // Stocker le refresh token de manière plus sécurisée (httpOnly serait idéal, mais pas possible côté client)
      document.cookie = `refresh_jwt=${refreshTokenValue}; path=/; SameSite=Strict; Secure=${window.location.protocol === 'https:'}`;
    }

    // Notifier l'application qu'un changement d'auth est survenu
    try {
      window.dispatchEvent(new CustomEvent('auth:changed', { detail: { isAuthenticated: true } }));
    } catch {
      // Do nothing
    }
  },
  
  // Méthode legacy pour compatibilité
  setToken: (token: string) => {
    tokenManager.setTokens(token);
  },
  
  getToken: () => authToken ?? document.cookie.match(/(^| )jwt=([^;]+)/)?.[2],
  
  getRefreshToken: () => refreshToken ?? document.cookie.match(/(^| )refresh_jwt=([^;]+)/)?.[2],
  
  clearTokens: () => {
    authToken = undefined;
    refreshToken = undefined;
    document.cookie = `jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    document.cookie = `refresh_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

    // Notifier l'application de la déconnexion
    try {
      window.dispatchEvent(new CustomEvent('auth:changed', { detail: { isAuthenticated: false } }));
    } catch {
      // Do nothing
    }
  },
  
  // Méthode legacy pour compatibilité
  clearToken: () => {
    tokenManager.clearTokens();
  },
  getTokenInfo: (token?: string): unknown => {
    const tokenToCheck = token || tokenManager.getToken();
    if (!tokenToCheck) return null;
    
    try {
      // Décoder le JWT pour obtenir les informations
      const base64Url = tokenToCheck.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const currentTime = Math.floor(Date.now() / 1000);
      
      return {
        ...payload,
        isExpired: payload.exp < currentTime,
        expiresAt: new Date(payload.exp * 1000),
        timeUntilExpiry: payload.exp - currentTime
      };
    } catch (error) {
      console.warn("Erreur lors du décodage du token:", error);
      return null;
    }
  },
  
  // Fonction pour rafraîchir le token
  refreshAccessToken: async (): Promise<boolean> => {
    const currentRefreshToken = tokenManager.getRefreshToken();
    if (!currentRefreshToken) {
      if (isDebugMode()) {
        console.warn("🔒 Aucun refresh token disponible");
      }
      return false;
    }
    
    try {
      if (isDebugMode()) {
        console.log("🔄 Tentative de rafraîchissement du token...");
      }
      
      // Importer endpoints de manière dynamique pour éviter les dépendances circulaires
      const { authEndpoints } = await import('./endpoints');
      console.log("🔄 URL de rafraîchissement du token:", buildApiUrl(authEndpoints.refreshToken));
      
      const response = await fetch(buildApiUrl(authEndpoints.refreshToken), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentRefreshToken}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (isDebugMode()) {
          console.warn("🔒 Échec du rafraîchissement du token");
        }
        return false;
      }
      
      const data = await response.json();
      console.log("🔄 Données de rafraîchissement du token:", data);
      
      // Gérer la structure de réponse avec success/data
      let tokenData = data;
      if (data && typeof data === 'object' && 'success' in data && data.success && data.data) {
        tokenData = data.data;
      }
      
      if (tokenData.accessToken) {
        tokenManager.setTokens(tokenData.accessToken, tokenData.refreshToken || currentRefreshToken);
        if (isDebugMode()) {
          console.log("✅ Token rafraîchi avec succès");
        }
        return true;
      }
      
      return false;
    } catch (error) {
      if (isDebugMode()) {
        console.error("❌ Erreur lors du rafraîchissement du token:", error);
      }
      return false;
    }
  },
};

interface ApiOptions<T = unknown> {
  body?: T;
  headers?: Record<string, string>;
  token?: string;     // prioritaire si fourni
  schema?: ZodSchema; // validation optionnelle
  isPublicRoute?: boolean; // indique si la route est publique (pas de gestion auto du token expiré)
}

/**
 * Fonction utilitaire pour construire l'URL complète
 */
function buildApiUrl(endpoint: string): string {
  // Type guard to ensure endpoint is a string
  if (typeof endpoint !== 'string') {
    console.error('buildApiUrl received non-string endpoint:', endpoint);
    throw new Error(`buildApiUrl expects a string, but received: ${typeof endpoint}`);
  }
  
  // Si l'URL est déjà complète (commence par http), l'utiliser telle quelle
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // Sinon, construire l'URL avec la base de l'environnement actuel
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
}

/**
 * Gère l'expiration du token et redirige vers la page de connexion
 */
async function handleTokenExpiration(): Promise<void> {
  // Essayer de rafraîchir le token avant de rediriger
  const refreshSuccess = await tokenManager.refreshAccessToken();
  
  if (refreshSuccess) {
    if (isDebugMode()) {
      console.log("✅ Token rafraîchi automatiquement, pas de redirection nécessaire");
    }
    return; // Pas besoin de rediriger, le token a été rafraîchi
  }
  
  // Si le refresh a échoué, nettoyer tous les tokens
  tokenManager.clearTokens();
  
  // Afficher un message à l'utilisateur
  toast({
    title: "Session expirée",
    description: "Votre session a expiré. Vous allez être redirigé vers la page de connexion.",
    variant: "destructive"
  });
  
  // Rediriger vers la page de connexion après un court délai
  setTimeout(() => {
    // Vérifier si on est déjà sur la page de connexion pour éviter une redirection inutile
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }, 2000);
}

/**
 * Vérifie si l'erreur indique une expiration de token
 * Le backend envoie un 401 quand le token expire, donc on se fie au status code
 */
function isTokenExpiredError(status: number, errorData: unknown): boolean {
  if (status !== 401) return false;
  
  // Vérifier si c'est vraiment une erreur d'expiration de token
  // Si le message contient des mots-clés spécifiques, ce n'est pas une expiration
  if (errorData && typeof errorData === 'object') {
    const error = errorData as { message?: string; errors?: string[] };
    const message = error.message || '';
    const errors = error.errors || [];
    const allMessages = [message, ...errors].join(' ').toLowerCase();
    
    // Mots-clés qui indiquent que ce n'est PAS une expiration de token
    const nonTokenKeywords = [
      'email',
      'vérifier',
      'vérifiez',
      'validation',
      'confirmer',
      'confirmez',
      'activer',
      'activez',
      'boîte',
      'inbox',
      'verify',
      'confirm',
      'activate',
      'credentials',
      'identifiants',
      'mot de passe',
      'password'
    ];
    
    // Si le message contient un de ces mots-clés, ce n'est pas une expiration de token
    if (nonTokenKeywords.some(keyword => allMessages.includes(keyword))) {
      return false;
    }
  }
  
  // Par défaut, un 401 est considéré comme une expiration de token
  return true;
}

/**
 * Vérifie si l'erreur indique une erreur de validation
 */
function isValidationError(status: number): boolean {
  // Selon votre backend : 422 = erreur de validation
  return status === 422;
}

/**
 * Vérifie si le serveur est en maintenance
 */
function isMaintenanceError(status: number): boolean {
  // Selon votre backend : 503 = maintenance
  return status === 503;
}

/**
 * Gère les erreurs de maintenance
 */
function handleMaintenanceError(): void {
  // Afficher un toast informatif
  toast({
    title: "Maintenance",
    description: "Le service est temporairement en maintenance. Veuillez réessayer plus tard.",
    variant: "destructive"
  });
  
  if (isDebugMode()) {
    console.warn("🚧 Serveur en maintenance (503) - Redirection vers la page de maintenance");
  }
  
  // Rediriger vers la page de maintenance après un court délai
  setTimeout(() => {
    // Vérifier si on n'est pas déjà sur la page de maintenance
    if (window.location.pathname !== '/maintenance') {
      window.location.href = '/maintenance';
    }
  }, 2000);
}

/**
 * Crée un message d'erreur contextualisé selon le code de statut
 */
function createContextualErrorMessage(status: number, originalMessage: string, errorData?: unknown): string {
  switch (status) {
    case 401:
      // Le backend envoie un 401 pour l'expiration de token
      if (isTokenExpiredError(status, errorData)) {
        return "Session expirée. Reconnexion automatique en cours...";
      }
      // Sinon, garder le message original du backend
      return originalMessage;
    case 422:
      return `Erreur de validation : ${originalMessage}`;
    case 503:
      return "Service temporairement indisponible";
    default:
      return originalMessage;
  }
}

/**
 * Client API générique avec JWT + Zod + erreurs + gestion d'environnements
 */
export async function apiClient<TResponse = unknown, TBody = unknown>(
  url: string,
  method: HttpMethod,
  options: ApiOptions<TBody> = {}
): Promise<TResponse> {
  const { body, headers, token, schema, isPublicRoute = false } = options;
  const auth = token ?? tokenManager.getToken();
  const fullUrl = buildApiUrl(url);

  // Le backend est la source de vérité pour l'expiration des tokens
  // On envoie simplement le token s'il existe, le backend nous dira s'il est expiré

  // Log en mode debug

  try {
    const res = await fetch(fullUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include'
    });

    if (isDebugMode()) {
      console.log(`🌐 API ${method}: ${fullUrl}`, { res, headers: !!headers });
    }
  

    if (!res.ok) {
      let errorMsg = res.statusText;
      let errorDetails: unknown = null;
      
      // Gestion spécifique du mode maintenance (503)
      if (isMaintenanceError(res.status)) {
        handleMaintenanceError();
        throw new ApiError(503, "Service en maintenance", { maintenance: true });
      }
      
      try {
        const errorData = await res.json();
        
        // Gestion spécifique de l'expiration de token (401)
        if (isTokenExpiredError(res.status, errorData)) {
          // Si c'est une route publique, ne pas essayer de rafraîchir le token
          if (isPublicRoute) {
            if (isDebugMode()) {
              console.warn("🔓 Erreur 401 sur route publique - pas de tentative de refresh");
            }
            // Laisser l'erreur se propager normalement pour les routes publiques
          } else {
            if (isDebugMode()) {
              console.warn("🔒 Token expiré détecté depuis la réponse du serveur (401), tentative de refresh...");
            }
            
            // Essayer de rafraîchir le token pour les routes protégées
            const refreshSuccess = await tokenManager.refreshAccessToken();
            if (refreshSuccess) {
              // Retry the request with the new token
              if (isDebugMode()) {
                console.log("🔄 Nouvelle tentative de requête avec le token rafraîchi...");
              }
              
              const newAuth = tokenManager.getToken();
              const retryResponse = await fetch(fullUrl, {
                method,
                headers: {
                  "Content-Type": "application/json",
                  ...(newAuth ? { Authorization: `Bearer ${newAuth}` } : {}),
                  ...headers,
                },
                body: body ? JSON.stringify(body) : undefined,
                credentials: 'include'
              });
              
              if (retryResponse.ok) {
                let retryData: unknown = null;
                try {
                  retryData = await retryResponse.json();
                } catch {
                  return (null as unknown as TResponse);
                }
                
                // Traiter la réponse comme d'habitude
                if (retryData && typeof retryData === 'object' && 'success' in retryData) {
                  const apiResponse = retryData as { success: boolean; errors?: string[]; message?: string; data?: unknown };
                  if (!apiResponse.success) {
                    const errorMessages = apiResponse.errors || [];
                    const errorMessage = errorMessages.length > 0 
                      ? errorMessages.join(', ') 
                      : apiResponse.message || 'Une erreur est survenue';
                    throw new ApiError(retryResponse.status, errorMessage, retryData);
                  }
                  retryData = apiResponse.data;
                }
                
                if (schema) {
                  const result = schema.safeParse(retryData);
                  if (!result.success) {
                    throw new ApiError(422, "Erreur de validation des données", result.error.format());
                  }
                  return result.data as TResponse;
                }
                
                return retryData as TResponse;
              }
            }
            
            // Si le refresh ou la nouvelle requête a échoué pour une route protégée
            await handleTokenExpiration();
            throw new ApiError(401, "Session expirée", { expired: true });
          }
        }
        
        // Gestion spécifique des erreurs de validation (422)
        if (isValidationError(res.status)) {
          if (isDebugMode()) {
            console.warn("⚠️ Erreur de validation détectée (422)");
          }
        }
        
        // Extraire le message d'erreur selon la structure de votre API
        if (errorData && typeof errorData === 'object' && 'success' in errorData) {
          const apiError = errorData as { success: boolean; errors?: string[]; message?: string };
          if (!apiError.success && apiError.errors && apiError.errors.length > 0) {
            // Extraire les erreurs du champ errors
            errorMsg = apiError.errors.join(', ');
          } else if (apiError.message) {
            errorMsg = apiError.message;
          }
        } else if (errorData && typeof errorData === 'object' && 'message' in errorData) {
          errorMsg = (errorData as { message: string }).message;
        }
        
        errorDetails = errorData;
      } catch (parseError) {
        // Si on ne peut pas parser la réponse JSON
        if (isDebugMode()) {
          console.warn("⚠️ Impossible de parser la réponse d'erreur JSON");
        }
      }
      
      // Log des erreurs en mode debug avec contexte spécifique
      if (isDebugMode()) {
        const errorContext = isValidationError(res.status) ? "VALIDATION" 
                           : isTokenExpiredError(res.status, errorDetails) ? "TOKEN_EXPIRED"
                           : isMaintenanceError(res.status) ? "MAINTENANCE"
                           : "GENERAL";
        console.error(`❌ API Error [${errorContext}] ${res.status}: ${errorMsg}`, errorDetails);
      }
      
      const contextualMessage = createContextualErrorMessage(res.status, errorMsg, errorDetails);
      throw new ApiError(res.status, contextualMessage, errorDetails);
    }

    let data: unknown = null;
    try {
      data = await res.json();
      console.log("🔄 Données de la réponse: url", fullUrl, data);
    } catch {
      return (null as unknown) as TResponse;
    }

    // Vérifier si l'API retourne une structure avec success/errors
    if (data && typeof data === 'object' && 'success' in data) {
      const apiResponse = data as { success: boolean; errors?: string[]; message?: string; data?: unknown };
      if (!apiResponse.success) {
        // Extraire les erreurs du champ errors
        const errorMessages = apiResponse.errors || [];
        const errorMessage = errorMessages.length > 0 
          ? errorMessages.join(', ') 
          : apiResponse.message || 'Une erreur est survenue';
        
        if (isDebugMode()) {
          console.error(`❌ API Business Error: ${errorMessage}`, data);
        }
        
        throw new ApiError(res.status, errorMessage, data);
      }
      
      // Si success est true, retourner les données
      data = apiResponse.data;
    }

    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        if (isDebugMode()) {
          console.error("❌ Schema validation error:", result.error.format());
        }
        throw new ApiError(422, "Schema validation error", result.error.format());
      }
      return result.data as TResponse;
    }

    return data as TResponse;
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, "Network error or server unreachable", err instanceof Error ? err.message : "Unknown error" );
  }
}

/**
 * Helpers par méthode
 * 
 * Exemples d'utilisation:
 * 
 * // Route protégée (comportement par défaut) - le token sera vérifié et rafraîchi si nécessaire
 * const userData = await api.get<User>('/auth/user');
 * 
 * // Route publique - le token sera envoyé s'il existe mais aucune gestion automatique en cas d'erreur 401
 * const publicData = await api.get<PublicData>('/public/data', { isPublicRoute: true });
 * 
 * // Route publique avec schéma de validation
 * const validatedData = await api.post<Response, LoginData>('/auth/login', loginData, { 
 *   schema: loginResponseSchema, 
 *   isPublicRoute: true 
 * });
 */
export const api = {
  get: <T>(url: string, options?: { schema?: ZodSchema; isPublicRoute?: boolean }) => 
    apiClient<T>(url, "GET", options || {}),
  post: <T, B>(url: string, body: B, options?: { schema?: ZodSchema; isPublicRoute?: boolean }) =>
    apiClient<T, B>(url, "POST", { body, ...(options || {}) }),
  put: <T, B>(url: string, body: B, options?: { schema?: ZodSchema; isPublicRoute?: boolean }) =>
    apiClient<T, B>(url, "PUT", { body, ...(options || {}) }),
  patch: <T, B>(url: string, body: B, options?: { schema?: ZodSchema; isPublicRoute?: boolean }) =>
    apiClient<T, B>(url, "PATCH", { body, ...(options || {}) }),
  delete: <T>(url: string, options?: { schema?: ZodSchema; isPublicRoute?: boolean }) => 
    apiClient<T>(url, "DELETE", options || {}),
};
