import { motion } from 'framer-motion';
import { SiBitcoin, SiEthereum, SiTether } from 'react-icons/si';
import { useTranslation } from '@/lib/i18n';

const operators = [
  { name: 'Orange Money', color: '#FF7900' },
  { name: 'MTN MoMo',    color: '#FFCC00' },
  { name: 'Wave',        color: '#00B1FF' },
  { name: 'Moov Money',  color: '#0055A5' },
];

const countries = [
  { flag: '🇨🇮', name: "Côte d'Ivoire" },
  { flag: '🇸🇳', name: 'Senegal' },
  { flag: '🇧🇯', name: 'Benin' },
  { flag: '🇹🇬', name: 'Togo' },
  { flag: '🇧🇫', name: 'Burkina Faso' },
  { flag: '🇲🇱', name: 'Mali' },
];

export function SupportedNetworks() {
  const { t } = useTranslation();

  return (
    <section id="networks" className="py-24 bg-black/50 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              {t('sn_title').split('\n').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              {t('sn_desc')}
            </p>

            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-medium text-white uppercase tracking-wider mb-4">{t('sn_crypto')}</h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-[#111111] border border-white/10 rounded-full px-4 py-2">
                    <SiTether className="text-[#26A17B]" /> <span className="text-white text-sm font-medium">USDT (BEP-20, TRC-20)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#111111] border border-white/10 rounded-full px-4 py-2">
                    <SiBitcoin className="text-[#F7931A]" /> <span className="text-white text-sm font-medium">Bitcoin Lightning</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#111111] border border-white/10 rounded-full px-4 py-2">
                    <SiEthereum className="text-[#627EEA]" /> <span className="text-white text-sm font-medium">ETH (Arbitrum)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-white uppercase tracking-wider mb-4">{t('sn_countries')}</h4>
                <div className="flex flex-wrap gap-3">
                  {countries.map(c => (
                    <div key={c.name} className="flex items-center gap-2 bg-[#111111] border border-white/10 rounded-full px-3 py-1.5 opacity-70 hover:opacity-100 transition-opacity cursor-default">
                      <span>{c.flag}</span> <span className="text-sm text-white">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {operators.map((op, i) => (
              <motion.div
                key={op.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-colors aspect-square"
              >
                <div className="w-16 h-16 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-3xl font-bold" style={{ color: op.color }}>
                  {op.name.charAt(0)}
                </div>
                <span className="text-white font-medium">{op.name}</span>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
