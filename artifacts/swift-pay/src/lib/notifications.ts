import { useCallback, useEffect, useState } from 'react';

export type NotificationType = 'transaction' | 'security' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  details: string;
  createdAt: string;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
}

const STORAGE_PREFIX = 'swiftpay_notifications_';
const CHANGE_EVENT = 'swiftpay-notifications-changed';

const starterNotifications: Omit<Notification, 'id'>[] = [
  {
    type: 'transaction',
    title: 'Paiement reçu par Mamadou Koné',
    message: 'Votre transfert de 30 000 FCFA a été livré avec succès.',
    details: 'Le destinataire a reçu les fonds sur son compte Orange Money en Côte d’Ivoire.',
    createdAt: '2026-07-25T08:18:00Z',
    read: false,
    actionLabel: 'Voir la transaction',
    actionHref: '/transactions/TXN001',
  },
  {
    type: 'transaction',
    title: 'Transfert en cours de traitement',
    message: 'Le transfert vers Fatou Diallo est toujours en attente.',
    details: 'La conversion de 23,12 USDT en 15 000 FCFA est en cours. Nous vous préviendrons dès que le paiement sera confirmé.',
    createdAt: '2026-07-25T06:35:00Z',
    read: false,
    actionLabel: 'Suivre le transfert',
    actionHref: '/transactions/TXN002',
  },
  {
    type: 'security',
    title: 'Bienvenue sur SwiftPay',
    message: 'Votre compte est prêt à recevoir et envoyer des paiements.',
    details: 'Pensez à compléter votre profil et à activer les options de sécurité disponibles pour protéger votre compte.',
    createdAt: '2026-07-24T12:00:00Z',
    read: true,
    actionLabel: 'Ouvrir mon profil',
    actionHref: '/profil',
  },
  {
    type: 'info',
    title: 'Les paiements restent transparents',
    message: 'Retrouvez le détail de chaque transfert dans votre historique.',
    details: 'Chaque transaction inclut son statut, le taux appliqué, les frais et les étapes de traitement.',
    createdAt: '2026-07-23T09:30:00Z',
    read: true,
    actionLabel: 'Voir les transactions',
    actionHref: '/transactions',
  },
];

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

function dispatchChange() {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function readStored(userId: string): Notification[] {
  try {
    const stored = localStorage.getItem(storageKey(userId));
    if (stored) return JSON.parse(stored) as Notification[];

    const seeded = starterNotifications.map((notification, index) => ({
      ...notification,
      id: `${userId}_notification_${index + 1}`,
    }));
    localStorage.setItem(storageKey(userId), JSON.stringify(seeded));
    return seeded;
  } catch {
    return [];
  }
}

function save(userId: string, notifications: Notification[]) {
  localStorage.setItem(storageKey(userId), JSON.stringify(notifications));
  dispatchChange();
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    userId ? readStored(userId) : [],
  );

  useEffect(() => {
    setNotifications(userId ? readStored(userId) : []);
  }, [userId]);

  useEffect(() => {
    const refresh = () => setNotifications(userId ? readStored(userId) : []);
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [userId]);

  const update = useCallback(
    (updater: (current: Notification[]) => Notification[]) => {
      if (!userId) return;
      const next = updater(readStored(userId));
      save(userId, next);
      setNotifications(next);
    },
    [userId],
  );

  const markAsRead = useCallback(
    (id: string) => {
      update((current) => current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ));
    },
    [update],
  );

  const remove = useCallback(
    (id: string) => {
      update((current) => current.filter((notification) => notification.id !== id));
    },
    [update],
  );

  const removeAll = useCallback(() => {
    update(() => []);
  }, [update]);

  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read).length,
    markAsRead,
    remove,
    removeAll,
  };
}