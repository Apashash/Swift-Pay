import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, UserPlus, ArrowLeftRight, HeadphonesIcon, ChevronRight, Building2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import swiftPayLogo from "@assets/swift-logo.png";
import { useTranslation, type Lang } from '@/lib/i18n';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang, t } = useTranslation();

  const menuItems = [
    { labelKey: 'nav_menu_login' as const, descKey: 'nav_menu_login_desc' as const, icon: LogIn },
    { labelKey: 'nav_menu_register' as const, descKey: 'nav_menu_register_desc' as const, icon: UserPlus },
    { labelKey: 'nav_menu_transactions' as const, descKey: 'nav_menu_transactions_desc' as const, icon: ArrowLeftRight },
    { labelKey: 'nav_menu_business' as const, descKey: 'nav_menu_business_desc' as const, icon: Building2 },
    { labelKey: 'nav_menu_support' as const, descKey: 'nav_menu_support_desc' as const, icon: HeadphonesIcon },
  ];

  const languages: { code: Lang; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src={swiftPayLogo}
              alt="SwiftPay Logo"
              className="w-10 h-10 object-contain transition-all drop-shadow-[0_0_8px_rgba(0,230,118,0.4)] group-hover:drop-shadow-[0_0_14px_rgba(0,230,118,0.6)]"
            />
            <span className="text-xl font-bold tracking-tight text-white">
              Swift<span className="text-primary">Pay</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-white transition-colors">{t('nav_howItWorks')}</a>
            <a href="#networks" className="hover:text-white transition-colors">{t('nav_networks')}</a>
            <a href="#business" className="hover:text-white transition-colors">{t('nav_business')}</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground hover:text-white hover:bg-white/5">
              {t('nav_signIn')}
            </Button>
            <Button className="hidden sm:inline-flex bg-primary text-black hover:bg-primary/90 font-semibold shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-all hover:shadow-[0_0_30px_rgba(0,230,118,0.6)]">
              {t('nav_getStarted')}
            </Button>

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => { setLangOpen(!langOpen); setOpen(false); }}
                data-testid="button-lang-toggle"
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors"
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
                    className="absolute right-0 top-14 w-40 bg-[#111111] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                        data-testid={`button-lang-${l.code}`}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                          lang === l.code
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-white hover:bg-white/5'
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
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors"
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
              className="fixed top-0 right-0 h-full w-80 z-50 bg-[#0e0e0e] border-l border-white/10 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 h-20 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <img src={swiftPayLogo} alt="SwiftPay" className="w-8 h-8 object-contain" />
                  <span className="font-bold text-white">Swift<span className="text-primary">Pay</span></span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {menuItems.map((item, i) => (
                  <motion.a
                    key={item.labelKey}
                    href="#"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setOpen(false)}
                    data-testid={`link-menu-${item.labelKey}`}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/5 group transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{t(item.labelKey)}</div>
                      <div className="text-xs text-muted-foreground">{t(item.descKey)}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.a>
                ))}
              </nav>

              <div className="px-4 pb-6 space-y-3 border-t border-white/5 pt-4">
                <Button className="w-full bg-primary text-black hover:bg-primary/90 font-semibold shadow-[0_0_20px_rgba(0,230,118,0.3)]">
                  {t('nav_getStarted')}
                </Button>
                <p className="text-center text-xs text-muted-foreground">{t('nav_tagline')}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
