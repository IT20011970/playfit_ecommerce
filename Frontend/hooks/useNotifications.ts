import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  data?: any;
  timestamp: number;
}

interface UseNotificationsOptions {
  userId?: string;
  url?: string;
  autoConnect?: boolean;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const {
    userId,
    url,
    autoConnect = true,
  } = options;

  // Determine notification service URL based on environment variable or hostname
  const getNotificationUrl = () => {
    // First check for environment variable
    const envUrl = import.meta.env.VITE_NOTIFICATION_URL;
    console.log('VITE_NOTIFICATION_URL:', envUrl);
    if (envUrl) return envUrl;
    
    // Use same origin (works with ngrok and localhost)
    return window.location.origin;
  };

  const notificationUrl = getNotificationUrl();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('Already connected to notification service');
      return;
    }

    console.log('🔌 Connecting to notification service:', notificationUrl);
    console.log('🔌 User ID:', userId || 'anonymous');

    // Connect to the /socket.io namespace (not path!)
    const socket = io(`${notificationUrl}/socket.io`, {
      query: { userId: userId || 'anonymous' },
      transports: ['polling', 'websocket'], // Try polling first, then websocket
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ Connected to notification service');
      console.log('🆔 Socket ID:', socket.id);
      setIsConnected(true);

      if (userId) {
        console.log('📝 Subscribing with userId:', userId);
        socket.emit('subscribe', { userId });
      }
    });

    socket.on('connected', (data: any) => {
      console.log('✅ Welcome message received:', data);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('❌ Disconnected from notification service. Reason:', reason);
      setIsConnected(false);
    });

    socket.on('notification', (notification: Notification) => {
      console.log('🔔 Received notification:', notification);
      setNotifications((prev) => [notification, ...prev]);
      
      // Show toast notification (if you have a toast library)
      // toast[notification.type](notification.message, { description: notification.title });
    });

    socket.on('connect_error', (error: any) => {
      console.error('❌ WebSocket connection error:', error.message);
    });

    socket.on('error', (error: any) => {
      console.error('❌ WebSocket error:', error);
    });

    socketRef.current = socket;
  }, [notificationUrl, userId]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    notifications,
    isConnected,
    connect,
    disconnect,
    clearNotifications,
    removeNotification,
  };
};
