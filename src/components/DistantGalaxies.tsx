import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const DistantGalaxies = () => {
  const groupRef = useRef<THREE.Group>(null);
  const isMobile = useIsMobile();
  
  const galaxyCount = isMobile ? 4 : 12;
  
  const galaxies = useMemo(() => {
    return Array.from({ length: galaxyCount }, (_, i) => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 200 + Math.random() * 80;
      
      const particleCount = isMobile ? 100 : 300;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      const baseColor = new THREE.Color().setHSL(
        Math.random(),
        0.6 + Math.random() * 0.3,
        0.5 + Math.random() * 0.3
      );
      const coreColor = new THREE.Color().setHSL(
        baseColor.getHSL({ h: 0, s: 0, l: 0 }).h,
        0.4,
        0.9
      );
      
      const arms = 2 + Math.floor(Math.random() * 3);
      const twist = 2 + Math.random() * 3;
      
      for (let j = 0; j < particleCount; j++) {
        const armAngle = (j % arms) * (Math.PI * 2 / arms);
        const distance = Math.pow(Math.random(), 0.5) * 8;
        const angle = armAngle + distance * twist + (Math.random() - 0.5) * 0.5;
        
        const spread = distance * 0.15;
        positions[j * 3] = Math.cos(angle) * distance + (Math.random() - 0.5) * spread;
        positions[j * 3 + 1] = (Math.random() - 0.5) * spread * 0.3;
        positions[j * 3 + 2] = Math.sin(angle) * distance + (Math.random() - 0.5) * spread;
        
        const colorMix = 1 - distance / 8;
        const particleColor = baseColor.clone().lerp(coreColor, colorMix * colorMix);
        colors[j * 3] = particleColor.r;
        colors[j * 3 + 1] = particleColor.g;
        colors[j * 3 + 2] = particleColor.b;
      }
      
      return {
        id: i,
        position: new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        positions,
        colors,
        particleCount,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      };
    });
  }, [galaxyCount, isMobile]);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (isMobile && state.clock.elapsedTime % 5 < 4.9) return;
    
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Points) {
        child.rotation.y += galaxies[i]?.rotationSpeed || 0.001;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {galaxies.map((galaxy) => (
        <points
          key={galaxy.id}
          position={galaxy.position}
          rotation={galaxy.rotation}
          renderOrder={-80}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={galaxy.particleCount}
              array={galaxy.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={galaxy.particleCount}
              array={galaxy.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.8}
            vertexColors
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      ))}
    </group>
  );
};
