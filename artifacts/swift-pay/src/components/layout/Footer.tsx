import { Link } from 'wouter';
import swiftPayLogo from "@assets/0e799f8d-f01e-4a08-aadb-5bf05adc5222_1784919743862.jpeg";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black py-16 relative overflow-hidden">
      {/* Subtle glow in background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <img src={swiftPayLogo} alt="SwiftPay Logo" className="w-8 h-8 rounded" />
              <span className="text-xl font-bold tracking-tight text-white">
                Swift<span className="text-primary">Pay</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-[250px]">
              The fastest bridge between the crypto world and West African mobile money. Payments. Simplified.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">How it works</a></li>
              <li><a href="#networks" className="hover:text-primary transition-colors">Supported networks</a></li>
              <li><a href="#business" className="hover:text-primary transition-colors">Business API</a></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Compliance & KYC</Link></li>
            </ul>
          </div>
          
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © 2025 SwiftPay. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
