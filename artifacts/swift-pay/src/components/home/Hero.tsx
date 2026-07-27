import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Search } from 'lucide-react';
import { SiBitcoin, SiTether, SiEthereum } from 'react-icons/si';
import { useTranslation } from '@/lib/i18n';
import { PaymentForm } from '@/components/home/PaymentForm';
import { useLocation } from 'wouter';

export function Hero() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  return (
    <section className="relative min-h-[95vh] pt-32 pb-20 overflow-hidden flex items-center">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[10%] opacity-10 text-foreground text-6xl pointer-events-none hidden lg:block"
      >
        <SiBitcoin />
      </motion.div>
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[30%] left-[45%] opacity-10 text-primary text-5xl pointer-events-none hidden lg:block"
      >
        <SiTether />
      </motion.div>
      <motion.div
        animate={{ y: [0, -25, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[15%] right-[35%] opacity-10 text-foreground text-7xl pointer-events-none hidden lg:block"
      >
        <SiEthereum />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">

          {/* Left Content */}
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-5xl font-bold tracking-normal leading-[1.2] mb-6"
            >
              <span className="text-foreground block">{t('hero_line1')}</span>
              <span className="text-primary block drop-shadow-[0_0_25px_rgba(0,230,118,0.3)]">{t('hero_line2')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-10 max-w-xl"
            >
              {t('hero_desc')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-start gap-3 mb-6"
            >
              {/* Ligne 1 : CTA + En savoir plus */}
              <div className="flex items-center gap-3">
                <Button size="lg" onClick={() => navigate('/connexion')} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 px-7 text-base rounded-xl shadow-[0_0_30px_rgba(0,230,118,0.3)] transition-all hover:shadow-[0_0_50px_rgba(0,230,118,0.5)]">
                  {t('hero_cta')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <button
                  onClick={() => navigate('/inscription')}
                  className="inline-flex items-center gap-1.5 h-12 px-6 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'linear-gradient(135deg,#9ca3af,#6b7280)', color: '#fff', boxShadow: '0 2px 12px rgba(156,163,175,0.25)' }}
                >
                  {t('hero_learn')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </motion.div>

          </div>

          {/* Right — Interactive Payment Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative lg:ml-auto w-full max-w-md min-w-0 overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            {/* Vérifier transaction — au-dessus du formulaire */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mb-3 flex justify-end overflow-hidden"
            >
              <button
                onClick={() => navigate('/verifier')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all max-w-full truncate"
              >
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Vérifier ma transaction</span>
              </button>
            </motion.div>
            <div className="relative">
              <PaymentForm />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
