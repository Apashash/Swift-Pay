import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from './api';

export type NotificationType = 'transaction' | 'security' | 'info';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  details: string;
  read: boolean;
  actionLabel?: string | null;
  actionHref?: string | null;
  createdAt: string;
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) { setNotifications([]); return; }
    setLoading(true);
    try {
      const { notifications } = await apiFetch<{ notifications: Notification[] }>('/notifications');
      setNotifications(notifications);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch {
      load(); // revert on error
    }
  }, [load]);

  const remove = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
    } catch {
      load(); // revert on error
    }
  }, [load]);

  const removeAll = useCallback(async () => {
    setNotifications([]);
    try {
      await apiFetch('/notifications/all', { method: 'DELETE' });
    } catch {
      load();
    }
  }, [load]);

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((n) => !n.read).length,
    markAsRead,
    remove,
    removeAll,
    reload: load,
  };
}
