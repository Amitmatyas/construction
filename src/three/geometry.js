import * as THREE from 'three';

// Geometries are created once and shared by every scene.
const cache = new Map();
const once = (key, make) => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
};

// Steel I-section, 1 unit long along +Z, centred on the origin
export const iBeamGeometry = () =>
  once('ibeam', () => {
    const w = 0.5, h = 0.6, f = 0.07, web = 0.05;
    const s = new THREE.Shape();
    s.moveTo(-w / 2, -h / 2);
    s.lineTo(w / 2, -h / 2);
    s.lineTo(w / 2, -h / 2 + f);
    s.lineTo(web / 2, -h / 2 + f);
    s.lineTo(web / 2, h / 2 - f);
    s.lineTo(w / 2, h / 2 - f);
    s.lineTo(w / 2, h / 2);
    s.lineTo(-w / 2, h / 2);
    s.lineTo(-w / 2, h / 2 - f);
    s.lineTo(-web / 2, h / 2 - f);
    s.lineTo(-web / 2, -h / 2 + f);
    s.lineTo(-w / 2, -h / 2 + f);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
    g.translate(0, 0, -0.5);
    return g;
  });

export const boxGeometry = () => once('box', () => new THREE.BoxGeometry(1, 1, 1));

export const helmetGeometries = () =>
  once('helmet', () => {
    const shellPts = [];
    for (let i = 0; i <= 40; i++) {
      const phi = (i / 40) * (Math.PI / 2);
      const bulge = 1 + 0.04 * Math.sin(phi * 2);
      shellPts.push(new THREE.Vector2(Math.sin(phi) * bulge, Math.cos(phi) * 0.92));
    }
    shellPts.push(new THREE.Vector2(1.0, -0.04));
    shellPts.reverse(); // bottom → top so face normals point outward

    const brimPts = [
      new THREE.Vector2(0.98, -0.02),
      new THREE.Vector2(1.14, -0.05),
      new THREE.Vector2(1.17, -0.1),
      new THREE.Vector2(1.13, -0.11),
      new THREE.Vector2(0.98, -0.07)
    ];
    const visorPts = [
      new THREE.Vector2(0.98, -0.02),
      new THREE.Vector2(1.3, -0.1),
      new THREE.Vector2(1.46, -0.2),
      new THREE.Vector2(1.42, -0.22),
      new THREE.Vector2(0.98, -0.08)
    ];
    return {
      shell: new THREE.LatheGeometry(shellPts, 96),
      brim: new THREE.LatheGeometry(brimPts, 96),
      // front peak: a slice of the lathe centred on +Z
      visor: new THREE.LatheGeometry(visorPts, 64, -Math.PI * 0.36, Math.PI * 0.72)
    };
  });

export const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

export const clamp01 = v => Math.min(1, Math.max(0, v));
export const easeOut = t => 1 - Math.pow(1 - t, 3);
export const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const range = (p, a, b) => clamp01((p - a) / (b - a));
