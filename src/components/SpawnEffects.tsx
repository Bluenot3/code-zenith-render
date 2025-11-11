import { useRef, useState, useEffect } from 'react';
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
  const [particles, setParticles] = useState<SparkleParticle[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const newParticles: SparkleParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 0.2 + Math.random() * 0.3;
      newParticles.push({
        id: nextId.current++,
        position: position.clone(),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.random() * speed,
          Math.sin(angle) * speed
        ),
        life: 1
      });
    }
    setParticles(newParticles);
  }, [position, count]);

  useFrame((_, delta) => {
    setParticles(prev => 
      prev
        .map(p => ({
          ...p,
          position: p.position.clone().add(p.velocity.clone().multiplyScalar(delta * 60)),
          velocity: p.velocity.clone().multiplyScalar(0.95),
          life: p.life - delta * 2
        }))
        .filter(p => p.life > 0)
    );
  });

  return (
    <group>
      {particles.map(particle => (
        <mesh key={particle.id} position={particle.position}>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={particle.life}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};
