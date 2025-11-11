import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const PlasmaFields = () => {
  const pointsRef = useRef<THREE.Points[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  
  const fields = useMemo(() => {
    const fieldCount = 5;
    return Array.from({ length: fieldCount }, (_, fieldIndex) => {
      const particleCount = 200;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      
      const baseColor = new THREE.Color();
      baseColor.setHSL(fieldIndex / fieldCount, 1, 0.6);
      
      const centerX = (Math.random() - 0.5) * 30;
      const centerY = (Math.random() - 0.5) * 30;
      const centerZ = (Math.random() - 0.5) * 30;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const radius = Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i3] = centerX + radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = centerY + radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = centerZ + radius * Math.cos(phi);
        
        colors[i3] = baseColor.r;
        colors[i3 + 1] = baseColor.g;
        colors[i3 + 2] = baseColor.b;
        
        sizes[i] = Math.random() * 0.15 + 0.05;
      }
      
      return {
        positions,
        colors,
        sizes,
        center: new THREE.Vector3(centerX, centerY, centerZ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03
        ),
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      };
    });
  }, []);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    fields.forEach((field, fieldIndex) => {
      const points = pointsRef.current[fieldIndex];
      if (!points) return;
      
      const time = state.clock.elapsedTime;
      const geo = points.geometry;
      const positions = geo.attributes.position.array as Float32Array;
      const sizes = geo.attributes.size.array as Float32Array;
      
      // Move field center
      field.center.add(field.velocity);
      
      // Bounce off boundaries
      const bounds = 25;
      if (Math.abs(field.center.x) > bounds) field.velocity.x *= -1;
      if (Math.abs(field.center.y) > bounds) field.velocity.y *= -1;
      if (Math.abs(field.center.z) > bounds) field.velocity.z *= -1;
      
      // Update particle positions in swirling motion
      for (let i = 0; i < positions.length; i += 3) {
        const angle = time * field.rotationSpeed + (i / 3) * 0.1;
        const radius = 5;
        const waveHeight = Math.sin(time + i * 0.1) * 2;
        
        positions[i] = field.center.x + Math.cos(angle) * radius;
        positions[i + 1] = field.center.y + waveHeight;
        positions[i + 2] = field.center.z + Math.sin(angle) * radius;
        
        // Pulsing size
        const sizeIndex = i / 3;
        sizes[sizeIndex] = (Math.sin(time * 2 + i * 0.05) * 0.5 + 0.5) * 0.15 + 0.05;
      }
      
      geo.attributes.position.needsUpdate = true;
      geo.attributes.size.needsUpdate = true;
      
      // Rotate the entire field
      points.rotation.y += field.rotationSpeed * 0.5;
    });
  });
  
  return (
    <group ref={groupRef}>
      {fields.map((field, index) => (
        <points
          key={index}
          ref={(ref) => {
            if (ref) pointsRef.current[index] = ref;
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={field.positions.length / 3}
              array={field.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={field.colors.length / 3}
              array={field.colors}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={field.sizes.length}
              array={field.sizes}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            vertexColors
            transparent
            opacity={0.7}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      ))}
    </group>
  );
};
