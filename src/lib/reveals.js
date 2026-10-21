import { gsap } from './motion.js';

// Line-mask headline reveal on scroll
export function revealSplit(scope, trigger, opts = {}) {
  const inners = scope.querySelectorAll(`${opts.selector || ''} .split__inner`);
  if (!inners.length) return;
  gsap.from(inners, {
    yPercent: 115,
    rotate: -3,
    duration: 1.3,
    ease: 'expo.out',
    stagger: 0.08,
    scrollTrigger: { trigger: trigger || inners[0], start: 'top 85%' }
  });
}

// Fade-up for anything marked [data-reveal]
export function revealFade(scope) {
  scope.querySelectorAll('[data-reveal]').forEach(el => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
}

// Blueprint strokes draw themselves when scrolled into view
export function drawBlueprints(scope, scrub = false) {
  scope.querySelectorAll('.blueprint').forEach(svg => {
    const paths = svg.querySelectorAll('.draw path, .draw circle');
    paths.forEach(p => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });
    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: 2.2,
      ease: 'power2.inOut',
      stagger: 0.08,
      scrollTrigger: scrub
        ? { trigger: svg, start: 'top 90%', end: 'bottom 40%', scrub: 1 }
        : { trigger: svg, start: 'top 85%' }
    });
  });
}
