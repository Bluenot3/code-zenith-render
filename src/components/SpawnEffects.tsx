import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpawnFlashProps {
  position: THREE.Vector3;
  onComplete: () => void;
}

export const SpawnFlash = ({ position, onComplete }: SpawnFlashProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(0.1);
  const [opacity, setOpacity] = useState(1);

  useFrame((_, delta) => {
    setScale(prev => prev + delta * 8);
    setOpacity(prev => Math.max(0, prev - delta * 4));
    
    if (opacity <= 0) {
      onComplete();
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[scale, 16, 16]} />
      <meshBasicMaterial
        color="#00FFD5"
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

interface ShockwaveRingProps {
  position: THREE.Vector3;
  onComplete: () => void;
}

export const ShockwaveRing = ({ position, onComplete }: ShockwaveRingProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(0.5);
  const [opacity, setOpacity] = useState(0.8);

  useFrame((_, delta) => {
    setScale(prev => prev + delta * 6);
    setOpacity(prev => Math.max(0, prev - delta * 2));
    
    if (opacity <= 0) {
      onComplete();
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[scale, scale + 0.1, 32]} />
      <meshBasicMaterial
        color="#00FFD5"
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

interface SparkleParticle {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
}

interface SparklesProps {
  position: THREE.Vector3;
  count: number;
}

export const Sparkles = ({ position, count }: SparklesProps) => {
  const meshRef = useRef<THREE.Points>(null);
  
  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const lifetimes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 0.3 + Math.random() * 0.5;
      const upwardBias = 0.3 + Math.random() * 0.4;
      
      positions[i3] = position.x;
      positions[i3 + 1] = position.y;
      positions[i3 + 2] = position.z;
      
      velocities[i3] = Math.cos(angle) * speed;
      velocities[i3 + 1] = upwardBias;
      velocities[i3 + 2] = Math.sin(angle) * speed;
      
      const color = new THREE.Color().setHSL(0.5 + Math.random() * 0.1, 1, 0.6);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      sizes[i] = 0.05 + Math.random() * 0.08;
      lifetimes[i] = 1;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute vec3 velocity;
        attribute vec3 customColor;
        attribute float size;
        attribute float lifetime;
        uniform float time;
        varying vec3 vColor;
        varying float vLifetime;
        
        void main() {
          vColor = customColor;
          vLifetime = max(0.0, lifetime - time * 2.0);
          vec3 pos = position + velocity * time * 60.0 - vec3(0, time * time * 9.8 * 0.5, 0);
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * vLifetime * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vLifetime;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5 || vLifetime <= 0.0) discard;
          float alpha = (1.0 - dist * 2.0) * vLifetime;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    return { geometry, material };
  }, [position, count]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.time.value += delta;
    }
  });

  return <points ref={meshRef} geometry={geometry} material={material} />;
};
