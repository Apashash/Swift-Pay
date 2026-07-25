import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, ChevronRight, ChevronLeft, CheckCircle2, Copy,
  QrCode, AlertCircle, Loader2, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { COUNTRIES } from '@/lib/mock-data';

const NETWORKS: Record<string, { name: string; icon: string }[]> = {
  CI: [
    { name: 'Orange Money', icon: '🟠' },
    { name: 'MTN', icon: '🟡' },
    { name: 'Wave', icon: '🔵' },
    { name: 'Moov Money', icon: '🔷' },
  ],
  SN: [{ name: 'Orange Money', icon: '🟠' }, { name: 'Wave', icon: '🔵' }, { name: 'Free Money', icon: '🟢' }],
  ML: [{ name: 'Orange Money', icon: '🟠' }, { name: 'Moov Money', icon: '🔷' }],
  BF: [{ name: 'Orange Money', icon: '🟠' }, { name: 'Moov Money', icon: '🔷' }],
  GN: [{ name: 'MTN', icon: '🟡' }, { name: 'Orange Money', icon: '🟠' }],
  TG: [{ name: 'Flooz (Moov)', icon: '🔷' }, { name: 'T-Money', icon: '🟢' }],
  BJ: [{ name: 'MTN', icon: '🟡' }, { name: 'Moov Money', icon: '🔷' }],
  NE: [{ name: 'Airtel Money', icon: '🔴' }, { name: 'Moov Money', icon: '🔷' }],
};

const CRYPTO = [
  { id: 'USDT', label: 'USDT BEP-20', rate: 649, icon: '💵' },
  { id: 'BTC', label: 'Bitcoin Lightning', rate: 45000000, icon: '₿' },
];

const WEST_AFRICA = ['CI', 'SN', 'ML', 'BF', 'GN', 'TG', 'BJ', 'NE'];
const waCountries = COUNTRIES.filter((c) => WEST_AFRICA.includes(c.code));

