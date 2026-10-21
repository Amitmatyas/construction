import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion.js';
import { hasWebGL } from '../three/geometry.js';
import SplitLines from './SplitLines.jsx';
import Magnet from './reactbits/Magnet/Magnet.jsx';

const HeroScene = lazy(() => import('../three/HeroScene.jsx'));

const SERVICES = ['עבודות שלד', 'טיח', 'ריצוף וחיפוי', 'איטום', 'שיפוצים'];

export default function Hero() {
  const root = useRef(null);
  const [visible, setVisible] = useState(true);
  const [webgl] = useState(hasWebGL);

  // Stop rendering WebGL once the hero is scrolled out of view
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px' });
    io.observe(root.current);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 })
        .from('.hero .split__inner', { yPercent: 110, rotate: -4, duration: 1.4, stagger: 0.09 })
        .from('.hero [data-hero-fade]', { y: 24, opacity: 0, duration: 1.1, stagger: 0.08 }, '-=1.1')
        .from('.hero__services li, .scroll-cue', { opacity: 0, y: 10, duration: 0.9, stagger: 0.05 }, '-=0.9');

      // Copy drifts up and fades as the helmet lifts away into the next chapter
      gsap.to('.hero__content', {
        yPercent: -18,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
      });
    },
    { scope: root }
  );

  return (
    <section className="hero" id="hero" ref={root}>
      {webgl ? (
        <Suspense fallback={<div className="hero__canvas hero__canvas--fallback" />}>
          <HeroScene visible={visible} />
        </Suspense>
      ) : (
        <div className="hero__canvas hero__canvas--fallback" />
      )}
      <div className="hero__vignette" aria-hidden="true" />

      <div className="hero__content">
        <p className="label" data-hero-fade><span className="label__dot" />פועל בניין · עבודות שלד, גמר ושיפוצים</p>
        <SplitLines
          as="h1"
          className="hero__title"
          lines={['בונה את', { text: 'מה שנשאר.', className: 'is-accent' }]}
        />
        <p className="hero__sub" data-hero-fade>
          בנייה ושיפוצים לבתים פרטיים — מהיסודות ועד הגמר, בעבודה מדויקת ובטוחה.
        </p>
        <div className="hero__actions" data-hero-fade>
          <Magnet padding={70} magnetStrength={3}>
            <a href="#contact" className="btn btn--primary cursor-target" data-cursor-label="הצעת מחיר">
              <span className="btn__fill" />
              <span className="btn__text" data-text="לתיאום הצעת מחיר">לתיאום הצעת מחיר</span>
              <span className="btn__arrow" aria-hidden="true">←</span>
            </a>
          </Magnet>
          <a href="#build" className="btn btn--line cursor-target">איך אני עובד</a>
        </div>
      </div>

      <ul className="hero__services" aria-label="תחומי עבודה">
        {SERVICES.map(s => <li key={s}>{s}</li>)}
      </ul>

      <a href="#craft" className="scroll-cue cursor-target" aria-label="גללו לפרק הבא">
        <span className="scroll-cue__track"><span /></span>
        <span className="scroll-cue__text">גללו</span>
      </a>
    </section>
  );
}
