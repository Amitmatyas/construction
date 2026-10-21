import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { iBeamGeometry, boxGeometry, easeOut, range } from './geometry.js';
import { materials } from './materials.jsx';

// Grid: 3 × 2 bays, 5 floors
export const BAY = 3;
const BX = 3, BZ = 2, FLOORS = 5;
export const FH = 1.7;
const W = BX * BAY, D = BZ * BAY;
export const BUILDING_HEIGHT = FLOORS * FH;

// Construction timeline on a 0 → 1 scale
const floorStart = f => 0.1 + f * 0.125;
export const T = {
  foundation: [0.0, 0.09],
  columns: f => [floorStart(f), floorStart(f) + 0.06],
  beams: f => [floorStart(f) + 0.045, floorStart(f) + 0.1],
  slab: f => [floorStart(f) + 0.085, floorStart(f) + 0.135],
  facade: f => [0.7 + f * 0.04, 0.78 + f * 0.04],
  roof: [0.9, 0.97]
};

const X_AXIS = new THREE.Vector3(1, 0, 0);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const qColumn = new THREE.Quaternion().setFromAxisAngle(X_AXIS, -Math.PI / 2); // beam length → Y
const qBeamX = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, Math.PI / 2); // length → X
const qBeamZ = new THREE.Quaternion();

function buildLayout() {
  const columns = [], beams = [], slabs = [], glass = [];
  for (let f = 0; f < FLOORS; f++) {
    const [c0, c1] = T.columns(f);
    let i = 0;
    for (let ix = 0; ix <= BX; ix++)
      for (let iz = 0; iz <= BZ; iz++) {
        const stagger = (i++ / 12) * 0.025;
        columns.push({ x: (ix - BX / 2) * BAY, z: (iz - BZ / 2) * BAY, y0: f * FH, a: c0 + stagger, b: c1 + stagger });
      }

    const [b0, b1] = T.beams(f);
    const y = (f + 1) * FH - 0.15;
    let j = 0;
    for (let iz = 0; iz <= BZ; iz++)
      for (let ix = 0; ix < BX; ix++) {
        const st = (j++ / 17) * 0.03;
        beams.push({ pos: [(ix + 0.5 - BX / 2) * BAY, y, (iz - BZ / 2) * BAY], q: qBeamX, dir: [1, 0, 0], side: ix < 1 ? -1 : 1, a: b0 + st, b: b1 + st });
      }
    for (let ix = 0; ix <= BX; ix++)
      for (let iz = 0; iz < BZ; iz++) {
        const st = (j++ / 17) * 0.03;
        beams.push({ pos: [(ix - BX / 2) * BAY, y, (iz + 0.5 - BZ / 2) * BAY], q: qBeamZ, dir: [0, 0, 1], side: iz < 1 ? -1 : 1, a: b0 + st, b: b1 + st });
      }

    const [s0, s1] = T.slab(f);
    slabs.push({ y: (f + 1) * FH + 0.08, a: s0, b: s1 });

    // facade panels on the perimeter
    const [g0, g1] = T.facade(f);
    const cy = f * FH + FH / 2;
    let k = 0;
    const push = (x, z, nx, nz, rot) => {
      const st = (k++ / 10) * 0.025;
      // deterministic pseudo-random: which windows light up at dusk
      const lit = (f * 7 + k * 13) % 5 < 3;
      glass.push({ x, z, nx, nz, rot, y: cy, a: g0 + st, b: g1 + st, lit });
    };
    for (let ix = 0; ix < BX; ix++) {
      const x = (ix + 0.5 - BX / 2) * BAY;
      push(x, D / 2 + 0.02, 0, 1, 0);
      push(x, -D / 2 - 0.02, 0, -1, 0);
    }
    for (let iz = 0; iz < BZ; iz++) {
      const z = (iz + 0.5 - BZ / 2) * BAY;
      push(W / 2 + 0.02, z, 1, 0, Math.PI / 2);
      push(-W / 2 - 0.02, z, -1, 0, Math.PI / 2);
    }
  }
  return { columns, beams, slabs, glass };
}

