import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const SpaceDust = () => {
  const isMobile = useIsMobile();
  const pointsRef = useRef<THREE.Points>(null);
  const frameCount = useRef(0);
  
  const { positions, colors, sizes, velocities, count } = useMemo(() => {
    const count = isMobile ? 200 : 1200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    
    const dustColors = [
      new THREE.Color('#ffeedd'),
      new THREE.Color('#ddccff'),
      new THREE.Color('#ccffee'),
    ];
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      positions[i3] = (Math.random() - 0.5) * 70;
      positions[i3 + 1] = (Math.random() - 0.5) * 70;
      positions[i3 + 2] = (Math.random() - 0.5) * 70;
      
      velocities[i3] = (Math.random() - 0.5) * 0.003;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.003;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.003;
      
      const color = dustColors[Math.floor(Math.random() * dustColors.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Ultra fine dust
      sizes[i] = Math.random() * 0.03 + 0.01;
    }
    
    return { positions, colors, sizes, velocities, count };
  }, [isMobile]);
  
  useFrame(() => {
    if (!pointsRef.current) return;
    
    frameCount.current++;
    const skipFrames = isMobile ? 4 : 3;
    if (frameCount.current % skipFrames !== 0) return;
    
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;
    
    const bounds = 35;
    const len = pos.length;
    for (let i = 0; i < len; i += 3) {
      pos[i] += velocities[i];
      pos[i + 1] += velocities[i + 1];
      pos[i + 2] += velocities[i + 2];
      
      if (pos[i] > bounds) pos[i] = -bounds;
      else if (pos[i] < -bounds) pos[i] = bounds;
      if (pos[i + 1] > bounds) pos[i + 1] = -bounds;
      else if (pos[i + 1] < -bounds) pos[i + 1] = bounds;
      if (pos[i + 2] > bounds) pos[i + 2] = -bounds;
      else if (pos[i + 2] < -bounds) pos[i + 2] = bounds;
    }
    
    geo.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={pointsRef} key={`dust-${count}`} renderOrder={-2} frustumCulled={false}>
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
        size={0.02}
        vertexColors
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
};
