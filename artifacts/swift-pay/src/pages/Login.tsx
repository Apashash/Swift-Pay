import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Phone, Mail, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { COUNTRIES } from '@/lib/mock-data';
import swiftPayLogo from '@assets/swift-logo.png';

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const effectiveIdentifier =
      identifierType === 'phone'
        ? `${selectedCountry.dialCode}${phoneLocal.trim()}`
        : identifier;
    if (!effectiveIdentifier || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (identifierType === 'phone' && !phoneLocal.trim()) {
      setError('Veuillez entrer votre numéro de téléphone.');
      return;
    }
    setLoading(true);
    try {
      await login(effectiveIdentifier, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,230,118,0.12),transparent_60%)]" />
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <img src={swiftPayLogo} alt="marcswitch" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]" />
          <span className="text-xl font-bold">marcswitch</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold leading-tight text-foreground">
              Bienvenue<br />sur <span className="text-primary">marcswitch</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Le pont le plus rapide entre le monde crypto et le mobile money en Afrique de l'Ouest.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: '⚡', label: 'Confirmation en < 20 secondes' },
              { icon: '🔒', label: 'Chiffrement de bout en bout' },
              { icon: '🌍', label: '8 pays UEMOA supportés' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-secondary/50 rounded-xl px-4 py-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground relative z-10">© 2025 marcswitch. Tous droits réservés.</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <img src={swiftPayLogo} alt="marcswitch" className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold">marcswitch</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Connexion</h1>
            <p className="mt-1 text-muted-foreground text-sm">Accédez à votre tableau de bord</p>
          </div>

          {/* Identifier type toggle */}
          <div className="flex bg-secondary rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setIdentifierType('email'); setIdentifier(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                identifierType === 'email'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
            <button
              type="button"
              onClick={() => { setIdentifierType('phone'); setIdentifier(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                identifierType === 'phone'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Phone className="w-4 h-4" /> Téléphone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier">
                {identifierType === 'email' ? 'Adresse email' : 'Numéro de téléphone'}
              </Label>

              {identifierType === 'email' ? (
                <Input
                  id="identifier"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-12"
                  autoComplete="email"
                />
              ) : (
                <div className="flex gap-2">
                  {/* Country selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCountryOpen((o) => !o)}
                      className="flex items-center gap-1.5 h-12 px-3 rounded-md border border-input bg-background text-sm font-medium hover:bg-secondary transition-colors min-w-[90px]"
                    >
                      <span className="text-base">{selectedCountry.flag}</span>
                      <span className="text-muted-foreground">{selectedCountry.dialCode}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
                    </button>
                    {countryOpen && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-lg overflow-auto max-h-56 w-52">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => { setSelectedCountry(c); setCountryOpen(false); }}
                            className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-left hover:bg-secondary transition-colors ${
                              c.code === selectedCountry.code ? 'bg-secondary text-primary font-medium' : ''
                            }`}
                          >
                            <span className="text-base">{c.flag}</span>
                            <span className="flex-1 truncate">{c.name}</span>
                            <span className="text-muted-foreground text-xs">{c.dialCode}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Local number */}
                  <Input
                    id="identifier"
                    type="tel"
                    placeholder="07 12 34 56"
                    value={phoneLocal}
                    onChange={(e) => setPhoneLocal(e.target.value)}
                    className="h-12 flex-1"
                    autoComplete="tel-national"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <a href="#" className="text-xs text-primary hover:underline">Mot de passe oublié ?</a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
                  Connexion…
                </span>
              ) : (
                <span className="flex items-center gap-2"><LogIn className="w-4 h-4" /> Se connecter</span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="text-primary font-semibold hover:underline">
              S'inscrire gratuitement
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-border">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors">
              ← Retour à l'accueil
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
