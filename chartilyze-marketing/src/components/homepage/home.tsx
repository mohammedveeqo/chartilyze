'use client';

import Hero from './hero'; // Changed from { Hero } to Hero (default import)
import Features from './features';
import { HowItWorks } from './howItWorks';
import { Pricing } from './pricing';
import { CTA } from './CTA';
import { Footer } from './footer';
import { Navbar } from './navbar';
import { ScrollToTop } from '@/components/shared/ScrollToTop';
import { useScroll } from '@/hooks/useScroll';

export default function HomePage() {
  const scrollY = useScroll();

  return (
    <>
      <Navbar scrollY={scrollY} />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
      <ScrollToTop />
    </>
  );
}
