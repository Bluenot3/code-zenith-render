import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

interface EnergyOrb {
  mesh: THREE.Mesh;
  glowMesh: THREE.Mesh;
  innerMesh: THREE.Mesh;
  velocity: THREE.Vector3;
  phase: number;
  baseScale: number;
}

export const EnergyOrbs = () => {
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
  const orbsRef = useRef<EnergyOrb[]>([]);
  const frameCount = useRef(0);
  
  const sharedMaterials = useMemo(() => {
    const colors = ['#00ffff', '#ff00ff', '#00ff88', '#ffaa00', '#ff0066', '#8855ff'];
    return colors.map(color => ({
      core: new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: 2.5,
        transparent: true,
        opacity: 0.95,
        metalness: 0.3,
        roughness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      }),
      glow: new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      inner: new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    }));
  }, []);
  
  useMemo(() => {
    if (orbsRef.current.length > 0) return;
    
    const orbCount = isMobile ? 6 : 18;
    
    for (let i = 0; i < orbCount; i++) {
      const materialIndex = Math.floor(Math.random() * sharedMaterials.length);
      const baseScale = Math.random() * 0.4 + 0.2;
      
      // Core orb
      const coreGeometry = new THREE.SphereGeometry(baseScale, 24, 24);
      const mesh = new THREE.Mesh(coreGeometry, sharedMaterials[materialIndex].core);
      
      // Outer glow
      const glowGeometry = new THREE.SphereGeometry(baseScale * 2.5, 16, 16);
      const glowMesh = new THREE.Mesh(glowGeometry, sharedMaterials[materialIndex].glow);
      
      // Inner bright core
      const innerGeometry = new THREE.SphereGeometry(baseScale * 0.4, 12, 12);
      const innerMesh = new THREE.Mesh(innerGeometry, sharedMaterials[materialIndex].inner);
      
      // Position in space
      const angle = (i / orbCount) * Math.PI * 2;
      const radius = 12 + Math.random() * 25;
      const height = (Math.random() - 0.5) * 30;
      
      mesh.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      glowMesh.position.copy(mesh.position);
      innerMesh.position.copy(mesh.position);
      
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.03
      );
      
      orbsRef.current.push({
        mesh,
        glowMesh,
        innerMesh,
        velocity,
        phase: Math.random() * Math.PI * 2,
        baseScale,
      });
      
      if (groupRef.current) {
        groupRef.current.add(mesh);
        groupRef.current.add(glowMesh);
        groupRef.current.add(innerMesh);
      }
    }
  }, [isMobile, sharedMaterials]);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return;
    
    const time = state.clock.elapsedTime;
    
    orbsRef.current.forEach((orb) => {
      // Floating motion
      orb.mesh.position.add(orb.velocity);
      orb.mesh.position.y += Math.sin(time * 0.8 + orb.phase) * 0.008;
      
      orb.glowMesh.position.copy(orb.mesh.position);
      orb.innerMesh.position.copy(orb.mesh.position);
      
      // Pulsing scale
      const pulse = 1 + Math.sin(time * 2 + orb.phase) * 0.15;
      orb.mesh.scale.setScalar(pulse);
      orb.glowMesh.scale.setScalar(pulse * 1.2);
      orb.innerMesh.scale.setScalar(pulse * 0.8);
      
      // Emissive intensity pulse
      if (orb.mesh.material instanceof THREE.MeshPhysicalMaterial) {
        orb.mesh.material.emissiveIntensity = 2.5 + Math.sin(time * 3 + orb.phase) * 0.8;
      }
      
      // Boundary bounce
      const bounds = 35;
      ['x', 'y', 'z'].forEach((axis) => {
        if (Math.abs(orb.mesh.position[axis as 'x' | 'y' | 'z']) > bounds) {
          orb.velocity[axis as 'x' | 'y' | 'z'] *= -1;
        }
      });
    });
  });
  
  return <group ref={groupRef} renderOrder={-1} />;
};
