import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const CosmicAurora = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const isMobile = useIsMobile();

  const auroraShader = useMemo(() => ({
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      
      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = noise(i);
        float b = noise(i + vec2(1.0, 0.0));
        float c = noise(i + vec2(0.0, 1.0));
        float d = noise(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += amplitude * smoothNoise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      void main() {
        vec2 uv = vUv;
        
        float wave1 = sin(uv.x * 3.0 + time * 0.3 + fbm(uv * 2.0 + time * 0.1) * 2.0) * 0.5 + 0.5;
        float wave2 = sin(uv.x * 5.0 - time * 0.2 + fbm(uv * 3.0 - time * 0.15) * 1.5) * 0.5 + 0.5;
        float wave3 = sin(uv.x * 2.0 + time * 0.4 + fbm(uv * 1.5 + time * 0.05) * 3.0) * 0.5 + 0.5;
        
        float band1 = smoothstep(0.3, 0.5, uv.y) * smoothstep(0.7, 0.5, uv.y) * wave1;
        float band2 = smoothstep(0.4, 0.55, uv.y) * smoothstep(0.8, 0.55, uv.y) * wave2;
        float band3 = smoothstep(0.2, 0.45, uv.y) * smoothstep(0.6, 0.45, uv.y) * wave3;
        
        vec3 auroraColor = color1 * band1 + color2 * band2 + color3 * band3;
        
        float noise = fbm(uv * 4.0 + time * 0.1);
        auroraColor *= 0.8 + noise * 0.4;
        
        float alpha = (band1 + band2 + band3) * 0.15;
        alpha *= smoothstep(0.0, 0.2, uv.x) * smoothstep(1.0, 0.8, uv.x);
        
        gl_FragColor = vec4(auroraColor, alpha);
      }
    `,
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color('#00ff88') },
      color2: { value: new THREE.Color('#0088ff') },
      color3: { value: new THREE.Color('#ff00ff') },
    },
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    if (isMobile && state.clock.elapsedTime % 3 < 2.95) return;
    
    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.time.value = state.clock.elapsedTime * 0.5;
  });

  return (
    <mesh ref={meshRef} position={[0, 80, -180]} rotation={[0.3, 0, 0]} renderOrder={-85}>
      <planeGeometry args={[300, 80, 1, 1]} />
      <shaderMaterial
        vertexShader={auroraShader.vertexShader}
        fragmentShader={auroraShader.fragmentShader}
        uniforms={auroraShader.uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
