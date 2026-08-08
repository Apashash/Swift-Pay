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
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useAdminNotifications } from '@/lib/adminNotifications';
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

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadCount } = useAdminNotifications();

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
          <img src={swiftPayLogo} alt="marcswitch" className="h-9 w-9 object-contain" />
          <span className="text-lg font-semibold tracking-tight">marcswitch</span>
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

      <div className="min-h-[100dvh] bg-[#f5f7f5] lg:ml-[260px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#dfe6df] bg-[#f5f7f5]/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg border border-[#dfe6df] bg-white p-2 lg:hidden" aria-label="Ouvrir le menu">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#819087]">marcswitch / Administration</p>
              <h1 className="text-base font-semibold md:text-lg">{location === '/admin' ? 'Vue globale' : 'Centre opérationnel'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-[#dfe6df] bg-white px-3 py-2 text-[11px] text-[#718078] md:flex">
              <span className="h-2 w-2 rounded-full bg-[#8acb43]" />
              Systèmes opérationnels
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/notifications')}
              className="relative rounded-lg border border-[#dfe6df] bg-white p-2.5 text-[#718078] hover:text-[#17211c] transition-colors"
              aria-label={unreadCount > 0 ? `${unreadCount} notifications non lues` : 'Notifications'}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-4 h-4 items-center justify-center rounded-full border-2 border-[#f5f7f5] bg-[#e38b4d] px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
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