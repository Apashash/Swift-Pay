import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, UserPlus, ArrowLeftRight, HeadphonesIcon, ChevronRight, Building2, Globe, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import swiftPayLogo from "@assets/swift-logo.png";
import { useTranslation, type Lang } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang, t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const menuItems = [
    { labelKey: 'nav_menu_login' as const, descKey: 'nav_menu_login_desc' as const, icon: LogIn, href: '/connexion' },
    { labelKey: 'nav_menu_register' as const, descKey: 'nav_menu_register_desc' as const, icon: UserPlus, href: '/inscription' },
    { labelKey: 'nav_menu_transactions' as const, descKey: 'nav_menu_transactions_desc' as const, icon: ArrowLeftRight, href: '/transactions' },
    { labelKey: 'nav_menu_business' as const, descKey: 'nav_menu_business_desc' as const, icon: Building2, href: '#business' },
    { labelKey: 'nav_menu_support' as const, descKey: 'nav_menu_support_desc' as const, icon: HeadphonesIcon, href: '#' },
  ];

  const languages: { code: Lang; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const initials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 group">
            <img
              src={swiftPayLogo}
              alt="SwiftPay Logo"
              className="w-10 h-10 object-contain transition-all drop-shadow-[0_0_8px_rgba(0,230,118,0.4)] group-hover:drop-shadow-[0_0_14px_rgba(0,230,118,0.6)]"
            />
            <span className="text-xl font-bold tracking-tight text-foreground">
              Swift<span className="text-primary">Pay</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">{t('nav_howItWorks')}</a>
            <a href="#networks" className="hover:text-foreground transition-colors">{t('nav_networks')}</a>
            <a href="#business" className="hover:text-foreground transition-colors">{t('nav_business')}</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  className="hidden sm:inline-flex text-muted-foreground hover:text-foreground hover:bg-secondary gap-2"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:flex w-9 h-9 rounded-full bg-primary items-center justify-center text-primary-foreground text-sm font-bold"
                >
                  {initials}
                </button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="hidden sm:inline-flex text-muted-foreground hover:text-foreground hover:bg-secondary"
                  onClick={() => navigate('/connexion')}
                >
                  {t('nav_signIn')}
                </Button>
                <Button
                  className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-all hover:shadow-[0_0_30px_rgba(0,230,118,0.6)]"
                  onClick={() => navigate('/inscription')}
                >
                  {t('nav_getStarted')}
                </Button>
              </>
            )}

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => { setLangOpen(!langOpen); setOpen(false); }}
                data-testid="button-lang-toggle"
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-secondary hover:bg-muted text-foreground transition-colors"
                title={lang === 'fr' ? 'Changer de langue' : 'Change language'}
              >
                <Globe className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    key="lang-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-14 w-40 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                        data-testid={`button-lang-${l.code}`}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                          lang === l.code
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-foreground hover:bg-secondary'
                        }`}
                      >
                        <span className="text-base">{l.flag}</span>
                        <span>{l.label}</span>
                        {lang === l.code && <span className="ml-auto text-primary text-xs">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hamburger menu button */}
            <button
              onClick={() => { setOpen(!open); setLangOpen(false); }}
              data-testid="button-menu-toggle"
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-secondary hover:bg-muted text-foreground transition-colors"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Close lang dropdown on outside click */}
      {langOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
      )}

      {/* Slide-in Menu Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              key="drawer"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-80 z-50 bg-card border-l border-border flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 h-20 border-b border-border/50">
                <div className="flex items-center gap-1">
                  <img src={swiftPayLogo} alt="SwiftPay" className="w-8 h-8 object-contain" />
                  <span className="font-bold text-foreground">Swift<span className="text-primary">Pay</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTheme}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isAuthenticated && user && (
                <div className="mx-4 mt-4 p-3 bg-secondary/60 rounded-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{user.fullName}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  </div>
                </div>
              )}

              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {isAuthenticated ? (
                  <>
                    {[
                      { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, desc: 'Vue d\'ensemble de votre compte' },
                      { label: t('nav_menu_transactions'), href: '/transactions', icon: ArrowLeftRight, desc: t('nav_menu_transactions_desc') },
                      { label: t('nav_menu_business'), href: '#business', icon: Building2, desc: t('nav_menu_business_desc') },
                      { label: t('nav_menu_support'), href: '#', icon: HeadphonesIcon, desc: t('nav_menu_support_desc') },
                    ].map((item, i) => (
                      <motion.a
                        key={item.label}
                        href={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={(e) => {
                          setOpen(false);
                          if (!item.href.startsWith('#')) {
                            e.preventDefault();
                            navigate(item.href);
                          }
                        }}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-secondary group transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.desc}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </motion.a>
                    ))}
                  </>
                ) : (
                  menuItems.map((item, i) => (
                    <motion.a
                      key={item.labelKey}
                      href={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={(e) => {
                        setOpen(false);
                        if (!item.href.startsWith('#')) {
                          e.preventDefault();
                          navigate(item.href);
                        }
                      }}
                      data-testid={`link-menu-${item.labelKey}`}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-secondary group transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">{t(item.labelKey)}</div>
                        <div className="text-xs text-muted-foreground">{t(item.descKey)}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </motion.a>
                  ))
                )}
              </nav>

              <div className="px-4 pb-6 space-y-3 border-t border-border/50 pt-4">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    onClick={() => { logout(); setOpen(false); navigate('/'); }}
                    className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    Se déconnecter
                  </Button>
                ) : (
                  <>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_20px_rgba(0,230,118,0.3)]"
                      onClick={() => { setOpen(false); navigate('/inscription'); }}
                    >
                      {t('nav_getStarted')}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">{t('nav_tagline')}</p>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
