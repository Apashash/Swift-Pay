import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, Copy, Check, Share2, Trash2, Plus,
  Banknote, FileText, Clock, X, ChevronRight,
  Sparkles, ExternalLink, ArrowLeft,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

/* ─── Types ─── */
interface PaymentLinkItem {
  id: string;
  amount: number;
  description: string;
  expiry: string;
  url: string;
  createdAt: string;
}

/* ─── Storage ─── */
const STORAGE_KEY = 'swiftpay_payment_links';

function loadLinks(userId: string): PaymentLinkItem[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLinks(userId: string, links: PaymentLinkItem[]) {
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(links));
}

function generateId() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

/* ─── Helpers ─── */
const fmtAmount = (n: number) => n.toLocaleString('fr-FR');
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

function isExpired(expiry: string) {
  if (!expiry) return false;
  return new Date(expiry) < new Date();
}

/* ─── LinkCard ─── */
function LinkCard({
  link,
  onDelete,
}: {
  link: PaymentLinkItem;
  onDelete: () => void;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const expired = isExpired(link.expiry);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link.url);
    setCopied(true);
    toast({ title: 'Lien copié !', description: link.description });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Paiement SwiftPay — ${link.description}`,
        text: `Payer ${fmtAmount(link.amount)} FCFA via SwiftPay`,
        url: link.url,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className={`bg-card border rounded-2xl overflow-hidden ${
        expired ? 'border-border opacity-60' : 'border-border'
      }`}
    >
      {/* Top row */}
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Link2 className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground truncate">{link.description}</span>
            {expired && (
              <span className="text-[10px] bg-destructive/10 text-destructive border border-destructive/20 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                Expiré
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-base font-bold text-primary">{fmtAmount(link.amount)} FCFA</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
            <span>Créé le {fmtDate(link.createdAt)}</span>
            {link.expiry && <span>· Expire le {fmtDate(link.expiry)}</span>}
          </div>
        </div>
      </div>

      {/* URL row */}
      <div className="mx-4 mb-3 flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 border border-border">
        <span className="flex-1 text-xs font-mono text-muted-foreground truncate">{link.url}</span>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 pb-4">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copié' : 'Copier'}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Partager
        </button>
        <div className="ml-auto">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce lien ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Le lien «&nbsp;{link.description}&nbsp;» sera définitivement supprimé. Les personnes qui l'ont reçu ne pourront plus l'utiliser.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Creation form (inline drawer) ─── */
function CreateForm({
  onCreated,
  onClose,
}: {
  onCreated: (link: PaymentLinkItem) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState('');

  const amountNum = parseInt(amount.replace(/\s/g, ''), 10);
  const isValid = amountNum >= 500 && description.trim().length >= 3;

  const formatAmount = (val: string) => {
    const digits = val.replace(/\D/g, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const handleCreate = () => {
    const id = generateId();
    const url = `${window.location.origin}/pay/${id}`;
    onCreated({
      id,
      amount: amountNum,
      description: description.trim(),
      expiry,
      url,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.22 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      {/* Form header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-sm font-bold text-foreground">Nouveau lien de paiement</h2>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Amount */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Banknote className="w-3.5 h-3.5 text-primary" /> Montant
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(formatAmount(e.target.value))}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 pr-16 text-xl font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">FCFA</span>
          </div>
          {amountNum > 0 && amountNum < 500 && (
            <p className="text-xs text-destructive">Minimum 500 FCFA.</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <FileText className="w-3.5 h-3.5 text-primary" /> Description
          </label>
          <input
            type="text"
            placeholder="Ex : Facture #001, Commande…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={80}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
        </div>

        {/* Expiry */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> Expiration</span>
            <span className="normal-case font-normal">Optionnel</span>
          </label>
          <input
            type="date"
            value={expiry}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
        </div>

        <Button
          className="w-full h-11 bg-primary text-primary-foreground font-semibold shadow-[0_0_20px_rgba(0,230,118,0.3)] disabled:opacity-40 disabled:shadow-none"
          disabled={!isValid}
          onClick={handleCreate}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Générer le lien
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── Main page ─── */
export default function PaymentLink() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [links, setLinks] = useState<PaymentLinkItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    if (user?.id) setLinks(loadLinks(user.id));
  }, [user?.id]);

  const handleCreated = (link: PaymentLinkItem) => {
    const updated = [link, ...links];
    setLinks(updated);
    if (user?.id) saveLinks(user.id, updated);
    setShowForm(false);
    toast({ title: 'Lien créé !', description: `${fmtAmount(link.amount)} FCFA · ${link.description}` });
  };

  const handleDelete = (id: string) => {
    const updated = links.filter((l) => l.id !== id);
    setLinks(updated);
    if (user?.id) saveLinks(user.id, updated);
    toast({ title: 'Lien supprimé' });
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-xl mx-auto space-y-5">

        {/* Page header */}
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
              <h1 className="text-2xl font-bold text-foreground">Liens de paiement</h1>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create button */}
        {!showForm && (
          <Button
            className="w-full h-12 bg-primary text-primary-foreground font-semibold shadow-[0_0_20px_rgba(0,230,118,0.3)] hover:shadow-[0_0_30px_rgba(0,230,118,0.5)] transition-all"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer un lien de paiement
          </Button>
        )}

        {/* Inline creation form */}
        <AnimatePresence>
          {showForm && (
            <CreateForm
              onCreated={handleCreated}
              onClose={() => setShowForm(false)}
            />
          )}
        </AnimatePresence>

        {/* Links list */}
        {links.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              Mes liens ({links.length})
            </p>
            <AnimatePresence>
              {links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onDelete={() => handleDelete(link.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          !showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Link2 className="w-7 h-7 text-muted-foreground" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Aucun lien créé</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Créez votre premier lien de paiement et envoyez-le à vos clients pour recevoir des paiements en FCFA.
              </p>
            </motion.div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
