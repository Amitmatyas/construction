import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion, isFinePointer } from '../lib/motion.js';
import { revealSplit, drawBlueprints } from '../lib/reveals.js';
import SectionHead from './SectionHead.jsx';
import SplitLines from './SplitLines.jsx';
import { ServiceArt } from './Blueprints.jsx';

const SERVICES = [
  { title: 'עבודות שלד', body: 'קירות בלוקים, יציקות, עמודים ותקרות — לפי תוכניות המהנדס, בדיוק ובסדר הנכון.', tag: 'בנייה חדשה · תוספות' },
  { title: 'טיח ושפכטל', body: 'טיח פנים וחוץ, החלקה מושלמת והכנה לצבע. קיר שנראה כמו משטח אחד.', tag: 'פנים · חוץ' },
  { title: 'ריצוף וחיפוי', body: 'פורצלן בפורמטים גדולים, חיפוי מטבחים וחדרי רחצה, פילוס בדיוק של מילימטר.', tag: 'פורצלן · אבן' },
  { title: 'איטום ושיפוץ', body: 'איטום גגות ומרפסות ושיפוץ דירות מקצה לקצה, כולל הריסה ופינוי פסולת.', tag: 'גגות · דירות' }
];

export default function Services() {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current;
      revealSplit(el, el.querySelector('.services__title'));
      drawBlueprints(el);

      el.querySelectorAll('.service').forEach((card, i) => {
        gsap.from(card, {
          y: 120,
          rotateX: -12,
          opacity: 0,
          duration: 1.4,
          ease: 'expo.out',
          delay: (i % 2) * 0.12,
          scrollTrigger: { trigger: card, start: 'top 90%' }
        });
      });

      // Subtle 3D tilt with layered depth (desktop pointer only)
      if (!isFinePointer()) return;
      const cleanups = [];
      el.querySelectorAll('.service').forEach(card => {
        const inner = card.querySelector('.service__inner');
        const rx = gsap.quickTo(inner, 'rotateX', { duration: 0.6, ease: 'power3' });
        const ry = gsap.quickTo(inner, 'rotateY', { duration: 0.6, ease: 'power3' });
        const move = e => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          rx(-py * 8);
          ry(px * 10);
          card.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
          card.style.setProperty('--my', `${(py + 0.5) * 100}%`);
        };
        const leave = () => { rx(0); ry(0); };
        card.addEventListener('pointermove', move);
        card.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          card.removeEventListener('pointermove', move);
          card.removeEventListener('pointerleave', leave);
        });
      });
      return () => cleanups.forEach(fn => fn());
    },
    { scope: root }
  );

  return (
    <section className="services" id="services" ref={root}>
      <SectionHead num="06" name="שירותים" />
      <div className="services__intro">
        <SplitLines className="services__title big-title" lines={['מה אני', { text: 'בונה.', className: 'is-outline' }]} />
        <p className="services__note">מבנייה חדשה ועד שיפוץ של חדר אחד — עם אותה הקפדה בכל היקף.</p>
      </div>

      <div className="services__list">
        {SERVICES.map((s, i) => (
          <article className="service cursor-target" key={s.title} data-cursor-label={s.title} tabIndex={0}>
            <div className="service__inner">
              <div className="service__bg" aria-hidden="true" />
              <span className="service__num">/0{i + 1}</span>
              <div className="service__layer">
                <ServiceArt index={i} />
              </div>
              <div className="service__text">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <span className="service__tag">{s.tag}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
