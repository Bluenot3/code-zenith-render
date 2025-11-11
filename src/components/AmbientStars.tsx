import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const AmbientStars = () => {
  const starsRef = useRef<THREE.Points>(null);
  
  const [positions, colors, sizes] = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Random position in sphere
      const radius = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Subtle color variation
      const brightness = 0.8 + Math.random() * 0.2;
      colors[i3] = brightness;
      colors[i3 + 1] = brightness * (0.9 + Math.random() * 0.1);
      colors[i3 + 2] = brightness;
      
      sizes[i] = Math.random() * 0.3 + 0.1;
    }
    
    return [positions, colors, sizes];
  }, []);
  
  useFrame((state) => {
    if (!starsRef.current) return;
    
    const geo = starsRef.current.geometry;
    const sizes = geo.attributes.size.array as Float32Array;
    
    // Gentle twinkling
    for (let i = 0; i < sizes.length; i++) {
      sizes[i] = Math.abs(Math.sin(state.clock.elapsedTime * 0.5 + i * 0.1)) * 0.3 + 0.1;
    }
    
    geo.attributes.size.needsUpdate = true;
    
    // Slow rotation
    starsRef.current.rotation.y += 0.0001;
  });
  
  return (
    <points ref={starsRef} renderOrder={-3}>
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
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
