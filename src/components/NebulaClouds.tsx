import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const NebulaClouds = () => {
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
  const cloudPointsRef = useRef<THREE.Points[]>([]);
  
  const clouds = useMemo(() => {
    const cloudCount = isMobile ? 5 : 10; // Adaptive cloud count
    const cloudData = [];
    
    for (let cloudIndex = 0; cloudIndex < cloudCount; cloudIndex++) {
      const particleCount = isMobile ? 750 : 1500; // Adaptive particles per cloud
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      
      // Cloud center position
      const centerX = (Math.random() - 0.5) * 40;
      const centerY = (Math.random() - 0.5) * 40;
      const centerZ = (Math.random() - 0.5) * 40;
      
      // Enhanced cosmic color palette with more vibrant colors
      const colorPalettes = [
        [new THREE.Color('#ff006e'), new THREE.Color('#8338ec'), new THREE.Color('#3a86ff')],
        [new THREE.Color('#06ffa5'), new THREE.Color('#00d9ff'), new THREE.Color('#4361ee')],
        [new THREE.Color('#ffbe0b'), new THREE.Color('#fb5607'), new THREE.Color('#ff006e')],
        [new THREE.Color('#7209b7'), new THREE.Color('#f72585'), new THREE.Color('#4cc9f0')],
        [new THREE.Color('#06ffa5'), new THREE.Color('#fffb00'), new THREE.Color('#ff006e')],
        [new THREE.Color('#4895ef'), new THREE.Color('#4361ee'), new THREE.Color('#3f37c9')],
        [new THREE.Color('#ff99c8'), new THREE.Color('#fcf6bd'), new THREE.Color('#d0f4de')],
        [new THREE.Color('#f72585'), new THREE.Color('#b5179e'), new THREE.Color('#7209b7')],
        [new THREE.Color('#00f5ff'), new THREE.Color('#00bbf9'), new THREE.Color('#0077b6')],
        [new THREE.Color('#ffba08'), new THREE.Color('#faa307'), new THREE.Color('#f48c06')],
      ];
      
      const palette = colorPalettes[cloudIndex % colorPalettes.length];
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Create ultra-volumetric cloud with fractal-like distribution
        const spreadX = (Math.random() - 0.5) * 2;
        const spreadY = (Math.random() - 0.5) * 2;
        const spreadZ = (Math.random() - 0.5) * 2;
        
        // Multi-scale clustering for ultra-realistic nebula
        const largeScale = Math.exp(-Math.random() * 2);
        const mediumScale = Math.exp(-Math.random() * 4);
        
        const radius = Math.sqrt(spreadX * spreadX + spreadY * spreadY + spreadZ * spreadZ);
        const density = Math.exp(-radius * radius / 3) * largeScale * mediumScale;
        
        const scale = 12; // Larger clouds
        positions[i3] = centerX + spreadX * scale * largeScale;
        positions[i3 + 1] = centerY + spreadY * scale * largeScale;
        positions[i3 + 2] = centerZ + spreadZ * scale * largeScale;
        
        // Tri-color gradient for ultra-vibrant nebula
        const palette = colorPalettes[cloudIndex % colorPalettes.length];
        const colorMix1 = Math.random();
        const colorMix2 = Math.random();
        
        let color;
        if (colorMix1 < 0.33) {
          color = palette[0].clone().lerp(palette[1], colorMix2);
        } else if (colorMix1 < 0.66) {
          color = palette[1].clone().lerp(palette[2], colorMix2);
        } else {
          color = palette[2].clone().lerp(palette[0], colorMix2);
        }
        
        // Add brightness variation
        const brightness = 0.6 + Math.random() * 0.8;
        color.multiplyScalar(brightness);
        
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        // Enhanced size variation based on density and depth
        sizes[i] = density * (Math.random() * 1.2 + 0.5);
      }
      
      cloudData.push({
        positions,
        colors,
        sizes,
        center: new THREE.Vector3(centerX, centerY, centerZ),
        driftSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        ),
        rotationSpeed: (Math.random() - 0.5) * 0.001,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    
    return cloudData;
  }, [isMobile]);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    clouds.forEach((cloud, index) => {
      const points = cloudPointsRef.current[index];
      if (!points) return;
      
      const geometry = points.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const sizes = geometry.attributes.size.array as Float32Array;
      
      // Drift the cloud
      cloud.center.add(cloud.driftSpeed);
      
      // Gentle expansion and contraction
      const breathe = 1 + Math.sin(time * 0.3 + cloud.pulsePhase) * 0.05;
      
      // Update particle positions with subtle swirling
      for (let i = 0; i < positions.length; i += 3) {
        const baseX = positions[i] - cloud.center.x;
        const baseY = positions[i + 1] - cloud.center.y;
        const baseZ = positions[i + 2] - cloud.center.z;
        
        // Add swirling motion
        const swirl = time * cloud.rotationSpeed;
        const distance = Math.sqrt(baseX * baseX + baseZ * baseZ);
        const angle = Math.atan2(baseZ, baseX) + swirl;
        
        positions[i] = cloud.center.x + Math.cos(angle) * distance * breathe;
        positions[i + 1] = cloud.center.y + baseY * breathe + Math.sin(time * 0.2 + i) * 0.1;
        positions[i + 2] = cloud.center.z + Math.sin(angle) * distance * breathe;
        
        // Subtle size pulsing
        const sizeIndex = i / 3;
        const baseSizeFactor = Math.exp(-distance / 16);
        sizes[sizeIndex] = baseSizeFactor * (0.4 + Math.sin(time + i * 0.1) * 0.2);
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;
      
      // Very slow rotation
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
            size={0.8}
            vertexColors
            transparent
            opacity={0.75}
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
