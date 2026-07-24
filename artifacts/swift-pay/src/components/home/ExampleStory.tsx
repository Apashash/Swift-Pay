import { motion } from 'framer-motion';
import { SiTether } from 'react-icons/si';
import { useTranslation } from '@/lib/i18n';

export function ExampleStory() {
  const { t } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:30px_30px]" />

          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                {t('ex_badge')}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                {t('ex_title')}
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                {t('ex_desc')}
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mt-1 flex-shrink-0">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{t('ex_step1_title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('ex_step1_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mt-1 flex-shrink-0">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{t('ex_step2_title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('ex_step2_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1 flex-shrink-0 text-primary">
                    <span className="text-primary text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{t('ex_step3_title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('ex_step3_desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-[#111111] border border-white/10 rounded-2xl p-6 max-w-sm mx-auto shadow-2xl"
              >
                <div className="text-center border-b border-white/10 pb-6 mb-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <SiTether size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{t('ex_receipt_title')}</h3>
                  <p className="text-primary font-mono font-medium">≈ 19.4 seconds</p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('ex_sent')}</span>
                    <span className="text-white font-mono">46.25 USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('ex_rate')}</span>
                    <span className="text-white font-mono">1 USDT = 648.6 FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('ex_fee')}</span>
                    <span className="text-white font-mono">0.46 USDT</span>
                  </div>
                  <div className="h-px bg-white/10 w-full my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">{t('ex_delivered')}</span>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary font-mono">30 000 FCFA</div>
                      <div className="text-xs text-muted-foreground">Orange Money CI</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-black border border-white/5 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-muted-foreground font-mono">TxHash: 0x8f...4b2a</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
