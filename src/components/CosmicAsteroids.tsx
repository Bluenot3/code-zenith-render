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
    const asteroidCount = 40; // Increased count
    const colorPalette = [
      new THREE.Color('#ff6b35'),
      new THREE.Color('#f7931e'),
      new THREE.Color('#ffd700'),
      new THREE.Color('#ff1493'),
      new THREE.Color('#00ffff'),
      new THREE.Color('#9d4edd'),
      new THREE.Color('#ff00ff'),
      new THREE.Color('#00ff88'),
    ];
    
    for (let i = 0; i < asteroidCount; i++) {
      // Create highly detailed irregular asteroid shape
      const geometry = new THREE.DodecahedronGeometry(
        Math.random() * 0.4 + 0.2, // Slightly larger
        2 // Added subdivision for more detail
      );
      
      // Advanced deformation for ultra-realistic irregular shapes
      const positions = geometry.attributes.position;
      for (let j = 0; j < positions.count; j++) {
        const x = positions.getX(j);
        const y = positions.getY(j);
        const z = positions.getZ(j);
        
        // Multi-octave noise-like deformation
        const noise1 = Math.sin(x * 5 + y * 3) * Math.cos(z * 4);
        const noise2 = Math.sin(x * 10) * Math.cos(y * 8);
        
        positions.setXYZ(
          j,
          x * (0.6 + Math.random() * 0.8 + noise1 * 0.15),
          y * (0.6 + Math.random() * 0.8 + noise2 * 0.15),
          z * (0.6 + Math.random() * 0.8 + noise1 * noise2 * 0.1)
        );
      }
      geometry.computeVertexNormals();
      
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      
      // Ultra-high quality asteroid material
      const material = new THREE.MeshPhysicalMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.6,
        metalness: 0.8,
        roughness: 0.25,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3,
        sheen: 0.8,
        sheenColor: color,
        envMapIntensity: 2,
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Enhanced multi-layer glow
      const glowGeometry = new THREE.SphereGeometry(
        geometry.parameters.radius * 0.8,
        32, // Higher quality sphere
        32
      );
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
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
