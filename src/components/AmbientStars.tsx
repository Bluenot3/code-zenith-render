import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const AmbientStars = () => {
  const isMobile = useIsMobile();
  const starsRef = useRef<THREE.Points>(null);
  const frameCount = useRef(0);
  
  const [positions, colors, sizes, baseSizes] = useMemo(() => {
    const count = isMobile ? 400 : 2500; // Further reduced for mobile
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const baseSizes = new Float32Array(count); // Store base sizes
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Multi-layered sphere distribution for depth
      const layer = Math.random();
      const radius = 50 + Math.pow(layer, 2) * 100; // Non-linear distribution for depth
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Rich color palette - blues, whites, hints of pink/yellow for realism
      const starType = Math.random();
      let r, g, b;
      if (starType < 0.5) {
        // Blue-white stars (hot)
        r = 0.9 + Math.random() * 0.1;
        g = 0.95 + Math.random() * 0.05;
        b = 1.0;
      } else if (starType < 0.8) {
        // Pure white stars
        const brightness = 0.95 + Math.random() * 0.05;
        r = g = b = brightness;
      } else if (starType < 0.95) {
        // Yellow-white stars (cooler)
        r = 1.0;
        g = 0.95 + Math.random() * 0.05;
        b = 0.85 + Math.random() * 0.1;
      } else {
        // Red-orange stars (coolest)
        r = 1.0;
        g = 0.7 + Math.random() * 0.2;
        b = 0.6 + Math.random() * 0.2;
      }
      
      colors[i3] = r;
      colors[i3 + 1] = g;
      colors[i3 + 2] = b;
      
      // Variable sizes with some very large bright stars
      const baseSize = Math.random() < 0.95 
        ? Math.random() * 0.4 + 0.1 
        : Math.random() * 1.2 + 0.8;
      sizes[i] = baseSize;
      baseSizes[i] = baseSize; // Store base size
    }
    
    return [positions, colors, sizes, baseSizes];
  }, [isMobile]);
  
  useFrame((state) => {
    if (!starsRef.current) return;
    
    frameCount.current++;
    
    // Skip twinkling entirely on mobile for better performance
    if (!isMobile) {
      // Only update twinkling every 4 frames on desktop
      if (frameCount.current % 4 === 0) {
        const geo = starsRef.current.geometry;
        const sizes = geo.attributes.size.array as Float32Array;
        const time = state.clock.elapsedTime;
        
        // Optimized twinkling - update subset of stars
        for (let i = 0; i < sizes.length; i += 3) { // Skip every 3rd star
          // Simplified twinkling
          const twinkle = Math.sin(time * 0.8 + i * 0.05);
          sizes[i] = baseSizes[i] * (0.8 + Math.abs(twinkle) * 0.4);
          if (i + 1 < sizes.length) sizes[i + 1] = baseSizes[i + 1] * (0.8 + Math.abs(Math.sin(time * 0.9 + i)) * 0.4);
          if (i + 2 < sizes.length) sizes[i + 2] = baseSizes[i + 2] * (0.8 + Math.abs(Math.sin(time * 0.7 + i)) * 0.4);
        }
        
        geo.attributes.size.needsUpdate = true;
      }
    }
    
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
