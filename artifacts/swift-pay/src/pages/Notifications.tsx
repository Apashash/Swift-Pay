import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCheck,
  CircleAlert,
  Info,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
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

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

const formatRelativeDate = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'À l’instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days} j`;
  return formatDate(date);
};

function NotificationIcon({ notification, large = false }: { notification: Notification; large?: boolean }) {
  const Icon = notification.type === 'transaction'
    ? CheckCheck
    : notification.type === 'security'
      ? ShieldCheck
      : Info;
  return (
    <div className={`${large ? 'w-14 h-14 rounded-2xl' : 'w-11 h-11 rounded-xl'} flex items-center justify-center flex-shrink-0 ${
      notification.type === 'transaction'
        ? 'bg-primary/10 text-primary'
        : notification.type === 'security'
          ? 'bg-orange-500/10 text-orange-500'
          : 'bg-blue-500/10 text-blue-500'
    }`}>
      <Icon className={large ? 'w-7 h-7' : 'w-5 h-5'} />
    </div>
  );
}

function NotificationRow({
  notification,
  onRead,
  onRemove,
}: {
  notification: Notification;
  onRead: () => void;
  onRemove: () => void;
}) {
  const [, navigate] = useLocation();
  return (
    <div
      className={`group flex items-start gap-3 sm:gap-4 p-4 sm:p-5 transition-colors ${
        notification.read ? 'bg-card' : 'bg-primary/[0.035]'
      }`}
    >
      <button
        onClick={() => {
          onRead();
          navigate(`/notifications/${notification.id}`);
        }}
        className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4 text-left"
        aria-label={`Voir la notification ${notification.title}`}
      >
        <NotificationIcon notification={notification} />
        <span className="min-w-0 flex-1">
          <span className="flex items-start gap-2">
            <span className={`text-sm font-semibold leading-5 ${notification.read ? 'text-foreground' : 'text-primary'}`}>
              {notification.title}
            </span>
            {!notification.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
          </span>
          <span className="mt-1 block text-sm leading-5 text-muted-foreground line-clamp-2">{notification.message}</span>
          <span className="mt-2 block text-xs text-muted-foreground">{formatRelativeDate(notification.createdAt)}</span>
        </span>
        <ArrowRight className="hidden sm:block mt-3 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
      </button>
      <div className="flex items-center gap-1">
        {!notification.read && (
          <button
            onClick={onRead}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Marquer comme lu"
            aria-label="Marquer comme lu"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onRemove}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          title="Supprimer"
          aria-label="Supprimer la notification"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function Notifications() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { notifications, unreadCount, markAsRead, remove, removeAll } = useNotifications(user?.id);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Centre d’alertes</p>
                <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Vous êtes à jour'}
            </p>
          </div>
          {notifications.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-fit border-destructive/25 text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Tout supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer toutes les notifications ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera définitivement toutes vos notifications de cet appareil.
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

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-muted-foreground" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Aucune notification</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Vous verrez ici les confirmations de transfert et les alertes importantes de votre compte.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => navigate('/dashboard')}>
                Retour au tableau de bord
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onRemove={() => remove(notification.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export function NotificationDetail() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const { notifications, markAsRead, remove } = useNotifications(user?.id);
  const notification = notifications.find((item) => item.id === params.id);

  useEffect(() => {
    if (notification && !notification.read) markAsRead(notification.id);
  }, [notification, markAsRead]);

  if (!notification) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
          <CircleAlert className="w-10 h-10 opacity-30" />
          <p>Notification introuvable</p>
          <Button variant="outline" onClick={() => navigate('/notifications')}>
            Voir les notifications
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/notifications')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux notifications
        </button>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-border bg-primary/[0.03]">
            <NotificationIcon notification={notification} large />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {formatDate(notification.createdAt)}
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-tight text-foreground">{notification.title}</h1>
          </div>
          <div className="p-6 sm:p-8 space-y-5">
            <p className="text-base font-medium leading-7 text-foreground">{notification.message}</p>
            <p className="text-sm leading-7 text-muted-foreground">{notification.details}</p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              {notification.actionHref && (
                <Link href={notification.actionHref}>
                  <Button className="w-full sm:w-auto">
                    {notification.actionLabel || 'Voir les détails'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                className="w-full sm:w-auto border-destructive/25 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  remove(notification.id);
                  navigate('/notifications');
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}