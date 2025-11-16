import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';
import { SharedGeometries } from '@/utils/sharedResources';

export const QuantumRift = () => {
  const isMobile = useIsMobile();
  const riftRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  const { particleGeometry, particleMaterial } = useMemo(() => {
    const particleCount = isMobile ? 3000 : 6000; // More particles, GPU-optimized
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    
    const color1 = new THREE.Color('#00FFD5');
    const color2 = new THREE.Color('#7B2CBF');
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 3;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 8;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;
      
      velocities[i3] = Math.cos(angle) * 0.5;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.2;
      velocities[i3 + 2] = Math.sin(angle) * 0.5;
      
      const colorMix = Math.random();
      const color = color1.clone().lerp(color2, colorMix);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      sizes[i] = Math.random() * 0.15 + 0.05;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 velocity;
        uniform float time;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          vec3 pos = position;
          float swirl = time * 2.0 + length(pos.xz) * 0.5;
          float c = cos(swirl);
          float s = sin(swirl);
          pos.xz = mat2(c, -s, s, c) * pos.xz;
          pos += velocity * sin(time * 0.5 + position.y * 2.0) * 0.3;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = 1.0 - (dist * 2.0);
          alpha = pow(alpha, 2.0);
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    return { particleGeometry: geometry, particleMaterial: material };
  }, [isMobile]);
  
  useFrame((state) => {
    if (riftRef.current) {
      riftRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
      riftRef.current.rotation.y += 0.005;
      riftRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.15);
    }
    
    if (particlesRef.current) {
      const mat = particlesRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <group position={[0, 0, -20]}>
      <mesh ref={riftRef}>
        <torusGeometry args={[2.5, 0.8, 32, 100]} />
        <meshPhysicalMaterial
          color="#00FFD5"
          emissive="#00FFD5"
          emissiveIntensity={4}
          transparent
          opacity={0.7}
          metalness={1}
          roughness={0}
          clearcoat={1}
          transmission={0.5}
        />
      </mesh>
      <points ref={particlesRef} geometry={particleGeometry} material={particleMaterial} />
    </group>
  );
};
