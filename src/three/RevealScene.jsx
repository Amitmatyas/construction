import { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import Building, { BUILDING_HEIGHT } from './Building.jsx';
import { StudioEnvironment, ORANGE } from './materials.jsx';
import { easeInOut } from './geometry.js';

const lerp = THREE.MathUtils.lerp;
const COMPLETE = { value: 1 };

// The finished building at dusk: the camera rises past it while the windows light up
function DuskRig({ reveal, mobile }) {
  const { camera, scene } = useThree();
  const target = useRef(new THREE.Vector3());
  const sky = useRef(new THREE.Color());
  const dayBg = new THREE.Color('#2a2420');
  const nightBg = new THREE.Color('#0b0b10');
  useFrame((_, dt) => {
    const p = easeInOut(reveal.value);
    const angle = lerp(0.95, -0.35, p);
    const radius = lerp(mobile ? 26 : 13, mobile ? 44 : 27, p);
    const k = 1 - Math.exp(-dt * 3);
    camera.position.x = lerp(camera.position.x, Math.sin(angle) * radius, k);
    camera.position.z = lerp(camera.position.z, Math.cos(angle) * radius, k);
    camera.position.y = lerp(camera.position.y, lerp(1.2, 7.5, p), k);
    target.current.set(0, lerp(BUILDING_HEIGHT * 0.75, BUILDING_HEIGHT * 0.45, p), 0);
    camera.lookAt(target.current);
    sky.current.copy(dayBg).lerp(nightBg, p);
    scene.background = sky.current;
    if (scene.fog) scene.fog.color.copy(sky.current);
  });
  return null;
}

export default function RevealScene({ reveal, glow, visible, mobile, reduced }) {
  return (
    <Canvas
      className="reveal__canvas"
      dpr={mobile ? [1, 1.25] : [1, 1.6]}
      frameloop={visible ? (reduced ? 'demand' : 'always') : 'never'}
      camera={{ position: [10, 1.2, 8], fov: 36, near: 0.5, far: 140 }}
      gl={{ antialias: !mobile, toneMapping: THREE.ACESFilmicToneMapping }}
      aria-hidden="true"
    >
      <fog attach="fog" args={['#0b0b10', 30, 75]} />
      <hemisphereLight args={['#ffb27a', '#141018', 0.8]} />
      <directionalLight position={[-12, 6, -10]} intensity={2.2} color={ORANGE} />
      <directionalLight position={[10, 14, 8]} intensity={0.6} color="#9fb6d8" />
      <StudioEnvironment warm={1.4} />
      <DuskRig reveal={reveal} mobile={mobile} />
      <Building progress={COMPLETE} glow={glow} castShadow={false} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.46, 0]}>
        <circleGeometry args={[60, 48]} />
        <meshStandardMaterial color="#121214" roughness={0.6} metalness={0.3} />
      </mesh>
      {!mobile && <Sparkles count={60} scale={[30, 16, 30]} position={[0, 8, 0]} size={1.6} speed={0.15} opacity={0.35} color="#ffc89a" />}
    </Canvas>
  );
}
