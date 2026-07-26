import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, CheckCircle2, AlertCircle, Loader2,
  ChevronRight, ArrowUpDown, ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiFetch, type ApiTransaction, type TxStatus } from '@/lib/api';

const STATUS_CONFIG: Record<TxStatus, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  completed: { label: 'Complété', icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  pending: { label: 'En cours', icon: Loader2, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  failed: { label: 'Échoué', icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
};

const FILTERS: { value: TxStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'completed', label: 'Complétées' },
  { value: 'pending', label: 'En cours' },
  { value: 'failed', label: 'Échouées' },
];

const fmt = (n: number) => n.toLocaleString('fr-FR');

function StatusDropdown({ value, onChange }: { value: TxStatus | 'all'; onChange: (v: TxStatus | 'all') => void }) {
  const [open, setOpen] = useState(false);
  const current = FILTERS.find((f) => f.value === value)!;

  return (
    <div className="relative w-fit">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-10 px-4 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors"
      >
        <span>{current.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1.5 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden min-w-[150px]"
          >
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { onChange(f.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  value === f.value
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                {f.label}
                {value === f.value && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Transactions() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TxStatus | 'all'>('all');
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ transactions: ApiTransaction[] }>('/transactions')
      .then((data) => setTransactions(data.transactions))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter((tx) => {
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      tx.recipient.toLowerCase().includes(q) ||
      tx.network.toLowerCase().includes(q) ||
      tx.countryName.toLowerCase().includes(q) ||
      tx.id.toLowerCase().includes(q) ||
      tx.recipientPhone.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalCompleted = transactions.filter((t) => t.status === 'completed').reduce((a, t) => a + t.amountFcfa, 0);
  const completedCount = transactions.filter((t) => t.status === 'completed').length;
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;
  const failedCount = transactions.filter((t) => t.status === 'failed').length;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Transactions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? '…' : `${transactions.length} transactions · ${fmt(totalCompleted)} FCFA envoyés`}
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Complétées', count: completedCount, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'En cours', count: pendingCount, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Échouées', count: failedCount, color: 'text-destructive', bg: 'bg-destructive/10' },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{loading ? '…' : s.count}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par destinataire, réseau, pays…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <StatusDropdown value={statusFilter} onChange={setStatusFilter} />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-border text-xs font-medium text-muted-foreground">
            <button className="flex items-center gap-1 hover:text-foreground transition-colors text-left">
              Destinataire <ArrowUpDown className="w-3 h-3" />
            </button>
            <span>Réseau</span>
            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
              Montant <ArrowUpDown className="w-3 h-3" />
            </button>
            <span>Statut</span>
            <span>Détails</span>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Chargement…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune transaction trouvée</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((tx, i) => {
                const cfg = STATUS_CONFIG[tx.status];
                const date = new Date(tx.createdAt);
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link href={`/transactions/${tx.id}`}>
                      <a className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-4 hover:bg-secondary/40 transition-colors group items-center">
                        <div>
                          <div className="text-sm font-semibold text-foreground">{tx.recipient}</div>
                          <div className="text-xs text-muted-foreground">{tx.recipientPhone}</div>
                          <div className="text-[11px] text-muted-foreground/70">{date.toLocaleDateString('fr-FR')}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{tx.networkFlag}</span>
                          <div>
                            <div className="text-sm text-foreground">{tx.network}</div>
                            <div className="text-xs text-muted-foreground">{tx.countryName}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">{fmt(tx.amountFcfa)} FCFA</div>
                          <div className="text-xs text-muted-foreground">
                            {tx.cryptoCurrency === 'BTC'
                              ? tx.amountCrypto.toFixed(6)
                              : tx.amountCrypto.toFixed(2)} {tx.cryptoCurrency}
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            <cfg.icon className={`w-3 h-3 ${tx.status === 'pending' ? 'animate-spin' : ''}`} />
                            {cfg.label}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </Link>

                    {/* Mobile */}
                    <Link href={`/transactions/${tx.id}`}>
                      <a className="sm:hidden flex items-center gap-3 px-5 py-4 hover:bg-secondary/40 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg flex-shrink-0">
                          {tx.networkFlag}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">{tx.recipient}</div>
                          <div className="text-xs text-muted-foreground">{tx.network} · {date.toLocaleDateString('fr-FR')}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-foreground">{fmt(tx.amountFcfa)} FCFA</div>
                          <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                        </div>
                      </a>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
