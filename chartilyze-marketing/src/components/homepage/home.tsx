'use client';

import { Hero } from './hero';
import  Features  from './features';
import { HowItWorks } from './howItWorks';
import { Pricing } from './pricing';
import { CTA } from './CTA';
import { Footer } from './footer';
import { Navbar } from './navbar';
import { ScrollToTop } from '@/components/shared/ScrollToTop';
import { useScroll } from '@/hooks/useScroll'; // ✅ import useScroll

export default function HomePage() {
  const scrollY = useScroll(); // ✅ get scroll position

  return (
    <>
      <Navbar scrollY={scrollY} /> {/* ✅ pass scrollY prop */}
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
