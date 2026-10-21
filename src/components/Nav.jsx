import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion.js';
import { CONTACT, BRAND } from '../content.js';

const LINKS = [
  ['#difference', 'ההבדל'],
  ['#standard', 'הסטנדרט'],
  ['#details', 'הפרטים'],
  ['#experience', 'החוויה']
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menu = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = menu.current;
    if (open) {
      window.__lenis?.stop();
      document.body.style.overflow = 'hidden';
      if (!prefersReducedMotion()) {
        gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' });
        gsap.fromTo(el.querySelectorAll('.menu__links a'), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.25 });
      }
    } else {
      window.__lenis?.start();
      document.body.style.overflow = '';
    }
    const onKey = e => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
        <a href="#hero" className="nav__logo cursor-target" aria-label="לראש העמוד">
          <span className="nav__mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M6 21a10 10 0 0 1 20 0z" /><rect x="3.5" y="21" width="25" height="3" /></svg></span>
          <span className="nav__name">{BRAND.name} <em>/ {BRAND.tagline}</em></span>
        </a>
        <nav className="nav__links" aria-label="ניווט ראשי">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="cursor-target"><span data-text={label}>{label}</span></a>
          ))}
        </nav>
        <a href="#contact" className="nav__cta cursor-target">בואו נדבר</a>
        <button
          className="nav__burger"
          aria-label={open ? 'סגירת תפריט' : 'פתיחת תפריט'}
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen(o => !o)}
        >
          <span /><span />
        </button>
      </header>

      <div className={`menu${open ? ' is-open' : ''}`} id="menu" ref={menu} aria-hidden={!open} inert={open ? undefined : ''}>
        <nav className="menu__links" aria-label="תפריט נייד">
          {[...LINKS, ['#contact', 'בואו נדבר']].map(([href, label], i) => (
            <div className="menu__row" key={href}>
              <a href={href} onClick={() => setOpen(false)}>
                <small>0{i + 1}</small>{label}
              </a>
            </div>
          ))}
        </nav>
        <div className="menu__foot">
          <a href={CONTACT.phoneHref} dir="ltr">{CONTACT.phone}</a>
          <a href="#contact" onClick={() => setOpen(false)}>לשיחת היכרות ←</a>
        </div>
      </div>
    </>
  );
}
