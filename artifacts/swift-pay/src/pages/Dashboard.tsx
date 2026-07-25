import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Send, ArrowLeftRight, TrendingUp, Clock,
  ChevronRight, CheckCircle2, AlertCircle, Loader2,
  ArrowUpRight, Plus, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { MOCK_TRANSACTIONS, type TxStatus } from '@/lib/mock-data';

const STATUS_CONFIG: Record<TxStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  completed: { label: 'Complété', icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10' },
  pending: { label: 'En cours', icon: Loader2, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  failed: { label: 'Échoué', icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

const fmt = (n: number) => n.toLocaleString('fr-FR');

export default function Dashboard() {
  const { user } = useAuth();

  const totalSent = MOCK_TRANSACTIONS
    .filter((t) => t.status === 'completed')
    .reduce((acc, t) => acc + t.amountFCFA, 0);
  const totalTx = MOCK_TRANSACTIONS.length;
  const pendingTx = MOCK_TRANSACTIONS.filter((t) => t.status === 'pending').length;
  const recent = MOCK_TRANSACTIONS.slice(0, 4);

  const stats = [
    { label: 'Total envoyé', value: `${fmt(totalSent)} FCFA`, sub: 'Ce mois', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Transactions', value: totalTx.toString(), sub: 'Au total', icon: ArrowLeftRight, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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
      <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto">
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
                <div className="text-lg font-bold text-foreground leading-tight">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                <div className="text-[11px] text-muted-foreground/70 mt-0.5">{stat.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent transactions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Transactions récentes</h2>
              <Link href="/transactions">
                <a className="text-xs text-primary hover:underline flex items-center gap-1">
                  Voir tout <ChevronRight className="w-3 h-3" />
                </a>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recent.map((tx) => {
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
              })}
            </div>
          </motion.div>

          {/* Quick actions */}
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
