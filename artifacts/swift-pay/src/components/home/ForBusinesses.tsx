import { motion } from 'framer-motion';
import { Terminal, Code, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export function ForBusinesses() {
  const { t } = useTranslation();

  return (
    <section id="business" className="py-24 bg-black relative">
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] max-w-6xl mx-auto"
        >
          <div className="grid lg:grid-cols-2">

            <div className="p-10 md:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-muted-foreground text-sm font-medium mb-6 w-fit">
                <Terminal className="w-4 h-4 text-white" />
                {t('fb_badge')}
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                {t('fb_title').split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </h2>

              <p className="text-muted-foreground text-lg mb-8">
                {t('fb_desc')}
              </p>

              <ul className="space-y-3 mb-10">
                <li className="flex items-center gap-3 text-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {t('fb_feat1')}
                </li>
                <li className="flex items-center gap-3 text-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {t('fb_feat2')}
                </li>
                <li className="flex items-center gap-3 text-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {t('fb_feat3')}
                </li>
              </ul>

              <div className="flex items-center gap-4">
                <Button className="bg-white text-black hover:bg-gray-200 font-semibold px-6">
                  {t('fb_cta1')}
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/5">
                  {t('fb_cta2')} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-[#111111] p-8 lg:p-12 border-l border-white/5 flex items-center">
              <div className="w-full bg-[#050505] border border-white/10 rounded-xl overflow-hidden font-mono text-sm shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs text-muted-foreground flex items-center gap-2"><Code className="w-3 h-3" /> create-payment.ts</span>
                </div>
                <div className="p-4 md:p-6 overflow-x-auto text-muted-foreground">
                  <pre>
<span className="text-[#c678dd]">const</span> response = <span className="text-[#c678dd]">await</span> <span className="text-[#61afef]">fetch</span>(<span className="text-[#98c379]">'https://api.swiftpay.africa/v1/checkout'</span>, {'{'}
  method: <span className="text-[#98c379]">'POST'</span>,
  headers: {'{'}
    <span className="text-[#98c379]">'Authorization'</span>: <span className="text-[#98c379]">'Bearer sp_live_...'</span>,
    <span className="text-[#98c379]">'Content-Type'</span>: <span className="text-[#98c379]">'application/json'</span>
  {'}'},
  body: <span className="text-[#e5c07b]">JSON</span>.<span className="text-[#56b6c2]">stringify</span>({'{'}
    amount: <span className="text-[#d19a66]">50000</span>,
    currency: <span className="text-[#98c379]">'XOF'</span>,
    payout_method: <span className="text-[#98c379]">'MOBILE_MONEY'</span>,
    operator: <span className="text-[#98c379]">'ORANGE_CI'</span>,
    recipient_number: <span className="text-[#98c379]">'+2250700000000'</span>,
    webhook_url: <span className="text-[#98c379]">'https://store.com/webhook'</span>
  {'}'})
{'}'});

<span className="text-[#c678dd]">const</span> session = <span className="text-[#c678dd]">await</span> response.<span className="text-[#61afef]">json</span>();
<span className="text-[#5c6370]">// Returns checkout URL and crypto quote</span>
                  </pre>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
