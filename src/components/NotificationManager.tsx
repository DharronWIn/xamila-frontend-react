import { useEffect } from 'react';
import { simpleNotificationService } from '@/lib/apiComponent/services/simpleNotificationService';

/**
 * Global notification manager component
 * This component ensures that notification polling is started when the app loads
 * and manages the global state of notifications
 */
export function NotificationManager() {
  useEffect(() => {
    // Start polling when the app loads
    if (!simpleNotificationService.getConnectionStatus()) {
      console.log('Starting global notification polling...');
      simpleNotificationService.startPolling();
    }

    // Cleanup on unmount (though this component should not unmount)
    return () => {
      // Note: We don't stop polling here as it should continue globally
      // The polling will be managed by the individual components
    };
  }, []);

  // This component doesn't render anything
  return null;
}