const tmp = new THREE.Object3D();
const hidden = new THREE.Matrix4().makeScale(0, 0, 0);

/**
 * The structure. `progress` is a mutable { value } (0 → 1) written by ScrollTrigger;
 * `glow` (0 → 1) lights the windows for the dusk reveal.
 */
export default function Building({ progress, glow = { value: 0 }, castShadow = true }) {
  const layout = useMemo(buildLayout, []);
  const m = materials();
  const glassLit = useMemo(() => m.glassLit.clone(), [m]);
  const refs = { columns: useRef(), beams: useRef(), slabs: useRef(), glass: useRef(), glassLit: useRef(), foundation: useRef(), roof: useRef() };
  const litIdx = useMemo(() => layout.glass.filter(g => g.lit), [layout]);
  const darkIdx = useMemo(() => layout.glass.filter(g => !g.lit), [layout]);
  const shown = useRef(-1);

  useLayoutEffect(() => {
    // instance bounds come from the unit geometry, so culling would hide parts wrongly
    Object.values(refs).forEach(r => r.current?.instanceMatrix && (r.current.frustumCulled = false));
    shown.current = -1; // (re)mounted meshes start at identity: force a full layout pass
  }, []);

  const apply = p => {
    // columns rise up from the floor below
    layout.columns.forEach((c, i) => {
      const t = easeOut(range(p, c.a, c.b));
      if (t <= 0) return refs.columns.current.setMatrixAt(i, hidden);
      const len = FH * t;
      tmp.position.set(c.x, c.y0 + len / 2, c.z);
      tmp.quaternion.copy(qColumn);
      tmp.scale.set(0.55, 0.55, len);
      tmp.updateMatrix();
      refs.columns.current.setMatrixAt(i, tmp.matrix);
    });
    refs.columns.current.instanceMatrix.needsUpdate = true;

    // beams are lowered and slid along their axis into the joint
    layout.beams.forEach((b, i) => {
      const t = easeOut(range(p, b.a, b.b));
      if (t <= 0) return refs.beams.current.setMatrixAt(i, hidden);
      const off = (1 - t) * 5 * b.side;
      tmp.position.set(b.pos[0] + b.dir[0] * off, b.pos[1] + (1 - t) * 2.2, b.pos[2] + b.dir[2] * off);
      tmp.quaternion.copy(b.q);
      tmp.scale.set(0.45, 0.45, BAY - 0.12);
      tmp.updateMatrix();
      refs.beams.current.setMatrixAt(i, tmp.matrix);
    });
    refs.beams.current.instanceMatrix.needsUpdate = true;

    // slabs descend and settle
    layout.slabs.forEach((s, i) => {
      const t = easeOut(range(p, s.a, s.b));
      if (t <= 0) return refs.slabs.current.setMatrixAt(i, hidden);
      tmp.position.set(0, s.y + (1 - t) * 3.5, 0);
      tmp.quaternion.identity();
      const sc = 0.92 + 0.08 * t;
      tmp.scale.set((W + 0.5) * sc, 0.16, (D + 0.5) * sc);
      tmp.updateMatrix();
      refs.slabs.current.setMatrixAt(i, tmp.matrix);
    });
    refs.slabs.current.instanceMatrix.needsUpdate = true;

    // facade panels close in from outside
    const placeGlass = (list, mesh) => {
      list.forEach((g, i) => {
        const t = easeOut(range(p, g.a, g.b));
        if (t <= 0) return mesh.setMatrixAt(i, hidden);
        const off = (1 - t) * 1.6;
        tmp.position.set(g.x + g.nx * off, g.y, g.z + g.nz * off);
        tmp.rotation.set(0, g.rot, 0);
        tmp.scale.set(BAY - 0.35, (FH - 0.4) * t, 0.06);
        tmp.updateMatrix();
        mesh.setMatrixAt(i, tmp.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    placeGlass(darkIdx, refs.glass.current);
    placeGlass(litIdx, refs.glassLit.current);

    const fT = easeOut(range(p, ...T.foundation));
    refs.foundation.current.scale.set(W + 1.6, Math.max(0.001, 0.45 * fT), D + 1.6);
    refs.foundation.current.position.y = -0.45 + 0.45 * fT * 0.5;

    const rT = easeOut(range(p, ...T.roof));
    refs.roof.current.visible = rT > 0;
    refs.roof.current.position.y = BUILDING_HEIGHT + 0.45 + (1 - rT) * 1.5;
    refs.roof.current.scale.setScalar(Math.max(0.001, rT));
  };

  const damped = useRef(progress.value);
  useFrame((_, dt) => {
    damped.current += (progress.value - damped.current) * (1 - Math.exp(-dt * 6));
    if (Math.abs(progress.value - damped.current) < 0.0005) damped.current = progress.value;
    if (damped.current !== shown.current) {
      shown.current = damped.current;
      apply(damped.current);
    }
    glassLit.emissiveIntensity = glow.value * 0.75;
  });

  const box = boxGeometry();
  const beam = iBeamGeometry();
  return (
    <group>
      <mesh ref={refs.foundation} geometry={box} material={m.concreteDark} receiveShadow />
      <instancedMesh ref={refs.columns} args={[beam, m.steel, layout.columns.length]} castShadow={castShadow} receiveShadow />
      <instancedMesh ref={refs.beams} args={[beam, m.steelPainted, layout.beams.length]} castShadow={castShadow} receiveShadow />
      <instancedMesh ref={refs.slabs} args={[box, m.concrete, layout.slabs.length]} castShadow={castShadow} receiveShadow />
      <instancedMesh ref={refs.glass} args={[box, m.glass, darkIdx.length]} />
      <instancedMesh ref={refs.glassLit} args={[box, glassLit, litIdx.length]} />
      {/* rooftop plant room */}
      <group ref={refs.roof} scale={0.001}>
        <mesh geometry={box} material={m.concrete} position={[-2.4, 0, -0.6]} scale={[2.6, 0.9, 2]} castShadow={castShadow} />
        <mesh geometry={box} material={m.steel} position={[2.4, -0.15, 0.8]} scale={[1.4, 0.6, 1.2]} castShadow={castShadow} />
        <mesh geometry={box} material={m.concreteDark} position={[0, -0.35, 0]} scale={[W + 0.5, 0.2, D + 0.5]} />
      </group>
    </group>
  );
}

/* ---------- Tower crane: slews with progress, hook follows the work ---------- */
export function Crane({ progress, mobile }) {
  const jib = useRef();
  const hook = useRef();
  const cable = useRef();
  const m = materials();
  const box = boxGeometry();
  const H = BUILDING_HEIGHT + 4.5;
  useFrame(() => {
    const p = progress.value;
    if (jib.current) jib.current.rotation.y += (-0.9 + p * 2.6 - jib.current.rotation.y) * 0.06;
    if (hook.current) {
      const y = Math.min(BUILDING_HEIGHT, p * BUILDING_HEIGHT * 1.1) + 1.5;
      hook.current.position.y = y - H;
      cable.current.scale.y = H - y;
      cable.current.position.y = (H - y) / 2;
    }
  });
  if (mobile) return null;
  return (
    <group position={[-W / 2 + 1, 0, -D / 2 - 3.5]}>
      {/* mast */}
      <mesh geometry={box} material={m.steelPainted} position={[0, H / 2, 0]} scale={[0.5, H, 0.5]} castShadow />
      <group ref={jib} position={[0, H, 0]}>
        <mesh geometry={box} material={m.steelPainted} position={[-5.5, 0.2, 0]} scale={[14, 0.35, 0.35]} castShadow />
        <mesh geometry={box} material={m.concreteDark} position={[3.2, 0, 0]} scale={[1.4, 0.8, 0.8]} />
        <mesh geometry={box} material={m.steelPainted} position={[0, 1.2, 0]} scale={[0.3, 2, 0.3]} />
        <group position={[-8, 0, 0]}>
          <group ref={hook}>
            <mesh ref={cable} geometry={box} material={m.steel} scale={[0.03, 1, 0.03]} />
            <mesh geometry={box} material={m.helmet} scale={[0.35, 0.35, 0.35]} />
          </group>
        </group>
      </group>
    </group>
  );
}
