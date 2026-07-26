import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, Copy, Check, Share2, Trash2, Plus,
  Banknote, FileText, Clock, X, ChevronRight,
  Sparkles, ExternalLink, ArrowLeft, Tag,
  LockKeyhole, Infinity, Phone, MapPin, Search,
  ChevronDown, Pencil,
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
import { cn } from '@/lib/utils';
import imgOrange from '@/assets/operators/orange.png';
import imgMtn    from '@/assets/operators/mtn.png';
import imgWave   from '@/assets/operators/wave.webp';
import imgMoov   from '@/assets/operators/moov.png';
import imgTmoney from '@/assets/operators/tmoney.png';

/* ─── Country / operator data (same as PaymentForm) ─── */
type Operator = { id: string; name: string; logo: string; bg: string };

const OPERATORS: Record<string, Operator> = {
  Orange:   { id: 'Orange',   name: 'Orange Money', logo: imgOrange, bg: '#1c1c1e' },
  MTN:      { id: 'MTN',      name: 'MTN MoMo',     logo: imgMtn,    bg: '#ffcc00' },
  Wave:     { id: 'Wave',     name: 'Wave',          logo: imgWave,   bg: '#00b2ff' },
  Moov:     { id: 'Moov',     name: 'Moov Money',    logo: imgMoov,   bg: '#f06000' },
  TMoney:   { id: 'TMoney',   name: 'T-Money',       logo: imgTmoney, bg: '#ffd700' },
  Free:     { id: 'Free',     name: 'Free Money',    logo: '',        bg: '#e20025' },
  Expresso: { id: 'Expresso', name: 'Expresso',      logo: '',        bg: '#005baa' },
  Cellcom:  { id: 'Cellcom',  name: 'Cellcom',       logo: '',        bg: '#004a97' },
  Flooz:    { id: 'Flooz',    name: 'Flooz',         logo: '',        bg: '#009a44' },
};

const COUNTRIES = [
  { code: 'CI', flag: '🇨🇮', name: "Côte d'Ivoire", dialCode: '+225', operators: ['Orange', 'MTN', 'Wave', 'Moov'] },
  { code: 'CM', flag: '🇨🇲', name: 'Cameroun',       dialCode: '+237', operators: ['Orange', 'MTN'] },
  { code: 'SN', flag: '🇸🇳', name: 'Sénégal',        dialCode: '+221', operators: ['Orange', 'Free', 'Wave', 'Expresso'] },
  { code: 'ML', flag: '🇲🇱', name: 'Mali',            dialCode: '+223', operators: ['Orange', 'Moov'] },
  { code: 'BF', flag: '🇧🇫', name: 'Burkina Faso',    dialCode: '+226', operators: ['Orange', 'Moov'] },
  { code: 'GN', flag: '🇬🇳', name: 'Guinée',          dialCode: '+224', operators: ['Orange', 'MTN', 'Cellcom'] },
  { code: 'BJ', flag: '🇧🇯', name: 'Bénin',           dialCode: '+229', operators: ['MTN', 'Moov'] },
  { code: 'TG', flag: '🇹🇬', name: 'Togo',            dialCode: '+228', operators: ['TMoney', 'Flooz'] },
];

/* ─── Types ─── */
type AmountType = 'fixed' | 'flexible';

interface PaymentLinkItem {
  id: string;
  title: string;
  amountType: AmountType;
  amount: number | null;
  description: string;
  expiry: string;
  countryCode: string;
  countryFlag: string;
  countryName: string;
  operator: string;
  phone: string;
  url: string;
  createdAt: string;
}

/* ─── Storage ─── */
const STORAGE_KEY = 'swiftpay_payment_links_v3';

function loadLinks(userId: string): PaymentLinkItem[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveLinks(userId: string, links: PaymentLinkItem[]) {
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(links));
}
function generateId() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

/* ─── Helpers ─── */
const fmtAmount = (n: number) => n.toLocaleString('fr-FR');
const fmtInput  = (val: string) => val.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fmtDate   = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const isExpired = (expiry: string) => !!expiry && new Date(expiry) < new Date();

