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
    const positions  = new Float32Array(count * 3);
    const colors     = new Float32Array(count * 3);
    const sizes      = new Float32Array(count);
    const velocities = new Float32Array(count * 3);

    const dustColors = [
      new THREE.Color("#ffeedd"),
      new THREE.Color("#ddccff"),
      new THREE.Color("#ccffee"),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      positions[i3]     = (Math.random() - 0.5) * 60;
      positions[i3 + 1] = (Math.random() - 0.5) * 60;
      positions[i3 + 2] = -100 + Math.random() * 120;

      // Calmer, narrower velocity range — no "some fast, some slow" choppiness
      velocities[i3]     = (Math.random() - 0.5) * 0.2;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.2;
      velocities[i3 + 2] = 0.8 + Math.random() * 0.5; // 0.8–1.3, much more uniform

      const color = dustColors[Math.floor(Math.random() * dustColors.length)];
      colors[i3]     = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Micro-dust — very fine, clearly distinct from main particles
      sizes[i] = 0.15 + Math.random() * 0.25; // max 0.4
    }

    return { positions, colors, sizes, velocities, count };
  }, [isMobile]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;

    for (let i = 0; i < pos.length; i += 3) {
      pos[i]     += velocities[i]     * delta;
      pos[i + 1] += velocities[i + 1] * delta;
      pos[i + 2] += velocities[i + 2] * delta;

      if (pos[i + 2] > 25) {
        pos[i + 2] = -100;
        pos[i]     = (Math.random() - 0.5) * 60;
        pos[i + 1] = (Math.random() - 0.5) * 60;
      }

      if (pos[i]     >  35) pos[i]     = -35;
      else if (pos[i]     < -35) pos[i]     =  35;
      if (pos[i + 1] >  35) pos[i + 1] = -35;
      else if (pos[i + 1] < -35) pos[i + 1] =  35;
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
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={count} array={colors}    itemSize={3} />
        <bufferAttribute attach="attributes-size"     count={count} array={sizes}     itemSize={1} />
      </bufferGeometry>

      <SoftPointsMaterial
        baseSize={isMobile ? 0.4 : 0.6}
        opacity={0.4}
        attenuation={isMobile ? 45 : 70}
        maxSize={isMobile ? 2 : 3}
      />
    </points>
  );
};
