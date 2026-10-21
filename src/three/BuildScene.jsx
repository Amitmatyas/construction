import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Sparkles } from '@react-three/drei';
import Building, { Crane, BUILDING_HEIGHT } from './Building.jsx';
import { StudioEnvironment, ORANGE } from './materials.jsx';
import { easeInOut } from './geometry.js';

const lerp = THREE.MathUtils.lerp;
const pointer = { x: 0, y: 0 };

// Camera travels from a low close angle at the foundations to a wide hero shot
function CameraRig({ progress, mobile }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3());
  useFrame((_, dt) => {
    const p = easeInOut(progress.value);
    const angle = lerp(-1.05, 0.62, p) + pointer.x * 0.08;
    // portrait screens have a narrow horizontal view, so the camera stands further back
    const radius = lerp(mobile ? 30 : 15, mobile ? 42 : 24, p);
    const height = lerp(2.2, 10.5, p) + pointer.y * 0.6;
    const k = 1 - Math.exp(-dt * 3);
    camera.position.x = lerp(camera.position.x, Math.sin(angle) * radius, k);
    camera.position.z = lerp(camera.position.z, Math.cos(angle) * radius, k);
    camera.position.y = lerp(camera.position.y, height, k);
    look.current.lerp(new THREE.Vector3(0, lerp(0.8, BUILDING_HEIGHT * 0.42, p), 0), k);
    camera.lookAt(look.current);
  });
  return null;
}

// Light moves from a cold dawn to warm afternoon as the structure completes
function Lights({ progress, shadows }) {
  const sun = useRef();
  const fill = useRef();
  const cold = new THREE.Color('#9fb6d8');
  const warm = new THREE.Color('#ffd7b0');
  useFrame(() => {
    const p = progress.value;
    if (!sun.current) return;
    sun.current.position.set(lerp(-14, 12, p), lerp(9, 20, p), lerp(6, 10, p));
    sun.current.color.copy(cold).lerp(warm, p);
    sun.current.intensity = lerp(2.6, 4.6, p);
    fill.current.intensity = lerp(0.45, 0.8, p);
  });
  return (
    <>
      <ambientLight ref={fill} intensity={0.25} />
      <directionalLight
        ref={sun}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-10, 3, -8]} intensity={60} distance={34} color={ORANGE} />
      <hemisphereLight args={['#c8d4e6', '#1a1410', 0.35]} />
    </>
  );
}

export default function BuildScene({ progress, visible, mobile, reduced }) {
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
      className="build__canvas"
      shadows={!mobile}
      dpr={mobile ? [1, 1.25] : [1, 1.6]}
      frameloop={visible ? (reduced ? 'demand' : 'always') : 'never'}
      camera={{ position: [-13, 2.2, 8], fov: 38, near: 0.5, far: 120 }}
      gl={{ antialias: !mobile, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      aria-hidden="true"
    >
      <color attach="background" args={['#0d0d0e']} />
      <fog attach="fog" args={['#0d0d0e', 26, 62]} />
      <StudioEnvironment />
      <Lights progress={progress} shadows={!mobile} />
      <CameraRig progress={progress} mobile={mobile} />
      <Building progress={progress} castShadow={!mobile} />
      <Crane progress={progress} mobile={mobile} />
      <Grid
        position={[0, -0.46, 0]}
        args={[80, 80]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#2a2a2c"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#5a3020"
        fadeDistance={55}
        fadeStrength={1.5}
        infiniteGrid
      />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.47, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <shadowMaterial opacity={0.45} />
      </mesh>
      {!mobile && <Sparkles count={80} scale={[30, 14, 30]} position={[0, 6, 0]} size={2} speed={0.2} opacity={0.4} color="#ffd2b3" />}
    </Canvas>
  );
}
