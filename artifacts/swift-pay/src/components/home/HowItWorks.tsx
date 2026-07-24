import { motion } from 'framer-motion';
import { Smartphone, Calculator, QrCode, Link2, Repeat, Zap, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    { icon: Smartphone, title: t('hiw_step1_title'), desc: t('hiw_step1_desc') },
    { icon: Calculator, title: t('hiw_step2_title'), desc: t('hiw_step2_desc') },
    { icon: QrCode,     title: t('hiw_step3_title'), desc: t('hiw_step3_desc') },
    { icon: Link2,      title: t('hiw_step4_title'), desc: t('hiw_step4_desc') },
    { icon: Repeat,     title: t('hiw_step5_title'), desc: t('hiw_step5_desc') },
    { icon: Zap,        title: t('hiw_step6_title'), desc: t('hiw_step6_desc') },
    { icon: CheckCircle,title: t('hiw_step7_title'), desc: t('hiw_step7_desc') },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-black/50 border-y border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            {t('hiw_title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('hiw_subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex gap-6 pb-12"
              >
                {!isLast && (
                  <div className="absolute left-[27px] top-[50px] bottom-[-10px] w-px bg-gradient-to-b from-primary/50 to-transparent" />
                )}
                <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <step.icon className={`w-6 h-6 ${index === 4 || index === 5 ? 'text-primary' : 'text-white'}`} />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-black text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
