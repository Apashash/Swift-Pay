import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ExampleStory } from '@/components/home/ExampleStory';
import { UsageModes } from '@/components/home/UsageModes';
import { SupportedNetworks } from '@/components/home/SupportedNetworks';
import { ForBusinesses } from '@/components/home/ForBusinesses';

export default function Home() {
  return (
    <div className="bg-background min-h-screen selection:bg-primary/30 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <ExampleStory />
        <UsageModes />
        <SupportedNetworks />
        <ForBusinesses />
      </main>
      <Footer />
    </div>
  );
}
