import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const SpaceGradient = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const gradientShader = {
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 middleColor;
      uniform vec3 bottomColor;
      uniform vec3 accentColor;
      uniform float time;
      
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      
      // Noise function for subtle variation
      float noise(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
      }
      
      void main() {
        // Normalized vertical position (-1 to 1)
        float h = normalize(vWorldPosition).y;
        
        // Create gradient zones
        vec3 color;
        
        if (h > 0.3) {
          // Top zone - deep space blue to purple
          float t = (h - 0.3) / 0.7;
          color = mix(middleColor, topColor, t);
        } else if (h > -0.3) {
          // Middle zone - darker blue with hints of purple
          float t = (h + 0.3) / 0.6;
          color = mix(bottomColor, middleColor, t);
        } else {
          // Bottom zone - deep blue-black
          float t = (h + 1.0) / 0.7;
          color = mix(vec3(0.01, 0.01, 0.05), bottomColor, t);
        }
        
        // Add subtle animated noise for depth
        float noiseVal = noise(vWorldPosition * 0.1 + vec3(time * 0.01));
        color += (noiseVal - 0.5) * 0.02;
        
        // Add subtle accent color swirls
        float swirl = sin(vWorldPosition.x * 0.3 + vWorldPosition.y * 0.4 + time * 0.1) * 
                     cos(vWorldPosition.z * 0.2 + time * 0.15);
        color += accentColor * swirl * 0.08;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      topColor: { value: new THREE.Color('#0a0e27') }, // Deep space blue
      middleColor: { value: new THREE.Color('#1a1a3e') }, // Purple-blue
      bottomColor: { value: new THREE.Color('#0d0d1f') }, // Dark blue-black
      accentColor: { value: new THREE.Color('#2d1b69') }, // Purple accent
      time: { value: 0 },
    },
  };
  
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <mesh ref={meshRef} renderOrder={-100}>
      <sphereGeometry args={[200, 64, 64]} />
      <shaderMaterial
        vertexShader={gradientShader.vertexShader}
        fragmentShader={gradientShader.fragmentShader}
        uniforms={gradientShader.uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
};
