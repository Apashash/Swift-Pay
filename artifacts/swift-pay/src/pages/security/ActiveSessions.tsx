import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, ChevronLeft, LogOut, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `Il y a ${d} jour${d > 1 ? 's' : ''}`;
}

export default function ActiveSessions() {
  const [, navigate] = useLocation();
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    apiFetch<{ sessions: Session[] }>('/auth/sessions')
      .then((data) => setSessions(data.sessions))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const revoke = async (id: string) => {
    setRevoking(id);
    try {
      await apiFetch(`/auth/sessions/${id}`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRevoking(null);
    }
  };

  const revokeAll = async () => {
    setRevokingAll(true);
    try {
      const others = sessions.filter((s) => !s.isCurrent);
      await Promise.all(others.map((s) => apiFetch(`/auth/sessions/${s.id}`, { method: 'DELETE' })));
      setSessions((prev) => prev.filter((s) => s.isCurrent));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRevokingAll(false);
    }
  };

  const otherSessions = sessions.filter((s) => !s.isCurrent);
  const currentSession = sessions.find((s) => s.isCurrent);

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
            <h1 className="text-lg font-bold text-foreground">Sessions actives</h1>
            <p className="text-xs text-muted-foreground">Gérez les appareils connectés à votre compte</p>
          </div>
        </motion.div>

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

        {/* Loading */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm"
          >
            <Loader2 className="w-5 h-5 animate-spin" /> Chargement des sessions…
          </motion.div>
        ) : (
          <>
            {/* Current session */}
            {currentSession && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.06 }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Session actuelle</h3>
                </div>
                <div className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Monitor className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">Cet appareil</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Connecté {timeAgo(currentSession.createdAt)} · Expire le {new Date(currentSession.expiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium shrink-0">
                    Actif
                  </span>
                </div>
              </motion.div>
            )}

            {/* Other sessions */}
            {otherSessions.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Autres appareils ({otherSessions.length})
                  </h3>
                  <button
                    onClick={revokeAll}
                    disabled={revokingAll}
                    className="text-xs text-destructive hover:underline font-medium disabled:opacity-50"
                  >
                    {revokingAll ? 'Révocation…' : 'Tout révoquer'}
                  </button>
                </div>
                <AnimatePresence>
                  {otherSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      layout
                      initial={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0"
                    >
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                        <Monitor className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">Autre appareil</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Connecté {timeAgo(session.createdAt)}
                        </div>
                      </div>
                      <button
                        onClick={() => revoke(session.id)}
                        disabled={revoking === session.id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 shrink-0"
                        title="Révoquer cette session"
                      >
                        {revoking === session.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <LogOut className="w-4 h-4" />
                        }
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-card border border-border rounded-2xl p-8 text-center"
              >
                <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-3" />
                <div className="text-sm font-semibold text-foreground">Un seul appareil connecté</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Votre compte est uniquement accessible depuis cet appareil.
                </p>
              </motion.div>
            )}

            {/* Logout all */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.16 }}
              className="bg-card border border-border rounded-2xl p-6 space-y-3"
            >
              <h3 className="text-sm font-semibold text-foreground">Zone de danger</h3>
              <p className="text-xs text-muted-foreground">
                Cette action vous déconnecte de tous les appareils, y compris celui-ci.
              </p>
              <Button
                variant="outline"
                onClick={() => { logout(); navigate('/'); }}
                className="w-full h-11 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 gap-2"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter de tous les appareils
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
