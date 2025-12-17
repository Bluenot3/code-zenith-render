import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const AmbientStars = () => {
  const isMobile = useIsMobile();
  const starsRef = useRef<THREE.Points>(null);
  const frameCount = useRef(0);
  
  const [positions, colors, sizes, baseSizes] = useMemo(() => {
    const count = isMobile ? 600 : 3500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const baseSizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Multi-layered sphere distribution for rich depth
      const layer = Math.random();
      const radius = 45 + Math.pow(layer, 1.5) * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Rich realistic star color palette
      const starType = Math.random();
      let r, g, b;
      if (starType < 0.35) {
        // Blue-white hot stars
        r = 0.85 + Math.random() * 0.15;
        g = 0.92 + Math.random() * 0.08;
        b = 1.0;
      } else if (starType < 0.6) {
        // Pure white/silver stars
        const brightness = 0.92 + Math.random() * 0.08;
        r = g = b = brightness;
      } else if (starType < 0.8) {
        // Yellow-gold stars
        r = 1.0;
        g = 0.92 + Math.random() * 0.08;
        b = 0.78 + Math.random() * 0.12;
      } else if (starType < 0.92) {
        // Orange-amber stars
        r = 1.0;
        g = 0.75 + Math.random() * 0.15;
        b = 0.55 + Math.random() * 0.15;
      } else {
        // Deep red giants
        r = 1.0;
        g = 0.5 + Math.random() * 0.2;
        b = 0.4 + Math.random() * 0.15;
      }
      
      colors[i3] = r;
      colors[i3 + 1] = g;
      colors[i3 + 2] = b;
      
      // Variable sizes with dramatic bright stars
      const sizeRoll = Math.random();
      let baseSize;
      if (sizeRoll < 0.8) {
        baseSize = Math.random() * 0.35 + 0.1;
      } else if (sizeRoll < 0.95) {
        baseSize = Math.random() * 0.8 + 0.5;
      } else {
        baseSize = Math.random() * 1.5 + 1.0; // Rare bright stars
      }
      sizes[i] = baseSize;
      baseSizes[i] = baseSize;
    }
    
    return [positions, colors, sizes, baseSizes];
  }, [isMobile]);
  
  useFrame((state) => {
    if (!starsRef.current) return;
    
    frameCount.current++;
    
    // Efficient twinkling - desktop only
    if (!isMobile && frameCount.current % 3 === 0) {
      const geo = starsRef.current.geometry;
      const sizes = geo.attributes.size.array as Float32Array;
      const time = state.clock.elapsedTime;
      
      // Update subset for performance
      for (let i = 0; i < sizes.length; i += 2) {
        const twinkle = Math.sin(time * 0.6 + i * 0.04);
        sizes[i] = baseSizes[i] * (0.75 + Math.abs(twinkle) * 0.5);
      }
      
      geo.attributes.size.needsUpdate = true;
    }
    
    // Subtle parallax rotation
    starsRef.current.rotation.y += 0.00004;
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
        size={0.25}
        vertexColors
        transparent
        opacity={0.98}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
};
