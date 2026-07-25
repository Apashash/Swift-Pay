import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  CheckCircle2, AlertCircle, Loader2, ArrowLeft,
  Copy, ExternalLink, Share2, Check,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MOCK_TRANSACTIONS, type TxStatus } from '@/lib/mock-data';

const STATUS_CONFIG: Record<TxStatus, { label: string; icon: React.ElementType; color: string; bg: string; border: string; desc: string }> = {
  completed: {
    label: 'Transaction complétée',
    icon: CheckCircle2,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    desc: 'Les fonds ont été livrés avec succès au destinataire.',
  },
  pending: {
    label: 'En attente de confirmation',
    icon: Loader2,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    desc: 'La transaction est en cours de traitement sur la blockchain.',
  },
  failed: {
    label: 'Transaction échouée',
    icon: AlertCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    desc: 'La transaction a échoué. Aucun fonds n\'a été débité.',
  },
};

const fmt = (n: number) => n.toLocaleString('fr-FR');

export default function TransactionDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [copiedHash, setCopiedHash] = useState(false);

  const tx = MOCK_TRANSACTIONS.find((t) => t.id === params.id);

  if (!tx) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
          <AlertCircle className="w-10 h-10 opacity-30" />
          <p>Transaction introuvable</p>
          <Button variant="outline" onClick={() => navigate('/transactions')}>
            Retour aux transactions
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const cfg = STATUS_CONFIG[tx.status];
  const date = new Date(tx.date);

  const handleCopyHash = () => {
    if (tx.txHash) {
      navigator.clipboard.writeText(tx.txHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const timeline = [
    { label: 'Transaction initiée', time: date, done: true },
    { label: 'Paiement crypto reçu', time: new Date(date.getTime() + 5000), done: tx.status !== 'failed' },
    { label: 'Conversion en FCFA', time: new Date(date.getTime() + 8000), done: tx.status !== 'failed' && tx.status !== 'pending' },
    { label: 'Virement Mobile Money', time: new Date(date.getTime() + 12000), done: tx.status === 'completed' },
    { label: 'Confirmation destinataire', time: new Date(date.getTime() + 15000), done: tx.status === 'completed' },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate('/transactions')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux transactions
        </button>

        {/* Status banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`rounded-2xl border p-6 text-center space-y-3 ${cfg.bg} ${cfg.border}`}
        >
          <div className={`w-14 h-14 rounded-full ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center mx-auto`}>
            <cfg.icon className={`w-7 h-7 ${cfg.color} ${tx.status === 'pending' ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</h2>
            <p className="text-sm text-muted-foreground mt-1">{cfg.desc}</p>
          </div>
          <div className={`inline-flex items-center gap-2 text-sm font-bold ${cfg.color}`}>
            {fmt(tx.amountFCFA)} FCFA
          </div>
        </motion.div>

        {/* Details card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Détails de la transaction</h3>
          </div>
          <div className="divide-y divide-border text-sm">
            {[
              { label: 'ID Transaction', value: tx.id, mono: true },
              { label: 'Date', value: date.toLocaleString('fr-FR') },
              { label: 'Destinataire', value: tx.recipient },
              { label: 'Numéro', value: tx.recipientPhone, mono: true },
              { label: 'Réseau', value: `${tx.networkFlag} ${tx.network}` },
              { label: 'Pays', value: tx.country },
              { label: 'Montant reçu', value: `${fmt(tx.amountFCFA)} FCFA`, bold: true, green: true },
              { label: 'Crypto envoyé', value: `${tx.amountCrypto.toFixed(tx.cryptoCurrency === 'BTC' ? 6 : 2)} ${tx.cryptoCurrency}`, mono: true },
              { label: 'Taux appliqué', value: `1 ${tx.cryptoCurrency} = ${tx.rate.toLocaleString()} FCFA` },
              { label: 'Frais (1%)', value: `${tx.fee.toFixed(2)} ${tx.cryptoCurrency}` },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-6 py-3.5">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={`${row.mono ? 'font-mono text-xs' : ''} ${row.bold ? 'font-bold' : 'font-medium'} ${row.green ? 'text-primary' : 'text-foreground'}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-5">Progression</h3>
          <div className="space-y-0">
            {timeline.map((step, i) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                    step.done
                      ? 'bg-primary border-primary'
                      : tx.status === 'failed' && i > 0
                      ? 'bg-destructive/10 border-destructive/30'
                      : 'bg-secondary border-border'
                  }`}>
                    {step.done ? (
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    ) : tx.status === 'failed' && i > 0 ? (
                      <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className={`w-0.5 h-8 mt-1 ${step.done && timeline[i + 1].done ? 'bg-primary/40' : 'bg-border'}`} />
                  )}
                </div>
                <div className="pb-6 pt-0.5">
                  <div className={`text-sm font-medium ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </div>
                  {step.done && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {step.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* TX hash */}
        {tx.txHash && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-5 space-y-3"
          >
            <h3 className="text-sm font-semibold text-foreground">Hash blockchain</h3>
            <div className="flex gap-2">
              <div className="flex-1 bg-secondary/60 rounded-xl px-4 py-2.5 font-mono text-xs text-foreground break-all">
                {tx.txHash}
              </div>
              <button
                onClick={handleCopyHash}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-secondary hover:bg-muted transition-colors flex-shrink-0"
              >
                {copiedHash ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              </button>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-secondary hover:bg-muted transition-colors flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-12 gap-2">
            <Share2 className="w-4 h-4" /> Partager le reçu
          </Button>
          {tx.status === 'failed' && (
            <Button className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
              onClick={() => navigate('/envoyer')}>
              Réessayer
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
