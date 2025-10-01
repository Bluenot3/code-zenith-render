import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/state/useStore';

export const Particles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const particles = useStore((state) => state.particles);
  const theme = useStore((state) => state.theme);
  
  const [positions, colors, sizes] = useMemo(() => {
    const count = particles.density;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const color = new THREE.Color(theme.background);
    
    for (let i = 0; i < count; i++) {
      // Random position in sphere
      const radius = 5 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Random color variation
      colors[i * 3] = color.r + (Math.random() - 0.5) * 0.3;
      colors[i * 3 + 1] = color.g + (Math.random() - 0.5) * 0.3;
      colors[i * 3 + 2] = color.b + (Math.random() - 0.5) * 0.3;
      
      // Random size
      sizes[i] = Math.random() * 2 + 0.5;
    }
    
    return [positions, colors, sizes];
  }, [particles.density, theme.background]);
  
  useFrame((state) => {
    if (!particlesRef.current || !particles.enabled) return;
    
    const time = state.clock.elapsedTime * particles.driftSpeed;
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    if (particles.orbitMode) {
      // Orbit around center
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        const angle = time * 0.1;
        
        positions[i] = x * Math.cos(angle) - z * Math.sin(angle);
        positions[i + 2] = x * Math.sin(angle) + z * Math.cos(angle);
      }
    } else {
      // Linear drift
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.01 * particles.driftSpeed;
        
        // Reset if too low
        if (positions[i + 1] < -15) {
          positions[i + 1] = 15;
        }
      }
    }
    
    // Twinkle effect
    if (particles.twinkle) {
      const sizes = particlesRef.current.geometry.attributes.size.array as Float32Array;
      for (let i = 0; i < sizes.length; i++) {
        sizes[i] = Math.abs(Math.sin(time + i * 0.1)) * 2 + 0.5;
      }
      particlesRef.current.geometry.attributes.size.needsUpdate = true;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  if (!particles.enabled) return null;
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
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