import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ArrowLeft,
  Check,
  Search,
  X,
} from 'lucide-react';
import { SiBitcoin, SiTether } from 'react-icons/si';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

// ── Country / operator data ──────────────────────────────────────────────────

type Operator = { id: string; name: string; logo: string; bg: string };

const OPERATORS: Record<string, Operator> = {
  Orange:    { id: 'Orange',    name: 'Orange Money', logo: '/operators/orange.png',  bg: '#1c1c1e' },
  MTN:       { id: 'MTN',       name: 'MTN',          logo: '/operators/mtn.png',     bg: '#ffcc00' },
  Wave:      { id: 'Wave',      name: 'Wave',         logo: '/operators/wave.webp',   bg: '#00b2ff' },
  Moov:      { id: 'Moov',      name: 'Moov Money',   logo: '/operators/moov.png',    bg: '#f06000' },
  TMoney:    { id: 'TMoney',    name: 'T-Money',      logo: '/operators/tmoney.png',  bg: '#ffd700' },
  Free:      { id: 'Free',      name: 'Free Money',   logo: '',                       bg: '#e20025' },
  Expresso:  { id: 'Expresso',  name: 'Expresso',     logo: '',                       bg: '#005baa' },
  Cellcom:   { id: 'Cellcom',   name: 'Cellcom',      logo: '',                       bg: '#004a97' },
  Flooz:     { id: 'Flooz',     name: 'Flooz',        logo: '',                       bg: '#009a44' },
};

const COUNTRIES = [
  { code: 'CI', flag: '🇨🇮', name: "Côte d'Ivoire", currency: 'FCFA', operators: ['Orange', 'MTN', 'Wave', 'Moov'] },
  { code: 'CM', flag: '🇨🇲', name: 'Cameroun',       currency: 'FCFA', operators: ['Orange', 'MTN'] },
  { code: 'SN', flag: '🇸🇳', name: 'Sénégal',        currency: 'FCFA', operators: ['Orange', 'Free', 'Wave', 'Expresso'] },
  { code: 'ML', flag: '🇲🇱', name: 'Mali',            currency: 'FCFA', operators: ['Orange', 'Moov'] },
  { code: 'BF', flag: '🇧🇫', name: 'Burkina Faso',    currency: 'FCFA', operators: ['Orange', 'Moov'] },
  { code: 'GN', flag: '🇬🇳', name: 'Guinée',          currency: 'GNF',  operators: ['Orange', 'MTN', 'Cellcom'] },
  { code: 'BJ', flag: '🇧🇯', name: 'Bénin',           currency: 'FCFA', operators: ['MTN', 'Moov'] },
  { code: 'TG', flag: '🇹🇬', name: 'Togo',            currency: 'FCFA', operators: ['Orange', 'TMoney', 'Flooz'] },
];

// ── Exchange rates ────────────────────────────────────────────────────────────

const RATES = {
  USDT: { fcfaPerUnit: 646,        label: 'USDT', sublabel: 'BEP-20',    color: '#26A17B' },
  BTC:  { fcfaPerUnit: 42_575_000, label: 'BTC',  sublabel: 'Lightning', color: '#F7931A' },
} as const;

type Crypto = keyof typeof RATES;
type Step   = 'form' | 'recap' | 'success';

const FEE_RATE = 0.01;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(n: number, crypto: Crypto) {
  if (crypto === 'BTC') return n.toFixed(6);
  return n.toFixed(2);
}

