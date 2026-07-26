import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Shield, Bell,
  ChevronRight, CheckCircle2, AlertCircle, Edit2, Save, X, LogOut, Camera, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

interface Stats {
  totalSent: number;
  totalCount: number;
  pendingCount: number;
  countriesCount: number;
}

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [, navigate] = useLocation();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' });
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    setLoadingStats(true);
    apiFetch<Stats>('/transactions/stats')
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateUser({ avatar: dataUrl });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSave = () => {
    updateUser({ fullName: form.fullName, email: form.email, phone: form.phone });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleEdit = () => {
    setForm({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' });
    setEditing(true);
  };

  const initials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'SP';

  const fmt = (n: number) => n.toLocaleString('fr-FR');

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
        {/* Avatar + stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden bg-card border border-border rounded-2xl p-6"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,230,118,0.08),transparent_60%)]" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
            <button
              onClick={handleAvatarClick}
              className="relative w-20 h-20 rounded-full flex-shrink-0 group focus:outline-none"
              aria-label="Changer la photo de profil"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Photo de profil" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground">{user?.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                  user?.verified
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                }`}>
                  {user?.verified ? '✓ KYC Vérifié' : '⚡ Basic'}
                </span>
                <span className="text-xs text-muted-foreground px-2.5 py-1 rounded-full border border-border bg-secondary">
                  Membre depuis {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '–'}
                </span>
              </div>
            </div>
          </div>

          {/* Real stats */}
          <div className="relative z-10 grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
            {loadingStats ? (
              <div className="col-span-3 flex items-center justify-center gap-2 py-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
              </div>
            ) : (
              [
                { label: 'Transactions', value: stats?.totalCount ?? 0 },
                { label: 'Total envoyé', value: stats ? `${Math.round(stats.totalSent / 1000)}k FCFA` : '0 FCFA' },
                { label: 'Pays', value: stats?.countriesCount ?? 0 },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-lg font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Verification banner */}
        {!user?.verified && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 }}
            className="flex items-start gap-3 bg-orange-500/5 border border-orange-500/20 rounded-2xl p-5"
          >
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Vérifiez votre identité (KYC)</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Débloquez les montants illimités, l'accès API et toutes les fonctionnalités avancées.
              </p>
            </div>
            <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-600 shrink-0 text-xs font-semibold">
              Vérifier
            </Button>
          </motion.div>
        )}

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-xl px-4 py-3 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4" /> Profil mis à jour avec succès
          </motion.div>
        )}

        {/* Personal info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Informations personnelles</h3>
            {!editing ? (
              <button onClick={handleEdit} className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                <Edit2 className="w-3.5 h-3.5" /> Modifier
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" /> Annuler
                </button>
                <button onClick={handleSave} className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                  <Save className="w-3.5 h-3.5" /> Sauvegarder
                </button>
              </div>
            )}
          </div>

          <div className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs">
                  <User className="w-3.5 h-3.5 text-muted-foreground" /> Nom complet
                </Label>
                {editing ? (
                  <Input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} className="h-11" />
                ) : (
                  <div className="h-11 px-3 flex items-center bg-secondary/40 rounded-lg text-sm font-medium text-foreground">{user?.fullName}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
                </Label>
                {editing ? (
                  <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="h-11" />
                ) : (
                  <div className="h-11 px-3 flex items-center bg-secondary/40 rounded-lg text-sm text-foreground">{user?.email}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Téléphone
                </Label>
                {editing ? (
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+237 6XX XX XX XX"
                    className="h-11"
                  />
                ) : (
                  <div className="h-11 px-3 flex items-center bg-secondary/40 rounded-lg text-sm text-foreground">{user?.phone || '–'}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Pays
                </Label>
                <div className="h-11 px-3 flex items-center bg-secondary/40 rounded-lg text-sm text-foreground">{user?.country || '–'}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings */}
        {[
          {
            title: 'Sécurité',
            icon: Shield,
            items: [
              { label: 'Changer le mot de passe', desc: 'Dernière modification il y a 30 jours' },
              { label: 'Authentification à deux facteurs', desc: 'Désactivée — recommandée' },
              { label: 'Sessions actives', desc: '1 appareil connecté' },
            ],
          },
          {
            title: 'Notifications',
            icon: Bell,
            items: [
              { label: 'Notifications par email', desc: 'Transactions et alertes de sécurité' },
              { label: 'SMS de confirmation', desc: 'Pour chaque transaction envoyée' },
              { label: 'Alertes de taux', desc: 'Lorsque le taux USDT/FCFA change de ±2%' },
            ],
          },
        ].map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.14 + si * 0.06 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
              <section.icon className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
            </div>
            <div className="divide-y divide-border">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-secondary/40 transition-colors group text-left"
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.28 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-3"
        >
          <h3 className="text-sm font-semibold text-foreground">Compte</h3>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full h-11 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 gap-2"
          >
            <LogOut className="w-4 h-4" /> Se déconnecter
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
