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

      // Spread across full depth, starting far back
      positions[i3] = (Math.random() - 0.5) * 40;
      positions[i3 + 1] = (Math.random() - 0.5) * 40;
      positions[i3 + 2] = -80 + Math.random() * 100; // Start deep in scene

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const brightness = 0.8 + Math.random() * 0.4;

      colors[i3] = color.r * brightness;
      colors[i3 + 1] = color.g * brightness;
      colors[i3 + 2] = color.b * brightness;

      // Fine, detailed particle sizes
      const sizeRoll = Math.random();
      if (sizeRoll < 0.7) {
        sizes[i] = 0.4 + Math.random() * 0.6;
      } else if (sizeRoll < 0.95) {
        sizes[i] = 0.8 + Math.random() * 0.8;
      } else {
        sizes[i] = 1.2 + Math.random() * 1.0;
      }
    }

    return [positions, colors, sizes];
  }, [count, theme.background]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;

    // Slow, smooth flow from back to front (towards camera)
    const flowSpeed = 2.5 * particles.driftSpeed;

    for (let i = 0; i < pos.length; i += 3) {
      // Move toward camera (positive Z)
      pos[i + 2] += delta * flowSpeed;
      
      // Reset to back when passing camera
      if (pos[i + 2] > 25) {
        pos[i + 2] = -80;
        pos[i] = (Math.random() - 0.5) * 40;
        pos[i + 1] = (Math.random() - 0.5) * 40;
      }
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
        baseSize={isMobile ? 1.2 : 1.8}
        opacity={0.55}
        attenuation={isMobile ? 80 : 120}
        maxSize={isMobile ? 8 : 12}
      />
    </points>
  );
};

