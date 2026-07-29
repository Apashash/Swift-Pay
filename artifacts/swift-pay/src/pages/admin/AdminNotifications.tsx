import { useLocation } from 'wouter';
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  Info,
  ShieldCheck,
  Trash2,
  User,
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
import { type AdminNotification, useAdminNotifications } from '@/lib/adminNotifications';

const formatRelativeDate = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days} j`;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
};

function notifIcon(type: AdminNotification['type']) {
  if (type === 'transaction') return CheckCheck;
  if (type === 'security') return ShieldCheck;
  return Info;
}

function notifColors(type: AdminNotification['type']) {
  if (type === 'transaction') return 'bg-[#e4f5d0] text-[#4e8226]';
  if (type === 'security') return 'bg-orange-100 text-orange-600';
  return 'bg-blue-100 text-blue-600';
}

function UserAvatar({ user }: { user: AdminNotification['user'] }) {
  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return user.avatar ? (
    <img src={user.avatar} alt={user.fullName} className="h-7 w-7 rounded-full object-cover" />
  ) : (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dcebd2] text-[9px] font-bold text-[#41602b]">
      {initials}
    </span>
  );
}

function NotificationRow({
  notification,
  onRemove,
  onClick,
}: {
  notification: AdminNotification;
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
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-start gap-3 text-left"
      >
        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notifColors(notification.type)}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className={`text-sm font-semibold leading-5 ${notification.read ? 'text-[#17211c]' : 'text-[#4e8226]'}`}>
              {notification.title}
            </span>
            {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#83b84d]" />}
          </span>
          <span className="mt-0.5 block line-clamp-1 text-xs text-[#607066]">{notification.message}</span>
          {/* User info */}
          <span className="mt-1.5 flex items-center gap-1.5">
            <UserAvatar user={notification.user} />
            <span className="text-[10px] text-[#718078] font-medium truncate max-w-[160px]">
              {notification.user.fullName}
            </span>
            <span className="text-[10px] text-[#9ba8a1]">·</span>
            <span className="text-[10px] text-[#9ba8a1]">{formatRelativeDate(notification.createdAt)}</span>
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        title="Supprimer"
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9ba8a1] hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function AdminNotifications() {
  const [, navigate] = useLocation();
  const { notifications, unreadCount, loading, remove, removeAll } = useAdminNotifications();

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
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e4f5d0] text-[#4e8226]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4e8226]">
                Toutes les notifications
              </p>
              <h1 className="text-xl font-bold text-[#17211c]">Notifications utilisateurs</h1>
            </div>
          </div>

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
                    Cette action supprimera définitivement toutes les notifications de tous les utilisateurs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={removeAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Tout supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#dfe6df] bg-white px-3 py-2 text-xs text-[#718078]">
            <Bell className="h-3.5 w-3.5" />
            <span>{notifications.length} notification{notifications.length !== 1 ? 's' : ''} au total</span>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-[#c6e8a0] bg-[#f3fbea] px-3 py-2 text-xs font-medium text-[#4e8226]">
              <span className="h-2 w-2 rounded-full bg-[#83b84d]" />
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </div>
          )}
          {!loading && unreadCount === 0 && notifications.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-[#dfe6df] bg-white px-3 py-2 text-xs text-[#718078]">
              <Check className="h-3.5 w-3.5 text-[#83b84d]" />
              Toutes lues
            </div>
          )}
        </div>

        {/* List */}
        <div className="overflow-hidden rounded-2xl border border-[#dfe6df] bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-[#9ba8a1]">Chargement…</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0f4f0]">
                <Bell className="h-7 w-7 text-[#9ba8a1]" />
              </div>
              <h2 className="text-base font-semibold text-[#17211c]">Aucune notification</h2>
              <p className="mt-2 max-w-xs text-sm text-[#718078]">
                Les notifications de transactions et de sécurité de vos utilisateurs apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#edf0ed]">
              {notifications.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onRemove={() => remove(n.id)}
                  onClick={() => navigate(`/admin/notifications/${n.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
