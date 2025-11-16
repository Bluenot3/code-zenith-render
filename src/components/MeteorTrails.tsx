import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const meteorsRef = useRef<Meteor[]>([]);
  const meshesRef = useRef<Map<string, THREE.Mesh | THREE.Line>>(new Map());
  const groupRef = useRef<THREE.Group>(null);
  
  // Initialize meteors with variety
  useMemo(() => {
    const meteorCount = isMobile ? 40 : 80; // Adaptive count
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
      
      const speed = Math.random() * 0.25 + 0.12;
      const size = Math.random() * 0.15 + 0.1;
      
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
        glowIntensity: Math.random() * 2 + 3,
      };
    });
  }, [isMobile]);
  
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
        const geometry = new THREE.SphereGeometry(meteor.size, 32, 32);
        const material = new THREE.MeshPhysicalMaterial({
          color: meteor.color,
          emissive: meteor.color,
          emissiveIntensity: meteor.glowIntensity * 2.5,
          transparent: true,
          opacity: 1,
          metalness: 1,
          roughness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0,
          sheen: 2,
          sheenColor: meteor.color,
          iridescence: 0.8,
          iridescenceIOR: 2.5,
          iridescenceThicknessRange: [100, 800],
          envMapIntensity: 3,
          transmission: 0.2,
          thickness: 1,
          toneMapped: false,
        });
        headMesh = new THREE.Mesh(geometry, material);
        meshesRef.current.set(headKey, headMesh);
        groupRef.current.add(headMesh);
        
        // Add ultra-bright core
        const coreGeometry = new THREE.SphereGeometry(meteor.size * 0.5, 16, 16);
        const coreMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color('#ffffff'),
          transparent: true,
          opacity: 1,
          blending: THREE.AdditiveBlending,
          toneMapped: false,
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        headMesh.add(core);
      }
      headMesh.position.copy(meteor.position);
      
      // Update or create outer glow
      const glowKey = `glow-${meteorIndex}`;
      let glowMesh = meshesRef.current.get(glowKey) as THREE.Mesh;
      
      if (!glowMesh) {
        const glowGeometry = new THREE.SphereGeometry(meteor.size * 4, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: meteor.color,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        });
        glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        meshesRef.current.set(glowKey, glowMesh);
        groupRef.current.add(glowMesh);
        
        // Add outer energy corona
        const coronaGeometry = new THREE.SphereGeometry(meteor.size * 5.5, 24, 24);
        const coronaMaterial = new THREE.MeshBasicMaterial({
          color: meteor.color,
          transparent: true,
          opacity: 0.25,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.BackSide,
        });
        const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        glowMesh.add(corona);
        
        // Add rotating energy field wireframe
        const energyFieldGeometry = new THREE.IcosahedronGeometry(meteor.size * 4.5, 1);
        const energyFieldMaterial = new THREE.MeshBasicMaterial({
          color: meteor.color,
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          wireframe: true,
        });
        const energyField = new THREE.Mesh(energyFieldGeometry, energyFieldMaterial);
        glowMesh.add(energyField);
      }
      glowMesh.position.copy(meteor.position);
      
      // Rotate energy field if it exists
      if (glowMesh.children.length > 0) {
        glowMesh.children.forEach((child, idx) => {
          child.rotation.y += 0.02 * (idx + 1);
          child.rotation.x += 0.015 * (idx + 1);
        });
      }
      
      // Update or create trail
      if (meteor.trail.length > 3) {
        const trailKey = `trail-${meteorIndex}`;
        let trailLine = meshesRef.current.get(trailKey) as THREE.Line;
        
        if (!trailLine) {
          const maxTrailPoints = 100;
          const trailGeometry = new THREE.BufferGeometry();
          const positions = new Float32Array(maxTrailPoints * 3);
          trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          trailGeometry.setDrawRange(0, 0);
          
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
        
        // Update trail geometry without resizing
        const positionAttribute = trailLine.geometry.attributes.position;
        meteor.trail.forEach((point, i) => {
          positionAttribute.setXYZ(i, point.x, point.y, point.z);
        });
        positionAttribute.needsUpdate = true;
        trailLine.geometry.setDrawRange(0, meteor.trail.length);
      }
    });
  });
  
  return <group ref={groupRef} renderOrder={-2} />;
};
