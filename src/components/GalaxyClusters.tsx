import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const GalaxyClusters = () => {
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
  const galaxyRefs = useRef<THREE.Points[]>([]);
  const frameCount = useRef(0);
  
  const galaxies = useMemo(() => {
    const galaxyCount = isMobile ? 4 : 8;
    const galaxyData = [];
    
    for (let g = 0; g < galaxyCount; g++) {
      const particleCount = isMobile ? 800 : 1600;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      
      const galaxyDistance = 70 + Math.random() * 70;
      const galaxyAngle = (g / galaxyCount) * Math.PI * 2;
      const galaxyElevation = (Math.random() - 0.5) * 50;
      
      const galaxyCenterX = Math.cos(galaxyAngle) * galaxyDistance;
      const galaxyCenterY = galaxyElevation;
      const galaxyCenterZ = Math.sin(galaxyAngle) * galaxyDistance;
      
      // Vibrant galaxy color themes
      const galaxyColorThemes = [
        { core: new THREE.Color('#ffe066'), mid: new THREE.Color('#ff9933'), outer: new THREE.Color('#3366ff') },
        { core: new THREE.Color('#ff66aa'), mid: new THREE.Color('#cc44aa'), outer: new THREE.Color('#6633cc') },
        { core: new THREE.Color('#66ffee'), mid: new THREE.Color('#33ccbb'), outer: new THREE.Color('#1a3366') },
        { core: new THREE.Color('#ff7744'), mid: new THREE.Color('#ff5522'), outer: new THREE.Color('#660066') },
        { core: new THREE.Color('#aaffaa'), mid: new THREE.Color('#66cc66'), outer: new THREE.Color('#224422') },
        { core: new THREE.Color('#ffee88'), mid: new THREE.Color('#ffcc44'), outer: new THREE.Color('#4444aa') },
        { core: new THREE.Color('#ff88cc'), mid: new THREE.Color('#cc66aa'), outer: new THREE.Color('#220044') },
        { core: new THREE.Color('#88ddff'), mid: new THREE.Color('#44aacc'), outer: new THREE.Color('#112233') },
      ];
      
      const colorTheme = galaxyColorThemes[g % galaxyColorThemes.length];
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        const armIndex = Math.floor(Math.random() * 4); // 4 spiral arms
        const armAngle = (armIndex / 4) * Math.PI * 2;
        const distanceFromCenter = Math.pow(Math.random(), 0.65) * 15;
        const spiralAngle = armAngle + distanceFromCenter * 0.55;
        
        const spreadAngle = (Math.random() - 0.5) * 0.7;
        const spreadRadius = (Math.random() - 0.5) * 2.2;
        
        const x = Math.cos(spiralAngle + spreadAngle) * (distanceFromCenter + spreadRadius);
        const z = Math.sin(spiralAngle + spreadAngle) * (distanceFromCenter + spreadRadius);
        const y = (Math.random() - 0.5) * (1.8 - distanceFromCenter * 0.08);
        
        positions[i3] = galaxyCenterX + x;
        positions[i3 + 1] = galaxyCenterY + y;
        positions[i3 + 2] = galaxyCenterZ + z;
        
        // Three-color gradient for richer appearance
        const distanceRatio = distanceFromCenter / 15;
        let color;
        if (distanceRatio < 0.4) {
          color = colorTheme.core.clone().lerp(colorTheme.mid, distanceRatio / 0.4);
        } else {
          color = colorTheme.mid.clone().lerp(colorTheme.outer, (distanceRatio - 0.4) / 0.6);
        }
        
        const brightness = 0.75 + Math.random() * 0.35;
        color.multiplyScalar(brightness);
        
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        sizes[i] = (1 - distanceRatio * 0.4) * (Math.random() * 0.4 + 0.12);
      }
      
      galaxyData.push({
        positions,
        colors,
        sizes,
        center: new THREE.Vector3(galaxyCenterX, galaxyCenterY, galaxyCenterZ),
        rotationSpeed: (Math.random() - 0.5) * 0.0006,
        rotationAxis: new THREE.Vector3(
          Math.random() - 0.5,
          0.6 + Math.random() * 0.4,
          Math.random() - 0.5
        ).normalize(),
      });
    }
    
    return galaxyData;
  }, [isMobile]);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    frameCount.current++;
    
    if (frameCount.current % 2 !== 0) return;
    
    galaxies.forEach((galaxy, index) => {
      const points = galaxyRefs.current[index];
      if (!points) return;
      
      points.rotateOnAxis(galaxy.rotationAxis, galaxy.rotationSpeed);
      
      const pulse = 1 + Math.sin(time * 0.4 + index * 0.8) * 0.06;
      points.scale.setScalar(pulse);
    });
  });
  
  return (
    <group ref={groupRef} renderOrder={-5}>
      {galaxies.map((galaxy, index) => (
        <points
          key={`galaxy-${index}`}
          ref={(ref) => {
            if (ref) galaxyRefs.current[index] = ref;
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={galaxy.positions.length / 3}
              array={galaxy.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={galaxy.colors.length / 3}
              array={galaxy.colors}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={galaxy.sizes.length}
              array={galaxy.sizes}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.2}
            vertexColors
            transparent
            opacity={0.9}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </points>
      ))}
    </group>
  );
};
