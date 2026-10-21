import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, ContactShadows } from '@react-three/drei';
import HelmetModel from './HelmetModel.jsx';
import { iBeamGeometry } from './geometry.js';
import { materials, StudioEnvironment, ORANGE } from './materials.jsx';

const lerp = THREE.MathUtils.lerp;

// Shared pointer + scroll state read inside the render loop (no React re-renders)
const input = { x: 0, y: 0, scroll: 0 };

function useInputTracking() {
  useEffect(() => {
    const onMove = e => {
      input.x = (e.clientX / window.innerWidth) * 2 - 1;
      input.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onScroll = () => {
      input.scroll = Math.min(1.2, window.scrollY / window.innerHeight);
    };
    onScroll();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
}

function Helmet({ reduced, mobile }) {
  const group = useRef();
  const intro = useRef(reduced ? 1 : 0);

  useFrame((state, dt) => {
    const g = group.current;
    intro.current = Math.min(1, intro.current + dt * 0.7);
    const e = 1 - Math.pow(1 - intro.current, 4);
    const t = state.clock.elapsedTime;
    const s = input.scroll;
    const k = reduced ? 1 : 1 - Math.exp(-dt * 3);

    // follows the pointer; on scroll it turns and lifts away, handing over to the next scene
    const targetRY = -0.55 + input.x * 0.45 + s * 2.4 + (reduced ? 0 : Math.sin(t * 0.3) * 0.08);
    const targetRX = 0.32 - input.y * 0.22 - s * 0.4;
    g.rotation.y = lerp(g.rotation.y, targetRY - (1 - e) * 2.5, k);
    g.rotation.x = lerp(g.rotation.x, targetRX, k);
    g.rotation.z = lerp(g.rotation.z, -input.x * 0.06, k);
    g.position.y = (reduced ? 0 : Math.sin(t * 0.8) * 0.06) + s * 1.6 - (1 - e) * 1.5;
    g.scale.setScalar((mobile ? 0.62 : 0.86) * (1 - s * 0.25) * (0.6 + 0.4 * e));
  });

  return <HelmetModel ref={group} />;
}

const BEAMS = [
  { p: [-4.6, 2.3, -3.5], r: [0.5, 0.9, 0.7], s: 0.9, d: 0.6 },
  { p: [-3.4, -2.6, -2.2], r: [0.2, -1.1, -0.5], s: 0.8, d: 0.7 },
  { p: [1.2, 3.3, -6], r: [1.3, 0.3, 1.4], s: 1, d: 0.25 },
  { p: [5.6, -3, -7], r: [-0.3, 1.2, 0.9], s: 1.1, d: 0.25 },
  { p: [0.4, -3.6, -4.5], r: [0.1, 1.5, 0.2], s: 0.7, d: 0.4 }
];

function Beams({ reduced }) {
  const geo = iBeamGeometry();
  const mat = materials().steel;
  const refs = useRef([]);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const k = 1 - Math.exp(-dt * 2);
    refs.current.forEach((m, i) => {
      if (!m) return;
      const b = BEAMS[i];
      m.position.x = lerp(m.position.x, b.p[0] - input.x * b.d * 0.8, k);
      m.position.y = lerp(m.position.y, b.p[1] - input.y * b.d * 0.5 + input.scroll * b.d * 3 + (reduced ? 0 : Math.sin(t * 0.4 + i) * 0.12), k);
      if (!reduced) m.rotation.z += dt * 0.04 * (i % 2 ? 1 : -1);
    });
  });
  return BEAMS.map((b, i) => (
    <mesh key={i} ref={el => (refs.current[i] = el)} geometry={geo} material={mat} position={b.p} rotation={b.r} scale={[b.s, b.s, b.s * 4]} />
  ));
}

function Rig() {
  const { camera, size } = useThree();
  useFrame((_, dt) => {
    const mobile = size.width < 820;
    const k = 1 - Math.exp(-dt * 2.5);
    camera.position.x = lerp(camera.position.x, mobile ? 0 : input.x * 0.25, k);
    camera.position.y = lerp(camera.position.y, input.y * 0.15, k);
    camera.position.z = lerp(camera.position.z, (mobile ? 8.2 : 6.4) + input.scroll * 1.5, k);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene({ visible }) {
  useInputTracking();
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [mobile] = useState(() => window.innerWidth < 820);

  return (
    <Canvas
      className="hero__canvas"
      dpr={mobile ? [1, 1.5] : [1, 1.75]}
      frameloop={visible ? (reduced ? 'demand' : 'always') : 'never'}
      camera={{ position: [0, 0, 6.4], fov: 35 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      aria-hidden="true"
    >
      <fog attach="fog" args={['#101011', 6, 15]} />
      <ambientLight intensity={0.08} />
      <spotLight position={[4, 6, 4]} angle={0.45} penumbra={0.9} intensity={60} color="#fff1e0" />
      <pointLight position={[-3, 1.5, -2.5]} intensity={18} color={ORANGE} distance={10} />
      <pointLight position={[2, -2, 3]} intensity={3} color="#8fb4ff" distance={8} />
      <StudioEnvironment />
      <Rig />
      <group position={mobile ? [0, 1.35, 0] : [-1.55, -0.1, 0]}>
        <Helmet reduced={reduced} mobile={mobile} />
        <ContactShadows position={[0, -1.25, 0]} opacity={0.55} scale={6} blur={2.6} far={2.5} resolution={256} frames={reduced ? 1 : Infinity} />
      </group>
      <Beams reduced={reduced} />
      <Sparkles count={mobile ? 50 : 140} scale={[12, 7, 6]} size={2.2} speed={reduced ? 0 : 0.25} opacity={0.55} color="#ffd2b3" noise={0.6} />
    </Canvas>
  );
}
