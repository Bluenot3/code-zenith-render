import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Debris {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
}

export const SpaceDebris = () => {
  const groupRef = useRef<THREE.Group>(null);
  const debrisRef = useRef<Debris[]>([]);
  
  // Initialize debris
  if (debrisRef.current.length === 0) {
    const count = 30;
    const geometries = [
      new THREE.OctahedronGeometry(0.3),
      new THREE.TetrahedronGeometry(0.4),
      new THREE.IcosahedronGeometry(0.35),
      new THREE.DodecahedronGeometry(0.3),
    ];
    
    const colors = [
      new THREE.Color('#4a9eff'),
      new THREE.Color('#ff4a9e'),
      new THREE.Color('#4aff9e'),
      new THREE.Color('#ff9e4a'),
      new THREE.Color('#9e4aff'),
    ];
    
    for (let i = 0; i < count; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)].clone();
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1.5,
        metalness: 0.9,
        roughness: 0.2,
        transparent: true,
        opacity: 0.8,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50
      );
      
      debrisRef.current.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.08
        ),
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05
        ),
      });
    }
  }
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    debrisRef.current.forEach((debris) => {
      // Update position
      debris.mesh.position.add(debris.velocity);
      
      // Rotate debris
      debris.mesh.rotation.x += debris.rotationSpeed.x;
      debris.mesh.rotation.y += debris.rotationSpeed.y;
      debris.mesh.rotation.z += debris.rotationSpeed.z;
      
      // Bounce off boundaries
      const bounds = 30;
      if (Math.abs(debris.mesh.position.x) > bounds) {
        debris.velocity.x *= -0.8;
        debris.mesh.position.x = Math.sign(debris.mesh.position.x) * bounds;
      }
      if (Math.abs(debris.mesh.position.y) > bounds) {
        debris.velocity.y *= -0.8;
        debris.mesh.position.y = Math.sign(debris.mesh.position.y) * bounds;
      }
      if (Math.abs(debris.mesh.position.z) > bounds) {
        debris.velocity.z *= -0.8;
        debris.mesh.position.z = Math.sign(debris.mesh.position.z) * bounds;
      }
      
      // Pulsing glow effect
      const pulse = Math.sin(state.clock.elapsedTime * 2 + debris.mesh.position.x) * 0.5 + 0.5;
      if (debris.mesh.material instanceof THREE.MeshStandardMaterial) {
        debris.mesh.material.emissiveIntensity = 1 + pulse * 1.5;
      }
    });
  });
  
  return (
    <group ref={groupRef}>
      {debrisRef.current.map((debris, index) => (
        <primitive key={index} object={debris.mesh} />
      ))}
    </group>
  );
};
