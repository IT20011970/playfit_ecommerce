import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications, Notification } from '../hooks/useNotifications';

interface NotificationContextType {
  notifications: Notification[];
  isConnected: boolean;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  userId?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, userId }) => {
  const notificationState = useNotifications({
    userId,
    autoConnect: true,
  });

  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};
