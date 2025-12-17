import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/state/useStore';
import { useIsMobile } from '@/hooks/use-mobile';

export const Particles = () => {
  const isMobile = useIsMobile();
  const pointsRef = useRef<THREE.Points>(null);
  const particles = useStore((state) => state.particles);
  const theme = useStore((state) => state.theme);
  const frameCount = useRef(0);
  
  const [positions, colors, sizes] = useMemo(() => {
    const actualDensity = isMobile ? Math.floor(particles.density * 0.2) : particles.density;
    const count = actualDensity;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const baseColor = new THREE.Color(theme.background);
    
    // Rich multi-spectrum color palette for maximum visual impact
    const colorPalette = [
      baseColor.clone().offsetHSL(0, 0.3, 0.5),
      baseColor.clone().offsetHSL(0.1, 0.4, 0.45),
      baseColor.clone().offsetHSL(-0.1, 0.35, 0.5),
      baseColor.clone().offsetHSL(0.05, 0.5, 0.4),
      baseColor.clone().offsetHSL(0.15, 0.45, 0.48),
      baseColor.clone().offsetHSL(-0.05, 0.4, 0.52),
      new THREE.Color('#00ffff').offsetHSL(0, 0.2, 0.1),
      new THREE.Color('#ff00ff').offsetHSL(0, 0.2, 0.1),
      new THREE.Color('#ffff00').offsetHSL(0, 0.2, 0.1),
    ];
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Multi-layered spherical distribution for rich 3D depth
      const layer = Math.random();
      const layerType = Math.floor(layer * 4);
      let radius;
      
      switch (layerType) {
        case 0: radius = 3 + Math.random() * 4; break;  // Inner layer
        case 1: radius = 7 + Math.random() * 5; break;  // Mid layer
        case 2: radius = 12 + Math.random() * 6; break; // Outer layer
        default: radius = 18 + Math.random() * 8; break; // Far layer
      }
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Use varied colors from enhanced palette
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const brightness = 0.75 + Math.random() * 0.5;
      
      colors[i3] = color.r * brightness;
      colors[i3 + 1] = color.g * brightness;
      colors[i3 + 2] = color.b * brightness;
      
      // Varied sizes with dramatic distribution
      const sizeRoll = Math.random();
      if (sizeRoll < 0.7) {
        sizes[i] = Math.random() * 0.2 + 0.05;  // Fine particles
      } else if (sizeRoll < 0.9) {
        sizes[i] = Math.random() * 0.4 + 0.2;   // Medium particles
      } else {
        sizes[i] = Math.random() * 0.7 + 0.4;   // Large bright particles
      }
    }
    
    return [positions, colors, sizes];
  }, [particles.density, theme.background, isMobile]);
  
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    frameCount.current++;
    // Update every other frame for performance
    if (frameCount.current % 2 !== 0) return;
    
    const geo = pointsRef.current.geometry;
    const positions = geo.attributes.position.array as Float32Array;
    const sizes = geo.attributes.size.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < positions.length; i += 3) {
      if (particles.orbitMode) {
        const angle = time * 0.1;
        const radius = 10;
        positions[i] = Math.cos(angle + i) * radius;
        positions[i + 2] = Math.sin(angle + i) * radius;
      } else {
        positions[i + 1] -= 0.012 * particles.driftSpeed;
        if (positions[i + 1] < -10) {
          positions[i + 1] = 10;
        }
      }
      
      if (particles.twinkle) {
        const sizeIndex = i / 3;
        const baseFactor = 0.15 + Math.abs(Math.sin(time * 1.2 + i * 0.3)) * 0.2;
        sizes[sizeIndex] = baseFactor;
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
        size={0.04}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
};
