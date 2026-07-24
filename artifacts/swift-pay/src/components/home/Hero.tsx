import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SiBitcoin, SiTether, SiEthereum } from 'react-icons/si';
import { useTranslation } from '@/lib/i18n';

export function Hero() {
  const { t } = useTranslation();

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
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1] mb-6"
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
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12"
            >
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-14 px-8 text-lg rounded-xl shadow-[0_0_30px_rgba(0,230,118,0.3)] transition-all hover:shadow-[0_0_50px_rgba(0,230,118,0.5)]">
                {t('hero_cta')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="ghost" className="h-14 px-8 text-lg rounded-xl hover:bg-secondary text-foreground">
                {t('hero_learn')}
              </Button>
            </motion.div>

          </div>

          {/* Right Mockup Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ perspective: 1000 }}
            className="relative lg:ml-auto w-full max-w-md"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-semibold text-foreground text-lg">{t('form_title')}</h3>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('form_destination')}</label>
                  <div className="w-full bg-secondary border border-border rounded-xl p-3.5 flex items-center gap-3 cursor-default">
                    <span className="text-xl">🇨🇮</span>
                    <span className="text-foreground text-sm font-medium">Côte d'Ivoire</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('form_network')}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Orange', 'MTN', 'Wave', 'Moov'].map((op, i) => (
                      <div key={op} className={`text-center py-2 rounded-lg border text-xs font-medium transition-colors cursor-default ${i === 0 ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary border-border text-muted-foreground hover:bg-muted'}`}>
                        {op}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('form_amount')}</label>
                  <div className="relative">
                    <input
                      type="text"
                      value="50 000"
                      readOnly
                      className="w-full bg-secondary border border-border rounded-xl p-4 pr-16 text-2xl font-mono text-foreground focus:outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      FCFA
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('form_payWith')}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/10 border border-primary/50 rounded-xl p-3 flex items-center gap-3 cursor-default">
                      <div className="w-8 h-8 rounded-full bg-[#26A17B]/20 flex items-center justify-center text-[#26A17B]">
                        <SiTether size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">USDT</div>
                        <div className="text-[10px] text-muted-foreground">BEP-20</div>
                      </div>
                    </div>
                    <div className="bg-secondary border border-border rounded-xl p-3 flex items-center gap-3 opacity-50 cursor-default">
                      <div className="w-8 h-8 rounded-full bg-[#F7931A]/20 flex items-center justify-center text-[#F7931A]">
                        <SiBitcoin size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">BTC</div>
                        <div className="text-[10px] text-muted-foreground">Lightning</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('form_youPay')}</span>
                    <span className="text-foreground font-mono">77.50 USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('form_fee')}</span>
                    <span className="text-foreground font-mono">0.78 USDT</span>
                  </div>
                </div>

                <Button className="w-full h-14 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg shadow-[0_0_20px_rgba(0,230,118,0.2)]">
                  {t('form_generate')} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  {t('form_secure')}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