const STEPS = ['Détails', 'Montant', 'Paiement', 'Confirmation'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            i < current ? 'bg-primary text-primary-foreground' :
            i === current ? 'bg-primary/20 text-primary border-2 border-primary' :
            'bg-secondary text-muted-foreground'
          }`}>
            {i < current ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-xs font-medium hidden sm:block ${i === current ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
          {i < STEPS.length - 1 && <div className={`w-8 h-px ${i < current ? 'bg-primary' : 'bg-border'}`} />}
        </div>
      ))}
    </div>
  );
}

export default function SendPayment() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    countryCode: 'CI',
    network: '',
    recipientPhone: '',
    recipientName: '',
    amountFCFA: '',
    crypto: 'USDT',
  });

  const set = (field: string, val: string) => setForm((p) => ({ ...p, [field]: val }));

  const selectedCountry = COUNTRIES.find((c) => c.code === form.countryCode)!;
  const networks = NETWORKS[form.countryCode] || [];
  const selectedCrypto = CRYPTO.find((c) => c.id === form.crypto)!;
  const fcfaAmount = parseFloat(form.amountFCFA) || 0;
  const cryptoAmount = fcfaAmount / selectedCrypto.rate;
  const fee = cryptoAmount * 0.01;
  const totalCrypto = cryptoAmount + fee;

  // Fake wallet address
  const walletAddress = form.crypto === 'BTC'
    ? 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
    : '0x4a3bC9f21dE8aC5f2b3e1a7F4c6D8E9b0A2C4F6';

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canStep1 = form.countryCode && form.network && form.recipientPhone.length >= 6;
  const canStep2 = fcfaAmount >= 100;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Envoyer de l'argent</h1>
          <p className="text-sm text-muted-foreground mt-1">Crypto → Mobile Money en quelques secondes</p>
        </div>

        <div className="mb-8">
          <StepIndicator current={step} />
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Recipient details */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="bg-card border border-border rounded-2xl p-6 space-y-5"
            >
              <h2 className="text-base font-semibold text-foreground">Informations du destinataire</h2>

              {/* Country */}
              <div className="space-y-2">
                <Label>Pays de destination</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {waCountries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { set('countryCode', c.code); set('network', ''); }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        form.countryCode === c.code
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-border/80 hover:bg-secondary text-foreground'
                      }`}
                    >
                      <span className="text-lg">{c.flag}</span>
                      <span className="text-xs truncate">{c.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Network */}
              <div className="space-y-2">
                <Label>Réseau mobile</Label>
                <div className="grid grid-cols-2 gap-2">
                  {networks.map((n) => (
                    <button
                      key={n.name}
                      onClick={() => set('network', n.name)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        form.network === n.name
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-secondary text-foreground'
                      }`}
                    >
                      <span className="text-lg">{n.icon}</span>
                      {n.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="recipientPhone">Numéro du destinataire</Label>
                <div className="flex gap-2">
                  <div className="h-12 px-3 flex items-center gap-1.5 rounded-lg border border-input bg-secondary text-sm font-medium whitespace-nowrap flex-shrink-0">
                    <span>{selectedCountry?.flag}</span>
                    <span className="text-muted-foreground">{selectedCountry?.dialCode}</span>
                  </div>
                  <Input
                    id="recipientPhone"
                    type="tel"
                    placeholder="07 12 34 56"
                    value={form.recipientPhone}
                    onChange={(e) => set('recipientPhone', e.target.value)}
                    className="h-12 flex-1"
                  />
                </div>
              </div>

              {/* Name (optional) */}
              <div className="space-y-2">
                <Label htmlFor="recipientName">Nom du destinataire <span className="text-muted-foreground">(facultatif)</span></Label>
                <Input
                  id="recipientName"
                  placeholder="Mamadou Koné"
                  value={form.recipientName}
                  onChange={(e) => set('recipientName', e.target.value)}
                  className="h-12"
                />
              </div>

              <Button
                onClick={() => setStep(1)}
                disabled={!canStep1}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
              >
                Continuer <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 1: Amount & crypto */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <h2 className="text-base font-semibold text-foreground">Montant à envoyer</h2>

                <div className="space-y-2">
                  <Label htmlFor="amount">Montant en FCFA (que recevra le destinataire)</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="30 000"
                      value={form.amountFCFA}
                      onChange={(e) => set('amountFCFA', e.target.value)}
                      className="h-14 text-xl font-bold pr-20"
                      min={100}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">FCFA</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum : 100 FCFA</p>
                </div>

                <div className="space-y-2">
                  <Label>Payer avec</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {CRYPTO.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => set('crypto', c.id)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                          form.crypto === c.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-secondary text-foreground'
                        }`}
                      >
                        <span className="text-xl">{c.icon}</span>
                        <div className="text-left">
                          <div className="font-semibold">{c.id}</div>
                          <div className="text-xs text-muted-foreground">{c.label.split(' ').slice(1).join(' ')}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {fcfaAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-secondary/60 rounded-xl p-4 space-y-2 text-sm"
                  >
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Montant</span>
                      <span className="font-semibold">{cryptoAmount.toFixed(form.crypto === 'BTC' ? 6 : 2)} {form.crypto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frais (1%)</span>
                      <span>{fee.toFixed(form.crypto === 'BTC' ? 6 : 2)} {form.crypto}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 font-bold">
                      <span>Vous payez</span>
                      <span className="text-primary">{totalCrypto.toFixed(form.crypto === 'BTC' ? 6 : 2)} {form.crypto}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Taux</span>
                      <span>1 {form.crypto} = {selectedCrypto.rate.toLocaleString()} FCFA</span>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="h-12 gap-2">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canStep2}
                  className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
                >
                  Voir les instructions de paiement <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment instructions */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">En attente de votre paiement</h2>
                    <p className="text-xs text-muted-foreground">Expire dans 15:00 minutes</p>
                  </div>
                </div>

                <div className="bg-secondary/40 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destinataire</span>
                    <span className="font-semibold">{form.recipientName || 'Destinataire'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Réseau</span>
                    <span>{selectedCountry?.flag} {form.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Montant reçu</span>
                    <span className="font-bold text-primary">{parseFloat(form.amountFCFA || '0').toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-bold">
                    <span>Vous payez</span>
                    <span>{totalCrypto.toFixed(form.crypto === 'BTC' ? 6 : 2)} {form.crypto}</span>
                  </div>
                </div>

                {/* Wallet address */}
                <div className="space-y-2">
                  <Label>Adresse de paiement {form.crypto}</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-secondary/60 border border-border rounded-xl px-4 py-3 font-mono text-xs text-foreground break-all select-all">
                      {walletAddress}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="w-12 h-12 flex items-center justify-center rounded-xl border border-border bg-secondary hover:bg-muted transition-colors flex-shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                {/* QR placeholder */}
                <div className="flex items-center justify-center py-6 bg-secondary/30 rounded-xl border border-border border-dashed gap-2 text-muted-foreground text-sm">
                  <QrCode className="w-5 h-5" />
                  QR Code de paiement
                </div>

                <div className="flex items-start gap-2 bg-orange-500/5 border border-orange-500/20 rounded-xl p-3 text-xs text-orange-600 dark:text-orange-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Envoyez exactement <strong>{totalCrypto.toFixed(form.crypto === 'BTC' ? 6 : 2)} {form.crypto}</strong> à l'adresse ci-dessus. Tout autre montant sera rejeté.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="h-12 gap-2">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
                >
                  J'ai effectué le paiement <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="bg-card border border-border rounded-2xl p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Paiement en cours de traitement</h2>
                <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
                  Votre transaction est en cours de vérification. Le destinataire recevra ses fonds dans quelques secondes.
                </p>
              </div>

              <div className="bg-secondary/50 rounded-xl p-4 text-sm space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Transaction</span>
                  <span className="font-mono font-semibold">TXN{Date.now().toString().slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <span className="text-orange-500 flex items-center gap-1 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" /> En attente de confirmation
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant</span>
                  <span className="font-bold text-primary">{parseFloat(form.amountFCFA || '0').toLocaleString()} FCFA</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/transactions')} className="flex-1 h-12">
                  Voir mes transactions
                </Button>
                <Button
                  onClick={() => { setStep(0); setForm({ countryCode: 'CI', network: '', recipientPhone: '', recipientName: '', amountFCFA: '', crypto: 'USDT' }); }}
                  className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
                >
                  <Send className="w-4 h-4" /> Nouvel envoi
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
