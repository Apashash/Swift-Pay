import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Send, ArrowLeftRight, User, LogOut,
  Menu, X, ChevronRight, Sun, Moon, Bell, Globe, Link2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useTranslation, type Lang } from '@/lib/i18n';
import swiftPayLogo from '@assets/swift-logo.png';
import { useNotifications } from '@/lib/notifications';

// Bottom nav items (mobile pill)
const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/envoyer', icon: Send, label: 'Dépense les crypto' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/profil', icon: User, label: 'Profil' },
];

// Sidebar-only items (not in bottom nav)
const SIDEBAR_NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', desc: 'Vue d\'ensemble' },
  { href: '/envoyer', icon: Send, label: 'Dépense les crypto', desc: 'Nouvelle transaction' },
  { href: '/lien-paiement', icon: Link2, label: 'Lien de paiement', desc: 'Créer & partager un lien' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions', desc: 'Historique' },
  { href: '/profil', icon: User, label: 'Profil', desc: 'Gérer le compte' },
];

function BottomNav({ hidden }: { hidden?: boolean }) {
  const [location] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (hidden) return null;

  return createPortal(
    <nav
      className="fixed z-50 lg:hidden"
      style={{
        bottom: 'calc(24px + env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        filter: isDark ? 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' : 'drop-shadow(0 8px 24px rgba(0,0,0,0.15))',
        touchAction: 'none',
        overscrollBehavior: 'none',
      }}
      aria-label="Navigation principale"
    >
      <div
        className="flex items-center px-5 rounded-full"
        style={{
          height: 64,
          gap: 8,
          backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
        }}
      >
        {NAV.map((item) => {
          const active = location === item.href || location.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <a
                className="relative flex items-center justify-center"
                style={{ width: 52, height: 64, touchAction: 'manipulation' }}
                aria-label={item.label}
              >
                {active ? (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute flex items-center justify-center rounded-2xl"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: '#4B8BF5',
                      top: '50%',
                      transform: 'translateY(-58%)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  >
                    <item.icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </motion.div>
                ) : (
                  <item.icon
                    className="w-5 h-5 transition-colors"
                    strokeWidth={1.75}
                    style={{ color: isDark ? '#7a7a7a' : '#9a9a9a' }}
                  />
                )}
              </a>
            </Link>
          );
        })}
      </div>
    </nav>,
    document.body,
  );
}

interface Props {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: Props) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, navigate] = useLocation();
  const { unreadCount } = useNotifications(user?.id);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'SP';

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border/50 flex-shrink-0">
        <Link href="/" className="flex items-center gap-1.5">
          <img src={swiftPayLogo} alt="SwiftPay" className="w-8 h-8 object-contain drop-shadow-[0_0_6px_rgba(0,230,118,0.4)]" />
          <span className="font-bold text-foreground">Swift<span className="text-primary">Pay</span></span>
        </Link>
      </div>

      {/* User card */}
      <div className="mx-4 mt-4 p-3 bg-secondary/60 rounded-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
          {user?.avatar
            ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            : initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground truncate">{user?.fullName}</div>
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
        </div>
        {user?.verified ? (
          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">KYC</span>
        ) : (
          <span className="text-[10px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">Basic</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {SIDEBAR_NAV.map((item) => {
          const active = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <item.icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto text-primary" />}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 pb-6 space-y-1 border-t border-border/50 pt-3">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        </button>
        <button
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <Globe className="w-4 h-4" />
          {lang === 'fr' ? 'English' : 'Français'}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 flex-col border-r border-border bg-card flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar — masqué sur la page notifications */}
        <header className={`h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 flex-shrink-0 ${location.startsWith('/notifications') ? 'hidden' : ''}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-secondary hover:bg-muted text-foreground transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden lg:block">
              <div className="text-sm font-semibold text-foreground">
                {NAV.find((n) => n.href === location)?.label || 'Dashboard'}
              </div>
              <div className="text-xs text-muted-foreground">
                Bonjour, {user?.fullName?.split(' ')[0]} 👋
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <button
               onClick={() => navigate('/notifications')}
               className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-secondary hover:bg-muted transition-colors"
               aria-label={unreadCount > 0 ? `${unreadCount} notifications non lues` : 'Notifications'}
             >
              <Bell className="w-4 h-4 text-muted-foreground" />
               {unreadCount > 0 && (
                 <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center border-2 border-card">
                   {unreadCount > 9 ? '9+' : unreadCount}
                 </span>
               )}
            </button>
            <button
              onClick={() => navigate('/profil')}
              className="w-9 h-9 rounded-full overflow-hidden bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
            >
              {user?.avatar
                ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                : initials}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-28 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Floating bottom nav — mobile only, hidden when sidebar is open */}
      <BottomNav hidden={sidebarOpen || location.startsWith('/notifications') || location.startsWith('/lien-paiement')} />
    </div>
  );
}
