import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/state/useStore';

export const Particles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const particles = useStore((state) => state.particles);
  const theme = useStore((state) => state.theme);
  
  const [positions, colors, sizes] = useMemo(() => {
    const count = particles.density;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const color = new THREE.Color(theme.background);
    const glowColor = color.clone().offsetHSL(0, 0, 0.3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;
      
      colors[i3] = glowColor.r;
      colors[i3 + 1] = glowColor.g;
      colors[i3 + 2] = glowColor.b;
      
      sizes[i] = Math.random() * 0.5 + 0.1;
    }
    
    return [positions, colors, sizes];
  }, [particles.density, theme.background]);
  
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const geo = pointsRef.current.geometry;
    const positions = geo.attributes.position.array as Float32Array;
    const sizes = geo.attributes.size.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      if (particles.orbitMode) {
        const angle = state.clock.elapsedTime * 0.1;
        const radius = 10;
        positions[i] = Math.cos(angle + i) * radius;
        positions[i + 2] = Math.sin(angle + i) * radius;
      } else {
        positions[i + 1] -= 0.01 * particles.driftSpeed;
        if (positions[i + 1] < -10) {
          positions[i + 1] = 10;
        }
      }
      
      if (particles.twinkle) {
        const sizeIndex = i / 3;
        sizes[sizeIndex] = Math.abs(Math.sin(state.clock.elapsedTime + i)) * 0.5 + 0.1;
      }
    }
    
    geo.attributes.position.needsUpdate = true;
    geo.attributes.size.needsUpdate = true;
  });
  
  if (!particles.enabled) return null;
  
  return (
    <points ref={pointsRef} renderOrder={-1}>
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
        size={0.05}
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
