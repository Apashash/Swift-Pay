import { useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  Info,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/auth';
import { type Notification, useNotifications } from '@/lib/notifications';

const formatRelativeDate = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days} j`;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

function notifIcon(type: Notification['type']) {
  if (type === 'transaction') return CheckCheck;
  if (type === 'security') return ShieldCheck;
  return Info;
}

function notifColors(type: Notification['type']) {
  if (type === 'transaction') return 'bg-[#e4f5d0] text-[#4e8226]';
  if (type === 'security') return 'bg-orange-100 text-orange-600';
  return 'bg-blue-100 text-blue-600';
}

function NotificationRow({
  notification,
  onRead,
  onRemove,
  onClick,
}: {
  notification: Notification;
  onRead: () => void;
  onRemove: () => void;
  onClick: () => void;
}) {
  const Icon = notifIcon(notification.type);
  return (
    <div
      className={`group flex items-start gap-3 px-5 py-4 transition-colors border-b border-[#edf0ed] last:border-0 ${
        notification.read ? 'bg-white' : 'bg-[#fbfdf8]'
      }`}
    >
      {/* Clickable area */}
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-start gap-3 text-left"
        aria-label={`Voir la notification : ${notification.title}`}
      >
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notifColors(notification.type)}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold leading-5 ${
                notification.read ? 'text-[#17211c]' : 'text-[#4e8226]'
              }`}
            >
              {notification.title}
            </span>
            {!notification.read && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#83b84d]" />
            )}
          </span>
          <span className="mt-1 block line-clamp-2 text-xs leading-[1.55] text-[#607066]">
            {notification.message}
          </span>
          <span className="mt-1.5 block text-[10px] text-[#9ba8a1]">
            {formatRelativeDate(notification.createdAt)}
          </span>
        </span>
      </button>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 pt-0.5">
        {!notification.read && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRead(); }}
            title="Marquer comme lu"
            aria-label="Marquer comme lu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9ba8a1] hover:bg-[#e4f5d0] hover:text-[#4e8226] transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          title="Supprimer"
          aria-label="Supprimer la notification"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9ba8a1] hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function AdminNotifications() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { notifications, unreadCount, loading, markAsRead, remove, removeAll } =
    useNotifications(user?.id);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dfe6df] bg-white text-[#718078] hover:text-[#17211c] transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e4f5d0] text-[#4e8226]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4e8226]">
                Centre d'alertes
              </p>
              <h1 className="text-xl font-bold text-[#17211c]">Notifications</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Tout supprimer
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer toutes les notifications ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action supprimera définitivement toutes les notifications.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={removeAll}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Tout supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-[#718078]">
          {loading
            ? 'Chargement…'
            : unreadCount > 0
            ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
            : 'Toutes les notifications sont lues'}
        </p>

        {/* List */}
        <div className="overflow-hidden rounded-2xl border border-[#dfe6df] bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-[#9ba8a1]">
              Chargement…
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0f4f0]">
                <Bell className="h-7 w-7 text-[#9ba8a1]" />
              </div>
              <h2 className="text-base font-semibold text-[#17211c]">Aucune notification</h2>
              <p className="mt-2 max-w-xs text-sm text-[#718078]">
                Les alertes de transactions, de sécurité et d'informations apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#edf0ed]">
              {notifications.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onRead={() => markAsRead(n.id)}
                  onRemove={() => remove(n.id)}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                    navigate(`/admin/notifications/${n.id}`);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
