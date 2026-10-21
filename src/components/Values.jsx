import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion.js';
import SectionHead from './SectionHead.jsx';

const VALUES = [
  { letter: 'א', word: 'דיוק', body: 'פלס, סרגל ותוכנית. הסטנדרט לא משתנה כשאף אחד לא מסתכל.' },
  { letter: 'ב', word: 'שקיפות', body: 'מחיר מפורט, לוח זמנים ברור, ועדכון לפני כל שינוי — לא אחריו.' },
  { letter: 'ג', word: 'אמינות', body: 'להגיע בזמן, לענות לטלפון, לעמוד במה שסוכם. דברים פשוטים שעושים את ההבדל.' },
  { letter: 'ד', word: 'כבוד', body: 'לבית שלכם, לשכנים ולזמן שלכם. אתר בטוח ומסודר בסוף כל יום עבודה.' }
];

export default function Values() {
  const root = useRef(null);

  useGSAP(
    () => {
      const el = root.current;
      const items = gsap.utils.toArray('.value', el);
      const ghost = el.querySelector('.values__ghost');
      if (prefersReducedMotion()) return;

      gsap.set(items.slice(1), { autoAlpha: 0 });
      gsap.set(items.slice(1).map(i => i.querySelector('.value__word')), { clipPath: 'inset(100% 0 0 0)', yPercent: 30 });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${window.innerHeight * VALUES.length}`,
          pin: '.values__pin',
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: self => {
            const i = Math.min(VALUES.length - 1, Math.floor(self.progress * VALUES.length * 0.999 + 0.25));
            ghost.textContent = VALUES[i].letter;
          }
        }
      });

      tl.to('.values__progress span', { scaleX: 1, ease: 'none', duration: VALUES.length - 1 }, 0);
      tl.to('.values__bubble', { xPercent: -300, ease: 'none', duration: VALUES.length - 1 }, 0);

      items.forEach((item, i) => {
        if (i === 0) return;
        const prev = items[i - 1];
        const at = i - 1 + 0.25;
        tl.to(prev.querySelector('.value__word'), { yPercent: -40, clipPath: 'inset(0 0 100% 0)', duration: 0.5 }, at)
          .to(prev.querySelectorAll('.value__body, .value__idx'), { autoAlpha: 0, y: -20, duration: 0.35 }, at)
          .set(prev, { autoAlpha: 0 }, at + 0.5)
          .set(item, { autoAlpha: 1 }, at + 0.2)
          .to(item.querySelector('.value__word'), { yPercent: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.6 }, at + 0.2)
          .from(item.querySelectorAll('.value__body, .value__idx'), { autoAlpha: 0, y: 30, duration: 0.4 }, at + 0.4);
      });
      tl.to({}, { duration: 0.4 });
    },
    { scope: root }
  );

  return (
    <section className="values" id="standard" ref={root}>
      <div className="values__pin">
        <SectionHead num="04" name="הסטנדרט" light />
        <span className="values__ghost" aria-hidden="true">א</span>
        <div className="values__stage">
          {VALUES.map(v => (
            <div className="value" key={v.word} data-letter={v.letter}>
              <span className="value__idx">{v.letter} / ד</span>
              <h3 className="value__word">{v.word}</h3>
              <p className="value__body">{v.body}</p>
            </div>
          ))}
        </div>
        <div className="values__foot" aria-hidden="true">
          <div className="values__progress"><span /></div>
          <div className="values__level"><span className="values__bubble" /></div>
        </div>
      </div>
    </section>
  );
}
