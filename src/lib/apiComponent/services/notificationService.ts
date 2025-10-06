import { Notification } from '../types';

// Browser-compatible EventEmitter implementation
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  off(event: string, listener: Function): this {
    if (!this.events[event]) return this;
    this.events[event] = this.events[event].filter(l => l !== listener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    if (!this.events[event]) return false;
    this.events[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
    return true;
  }

  removeAllListeners(event?: string): this {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }
}

export interface NotificationServiceEvents {
  'notification:new': (notification: Notification) => void;
  'notification:read': (notificationId: string) => void;
  'notification:deleted': (notificationId: string) => void;
  'notification:count': (count: number) => void;
  'connection:status': (connected: boolean) => void;
}

export class NotificationService extends EventEmitter {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling = false;
  private baseUrl: string;
  private lastCheckTime: Date | null = null;

  constructor() {
    super();
    this.baseUrl = this.getBaseUrl();
  }

  private getBaseUrl(): string {
    // Get the base URL from environment or use localhost
    const env = import.meta.env;
    if (env.VITE_API_BASE_URL) {
      return env.VITE_API_BASE_URL;
    }
    return 'http://localhost:8082';
  }

  /**
   * Start polling for notifications
   */
  public connect(): void {
    if (this.isPolling) {
      console.log('Notification polling already active');
      return;
    }

    console.log('Starting notification polling...');
    this.isPolling = true;
    this.emit('connection:status', true);
    
    // Start polling immediately
    this.pollNotifications();
    
    // Set up interval for regular polling (every 2 minutes)
    this.pollingInterval = setInterval(() => {
      this.pollNotifications();
    }, 120000);
  }

  /**
   * Stop polling for notifications
   */
  public disconnect(): void {
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
      // Import API client dynamically to avoid circular dependencies
      const { api } = await import('../apiClient');
      
      // Get unread count
      const countResponse = await api.get<{ count: number }>('/notifications/unread-count');
      const count = countResponse.count || 0;
      
      // Emit count update
      this.emit('notification:count', count);
      
      // If this is the first check or count has increased, fetch recent notifications
      if (!this.lastCheckTime || count > 0) {
        await this.fetchRecentNotifications();
      }
      
      this.lastCheckTime = new Date();
    } catch (error) {
      console.error('Error polling notifications:', error);
    }
  }

  /**
   * Fetch recent notifications
   */
  private async fetchRecentNotifications(): Promise<void> {
    try {
      // Import API client dynamically to avoid circular dependencies
      const { api } = await import('../apiClient');
      
      const response = await api.get<{ data: Notification[] }>('/notifications?limit=5&page=1');
      const notifications = response.data || [];
      
      // Emit new notifications (you might want to add logic to detect truly new ones)
      notifications.forEach((notification: Notification) => {
        this.emit('notification:new', notification);
      });
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
    }
  }

  /**
   * Check if the service is polling
   */
  public getConnectionStatus(): boolean {
    return this.isPolling;
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
export const notificationService = new NotificationService();

// Auto-connect when the service is imported
if (typeof window !== 'undefined') {
  // Only auto-connect in browser environment
  notificationService.connect();
}
