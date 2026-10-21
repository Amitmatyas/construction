import { Suspense, lazy, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion, ScrollTrigger } from '../lib/motion.js';
import { useCanvasGate } from '../three/useCanvasGate.js';
import SectionHead from './SectionHead.jsx';
import SplitLines from './SplitLines.jsx';

const ExplodedScene = lazy(() => import('../three/ExplodedScene.jsx'));

const DETAILS = [
  ['הכנה', 'רוב הטעויות אפשר למנוע לפני שהן קורות.'],
  ['דיוק', 'מילימטר בבסיס הופך לסנטימטר בגובה.'],
  ['אחריות', 'בטיחות וסדר באתר הם חלק מהעבודה — לא תוספת.']
];

export default function ExplodedView() {
  const root = useRef(null);
  // amount = what the scene shows; scroll and the toggle each feed it
  const amount = useRef({ value: 0 }).current;
  const state = useRef({ scroll: 0, manual: null });
  const [reduced] = useState(prefersReducedMotion);
  const [mobile] = useState(() => window.innerWidth < 820);
  const [split, setSplit] = useState(false);
  const gate = useCanvasGate(root);

  const animateTo = v => gsap.to(amount, { value: v, duration: reduced ? 0 : 1.4, ease: 'power3.inOut', overwrite: true });

  useGSAP(
    () => {
      const el = root.current;
      if (reduced) {
        amount.value = 0.85;
        return;
      }
      // Scroll choreography: assembled → separated → reconnected
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${window.innerHeight * 2.2}`,
        pin: '.xview__pin',
        scrub: true,
        anticipatePin: 1,
        onUpdate: self => {
          const p = self.progress;
          const v = p < 0.15 ? 0 : p < 0.45 ? (p - 0.15) / 0.3 : p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;
          state.current.scroll = v;
          // after a manual toggle the visitor's choice wins until they leave the section
          if (state.current.manual !== null) return;
          gsap.to(amount, { value: v, duration: 0.5, ease: 'power2.out', overwrite: true });
          const isSplit = v > 0.5;
          setSplit(prev => (prev === isSplit ? prev : isSplit));
        },
        onLeave: () => (state.current.manual = null),
        onLeaveBack: () => (state.current.manual = null)
      });

      gsap.from(el.querySelectorAll('.xview__copy .split__inner'), {
        yPercent: 115, duration: 1.3, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 70%' }
      });
      gsap.from(el.querySelectorAll('.xview__detail'), {
        y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 55%' }
      });
    },
    { scope: root }
  );

  const toggle = () => {
    const next = !split;
    state.current.manual = next ? 1 : 0;
    setSplit(next);
    animateTo(next ? 1 : 0);
  };

  return (
    <section className="xview" id="details" ref={root} aria-labelledby="xview-title">
      <div className="xview__pin">
        <div className="xview__stage">
          {gate.supported && gate.mounted && (
            <Suspense fallback={null}>
              <ExplodedScene amount={amount} visible={gate.visible} mobile={mobile} reduced={reduced} />
            </Suspense>
          )}
        </div>

        <div className="xview__copy">
          <SectionHead num="05" name="הפרטים" light />
          <SplitLines as="h2" className="xview__title" lines={['ההבדל נמצא', { text: 'בפרטים הקטנים.', className: 'is-accent' }]} />
          <p className="xview__lede" id="xview-title">
            חיבור אחד, מפורק לחלקיו. כל חלק כאן קטן — וכל אחד חייב להיות מדויק. כך אני ניגש לכל עבודה: גם לפרטים שאף אחד לא יראה.
          </p>
          <button type="button" className="xview__toggle cursor-target" onClick={toggle} aria-pressed={split}>
            <span className="xview__toggle-icon" aria-hidden="true" />
            {split ? 'הרכיבו את החיבור' : 'פרקו את החיבור'}
          </button>
          <ul className="xview__details">
            {DETAILS.map(([t, d]) => (
              <li className="xview__detail" key={t}><strong>{t}</strong><span>{d}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
