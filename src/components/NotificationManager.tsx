import { useEffect } from 'react';
import { simpleNotificationService } from '@/lib/apiComponent/services/simpleNotificationService';
import { tokenManager } from '@/lib/apiComponent/apiClient';
import { useAuthStore } from '@/stores/authStore';

/**
 * Global notification manager component
 * This component ensures that notification polling is started when the app loads
 * and manages the global state of notifications
 * 
 * It also handles starting/stopping polling based on authentication state
 */
export function NotificationManager() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Fonction pour gérer le démarrage du polling
    const startPollingIfAuthenticated = () => {
      const token = tokenManager.getToken();
      
      // Démarrer le polling UNIQUEMENT si l'utilisateur est authentifié ET a un token
      if (isAuthenticated && user && token) {
        if (!simpleNotificationService.getConnectionStatus()) {
          console.log('✅ Démarrage du polling de notifications (utilisateur authentifié)');
          simpleNotificationService.startPolling();
        }
      } else {
        // Arrêter le polling si l'utilisateur n'est pas authentifié
        if (simpleNotificationService.getConnectionStatus()) {
          console.log('⚠️ Arrêt du polling de notifications (utilisateur non authentifié)');
          simpleNotificationService.stopPolling();
        }
      }
    };

    // Démarrer ou arrêter le polling en fonction de l'état d'authentification
    startPollingIfAuthenticated();

    // Écouter les changements d'authentification
    const handleAuthChange = (event: CustomEvent) => {
      const { isAuthenticated: authState } = event.detail;
      
      if (!authState) {
        console.log('🔒 Déconnexion détectée, arrêt du polling');
        simpleNotificationService.stopPolling();
      } else {
        console.log('🔓 Connexion détectée, démarrage du polling');
        startPollingIfAuthenticated();
      }
    };

    // Écouter les événements d'authentification du tokenManager
    window.addEventListener('auth:changed', handleAuthChange as EventListener);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('auth:changed', handleAuthChange as EventListener);
      // Arrêter le polling lors du démontage du composant
      simpleNotificationService.stopPolling();
    };
  }, [isAuthenticated, user]);

  // This component doesn't render anything
  return null;
}
