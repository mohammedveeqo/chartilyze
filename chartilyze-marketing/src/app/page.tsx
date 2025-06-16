'use client';

import { useEffect } from 'react';
import { Navbar } from '@/components/homepage/navbar';
import { Hero } from '@/components/homepage/hero';
import  Features  from '@/components/homepage/features';
import { HowItWorks } from '@/components/homepage/howItWorks';
import { Pricing } from '@/components/homepage/pricing';
import { CTA } from '@/components/homepage/CTA';
import { Footer } from '@/components/homepage/footer';
import { ScrollToTop } from '@/components/shared/ScrollToTop';
import { useScroll } from '@/hooks/useScroll';

export default function HomePage() {
  const scrollY = useScroll();

  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => {
        window.scrollTo(0, 0);
        window.history.replaceState(null, document.title, window.location.pathname);
      }, 0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white overflow-x-hidden">
      <Navbar scrollY={scrollY} />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
