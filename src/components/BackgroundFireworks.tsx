import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Firework {
  id: number;
  position: THREE.Vector3;
  particles: FireworkParticle[];
  age: number;
  maxAge: number;
  color: string;
}

interface FireworkParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  trail: THREE.Vector3[];
  life: number;
}

export const BackgroundFireworks = () => {
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const nextId = useRef(0);
  const spawnTimer = useRef(0);

  const colors = [
    '#FF00FF', '#00FFFF', '#FFFF00', '#FF0088', '#00FF88',
    '#8800FF', '#FF8800', '#00FF00', '#FF0044', '#44FF00',
    '#0088FF', '#FF00DD', '#88FF00', '#FF4400', '#00DDFF'
  ];

  const createFirework = () => {
    const particleCount = 80 + Math.floor(Math.random() * 120);
    const particles: FireworkParticle[] = [];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Random position in deep background - far away
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.3) * 50 + 5,
      -70 - Math.random() * 50
    );

    // Create exotic burst pattern
    const burstType = Math.floor(Math.random() * 6);
    
    for (let i = 0; i < particleCount; i++) {
      let velocity: THREE.Vector3;
      
      switch (burstType) {
        case 0: // Spherical burst
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const speed = 2 + Math.random() * 4;
          velocity = new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta) * speed,
            Math.sin(phi) * Math.sin(theta) * speed,
            Math.cos(phi) * speed
          );
          break;
          
        case 1: // Ring burst
          const angle = (i / particleCount) * Math.PI * 2;
          const ringSpeed = 3 + Math.random() * 3;
          velocity = new THREE.Vector3(
            Math.cos(angle) * ringSpeed,
            Math.sin(angle) * ringSpeed,
            (Math.random() - 0.5) * 0.8
          );
          break;
          
        case 2: // Spiral galaxy
          const spiralAngle = (i / particleCount) * Math.PI * 8;
          const spiralRadius = (i / particleCount) * 5;
          velocity = new THREE.Vector3(
            Math.cos(spiralAngle) * spiralRadius,
            (i / particleCount) * 6 - 3,
            Math.sin(spiralAngle) * spiralRadius
          );
          break;
          
        case 3: // Fountain burst
          const fountainAngle = Math.random() * Math.PI * 2;
          const upwardSpeed = 5 + Math.random() * 3;
          velocity = new THREE.Vector3(
            Math.cos(fountainAngle) * (Math.random() * 2.5),
            upwardSpeed,
            Math.sin(fountainAngle) * (Math.random() * 2.5)
          );
          break;
          
        case 4: // Heart shape burst
          const t = (i / particleCount) * Math.PI * 2;
          const heartX = Math.sin(t) * Math.cos(t) * Math.log(Math.abs(t));
          const heartY = Math.abs(Math.cos(t)) * Math.sqrt(Math.abs(Math.sin(t)));
          velocity = new THREE.Vector3(
            heartX * 2,
            heartY * 3,
            (Math.random() - 0.5) * 0.5
          );
          break;
          
        default: // Double helix
          const helixAngle = (i / particleCount) * Math.PI * 12;
          const helixRadius = 2;
          const helixHeight = (i / particleCount) * 8 - 4;
          const offset = (i % 2) * Math.PI;
          velocity = new THREE.Vector3(
            Math.cos(helixAngle + offset) * helixRadius,
            helixHeight,
            Math.sin(helixAngle + offset) * helixRadius
          ).multiplyScalar(0.7);
          break;
      }

      particles.push({
        position: position.clone(),
        velocity,
        trail: [position.clone()],
        life: 1
      });
    }

    return {
      id: nextId.current++,
      position,
      particles,
      age: 0,
      maxAge: 3.5 + Math.random() * 2.5,
      color
    };
  };

  useFrame((_, delta) => {
    // Spawn new fireworks frequently
    spawnTimer.current += delta;
    if (spawnTimer.current > 0.6 + Math.random() * 1.0) {
      spawnTimer.current = 0;
      setFireworks(prev => [...prev, createFirework()]);
    }

    // Update existing fireworks
    setFireworks(prev => 
      prev
        .map(fw => {
          const updatedParticles = fw.particles.map(p => {
            const newPos = p.position.clone().add(
              p.velocity.clone().multiplyScalar(delta)
            );
            
            // Apply gravity
            const newVel = p.velocity.clone();
            newVel.y -= delta * 2.5;
            newVel.multiplyScalar(0.98); // Air resistance
            
            // Update trail
            const newTrail = [...p.trail, newPos.clone()];
            if (newTrail.length > 20) newTrail.shift();
            
            return {
              position: newPos,
              velocity: newVel,
              trail: newTrail,
              life: p.life - delta * 0.4
            };
          }).filter(p => p.life > 0);

          return {
            ...fw,
            particles: updatedParticles,
            age: fw.age + delta
          };
        })
        .filter(fw => fw.age < fw.maxAge && fw.particles.length > 0)
        .slice(-15) // Limit max fireworks
    );
  });

  return (
    <group renderOrder={-3}>
      {fireworks.map(fw => (
        <group key={fw.id}>
          {/* High-res particles with glow */}
          {fw.particles.map((particle, idx) => (
            <group key={idx}>
              <mesh position={particle.position}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshBasicMaterial
                  color={fw.color}
                  transparent
                  opacity={particle.life * 0.95}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
              {/* Outer glow */}
              <mesh position={particle.position}>
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshBasicMaterial
                  color={fw.color}
                  transparent
                  opacity={particle.life * 0.3}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            </group>
          ))}
          
          {/* High-quality trails */}
          {fw.particles.map((particle, idx) => {
            if (particle.trail.length < 2) return null;
            
            const points = particle.trail;
            
            return (
              <mesh key={`trail-${idx}`}>
                <tubeGeometry args={[
                  new THREE.CatmullRomCurve3(points),
                  points.length,
                  0.03,
                  3,
                  false
                ]} />
                <meshBasicMaterial
                  color={fw.color}
                  transparent
                  opacity={particle.life * 0.6}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};
