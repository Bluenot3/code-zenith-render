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
  
  // Shared geometries for performance
  const sharedGeometries = useMemo(() => ({
    core: new THREE.SphereGeometry(1, 24, 24),
    glow: new THREE.SphereGeometry(1, 16, 16),
    inner: new THREE.SphereGeometry(1, 12, 12),
  }), []);
  
  const sharedMaterials = useMemo(() => {
    const colors = ['#00ffff', '#ff00ff', '#00ff88', '#ffaa00', '#ff0066', '#8855ff'];
    return colors.map(color => ({
      core: new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: 2.8,
        transparent: true,
        opacity: 0.95,
        metalness: 0.3,
        roughness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        toneMapped: false,
      }),
      glow: new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      inner: new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    }));
  }, []);
  
  useMemo(() => {
    if (orbsRef.current.length > 0 || !groupRef.current) return;
    
    const orbCount = isMobile ? 6 : 18;
    
    for (let i = 0; i < orbCount; i++) {
      const materialIndex = Math.floor(Math.random() * sharedMaterials.length);
      const baseScale = Math.random() * 0.4 + 0.2;
      
      // Core orb
      const mesh = new THREE.Mesh(sharedGeometries.core, sharedMaterials[materialIndex].core.clone());
      mesh.scale.setScalar(baseScale);
      
      // Outer glow
      const glowMesh = new THREE.Mesh(sharedGeometries.glow, sharedMaterials[materialIndex].glow.clone());
      glowMesh.scale.setScalar(baseScale * 2.5);
      
      // Inner bright core
      const innerMesh = new THREE.Mesh(sharedGeometries.inner, sharedMaterials[materialIndex].inner.clone());
      innerMesh.scale.setScalar(baseScale * 0.4);
      
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
        (Math.random() - 0.5) * 0.025,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.025
      );
      
      orbsRef.current.push({
        mesh,
        glowMesh,
        innerMesh,
        velocity,
        phase: Math.random() * Math.PI * 2,
        baseScale,
      });
      
      groupRef.current.add(mesh);
      groupRef.current.add(glowMesh);
      groupRef.current.add(innerMesh);
    }
  }, [isMobile, sharedMaterials, sharedGeometries]);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    frameCount.current++;
    // Smooth updates every frame for fluid orb movement
    if (isMobile && frameCount.current % 2 !== 0) return;
    
    const time = state.clock.elapsedTime;
    
    orbsRef.current.forEach((orb) => {
      // Floating motion
      orb.mesh.position.add(orb.velocity);
      orb.mesh.position.y += Math.sin(time * 0.8 + orb.phase) * 0.006;
      
      orb.glowMesh.position.copy(orb.mesh.position);
      orb.innerMesh.position.copy(orb.mesh.position);
      
      // Smooth pulsing scale
      const pulse = 1 + Math.sin(time * 2 + orb.phase) * 0.12;
      orb.mesh.scale.setScalar(orb.baseScale * pulse);
      orb.glowMesh.scale.setScalar(orb.baseScale * 2.5 * pulse * 1.1);
      orb.innerMesh.scale.setScalar(orb.baseScale * 0.4 * pulse * 0.9);
      
      // Smooth emissive intensity pulse
      if (orb.mesh.material instanceof THREE.MeshPhysicalMaterial) {
        orb.mesh.material.emissiveIntensity = 2.8 + Math.sin(time * 3 + orb.phase) * 0.6;
      }
      
      // Smooth boundary bounce
      const bounds = 35;
      ['x', 'y', 'z'].forEach((axis) => {
        const pos = orb.mesh.position[axis as 'x' | 'y' | 'z'];
        if (Math.abs(pos) > bounds) {
          orb.velocity[axis as 'x' | 'y' | 'z'] *= -1;
          orb.mesh.position[axis as 'x' | 'y' | 'z'] = Math.sign(pos) * bounds;
        }
      });
    });
  });
  
  return <group ref={groupRef} renderOrder={-1} />;
};
