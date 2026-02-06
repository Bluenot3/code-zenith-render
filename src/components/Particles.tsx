import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/state/useStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { SoftPointsMaterial } from "@/components/materials/SoftPointsMaterial";

export const Particles = () => {
  const isMobile = useIsMobile();
  const pointsRef = useRef<THREE.Points>(null);
  const particles = useStore((state) => state.particles);
  const theme = useStore((state) => state.theme);

  const count = useMemo(() => {
    return isMobile
      ? Math.floor(particles.density * 0.15)
      : Math.floor(particles.density * 0.7);
  }, [isMobile, particles.density]);

  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const baseColor = new THREE.Color(theme.background);

    const colorPalette = [
      baseColor.clone().offsetHSL(0, 0.3, 0.5),
      baseColor.clone().offsetHSL(0.1, 0.4, 0.45),
      baseColor.clone().offsetHSL(-0.1, 0.35, 0.5),
      baseColor.clone().offsetHSL(0.05, 0.5, 0.4),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const layer = Math.random();
      const layerType = Math.floor(layer * 3);
      let radius;

      switch (layerType) {
        case 0:
          radius = 4 + Math.random() * 5;
          break;
        case 1:
          radius = 9 + Math.random() * 6;
          break;
        default:
          radius = 15 + Math.random() * 8;
          break;
      }

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const brightness = 0.8 + Math.random() * 0.4;

      colors[i3] = color.r * brightness;
      colors[i3 + 1] = color.g * brightness;
      colors[i3 + 2] = color.b * brightness;

      // Ultra-fine, per-particle sprite size (actually used by our shader material)
      const sizeRoll = Math.random();
      if (sizeRoll < 0.9) {
        sizes[i] = 0.32 + Math.random() * 0.46;
      } else {
        sizes[i] = 0.55 + Math.random() * 0.55;
      }
    }

    return [positions, colors, sizes];
  }, [count, theme.background]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime;

    // Orbit mode: rotate the whole field for buttery-smooth motion with minimal CPU.
    if (particles.orbitMode) {
      pointsRef.current.rotation.y = time * 0.06;
      pointsRef.current.rotation.x = Math.sin(time * 0.12) * 0.08;
      return;
    }

    // Subtle continuous rotation to enhance perceived detail.
    pointsRef.current.rotation.y += delta * 0.02;

    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;

    // Slow, smooth drift (delta-time based so it feels consistent across devices).
    const driftPerSec = 0.14 * particles.driftSpeed;

    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] -= delta * driftPerSec;
      if (pos[i + 1] < -10) pos[i + 1] = 10;
    }

    geo.attributes.position.needsUpdate = true;
  });

  if (!particles.enabled) return null;

  return (
    <points ref={pointsRef} key={`particles-${count}`} renderOrder={-1}>
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
        // Slightly smaller on mobile (keeps the refined dust aesthetic)
        baseSize={isMobile ? 0.95 : 1.05}
        opacity={0.55}
        attenuation={isMobile ? 52 : 60}
        maxSize={isMobile ? 2.6 : 3.2}
      />
    </points>
  );
};

