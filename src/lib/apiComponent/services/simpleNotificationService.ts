

// Simple notification service using polling instead of SSE
class SimpleNotificationService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling = false;
  private lastCheckTime: Date | null = null;
  private listeners: { [key: string]: ((...args: unknown[]) => void)[] } = {};
  private pollingIntervalMs = 120000; // 2 minutes par défaut
  private lastActivityTime = new Date();
  private lastAdaptiveCheck: Date | null = null;

  /**
   * Start polling for notifications
   */
  public startPolling(): void {
    if (this.isPolling) {
      console.log('Notification polling already active');
      return;
    }

    console.log('Starting notification polling...');
    this.isPolling = true;
    this.emit('connection:status', true);
    
    // Start polling immediately
    this.pollNotifications();
    
    // Set up interval for regular polling
    this.pollingInterval = setInterval(() => {
      this.pollNotifications();
    }, this.pollingIntervalMs);
  }

  /**
   * Stop polling for notifications
   */
  public stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.isPolling = false;
    this.emit('connection:status', false);
    console.log('Notification polling stopped');
  }

  /**
   * Poll for new notifications
   */
  private async pollNotifications(): Promise<void> {
    try {
      const now = new Date();
      
      // Import API client dynamically to avoid circular dependencies
      const { api } = await import('../apiClient');
      
      // Get unread count
      const countResponse = await api.get<{ count: number }>('/notifications/unread-count');
      const count = countResponse.count || 0;
      
      // Emit count update
      this.emit('notification:count', count);
      
      // Get recent notifications to check for new ones
      await this.fetchRecentNotifications();
      
      this.lastCheckTime = now;
      
      // Update activity time and adjust polling if needed
      this.lastActivityTime = now;
      
      // Only check for adaptive polling every 5 minutes to avoid unnecessary restarts
      if (!this.lastAdaptiveCheck || (now.getTime() - this.lastAdaptiveCheck.getTime()) > 5 * 60 * 1000) {
        this.setAdaptivePolling();
        this.lastAdaptiveCheck = now;
      }
    } catch (error) {
      console.error('Error polling notifications:', error);
    }
  }

  /**
   * Fetch recent notifications and emit new ones
   */
  private async fetchRecentNotifications(): Promise<void> {
    try {
      const { api } = await import('../apiClient');
      
      const response = await api.get<{ data: Notification[] }>('/notifications?limit=5&page=1');
      const notifications = Array.isArray(response.data) ? response.data : [];
      
      // Emit each notification as new (in a real app, you'd track which ones are actually new)
      notifications.forEach((notification: Notification) => {
        this.emit('notification:new', notification);
      });
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
    }
  }

  /**
   * Event emitter methods
   */
  public on(event: string, listener: (...args: unknown[]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  public off(event: string, listener: (...args: unknown[]) => void): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  private emit(event: string, ...args: unknown[]): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Check if the service is polling
   */
  public getConnectionStatus(): boolean {
    return this.isPolling;
  }

  /**
   * Set polling interval
   */
  public setPollingInterval(intervalMs: number): void {
    // Only restart if the interval actually changed
    if (this.pollingIntervalMs !== intervalMs) {
      this.pollingIntervalMs = intervalMs;
      
      // Restart polling with new interval if currently active
      if (this.isPolling) {
        this.stopPolling();
        this.startPolling();
      }
    }
  }

  /**
   * Get current polling interval
   */
  public getPollingInterval(): number {
    return this.pollingIntervalMs;
  }

  /**
   * Set adaptive polling based on activity
   */
  public setAdaptivePolling(): void {
    const now = new Date();
    const timeSinceActivity = now.getTime() - this.lastActivityTime.getTime();
    
    // Si pas d'activité depuis plus de 10 minutes, ralentir le polling
    if (timeSinceActivity > 10 * 60 * 1000) {
      // Only change if different from current interval
      if (this.pollingIntervalMs !== 300000) {
        this.setPollingInterval(300000); // 5 minutes
      }
    } else {
      // Only change if different from current interval
      if (this.pollingIntervalMs !== 120000) {
        this.setPollingInterval(120000); // 2 minutes
      }
    }
  }

  /**
   * Get the last check time
   */
  public getLastCheckTime(): Date | null {
    return this.lastCheckTime;
  }

  /**
   * Force a manual check for notifications
   */
  public async checkNow(): Promise<void> {
    await this.pollNotifications();
  }
}

// Create a singleton instance
export const simpleNotificationService = new SimpleNotificationService();

// Auto-start polling when the service is imported
// Disabled to avoid conflicts with component-managed polling
// if (typeof window !== 'undefined') {
//   // Only auto-start in browser environment
//   simpleNotificationService.startPolling();
// }
