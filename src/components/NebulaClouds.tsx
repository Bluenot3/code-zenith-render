import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const NebulaClouds = () => {
  const groupRef = useRef<THREE.Group>(null);
  const cloudPointsRef = useRef<THREE.Points[]>([]);
  
  const clouds = useMemo(() => {
    const cloudCount = 5; // Optimized cloud count
    const cloudData = [];
    
    for (let cloudIndex = 0; cloudIndex < cloudCount; cloudIndex++) {
      const particleCount = 600; // Optimized particle density
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      
      // Cloud center position
      const centerX = (Math.random() - 0.5) * 40;
      const centerY = (Math.random() - 0.5) * 40;
      const centerZ = (Math.random() - 0.5) * 40;
      
      // Enhanced cosmic color palette
      const colorPalettes = [
        [new THREE.Color('#ff6b9d'), new THREE.Color('#c06c84')],
        [new THREE.Color('#6b5b95'), new THREE.Color('#88d8b0')],
        [new THREE.Color('#feb236'), new THREE.Color('#ff6f91')],
        [new THREE.Color('#4ecdc4'), new THREE.Color('#44a08d')],
        [new THREE.Color('#f38181'), new THREE.Color('#aa4465')],
        [new THREE.Color('#667eea'), new THREE.Color('#764ba2')],
        [new THREE.Color('#00d4ff'), new THREE.Color('#090979')],
        [new THREE.Color('#f093fb'), new THREE.Color('#f5576c')],
        [new THREE.Color('#4facfe'), new THREE.Color('#00f2fe')],
        [new THREE.Color('#fa709a'), new THREE.Color('#fee140')],
      ];
      
      const palette = colorPalettes[cloudIndex % colorPalettes.length];
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Create volumetric cloud shape using gaussian distribution
        const spreadX = (Math.random() - 0.5) * 2;
        const spreadY = (Math.random() - 0.5) * 2;
        const spreadZ = (Math.random() - 0.5) * 2;
        
        const radius = Math.sqrt(spreadX * spreadX + spreadY * spreadY + spreadZ * spreadZ);
        const density = Math.exp(-radius * radius / 2);
        
        const scale = 8;
        positions[i3] = centerX + spreadX * scale;
        positions[i3 + 1] = centerY + spreadY * scale;
        positions[i3 + 2] = centerZ + spreadZ * scale;
        
        // Color gradient within cloud
        const colorMix = Math.random();
        const color = palette[0].clone().lerp(palette[1], colorMix);
        
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        // Size based on density
        sizes[i] = density * (Math.random() * 0.6 + 0.3);
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
  }, []);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Throttle to every 3rd frame
    if (Math.floor(time * 60) % 3 !== 0) return;
    
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
