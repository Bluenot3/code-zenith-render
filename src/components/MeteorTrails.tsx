import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Meteor {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  trail: THREE.Vector3[];
  color: THREE.Color;
  size: number;
  speed: number;
  glowIntensity: number;
}

export const MeteorTrails = () => {
  const meteorsRef = useRef<Meteor[]>([]);
  const meshesRef = useRef<Map<string, THREE.Mesh | THREE.Line>>(new Map());
  const groupRef = useRef<THREE.Group>(null);
  
  // Initialize meteors with variety
  useMemo(() => {
    const meteorCount = 35;
    const colorPalette = [
      new THREE.Color('#ff6600'), // Orange
      new THREE.Color('#ff0066'), // Hot Pink
      new THREE.Color('#00ffff'), // Cyan
      new THREE.Color('#ffff00'), // Yellow
      new THREE.Color('#00ff88'), // Teal
      new THREE.Color('#8800ff'), // Purple
      new THREE.Color('#ff3300'), // Red-Orange
      new THREE.Color('#ffffff'), // White
    ];
    
    meteorsRef.current = Array.from({ length: meteorCount }, () => {
      const startX = (Math.random() - 0.5) * 60;
      const startY = (Math.random() - 0.5) * 60;
      const startZ = (Math.random() - 0.5) * 60;
      
      const speed = Math.random() * 0.2 + 0.1;
      const size = Math.random() * 0.1 + 0.08;
      
      return {
        position: new THREE.Vector3(startX, startY, startZ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed
        ),
        trail: [],
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)].clone(),
        size,
        speed,
        glowIntensity: Math.random() * 1.5 + 2.5,
      };
    });
  }, []);
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    meteorsRef.current.forEach((meteor, meteorIndex) => {
      // Update position
      meteor.position.add(meteor.velocity);
      
      // Add to trail
      meteor.trail.push(meteor.position.clone());
      const maxTrailLength = Math.floor(meteor.speed * 100 + 20);
      if (meteor.trail.length > maxTrailLength) {
        meteor.trail.shift();
      }
      
      // Reset if out of bounds
      const bounds = 35;
      if (
        Math.abs(meteor.position.x) > bounds ||
        Math.abs(meteor.position.y) > bounds ||
        Math.abs(meteor.position.z) > bounds
      ) {
        meteor.position.set(
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 60
        );
        const newSpeed = Math.random() * 0.2 + 0.1;
        meteor.velocity.set(
          (Math.random() - 0.5) * newSpeed,
          (Math.random() - 0.5) * newSpeed,
          (Math.random() - 0.5) * newSpeed
        );
        meteor.speed = newSpeed;
        meteor.trail = [];
      }
      
      // Update or create meteor head mesh
      const headKey = `head-${meteorIndex}`;
      let headMesh = meshesRef.current.get(headKey) as THREE.Mesh;
      
      if (!headMesh) {
        const geometry = new THREE.SphereGeometry(meteor.size, 16, 16);
        const material = new THREE.MeshStandardMaterial({
          color: meteor.color,
          emissive: meteor.color,
          emissiveIntensity: meteor.glowIntensity,
          transparent: true,
          opacity: 0.9,
          metalness: 0.8,
          roughness: 0.2,
        });
        headMesh = new THREE.Mesh(geometry, material);
        meshesRef.current.set(headKey, headMesh);
        groupRef.current.add(headMesh);
      }
      headMesh.position.copy(meteor.position);
      
      // Update or create outer glow
      const glowKey = `glow-${meteorIndex}`;
      let glowMesh = meshesRef.current.get(glowKey) as THREE.Mesh;
      
      if (!glowMesh) {
        const glowGeometry = new THREE.SphereGeometry(meteor.size * 2.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: meteor.color,
          transparent: true,
          opacity: 0.4,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        meshesRef.current.set(glowKey, glowMesh);
        groupRef.current.add(glowMesh);
      }
      glowMesh.position.copy(meteor.position);
      
      // Update or create trail
      if (meteor.trail.length > 3) {
        const trailKey = `trail-${meteorIndex}`;
        let trailLine = meshesRef.current.get(trailKey) as THREE.Line;
        
        if (!trailLine) {
          const trailGeometry = new THREE.BufferGeometry();
          const trailMaterial = new THREE.LineBasicMaterial({
            color: meteor.color,
            transparent: true,
            opacity: 0.6,
            linewidth: 2,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          trailLine = new THREE.Line(trailGeometry, trailMaterial);
          meshesRef.current.set(trailKey, trailLine);
          groupRef.current.add(trailLine);
        }
        
        // Update trail geometry
        const positions = new Float32Array(meteor.trail.length * 3);
        meteor.trail.forEach((point, i) => {
          positions[i * 3] = point.x;
          positions[i * 3 + 1] = point.y;
          positions[i * 3 + 2] = point.z;
        });
        
        trailLine.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        trailLine.geometry.attributes.position.needsUpdate = true;
      }
    });
  });
  
  return <group ref={groupRef} renderOrder={-2} />;
};
