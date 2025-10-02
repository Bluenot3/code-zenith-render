import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/state/useStore';

export const Particles = () => {
  const particles = useStore((state) => state.particles);
  const theme = useStore((state) => state.theme);
  const pointsRef = useRef<THREE.Points>(null);
  
  const { geometry, initialPositions } = useMemo(() => {
    const count = particles.density;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const initPos = new Float32Array(count * 3);
    
    const color = new THREE.Color(theme.background);
    
    for (let i = 0; i < count; i++) {
      const radius = 5 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      initPos[i * 3] = x;
      initPos[i * 3 + 1] = y;
      initPos[i * 3 + 2] = z;
      
      colors[i * 3] = Math.min(1, Math.max(0, color.r + (Math.random() - 0.5) * 0.3));
      colors[i * 3 + 1] = Math.min(1, Math.max(0, color.g + (Math.random() - 0.5) * 0.3));
      colors[i * 3 + 2] = Math.min(1, Math.max(0, color.b + (Math.random() - 0.5) * 0.3));
      
      sizes[i] = Math.random() * 2 + 0.5;
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return { geometry: geo, initialPositions: initPos };
  }, [particles.density, theme.background]);
  
  useFrame((state) => {
    if (!particles.enabled || !geometry) return;
    
    const positions = geometry.attributes.position.array as Float32Array;
    const sizes = geometry.attributes.size?.array as Float32Array;
    const time = state.clock.elapsedTime * particles.driftSpeed;
    
    if (particles.orbitMode) {
      const count = positions.length / 3;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = initialPositions[i3];
        const z = initialPositions[i3 + 2];
        const angle = time * 0.1;
        
        positions[i3] = x * Math.cos(angle) - z * Math.sin(angle);
        positions[i3 + 2] = x * Math.sin(angle) + z * Math.cos(angle);
      }
    } else {
      const count = positions.length / 3;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3 + 1] -= 0.01 * particles.driftSpeed;
        
        if (positions[i3 + 1] < -15) {
          positions[i3 + 1] = 15;
        }
      }
    }
    
    if (particles.twinkle && sizes) {
      const count = sizes.length;
      for (let i = 0; i < count; i++) {
        sizes[i] = Math.abs(Math.sin(time + i * 0.1)) * 2 + 0.5;
      }
      geometry.attributes.size.needsUpdate = true;
    }
    
    geometry.attributes.position.needsUpdate = true;
  });
  
  if (!particles.enabled) return null;
  
  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={1}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};