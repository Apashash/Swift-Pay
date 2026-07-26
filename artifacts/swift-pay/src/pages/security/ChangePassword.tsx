import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function ChangePassword() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.next.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (form.next !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/auth/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      });
      setSuccess(true);
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.next;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 2) return { label: 'Faible', color: 'bg-red-500', width: 'w-1/4' };
    if (score <= 3) return { label: 'Moyen', color: 'bg-orange-400', width: 'w-2/4' };
    if (score === 4) return { label: 'Fort', color: 'bg-primary', width: 'w-3/4' };
    return { label: 'Très fort', color: 'bg-primary', width: 'w-full' };
  })();

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
            <h1 className="text-lg font-bold text-foreground">Changer le mot de passe</h1>
            <p className="text-xs text-muted-foreground">Mettez à jour votre mot de passe</p>
          </div>
        </motion.div>

        {/* Success */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-5 py-4"
          >
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            <div>
              <div className="text-sm font-semibold text-foreground">Mot de passe modifié !</div>
              <div className="text-xs text-muted-foreground mt-0.5">Votre mot de passe a été mis à jour avec succès.</div>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-destructive/5 border border-destructive/20 rounded-2xl px-5 py-4"
          >
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Sécurité du compte</h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Current password */}
            <div className="space-y-2">
              <Label className="text-xs">Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? 'text' : 'password'}
                  value={form.current}
                  onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-2">
              <Label className="text-xs">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  type={showNext ? 'text' : 'password'}
                  value={form.next}
                  onChange={(e) => setForm((p) => ({ ...p, next: e.target.value }))}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNext((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {strength && (
                <div className="space-y-1.5">
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} rounded-full transition-all duration-300`} />
                  </div>
                  <p className="text-xs text-muted-foreground">Force : <span className="font-medium text-foreground">{strength.label}</span></p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label className="text-xs">Confirmer le nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                  placeholder="••••••••"
                  className={`h-11 pr-10 ${form.confirm && form.next !== form.confirm ? 'border-destructive/50' : ''}`}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.confirm && form.next !== form.confirm && (
                <p className="text-xs text-destructive">Les mots de passe ne correspondent pas.</p>
              )}
            </div>

            <div className="pt-1">
              <Button
                type="submit"
                disabled={loading || !form.current || !form.next || !form.confirm}
                className="w-full h-11 font-semibold"
              >
                {loading ? 'Modification…' : 'Mettre à jour le mot de passe'}
              </Button>
            </div>
          </div>
        </motion.form>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="bg-card border border-border rounded-2xl p-5 space-y-3"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Conseils de sécurité</h3>
          <ul className="space-y-2">
            {[
              'Minimum 8 caractères',
              'Mélangez lettres majuscules, minuscules et chiffres',
              'Ajoutez un symbole (!, @, #…) pour plus de sécurité',
              'N\'utilisez pas le même mot de passe ailleurs',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-primary mt-0.5">•</span> {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
