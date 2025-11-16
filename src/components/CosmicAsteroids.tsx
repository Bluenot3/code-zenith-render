import { useRef, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

interface Asteroid {
  mesh: THREE.Mesh;
  glowMesh: THREE.Mesh;
  trailMesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  trailPositions: THREE.Vector3[];
}

const CosmicAsteroidsComponent = () => {
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const frameCount = useRef(0);
  
  // Shared materials for performance
  const sharedMaterials = useMemo(() => {
    const colors = ['#ff6b35', '#f7931e', '#ffd700', '#ff1493', '#00ffff', '#9d4edd', '#ff00ff', '#00ff88'];
    return colors.map(color => ({
      asteroid: new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.3,
        clearcoat: 0.4,
        clearcoatRoughness: 0.3,
      }),
      glow: new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      trail: new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    }));
  }, []);
  
  useMemo(() => {
    const asteroidCount = isMobile ? 20 : 35; // Reduced count
    for (let i = 0; i < asteroidCount; i++) {
      const materialIndex = Math.floor(Math.random() * sharedMaterials.length);
      
      // Create optimized irregular asteroid shape
      const geometry = new THREE.DodecahedronGeometry(
        Math.random() * 0.35 + 0.2,
        1 // Reduced subdivision
      );
      
      // Simplified deformation
      const positions = geometry.attributes.position;
      for (let j = 0; j < positions.count; j++) {
        const x = positions.getX(j);
        const y = positions.getY(j);
        const z = positions.getZ(j);
        
        const noise = Math.sin(x * 4) * Math.cos(y * 4);
        
        positions.setXYZ(
          j,
          x * (0.7 + Math.random() * 0.6),
          y * (0.7 + Math.random() * 0.6),
          z * (0.7 + Math.random() * 0.6 + noise * 0.1)
        );
      }
      geometry.computeVertexNormals();
      
      const mesh = new THREE.Mesh(geometry, sharedMaterials[materialIndex].asteroid);
      
      // Optimized glow
      const glowGeometry = new THREE.SphereGeometry(
        geometry.parameters.radius * 0.7,
        16, // Reduced quality
        16
      );
      const glowMesh = new THREE.Mesh(glowGeometry, sharedMaterials[materialIndex].glow);
      
      // Mesh trail
      const trailGeometry = new THREE.BufferGeometry();
      const trailMesh = new THREE.Mesh(trailGeometry, sharedMaterials[materialIndex].trail);
      
      // Position
      const startX = (Math.random() - 0.5) * 50;
      const startY = (Math.random() - 0.5) * 50;
      const startZ = (Math.random() - 0.5) * 50;
      mesh.position.set(startX, startY, startZ);
      glowMesh.position.copy(mesh.position);
      
      // Velocity
      const speed = Math.random() * 0.15 + 0.05;
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed
      );
      
      const rotation = new THREE.Euler(
        Math.random() * 0.02,
        Math.random() * 0.02,
        Math.random() * 0.02
      );
      
      asteroidsRef.current.push({
        mesh,
        glowMesh,
        trailMesh,
        velocity,
        rotation,
        trailPositions: [mesh.position.clone()],
      });
      
      if (groupRef.current) {
        groupRef.current.add(mesh);
        groupRef.current.add(glowMesh);
        groupRef.current.add(trailMesh);
      }
    }
  }, [isMobile]);
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    frameCount.current++;
    const updateTrails = frameCount.current % 3 === 0; // Update trails every 3 frames
    
    asteroidsRef.current.forEach((asteroid) => {
      // Update position
      asteroid.mesh.position.add(asteroid.velocity);
      asteroid.glowMesh.position.copy(asteroid.mesh.position);
      
      // Update rotation
      asteroid.mesh.rotation.x += asteroid.rotation.x;
      asteroid.mesh.rotation.y += asteroid.rotation.y;
      asteroid.mesh.rotation.z += asteroid.rotation.z;
      
      // Update trail (less frequently)
      if (updateTrails) {
        asteroid.trailPositions.push(asteroid.mesh.position.clone());
        const maxTrailLength = 12; // Reduced
        if (asteroid.trailPositions.length > maxTrailLength) {
          asteroid.trailPositions.shift();
        }
        
        // Simplified mesh trail geometry
        if (asteroid.trailPositions.length > 2) {
          const vertices: number[] = [];
          const width = 0.06;
          
          for (let i = 0; i < asteroid.trailPositions.length - 1; i++) {
            const p1 = asteroid.trailPositions[i];
            const p2 = asteroid.trailPositions[i + 1];
            const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
            const perp = new THREE.Vector3(-dir.y, dir.x, 0).normalize();
            
            const fade = i / asteroid.trailPositions.length;
            const w = width * fade;
            
            // Create quad
            vertices.push(
              p1.x - perp.x * w, p1.y - perp.y * w, p1.z - perp.z * w,
              p1.x + perp.x * w, p1.y + perp.y * w, p1.z + perp.z * w,
              p2.x + perp.x * w, p2.y + perp.y * w, p2.z + perp.z * w,
              
              p1.x - perp.x * w, p1.y - perp.y * w, p1.z - perp.z * w,
              p2.x + perp.x * w, p2.y + perp.y * w, p2.z + perp.z * w,
              p2.x - perp.x * w, p2.y - perp.y * w, p2.z - perp.z * w
            );
          }
          
          asteroid.trailMesh.geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(vertices, 3)
          );
        }
      }
      
      // Reset if out of bounds
      const bounds = 30;
      if (
        Math.abs(asteroid.mesh.position.x) > bounds ||
        Math.abs(asteroid.mesh.position.y) > bounds ||
        Math.abs(asteroid.mesh.position.z) > bounds
      ) {
        asteroid.mesh.position.set(
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50
        );
        asteroid.trailPositions = [asteroid.mesh.position.clone()];
        
        const newSpeed = Math.random() * 0.15 + 0.05;
        asteroid.velocity.set(
          (Math.random() - 0.5) * newSpeed,
          (Math.random() - 0.5) * newSpeed,
          (Math.random() - 0.5) * newSpeed
        );
      }
    });
  });
  
  return <group ref={groupRef} renderOrder={-1} />;
};

export const CosmicAsteroids = memo(CosmicAsteroidsComponent);
