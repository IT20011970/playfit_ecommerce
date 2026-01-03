import React, { useEffect } from 'react';
import { useNotificationContext } from '../context/NotificationContext';
import { Notification } from '../hooks/useNotifications';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ notification, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[notification.type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[notification.type];

  return (
    <div className={`${bgColor} text-white p-4 rounded-lg shadow-lg mb-2 flex items-start max-w-md animate-slide-in`}>
      <div className="flex-shrink-0 mr-3 text-2xl">{icon}</div>
      <div className="flex-1">
        <h4 className="font-bold">{notification.title}</h4>
        <p className="text-sm">{notification.message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 text-white hover:text-gray-200"
      >
        ✕
      </button>
    </div>
  );
};

export const NotificationToastContainer: React.FC = () => {
  const { notifications, removeNotification, isConnected } = useNotificationContext();

  return (
    <>
      {/* Connection indicator */}
      {!isConnected && (
        <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded text-sm">
          Reconnecting to notifications...
        </div>
      )}

      {/* Toast container */}
      <div className="fixed top-20 right-4 z-[9999] space-y-2">
        {notifications.slice(0, 5).map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </>
  );
};
