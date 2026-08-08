import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, CheckCircle2, AlertCircle, ChevronLeft,
  User, Mail, Phone, FileText, Camera, Loader2, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

type UploadSlot = 'front' | 'back' | 'selfie';

const SLOTS: { key: UploadSlot; label: string; sublabel: string; icon: React.ReactNode }[] = [
  {
    key: 'front',
    label: 'Recto de la pièce',
    sublabel: "Photo claire du recto de votre CNI, passeport ou permis",
    icon: <FileText className="w-6 h-6" />,
  },
  {
    key: 'back',
    label: 'Verso de la pièce',
    sublabel: "Photo claire du verso de votre pièce d'identité",
    icon: <FileText className="w-6 h-6" />,
  },
  {
    key: 'selfie',
    label: 'Selfie avec la pièce',
    sublabel: "Tenez votre pièce à côté de votre visage et prenez une photo",
    icon: <Camera className="w-6 h-6" />,
  },
];

function PhotoUploader({
  slot,
  value,
  onChange,
}: {
  slot: typeof SLOTS[0];
  value: string | null;
  onChange: (data: string) => void;
}) {
  const [dragging, setDragging] = useState(false);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) readFile(file);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
        {slot.icon}
        {slot.label}
      </Label>
      <p className="text-xs text-muted-foreground -mt-1">{slot.sublabel}</p>

      <label
        htmlFor={`photo-${slot.key}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden
          ${dragging ? 'border-primary bg-primary/5' : value ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-secondary/40'}
        `}
        style={{ minHeight: '160px' }}
      >
        <input
          id={`photo-${slot.key}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
        {value ? (
          <>
            <img
              src={value}
              alt={slot.label}
              className="w-full h-full object-cover"
              style={{ maxHeight: '200px', objectFit: 'cover' }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium bg-black/60 px-3 py-1 rounded-full">Changer la photo</span>
            </div>
            <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm text-muted-foreground">
              Cliquez ou glissez une image ici
            </p>
            <p className="text-xs text-muted-foreground/60">JPG, PNG, WEBP — max 5 Mo</p>
          </div>
        )}
      </label>
    </div>
  );
}

export default function KYCVerification() {
  const { user, updateUser } = useAuth();
  const [, navigate] = useLocation();

  const [photos, setPhotos] = useState<Record<UploadSlot, string | null>>({
    front: null,
    back: null,
    selfie: null,
  });
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const allPhotos = photos.front && photos.back && photos.selfie;
  const canSubmit = allPhotos && description.trim().length >= 20;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/auth/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontPhoto: photos.front,
          backPhoto: photos.back,
          selfiePhoto: photos.selfie,
          description: description.trim(),
        }),
      });
      setSuccess(true);
      // Refresh user data to reflect pending status
      updateUser({ verified: false });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-xl font-bold text-foreground">Dossier soumis !</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Votre dossier KYC est en cours de vérification. Vous recevrez une notification sous 24–48 h.
            </p>
          </motion.div>
          <Button onClick={() => navigate('/profil')} className="gap-2 mt-2">
            <ChevronLeft className="w-4 h-4" /> Retour au profil
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate('/profil')}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-border hover:bg-secondary/60 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Vérification d'identité</h1>
            <p className="text-xs text-muted-foreground">KYC — Complétez les 4 étapes ci-dessous</p>
          </div>
        </motion.div>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04 }}
          className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-4"
        >
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Vos données sont sécurisées</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vos documents sont chiffrés et utilisés uniquement pour valider votre identité. Ils ne sont jamais partagés.
            </p>
          </div>
        </motion.div>

        {/* Step 1 — Identity pre-filled */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-secondary/20">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">1</span>
            <h3 className="text-sm font-semibold text-foreground">Informations personnelles</h3>
          </div>
          <div className="p-6 grid sm:grid-cols-3 gap-4">
            {[
              { icon: User, label: 'Nom complet', value: user?.fullName },
              { icon: Mail, label: 'Email', value: user?.email },
              { icon: Phone, label: 'Téléphone', value: user?.phone || '–' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </Label>
                <div className="h-10 px-3 flex items-center bg-secondary/40 rounded-lg text-sm font-medium text-foreground truncate">
                  {value}
                </div>
              </div>
            ))}
          </div>
          <p className="px-6 pb-4 text-xs text-muted-foreground -mt-2">
            Ces informations proviennent de votre compte. Pour les modifier, allez dans &quot;Informations personnelles&quot; depuis votre profil.
          </p>
        </motion.div>

        {/* Step 2 — Photos */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-secondary/20">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">2</span>
            <h3 className="text-sm font-semibold text-foreground">Photos de la pièce d'identité</h3>
          </div>
          <div className="p-6 grid sm:grid-cols-3 gap-5">
            {SLOTS.map((slot) => (
              <PhotoUploader
                key={slot.key}
                slot={slot}
                value={photos[slot.key]}
                onChange={(data) => setPhotos((p) => ({ ...p, [slot.key]: data }))}
              />
            ))}
          </div>
        </motion.div>

        {/* Step 3 — Description */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-secondary/20">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">3</span>
            <h3 className="text-sm font-semibold text-foreground">Utilisation prévue de marcswitch</h3>
          </div>
          <div className="p-6 space-y-2">
            <Label className="text-xs text-muted-foreground">
              Décrivez brièvement ce que vous comptez faire avec marcswitch (transferts familiaux, commerce, freelance…)
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex : J'utilise marcswitch pour envoyer de l'argent à ma famille au Cameroun depuis la France. Je fais des transferts réguliers de 100 000 à 500 000 FCFA par mois..."
              className="min-h-[120px] resize-none text-sm"
            />
            <p className={`text-xs text-right transition-colors ${description.trim().length < 20 ? 'text-muted-foreground' : 'text-primary'}`}>
              {description.trim().length} / 20 caractères minimum
            </p>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="pb-4"
        >
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="w-full h-12 text-sm font-semibold gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours…</>
            ) : (
              <><Shield className="w-4 h-4" /> Soumettre mon dossier KYC</>
            )}
          </Button>
          {!canSubmit && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              {!allPhotos ? 'Ajoutez les 3 photos requises' : 'Description trop courte (20 caractères minimum)'}
            </p>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
