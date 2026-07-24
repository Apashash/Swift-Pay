import { motion } from 'framer-motion';
import { User, UserX, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export function UsageModes() {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            {t('um_title').split('\n').map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Without Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-3xl p-8 hover:border-border/80 transition-colors"
          >
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-6">
              <UserX className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{t('um_guest_title')}</h3>
            <p className="text-muted-foreground mb-8">{t('um_guest_desc')}</p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary" /> {t('um_guest_feat1')}
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary" /> {t('um_guest_feat2')}
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary" /> {t('um_guest_feat3')}
              </li>
            </ul>

            <Button variant="outline" className="w-full h-12 border-border text-foreground hover:bg-secondary">
              {t('um_guest_cta')}
            </Button>
          </motion.div>

          {/* With Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-primary/30 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none rounded-full" />

            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{t('um_verified_title')}</h3>
            <p className="text-muted-foreground mb-8">{t('um_verified_desc')}</p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary" /> {t('um_verified_feat1')}
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary" /> {t('um_verified_feat2')}
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary" /> {t('um_verified_feat3')}
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary" /> {t('um_verified_feat4')}
              </li>
            </ul>

            <Button className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_15px_rgba(0,230,118,0.2)]">
              {t('um_verified_cta')}
            </Button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
