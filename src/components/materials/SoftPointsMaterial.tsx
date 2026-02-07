import { useEffect, useMemo } from "react";
import * as THREE from "three";

type SoftPointsMaterialProps = {
  /** Multiplier for per-particle `size` attribute (dimensionless). */
  baseSize?: number;
  /** Overall alpha multiplier (0..1). */
  opacity?: number;
  /** Perspective attenuation strength. Higher = larger points. */
  attenuation?: number;
  /** Clamp to avoid huge points when close to camera. */
  maxSize?: number;
};

export function SoftPointsMaterial({
  baseSize = 1,
  opacity = 0.6,
  attenuation = 60,
  maxSize = 4,
}: SoftPointsMaterialProps) {
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      uniforms: {
        uBaseSize: { value: baseSize },
        uOpacity: { value: opacity },
        uAttenuation: { value: attenuation },
        uMaxSize: { value: maxSize },
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        attribute float size;
        varying vec3 vColor;
        varying float vSize;

        uniform float uBaseSize;
        uniform float uAttenuation;
        uniform float uMaxSize;

        void main() {
          vColor = color;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          // High-end crystal sizing with perspective
          float pointSize = size * uBaseSize * (uAttenuation / max(0.001, -mvPosition.z));
          pointSize = clamp(pointSize, 0.0, uMaxSize);
          vSize = pointSize;

          gl_PointSize = pointSize;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        varying float vSize;
        uniform float uOpacity;
        uniform float uTime;

        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv);
          
          // Discard outside circle
          if (dist > 0.5) discard;
          
          // === CRYSTAL/GLASS EFFECT ===
          
          // 1. Smooth outer edge with crystal-like falloff
          float outerGlow = 1.0 - smoothstep(0.0, 0.5, dist);
          outerGlow = pow(outerGlow, 0.8);
          
          // 2. Sharp inner core (crystal center)
          float innerCore = 1.0 - smoothstep(0.0, 0.15, dist);
          innerCore = pow(innerCore, 2.0);
          
          // 3. Mid-ring refraction band (glass-like caustic)
          float ring1 = smoothstep(0.15, 0.2, dist) * (1.0 - smoothstep(0.25, 0.35, dist));
          float ring2 = smoothstep(0.32, 0.38, dist) * (1.0 - smoothstep(0.42, 0.48, dist));
          float refraction = (ring1 + ring2 * 0.5) * 0.6;
          
          // 4. Subtle highlight offset (simulates light refraction)
          vec2 highlightOffset = vec2(-0.12, 0.12);
          float highlightDist = length(uv - highlightOffset);
          float highlight = 1.0 - smoothstep(0.0, 0.18, highlightDist);
          highlight = pow(highlight, 3.0) * 0.8;
          
          // 5. Secondary smaller highlight
          vec2 highlight2Offset = vec2(0.08, -0.15);
          float highlight2Dist = length(uv - highlight2Offset);
          float highlight2 = 1.0 - smoothstep(0.0, 0.1, highlight2Dist);
          highlight2 = pow(highlight2, 4.0) * 0.4;
          
          // 6. Prismatic color shift for glass effect
          vec3 prismColor = vColor;
          prismColor.r += ring1 * 0.15;
          prismColor.g += ring2 * 0.1;
          prismColor.b += refraction * 0.12;
          
          // 7. Combine all layers
          float alpha = outerGlow * 0.5;
          alpha += innerCore * 0.4;
          alpha += refraction * 0.3;
          alpha += highlight * 0.6;
          alpha += highlight2 * 0.3;
          
          // 8. Final color with crystal clarity
          vec3 finalColor = prismColor;
          finalColor += vec3(1.0) * (highlight + highlight2) * 0.5; // White highlights
          finalColor += vec3(1.0) * innerCore * 0.3; // Bright center
          
          // 9. Edge glow for depth
          float edgeGlow = smoothstep(0.35, 0.48, dist) * (1.0 - smoothstep(0.48, 0.5, dist));
          finalColor += vColor * edgeGlow * 0.4;
          
          // 10. Apply overall opacity with crystal clarity boost
          alpha *= uOpacity * 1.2;
          alpha = clamp(alpha, 0.0, 1.0);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });

    return mat;
  }, []);

  useEffect(() => {
    material.uniforms.uBaseSize.value = baseSize;
    material.uniforms.uOpacity.value = opacity;
    material.uniforms.uAttenuation.value = attenuation;
    material.uniforms.uMaxSize.value = maxSize;
  }, [material, baseSize, opacity, attenuation, maxSize]);

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  return <primitive object={material} attach="material" />;
}
