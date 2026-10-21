import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion, isFinePointer } from './lib/motion.js';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Craft from './components/Craft.jsx';
import BuildSequence from './components/BuildSequence.jsx';
import ExplodedView from './components/ExplodedView.jsx';
import Values from './components/Values.jsx';
import Services from './components/Services.jsx';
import Process from './components/Process.jsx';
import Reveal from './components/Reveal.jsx';
import FinalCTA from './components/FinalCTA.jsx';
import TargetCursor from './components/reactbits/TargetCursor.jsx';
import Noise from './components/reactbits/Noise.jsx';

export default function App() {
  const [fine] = useState(isFinePointer);
  const [reduced] = useState(prefersReducedMotion);

  // Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync
  useEffect(() => {
    if (reduced) return undefined;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = time => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, [reduced]);

  // Web fonts change text metrics; re-measure pinned sections once they are in
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  // Route in-page anchor clicks through Lenis (falls back to native scrolling)
  useEffect(() => {
    const onClick = e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (window.__lenis) window.__lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [reduced]);

  return (
    <>
      <Noise fixed opacity={0.06} fps={18} blendMode="overlay" />
      {fine && !reduced && (
        <TargetCursor cursorColor="#ff5a1f" size={30} cornerSize={9} thickness={2} blendMode="normal" spinDuration={3} />
      )}
      <Nav />
      <main>
        {/* promise → difference → how trust is built → standard → details → experience → the result → conversation */}
        <Hero />
        <Craft />
        <BuildSequence />
        <Values />
        <ExplodedView />
        <Services />
        <Process />
        <Reveal />
        <FinalCTA />
      </main>
    </>
  );
}