/* ─── OperatorLogo ─── */
function OperatorLogo({ opId, size = 'sm' }: { opId: string; size?: 'sm' | 'xs' }) {
  const op = OPERATORS[opId];
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-6 h-6';
  if (!op) return null;
  if (op.logo) {
    return (
      <div className={`${dim} rounded-lg overflow-hidden flex-shrink-0`} style={{ background: op.bg }}>
        <img src={op.logo} alt={op.name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${dim} rounded-lg flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0`} style={{ background: op.bg }}>
      {op.name.slice(0, 3).toUpperCase()}
    </div>
  );
}

/* ─── LinkCard ─── */
function LinkCard({ link, onDelete, onEdit }: { link: PaymentLinkItem; onDelete: () => void; onEdit: () => void }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const expired = isExpired(link.expiry);
  const op = OPERATORS[link.operator];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link.url);
    setCopied(true);
    toast({ title: 'Lien copié !', description: link.title });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Paiement SwiftPay — ${link.title}`,
        text: link.amount ? `Payer ${fmtAmount(link.amount)} FCFA via SwiftPay` : `Paiement SwiftPay — ${link.title}`,
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
      className={`bg-card border rounded-2xl overflow-hidden ${expired ? 'border-border opacity-60' : 'border-border'}`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Link2 className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          {/* Title + badges + delete button */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-bold text-foreground truncate">{link.title}</span>
            {expired && (
              <span className="text-[10px] bg-destructive/10 text-destructive border border-destructive/20 px-1.5 py-0.5 rounded-full font-medium">Expiré</span>
            )}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border flex items-center gap-0.5 ${
              link.amountType === 'fixed'
                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
            }`}>
              {link.amountType === 'fixed'
                ? <><LockKeyhole className="w-2.5 h-2.5" /> Fixe</>
                : <><Infinity className="w-2.5 h-2.5" /> Flexible</>}
            </span>
            {/* Delete button — top right */}
            <div className="ml-auto">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer ce lien ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Le lien «&nbsp;{link.title}&nbsp;» sera définitivement supprimé.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Amount */}
          <div className="mt-0.5">
            {link.amount !== null
              ? <span className="text-base font-bold text-primary">{fmtAmount(link.amount)} FCFA</span>
              : <span className="text-sm font-medium text-muted-foreground italic">Montant libre</span>}
          </div>

          {/* Country + operator + phone */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base leading-none">{link.countryFlag}</span>
            <OperatorLogo opId={link.operator} size="xs" />
            <span className="text-xs text-muted-foreground">{op?.name ?? link.operator}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-medium text-foreground">{link.phone}</span>
          </div>

          {link.description && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{link.description}</p>
          )}
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            <span>Créé le {fmtDate(link.createdAt)}</span>
            {link.expiry && <span>· Expire le {fmtDate(link.expiry)}</span>}
          </div>
        </div>
      </div>

      {/* URL */}
      <div className="mx-4 mb-3 flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 border border-border">
        <span className="flex-1 text-xs font-mono text-muted-foreground truncate">{link.url}</span>
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 pb-4">
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copié' : 'Copier'}
        </button>
        <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Share2 className="w-3.5 h-3.5" /> Partager
        </button>
        <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
          <Pencil className="w-3.5 h-3.5" /> Éditer
        </button>
      </div>
    </motion.div>
  );
}

/* ─── CreateForm ─── */
function CreateForm({ onSaved, onClose, onDelete, initialLink }: {
  onSaved: (l: PaymentLinkItem, isEdit: boolean) => void;
  onClose: () => void;
  onDelete?: () => void;
  initialLink?: PaymentLinkItem;
}) {
  const isEdit = !!initialLink;

  // Strip dial code prefix from stored phone for editing
  const barePhone = (link: PaymentLinkItem) => {
    const c = COUNTRIES.find(x => x.code === link.countryCode);
    const prefix = c ? `${c.dialCode} ` : '';
    return link.phone.startsWith(prefix) ? link.phone.slice(prefix.length) : link.phone;
  };

  const [title, setTitle]           = useState(initialLink?.title ?? '');
  const [amountType, setAmountType] = useState<AmountType>(initialLink?.amountType ?? 'fixed');
  const [amount, setAmount]         = useState(initialLink?.amount != null ? fmtInput(String(initialLink.amount)) : '');
  const [description, setDescription] = useState(initialLink?.description ?? '');
  const [expiry, setExpiry]         = useState(initialLink?.expiry ?? '');
  const [countryCode, setCountryCode] = useState(initialLink?.countryCode ?? 'CI');
  const [operator, setOperator]     = useState(initialLink?.operator ?? 'Orange');
  const [phone, setPhone]           = useState(initialLink ? barePhone(initialLink) : '');
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [countrySearch, setCountrySearch]     = useState('');
  const menuRef   = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const country = COUNTRIES.find(c => c.code === countryCode) ?? COUNTRIES[0];

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    return q ? COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) : COUNTRIES;
  }, [countrySearch]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowCountryMenu(false);
        setCountrySearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCountryChange = (code: string) => {
    const c = COUNTRIES.find(x => x.code === code)!;
    setCountryCode(code);
    setOperator(c.operators[0]);
    setShowCountryMenu(false);
    setCountrySearch('');
    setPhone('');
  };

  const amountNum = parseInt(amount.replace(/\s/g, ''), 10);
  const amountOk  = amountType === 'flexible' || amountNum >= 500;
  const isValid   = title.trim().length >= 2 && amountOk && operator && phone.trim().length >= 8;


  const handleCreate = () => {
    const id  = isEdit ? initialLink!.id : generateId();
    const url = isEdit ? initialLink!.url : `${window.location.origin}/pay/${id}`;
    onSaved({
      id, title: title.trim(),
      amountType, amount: amountType === 'fixed' ? amountNum : null,
      description: description.trim(), expiry,
      countryCode, countryFlag: country.flag, countryName: country.name,
      operator, phone: `${country.dialCode} ${phone.trim()}`,
      url, createdAt: isEdit ? initialLink!.createdAt : new Date().toISOString(),
    }, isEdit);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.22 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-sm font-bold text-foreground">{isEdit ? 'Modifier le lien' : 'Nouveau lien de paiement'}</h2>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">

        {/* ① Titre */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Tag className="w-3.5 h-3.5 text-primary" /> Titre du lien
          </label>
          <input
            type="text" placeholder="Ex : Facture #001, Commande…"
            value={title} onChange={e => setTitle(e.target.value)} maxLength={60}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
        </div>

        {/* ② Type de montant */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Banknote className="w-3.5 h-3.5 text-primary" /> Type de montant
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['fixed', 'flexible'] as AmountType[]).map(t => (
              <button key={t} onClick={() => { setAmountType(t); if (t === 'flexible') setAmount(''); }}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  amountType === t
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {t === 'fixed' ? <><LockKeyhole className="w-3.5 h-3.5" /> Fixe</> : <><Infinity className="w-3.5 h-3.5" /> Flexible</>}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {amountType === 'fixed' ? 'Le client paie exactement le montant défini.' : 'Le client choisit lui-même le montant.'}
          </p>
        </div>

        {/* ③ Montant (si fixe) */}
        <AnimatePresence>
          {amountType === 'fixed' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Montant (FCFA)</label>
              <div className="relative">
                <input
                  type="text" inputMode="numeric" placeholder="0"
                  value={amount} onChange={e => setAmount(fmtInput(e.target.value))}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 pr-16 text-xl font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">FCFA</span>
              </div>
              {amountNum > 0 && amountNum < 500 && <p className="text-xs text-destructive">Minimum 500 FCFA.</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ④ Pays */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <MapPin className="w-3.5 h-3.5 text-primary" /> Pays du bénéficiaire
          </label>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => { setShowCountryMenu(v => !v); setCountrySearch(''); setTimeout(() => searchRef.current?.focus(), 80); }}
              className={cn(
                'w-full bg-secondary border rounded-xl px-4 py-3 flex items-center gap-3 transition-all',
                showCountryMenu ? 'border-primary/60 ring-2 ring-primary/20' : 'border-border hover:border-primary/30'
              )}
            >
              <span className="text-xl leading-none">{country.flag}</span>
              <span className="text-sm font-medium text-foreground flex-1 text-left">{country.name}</span>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{country.code}</span>
              <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', showCountryMenu && 'rotate-180 text-primary')} />
            </button>

            <AnimatePresence>
              {showCountryMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.15 }}
                  className="absolute z-50 w-full mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="p-3 border-b border-border">
                    <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
                      <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <input
                        ref={searchRef} type="text" value={countrySearch}
                        onChange={e => setCountrySearch(e.target.value)}
                        placeholder="Rechercher un pays…"
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                      />
                      {countrySearch && <button onClick={() => setCountrySearch('')} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
                    </div>
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {filteredCountries.length === 0
                      ? <div className="px-4 py-6 text-center text-sm text-muted-foreground">Aucun pays trouvé</div>
                      : filteredCountries.map(c => (
                        <button key={c.code} onClick={() => handleCountryChange(c.code)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-border/40 last:border-0',
                            c.code === countryCode ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'
                          )}
                        >
                          <span className="text-lg leading-none">{c.flag}</span>
                          <span className="flex-1 text-left font-medium">{c.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded">{c.dialCode}</span>
                          {c.code === countryCode && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                        </button>
                      ))
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ⑤ Opérateur */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Banknote className="w-3.5 h-3.5 text-primary" /> Opérateur Mobile Money
          </label>
          <div className="grid grid-cols-2 gap-2">
            {country.operators.map(opId => {
              const op = OPERATORS[opId] ?? { id: opId, name: opId, logo: '', bg: '#333' };
              const selected = operator === opId;
              return (
                <button
                  key={opId} onClick={() => setOperator(opId)}
                  className={cn(
                    'relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all',
                    selected ? 'border-primary shadow-[0_0_12px_rgba(0,230,118,0.2)]' : 'border-border hover:border-primary/30'
                  )}
                  style={{ background: selected ? `${op.bg}22` : 'var(--color-secondary)' }}
                >
                  {op.logo
                    ? <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ background: op.bg }}><img src={op.logo} alt={op.name} className="w-full h-full object-cover" /></div>
                    : <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0" style={{ background: op.bg }}>{op.name.slice(0, 3).toUpperCase()}</div>
                  }
                  <span className={cn('text-xs font-semibold leading-tight text-left', selected ? 'text-primary' : 'text-foreground')}>{op.name}</span>
                  {selected && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-[0_0_4px_rgba(0,230,118,0.8)]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ⑥ Numéro du bénéficiaire */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Phone className="w-3.5 h-3.5 text-primary" /> Numéro du bénéficiaire
          </label>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-3 py-3 flex-shrink-0">
              <span className="text-base leading-none">{country.flag}</span>
              <span className="text-sm font-medium text-muted-foreground">{country.dialCode}</span>
            </div>
            <input
              type="tel" inputMode="numeric"
              placeholder="07 00 00 00 00"
              value={phone} onChange={e => setPhone(e.target.value)}
              className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
          {phone.trim().length > 0 && phone.trim().length < 8 && (
            <p className="text-xs text-destructive">Numéro trop court.</p>
          )}
        </div>

        {/* ⑦ Description */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-primary" /> Description</span>
            <span className="normal-case font-normal">Optionnel</span>
          </label>
          <textarea
            placeholder="Détails pour votre client…"
            value={description} onChange={e => setDescription(e.target.value)}
            maxLength={200} rows={2}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
          />
        </div>

        {/* ⑧ Expiration */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> Date d'expiration</span>
            <span className="normal-case font-normal">Optionnel</span>
          </label>
          <input
            type="date" value={expiry} min={new Date().toISOString().split('T')[0]}
            onChange={e => setExpiry(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
        </div>

        <Button
          className="w-full h-11 bg-primary text-primary-foreground font-semibold shadow-[0_0_20px_rgba(0,230,118,0.3)] disabled:opacity-40 disabled:shadow-none"
          disabled={!isValid} onClick={handleCreate}
        >
          {isEdit ? <Pencil className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {isEdit ? 'Enregistrer les modifications' : 'Générer le lien'}
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Button>

        {isEdit && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border hover:border-destructive/30 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Supprimer ce lien
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce lien ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Le lien «&nbsp;{initialLink!.title}&nbsp;» sera définitivement supprimé.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main page ─── */
export default function PaymentLink() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [links, setLinks]         = useState<PaymentLinkItem[]>([]);
  const [showForm, setShowForm]   = useState(false);
  const [editingLink, setEditingLink] = useState<PaymentLinkItem | undefined>();

  useEffect(() => {
    if (user?.id) setLinks(loadLinks(user.id));
  }, [user?.id]);

  const handleSaved = (link: PaymentLinkItem, isEdit: boolean) => {
    const updated = isEdit
      ? links.map(l => l.id === link.id ? link : l)
      : [link, ...links];
    setLinks(updated);
    if (user?.id) saveLinks(user.id, updated);
    setShowForm(false);
    setEditingLink(undefined);
    toast({ title: isEdit ? 'Lien modifié !' : 'Lien créé !', description: link.title });
  };

  const handleDelete = (id: string) => {
    const updated = links.filter(l => l.id !== id);
    setLinks(updated);
    if (user?.id) saveLinks(user.id, updated);
    toast({ title: 'Lien supprimé' });
  };

  const handleEdit = (link: PaymentLinkItem) => {
    setEditingLink(link);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLink(undefined);
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors lg:hidden">
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
          <button onClick={() => navigate('/dashboard')} className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
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

        {/* Form */}
        <AnimatePresence>
          {showForm && <CreateForm onSaved={handleSaved} onClose={handleCloseForm} initialLink={editingLink} onDelete={editingLink ? () => { handleDelete(editingLink.id); handleCloseForm(); } : undefined} />}
        </AnimatePresence>

        {/* List */}
        {links.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              Mes liens ({links.length})
            </p>
            <AnimatePresence>
              {links.map(link => (
                <LinkCard key={link.id} link={link} onDelete={() => handleDelete(link.id)} onEdit={() => handleEdit(link)} />
              ))}
            </AnimatePresence>
          </div>
        ) : !showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Link2 className="w-7 h-7 text-muted-foreground" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Aucun lien créé</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Créez votre premier lien et envoyez-le à vos clients pour recevoir des paiements en FCFA.
            </p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
