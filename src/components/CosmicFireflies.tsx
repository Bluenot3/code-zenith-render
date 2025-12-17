import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

interface Firefly {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  target: THREE.Vector3;
  brightness: number;
  color: THREE.Color;
  phase: number;
}

export const CosmicFireflies = () => {
  const isMobile = useIsMobile();
  const pointsRef = useRef<THREE.Points>(null);
  const firefliesRef = useRef<Firefly[]>([]);
  const frameCount = useRef(0);
  
  const [positions, colors, sizes] = useMemo(() => {
    const count = isMobile ? 80 : 300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const fireflyColors = [
      new THREE.Color('#88ff88'),
      new THREE.Color('#aaffaa'),
      new THREE.Color('#66ffcc'),
      new THREE.Color('#ccff66'),
      new THREE.Color('#ffff88'),
      new THREE.Color('#aaffff'),
    ];
    
    firefliesRef.current = [];
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 50
      );
      
      positions[i3] = pos.x;
      positions[i3 + 1] = pos.y;
      positions[i3 + 2] = pos.z;
      
      const color = fireflyColors[Math.floor(Math.random() * fireflyColors.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      sizes[i] = Math.random() * 0.15 + 0.05;
      
      firefliesRef.current.push({
        position: pos,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.06,
          (Math.random() - 0.5) * 0.08
        ),
        target: new THREE.Vector3(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 40
        ),
        brightness: Math.random(),
        color,
        phase: Math.random() * Math.PI * 2,
      });
    }
    
    return [positions, colors, sizes];
  }, [isMobile]);
  
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return;
    
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;
    const col = geo.attributes.color.array as Float32Array;
    const siz = geo.attributes.size.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    firefliesRef.current.forEach((firefly, i) => {
      const i3 = i * 3;
      
      // Seek towards target with smooth steering
      const toTarget = new THREE.Vector3().subVectors(firefly.target, firefly.position);
      const distance = toTarget.length();
      
      if (distance < 3) {
        // Pick new target
        firefly.target.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 40
        );
      }
      
      // Gentle steering force
      toTarget.normalize().multiplyScalar(0.002);
      firefly.velocity.add(toTarget);
      
      // Limit speed
      const maxSpeed = 0.12;
      if (firefly.velocity.length() > maxSpeed) {
        firefly.velocity.normalize().multiplyScalar(maxSpeed);
      }
      
      // Add some erratic darting motion
      if (Math.random() < 0.01) {
        firefly.velocity.add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.1
        ));
      }
      
      firefly.position.add(firefly.velocity);
      
      pos[i3] = firefly.position.x;
      pos[i3 + 1] = firefly.position.y;
      pos[i3 + 2] = firefly.position.z;
      
      // Twinkling/pulsing brightness
      const pulse = Math.sin(time * 4 + firefly.phase);
      const brightness = 0.4 + Math.abs(pulse) * 0.6;
      
      col[i3] = firefly.color.r * brightness;
      col[i3 + 1] = firefly.color.g * brightness;
      col[i3 + 2] = firefly.color.b * brightness;
      
      // Size pulse
      siz[i] = (0.08 + Math.abs(pulse) * 0.12);
      
      // Keep in bounds
      const bounds = 30;
      ['x', 'y', 'z'].forEach((axis, idx) => {
        if (Math.abs(firefly.position[axis as 'x' | 'y' | 'z']) > bounds) {
          firefly.velocity[axis as 'x' | 'y' | 'z'] *= -0.8;
          firefly.position[axis as 'x' | 'y' | 'z'] *= 0.95;
        }
      });
    });
    
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    geo.attributes.size.needsUpdate = true;
  });
  
  return (
    <points ref={pointsRef} renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
};
