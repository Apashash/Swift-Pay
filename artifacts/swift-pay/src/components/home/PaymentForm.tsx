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
  Loader2,
  Copy,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { apiFetch, type ApiTransaction, type Rates, type CryptoAsset } from '@/lib/api';
import { useLocation } from 'wouter';
import imgOrange from '@/assets/operators/orange.png';
import imgMtn    from '@/assets/operators/mtn.png';
import imgWave   from '@/assets/operators/wave.webp';
import imgMoov   from '@/assets/operators/moov.png';
import imgTmoney from '@/assets/operators/tmoney.png';

// ── Country / operator data ──────────────────────────────────────────────────

type Operator = { id: string; name: string; logo: string; bg: string };

const OPERATORS: Record<string, Operator> = {
  Orange:    { id: 'Orange',    name: 'Orange Money', logo: imgOrange, bg: '#1c1c1e' },
  MTN:       { id: 'MTN',       name: 'MTN',          logo: imgMtn,    bg: '#ffcc00' },
  Wave:      { id: 'Wave',      name: 'Wave',         logo: imgWave,   bg: '#00b2ff' },
  Moov:      { id: 'Moov',      name: 'Moov Money',   logo: imgMoov,   bg: '#f06000' },
  TMoney:    { id: 'TMoney',    name: 'T-Money',      logo: imgTmoney, bg: '#ffd700' },
  Free:      { id: 'Free',      name: 'Free Money',   logo: '',        bg: '#e20025' },
  Expresso:  { id: 'Expresso',  name: 'Expresso',     logo: '',        bg: '#005baa' },
  Cellcom:   { id: 'Cellcom',   name: 'Cellcom',      logo: '',        bg: '#004a97' },
  Flooz:     { id: 'Flooz',     name: 'Flooz',        logo: '',        bg: '#009a44' },
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

type Step = 'form' | 'recap' | 'success';

const FEE_RATE = 0.01;

// ── Coin logos (emoji fallback) ───────────────────────────────────────────────

const COIN_EMOJI: Record<string, string> = {
  USDT: '₮', BTC: '₿', ETH: 'Ξ', LTC: 'Ł', DOGE: 'Ð', BCH: '₿', TRX: '◈',
};
const COIN_COLOR: Record<string, string> = {
  USDT: '#26A17B', BTC: '#F7931A', ETH: '#627EEA', LTC: '#BFBBBB',
  DOGE: '#C2A633', BCH: '#8DC351', TRX: '#EF0027',
};

function coinColor(coin: string) { return COIN_COLOR[coin] ?? '#888'; }

function formatAmount(n: number, coin: string) {
  if (coin === 'BTC' || coin === 'LTC') return n.toFixed(6);
  if (coin === 'ETH') return n.toFixed(5);
  return n.toFixed(2);
}

function formatFcfa(raw: string) {
  const digits = raw.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ── Component ────────────────────────────────────────────────────────────────

export function PaymentForm() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  // ─ Country / operator ─
  const [countryCode, setCountryCode]   = useState('CI');
  const [operator, setOperator]         = useState('Orange');
  const [rawAmount, setRawAmount]       = useState('');
  const [phone, setPhone]               = useState('');
  const [step, setStep]                 = useState<Step>('form');
  const [email, setEmail]               = useState('');
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // ─ Rates ─
  const [rates, setRates] = useState<Rates>({ USDT: 655, BTC: 46_000_000 });
  const [loadingRates, setLoadingRates] = useState(true);

  // ─ AshtechPay crypto assets ─
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [assetsError, setAssetsError] = useState('');

  // ─ Crypto selection ─
  const [selectedCoin, setSelectedCoin]       = useState('');
  const [selectedAssetCode, setSelectedAssetCode] = useState('');

  // ─ Transaction ─
  const [submitting, setSubmitting]   = useState(false);
  const [createdTx, setCreatedTx]     = useState<ApiTransaction | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedMemo, setCopiedMemo]       = useState(false);
  const [copiedRef, setCopiedRef]         = useState(false);
  const [txStatus, setTxStatus]           = useState<'pending' | 'completed' | 'failed'>('pending');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─ Fetch rates ─
  useEffect(() => {
    apiFetch<{ rates: Rates }>('/rates')
      .then((data) => setRates(data.rates))
      .catch(() => {})
      .finally(() => setLoadingRates(false));
  }, []);

  // ─ Fetch AshtechPay assets ─
  useEffect(() => {
    apiFetch<{ assets: CryptoAsset[] }>('/crypto/assets')
      .then((data) => {
        setAssets(data.assets);
        // Auto-select first available coin + network
        if (data.assets.length > 0) {
          const first = data.assets[0];
          setSelectedCoin(first.coin);
          setSelectedAssetCode(first.asset_code);
        }
      })
      .catch(() => setAssetsError('Impossible de charger les réseaux crypto.'))
      .finally(() => setLoadingAssets(false));
  }, []);

  // ─ Group assets by coin ─
  const coinGroups = useMemo(() => {
    const map = new Map<string, CryptoAsset[]>();
    for (const a of assets) {
      if (!map.has(a.coin)) map.set(a.coin, []);
      map.get(a.coin)!.push(a);
    }
    return map;
  }, [assets]);

  const selectedAsset = assets.find(a => a.asset_code === selectedAssetCode) ?? null;

  const country = COUNTRIES.find(c => c.code === countryCode) ?? COUNTRIES[0];

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [countrySearch]);

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

  const fcfaAmount  = parseInt(rawAmount.replace(/\D/g, '') || '0', 10);
  const rateValue   = rates[selectedCoin] ?? 1;
  const cryptoNet   = fcfaAmount / rateValue;
  const fee         = cryptoNet * FEE_RATE;
  const cryptoTotal = cryptoNet + fee;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawAmount(e.target.value.replace(/\D/g, ''));
  };

  const handleGenerate = () => {
    if (fcfaAmount > 0 && phone.trim().length >= 8 && selectedAssetCode) setStep('recap');
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const op = OPERATORS[operator] ?? { name: operator };
      const data = await apiFetch<{ transaction: ApiTransaction }>('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          recipient: phone.trim(),
          recipientPhone: phone.trim(),
          countryCode: country.code,
          countryName: country.name,
          networkFlag: country.flag,
          network: op.name,
          amountFcfa: fcfaAmount,
          amountCrypto: cryptoNet,
          cryptoCurrency: selectedCoin,
          cryptoNetwork: selectedAsset?.network ?? null,
          assetCode: selectedAssetCode,
          rate: rateValue,
          fee,
        }),
      });
      setCreatedTx(data.transaction);
      setStep('success');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la création de la transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setStep('form');
    setPhone('');
    setRawAmount('');
    setCreatedTx(null);
    setSubmitError('');
    setTxStatus('pending');
  };

  // ─ Poll for status updates ─
  useEffect(() => {
    if (!createdTx || step !== 'success') return;
    setTxStatus('pending');

    pollingRef.current = setInterval(async () => {
      try {
        const data = await apiFetch<{ status: 'pending' | 'completed' | 'failed' }>(
          `/transactions/status/${createdTx.id}`
        );
        setTxStatus(data.status);
        if (data.status !== 'pending') {
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // keep polling on transient errors
      }
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [createdTx, step]);

  const handleCopy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  // ─ Derived crypto display ─
  const networkLabel = selectedAsset?.network_label ?? selectedAsset?.network ?? '';
  const memoRequired = selectedAsset?.memo_required ?? false;

  return (
    <div className="relative bg-card border border-border rounded-2xl shadow-2xl backdrop-blur-sm p-4 sm:p-6 w-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.h3 key="title-form" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="font-semibold text-foreground text-lg">
              {t('form_title')}
              {(loadingRates || loadingAssets) && <span className="ml-2 text-xs text-muted-foreground font-normal">Chargement…</span>}
            </motion.h3>
          )}
          {step === 'recap' && (
            <motion.div key="title-recap" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="flex items-center gap-2">
              <button onClick={() => setStep('form')} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-foreground text-lg">Récapitulatif</span>
            </motion.div>
          )}
          {step === 'success' && (
            <motion.h3 key="title-success" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="font-semibold text-foreground text-lg">
              Paiement généré
            </motion.h3>
          )}
        </AnimatePresence>
        <div className="flex gap-1">
          {(['form', 'recap', 'success'] as Step[]).map(s => (
            <div key={s} className={cn('w-2 h-2 rounded-full transition-colors duration-300', step === s ? 'bg-primary' : 'bg-muted-foreground/30')} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── STEP 1: FORM ────────────────────────────────────── */}
        {step === 'form' && (
          <motion.div key="form" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }} className="space-y-5">

            {/* Country */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('form_destination')}</label>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={handleOpenCountryMenu}
                  className={cn('w-full bg-secondary border rounded-xl p-3.5 flex items-center gap-3 transition-all duration-200', showCountryMenu ? 'border-primary/60 ring-2 ring-primary/20 bg-secondary' : 'border-border hover:border-primary/30 hover:bg-muted')}
                >
                  <span className="text-xl leading-none">{country.flag}</span>
                  <span className="text-foreground text-sm font-medium flex-1 text-left">{country.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{country.code}</span>
                  <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform duration-200', showCountryMenu && 'rotate-180 text-primary')} />
                </button>
                <AnimatePresence>
                  {showCountryMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute z-50 w-full mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,230,118,0.08)' }}
                    >
                      <div className="p-3 border-b border-border">
                        <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 ring-1 ring-transparent focus-within:ring-primary/40 transition-all">
                          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <input ref={searchRef} type="text" value={countrySearch} onChange={e => setCountrySearch(e.target.value)} placeholder="Rechercher par nom ou code…" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none" />
                          {countrySearch && <button onClick={() => setCountrySearch('')} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-3.5 h-3.5" /></button>}
                        </div>
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {filteredCountries.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-muted-foreground">Aucun pays trouvé</div>
                        ) : (
                          filteredCountries.map((c) => (
                            <button key={c.code} onClick={() => handleCountryChange(c.code)} className={cn('w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-border/40 last:border-0', c.code === countryCode ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary')}>
                              <span className="text-lg leading-none">{c.flag}</span>
                              <span className="flex-1 text-left font-medium">{c.name}</span>
                              <span className="text-[10px] font-mono text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded">{c.code}</span>
                              {c.code === countryCode && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
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
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('form_network')}</label>
              <div className="grid grid-cols-2 gap-2">
                {country.operators.map(opId => {
                  const op = OPERATORS[opId] ?? { id: opId, name: opId, logo: '', bg: '#333' };
                  const selected = operator === opId;
                  return (
                    <button key={opId} onClick={() => setOperator(opId)}
                      className={cn('relative flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200', selected ? 'border-primary shadow-[0_0_12px_rgba(0,230,118,0.25)]' : 'border-border hover:border-primary/30')}
                      style={{ background: selected ? `${op.bg}22` : 'var(--color-secondary)' }}
                    >
                      {op.logo ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: op.bg }}>
                          <img src={op.logo} alt={op.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ background: op.bg }}>
                          {op.name.slice(0, 3).toUpperCase()}
                        </div>
                      )}
                      <span className={cn('text-xs font-semibold leading-tight text-left', selected ? 'text-primary' : 'text-foreground')}>{op.name}</span>
                      {selected && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-[0_0_4px_rgba(0,230,118,0.8)]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('form_amount')}</label>
              <div className="relative">
                <input
                  type="text" inputMode="numeric"
                  value={formatFcfa(rawAmount)} onChange={handleAmountChange} placeholder="0"
                  className="w-full bg-secondary border border-border rounded-xl p-4 pr-20 text-2xl font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">{country.currency}</div>
              </div>
            </div>

            {/* Crypto selector — dynamic from AshtechPay */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('form_payWith')}</label>

              {loadingAssets ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement des cryptos disponibles…
                </div>
              ) : assetsError ? (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {assetsError}
                </div>
              ) : (
                <>
                  {/* Coin selection */}
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from(coinGroups.keys()).map(coin => {
                      const isSelected = selectedCoin === coin;
                      const color = coinColor(coin);
                      const emoji = COIN_EMOJI[coin] ?? coin.slice(0, 1);
                      const rateForCoin = rates[coin];
                      return (
                        <button
                          key={coin}
                          onClick={() => {
                            setSelectedCoin(coin);
                            // Auto-select first network of this coin
                            const networks = coinGroups.get(coin)!;
                            setSelectedAssetCode(networks[0].asset_code);
                          }}
                          className={cn(
                            'rounded-xl p-3 flex flex-col items-center gap-1.5 border transition-all text-center',
                            isSelected
                              ? 'border-primary/60 shadow-[0_0_12px_rgba(0,230,118,0.15)]'
                              : 'bg-secondary border-border hover:bg-muted',
                          )}
                          style={{ background: isSelected ? `${color}15` : undefined }}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ backgroundColor: `${color}22`, color }}
                          >
                            {emoji}
                          </div>
                          <span className={cn('text-xs font-semibold', isSelected ? 'text-primary' : 'text-foreground')}>{coin}</span>
                          {rateForCoin && (
                            <span className="text-[9px] text-muted-foreground leading-tight">
                              {loadingRates ? '…' : `${rateForCoin.toLocaleString('fr-FR')} FCFA`}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Network selection for the chosen coin */}
                  {selectedCoin && coinGroups.has(selectedCoin) && coinGroups.get(selectedCoin)!.length > 1 && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Réseau</label>
                      <div className="flex flex-wrap gap-2">
                        {coinGroups.get(selectedCoin)!.map(asset => {
                          const isSelected = selectedAssetCode === asset.asset_code;
                          return (
                            <button
                              key={asset.asset_code}
                              onClick={() => setSelectedAssetCode(asset.asset_code)}
                              className={cn(
                                'rounded-lg px-3 py-1.5 text-xs font-medium border transition-all',
                                isSelected
                                  ? 'bg-primary/15 border-primary/50 text-primary'
                                  : 'bg-secondary border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                              )}
                            >
                              {asset.network_label}
                              {asset.memo_required && (
                                <span className="ml-1 opacity-60 text-[9px]">+memo</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Single network — just show the label */}
                  {selectedCoin && coinGroups.has(selectedCoin) && coinGroups.get(selectedCoin)!.length === 1 && (
                    <p className="text-xs text-muted-foreground">
                      Réseau : <span className="text-foreground font-medium">{coinGroups.get(selectedCoin)![0].network_label}</span>
                      {coinGroups.get(selectedCoin)![0].memo_required && <span className="ml-1 text-orange-400">(+ memo requis)</span>}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Numéro du bénéficiaire</label>
              <input
                type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="07 00 00 00 00"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Summary */}
            {selectedAssetCode && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('form_youPay')}</span>
                  <span className="text-foreground font-mono">{fcfaAmount > 0 ? formatAmount(cryptoTotal, selectedCoin) : '—'} {selectedCoin}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('form_fee')} (1%)</span>
                  <span className="text-foreground font-mono">{fcfaAmount > 0 ? formatAmount(fee, selectedCoin) : '—'} {selectedCoin}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground/70 pt-1 border-t border-border">
                  <span>Taux</span>
                  <span>1 {selectedCoin} = {loadingRates ? '…' : `${(rates[selectedCoin] ?? 0).toLocaleString('fr-FR')} FCFA`}</span>
                </div>
                {networkLabel && (
                  <div className="flex justify-between text-xs text-muted-foreground/70">
                    <span>Réseau</span>
                    <span className="text-foreground">{networkLabel}</span>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={fcfaAmount <= 0 || phone.trim().length < 8 || !selectedAssetCode || loadingAssets}
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
          <motion.div key="recap" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }} className="space-y-5">
            <div className="bg-secondary/60 border border-border rounded-xl divide-y divide-border">
              <RecapRow label="Pays" value={`${country.flag} ${country.name}`} />
              <RecapRow label="Réseau Mobile Money" value={OPERATORS[operator]?.name || operator} />
              <RecapRow label="Bénéficiaire" value={phone} />
              <RecapRow label="Montant reçu" value={`${formatFcfa(rawAmount)} ${country.currency}`} highlight />
              <RecapRow label="Crypto" value={selectedCoin} />
              {networkLabel && <RecapRow label="Réseau" value={networkLabel} />}
              <RecapRow label="Taux appliqué" value={`1 ${selectedCoin} = ${(rates[selectedCoin] ?? 0).toLocaleString('fr-FR')} FCFA`} />
              <RecapRow label="Montant crypto" value={`${formatAmount(cryptoNet, selectedCoin)} ${selectedCoin}`} />
              <RecapRow label="Frais (1%)" value={`${formatAmount(fee, selectedCoin)} ${selectedCoin}`} />
              <RecapRow label="Total à envoyer" value={`${formatAmount(cryptoTotal, selectedCoin)} ${selectedCoin}`} bold />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                E-mail pour le reçu
                <span className="normal-case text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Optionnel</span>
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {submitError && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                {submitError}
              </div>
            )}

            <Button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base shadow-[0_0_20px_rgba(0,230,118,0.2)] transition-all"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Génération…</>
              ) : (
                <>Valider et générer l'adresse <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              {t('form_secure')}
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: SUCCESS ─────────────────────────────────── */}
        {step === 'success' && createdTx && (() => {
          const txRef = `swift-0283729-${createdTx.id.slice(0, 8)}`;
          const addr  = createdTx.paymentAddress ?? '';
          const memo  = createdTx.paymentMemo ?? '';
          return (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3 }} className="space-y-6 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 14 }}
                className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,230,118,0.3)]"
              >
                <Check className="w-8 h-8 text-primary" />
              </motion.div>

              <div>
                <h4 className="font-bold text-foreground text-lg mb-1">Adresse de paiement générée</h4>
                <p className="text-sm text-muted-foreground">
                  Envoyez exactement{' '}
                  <span className="font-mono text-foreground font-semibold">
                    {formatAmount(cryptoTotal, selectedCoin)} {selectedCoin}
                  </span>{' '}
                  à l'adresse ci-dessous{networkLabel ? ` via ${networkLabel}` : ''}.
                </p>
              </div>

              <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-3 text-left overflow-hidden min-w-0">
                {/* Deposit address */}
                <div className="space-y-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Adresse {selectedCoin}{networkLabel ? ` · ${networkLabel}` : ''}</p>
                  <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2 justify-between min-w-0 overflow-hidden">
                    <code className="text-[11px] text-foreground font-mono truncate min-w-0 flex-1">{addr || '—'}</code>
                    <button
                      onClick={() => addr && handleCopy(addr, setCopiedAddress)}
                      disabled={!addr}
                      className="text-[10px] text-primary font-semibold hover:underline shrink-0 flex items-center gap-1 disabled:opacity-30"
                    >
                      {copiedAddress ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedAddress ? 'Copié' : 'Copier'}
                    </button>
                  </div>
                </div>

                {/* Memo / Tag (if required) */}
                {memo && (
                  <div className="space-y-1 min-w-0">
                    <p className="text-[10px] text-orange-400 uppercase tracking-wider font-semibold">
                      ⚠ Memo / Tag requis — sans ce mémo, votre paiement sera perdu
                    </p>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 flex items-center gap-2 justify-between min-w-0 overflow-hidden">
                      <code className="text-[11px] text-foreground font-mono truncate min-w-0 flex-1">{memo}</code>
                      <button
                        onClick={() => handleCopy(memo, setCopiedMemo)}
                        className="text-[10px] text-orange-400 font-semibold hover:underline shrink-0 flex items-center gap-1"
                      >
                        {copiedMemo ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedMemo ? 'Copié' : 'Copier'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between gap-2 text-xs pt-1 border-t border-border">
                  <span className="text-muted-foreground shrink-0">Destinataire</span>
                  <span className="text-foreground font-medium text-right truncate min-w-0">{phone} · {OPERATORS[operator]?.name || operator}</span>
                </div>
                <div className="flex justify-between gap-2 text-xs">
                  <span className="text-muted-foreground shrink-0">Recevra</span>
                  <span className="text-primary font-semibold font-mono">{formatFcfa(rawAmount)} {country.currency}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground shrink-0">Réf. transaction</span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-foreground font-mono text-[10px] truncate">{txRef}</span>
                    <button
                      onClick={() => handleCopy(txRef, setCopiedRef)}
                      className="text-primary shrink-0 hover:text-primary/80 transition-colors"
                      title="Copier la référence"
                    >
                      {copiedRef ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirmation spinner */}
              <div className={cn(
                'flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium border',
                txStatus === 'pending'   && 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
                txStatus === 'completed' && 'bg-primary/10 border-primary/20 text-primary',
                txStatus === 'failed'    && 'bg-destructive/10 border-destructive/20 text-destructive',
              )}>
                {txStatus === 'pending' && (
                  <><Loader2 className="w-4 h-4 animate-spin shrink-0" /> En attente de confirmation du paiement…</>
                )}
                {txStatus === 'completed' && (
                  <><Check className="w-4 h-4 shrink-0" /> Paiement confirmé !</>
                )}
                {txStatus === 'failed' && (
                  <><X className="w-4 h-4 shrink-0" /> Paiement non reçu. Contactez le support.</>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground">
                Ce paiement expire dans <span className="text-foreground font-medium">30 minutes</span>.
                Le destinataire sera notifié automatiquement par SMS.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/transactions/${createdTx.id}`)}
                  className="w-full rounded-xl h-11 gap-1.5 text-sm px-2"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Voir la transaction</span>
                </Button>
                <Button variant="outline" onClick={handleReset} className="w-full rounded-xl h-11 text-sm px-2">
                  <span className="truncate">Nouveau paiement</span>
                </Button>
              </div>
            </motion.div>
          );
        })()}

      </AnimatePresence>
    </div>
  );
}

function RecapRow({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) {
  return (
    <div className={cn('flex justify-between items-center px-4 py-3', highlight && 'bg-primary/5')}>
      <span className={cn('text-sm text-muted-foreground', bold && 'text-foreground font-semibold')}>{label}</span>
      <span className={cn('text-sm text-foreground font-mono', highlight && 'text-primary font-bold', bold && 'font-bold')}>{value}</span>
    </div>
  );
}
