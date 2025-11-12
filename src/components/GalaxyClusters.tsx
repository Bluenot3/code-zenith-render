import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const GalaxyClusters = () => {
  const groupRef = useRef<THREE.Group>(null);
  const galaxyRefs = useRef<THREE.Points[]>([]);
  
  const galaxies = useMemo(() => {
    const galaxyCount = 4; // Optimized galaxy count
    const galaxyData = [];
    
    for (let g = 0; g < galaxyCount; g++) {
      const particleCount = 1000; // Optimized particle count
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      
      // Galaxy position - far in the background
      const galaxyDistance = 80 + Math.random() * 60;
      const galaxyAngle = (g / galaxyCount) * Math.PI * 2;
      const galaxyElevation = (Math.random() - 0.5) * 40;
      
      const galaxyCenterX = Math.cos(galaxyAngle) * galaxyDistance;
      const galaxyCenterY = galaxyElevation;
      const galaxyCenterZ = Math.sin(galaxyAngle) * galaxyDistance;
      
      // Galaxy color theme
      const galaxyColorThemes = [
        { core: new THREE.Color('#ffd700'), outer: new THREE.Color('#4169e1') }, // Gold-blue
        { core: new THREE.Color('#ff1493'), outer: new THREE.Color('#9370db') }, // Pink-purple
        { core: new THREE.Color('#00ced1'), outer: new THREE.Color('#191970') }, // Cyan-navy
        { core: new THREE.Color('#ff6347'), outer: new THREE.Color('#8b008b') }, // Orange-purple
        { core: new THREE.Color('#98fb98'), outer: new THREE.Color('#2f4f4f') }, // Green-dark
        { core: new THREE.Color('#f0e68c'), outer: new THREE.Color('#483d8b') }, // Yellow-slate
        { core: new THREE.Color('#ff69b4'), outer: new THREE.Color('#000080') }, // Hot pink-navy
        { core: new THREE.Color('#87ceeb'), outer: new THREE.Color('#1a1a2e') }, // Sky blue-dark
      ];
      
      const colorTheme = galaxyColorThemes[g % galaxyColorThemes.length];
      
      // Create spiral galaxy structure
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Spiral arm parameters
        const armIndex = Math.floor(Math.random() * 3); // 3 spiral arms
        const armAngle = (armIndex / 3) * Math.PI * 2;
        const distanceFromCenter = Math.pow(Math.random(), 0.7) * 12;
        const spiralAngle = armAngle + distanceFromCenter * 0.5;
        
        // Add randomness to spiral
        const spreadAngle = (Math.random() - 0.5) * 0.8;
        const spreadRadius = (Math.random() - 0.5) * 2;
        
        const x = Math.cos(spiralAngle + spreadAngle) * (distanceFromCenter + spreadRadius);
        const z = Math.sin(spiralAngle + spreadAngle) * (distanceFromCenter + spreadRadius);
        const y = (Math.random() - 0.5) * (1.5 - distanceFromCenter * 0.1); // Flatter near center
        
        positions[i3] = galaxyCenterX + x;
        positions[i3 + 1] = galaxyCenterY + y;
        positions[i3 + 2] = galaxyCenterZ + z;
        
        // Color gradient from core to outer arms
        const distanceRatio = distanceFromCenter / 12;
        const color = colorTheme.core.clone().lerp(colorTheme.outer, distanceRatio);
        
        // Add some brightness variation
        const brightness = 0.7 + Math.random() * 0.3;
        color.multiplyScalar(brightness);
        
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        // Size - smaller further from center
        sizes[i] = (1 - distanceRatio * 0.5) * (Math.random() * 0.3 + 0.1);
      }
      
      galaxyData.push({
        positions,
        colors,
        sizes,
        center: new THREE.Vector3(galaxyCenterX, galaxyCenterY, galaxyCenterZ),
        rotationSpeed: (Math.random() - 0.5) * 0.0005,
        rotationAxis: new THREE.Vector3(
          Math.random() - 0.5,
          0.5 + Math.random() * 0.5,
          Math.random() - 0.5
        ).normalize(),
      });
    }
    
    return galaxyData;
  }, []);
  
  useFrame((state) => {
    // Throttle to every 3rd frame
    if (Math.floor(state.clock.elapsedTime * 60) % 3 !== 0) return;
    
    galaxies.forEach((galaxy, index) => {
      const points = galaxyRefs.current[index];
      if (!points) return;
      
      // Rotate galaxy around its axis
      points.rotateOnAxis(galaxy.rotationAxis, galaxy.rotationSpeed);
      
      // Subtle pulsing
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.05;
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
            size={0.15}
            vertexColors
            transparent
            opacity={0.8}
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
