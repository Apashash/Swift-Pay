import { motion } from 'framer-motion';
import { User, UserX, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UsageModes() {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Frictionless when you want it.<br/>
            Powerful when you need it.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Without Account */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-colors"
          >
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <UserX className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Guest Checkout</h3>
            <p className="text-muted-foreground mb-8">
              Perfect for one-off quick transfers. No registration, no identity verification required.
            </p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-white">
                <Check className="w-4 h-4 text-primary" /> Up to 50,000 FCFA per transaction
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <Check className="w-4 h-4 text-primary" /> Zero sign-up process
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <Check className="w-4 h-4 text-primary" /> Pay instantly via QR code
              </li>
            </ul>
            
            <Button variant="outline" className="w-full h-12 border-white/10 text-white hover:bg-white/5">
              Send money now
            </Button>
          </motion.div>

          {/* With Account */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#111111] border border-primary/30 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none rounded-full" />
            
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Verified Account</h3>
            <p className="text-muted-foreground mb-8">
              For regular users and businesses. Unlock the full power of SwiftPay.
            </p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-white">
                <Check className="w-4 h-4 text-primary" /> Unlimited transaction amounts
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <Check className="w-4 h-4 text-primary" /> Save beneficiary numbers
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <Check className="w-4 h-4 text-primary" /> Full transaction history & exports
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <Check className="w-4 h-4 text-primary" /> Access to Merchant API
              </li>
            </ul>
            
            <Button className="w-full h-12 bg-primary text-black hover:bg-primary/90 font-semibold shadow-[0_0_15px_rgba(0,230,118,0.2)]">
              Create an account
            </Button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
