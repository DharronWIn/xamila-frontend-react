import { useState, useCallback, useEffect } from 'react';
import { api } from '../apiClient';
import { notificationEndpoints } from '../endpoints';
import {
    Notification,
    NotificationQueryParams,
    PaginatedResponse
} from '../types';
import { simpleNotificationService } from '../services/simpleNotificationService';

// ==================== NOTIFICATIONS HOOKS ====================

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Set up real-time notification listeners
  useEffect(() => {
    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleNotificationRead = (notificationId: string) => {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
    };

    const handleNotificationDeleted = (notificationId: string) => {
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return prev.filter(n => n.id !== notificationId);
      });
    };

    const handleCountUpdate = (count: number) => {
      setUnreadCount(count);
    };

    const handleConnectionStatus = (connected: boolean) => {
      setIsConnected(connected);
    };

    // Add event listeners
    simpleNotificationService.on('notification:new', handleNewNotification);
    simpleNotificationService.on('notification:read', handleNotificationRead);
    simpleNotificationService.on('notification:deleted', handleNotificationDeleted);
    simpleNotificationService.on('notification:count', handleCountUpdate);
    simpleNotificationService.on('connection:status', handleConnectionStatus);

    // Set initial connection status
    setIsConnected(simpleNotificationService.getConnectionStatus());

    // Cleanup listeners on unmount
    return () => {
      simpleNotificationService.off('notification:new', handleNewNotification);
      simpleNotificationService.off('notification:read', handleNotificationRead);
      simpleNotificationService.off('notification:deleted', handleNotificationDeleted);
      simpleNotificationService.off('notification:count', handleCountUpdate);
      simpleNotificationService.off('connection:status', handleConnectionStatus);
    };
  }, []);

  const getNotifications = useCallback(async (params?: NotificationQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `${notificationEndpoints.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<PaginatedResponse<Notification>>(url);
      
      // Ensure data is always an array
      const notificationsData = Array.isArray(response.data) ? response.data : [];
      setNotifications(notificationsData);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUnreadCount = useCallback(async (): Promise<number> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<{ count: number }>(notificationEndpoints.unreadCount);
      
      setUnreadCount(response.count);
      return response.count;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch unread count');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getNotificationById = useCallback(async (id: string): Promise<Notification> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<Notification>(notificationEndpoints.details(id));
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notification');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.put(notificationEndpoints.markAsRead(id), {});
      
      // Update in local state
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await api.put(notificationEndpoints.markAllAsRead, {});
      
      // Update in local state
      setNotifications(prev => prev.map(n => ({ 
        ...n, 
        isRead: true, 
        readAt: new Date().toISOString() 
      })));
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(notificationEndpoints.delete(id));
      
      // Remove from local state
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [notifications]);

  const clearReadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(notificationEndpoints.clearRead);
      
      // Remove read notifications from local state
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to clear read notifications');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    isConnected,
    getNotifications,
    getUnreadCount,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
  };
};
