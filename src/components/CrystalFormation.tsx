import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const CrystalFormation = () => {
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
  const crystalsRef = useRef<THREE.Mesh[]>([]);
  const frameCount = useRef(0);
  
  // Shared materials for performance
  const sharedMaterials = useMemo(() => {
    const colors = ['#ff00ff', '#00ffff', '#ffff00', '#00ff88', '#ff0088', '#8800ff'];
    return colors.map(color => ({
      crystal: new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.85,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
      glow: new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    }));
  }, []);
  
  useMemo(() => {
    if (crystalsRef.current.length > 0) return;
    
    const crystalCount = isMobile ? 8 : 14; // Reduced count
    for (let i = 0; i < crystalCount; i++) {
      const materialIndex = Math.floor(Math.random() * sharedMaterials.length);
      
      // Create optimized crystal shape
      const geometry = new THREE.ConeGeometry(0.3, 2.5, 6); // Reduced segments
      const crystal = new THREE.Mesh(geometry, sharedMaterials[materialIndex].crystal);
      
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
      
      // Add optimized inner glow
      const glowGeometry = new THREE.ConeGeometry(0.25, 2.4, 6);
      const glow = new THREE.Mesh(glowGeometry, sharedMaterials[materialIndex].glow);
      crystal.add(glow);
    }
  }, [isMobile, sharedMaterials]);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    frameCount.current++;
    
    // Update every other frame
    if (frameCount.current % 2 !== 0) return;
    
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
