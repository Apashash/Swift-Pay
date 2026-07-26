import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronLeft, Smartphone, Key, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocation } from 'wouter';

const steps = [
  {
    icon: Smartphone,
    title: "Téléchargez une application d'authentification",
    desc: 'Google Authenticator, Authy, ou tout autre application compatible TOTP.',
  },
  {
    icon: Key,
    title: 'Scannez le QR code',
    desc: "Ouvrez l'application et scannez le QR code qui s'affichera.",
  },
  {
    icon: ShieldCheck,
    title: 'Saisissez le code de vérification',
    desc: "Entrez le code à 6 chiffres généré par l'application pour activer la 2FA.",
  },
];

export default function TwoFactor() {
  const [, navigate] = useLocation();
  const [requested, setRequested] = useState(false);

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
            <h1 className="text-lg font-bold text-foreground">Authentification à deux facteurs</h1>
            <p className="text-xs text-muted-foreground">Renforcez la sécurité de votre compte</p>
          </div>
        </motion.div>

        {/* Status card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Statut : Désactivée</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 font-medium">Non activée</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                La 2FA ajoute une couche de protection supplémentaire à votre compte.
              </p>
            </div>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Comment ça fonctionne</h3>
          </div>
          <div className="p-6 space-y-5">
            {steps.map((step, i) => (
              <div key={step.title} className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-sm font-medium text-foreground">{step.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-4"
        >
          {requested ? (
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <div>
                <div className="text-sm font-semibold text-foreground">Demande enregistrée</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  La configuration 2FA sera disponible très prochainement. Vous serez notifié par email.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Activer la 2FA</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  La configuration complète par QR code est en cours de déploiement.
                  Cliquez pour être notifié dès qu'elle sera disponible.
                </p>
              </div>
              <Button
                className="w-full h-11 font-semibold gap-2"
                onClick={() => setRequested(true)}
              >
                <ShieldCheck className="w-4 h-4" />
                M'avertir quand disponible
              </Button>
            </>
          )}
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-5 space-y-3"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pourquoi activer la 2FA ?</h3>
          <ul className="space-y-2">
            {[
              'Protège votre compte même si votre mot de passe est compromis',
              'Bloque les connexions non autorisées depuis de nouveaux appareils',
              'Obligatoire pour les comptes envoyant plus de 500 000 FCFA/mois',
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> {benefit}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
