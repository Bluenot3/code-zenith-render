import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/use-mobile";
import { SoftPointsMaterial } from "@/components/materials/SoftPointsMaterial";

export const SpaceDust = () => {
  const isMobile = useIsMobile();
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors, sizes, velocities, count } = useMemo(() => {
    const count = isMobile ? 200 : 1200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);

    const dustColors = [
      new THREE.Color("#ffeedd"),
      new THREE.Color("#ddccff"),
      new THREE.Color("#ccffee"),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Spread across wide field, starting deep in scene
      positions[i3] = (Math.random() - 0.5) * 60;
      positions[i3 + 1] = (Math.random() - 0.5) * 60;
      positions[i3 + 2] = -100 + Math.random() * 120;

      // Forward velocity (towards camera) with slight drift
      velocities[i3] = (Math.random() - 0.5) * 0.3;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.3;
      velocities[i3 + 2] = 1.5 + Math.random() * 1.0; // Main forward flow

      const color = dustColors[Math.floor(Math.random() * dustColors.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Much larger, varied sizes
      const sizeRoll = Math.random();
      if (sizeRoll < 0.6) {
        sizes[i] = 1.0 + Math.random() * 2.0;
      } else if (sizeRoll < 0.9) {
        sizes[i] = 2.5 + Math.random() * 2.5;
      } else {
        sizes[i] = 4.0 + Math.random() * 3.0;
      }
    }

    return { positions, colors, sizes, velocities, count };
  }, [isMobile]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;

    for (let i = 0; i < pos.length; i += 3) {
      // Smooth drift on X/Y, main flow on Z (toward camera)
      pos[i] += velocities[i] * delta;
      pos[i + 1] += velocities[i + 1] * delta;
      pos[i + 2] += velocities[i + 2] * delta;

      // Reset to back when passing camera
      if (pos[i + 2] > 25) {
        pos[i + 2] = -100;
        pos[i] = (Math.random() - 0.5) * 60;
        pos[i + 1] = (Math.random() - 0.5) * 60;
      }

      // Gentle X/Y bounds
      if (pos[i] > 35) pos[i] = -35;
      else if (pos[i] < -35) pos[i] = 35;
      if (pos[i + 1] > 35) pos[i + 1] = -35;
      else if (pos[i + 1] < -35) pos[i + 1] = 35;
    }

    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points
      ref={pointsRef}
      key={`dust-${count}`}
      renderOrder={-2}
      frustumCulled={false}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>

      <SoftPointsMaterial
        baseSize={isMobile ? 2.0 : 3.0}
        opacity={0.45}
        attenuation={isMobile ? 100 : 150}
        maxSize={isMobile ? 14 : 22}
      />
    </points>
  );
};
