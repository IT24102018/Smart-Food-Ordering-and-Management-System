import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { API_BASE_URL } from '@/constants/api';
import { useAuth } from '@/contexts/auth-context';

export type NotificationItem = {
  id: string;
  customerEmail: string;
  orderId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

type NotificationsContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const readJsonResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { userEmail } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const refreshNotifications = useCallback(async () => {
    if (!userEmail) {
      setNotifications([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications?customerEmail=${encodeURIComponent(userEmail)}`);
      const payload = await readJsonResponse(response);

      if (response.ok && Array.isArray(payload?.notifications)) {
        setNotifications(payload.notifications);
      }
    } catch {
      setNotifications([]);
    }
  }, [userEmail]);

  const markAllAsRead = useCallback(async () => {
    if (!userEmail) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerEmail: userEmail }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
        return;
      }

      await refreshNotifications();
    } catch {
      await refreshNotifications();
    }
  }, [refreshNotifications, userEmail]);

  const clearAllNotifications = useCallback(async () => {
    if (!userEmail) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/clear-all`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerEmail: userEmail }),
      });

      if (response.ok) {
        setNotifications([]);
        return;
      }

      await refreshNotifications();
    } catch {
      await refreshNotifications();
    }
  }, [refreshNotifications, userEmail]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      refreshNotifications,
      markAllAsRead,
      clearAllNotifications,
    }),
    [clearAllNotifications, markAllAsRead, notifications, refreshNotifications, unreadCount]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }

  return context;
}