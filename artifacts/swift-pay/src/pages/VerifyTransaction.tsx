import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import {
  Search, ArrowLeft, CheckCircle2, Clock, XCircle,
  AlertCircle, ArrowRight,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

// ── Types & fake data ─────────────────────────────────────────────────────────
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
    Icon: CheckCircle2,
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/30',
    glow: '0 0 40px rgba(0,230,118,0.18)',
    dotColor: 'bg-primary',
    dotGlow: 'shadow-[0_0_8px_rgba(0,230,118,0.8)]',
    label: 'Transaction confirmée',
    desc: 'Le paiement Mobile Money a bien été envoyé au destinataire.',
  },
  pending: {
    Icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/30',
    glow: '0 0 40px rgba(250,204,21,0.12)',
    dotColor: 'bg-yellow-400',
    dotGlow: 'shadow-[0_0_8px_rgba(250,204,21,0.8)]',
    label: 'En cours de traitement',
    desc: 'La transaction est en attente de confirmation sur la blockchain.',
  },
  failed: {
    Icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10 border-destructive/30',
    glow: '0 0 40px rgba(239,68,68,0.12)',
    dotColor: 'bg-destructive',
    dotGlow: '',
    label: 'Transaction échouée',
    desc: "Le paiement n'a pas pu être traité. Aucun montant n'a été débité.",
  },
  not_found: {
    Icon: AlertCircle,
    color: 'text-muted-foreground',
    bg: 'bg-muted/50 border-border',
    glow: 'none',
    dotColor: 'bg-muted-foreground',
    dotGlow: '',
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient blobs – same as Hero */}
      <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[60%] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20 max-w-lg">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-secondary border border-border group-hover:border-primary/30 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
          </span>
          Retour
        </motion.button>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-normal leading-[1.2] mb-3">
            <span className="text-foreground">Vérifier ma </span>
            <span className="text-primary drop-shadow-[0_0_20px_rgba(0,230,118,0.3)]">transaction</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Entrez le numéro du bénéficiaire ou la référence de transaction pour connaître son état.
          </p>
        </motion.div>

        {/* Search card – styled exactly like PaymentForm */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8 mb-4"
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-6">
            <span className="font-semibold text-foreground text-lg">Rechercher</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Search className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Label */}
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
            Numéro du bénéficiaire ou référence
          </label>

          {/* Input */}
          <div className="mb-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              placeholder="07 00 00 00 00  ou  SP-OK-20250724-001"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            La référence commence par{' '}
            <span className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded text-[10px]">SP-</span>
            {' '}et se trouve dans votre SMS de confirmation.
          </p>

          {/* Full-width CTA below */}
          <Button
            onClick={handleCheck}
            disabled={!query.trim() || loading}
            className="w-full h-12 mt-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm shadow-[0_0_20px_rgba(0,230,118,0.2)] hover:shadow-[0_0_40px_rgba(0,230,118,0.4)] disabled:opacity-40 disabled:shadow-none transition-all"
          >
            {loading ? 'Recherche en cours…' : 'Vérifier le statut'}
            {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            Consultation sécurisée — aucune donnée stockée
          </div>
        </motion.div>

        {/* Result card */}
        <AnimatePresence mode="wait">
          {result && cfg && (
            <motion.div
              key={result.ref + result.status}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'bg-card border rounded-2xl shadow-2xl overflow-hidden',
                cfg.bg,
              )}
              style={{ boxShadow: cfg.glow }}
            >
              {/* Status header */}
              <div className="px-6 pt-6 pb-4 flex items-center gap-4">
                <div className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center border flex-shrink-0',
                  cfg.bg,
                )}>
                  <cfg.Icon className={cn('w-5 h-5', cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={cn('font-bold text-sm', cfg.color)}>{cfg.label}</p>
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.dotColor, cfg.dotGlow,
                      result.status === 'pending' && 'animate-pulse'
                    )} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{cfg.desc}</p>
                </div>
              </div>

              {/* Details table */}
              {result.status !== 'not_found' && (
                <div className="mx-6 mb-6 rounded-xl overflow-hidden border border-border divide-y divide-border">
                  <DetailRow label="Référence"    value={result.ref}      mono />
                  {result.phone    && <DetailRow label="Bénéficiaire" value={result.phone} />}
                  {result.operator && <DetailRow label="Réseau"       value={result.operator} />}
                  {result.amount   && <DetailRow label="Montant reçu" value={result.amount} highlight />}
                  {result.crypto   && <DetailRow label="Crypto envoyé" value={result.crypto} />}
                  {result.date     && <DetailRow label="Date"          value={result.date} />}
                </div>
              )}

              {result.status === 'not_found' && (
                <p className="text-sm text-muted-foreground text-center py-4 px-6 pb-6">
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

// ── Detail row ────────────────────────────────────────────────────────────────
function DetailRow({
  label, value, mono, highlight,
}: {
  label: string; value: string; mono?: boolean; highlight?: boolean;
}) {
  return (
    <div className={cn(
      'flex justify-between items-center px-4 py-3 bg-card',
      highlight && 'bg-primary/5',
    )}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn(
        'text-xs font-medium text-foreground',
        mono && 'font-mono',
        highlight && 'text-primary font-bold',
      )}>
        {value}
      </span>
    </div>
  );
}
