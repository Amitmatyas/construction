import { useEffect, useState } from 'react';
import { hasWebGL } from './geometry.js';

/**
 * Mounts a WebGL canvas only once its section is near the viewport (and keeps it),
 * and reports whether it is on screen so the render loop can pause.
 */
export function useCanvasGate(ref) {
  const [supported] = useState(hasWebGL);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !supported) return undefined;
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setMounted(true), { rootMargin: '120% 0px' });
    const onScreen = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '5% 0px' });
    near.observe(el);
    onScreen.observe(el);
    return () => {
      near.disconnect();
      onScreen.disconnect();
    };
  }, [ref, supported]);

  return { supported, mounted, visible };
}
