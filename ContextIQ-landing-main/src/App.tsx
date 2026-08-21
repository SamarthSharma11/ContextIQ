import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TrustStrip from '@/components/TrustStrip';
import ProductPreview from '@/components/ProductPreview';
import Features from '@/components/Features';
import UseCases from '@/components/UseCases';
import Stats from '@/components/Stats';
import Pricing from '@/components/Pricing';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import { useReveal } from '@/hooks/useReveal';

function App() {
  useReveal();

  return (
    <div className="min-h-screen bg-cloud text-ink">
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <ProductPreview />
        <Features />
        <UseCases />
        <Stats />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
