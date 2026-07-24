import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import swiftPayLogo from "@assets/0e799f8d-f01e-4a08-aadb-5bf05adc5222_1784919743862.jpeg";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src={swiftPayLogo} 
            alt="SwiftPay Logo" 
            className="w-10 h-10 rounded shadow-[0_0_15px_rgba(0,230,118,0.3)] transition-all group-hover:shadow-[0_0_25px_rgba(0,230,118,0.5)]" 
          />
          <span className="text-xl font-bold tracking-tight text-white">
            Swift<span className="text-primary">Pay</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#networks" className="hover:text-white transition-colors">Supported networks</a>
          <a href="#business" className="hover:text-white transition-colors">For businesses</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground hover:text-white hover:bg-white/5">
            Sign In
          </Button>
          <Button className="bg-primary text-black hover:bg-primary/90 font-semibold shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-all hover:shadow-[0_0_30px_rgba(0,230,118,0.6)]">
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
