import { Suspense, lazy, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion.js';
import { useCanvasGate } from '../three/useCanvasGate.js';
import { StageArt } from './Blueprints.jsx';

const RevealScene = lazy(() => import('../three/RevealScene.jsx'));

export default function Reveal() {
  const root = useRef(null);
  const reveal = useRef({ value: 0 }).current;
  const glow = useRef({ value: 0 }).current;
  const [reduced] = useState(prefersReducedMotion);
  const [mobile] = useState(() => window.innerWidth < 820);
  const gate = useCanvasGate(root);

  useGSAP(
    () => {
      const el = root.current;
      if (reduced) {
        reveal.value = 1;
        glow.value = 1;
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${window.innerHeight * 2}`,
          pin: '.reveal__pin',
          scrub: true,
          anticipatePin: 1
        }
      });
      tl.to(reveal, { value: 1, ease: 'none', duration: 1 }, 0)
        .to(glow, { value: 1, ease: 'power1.in', duration: 0.6 }, 0.3)
        .from(el.querySelectorAll('.reveal__title .split__inner'), { yPercent: 115, duration: 0.25, stagger: 0.05, ease: 'power3.out' }, 0.45)
        .from(el.querySelector('.reveal__sub'), { opacity: 0, y: 20, duration: 0.2 }, 0.62)
        .to({}, { duration: 0.15 });
    },
    { scope: root }
  );

  return (
    <section className="reveal" id="result" ref={root} aria-labelledby="reveal-title">
      <div className="reveal__pin">
        {gate.supported ? (
          gate.mounted && (
            <Suspense fallback={null}>
              <RevealScene reveal={reveal} glow={glow} visible={gate.visible} mobile={mobile} reduced={reduced} />
            </Suspense>
          )
        ) : (
          <div className="build__fallback"><StageArt stage={4} /></div>
        )}
        <div className="reveal__shade" aria-hidden="true" />
        <div className="reveal__copy">
          <h2 id="reveal-title" className="reveal__title split">
            <span className="split__line"><span className="split__mask"><span className="split__inner">מה שנבנה נכון —</span></span></span>
            <span className="split__line is-accent"><span className="split__mask"><span className="split__inner">נשאר.</span></span></span>
          </h2>
          <p className="reveal__sub">עבודה שעומדת במבחן הזמן, ולא רק במבחן המסירה.</p>
        </div>
      </div>
    </section>
  );
}
