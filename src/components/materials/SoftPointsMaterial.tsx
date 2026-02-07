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

          // Ultra high-end crystal sizing with enhanced perspective
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

        // Noise function for organic variation
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv);
          float angle = atan(uv.y, uv.x);
          
          // Soft edge discard with anti-aliasing
          if (dist > 0.5) discard;
          
          // === ULTRA HIGH-END CRYSTAL/DIAMOND EFFECT ===
          
          // 1. Multi-layer outer glow with depth
          float outerGlow = 1.0 - smoothstep(0.0, 0.5, dist);
          outerGlow = pow(outerGlow, 0.6);
          
          float softHalo = 1.0 - smoothstep(0.3, 0.5, dist);
          softHalo = pow(softHalo, 1.5) * 0.3;
          
          // 2. Diamond-cut inner core with facets
          float innerCore = 1.0 - smoothstep(0.0, 0.12, dist);
          innerCore = pow(innerCore, 1.8);
          
          // Faceted inner shine (hexagonal pattern simulation)
          float facets = abs(sin(angle * 6.0)) * 0.15 + 0.85;
          innerCore *= facets;
          
          // 3. Multiple refraction rings (diamond-like caustics)
          float ring1 = smoothstep(0.10, 0.14, dist) * (1.0 - smoothstep(0.18, 0.24, dist));
          float ring2 = smoothstep(0.24, 0.28, dist) * (1.0 - smoothstep(0.32, 0.38, dist));
          float ring3 = smoothstep(0.38, 0.42, dist) * (1.0 - smoothstep(0.46, 0.50, dist));
          float refraction = (ring1 * 0.8 + ring2 * 0.5 + ring3 * 0.3);
          
          // Angular variation in rings
          refraction *= (0.7 + 0.3 * abs(sin(angle * 4.0 + dist * 8.0)));
          
          // 4. Primary highlight (main light source reflection)
          vec2 highlightOffset = vec2(-0.10, 0.10);
          float highlightDist = length(uv - highlightOffset);
          float highlight = 1.0 - smoothstep(0.0, 0.16, highlightDist);
          highlight = pow(highlight, 2.5);
          
          // 5. Secondary highlight (secondary light bounce)
          vec2 highlight2Offset = vec2(0.07, -0.12);
          float highlight2Dist = length(uv - highlight2Offset);
          float highlight2 = 1.0 - smoothstep(0.0, 0.09, highlight2Dist);
          highlight2 = pow(highlight2, 3.5) * 0.6;
          
          // 6. Tertiary micro-highlights (sparkle points)
          vec2 spark1 = vec2(0.15, 0.08);
          vec2 spark2 = vec2(-0.08, -0.14);
          vec2 spark3 = vec2(0.12, -0.06);
          float sparkle1 = 1.0 - smoothstep(0.0, 0.04, length(uv - spark1));
          float sparkle2 = 1.0 - smoothstep(0.0, 0.035, length(uv - spark2));
          float sparkle3 = 1.0 - smoothstep(0.0, 0.03, length(uv - spark3));
          float sparkles = (pow(sparkle1, 4.0) + pow(sparkle2, 4.0) + pow(sparkle3, 4.0)) * 0.5;
          
          // 7. Rainbow prismatic dispersion
          vec3 prismColor = vColor;
          float prismAngle = angle + dist * 3.0;
          prismColor.r += sin(prismAngle) * 0.12 + ring1 * 0.18;
          prismColor.g += sin(prismAngle + 2.094) * 0.10 + ring2 * 0.14;
          prismColor.b += sin(prismAngle + 4.188) * 0.14 + ring3 * 0.16;
          
          // 8. Combine alpha layers with enhanced depth
          float alpha = outerGlow * 0.45;
          alpha += softHalo;
          alpha += innerCore * 0.5;
          alpha += refraction * 0.35;
          alpha += highlight * 0.7;
          alpha += highlight2 * 0.4;
          alpha += sparkles * 0.8;
          
          // 9. Final color with diamond brilliance
          vec3 finalColor = prismColor;
          
          // Pure white highlights for maximum brilliance
          finalColor += vec3(1.0) * highlight * 0.7;
          finalColor += vec3(1.0) * highlight2 * 0.5;
          finalColor += vec3(1.0) * sparkles * 0.9;
          finalColor += vec3(1.0) * innerCore * 0.4;
          
          // Subtle color in refraction bands
          finalColor += prismColor * refraction * 0.5;
          
          // 10. Crystal edge rim light
          float rimLight = smoothstep(0.38, 0.48, dist) * (1.0 - smoothstep(0.48, 0.5, dist));
          finalColor += (vColor + vec3(0.3)) * rimLight * 0.5;
          
          // 11. Inner glow warmth
          float innerGlow = 1.0 - smoothstep(0.0, 0.3, dist);
          finalColor += vColor * innerGlow * 0.15;
          
          // 12. Apply opacity with enhanced crystal clarity
          alpha *= uOpacity * 1.3;
          alpha = clamp(alpha, 0.0, 1.0);
          
          // Boost overall brightness for gem-like appearance
          finalColor = finalColor * 1.1 + vec3(0.02);
          
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
