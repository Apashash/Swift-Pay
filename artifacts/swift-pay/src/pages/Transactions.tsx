import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Search, Filter, CheckCircle2, AlertCircle, Loader2,
  ChevronRight, ArrowUpDown, Download,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MOCK_TRANSACTIONS, type TxStatus } from '@/lib/mock-data';

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

export default function Transactions() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TxStatus | 'all'>('all');

  const filtered = MOCK_TRANSACTIONS.filter((tx) => {
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      tx.recipient.toLowerCase().includes(q) ||
      tx.network.toLowerCase().includes(q) ||
      tx.country.toLowerCase().includes(q) ||
      tx.id.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalCompleted = MOCK_TRANSACTIONS.filter((t) => t.status === 'completed').reduce((a, t) => a + t.amountFCFA, 0);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Transactions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {MOCK_TRANSACTIONS.length} transactions · {fmt(totalCompleted)} FCFA envoyés
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start sm:self-auto">
            <Download className="w-4 h-4" /> Exporter CSV
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Complétées', count: MOCK_TRANSACTIONS.filter(t => t.status === 'completed').length, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'En cours', count: MOCK_TRANSACTIONS.filter(t => t.status === 'pending').length, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Échouées', count: MOCK_TRANSACTIONS.filter(t => t.status === 'failed').length, color: 'text-destructive', bg: 'bg-destructive/10' },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
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
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
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

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune transaction trouvée</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((tx, i) => {
                const cfg = STATUS_CONFIG[tx.status];
                const date = new Date(tx.date);
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
                            <div className="text-xs text-muted-foreground">{tx.country}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">{fmt(tx.amountFCFA)} FCFA</div>
                          <div className="text-xs text-muted-foreground">{tx.amountCrypto.toFixed(tx.cryptoCurrency === 'BTC' ? 6 : 2)} {tx.cryptoCurrency}</div>
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

                    {/* Mobile card */}
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
                          <div className="text-sm font-bold text-foreground">{fmt(tx.amountFCFA)} FCFA</div>
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
