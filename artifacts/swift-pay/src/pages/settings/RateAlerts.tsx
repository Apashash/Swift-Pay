import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ChevronLeft, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

const STORAGE_KEY = 'swiftpay_rate_alert_prefs';

interface AlertPrefs {
  enabled: boolean;
  thresholdPct: number; // e.g. 2 = ±2%
  currencies: { USDT: boolean; BTC: boolean };
}

function loadPrefs(): AlertPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AlertPrefs;
  } catch { /* ignore */ }
  return { enabled: false, thresholdPct: 2, currencies: { USDT: true, BTC: false } };
}

function savePrefs(prefs: AlertPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

interface Rates { USDT: number; BTC: number }

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        checked ? 'bg-primary' : 'bg-secondary'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

const THRESHOLDS = [1, 2, 5, 10];

export default function RateAlerts() {
  const [, navigate] = useLocation();
  const [prefs, setPrefs] = useState<AlertPrefs>(loadPrefs);
  const [saved, setSaved] = useState(false);
  const [rates, setRates] = useState<Rates | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const loadRates = () => {
    setRatesLoading(true);
    apiFetch<{ rates: Rates; fetchedAt: string }>('/rates')
      .then((data) => { setRates(data.rates); setFetchedAt(data.fetchedAt); })
      .catch(() => {})
      .finally(() => setRatesLoading(false));
  };

  useEffect(() => { loadRates(); }, []);

  const update = (patch: Partial<AlertPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePrefs(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)} M FCFA`
      : `${n.toLocaleString('fr-FR')} FCFA`;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-lg mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate('/profil')}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-card hover:bg-secondary/60 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Alertes de taux</h1>
            <p className="text-xs text-muted-foreground">Suivez les variations USDT / FCFA</p>
          </div>
        </motion.div>

        {/* Saved */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-xl px-4 py-3 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4" /> Préférences enregistrées
          </motion.div>
        )}

        {/* Live rates card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Taux actuels</h2>
            </div>
            <button
              onClick={loadRates}
              disabled={ratesLoading}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${ratesLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {ratesLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
            </div>
          ) : rates ? (
            <div className="p-6 grid grid-cols-2 gap-4">
              {([['USDT', rates.USDT], ['BTC', rates.BTC]] as [string, number][]).map(([sym, rate]) => (
                <div key={sym} className="bg-secondary/40 rounded-xl p-4 text-center">
                  <div className="text-xs text-muted-foreground font-medium mb-1">{sym}</div>
                  <div className="text-base font-bold text-foreground">{fmt(rate)}</div>
                </div>
              ))}
              {fetchedAt && (
                <p className="col-span-2 text-center text-[11px] text-muted-foreground">
                  Mis à jour {new Date(fetchedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">Taux indisponibles</p>
          )}
        </motion.div>

        {/* Alert settings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Alertes activées</h2>
            <Toggle checked={prefs.enabled} onChange={(v) => update({ enabled: v })} />
          </div>

          <div className={`divide-y divide-border transition-opacity duration-200 ${prefs.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            {/* Currencies */}
            <div className="px-6 py-4 space-y-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Devises suivies</p>
              <div className="flex gap-3">
                {(['USDT', 'BTC'] as const).map((sym) => (
                  <button
                    key={sym}
                    onClick={() =>
                      update({ currencies: { ...prefs.currencies, [sym]: !prefs.currencies[sym] } })
                    }
                    className={`flex-1 h-11 rounded-xl border font-semibold text-sm transition-colors ${
                      prefs.currencies[sym]
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'bg-secondary border-border text-muted-foreground hover:border-muted-foreground'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Threshold */}
            <div className="px-6 py-4 space-y-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Seuil de variation
              </p>
              <div className="grid grid-cols-4 gap-2">
                {THRESHOLDS.map((t) => (
                  <button
                    key={t}
                    onClick={() => update({ thresholdPct: t })}
                    className={`h-11 rounded-xl border font-semibold text-sm transition-colors ${
                      prefs.thresholdPct === t
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'bg-secondary border-border text-muted-foreground hover:border-muted-foreground'
                    }`}
                  >
                    ±{t}%
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Vous serez notifié quand le taux bougera de ±{prefs.thresholdPct}% par rapport au dernier relevé.
              </p>
            </div>

            {/* CTA */}
            <div className="px-6 py-4">
              <Button
                className="w-full h-11 font-semibold gap-2"
                onClick={() => {
                  update(prefs); // re-save to confirm
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Enregistrer les alertes
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="bg-card border border-border rounded-2xl p-5 space-y-2"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Comment ça marche</h3>
          <ul className="space-y-1.5">
            {[
              'Les taux sont vérifiés toutes les 5 minutes.',
              "Une notification apparaît dans l'app dès qu'un seuil est franchi.",
              'Idéal pour envoyer au meilleur moment.',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
