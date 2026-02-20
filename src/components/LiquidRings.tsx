import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * LiquidRings — Desktop-only ambient detail.
 * Three large thin torus rings slowly rotating in the deep background.
 * Uses MeshBasicMaterial + AdditiveBlending: near-zero CPU cost per frame.
 */
export const LiquidRings = () => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.04;
      ring1Ref.current.rotation.x += delta * 0.015;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.025;
      ring2Ref.current.rotation.y += delta * 0.02;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x += delta * 0.035;
      ring3Ref.current.rotation.z += delta * 0.01;
    }
  });

  return (
    <group>
      {/* Ice blue ring */}
      <mesh ref={ring1Ref} position={[2, -3, -38]} rotation={[0.6, 0.3, 0]}>
        <torusGeometry args={[14, 0.06, 8, 120]} />
        <meshBasicMaterial
          color="#88ccff"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Violet ring */}
      <mesh ref={ring2Ref} position={[-4, 5, -45]} rotation={[1.1, -0.4, 0.8]}>
        <torusGeometry args={[18, 0.05, 8, 120]} />
        <meshBasicMaterial
          color="#bb88ff"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Mint ring */}
      <mesh ref={ring3Ref} position={[6, 1, -32]} rotation={[-0.5, 0.7, -0.3]}>
        <torusGeometry args={[11, 0.04, 8, 100]} />
        <meshBasicMaterial
          color="#88ffdd"
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};
