import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, UserPlus, ArrowLeftRight, HeadphonesIcon, ChevronRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import swiftPayLogo from "@assets/0e799f8d-f01e-4a08-aadb-5bf05adc5222_1784919743862.jpeg";

const menuItems = [
  { label: 'Login', icon: LogIn, description: 'Access your account' },
  { label: 'Registration', icon: UserPlus, description: 'Create a new account' },
  { label: 'Transactions', icon: ArrowLeftRight, description: 'View your history' },
  { label: 'For businesses', icon: Building2, description: 'API & enterprise access' },
  { label: 'Support', icon: HeadphonesIcon, description: 'Get help from our team' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src={swiftPayLogo}
              alt="SwiftPay Logo"
              className="w-10 h-10 rounded shadow-[0_0_15px_rgba(0,230,118,0.3)] transition-all group-hover:shadow-[0_0_25px_rgba(0,230,118,0.5)]"
            />
            <span className="text-xl font-bold tracking-tight text-white">
              Swift<span className="text-primary">Pay</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#networks" className="hover:text-white transition-colors">Supported networks</a>
            <a href="#business" className="hover:text-white transition-colors">For businesses</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground hover:text-white hover:bg-white/5">
              Sign In
            </Button>
            <Button className="hidden sm:inline-flex bg-primary text-black hover:bg-primary/90 font-semibold shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-all hover:shadow-[0_0_30px_rgba(0,230,118,0.6)]">
              Get started
            </Button>

            {/* Hamburger menu button */}
            <button
              onClick={() => setOpen(!open)}
              data-testid="button-menu-toggle"
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-in Menu Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-80 z-50 bg-[#0e0e0e] border-l border-white/10 flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 h-20 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <img src={swiftPayLogo} alt="SwiftPay" className="w-8 h-8 rounded" />
                  <span className="font-bold text-white">Swift<span className="text-primary">Pay</span></span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {menuItems.map((item, i) => (
                  <motion.a
                    key={item.label}
                    href="#"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setOpen(false)}
                    data-testid={`link-menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/5 group transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.a>
                ))}
              </nav>

              {/* Drawer Footer */}
              <div className="px-4 pb-6 space-y-3 border-t border-white/5 pt-4">
                <Button className="w-full bg-primary text-black hover:bg-primary/90 font-semibold shadow-[0_0_20px_rgba(0,230,118,0.3)]">
                  Get started
                </Button>
                <p className="text-center text-xs text-muted-foreground">Payments. Simplified.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
