import { forwardRef } from 'react';
import { helmetGeometries } from './geometry.js';
import { materials } from './materials.jsx';

// The site's signature hard hat. Pure geometry; motion is added by whoever uses it.
const HelmetModel = forwardRef(function HelmetModel(props, ref) {
  const g = helmetGeometries();
  const m = materials();
  return (
    <group ref={ref} {...props}>
      <group scale={[1, 1, 1.12]}>
        <mesh geometry={g.shell} material={m.helmet} castShadow />
        <mesh geometry={g.brim} material={m.helmet} castShadow />
        <mesh geometry={g.visor} material={m.helmet} castShadow />
        {[0, 0.42, -0.42].map((rz, i) => (
          <mesh key={i} rotation={[0, Math.PI / 2, rz, 'ZYX']} material={m.helmet} castShadow>
            <torusGeometry args={[0.945, i === 0 ? 0.045 : 0.022, 12, 72, Math.PI]} />
          </mesh>
        ))}
        <mesh position={[0, -0.03, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.helmetDark}>
          <circleGeometry args={[0.97, 48]} />
        </mesh>
        <mesh position={[0, 0.3, 0]} material={m.stripe}>
          <cylinderGeometry args={[0.97, 0.993, 0.07, 72, 1, true]} />
        </mesh>
      </group>
    </group>
  );
});

export default HelmetModel;
