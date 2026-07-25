import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, type RegisterData } from '@/lib/auth';
import { COUNTRIES } from '@/lib/mock-data';
import swiftPayLogo from '@assets/swift-logo.png';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8 caractères minimum', ok: password.length >= 8 },
    { label: 'Une majuscule', ok: /[A-Z]/.test(password) },
    { label: 'Un chiffre', ok: /[0-9]/.test(password) },
    { label: 'Un caractère spécial', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['bg-destructive', 'bg-orange-500', 'bg-yellow-500', 'bg-primary'];
  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort'];

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : 'bg-border'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Force du mot de passe</span>
        <span className={`text-xs font-medium ${score === 4 ? 'text-primary' : 'text-muted-foreground'}`}>{labels[score - 1] || ''}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? 'text-primary' : 'text-muted-foreground'}`}>
            <CheckCircle2 className={`w-3 h-3 ${c.ok ? 'opacity-100' : 'opacity-30'}`} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Register() {
  const [, navigate] = useLocation();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    countryCode: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const selectedCountry = COUNTRIES.find((c) => c.code === form.countryCode);
  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dialCode.includes(countrySearch),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.fullName || !form.email || !form.phone || !form.country || !form.password || !form.confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!form.acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    setLoading(true);
    try {
      const data: RegisterData = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        country: form.country,
        countryCode: form.countryCode,
        password: form.password,
      };
      await register(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[42%] bg-card border-r border-border flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,230,118,0.12),transparent_60%)]" />
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <img src={swiftPayLogo} alt="SwiftPay" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]" />
          <span className="text-xl font-bold">Swift<span className="text-primary">Pay</span></span>
        </Link>

        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            Rejoignez <span className="text-primary">SwiftPay</span><br />et envoyez de l'argent simplement
          </h2>
          <div className="space-y-3">
            {[
              { emoji: '💸', title: 'Montants illimités', desc: 'Envoyez autant que vous voulez' },
              { emoji: '📱', title: 'Bénéficiaires enregistrés', desc: 'Retrouvez vos contacts rapidement' },
              { emoji: '📊', title: 'Historique complet', desc: 'Suivez toutes vos transactions' },
              { emoji: '🔑', title: 'Accès API', desc: 'Intégrez SwiftPay à votre business' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 bg-secondary/40 rounded-xl px-4 py-3">
                <span className="text-lg mt-0.5">{item.emoji}</span>
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground relative z-10">© 2025 SwiftPay. Tous droits réservés.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-start justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md py-4"
        >
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <img src={swiftPayLogo} alt="SwiftPay" className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold">Swift<span className="text-primary">Pay</span></span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
            <p className="mt-1 text-muted-foreground text-sm">Inscription gratuite — prend moins de 2 minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                placeholder="Ali Koné"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                className="h-12"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ali@exemple.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="h-12"
                autoComplete="email"
              />
            </div>

            {/* Country selector */}
            <div className="space-y-2 relative">
              <Label>Pays de résidence</Label>
              <button
                type="button"
                onClick={() => setCountryOpen(!countryOpen)}
                className="w-full h-12 flex items-center gap-3 px-3 rounded-lg border border-input bg-background text-sm hover:bg-secondary transition-colors"
              >
                {selectedCountry ? (
                  <>
                    <span className="text-lg">{selectedCountry.flag}</span>
                    <span className="flex-1 text-left font-medium">{selectedCountry.name}</span>
                    <span className="text-muted-foreground text-xs">{selectedCountry.dialCode}</span>
                  </>
                ) : (
                  <span className="flex-1 text-left text-muted-foreground">Sélectionner un pays…</span>
                )}
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {countryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-2 border-b border-border">
                      <Input
                        placeholder="Rechercher un pays…"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="h-9 text-sm"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {filteredCountries.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            set('country', c.name);
                            set('countryCode', c.code);
                            setCountryOpen(false);
                            setCountrySearch('');
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors ${
                            form.countryCode === c.code ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                          }`}
                        >
                          <span className="text-base">{c.flag}</span>
                          <span className="flex-1 text-left">{c.name}</span>
                          <span className="text-muted-foreground text-xs">{c.dialCode}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <div className="flex gap-2">
                {selectedCountry && (
                  <div className="h-12 px-3 flex items-center gap-1.5 rounded-lg border border-input bg-secondary text-sm font-medium whitespace-nowrap flex-shrink-0">
                    <span>{selectedCountry.flag}</span>
                    <span className="text-muted-foreground">{selectedCountry.dialCode}</span>
                  </div>
                )}
                <Input
                  id="phone"
                  type="tel"
                  placeholder={selectedCountry ? '07 12 34 56' : '+225 07 12 34 56'}
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className="h-12 flex-1"
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  className="h-12 pr-12"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  className={`h-12 pr-12 ${form.confirmPassword && form.confirmPassword !== form.password ? 'border-destructive' : ''} ${form.confirmPassword && form.confirmPassword === form.password ? 'border-primary' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
              )}
              {form.confirmPassword && form.confirmPassword === form.password && (
                <p className="text-xs text-primary flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Les mots de passe correspondent</p>
              )}
            </div>

            {/* Terms */}
            <div
              onClick={() => set('acceptTerms', !form.acceptTerms)}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                form.acceptTerms ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-border/80 bg-secondary/30'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                form.acceptTerms ? 'bg-primary border-primary' : 'border-muted-foreground'
              }`}>
                {form.acceptTerms && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                J'accepte les{' '}
                <a href="#" onClick={(e) => e.stopPropagation()} className="text-primary font-semibold hover:underline">
                  Conditions d'utilisation
                </a>{' '}
                et la{' '}
                <a href="#" onClick={(e) => e.stopPropagation()} className="text-primary font-semibold hover:underline">
                  Politique de confidentialité
                </a>{' '}
                de SwiftPay.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all hover:shadow-[0_0_30px_rgba(0,230,118,0.5)] text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Création du compte…
                </span>
              ) : (
                <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Créer mon compte</span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link href="/connexion" className="text-primary font-semibold hover:underline">
              Se connecter
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-border">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors">
              ← Retour à l'accueil
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
