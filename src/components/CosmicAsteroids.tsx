import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Asteroid {
  mesh: THREE.Mesh;
  glowMesh: THREE.Mesh;
  trailMesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  trailPositions: THREE.Vector3[];
}

export const CosmicAsteroids = () => {
  const groupRef = useRef<THREE.Group>(null);
  const asteroidsRef = useRef<Asteroid[]>([]);
  
  useMemo(() => {
    const asteroidCount = 25;
    const colorPalette = [
      new THREE.Color('#ff6b35'),
      new THREE.Color('#f7931e'),
      new THREE.Color('#ffd700'),
      new THREE.Color('#ff1493'),
      new THREE.Color('#00ffff'),
      new THREE.Color('#9d4edd'),
    ];
    
    for (let i = 0; i < asteroidCount; i++) {
      // Create irregular asteroid shape
      const geometry = new THREE.DodecahedronGeometry(
        Math.random() * 0.3 + 0.15,
        0
      );
      
      // Deform vertices for irregular look
      const positions = geometry.attributes.position;
      for (let j = 0; j < positions.count; j++) {
        positions.setXYZ(
          j,
          positions.getX(j) * (0.7 + Math.random() * 0.6),
          positions.getY(j) * (0.7 + Math.random() * 0.6),
          positions.getZ(j) * (0.7 + Math.random() * 0.6)
        );
      }
      geometry.computeVertexNormals();
      
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      
      // Main asteroid body
      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.4,
        metalness: 0.7,
        roughness: 0.3,
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Glowing tip
      const glowGeometry = new THREE.SphereGeometry(
        geometry.parameters.radius * 0.6,
        16,
        16
      );
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      
      // Mesh trail
      const trailGeometry = new THREE.BufferGeometry();
      const trailMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial);
      
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
  }, []);
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    asteroidsRef.current.forEach((asteroid) => {
      // Update position
      asteroid.mesh.position.add(asteroid.velocity);
      asteroid.glowMesh.position.copy(asteroid.mesh.position);
      
      // Update rotation
      asteroid.mesh.rotation.x += asteroid.rotation.x;
      asteroid.mesh.rotation.y += asteroid.rotation.y;
      asteroid.mesh.rotation.z += asteroid.rotation.z;
      
      // Update trail
      asteroid.trailPositions.push(asteroid.mesh.position.clone());
      const maxTrailLength = 25;
      if (asteroid.trailPositions.length > maxTrailLength) {
        asteroid.trailPositions.shift();
      }
      
      // Create mesh trail geometry
      if (asteroid.trailPositions.length > 2) {
        const vertices: number[] = [];
        const width = 0.08;
        
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
