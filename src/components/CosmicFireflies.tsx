import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';
import { SoftPointsMaterial } from '@/components/materials/SoftPointsMaterial';

interface Firefly {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  target: THREE.Vector3;
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
    const colors    = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);

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

      positions[i3]     = pos.x;
      positions[i3 + 1] = pos.y;
      positions[i3 + 2] = pos.z;

      const color = fireflyColors[Math.floor(Math.random() * fireflyColors.length)];
      colors[i3]     = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Very fine — distant firefly sparks
      sizes[i] = 0.1 + Math.random() * 0.08;

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
        color,
        phase: Math.random() * Math.PI * 2,
      });
    }

    return [positions, colors, sizes];
  }, [isMobile]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    // Frame-skip preserved for performance
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return;

    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;
    const col = geo.attributes.color.array as Float32Array;
    const siz = geo.attributes.size.array as Float32Array;
    const time = state.clock.elapsedTime;

    firefliesRef.current.forEach((firefly, i) => {
      const i3 = i * 3;

      const toTarget = new THREE.Vector3().subVectors(firefly.target, firefly.position);

      if (toTarget.length() < 3) {
        firefly.target.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 40
        );
      }

      toTarget.normalize().multiplyScalar(0.002);
      firefly.velocity.add(toTarget);

      const maxSpeed = 0.12;
      if (firefly.velocity.length() > maxSpeed) {
        firefly.velocity.normalize().multiplyScalar(maxSpeed);
      }

      if (Math.random() < 0.01) {
        firefly.velocity.add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.1
        ));
      }

      firefly.position.add(firefly.velocity);

      pos[i3]     = firefly.position.x;
      pos[i3 + 1] = firefly.position.y;
      pos[i3 + 2] = firefly.position.z;

      // Twinkling brightness
      const pulse = Math.sin(time * 4 + firefly.phase);
      const brightness = 0.4 + Math.abs(pulse) * 0.6;

      col[i3]     = firefly.color.r * brightness;
      col[i3 + 1] = firefly.color.g * brightness;
      col[i3 + 2] = firefly.color.b * brightness;

      // Fine size pulse
      siz[i] = 0.06 + Math.abs(pulse) * 0.07;

      const bounds = 30;
      (['x', 'y', 'z'] as const).forEach((axis) => {
        if (Math.abs(firefly.position[axis]) > bounds) {
          firefly.velocity[axis] *= -0.8;
          firefly.position[axis] *= 0.95;
        }
      });
    });

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate    = true;
    geo.attributes.size.needsUpdate     = true;
  });

  return (
    <points ref={pointsRef} renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={colors.length / 3}    array={colors}    itemSize={3} />
        <bufferAttribute attach="attributes-size"     count={sizes.length}          array={sizes}     itemSize={1} />
      </bufferGeometry>

      <SoftPointsMaterial
        baseSize={isMobile ? 0.35 : 0.7}
        opacity={0.7}
        attenuation={isMobile ? 30 : 60}
        maxSize={isMobile ? 2 : 4}
      />
    </points>
  );
};