function formatFcfa(raw: string) {
  const digits = raw.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PaymentForm() {
  const { t } = useTranslation();

  // ── State ──
  const [countryCode, setCountryCode]   = useState('CI');
  const [operator, setOperator]         = useState('Orange');
  const [rawAmount, setRawAmount]       = useState('');
  const [crypto, setCrypto]             = useState<Crypto>('USDT');
  const [phone, setPhone]               = useState('');
  const [step, setStep]                 = useState<Step>('form');
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const country = COUNTRIES.find(c => c.code === countryCode) ?? COUNTRIES[0];

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  // Reset operator when country changes
  const handleCountryChange = (code: string) => {
    const c = COUNTRIES.find(x => x.code === code)!;
    setCountryCode(code);
    setOperator(c.operators[0]);
    setShowCountryMenu(false);
    setCountrySearch('');
  };

  const handleOpenCountryMenu = () => {
    setShowCountryMenu(v => !v);
    setCountrySearch('');
    setTimeout(() => searchRef.current?.focus(), 80);
  };

  // Close country menu on outside click
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

  // ── Derived values ──
  const fcfaAmount = parseInt(rawAmount.replace(/\D/g, '') || '0', 10);
  const rate       = RATES[crypto];
  const cryptoNet  = fcfaAmount / rate.fcfaPerUnit;          // net amount sender pays (before fee)
  const fee        = cryptoNet * FEE_RATE;
  const cryptoTotal = cryptoNet + fee;

  // ── Handlers ──
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setRawAmount(digits);
  };

  const handleGenerate = () => {
    if (fcfaAmount > 0) setStep('recap');
  };

  const handleConfirm = () => {
    if (phone.trim().length >= 8) setStep('success');
  };

  const handleReset = () => {
    setStep('form');
    setPhone('');
  };

  // ── Render ──
  return (
    <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.h3
              key="title-form"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              className="font-semibold text-foreground text-lg"
            >
              {t('form_title')}
            </motion.h3>
          )}
          {step === 'recap' && (
            <motion.div
              key="title-recap"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              className="flex items-center gap-2"
            >
              <button onClick={() => setStep('form')} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-foreground text-lg">Récapitulatif</span>
            </motion.div>
          )}
          {step === 'success' && (
            <motion.h3
              key="title-success"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              className="font-semibold text-foreground text-lg"
            >
              Paiement généré
            </motion.h3>
          )}
        </AnimatePresence>
        <div className="flex gap-1">
          {(['form', 'recap', 'success'] as Step[]).map(s => (
            <div
              key={s}
              className={cn(
                'w-2 h-2 rounded-full transition-colors duration-300',
                step === s ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── STEP 1: FORM ────────────────────────────────────── */}
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Country */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('form_destination')}
              </label>
              <div className="relative" ref={menuRef}>
                {/* Trigger */}
                <button
                  onClick={handleOpenCountryMenu}
                  className={cn(
                    'w-full bg-secondary border rounded-xl p-3.5 flex items-center gap-3 transition-all duration-200',
                    showCountryMenu
                      ? 'border-primary/60 ring-2 ring-primary/20 bg-secondary'
                      : 'border-border hover:border-primary/30 hover:bg-muted'
                  )}
                >
                  <span className="text-xl leading-none">{country.flag}</span>
                  <span className="text-foreground text-sm font-medium flex-1 text-left">{country.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {country.code}
                  </span>
                  <ChevronDown className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform duration-200',
                    showCountryMenu && 'rotate-180 text-primary'
                  )} />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {showCountryMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute z-50 w-full mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,230,118,0.08)' }}
                    >
                      {/* Search bar */}
                      <div className="p-3 border-b border-border">
                        <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 ring-1 ring-transparent focus-within:ring-primary/40 transition-all">
                          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <input
                            ref={searchRef}
                            type="text"
                            value={countrySearch}
                            onChange={e => setCountrySearch(e.target.value)}
                            placeholder="Rechercher par nom ou code…"
                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                          />
                          {countrySearch && (
                            <button onClick={() => setCountrySearch('')} className="text-muted-foreground hover:text-foreground transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Country list */}
                      <div className="max-h-56 overflow-y-auto">
                        {filteredCountries.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                            Aucun pays trouvé
                          </div>
                        ) : (
                          filteredCountries.map((c, i) => (
                            <button
                              key={c.code}
                              onClick={() => handleCountryChange(c.code)}
                              className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-border/40 last:border-0',
                                c.code === countryCode
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-foreground hover:bg-secondary'
                              )}
                            >
                              <span className="text-lg leading-none">{c.flag}</span>
                              <span className="flex-1 text-left font-medium">{c.name}</span>
                              <span className="text-[10px] font-mono text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded">
                                {c.code}
                              </span>
                              {c.code === countryCode && (
                                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Operator */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('form_network')}
              </label>
              <div className={cn(
                'grid gap-2',
                country.operators.length <= 2 ? 'grid-cols-2' : 'grid-cols-4'
              )}>
                {country.operators.map(opId => {
                  const op = OPERATORS[opId] ?? { id: opId, name: opId, logo: '', bg: '#333' };
                  const selected = operator === opId;
                  return (
                    <button
                      key={opId}
                      onClick={() => setOperator(opId)}
                      className={cn(
                        'relative flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 px-1 transition-all duration-200 overflow-hidden',
                        selected
                          ? 'border-primary shadow-[0_0_12px_rgba(0,230,118,0.25)] scale-[1.03]'
                          : 'border-border hover:border-primary/30 hover:scale-[1.02]'
                      )}
                      style={{ background: selected ? `${op.bg}22` : 'var(--color-secondary)' }}
                    >
                      {/* Logo or coloured initial */}
                      {op.logo ? (
                        <div
                          className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center"
                          style={{ background: op.bg }}
                        >
                          <img
                            src={op.logo}
                            alt={op.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                          style={{ background: op.bg }}
                        >
                          {op.name.slice(0, 3).toUpperCase()}
                        </div>
                      )}
                      <span className={cn(
                        'text-[10px] font-semibold leading-tight text-center',
                        selected ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {op.id}
                      </span>
                      {/* Selected ring */}
                      {selected && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary shadow-[0_0_4px_rgba(0,230,118,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('form_amount')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatFcfa(rawAmount)}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full bg-secondary border border-border rounded-xl p-4 pr-20 text-2xl font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                  {country.currency}
                </div>
              </div>
            </div>

            {/* Crypto selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('form_payWith')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(RATES) as Crypto[]).map(c => {
                  const r = RATES[c];
                  const selected = crypto === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setCrypto(c)}
                      className={cn(
                        'rounded-xl p-3 flex items-center gap-3 border transition-all text-left',
                        selected
                          ? 'bg-primary/10 border-primary/60 shadow-[0_0_12px_rgba(0,230,118,0.15)]'
                          : 'bg-secondary border-border hover:bg-muted'
                      )}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${r.color}22`, color: r.color }}
                      >
                        {c === 'USDT' ? <SiTether size={16} /> : <SiBitcoin size={16} />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{r.label}</div>
                        <div className="text-[10px] text-muted-foreground">{r.sublabel}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary row */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('form_youPay')}</span>
                <span className="text-foreground font-mono">
                  {fcfaAmount > 0 ? formatAmount(cryptoTotal, crypto) : '—'} {rate.label}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('form_fee')} (1%)</span>
                <span className="text-foreground font-mono">
                  {fcfaAmount > 0 ? formatAmount(fee, crypto) : '—'} {rate.label}
                </span>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handleGenerate}
              disabled={fcfaAmount <= 0}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base shadow-[0_0_20px_rgba(0,230,118,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {t('form_generate')} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              {t('form_secure')}
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: RECAP ───────────────────────────────────── */}
        {step === 'recap' && (
          <motion.div
            key="recap"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Summary card */}
            <div className="bg-secondary/60 border border-border rounded-xl divide-y divide-border">
              <RecapRow label="Pays" value={`${country.flag} ${country.name}`} />
              <RecapRow label="Réseau" value={operator} />
              <RecapRow
                label="Montant reçu"
                value={`${formatFcfa(rawAmount)} ${country.currency}`}
                highlight
              />
              <RecapRow label="Payer en" value={`${rate.label} (${rate.sublabel})`} />
              <RecapRow label="Montant crypto" value={`${formatAmount(cryptoNet, crypto)} ${rate.label}`} />
              <RecapRow label="Frais (1%)" value={`${formatAmount(fee, crypto)} ${rate.label}`} />
              <RecapRow
                label="Total à envoyer"
                value={`${formatAmount(cryptoTotal, crypto)} ${rate.label}`}
                bold
              />
            </div>

            {/* Phone number */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Numéro du destinataire
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="ex: +225 07 00 00 00 00"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Le destinataire recevra {formatFcfa(rawAmount)} {country.currency} sur son compte {operator}.
              </p>
            </div>

            {/* Actions */}
            <Button
              onClick={handleConfirm}
              disabled={phone.trim().length < 8}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base shadow-[0_0_20px_rgba(0,230,118,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Valider et générer l'adresse <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              {t('form_secure')}
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: SUCCESS ─────────────────────────────────── */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 14 }}
              className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,230,118,0.3)]"
            >
              <Check className="w-8 h-8 text-primary" />
            </motion.div>

            <div>
              <h4 className="font-bold text-foreground text-lg mb-1">Adresse de paiement générée</h4>
              <p className="text-sm text-muted-foreground">
                Envoyez exactement{' '}
                <span className="font-mono text-foreground font-semibold">
                  {formatAmount(cryptoTotal, crypto)} {rate.label}
                </span>{' '}
                à l'adresse ci-dessous.
              </p>
            </div>

            {/* Fake QR + address */}
            <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-3">
              {/* QR placeholder */}
              <div className="w-28 h-28 mx-auto rounded-lg bg-white p-2">
                <div className="w-full h-full rounded bg-foreground/10 flex items-center justify-center text-3xl">
                  {crypto === 'BTC' ? '₿' : '₮'}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Adresse {rate.label}</p>
                <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2 justify-between">
                  <code className="text-[11px] text-foreground font-mono truncate">
                    {crypto === 'BTC'
                      ? 'bc1qxy2kgdygjrsqtzq2n0yrf249kf...'
                      : '0x4Bf5c5e3D9E2f3A1C2b8D7E6F4A9B0...'}
                  </code>
                  <button
                    onClick={() => navigator.clipboard?.writeText(
                      crypto === 'BTC'
                        ? 'bc1qxy2kgdygjrsqtzq2n0yrf249kfggfgrj9j'
                        : '0x4Bf5c5e3D9E2f3A1C2b8D7E6F4A9B0C1D2E3F4'
                    )}
                    className="text-[10px] text-primary font-semibold hover:underline flex-shrink-0"
                  >
                    Copier
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-xs pt-1 border-t border-border">
                <span className="text-muted-foreground">Destinataire</span>
                <span className="text-foreground font-medium">{phone} · {operator}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Recevra</span>
                <span className="text-primary font-semibold font-mono">{formatFcfa(rawAmount)} {country.currency}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Ce paiement expire dans <span className="text-foreground font-medium">30 minutes</span>.
              Le destinataire sera notifié automatiquement par SMS.
            </p>

            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full rounded-xl h-11"
            >
              Nouveau paiement
            </Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ── Helper sub-component ──────────────────────────────────────────────────────

function RecapRow({
  label,
  value,
  highlight,
  bold,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  bold?: boolean;
}) {
  return (
    <div className={cn('flex justify-between items-center px-4 py-3', highlight && 'bg-primary/5')}>
      <span className={cn('text-sm text-muted-foreground', bold && 'text-foreground font-semibold')}>{label}</span>
      <span className={cn('text-sm text-foreground font-mono', highlight && 'text-primary font-bold', bold && 'font-bold')}>
        {value}
      </span>
    </div>
  );
}
