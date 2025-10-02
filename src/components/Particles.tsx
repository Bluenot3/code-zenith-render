import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/state/useStore';

export const Particles = () => {
  const particles = useStore((state) => state.particles);
  const theme = useStore((state) => state.theme);
  
  const geometry = useMemo(() => {
    const count = particles.density;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const color = new THREE.Color(theme.background);
    
    for (let i = 0; i < count; i++) {
      const radius = 5 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      colors[i * 3] = color.r + (Math.random() - 0.5) * 0.3;
      colors[i * 3 + 1] = color.g + (Math.random() - 0.5) * 0.3;
      colors[i * 3 + 2] = color.b + (Math.random() - 0.5) * 0.3;
      
      sizes[i] = Math.random() * 2 + 0.5;
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geo;
  }, [particles.density, theme.background]);
  
  useFrame((state, delta, frame) => {
    if (!particles.enabled || !frame || !geometry.attributes.position) return;
    
    const time = state.clock.elapsedTime * particles.driftSpeed;
    const positions = geometry.attributes.position.array as Float32Array;
    
    if (particles.orbitMode) {
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        const angle = time * 0.1;
        
        positions[i] = x * Math.cos(angle) - z * Math.sin(angle);
        positions[i + 2] = x * Math.sin(angle) + z * Math.cos(angle);
      }
    } else {
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.01 * particles.driftSpeed;
        
        if (positions[i + 1] < -15) {
          positions[i + 1] = 15;
        }
      }
    }
    
    if (particles.twinkle && geometry.attributes.size) {
      const sizes = geometry.attributes.size.array as Float32Array;
      for (let i = 0; i < sizes.length; i++) {
        sizes[i] = Math.abs(Math.sin(time + i * 0.1)) * 2 + 0.5;
      }
      geometry.attributes.size.needsUpdate = true;
    }
    
    geometry.attributes.position.needsUpdate = true;
  });
  
  if (!particles.enabled) return null;
  
  return (
    <points geometry={geometry}>
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