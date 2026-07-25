import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Send, ArrowLeftRight, TrendingUp, Clock,
  ChevronRight, CheckCircle2, AlertCircle, Loader2,
  ArrowUpRight, Users,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { MOCK_TRANSACTIONS, type TxStatus } from '@/lib/mock-data';

const STATUS_CONFIG: Record<TxStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  completed: { label: 'Complété', icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10' },
  pending: { label: 'En cours', icon: Loader2, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  failed: { label: 'Échoué', icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

type Period = 'jour' | 'semaine' | 'mois' | 'année';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'jour', label: 'Jour' },
  { key: 'semaine', label: 'Semaine' },
  { key: 'mois', label: 'Mois' },
  { key: 'année', label: 'Année' },
];

function getStartOf(period: Period): Date {
  const now = new Date();
  if (period === 'jour') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === 'semaine') {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === 'mois') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  // année
  return new Date(now.getFullYear(), 0, 1);
}

const fmt = (n: number) => n.toLocaleString('fr-FR');

const PERIOD_LABELS: Record<Period, string> = {
  jour: "Aujourd'hui",
  semaine: 'Cette semaine',
  mois: 'Ce mois',
  année: 'Cette année',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('mois');

  const filtered = useMemo(() => {
    const start = getStartOf(period);
    return MOCK_TRANSACTIONS.filter((t) => new Date(t.date) >= start);
  }, [period]);

  const totalSent = filtered
    .filter((t) => t.status === 'completed')
    .reduce((acc, t) => acc + t.amountFCFA, 0);
  const totalTx = filtered.length;
  const pendingTx = filtered.filter((t) => t.status === 'pending').length;
  const periodLabel = PERIOD_LABELS[period];

  const stats = [
    { label: 'Total envoyé', value: `${fmt(totalSent)} FCFA`, sub: periodLabel, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Transactions', value: totalTx.toString(), sub: periodLabel, icon: ArrowLeftRight, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'En attente', value: pendingTx.toString(), sub: 'À confirmer', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Taux actuel', value: '649 FCFA', sub: '1 USDT · Live', icon: ArrowUpRight, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const quickActions = [
    { label: 'Envoyer', icon: Send, href: '/envoyer', desc: 'Nouvelle transaction', primary: true },
    { label: 'Historique', icon: ArrowLeftRight, href: '/transactions', desc: 'Voir toutes les tx', primary: false },
    { label: 'Profil', icon: Users, href: '/profil', desc: 'Gérer le compte', primary: false },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-5 max-w-6xl mx-auto">

        {/* Period filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-2xl w-fit"
        >
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                period === key
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {period === key && (
                <motion.span
                  layoutId="period-pill"
                  className="absolute inset-0 bg-primary rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-card border border-border rounded-2xl p-4 space-y-3"
            >
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <motion.div
                  key={`${stat.label}-${period}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-lg font-bold text-foreground leading-tight"
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                <div className="text-[11px] text-muted-foreground/70 mt-0.5">{stat.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Filtered transactions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">
                Transactions · <span className="text-muted-foreground font-normal">{periodLabel}</span>
              </h2>
              <Link href="/transactions">
                <a className="text-xs text-primary hover:underline flex items-center gap-1">
                  Voir tout <ChevronRight className="w-3 h-3" />
                </a>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ArrowLeftRight className="w-8 h-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">Aucune transaction {periodLabel.toLowerCase()}</p>
                </div>
              ) : (
                filtered.slice(0, 5).map((tx) => {
                  const cfg = STATUS_CONFIG[tx.status];
                  return (
                    <Link key={tx.id} href={`/transactions/${tx.id}`}>
                      <a className="flex items-center gap-3 px-6 py-4 hover:bg-secondary/40 transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-base flex-shrink-0">
                          {tx.networkFlag}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">{tx.recipient}</div>
                          <div className="text-xs text-muted-foreground">{tx.network} · {tx.country}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-foreground">{fmt(tx.amountFCFA)} FCFA</div>
                          <div className={`text-xs flex items-center gap-1 justify-end ${cfg.color}`}>
                            <cfg.icon className={`w-3 h-3 ${tx.status === 'pending' ? 'animate-spin' : ''}`} />
                            {cfg.label}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </a>
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Quick actions + rate */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
            className="space-y-4"
          >
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Actions rapides</h2>
              </div>
              <div className="p-3 space-y-2">
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <a className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group ${
                      action.primary
                        ? 'bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20'
                        : 'hover:bg-secondary text-foreground'
                    }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        action.primary ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                      }`}>
                        <action.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold leading-tight">{action.label}</div>
                        <div className="text-xs text-muted-foreground">{action.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </a>
                  </Link>
                ))}
              </div>
            </div>

            {/* Rate card */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Taux du marché</h3>
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">LIVE</span>
              </div>
              <div className="space-y-2">
                {[
                  { pair: 'USDT → FCFA', rate: '649', change: '+0.3%' },
                  { pair: 'BTC → FCFA', rate: '45,000,000', change: '+1.2%' },
                ].map((r) => (
                  <div key={r.pair} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-xs font-medium text-muted-foreground">{r.pair}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground">{r.rate}</div>
                      <div className="text-[11px] text-primary">{r.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
