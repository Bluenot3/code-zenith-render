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

      positions[i3] = (Math.random() - 0.5) * 70;
      positions[i3 + 1] = (Math.random() - 0.5) * 70;
      positions[i3 + 2] = (Math.random() - 0.5) * 70;

      // Velocities are in world-units / second (we apply delta-time in the frame loop)
      velocities[i3] = (Math.random() - 0.5) * 0.11;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.11;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.11;

      const color = dustColors[Math.floor(Math.random() * dustColors.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Tiny, varied per-sprite sizes (actually used by the shader material)
      const sizeRoll = Math.random();
      if (sizeRoll < 0.9) {
        sizes[i] = 0.22 + Math.random() * 0.38;
      } else {
        sizes[i] = 0.45 + Math.random() * 0.45;
      }
    }

    return { positions, colors, sizes, velocities, count };
  }, [isMobile]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    // Always-on micro-rotation for smooth “alive” feeling.
    pointsRef.current.rotation.y += delta * 0.006;

    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;

    const bounds = 35;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i] += velocities[i] * delta;
      pos[i + 1] += velocities[i + 1] * delta;
      pos[i + 2] += velocities[i + 2] * delta;

      if (pos[i] > bounds) pos[i] = -bounds;
      else if (pos[i] < -bounds) pos[i] = bounds;
      if (pos[i + 1] > bounds) pos[i + 1] = -bounds;
      else if (pos[i + 1] < -bounds) pos[i + 1] = bounds;
      if (pos[i + 2] > bounds) pos[i + 2] = -bounds;
      else if (pos[i + 2] < -bounds) pos[i + 2] = bounds;
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
        baseSize={isMobile ? 0.85 : 0.95}
        opacity={0.35}
        attenuation={isMobile ? 44 : 52}
        maxSize={isMobile ? 2.0 : 2.4}
      />
    </points>
  );
};

