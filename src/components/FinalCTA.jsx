import { useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion.js';
import { revealSplit, revealFade } from '../lib/reveals.js';
import { CONTACT } from '../content.js';
import SectionHead from './SectionHead.jsx';
import SplitLines from './SplitLines.jsx';
import Magnet from './reactbits/Magnet/Magnet.jsx';

const WORK_TYPES = ['עבודות שלד', 'טיח ושפכטל', 'ריצוף וחיפוי', 'איטום', 'שיפוץ כללי', 'אחר'];

export default function FinalCTA() {
  const root = useRef(null);
  const [status, setStatus] = useState({ type: '', text: '' });

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current;
      revealSplit(el, el.querySelector('.final__title'));
      revealFade(el);
      // The closing scene rises over the dark reveal like a slab being set down
      gsap.fromTo(el, { clipPath: 'inset(10% 5% 0 5%)' }, {
        clipPath: 'inset(0% 0% 0 0%)',
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 25%', scrub: true }
      });
      gsap.fromTo('.final__ghost', { xPercent: -10 }, {
        xPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    },
    { scope: root }
  );

  // No server: compose the enquiry in the visitor's own mail app, and say so plainly
  const onSubmit = e => {
    e.preventDefault();
    const form = e.currentTarget;
    const fields = [...form.querySelectorAll('[required]')];
    fields.forEach(f => f.classList.toggle('is-invalid', !f.checkValidity()));
    const invalid = fields.find(f => !f.checkValidity());
    if (invalid) {
      invalid.focus();
      setStatus({ type: 'err', text: 'חסרים פרטים: נא למלא שם ומספר טלפון תקין.' });
      return;
    }
    const { name, phone, type, message } = form.elements;
    const body = [`שם: ${name.value.trim()}`, `טלפון: ${phone.value.trim()}`, `סוג העבודה: ${type.value}`, '', message.value.trim()].join('\n');
    const subject = `פנייה חדשה — ${type.value}`;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus({
      type: 'ok',
      text: 'הפנייה הוכנה בתוכנת הדואר שלכם. כדי שתגיע אליי — לחצו "שליחה" שם. לא נפתח חלון? התקשרו או כתבו לכתובת שמשמאל.'
    });
  };

  return (
    <section className="final" id="contact" ref={root}>
      <span className="final__ghost" aria-hidden="true">בונים</span>
      <SectionHead num="08" name="נדבר?" light />

      <SplitLines
        className="final__title"
        lines={['בואו נבדוק', { text: 'אם אני', className: 'is-accent' }, 'מתאים לכם.']}
      />
      <p className="final__lede" data-reveal>שיחה קצרה, בלי התחייבות. ספרו לי מה אתם מתכננים — ונבין יחד אם ואיך נכון להתקדם.</p>

      <div className="final__grid">
        <div className="final__info" data-reveal>
          <Magnet padding={60} magnetStrength={4}>
            <a href={CONTACT.phoneHref} className="final__call cursor-target" data-cursor-label="חייגו">
              <span className="final__call-label">לשיחה ישירה</span>
              <span className="final__call-num" dir="ltr">{CONTACT.phone}</span>
            </a>
          </Magnet>
          <a href={`mailto:${CONTACT.email}`} className="final__mail cursor-target" dir="ltr">{CONTACT.email}</a>
        </div>

        <form className="form" onSubmit={onSubmit} noValidate data-reveal>
          <div className="field">
            <input id="f-name" name="name" type="text" required autoComplete="name" placeholder=" " />
            <label htmlFor="f-name">שם מלא</label>
          </div>
          <div className="field">
            <input id="f-phone" name="phone" type="tel" required pattern="0[0-9\-]{8,11}" autoComplete="tel" placeholder=" " dir="ltr" />
            <label htmlFor="f-phone">טלפון</label>
          </div>
          <div className="field field--select">
            <select id="f-type" name="type" defaultValue={WORK_TYPES[0]}>
              {WORK_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <label htmlFor="f-type">סוג העבודה</label>
          </div>
          <div className="field">
            <textarea id="f-msg" name="message" rows={3} placeholder=" " />
            <label htmlFor="f-msg">ספרו על הפרויקט</label>
          </div>
          <button type="submit" className="btn btn--primary btn--wide cursor-target">
            <span className="btn__fill" />
            <span className="btn__text" data-text="הכנת פנייה במייל">הכנת פנייה במייל</span>
            <span className="btn__arrow" aria-hidden="true">←</span>
          </button>
          <p className={`form__status ${status.type}`} role="status" aria-live="polite">{status.text}</p>
        </form>
      </div>

      <footer className="footer">
        <span>© {new Date().getFullYear()} עבודות בנייה, גמר ושיפוצים</span>
        <a href="#hero" className="cursor-target">חזרה למעלה ↑</a>
      </footer>
    </section>
  );
}
