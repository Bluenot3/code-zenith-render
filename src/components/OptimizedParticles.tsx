import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/state/useStore';
import { particleVertexShader, particleFragmentShader } from '@/utils/sharedResources';

export const Particles = () => {
  const meshRef = useRef<THREE.Points>(null);
  const particles = useStore((state) => state.particles);
  const theme = useStore((state) => state.theme);
  
  const { geometry, material } = useMemo(() => {
    const count = particles.density;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    
    const color = new THREE.Color(theme.background);
    const glowColor = color.clone().offsetHSL(0, 0, 0.3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      positions[i3] = (Math.random() - 0.5) * 25;
      positions[i3 + 1] = (Math.random() - 0.5) * 25;
      positions[i3 + 2] = (Math.random() - 0.5) * 25;
      
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
      
      colors[i3] = glowColor.r;
      colors[i3 + 1] = glowColor.g;
      colors[i3 + 2] = glowColor.b;
      
      sizes[i] = Math.random() * 0.25 + 0.08;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        twinkle: { value: particles.twinkle ? 1.0 : 0.0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        attribute vec3 velocity;
        uniform float time;
        uniform float twinkle;
        varying vec3 vColor;
        
        void main() {
          vColor = customColor;
          vec3 pos = position + velocity * time;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          float twinkleEffect = twinkle > 0.5 ? (sin(time * 3.0 + position.x * 10.0) * 0.5 + 0.5) : 1.0;
          gl_PointSize = size * twinkleEffect * (350.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: particleFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    return { geometry, material };
  }, [particles.density, theme.background, particles.twinkle]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.time.value = state.clock.elapsedTime * particles.driftSpeed;
    mat.uniforms.twinkle.value = particles.twinkle ? 1.0 : 0.0;
  });
  
  if (!particles.enabled) return null;
  
  return <points ref={meshRef} geometry={geometry} material={material} frustumCulled />;
};
