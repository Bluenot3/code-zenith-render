import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
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
        uBaseSize:   { value: baseSize },
        uOpacity:    { value: opacity },
        uAttenuation:{ value: attenuation },
        uMaxSize:    { value: maxSize },
        uTime:       { value: 0 },
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
          float pointSize = size * uBaseSize * (uAttenuation / max(0.001, -mvPosition.z));
          pointSize = clamp(pointSize, 0.0, uMaxSize);
          gl_PointSize = pointSize;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        uniform float uOpacity;
        uniform float uTime;

        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv);

          // Hard discard outside disc
          if (dist > 0.5) discard;

          // --- Lens-profile alpha (convex droplet, not flat disc) ---
          float lensDist = dist * 2.0; // 0..1
          float lensAlpha = 1.0 - pow(lensDist, 1.5);
          lensAlpha = smoothstep(0.0, 1.0, lensAlpha);

          // --- Fresnel-style rim (brightens near edge like glass) ---
          float rim = smoothstep(0.3, 0.5, dist);
          rim = pow(rim, 2.5);

          // --- Internal caustic ring (glass-bead refraction at ~65% radius) ---
          float causticR = 0.325; // 65% of 0.5
          float causticWidth = 0.04 + 0.01 * sin(uTime * 1.5 + dist * 20.0);
          float caustic = 1.0 - smoothstep(0.0, causticWidth, abs(dist - causticR));
          caustic = pow(caustic, 2.0) * 0.55;

          // --- Single specular highlight (upper-left, sharp, no sparkle) ---
          vec2 specUV = uv - vec2(-0.13, 0.13);
          float spec = 1.0 - smoothstep(0.0, 0.085, length(specUV));
          spec = pow(spec, 4.0);

          // --- Combine alpha as a liquid glass lens ---
          float alpha = lensAlpha * 0.55 + rim * 0.25 + caustic + spec * 0.45;
          alpha *= uOpacity;

          // --- Color: base + white glass refraction at specular point ---
          vec3 glassColor = vColor * (lensAlpha + rim * 0.4);
          glassColor += vec3(1.0) * spec * 0.9;          // white specular flare
          glassColor += vColor * caustic * 1.2;           // caustic color boost
          glassColor += vec3(1.0) * rim * 0.12;           // faint rim whitening

          gl_FragColor = vec4(glassColor, alpha);
        }
      `,
    });

    return mat;
  }, []);

  // Animate uTime for caustic shimmer (GPU-only cost)
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  useEffect(() => {
    material.uniforms.uBaseSize.value    = baseSize;
    material.uniforms.uOpacity.value     = opacity;
    material.uniforms.uAttenuation.value = attenuation;
    material.uniforms.uMaxSize.value     = maxSize;
  }, [material, baseSize, opacity, attenuation, maxSize]);

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  return <primitive object={material} attach="material" />;
}
