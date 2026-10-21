import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion.js';
import { drawBlueprints } from '../lib/reveals.js';
import SectionHead from './SectionHead.jsx';
import { StageArt } from './Blueprints.jsx';

const STEPS = [
  { title: 'שיחה', body: 'מספרים לי מה אתם מתכננים. אני שואל, מקשיב, ואומר בכנות אם ואיך זה אפשרי.' },
  { title: 'פגישה בשטח', body: 'מגיעים, מודדים ורואים את המקום — כדי שההצעה תתבסס על המציאות.' },
  { title: 'הצעה בכתב', body: 'היקף, חומרים ולוח זמנים, ברורים ומפורטים. אין התחייבות עד שהכול מוסכם.' },
  { title: 'ביצוע בשקיפות', body: 'עדכונים לאורך הדרך, ושום שינוי בלי שאתם יודעים ומאשרים.' },
  { title: 'מסירה', body: 'ניקיון יסודי וסיור משותף, עד שאתם מרוצים מכל פרט.' }
];

export default function Process() {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current;
      const mm = gsap.matchMedia();

      // Desktop: pinned horizontal sequence. RTL, so the track travels to the right.
      mm.add('(min-width: 900px)', () => {
        const track = el.querySelector('.process__track');
        const distance = () => track.scrollWidth - window.innerWidth + 80;
        const steps = [...el.querySelectorAll('.step')];
        steps.forEach(step =>
          step.querySelectorAll('.draw path').forEach(p => p.style.setProperty('--len', p.getTotalLength()))
        );
        el.classList.add('is-horizontal');

        // Steps enter from the left edge; mark each once it is well inside the viewport
        const markSteps = () => {
          const edge = window.innerWidth * 0.18;
          steps.forEach(s => s.getBoundingClientRect().right > edge && s.classList.add('is-in'));
        };

        gsap.to(track, {
          x: () => distance(),
          ease: 'none',
          onUpdate: markSteps, // fires on every smoothed scrub frame
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: '.process__pin',
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onEnter: markSteps
          }
        });
        gsap.to('.process__fill', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${distance()}`, scrub: true }
        });
        return () => el.classList.remove('is-horizontal');
      });

      // Mobile: vertical stack with draw-on-scroll
      mm.add('(max-width: 899px)', () => {
        drawBlueprints(el);
        el.querySelectorAll('.step').forEach(step =>
          gsap.from(step, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: step, start: 'top 88%' } })
        );
      });
    },
    { scope: root }
  );

  return (
    <section className="process" id="process" ref={root}>
      <div className="process__pin">
        <div className="process__head">
          <SectionHead num="07" name="הדרך שלנו יחד" light />
          <h2 className="process__title">עבודה טובה מתחילה<br /><em>הרבה לפני הביצוע.</em></h2>
        </div>
        <ol className="process__track">
          {STEPS.map((s, i) => (
            <li className="step" key={s.title}>
              <StageArt stage={i} />
              <span className="step__n">0{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="process__ruler" aria-hidden="true">
          <span className="process__fill" />
          {STEPS.map((s, i) => <i key={i} style={{ insetInlineStart: `${(i / (STEPS.length - 1)) * 100}%` }} />)}
        </div>
      </div>
    </section>
  );
}
