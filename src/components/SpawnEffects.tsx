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
  const [hue, setHue] = useState(180);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const newScale = scale + delta * 12;
    setScale(newScale);
    setOpacity(Math.max(0, opacity - delta * 3));
    setHue((hue + delta * 360) % 360);
    
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 2;
      meshRef.current.rotation.y += delta * 3;
    }
    
    if (innerRef.current) {
      innerRef.current.scale.setScalar(Math.sin(newScale * 2) * 0.5 + 1);
    }
    
    if (opacity <= 0) {
      onComplete();
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[scale, 2]} />
        <meshBasicMaterial
          color={`hsl(${hue}, 100%, 60%)`}
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          wireframe
        />
      </mesh>
      <mesh ref={innerRef} position={position}>
        <sphereGeometry args={[scale * 0.7, 32, 32]} />
        <meshBasicMaterial
          color={`hsl(${(hue + 180) % 360}, 100%, 70%)`}
          transparent
          opacity={opacity * 0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight 
        position={position} 
        color={`hsl(${hue}, 100%, 60%)`}
        intensity={opacity * 20} 
        distance={scale * 5} 
      />
    </group>
  );
};

interface ShockwaveRingProps {
  position: THREE.Vector3;
  onComplete: () => void;
}

export const ShockwaveRing = ({ position, onComplete }: ShockwaveRingProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(0.5);
  const [opacity, setOpacity] = useState(0.8);
  const [distortion, setDistortion] = useState(0);

  useFrame((state, delta) => {
    const newScale = scale + delta * 8;
    setScale(newScale);
    setOpacity(Math.max(0, opacity - delta * 1.5));
    setDistortion(distortion + delta * 5);
    
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 3;
      ring2Ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.1);
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += delta * 4;
    }
    
    if (opacity <= 0) {
      onComplete();
    }
  });

  const waveHeight = Math.sin(distortion) * 0.3;

  return (
    <group>
      <mesh ref={meshRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[scale, scale + 0.2, 64]} />
        <meshBasicMaterial
          color="#00FFD5"
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={ring2Ref} position={[position.x, position.y + waveHeight, position.z]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[scale * 0.7, scale * 0.7 + 0.15, 48]} />
        <meshBasicMaterial
          color="#FF00FF"
          transparent
          opacity={opacity * 0.7}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={ring3Ref} position={[position.x, position.y - waveHeight, position.z]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[scale * 1.3, scale * 1.3 + 0.1, 32]} />
        <meshBasicMaterial
          color="#FFFF00"
          transparent
          opacity={opacity * 0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
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
  const timeRef = useRef(0);

  useEffect(() => {
    const newParticles: SparkleParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const phi = Math.random() * Math.PI;
      const speed = 0.3 + Math.random() * 0.5;
      const spiral = Math.random() * Math.PI * 2;
      
      newParticles.push({
        id: nextId.current++,
        position: position.clone(),
        velocity: new THREE.Vector3(
          Math.cos(angle) * Math.sin(phi) * speed,
          Math.cos(phi) * speed + Math.random() * 0.2,
          Math.sin(angle) * Math.sin(phi) * speed
        ).applyAxisAngle(new THREE.Vector3(0, 1, 0), spiral),
        life: 1
      });
    }
    setParticles(newParticles);
  }, [position, count]);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    setParticles(prev => 
      prev
        .map(p => {
          const age = 1 - p.life;
          const curlForce = new THREE.Vector3(
            Math.sin(p.position.y * 5 + timeRef.current * 3) * 0.01,
            Math.sin(p.position.x * 5 + timeRef.current * 2) * 0.01,
            Math.sin(p.position.z * 5 + timeRef.current * 4) * 0.01
          );
          
          const newVelocity = p.velocity.clone()
            .multiplyScalar(0.96)
            .add(curlForce)
            .add(new THREE.Vector3(0, age * 0.002, 0));
          
          return {
            ...p,
            position: p.position.clone().add(newVelocity.clone().multiplyScalar(delta * 60)),
            velocity: newVelocity,
            life: p.life - delta * 1.5
          };
        })
        .filter(p => p.life > 0)
    );
  });

  return (
    <group>
      {particles.map(particle => {
        const hue = ((1 - particle.life) * 360 + timeRef.current * 100) % 360;
        const size = 0.03 * particle.life;
        
        return (
          <group key={particle.id}>
            <mesh position={particle.position}>
              <sphereGeometry args={[size, 8, 8]} />
              <meshBasicMaterial
                color={`hsl(${hue}, 100%, 70%)`}
                transparent
                opacity={particle.life}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <pointLight
              position={particle.position}
              color={`hsl(${hue}, 100%, 60%)`}
              intensity={particle.life * 2}
              distance={0.5}
            />
          </group>
        );
      })}
    </group>
  );
};
