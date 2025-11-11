import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const CrystalFormation = () => {
  const groupRef = useRef<THREE.Group>(null);
  const crystalsRef = useRef<THREE.Mesh[]>([]);
  
  useMemo(() => {
    if (crystalsRef.current.length > 0) return;
    
    const crystalCount = 12;
    const colors = [
      new THREE.Color('#ff00ff'),
      new THREE.Color('#00ffff'),
      new THREE.Color('#ffff00'),
      new THREE.Color('#00ff88'),
      new THREE.Color('#ff0088'),
      new THREE.Color('#8800ff'),
    ];
    
    for (let i = 0; i < crystalCount; i++) {
      // Create elongated crystal shape
      const geometry = new THREE.ConeGeometry(0.3, 2.5, 6);
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const material = new THREE.MeshPhysicalMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.85,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transmission: 0.3,
        thickness: 0.5,
        side: THREE.DoubleSide,
      });
      
      const crystal = new THREE.Mesh(geometry, material);
      
      // Position in a loose cluster
      const angle = (i / crystalCount) * Math.PI * 2;
      const radius = 2 + Math.random() * 1.5;
      const height = (Math.random() - 0.5) * 3;
      
      crystal.position.set(
        Math.cos(angle) * radius + 10,
        height - 5,
        Math.sin(angle) * radius - 8
      );
      
      // Random rotation
      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      crystalsRef.current.push(crystal);
      
      if (groupRef.current) {
        groupRef.current.add(crystal);
      }
      
      // Add inner glow
      const glowGeometry = new THREE.ConeGeometry(0.25, 2.3, 6);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      crystal.add(glow);
    }
  }, []);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    crystalsRef.current.forEach((crystal, index) => {
      // Gentle floating rotation
      crystal.rotation.y += 0.005 + index * 0.001;
      crystal.rotation.x = Math.sin(time * 0.5 + index) * 0.1;
      
      // Subtle floating motion
      crystal.position.y += Math.sin(time * 0.8 + index) * 0.002;
      
      // Pulsing emissive intensity
      if (crystal.material instanceof THREE.MeshPhysicalMaterial) {
        crystal.material.emissiveIntensity = 1.2 + Math.sin(time * 2 + index) * 0.3;
      }
      
      // Pulsing scale
      const scale = 1 + Math.sin(time * 1.5 + index) * 0.05;
      crystal.scale.set(scale, scale, scale);
    });
    
    // Rotate entire formation slowly
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });
  
  return <group ref={groupRef} renderOrder={-1} />;
};
