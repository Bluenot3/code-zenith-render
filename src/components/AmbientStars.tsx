import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const AmbientStars = () => {
  const isMobile = useIsMobile();
  const starsRef = useRef<THREE.Points>(null);
  
  const [positions, colors, sizes] = useMemo(() => {
    const count = isMobile ? 2500 : 6000; // More stars for ultra-dense field
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Multi-layered ultra-deep field distribution
      const layer = Math.random();
      const radius = 50 + Math.pow(layer, 3) * 150; // Deeper space with cubic falloff
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Ultra-rich spectral color palette for realistic stars
      const starType = Math.random();
      let r, g, b;
      if (starType < 0.3) {
        // O/B type - Blue supergiants
        r = 0.7 + Math.random() * 0.2;
        g = 0.85 + Math.random() * 0.1;
        b = 1.0;
      } else if (starType < 0.5) {
        // A type - White-blue
        r = 0.95 + Math.random() * 0.05;
        g = 0.97 + Math.random() * 0.03;
        b = 1.0;
      } else if (starType < 0.7) {
        // F/G type - Yellow-white
        r = 1.0;
        g = 0.95 + Math.random() * 0.05;
        b = 0.8 + Math.random() * 0.15;
      } else if (starType < 0.85) {
        // K type - Orange
        r = 1.0;
        g = 0.75 + Math.random() * 0.2;
        b = 0.5 + Math.random() * 0.3;
      } else if (starType < 0.95) {
        // M type - Red dwarfs
        r = 1.0;
        g = 0.5 + Math.random() * 0.2;
        b = 0.3 + Math.random() * 0.2;
      } else {
        // Exotic colors - Purple/cyan nebula illumination
        r = 0.6 + Math.random() * 0.4;
        g = 0.3 + Math.random() * 0.4;
        b = 0.9 + Math.random() * 0.1;
      }
      
      colors[i3] = r;
      colors[i3 + 1] = g;
      colors[i3 + 2] = b;
      
      // Ultra-varied sizes with multiple giant stars
      if (Math.random() < 0.92) {
        sizes[i] = Math.random() * 0.5 + 0.1; // Normal stars
      } else if (Math.random() < 0.7) {
        sizes[i] = Math.random() * 1.5 + 1.0; // Giant stars
      } else {
        sizes[i] = Math.random() * 3 + 2; // Supergiant stars
      }
    }
    
    return [positions, colors, sizes];
  }, [isMobile]);
  
  useFrame((state) => {
    if (!starsRef.current) return;
    
    const geo = starsRef.current.geometry;
    const sizes = geo.attributes.size.array as Float32Array;
    const originalSizes = geo.attributes.size.array as Float32Array;
    
    // Advanced twinkling with multiple frequencies and phases
    for (let i = 0; i < sizes.length; i++) {
      const baseSize = i < sizes.length * 0.95 
        ? Math.random() * 0.4 + 0.1 
        : Math.random() * 1.2 + 0.8;
      
      // Multi-frequency twinkling for natural effect
      const twinkle1 = Math.sin(state.clock.elapsedTime * 0.5 + i * 0.1);
      const twinkle2 = Math.sin(state.clock.elapsedTime * 1.3 + i * 0.05) * 0.5;
      const twinkle3 = Math.sin(state.clock.elapsedTime * 2.7 + i * 0.02) * 0.25;
      
      const combined = (twinkle1 + twinkle2 + twinkle3) / 1.75;
      sizes[i] = baseSize * (0.7 + Math.abs(combined) * 0.6);
    }
    
    geo.attributes.size.needsUpdate = true;
    
    // Very slow rotation for parallax effect
    starsRef.current.rotation.y += 0.00005;
    starsRef.current.rotation.x += 0.00002;
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
        size={0.2}
        vertexColors
        transparent
        opacity={0.95}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
};
