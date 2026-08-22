import React, { useEffect } from 'react';
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

/**
 * Landing page always renders in light mode.
 * We temporarily remove .dark from <html> while mounted,
 * and restore the user's saved preference on unmount.
 */
export const Landing: React.FC = () => {
  useReveal();

  useEffect(() => {
    const html = document.documentElement;
    const hadDark = html.classList.contains('dark');
    // Force light for landing
    html.classList.remove('dark');

    return () => {
      // Restore when navigating away to the dashboard
      if (hadDark) {
        html.classList.add('dark');
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#ECECEC] text-[#17171A] font-sans">
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
