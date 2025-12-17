import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const NebulaClouds = () => {
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
  const cloudPointsRef = useRef<THREE.Points[]>([]);
  const frameCount = useRef(0);
  
  const clouds = useMemo(() => {
    const cloudCount = isMobile ? 5 : 9;
    const cloudData = [];
    
    for (let cloudIndex = 0; cloudIndex < cloudCount; cloudIndex++) {
      const particleCount = isMobile ? 700 : 1400;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      
      const centerX = (Math.random() - 0.5) * 50;
      const centerY = (Math.random() - 0.5) * 50;
      const centerZ = (Math.random() - 0.5) * 50;
      
      // Vibrant cosmic color palettes
      const colorPalettes = [
        [new THREE.Color('#ff3366'), new THREE.Color('#ff6699'), new THREE.Color('#cc0044')],
        [new THREE.Color('#6633ff'), new THREE.Color('#9966ff'), new THREE.Color('#3300cc')],
        [new THREE.Color('#00ffcc'), new THREE.Color('#33ffdd'), new THREE.Color('#00cc99')],
        [new THREE.Color('#ffaa00'), new THREE.Color('#ffcc44'), new THREE.Color('#ff8800')],
        [new THREE.Color('#ff0099'), new THREE.Color('#ff44bb'), new THREE.Color('#cc0077')],
        [new THREE.Color('#00aaff'), new THREE.Color('#44ccff'), new THREE.Color('#0077cc')],
        [new THREE.Color('#ff5500'), new THREE.Color('#ff7744'), new THREE.Color('#cc3300')],
        [new THREE.Color('#aa00ff'), new THREE.Color('#cc44ff'), new THREE.Color('#7700cc')],
        [new THREE.Color('#00ff66'), new THREE.Color('#44ff88'), new THREE.Color('#00cc44')],
      ];
      
      const palette = colorPalettes[cloudIndex % colorPalettes.length];
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Volumetric cloud with gaussian distribution
        const spreadX = (Math.random() - 0.5) * 2;
        const spreadY = (Math.random() - 0.5) * 2;
        const spreadZ = (Math.random() - 0.5) * 2;
        
        const radius = Math.sqrt(spreadX * spreadX + spreadY * spreadY + spreadZ * spreadZ);
        const density = Math.exp(-radius * radius / 1.8);
        
        const scale = 10;
        positions[i3] = centerX + spreadX * scale;
        positions[i3 + 1] = centerY + spreadY * scale;
        positions[i3 + 2] = centerZ + spreadZ * scale;
        
        // Rich color blending with 3 colors
        const colorMix = Math.random();
        let color;
        if (colorMix < 0.4) {
          color = palette[0].clone().lerp(palette[1], colorMix / 0.4);
        } else {
          color = palette[1].clone().lerp(palette[2], (colorMix - 0.4) / 0.6);
        }
        
        // Boost brightness
        const brightness = 0.9 + Math.random() * 0.3;
        colors[i3] = Math.min(1, color.r * brightness);
        colors[i3 + 1] = Math.min(1, color.g * brightness);
        colors[i3 + 2] = Math.min(1, color.b * brightness);
        
        sizes[i] = density * (Math.random() * 0.8 + 0.4);
      }
      
      cloudData.push({
        positions,
        colors,
        sizes,
        center: new THREE.Vector3(centerX, centerY, centerZ),
        driftSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.012
        ),
        rotationSpeed: (Math.random() - 0.5) * 0.0015,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    
    return cloudData;
  }, [isMobile]);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    frameCount.current++;
    
    if (frameCount.current % 2 !== 0) return;
    
    clouds.forEach((cloud, index) => {
      const points = cloudPointsRef.current[index];
      if (!points) return;
      
      const geometry = points.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const sizes = geometry.attributes.size.array as Float32Array;
      
      cloud.center.add(cloud.driftSpeed);
      
      const breathe = 1 + Math.sin(time * 0.35 + cloud.pulsePhase) * 0.06;
      
      for (let i = 0; i < positions.length; i += 3) {
        const baseX = positions[i] - cloud.center.x;
        const baseY = positions[i + 1] - cloud.center.y;
        const baseZ = positions[i + 2] - cloud.center.z;
        
        const swirl = time * cloud.rotationSpeed;
        const distance = Math.sqrt(baseX * baseX + baseZ * baseZ);
        const angle = Math.atan2(baseZ, baseX) + swirl;
        
        positions[i] = cloud.center.x + Math.cos(angle) * distance * breathe;
        positions[i + 1] = cloud.center.y + baseY * breathe + Math.sin(time * 0.25 + i) * 0.12;
        positions[i + 2] = cloud.center.z + Math.sin(angle) * distance * breathe;
        
        const sizeIndex = i / 3;
        const baseSizeFactor = Math.exp(-distance / 18);
        sizes[sizeIndex] = baseSizeFactor * (0.45 + Math.sin(time * 0.8 + i * 0.1) * 0.25);
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;
      
      points.rotation.y += cloud.rotationSpeed;
    });
  });
  
  return (
    <group ref={groupRef} renderOrder={-2}>
      {clouds.map((cloud, index) => (
        <points
          key={`nebula-${index}`}
          ref={(ref) => {
            if (ref) cloudPointsRef.current[index] = ref;
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={cloud.positions.length / 3}
              array={cloud.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={cloud.colors.length / 3}
              array={cloud.colors}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={cloud.sizes.length}
              array={cloud.sizes}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={1.0}
            vertexColors
            transparent
            opacity={0.85}
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
