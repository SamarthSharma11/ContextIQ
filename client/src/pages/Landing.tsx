import React from 'react';
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
 * Landing page is ALWAYS rendered in light mode regardless of the user's
 * dark-mode preference. We achieve this by adding the `light` class to a
 * wrapper and unsetting the `.dark` scope from it via CSS.
 */
export const Landing: React.FC = () => {
  useReveal();

  return (
    // Force light colour scheme — the `force-light` class resets all dark-mode
    // CSS custom properties back to their light-mode values so the landing page
    // is never affected by the user's dashboard theme preference.
    <div
      className="force-light min-h-screen font-sans"
      style={{
        backgroundColor: '#ECECEC',
        color: '#17171A',
      }}
    >
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
