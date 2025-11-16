import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const CrystalFormation = () => {
  const groupRef = useRef<THREE.Group>(null);
  const crystalsRef = useRef<THREE.Mesh[]>([]);
  
  useMemo(() => {
    if (crystalsRef.current.length > 0) return;
    
    const crystalCount = 18; // More crystals for richer formation
    const colors = [
      new THREE.Color('#ff00ff'),
      new THREE.Color('#00ffff'),
      new THREE.Color('#ffff00'),
      new THREE.Color('#00ff88'),
      new THREE.Color('#ff0088'),
      new THREE.Color('#8800ff'),
    ];
    
    for (let i = 0; i < crystalCount; i++) {
      // Create elongated crystal shape with higher detail
      const geometry = new THREE.ConeGeometry(0.35, 2.8, 8);
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const material = new THREE.MeshPhysicalMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 2.0,
        transparent: true,
        opacity: 0.9,
        metalness: 0.95,
        roughness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        transmission: 0.4,
        thickness: 0.6,
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
      
      // Add enhanced inner glow
      const glowGeometry = new THREE.ConeGeometry(0.28, 2.6, 8);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.75,
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
      // Enhanced floating rotation with more dynamic movement
      crystal.rotation.y += 0.007 + index * 0.0015;
      crystal.rotation.x = Math.sin(time * 0.6 + index) * 0.15;
      crystal.rotation.z = Math.cos(time * 0.4 + index) * 0.08;
      
      // More dramatic floating motion
      crystal.position.y += Math.sin(time * 1.2 + index) * 0.004;
      
      // More intense pulsing emissive intensity
      if (crystal.material instanceof THREE.MeshPhysicalMaterial) {
        crystal.material.emissiveIntensity = 1.8 + Math.sin(time * 2.5 + index) * 0.5;
      }
      
      // Enhanced pulsing scale
      const scale = 1 + Math.sin(time * 2 + index) * 0.08;
      crystal.scale.set(scale, scale, scale);
    });
    
    // Rotate entire formation with more presence
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
      groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.05;
    }
  });
  
  return <group ref={groupRef} renderOrder={-1} />;
};
