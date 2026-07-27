import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ChevronLeft, ShieldAlert, ArrowRightLeft, Bell, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocation } from 'wouter';

const STORAGE_KEY = 'swiftpay_email_notif_prefs';

interface Prefs {
  transactions: boolean;
  security: boolean;
  marketing: boolean;
}

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { transactions: true, security: true, marketing: false, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { transactions: true, security: true, marketing: false };
}

function savePrefs(prefs: Prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        checked ? 'bg-primary' : 'bg-secondary'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function EmailNotifications() {
  const [, navigate] = useLocation();
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof Prefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePrefs(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const options: { key: keyof Prefs; icon: React.ElementType; label: string; desc: string }[] = [
    {
      key: 'transactions',
      icon: ArrowRightLeft,
      label: 'Transactions',
      desc: 'Confirmation d\'envoi, réception et échec de paiement.',
    },
    {
      key: 'security',
      icon: ShieldAlert,
      label: 'Alertes de sécurité',
      desc: 'Nouvelle connexion, changement de mot de passe, 2FA.',
    },
    {
      key: 'marketing',
      icon: Bell,
      label: 'Actualités & offres',
      desc: 'Nouveautés SwiftPay, promotions et mises à jour.',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-lg mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate('/profil')}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-card hover:bg-secondary/60 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Notifications par email</h1>
            <p className="text-xs text-muted-foreground">Choisissez ce que vous souhaitez recevoir</p>
          </div>
        </motion.div>

        {/* Saved badge */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-xl px-4 py-3 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4" /> Préférences enregistrées
          </motion.div>
        )}

        {/* Toggles */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Emails reçus à {/* shown from user context if available */}</h2>
          </div>
          <div className="divide-y divide-border">
            {options.map(({ key, icon: Icon, label, desc }) => (
              <div key={key} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                </div>
                <Toggle checked={prefs[key]} onChange={(v) => update(key, v)} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          className="bg-card border border-border rounded-2xl p-5 space-y-2"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">À savoir</h3>
          <ul className="space-y-1.5">
            {[
              'Les alertes de sécurité sont fortement recommandées.',
              'Vous pouvez modifier ces préférences à tout moment.',
              'Les emails sont envoyés depuis noreply@swiftpay.app.',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-primary mt-0.5">•</span> {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
