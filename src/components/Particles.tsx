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
    const actualDensity = isMobile ? Math.floor(particles.density * 0.15) : Math.floor(particles.density * 0.7);
    const count = actualDensity;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const baseColor = new THREE.Color(theme.background);
    
    const colorPalette = [
      baseColor.clone().offsetHSL(0, 0.3, 0.5),
      baseColor.clone().offsetHSL(0.1, 0.4, 0.45),
      baseColor.clone().offsetHSL(-0.1, 0.35, 0.5),
      baseColor.clone().offsetHSL(0.05, 0.5, 0.4),
    ];
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      const layer = Math.random();
      const layerType = Math.floor(layer * 3);
      let radius;
      
      switch (layerType) {
        case 0: radius = 4 + Math.random() * 5; break;
        case 1: radius = 9 + Math.random() * 6; break;
        default: radius = 15 + Math.random() * 8; break;
      }
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const brightness = 0.8 + Math.random() * 0.4;
      
      colors[i3] = color.r * brightness;
      colors[i3 + 1] = color.g * brightness;
      colors[i3 + 2] = color.b * brightness;
      
      // Much finer particles
      const sizeRoll = Math.random();
      if (sizeRoll < 0.8) {
        sizes[i] = Math.random() * 0.08 + 0.02;  // Very fine
      } else {
        sizes[i] = Math.random() * 0.15 + 0.08;  // Small
      }
    }
    
    return [positions, colors, sizes];
  }, [particles.density, theme.background, isMobile]);
  
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    frameCount.current++;
    // Skip more frames for performance
    const skipFrames = isMobile ? 4 : 3;
    if (frameCount.current % skipFrames !== 0) return;
    
    const geo = pointsRef.current.geometry;
    const positions = geo.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    const len = positions.length;
    for (let i = 0; i < len; i += 3) {
      if (particles.orbitMode) {
        const angle = time * 0.08;
        positions[i] = Math.cos(angle + i * 0.1) * 8;
        positions[i + 2] = Math.sin(angle + i * 0.1) * 8;
      } else {
        positions[i + 1] -= 0.008 * particles.driftSpeed;
        if (positions[i + 1] < -10) positions[i + 1] = 10;
      }
    }
    
    geo.attributes.position.needsUpdate = true;
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
        size={0.025}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
};
