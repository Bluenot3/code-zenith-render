import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Orb {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  phase: number;
  color: THREE.Color;
  size: number;
  pulseSpeed: number;
}

export const FloatingOrbs = () => {
  const orbsRef = useRef<Orb[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  
  // Initialize orbs
  if (orbsRef.current.length === 0) {
    const orbCount = 20;
    const colors = [
      new THREE.Color('#00ffff'),
      new THREE.Color('#ff00ff'),
      new THREE.Color('#ffff00'),
      new THREE.Color('#00ff88'),
      new THREE.Color('#ff0088'),
    ];
    
    orbsRef.current = Array.from({ length: orbCount }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ),
      phase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)].clone(),
      size: Math.random() * 0.3 + 0.2,
      pulseSpeed: Math.random() * 2 + 1,
    }));
  }
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Clear previous frame
    while (groupRef.current.children.length > 0) {
      const child = groupRef.current.children[0];
      groupRef.current.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
    
    orbsRef.current.forEach((orb) => {
      // Update position with smooth floating
      orb.position.add(orb.velocity);
      orb.phase += 0.02 * orb.pulseSpeed;
      
      // Bounce off bounds
      const bounds = 25;
      if (Math.abs(orb.position.x) > bounds) orb.velocity.x *= -1;
      if (Math.abs(orb.position.y) > bounds) orb.velocity.y *= -1;
      if (Math.abs(orb.position.z) > bounds) orb.velocity.z *= -1;
      
      // Pulsing effect
      const pulse = Math.sin(orb.phase) * 0.5 + 0.5;
      const currentSize = orb.size * (0.7 + pulse * 0.3);
      
      // Create orb with glow
      const orbGeometry = new THREE.SphereGeometry(currentSize, 32, 32);
      const orbMaterial = new THREE.MeshStandardMaterial({
        color: orb.color,
        emissive: orb.color,
        emissiveIntensity: 3 + pulse * 2,
        transparent: true,
        opacity: 0.8,
        metalness: 0.9,
        roughness: 0.1,
      });
      const orbMesh = new THREE.Mesh(orbGeometry, orbMaterial);
      orbMesh.position.copy(orb.position);
      groupRef.current.add(orbMesh);
      
      // Add outer glow
      const glowGeometry = new THREE.SphereGeometry(currentSize * 2, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: orb.color,
        transparent: true,
        opacity: 0.3 * pulse,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.copy(orb.position);
      groupRef.current.add(glowMesh);
      
      // Add energy ring
      const ringGeometry = new THREE.RingGeometry(currentSize * 1.5, currentSize * 1.8, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: orb.color,
        transparent: true,
        opacity: 0.6 * pulse,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(orb.position);
      ring.lookAt(state.camera.position);
      groupRef.current.add(ring);
    });
  });
  
  return <group ref={groupRef} renderOrder={-1} />;
};
