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

        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv);
          
          // Clean edge discard
          if (dist > 0.5) discard;
          
          // Smooth crystal glow - simple and performant
          float glow = 1.0 - smoothstep(0.0, 0.5, dist);
          glow = pow(glow, 1.2);
          
          // Sharp inner core for crystal look
          float core = 1.0 - smoothstep(0.0, 0.15, dist);
          core = pow(core, 2.0);
          
          // Single clean highlight
          vec2 highlightOffset = vec2(-0.12, 0.12);
          float highlight = 1.0 - smoothstep(0.0, 0.12, length(uv - highlightOffset));
          highlight = pow(highlight, 3.0);
          
          // Subtle rim for glass edge
          float rim = smoothstep(0.35, 0.48, dist) * (1.0 - smoothstep(0.48, 0.5, dist));
          
          // Combine alpha
          float alpha = glow * 0.5 + core * 0.4 + highlight * 0.6 + rim * 0.3;
          alpha *= uOpacity;
          
          // Final color with crystal brilliance
          vec3 finalColor = vColor * glow;
          finalColor += vec3(1.0) * highlight * 0.8;
          finalColor += vec3(1.0) * core * 0.5;
          finalColor += vColor * rim * 0.4;
          
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
