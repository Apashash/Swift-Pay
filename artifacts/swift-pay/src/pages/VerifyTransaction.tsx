import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

// ── Fake statuses for demo ────────────────────────────────────────────────────
type TxStatus = 'success' | 'pending' | 'failed' | 'not_found';

interface TxResult {
  status: TxStatus;
  ref: string;
  phone?: string;
  operator?: string;
  amount?: string;
  crypto?: string;
  date?: string;
}

function fakeCheck(query: string): TxResult {
  const q = query.trim().toLowerCase();
  if (!q) return { status: 'not_found', ref: query };
  // Demo: certain patterns return specific statuses
  if (q.startsWith('sp-ok') || q.endsWith('1'))
    return {
      status: 'success', ref: 'SP-OK-20250724-001',
      phone: '07 12 34 56 78', operator: 'Orange Money',
      amount: '50 000 FCFA', crypto: '78.17 USDT', date: '24 juil. 2025 – 22:14',
    };
  if (q.startsWith('sp-p') || q.endsWith('2'))
    return {
      status: 'pending', ref: 'SP-P-20250724-002',
      phone: '05 98 76 54 32', operator: 'MTN',
      amount: '30 000 FCFA', crypto: '46.89 USDT', date: '24 juil. 2025 – 23:01',
    };
  if (q.startsWith('sp-e') || q.endsWith('3'))
    return {
      status: 'failed', ref: 'SP-E-20250724-003',
      phone: '01 23 45 67 89', operator: 'Wave',
      amount: '20 000 FCFA', crypto: '31.26 USDT', date: '24 juil. 2025 – 21:50',
    };
  return { status: 'not_found', ref: query };
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  success: {
    icon: CheckCircle2,
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/30',
    glow: '0 0 30px rgba(0,230,118,0.2)',
    label: 'Transaction confirmée',
    desc: 'Le paiement Mobile Money a bien été envoyé au destinataire.',
  },
  pending: {
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/30',
    glow: '0 0 30px rgba(250,204,21,0.15)',
    label: 'En cours de traitement',
    desc: 'La transaction est en attente de confirmation sur la blockchain.',
  },
  failed: {
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10 border-destructive/30',
    glow: '0 0 30px rgba(239,68,68,0.15)',
    label: 'Transaction échouée',
    desc: 'Le paiement n\'a pas pu être traité. Aucun montant n\'a été débité.',
  },
  not_found: {
    icon: AlertCircle,
    color: 'text-muted-foreground',
    bg: 'bg-muted/50 border-border',
    glow: 'none',
    label: 'Introuvable',
    desc: 'Aucune transaction ne correspond à ce numéro ou cette référence.',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function VerifyTransaction() {
  const [, navigate] = useLocation();
  const [query, setQuery]     = useState('');
  const [result, setResult]   = useState<TxResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(fakeCheck(query));
      setLoading(false);
    }, 900);
  };

  const cfg = result ? STATUS_CONFIG[result.status] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-20 max-w-lg">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">Vérifier ma transaction</h1>
          <p className="text-sm text-muted-foreground">
            Entrez le numéro du bénéficiaire ou la référence de transaction pour connaître son état.
          </p>
        </motion.div>

        {/* Search card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-4"
        >
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-3">
            Numéro du bénéficiaire ou référence
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              placeholder="07 00 00 00 00  ou  SP-OK-20250724-001"
              className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <Button
              onClick={handleCheck}
              disabled={!query.trim() || loading}
              className="rounded-xl px-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                : <Search className="w-4 h-4" />
              }
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground mt-3">
            La référence commence par <span className="font-mono text-foreground">SP-</span> et se trouve dans votre SMS de confirmation.
          </p>
        </motion.div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result && cfg && (
            <motion.div
              key={result.ref + result.status}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className={cn('bg-card border rounded-2xl p-6 shadow-lg', cfg.bg)}
              style={{ boxShadow: cfg.glow }}
            >
              {/* Status header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center border', cfg.bg)}>
                  <cfg.icon className={cn('w-5 h-5', cfg.color)} />
                </div>
                <div>
                  <p className={cn('font-bold text-sm', cfg.color)}>{cfg.label}</p>
                  <p className="text-xs text-muted-foreground">{cfg.desc}</p>
                </div>
              </div>

              {/* Details */}
              {result.status !== 'not_found' && (
                <div className="space-y-0 divide-y divide-border rounded-xl overflow-hidden border border-border">
                  <DetailRow label="Référence"   value={result.ref} mono />
                  {result.phone    && <DetailRow label="Bénéficiaire" value={result.phone} />}
                  {result.operator && <DetailRow label="Réseau"       value={result.operator} />}
                  {result.amount   && <DetailRow label="Montant reçu" value={result.amount} highlight />}
                  {result.crypto   && <DetailRow label="Crypto envoyé" value={result.crypto} />}
                  {result.date     && <DetailRow label="Date"          value={result.date} />}
                </div>
              )}

              {result.status === 'not_found' && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Vérifiez le numéro ou la référence et réessayez.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center px-4 py-3 bg-card">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-xs font-medium text-foreground', mono && 'font-mono', highlight && 'text-primary font-bold')}>
        {value}
      </span>
    </div>
  );
}
