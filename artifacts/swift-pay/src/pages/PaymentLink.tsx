import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, Copy, Check, Share2, X, ChevronRight,
  Banknote, FileText, Clock, QrCode, ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

function generateId() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

type Step = 'form' | 'created';

interface LinkData {
  id: string;
  amount: string;
  description: string;
  expiry: string;
  url: string;
  createdAt: string;
}

export default function PaymentLink() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('form');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkData, setLinkData] = useState<LinkData | null>(null);

  const amountNum = parseInt(amount.replace(/\s/g, ''), 10);
  const isValid = amountNum >= 500 && description.trim().length >= 3;

  const formatAmount = (val: string) => {
    const digits = val.replace(/\D/g, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const handleCreate = () => {
    const id = generateId();
    const url = `${window.location.origin}/pay/${id}`;
    setLinkData({
      id,
      amount,
      description,
      expiry,
      url,
      createdAt: new Date().toISOString(),
    });
    setStep('created');
  };

  const handleCopy = async () => {
    if (!linkData) return;
    await navigator.clipboard.writeText(linkData.url);
    setCopied(true);
    toast({ title: 'Lien copié !', description: 'Le lien de paiement a été copié.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!linkData) return;
    if (navigator.share) {
      await navigator.share({
        title: `Paiement SwiftPay — ${linkData.description}`,
        text: `Payer ${parseInt(linkData.amount.replace(/\s/g, ''), 10).toLocaleString('fr-FR')} FCFA via SwiftPay`,
        url: linkData.url,
      });
    } else {
      handleCopy();
    }
  };

  const handleReset = () => {
    setStep('form');
    setAmount('');
    setDescription('');
    setExpiry('');
    setLinkData(null);
    setCopied(false);
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors lg:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">SwiftPay</p>
              <h1 className="text-2xl font-bold text-foreground">Lien de paiement</h1>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              {/* Amount */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
                  <Banknote className="w-4 h-4 text-primary" />
                  Montant à recevoir
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(formatAmount(e.target.value))}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3.5 pr-20 text-2xl font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">FCFA</span>
                </div>

                {amountNum > 0 && amountNum < 500 && (
                  <p className="text-xs text-destructive">Le montant minimum est 500 FCFA.</p>
                )}
              </div>

              {/* Description */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="w-4 h-4 text-primary" />
                  Description
                </div>
                <input
                  type="text"
                  placeholder="Ex : Paiement facture #001, Commande produits…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={80}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                <p className="text-xs text-muted-foreground text-right">{description.length}/80</p>
              </div>

              {/* Expiry (optional) */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    Date d'expiration
                  </div>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Optionnel</span>
                </div>
                <input
                  type="date"
                  value={expiry}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              {/* Recap */}
              {isValid && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2"
                >
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Récapitulatif</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Montant</span>
                    <span className="font-bold text-foreground">{amountNum.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Description</span>
                    <span className="font-medium text-foreground truncate max-w-[180px]">{description}</span>
                  </div>
                  {expiry && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Expire le</span>
                      <span className="font-medium text-foreground">
                        {new Date(expiry).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              <Button
                className="w-full h-12 bg-primary text-primary-foreground font-semibold shadow-[0_0_20px_rgba(0,230,118,0.35)] hover:shadow-[0_0_30px_rgba(0,230,118,0.5)] transition-all disabled:opacity-40 disabled:shadow-none"
                disabled={!isValid}
                onClick={handleCreate}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Générer le lien de paiement
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="created"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              {/* Success banner */}
              <div className="bg-primary/10 border border-primary/25 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Lien créé avec succès !</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Partagez ce lien à votre client pour qu'il puisse effectuer son paiement.
                  </p>
                </div>
              </div>

              {/* Link details */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-secondary/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Détails du lien</p>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-sm text-muted-foreground">Montant</span>
                    <span className="text-sm font-bold text-foreground">
                      {parseInt(linkData!.amount.replace(/\s/g, ''), 10).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-sm text-muted-foreground">Description</span>
                    <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{linkData!.description}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-sm text-muted-foreground">Référence</span>
                    <span className="text-sm font-mono font-medium text-primary">{linkData!.id}</span>
                  </div>
                  {linkData!.expiry && (
                    <div className="flex items-center justify-between px-5 py-3.5">
                      <span className="text-sm text-muted-foreground">Expire le</span>
                      <span className="text-sm font-medium text-foreground">
                        {new Date(linkData!.expiry).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Link URL */}
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" /> Lien de paiement
                </p>
                <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5 border border-border">
                  <span className="flex-1 text-xs font-mono text-foreground truncate select-all">{linkData!.url}</span>
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 font-semibold border-border"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-4 h-4 mr-2 text-primary" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copié !' : 'Copier le lien'}
                </Button>
                <Button
                  className="h-12 bg-primary text-primary-foreground font-semibold shadow-[0_0_20px_rgba(0,230,118,0.35)]"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
              </div>

              <button
                onClick={handleReset}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center justify-center gap-1.5"
              >
                <Link2 className="w-3.5 h-3.5" />
                Créer un autre lien
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
