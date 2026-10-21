import * as THREE from 'three';
import { Environment, Lightformer } from '@react-three/drei';

export const ORANGE = '#ff5a1f';

// One set of materials shared across all canvases' meshes of the same kind
let mats;
export const materials = () => {
  if (mats) return mats;
  mats = {
    helmet: new THREE.MeshPhysicalMaterial({
      side: THREE.DoubleSide, color: ORANGE, roughness: 0.34, metalness: 0.05,
      clearcoat: 1, clearcoatRoughness: 0.18, sheen: 0.3, sheenColor: new THREE.Color('#ffb08a')
    }),
    helmetDark: new THREE.MeshStandardMaterial({ color: '#0b0b0b', roughness: 1 }),
    stripe: new THREE.MeshStandardMaterial({ color: '#e8e6e1', metalness: 0.9, roughness: 0.15 }),
    steel: new THREE.MeshStandardMaterial({ color: '#b3b9c1', metalness: 0.75, roughness: 0.38 }),
    steelPainted: new THREE.MeshStandardMaterial({ color: '#c2461a', metalness: 0.4, roughness: 0.45 }),
    concrete: new THREE.MeshStandardMaterial({ color: '#9c9890', roughness: 0.92, metalness: 0 }),
    concreteDark: new THREE.MeshStandardMaterial({ color: '#5f5c57', roughness: 0.95 }),
    glass: new THREE.MeshStandardMaterial({ color: '#2a3542', metalness: 0.85, roughness: 0.1 }),
    glassLit: new THREE.MeshStandardMaterial({ color: '#2a3542', emissive: new THREE.Color('#ff9a4a'), emissiveIntensity: 0, metalness: 0.85, roughness: 0.1 }),
    bolt: new THREE.MeshStandardMaterial({ color: '#cfd3d8', metalness: 1, roughness: 0.2 })
  };
  return mats;
};

// Local studio lighting for reflections: no external HDR download
export function StudioEnvironment({ warm = 1 }) {
  return (
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={3} position={[0, 5, 3]} scale={[10, 1.4, 1]} rotation-x={Math.PI / 2.4} />
      <Lightformer form="rect" intensity={1.5} position={[-6, 1, 1]} scale={[1, 7, 1]} rotation-y={Math.PI / 2} />
      <Lightformer form="rect" intensity={1.2 * warm} color={ORANGE} position={[6, 0, -2]} scale={[1, 6, 1]} rotation-y={-Math.PI / 2} />
      <Lightformer form="ring" intensity={2} position={[2, 3, -4]} scale={2} />
    </Environment>
  );
}
