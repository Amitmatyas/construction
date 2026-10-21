import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion.js';
import { revealFade, drawBlueprints } from '../lib/reveals.js';
import SectionHead from './SectionHead.jsx';
import { HouseSection, SteelDetail, RebarGrid } from './Blueprints.jsx';

const STATEMENT = 'רוב העבודה הטובה לא נראית לעין. היא נמצאת מתחת לטיח — ובכל מה שקורה לפני שמתחילים.';
const HIGHLIGHT = new Set(['לא', 'נראית', 'לעין.']);

const PILLARS = [
  { title: 'קודם מבינים', body: 'מודדים, שואלים ומקשיבים — ורק אז מתחילים לעבוד.' },
  { title: 'מילה אחת', body: 'מה שנאמר בשיחה נכתב בהצעה, ומה שנכתב — מתבצע.' },
  { title: 'כתובת אחת', body: 'אחריות אישית מההתחלה ועד הסוף. לא צריך לרדוף אחרי אף אחד.' }
];

export default function Craft() {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current;

      // Words light up one by one as you read down the page
      gsap.fromTo(
        el.querySelectorAll('.statement__word'),
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: '.craft__statement', start: 'top 80%', end: 'bottom 45%', scrub: true }
        }
      );

      // Clip-path panel reveals + inner parallax
      el.querySelectorAll('.panel').forEach((panel, i) => {
        gsap.fromTo(
          panel,
          { clipPath: i % 2 ? 'inset(0 0 0 100%)' : 'inset(100% 0 0 0)' },
          { clipPath: 'inset(0 0 0 0%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: panel, start: 'top 82%' } }
        );
        gsap.fromTo(
          panel.querySelector('.panel__surface'),
          { yPercent: -10, scale: 1.15 },
          { yPercent: 10, scale: 1.15, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true } }
        );
      });

      // Marquee speeds up and skews with scroll velocity
      const track = el.querySelector('.marquee__track');
      const loop = gsap.to(track, { xPercent: 50, duration: 30, ease: 'none', repeat: -1 });
      const skew = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power3' });
      gsap.timeline({
        scrollTrigger: {
          trigger: '.marquee',
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: self => {
            const v = self.getVelocity();
            loop.timeScale(1 + Math.min(6, Math.abs(v) / 300));
            skew(gsap.utils.clamp(-12, 12, v / -200));
          }
        }
      });

      revealFade(el);
      drawBlueprints(el, true);
    },
    { scope: root }
  );

  return (
    <section className="craft" id="difference" ref={root}>
      <SectionHead num="02" name="ההבדל" />

      <h2 className="craft__statement">
        {STATEMENT.split(' ').map((w, i) => (
          <span key={i} className={`statement__word${HIGHLIGHT.has(w) ? ' is-accent' : ''}`}>{w} </span>
        ))}
      </h2>

      <div className="craft__grid">
        <figure className="panel panel--tall">
          <div className="panel__surface panel__surface--concrete" />
          <HouseSection />
          <figcaption><span>01</span>מה שמתחת לפני השטח</figcaption>
        </figure>

        <div className="craft__copy">
          <p className="craft__lede" data-reveal>
            להבטיח תוצאה קל. לבנות דרך עבודה שאפשר לסמוך עליה — זה כבר עניין של אופי. הגישה שלי פשוטה: לתכנן לפני שמבצעים, לא לקצר דרכים, ולדבר איתכם בגובה העיניים לאורך כל הדרך.
          </p>
          <ul className="pillars">
            {PILLARS.map(p => (
              <li className="pillar" key={p.title} data-reveal>
                <strong>{p.title}</strong>
                <span>{p.body}</span>
              </li>
            ))}
          </ul>
        </div>

        <figure className="panel panel--steel">
          <div className="panel__surface panel__surface--steel" />
          <SteelDetail />
          <figcaption><span>02</span>כל חיבור נבדק</figcaption>
        </figure>

        <figure className="panel panel--rebar">
          <div className="panel__surface panel__surface--dark" />
          <RebarGrid />
          <figcaption><span>03</span>בסיס שמחזיק</figcaption>
        </figure>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[0, 1].map(k => (
            <div className="marquee__set" key={k}>
              {['דיוק', 'שקיפות', 'אמינות', 'אחריות', 'סדר', 'כבוד'].map(w => (
                <span key={w}>{w}<i>✕</i></span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
