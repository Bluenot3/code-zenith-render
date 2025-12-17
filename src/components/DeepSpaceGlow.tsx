import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const DeepSpaceGlow = () => {
  const meshRef = useRef<THREE.Points>(null);
  const isMobile = useIsMobile();
  
  const glowCount = isMobile ? 15 : 40;
  
  const { positions, colors, scales } = useMemo(() => {
    const pos = new Float32Array(glowCount * 3);
    const col = new Float32Array(glowCount * 3);
    const scl = new Float32Array(glowCount);
    
    const palette = [
      new THREE.Color('#1a0533'),
      new THREE.Color('#0a1628'),
      new THREE.Color('#120a28'),
      new THREE.Color('#0d1a2d'),
      new THREE.Color('#1a0a1a'),
      new THREE.Color('#0a1a1a'),
    ];
    
    for (let i = 0; i < glowCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 180 + Math.random() * 60;
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
      
      const color = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
      
      scl[i] = 30 + Math.random() * 50;
    }
    
    return { positions: pos, colors: col, scales: scl };
  }, [glowCount]);

  useFrame((state) => {
    if (!meshRef.current) return;
    if (isMobile && state.clock.elapsedTime % 4 < 3.9) return;
    
    const time = state.clock.elapsedTime * 0.05;
    meshRef.current.rotation.y = time;
    meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
  });

  return (
    <points ref={meshRef} renderOrder={-90}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={glowCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={glowCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={80}
        vertexColors
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};
