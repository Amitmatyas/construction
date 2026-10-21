import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Html } from '@react-three/drei';
import { iBeamGeometry, boxGeometry, easeInOut } from './geometry.js';
import { materials, StudioEnvironment } from './materials.jsx';
import HelmetModel from './HelmetModel.jsx';

const lerp = THREE.MathUtils.lerp;
const pointer = { x: 0, y: 0 };

/*
 * A column-to-beam joint on a concrete slab. Each part has an assembled pose and an
 * exploded offset/rotation; `amount` (0 assembled → 1 exploded) blends between them.
 */
const PARTS = [
  { key: 'slab', label: 'תקרת בטון', note: 'בסיס יציב לכל השאר', off: [0, -1.1, 0], rot: [0, 0, 0], labelAt: [-1.5, 0.35, 1.1] },
  { key: 'plate', label: 'פלטת בסיס', note: 'מפזרת עומס, מונעת תזוזה', off: [0, -0.75, 0], rot: [0, 0.4, 0], labelAt: [-0.9, 0, 0.5] },
  { key: 'bolts', label: 'ברגי עיגון', note: 'הפרט שאף אחד לא רואה', off: [0, -0.2, 0], rot: [0, 0, 0], labelAt: [0.9, 0.15, -0.6] },
  { key: 'column', label: 'עמוד פלדה', note: 'ישר, בפלס ובאנך', off: [0, 0.6, 0], rot: [0, 0.7, 0], labelAt: [0.7, -0.5, 0] },
  { key: 'beamA', label: 'קורה ראשית', note: 'מחברת את המבנה לשלם', off: [1.25, 0.7, 0], rot: [0, 0, 0.22], labelAt: [0.4, 0.45, 0] },
  { key: 'beamB', label: 'קורה משנית', note: 'יציבות לכל הכיוונים', off: [0, 0.55, 1.5], rot: [-0.25, 0, 0], labelAt: [0, 0.45, 0.2] },
  { key: 'helmet', label: 'קסדת מגן', note: 'בטיחות היא לא פשרה', off: [-0.2, 2.4, 0.5], rot: [0.4, 1.2, -0.3], labelAt: [0.75, 0.55, 0] }
];

// on small screens only the main parts are labelled, so labels don't collide
const MOBILE_LABELS = new Set(['column', 'beamA', 'bolts', 'helmet']);

function Part({ part, amount, children, base = [0, 0, 0], mobile }) {
  const ref = useRef();
  const label = useRef();
  useFrame(() => {
    const e = easeInOut(amount.value);
    const g = ref.current;
    g.position.set(base[0] + part.off[0] * e, base[1] + part.off[1] * e, base[2] + part.off[2] * e);
    g.rotation.set(part.rot[0] * e, part.rot[1] * e, part.rot[2] * e);
    if (label.current) {
      const o = THREE.MathUtils.clamp((amount.value - 0.45) / 0.35, 0, 1);
      label.current.style.opacity = o;
      label.current.style.transform = `translateY(${(1 - o) * 8}px)`;
    }
  });
  return (
    <group ref={ref}>
      {children}
      {(!mobile || MOBILE_LABELS.has(part.key)) && (
        <Html position={part.labelAt} center zIndexRange={[20, 0]} wrapperClass="xlabel-wrap">
          <div ref={label} className="xlabel" style={{ opacity: 0 }}>
            <strong>{part.label}</strong>
            <span>{part.note}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

function Joint({ amount, mobile }) {
  const m = materials();
  const beam = iBeamGeometry();
  const box = boxGeometry();
  const spin = useRef();
  const bolts = useMemo(() => [[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]], []);
  const P = Object.fromEntries(PARTS.map(p => [p.key, p]));

  useFrame((state, dt) => {
    const k = 1 - Math.exp(-dt * 2.5);
    // slow presentation turn + a little extra rotation while exploded
    spin.current.rotation.y = lerp(spin.current.rotation.y, -0.55 + amount.value * 0.5 + pointer.x * 0.25, k);
    spin.current.rotation.x = lerp(spin.current.rotation.x, pointer.y * -0.08, k);
  });

  return (
    <group ref={spin}>
      <Part part={P.slab} amount={amount} mobile={mobile} base={[0, -1.35, 0]}>
        <mesh geometry={box} material={m.concrete} scale={[4.2, 0.3, 3.2]} castShadow receiveShadow />
      </Part>
      <Part part={P.plate} amount={amount} mobile={mobile} base={[0, -1.17, 0]}>
        <mesh geometry={box} material={m.steel} scale={[0.95, 0.06, 0.95]} castShadow />
      </Part>
      <Part part={P.bolts} amount={amount} mobile={mobile} base={[0, -1.1, 0]}>
        {bolts.map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z]} material={m.bolt} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.22, 12]} />
          </mesh>
        ))}
      </Part>
      <Part part={P.column} amount={amount} mobile={mobile} base={[0, 0.2, 0]}>
        <mesh geometry={beam} material={m.steel} rotation={[-Math.PI / 2, 0, 0]} scale={[0.9, 0.9, 2.6]} castShadow />
      </Part>
      <Part part={P.beamA} amount={amount} mobile={mobile} base={[1.25, 1.2, 0]}>
        <mesh geometry={beam} material={m.steelPainted} rotation={[0, Math.PI / 2, 0]} scale={[0.75, 0.75, 2.2]} castShadow />
      </Part>
      <Part part={P.beamB} amount={amount} mobile={mobile} base={[0, 1.2, 1.05]}>
        <mesh geometry={beam} material={m.steelPainted} scale={[0.65, 0.65, 1.7]} castShadow />
      </Part>
      <Part part={P.helmet} amount={amount} mobile={mobile} base={[-1.45, -0.98, 0.85]}>
        <HelmetModel scale={0.32} rotation={[0, 0.6, 0]} />
      </Part>
    </group>
  );
}

function Rig({ mobile }) {
  const { camera } = useThree();
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 2);
    camera.position.x = lerp(camera.position.x, pointer.x * 0.6, k);
    camera.position.y = lerp(camera.position.y, 1.6 + pointer.y * 0.4, k);
    camera.position.z = lerp(camera.position.z, mobile ? 15.5 : 10.5, k);
    camera.lookAt(0, 0.35, 0);
  });
  return null;
}

export default function ExplodedScene({ amount, visible, mobile, reduced }) {
  useEffect(() => {
    const onMove = e => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <Canvas
      className="xview__canvas"
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      frameloop={visible ? (reduced ? 'demand' : 'always') : 'never'}
      camera={{ position: [0, 1.6, mobile ? 13 : 10.5], fov: 34 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, alpha: true }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 5]} intensity={2.4} color="#fff3e6" />
      <directionalLight position={[-6, 2, -4]} intensity={0.8} color="#c9d6ff" />
      <StudioEnvironment warm={0.6} />
      <Rig mobile={mobile} />
      <Joint amount={amount} mobile={mobile} />
      <ContactShadows position={[0, -2.6, 0]} opacity={0.35} scale={12} blur={2.8} far={4} resolution={256} frames={reduced ? 1 : Infinity} />
    </Canvas>
  );
}
