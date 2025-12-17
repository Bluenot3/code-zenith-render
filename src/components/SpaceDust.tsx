import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const SpaceDust = () => {
  const isMobile = useIsMobile();
  const pointsRef = useRef<THREE.Points>(null);
  const frameCount = useRef(0);
  
  const { positions, colors, sizes, velocities, count } = useMemo(() => {
    const count = isMobile ? 400 : 2500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    
    const dustColors = [
      new THREE.Color('#ffeedd'),
      new THREE.Color('#ddccff'),
      new THREE.Color('#ccffee'),
      new THREE.Color('#ffddcc'),
      new THREE.Color('#eeddff'),
    ];
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Spread throughout the scene
      positions[i3] = (Math.random() - 0.5) * 80;
      positions[i3 + 1] = (Math.random() - 0.5) * 80;
      positions[i3 + 2] = (Math.random() - 0.5) * 80;
      
      // Gentle drift velocities
      velocities[i3] = (Math.random() - 0.5) * 0.006;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.006;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.006;
      
      // Soft dust colors
      const color = dustColors[Math.floor(Math.random() * dustColors.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Very small sizes for fine dust
      sizes[i] = Math.random() * 0.06 + 0.02;
    }
    
    return { positions, colors, sizes, velocities, count };
  }, [isMobile]);
  
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    frameCount.current++;
    // Smooth updates every frame for fluid dust movement
    if (isMobile && frameCount.current % 2 !== 0) return;
    
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    const bounds = 40;
    for (let i = 0; i < pos.length; i += 3) {
      // Gentle floating motion with turbulence
      pos[i] += velocities[i] + Math.sin(time * 0.2 + i) * 0.0008;
      pos[i + 1] += velocities[i + 1] + Math.cos(time * 0.15 + i) * 0.0008;
      pos[i + 2] += velocities[i + 2];
      
      // Smooth wrap around bounds
      if (pos[i] > bounds) pos[i] = -bounds;
      if (pos[i] < -bounds) pos[i] = bounds;
      if (pos[i + 1] > bounds) pos[i + 1] = -bounds;
      if (pos[i + 1] < -bounds) pos[i + 1] = bounds;
      if (pos[i + 2] > bounds) pos[i + 2] = -bounds;
      if (pos[i + 2] < -bounds) pos[i + 2] = bounds;
    }
    
    geo.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={pointsRef} renderOrder={-2} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.45}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
};
