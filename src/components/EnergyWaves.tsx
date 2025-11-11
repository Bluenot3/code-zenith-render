import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const EnergyWaves = () => {
  const groupRef = useRef<THREE.Group>(null);
  const wavesRef = useRef<THREE.Mesh[]>([]);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Animate existing waves
    wavesRef.current.forEach((wave, index) => {
      wave.rotation.z += 0.002 * (index % 2 === 0 ? 1 : -1);
      wave.position.x += Math.sin(time * 0.5 + index) * 0.01;
      wave.position.y += Math.cos(time * 0.3 + index) * 0.01;
      
      // Pulsing scale effect
      const scale = 1 + Math.sin(time * 2 + index) * 0.1;
      wave.scale.set(scale, scale, 1);
      
      // Update material opacity for pulsing
      if (wave.material instanceof THREE.MeshBasicMaterial) {
        wave.material.opacity = 0.15 + Math.sin(time * 1.5 + index) * 0.1;
      }
    });
  });
  
  // Create energy wave rings
  const waves = [];
  const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff88', '#ff0088'];
  
  for (let i = 0; i < 8; i++) {
    const radius = 5 + i * 3;
    const geometry = new THREE.RingGeometry(radius, radius + 0.5, 64);
    const color = colors[i % colors.length];
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    waves.push({ geometry, material, position: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20], rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] });
  }
  
  return (
    <group ref={groupRef}>
      {waves.map((wave, index) => (
        <mesh
          key={index}
          geometry={wave.geometry}
          material={wave.material}
          position={wave.position as [number, number, number]}
          rotation={wave.rotation as [number, number, number]}
          ref={(mesh) => {
            if (mesh && !wavesRef.current.includes(mesh)) {
              wavesRef.current[index] = mesh;
            }
          }}
        />
      ))}
    </group>
  );
};
