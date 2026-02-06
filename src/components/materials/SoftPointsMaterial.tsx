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
      },
      vertexShader: /* glsl */ `
        attribute float size;
        varying vec3 vColor;

        uniform float uBaseSize;
        uniform float uAttenuation;
        uniform float uMaxSize;

        void main() {
          vColor = color;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          // High-end dust mote sizing: per-particle size + perspective attenuation + clamp
          float pointSize = size * uBaseSize * (uAttenuation / max(0.001, -mvPosition.z));
          gl_PointSize = clamp(pointSize, 0.0, uMaxSize);

          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        uniform float uOpacity;

        void main() {
          // Soft circular sprite (avoids square pixel look)
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);

          float alpha = smoothstep(0.5, 0.0, d);
          alpha = pow(alpha, 1.6);

          gl_FragColor = vec4(vColor, alpha * uOpacity);
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
