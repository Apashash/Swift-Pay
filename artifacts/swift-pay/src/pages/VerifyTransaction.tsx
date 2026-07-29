import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import {
  Search, ArrowLeft, CheckCircle2, Clock, XCircle,
  AlertCircle, ArrowRight, Loader2,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────
type TxStatus = 'completed' | 'pending' | 'failed';

interface TxResult {
  id: string;
  ref: string;
  status: TxStatus;
  phone: string;
  network: string;
  networkFlag: string;
  countryName: string;
  amountFcfa: number;
  amountCrypto: number;
  cryptoCurrency: string;
  createdAt: string;
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<TxStatus | 'not_found', {
  Icon: React.ElementType;
  color: string;
  bg: string;
  glow: string;
  dotColor: string;
  dotGlow: string;
  label: string;
  desc: string;
}> = {
  completed: {
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatAmount(n: number, crypto: string) {
  if (crypto === 'BTC') return n.toFixed(6);
  return n.toFixed(2);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function VerifyTransaction() {
  const [, navigate] = useLocation();
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<TxResult[] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleCheck = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setResults(null);
    setNotFound(false);
    setError('');
    try {
      const data = await apiFetch<{ transactions: TxResult[] }>(
        `/transactions/search?q=${encodeURIComponent(q)}`
      );
      if (data.transactions.length === 0) {
        setNotFound(true);
      } else {
        setResults(data.transactions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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

        {/* Search card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8 mb-4"
        >
          <div className="flex items-center justify-between mb-6">
            <span className="font-semibold text-foreground text-lg">Rechercher</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Search className="w-4 h-4 text-primary" />
            </div>
          </div>

          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
            Numéro du bénéficiaire ou référence
          </label>

          <div className="mb-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              placeholder="07 00 00 00 00  ou  swift-0283729-xxxxxxxx"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            La référence commence par{' '}
            <span className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded text-[10px]">swift-0283729-</span>
            {' '}et se trouve dans votre SMS de confirmation.
          </p>

          {error && (
            <p className="mt-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <Button
            onClick={handleCheck}
            disabled={!query.trim() || loading}
            className="w-full h-12 mt-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm shadow-[0_0_20px_rgba(0,230,118,0.2)] hover:shadow-[0_0_40px_rgba(0,230,118,0.4)] disabled:opacity-40 disabled:shadow-none transition-all"
          >
            {loading
              ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Recherche en cours…</>
              : <> Vérifier le statut <ArrowRight className="ml-2 w-4 h-4" /></>
            }
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            Consultation sécurisée — aucune donnée stockée
          </div>
        </motion.div>

        {/* Not found */}
        <AnimatePresence>
          {notFound && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-border rounded-2xl shadow-2xl p-6 text-center"
            >
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-foreground mb-1">Introuvable</p>
              <p className="text-sm text-muted-foreground">Aucune transaction ne correspond à ce numéro ou cette référence. Vérifiez et réessayez.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && results.map((tx, i) => {
            const cfg = STATUS_CONFIG[tx.status];
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={cn(
                  'bg-card border rounded-2xl shadow-2xl overflow-hidden mb-3',
                  cfg.bg,
                )}
                style={{ boxShadow: cfg.glow }}
              >
                {/* Status header */}
                <div className="px-5 pt-5 pb-4 flex items-center gap-4">
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center border flex-shrink-0', cfg.bg)}>
                    <cfg.Icon className={cn('w-5 h-5', cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={cn('font-bold text-sm', cfg.color)}>{cfg.label}</p>
                      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.dotColor, cfg.dotGlow,
                        tx.status === 'pending' && 'animate-pulse'
                      )} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{cfg.desc}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="mx-5 mb-5 rounded-xl overflow-hidden border border-border divide-y divide-border">
                  <DetailRow label="Référence"     value={tx.ref} mono />
                  <DetailRow label="Bénéficiaire"  value={`${tx.phone} · ${tx.network}`} />
                  <DetailRow label="Pays"          value={`${tx.networkFlag} ${tx.countryName}`} />
                  <DetailRow label="Montant reçu"  value={`${tx.amountFcfa.toLocaleString('fr-FR')} FCFA`} highlight />
                  <DetailRow label="Crypto envoyé" value={`${formatAmount(tx.amountCrypto, tx.cryptoCurrency)} ${tx.cryptoCurrency}`} />
                  <DetailRow label="Date"          value={formatDate(tx.createdAt)} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

      </div>
    </div>
  );
}

// ── Detail row ────────────────────────────────────────────────────────────────
function DetailRow({ label, value, mono, highlight }: {
  label: string; value: string; mono?: boolean; highlight?: boolean;
}) {
  return (
    <div className={cn('flex justify-between items-center px-4 py-3 bg-card', highlight && 'bg-primary/5')}>
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={cn('text-xs font-medium text-foreground text-right truncate ml-4', mono && 'font-mono', highlight && 'text-primary font-bold')}>
        {value}
      </span>
    </div>
  );
}
