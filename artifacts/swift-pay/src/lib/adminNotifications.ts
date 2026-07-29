import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from './api';
import type { NotificationType } from './notifications';

export interface AdminNotification {
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
  user: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string | null;
  };
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { notifications } = await apiFetch<{ notifications: AdminNotification[] }>(
        '/admin/notifications',
      );
      setNotifications(notifications);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiFetch(`/admin/notifications/${id}`, { method: 'DELETE' });
    } catch {
      load();
    }
  }, [load]);

  const removeAll = useCallback(async () => {
    setNotifications([]);
    try {
      await apiFetch('/admin/notifications/all', { method: 'DELETE' });
    } catch {
      load();
    }
  }, [load]);

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((n) => !n.read).length,
    remove,
    removeAll,
    reload: load,
  };
}
