import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowLeft,
  ArrowLeftRight,
  BadgeCheck,
  Bell,
  Calculator,
  LayoutDashboard,
  Menu,
  Settings2,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { type Notification, useNotifications } from '@/lib/notifications';
import swiftPayLogo from '@assets/swift-logo.png';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navigation: { label: string; items: AdminNavItem[] }[] = [
  {
    label: 'Vue globale',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Exploitation',
    items: [
      { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
      { href: '/admin/kyc', label: 'Vérifications KYC', icon: BadgeCheck },
      { href: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
      { href: '/admin/paiements-en-attente', label: 'Paiements en attente', icon: WalletCards },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { href: '/admin/conversions', label: 'Conversions', icon: Calculator },
    ],
  },
];

function isActive(path: string, href: string) {
  return href === '/admin' ? path === href : path === href || path.startsWith(`${href}/`);
}

function formatNotificationDate(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'À l’instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `Il y a ${days} j` : new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(date));
}

function notificationTone(notification: Notification) {
  if (notification.type === 'security') return 'bg-orange-100 text-orange-600';
  if (notification.type === 'transaction') return 'bg-[#edf8e3] text-[#5c8b35]';
  return 'bg-blue-100 text-blue-600';
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { notifications, unreadCount, loading, markAsRead } = useNotifications(user?.id);

  const initials = user?.fullName
    ?.split(' ')
    .map((name) => name[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'SP';

  const sidebar = (
    <div className="flex h-full flex-col bg-[#11191a] text-white">
      <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <img src={swiftPayLogo} alt="SwiftPay" className="h-9 w-9 object-contain" />
          <span className="text-lg font-semibold tracking-tight">Swift<span className="text-[#b8f26d]">Pay</span></span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="ml-auto rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.07] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#b8f26d] text-xs font-bold text-[#17211c]">
            {user?.avatar ? <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" /> : initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{user?.fullName || 'Administrateur'}</p>
            <p className="truncate text-[10px] text-white/45">{user?.email || 'Espace sécurisé'}</p>
          </div>
          <span className="ml-auto h-2 w-2 rounded-full bg-[#b8f26d]" title="En ligne" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(location, item.href);
                return (
                  <div key={item.href}>
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`group flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium transition-colors ${
                          active ? 'bg-[#b8f26d] text-[#17211c]' : 'text-white/62 hover:bg-white/[0.07] hover:text-white'
                        }`}
                      >
                        <item.icon className="h-[17px] w-[17px] shrink-0" strokeWidth={active ? 2.3 : 1.8} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => { setMobileOpen(false); navigate('/admin/conversions'); }}
          className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium transition-colors ${
            isActive(location, '/admin/conversions') ? 'bg-[#b8f26d] text-[#17211c]' : 'text-white/60 hover:bg-white/[0.07] hover:text-white'
          }`}
        >
          <Settings2 className="h-4 w-4 shrink-0" />
          Paramètres
        </button>
        <button
          type="button"
          onClick={() => { setMobileOpen(false); navigate('/dashboard'); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium text-white/60 hover:bg-white/[0.07] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Retour côté utilisateur
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-shell min-h-[100dvh] bg-[#f5f7f5] text-[#17211c]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] lg:block">
        {sidebar}
      </aside>
      {mobileOpen && (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-[#11191a]/60 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Fermer le menu" />
          <aside className="fixed inset-y-0 left-0 z-50 w-[280px] lg:hidden">{sidebar}</aside>
        </>
      )}

      <div className="min-h-[100dvh] lg:ml-[260px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#dfe6df] bg-[#f5f7f5]/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg border border-[#dfe6df] bg-white p-2 lg:hidden" aria-label="Ouvrir le menu">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#819087]">SwiftPay / Administration</p>
              <h1 className="text-base font-semibold md:text-lg">{location === '/admin' ? 'Vue globale' : 'Centre opérationnel'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-[#dfe6df] bg-white px-3 py-2 text-[11px] text-[#718078] md:flex">
              <span className="h-2 w-2 rounded-full bg-[#8acb43]" />
              Systèmes opérationnels
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative rounded-lg border border-[#dfe6df] bg-white p-2.5 text-[#718078] hover:text-[#17211c]"
                aria-label={unreadCount > 0 ? `${unreadCount} notifications non lues` : 'Notifications'}
                aria-expanded={notificationsOpen}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-w-4 h-4 items-center justify-center rounded-full border-2 border-[#f5f7f5] bg-[#e38b4d] px-1 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#dfe6df] bg-white shadow-[0_16px_40px_rgba(23,33,28,0.16)]">
                  <div className="flex items-center justify-between border-b border-[#edf0ed] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-[#17211c]">Notifications</p>
                      <p className="mt-0.5 text-[10px] text-[#819087]">
                        {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
                      </p>
                    </div>
                    <button type="button" onClick={() => { setNotificationsOpen(false); navigate('/notifications'); }} className="text-[10px] font-semibold text-[#6e9b3d] hover:text-[#4e812c]">
                      Voir tout
                    </button>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {loading ? (
                      <div className="px-4 py-8 text-center text-xs text-[#819087]">Chargement…</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-[#819087]">Aucune notification</div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <button
                          type="button"
                          key={notification.id}
                          onClick={() => {
                            void markAsRead(notification.id);
                            setNotificationsOpen(false);
                            navigate(notification.actionHref || `/notifications/${notification.id}`);
                          }}
                          className={`flex w-full items-start gap-3 border-b border-[#edf0ed] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[#f7faf6] ${notification.read ? 'bg-white' : 'bg-[#fbfdf8]'}`}
                        >
                          <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${notificationTone(notification)}`}>
                            <Bell className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className={`truncate text-xs font-semibold ${notification.read ? 'text-[#17211c]' : 'text-[#4e812c]'}`}>{notification.title}</span>
                              {!notification.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#83b84d]" />}
                            </span>
                            <span className="mt-1 block line-clamp-2 text-[11px] leading-4 text-[#819087]">{notification.message}</span>
                            <span className="mt-1.5 block text-[10px] text-[#a1aca4]">{formatNotificationDate(notification.createdAt)}</span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                  {notifications.length > 5 && (
                    <button type="button" onClick={() => { setNotificationsOpen(false); navigate('/notifications'); }} className="w-full border-t border-[#edf0ed] px-4 py-3 text-center text-[10px] font-semibold text-[#6e9b3d] hover:bg-[#f7faf6]">
                      Voir les {notifications.length} notifications
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="hidden h-8 w-px bg-[#dfe6df] sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#dcebd2] text-xs font-bold text-[#41602b]">{user?.avatar ? <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" /> : initials}</div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold">{user?.fullName || 'Administrateur'}</p>
                <p className="text-[10px] text-[#819087]">Super admin</p>
              </div>
              <Settings2 className="hidden h-4 w-4 text-[#9aa79e] sm:block" />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}