import { useLocation, useParams } from 'wouter';
import {
  ArrowLeft,
  CheckCheck,
  CircleAlert,
  Info,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminNotifications } from '@/lib/adminNotifications';

const formatFullDate = (date: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

export default function AdminNotificationDetail() {
  const [, navigate] = useLocation();
  const { id } = useParams<{ id: string }>();
  const { notifications, remove } = useAdminNotifications();
  const notification = notifications.find((n) => n.id === id);

  if (!notification) {
    return (
      <AdminLayout>
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center py-32 text-center">
          <CircleAlert className="mb-4 h-10 w-10 text-[#9ba8a1] opacity-50" />
          <p className="text-sm font-medium text-[#17211c]">Notification introuvable</p>
          <button
            type="button"
            onClick={() => navigate('/admin/notifications')}
            className="mt-4 text-xs font-semibold text-[#4e8226] hover:underline"
          >
            ← Retour aux notifications
          </button>
        </div>
      </AdminLayout>
    );
  }

  const Icon =
    notification.type === 'transaction' ? CheckCheck
    : notification.type === 'security' ? ShieldCheck
    : Info;

  const iconColors =
    notification.type === 'transaction' ? 'bg-[#e4f5d0] text-[#4e8226]'
    : notification.type === 'security' ? 'bg-orange-100 text-orange-600'
    : 'bg-blue-100 text-blue-600';

  const typeLabel =
    notification.type === 'transaction' ? 'Transaction'
    : notification.type === 'security' ? 'Sécurité'
    : 'Information';

  const initials = notification.user.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate('/admin/notifications')}
          className="flex items-center gap-2 text-sm text-[#718078] hover:text-[#17211c] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux notifications
        </button>

        {/* Notification card */}
        <div className="overflow-hidden rounded-2xl border border-[#dfe6df] bg-white shadow-sm">
          <div className="border-b border-[#edf0ed] bg-[#f9fbf9] px-6 py-6 sm:px-8 sm:py-7">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconColors}`}>
              <Icon className="h-7 w-7" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#dfe6df] bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#718078]">
                {typeLabel}
              </span>
              <span className="text-[10px] text-[#9ba8a1]">{formatFullDate(notification.createdAt)}</span>
              {!notification.read && (
                <span className="rounded-full bg-[#e4f5d0] px-2.5 py-0.5 text-[10px] font-semibold text-[#4e8226]">
                  Non lue
                </span>
              )}
            </div>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-[#17211c]">{notification.title}</h1>
          </div>

          <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
            <p className="text-sm font-medium leading-7 text-[#17211c]">{notification.message}</p>
            {notification.details && (
              <p className="text-sm leading-7 text-[#718078]">{notification.details}</p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {notification.actionHref && (
                <a
                  href={notification.actionHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#b8f26d] px-4 py-2.5 text-sm font-semibold text-[#17211c] hover:bg-[#a8e25d] transition-colors"
                >
                  {notification.actionLabel || 'Voir les détails'}
                </a>
              )}
              <button
                type="button"
                onClick={() => { remove(notification.id); navigate('/admin/notifications'); }}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="overflow-hidden rounded-2xl border border-[#dfe6df] bg-white shadow-sm">
          <div className="border-b border-[#edf0ed] px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718078]">Utilisateur concerné</p>
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            {notification.user.avatar ? (
              <img src={notification.user.avatar} alt={notification.user.fullName} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dcebd2] text-sm font-bold text-[#41602b]">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#17211c]">{notification.user.fullName}</p>
              <p className="mt-0.5 text-xs text-[#718078]">{notification.user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/admin/utilisateurs`)}
              className="rounded-xl border border-[#dfe6df] px-3 py-2 text-xs font-semibold text-[#718078] hover:bg-[#f5f7f5] transition-colors"
            >
              Voir le profil
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
