import { Suspense, lazy, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion, ScrollTrigger } from '../lib/motion.js';
import { useCanvasGate } from '../three/useCanvasGate.js';
import SectionHead from './SectionHead.jsx';
import { StageArt } from './Blueprints.jsx';

const BuildScene = lazy(() => import('../three/BuildScene.jsx'));

// Caption ranges line up with the construction timeline in three/Building.jsx
const STAGES = [
  { at: 0, title: 'בסיס', body: 'לפני הבלוק הראשון — להבין מה אתם צריכים באמת. על בסיס לא נכון שום דבר לא יעמוד.' },
  { at: 0.1, title: 'תוכנית', body: 'מה, מתי וכמה — כתוב ומוסכם מראש. תוכנית ברורה מחזיקה את כל הפרויקט.' },
  { at: 0.3, title: 'תיאום', body: 'כל החלקים עובדים יחד. עדכון שוטף ושינויים רק בהסכמה — כדי שלא יהיו הפתעות.' },
  { at: 0.5, title: 'עקביות', body: 'שלב אחר שלב, בלי לדלג. לא ממשיכים הלאה לפני שהשלב הקודם נכון.' },
  { at: 0.7, title: 'תוצאה', body: 'מה שרואים בסוף הוא סכום של כל מה שנעשה נכון בדרך.' }
];

export default function BuildSequence() {
  const root = useRef(null);
  const progress = useRef({ value: 0 }).current;
  const [reduced] = useState(prefersReducedMotion);
  const [mobile] = useState(() => window.innerWidth < 820);
  const gate = useCanvasGate(root);

  useGSAP(
    () => {
      const el = root.current;
      const captions = el.querySelectorAll('.build__stage');
      const counter = el.querySelector('.build__floor');
      const bar = el.querySelector('.build__bar span');
      let current = -1;

      const setStage = p => {
        let i = 0;
        STAGES.forEach((s, k) => p >= s.at && (i = k));
        if (i !== current) {
          captions.forEach((c, k) => c.classList.toggle('is-active', k === i));
          current = i;
        }
        const floors = Math.min(5, Math.max(0, Math.floor((p - 0.1) / 0.125) + 1));
        counter.textContent = p < 0.1 ? 'בסיס' : p >= 0.94 ? 'שלם' : `קומה ${floors} מתוך 5`;
        bar.style.transform = `scaleX(${p})`;
      };

      if (reduced) {
        progress.value = 1;
        setStage(1);
        return;
      }
      setStage(0);

      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${window.innerHeight * (mobile ? 4 : 5)}`,
        pin: '.build__pin',
        scrub: true,
        anticipatePin: 1,
        onUpdate: self => {
          progress.value = self.progress;
          setStage(self.progress);
        }
      });

      gsap.from(el.querySelectorAll('.build__intro .split__inner, .build__intro p'), {
        yPercent: 110,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 70%' }
      });
    },
    { scope: root }
  );

  return (
    <section className="build" id="build" ref={root} aria-labelledby="build-title">
      <div className="build__pin">
        {gate.supported ? (
          gate.mounted && (
            <Suspense fallback={null}>
              <BuildScene progress={progress} visible={gate.visible} mobile={mobile} reduced={reduced} />
            </Suspense>
          )
        ) : (
          <div className="build__fallback"><StageArt stage={4} /></div>
        )}
        <div className="build__shade" aria-hidden="true" />

        <div className="build__intro">
          <SectionHead num="03" name="שכבה על שכבה" light />
          <h2 id="build-title" className="build__title split">
            <span className="split__line"><span className="split__mask"><span className="split__inner">אמון נבנה</span></span></span>
            <span className="split__line is-accent"><span className="split__mask"><span className="split__inner">כמו בניין.</span></span></span>
          </h2>
        </div>

        <ol className="build__stages">
          {STAGES.map((s, i) => (
            <li className="build__stage" key={s.title}>
              <span className="build__stage-n">0{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="build__hud" aria-hidden="true">
          <span className="build__floor">בסיס</span>
          <span className="build__bar"><span /></span>
        </div>
      </div>
    </section>
  );
}
