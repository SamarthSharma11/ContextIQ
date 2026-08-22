import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import TrustStrip from '../components/landing/TrustStrip';
import ProductPreview from '../components/landing/ProductPreview';
import Features from '../components/landing/Features';
import UseCases from '../components/landing/UseCases';
import Stats from '../components/landing/Stats';
import Pricing from '../components/landing/Pricing';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';
import { useReveal } from '../hooks/useReveal';

export const Landing: React.FC = () => {
  useReveal();

  return (
    <div className="min-h-screen bg-[#ECECEC] text-ink font-sans">
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
};
