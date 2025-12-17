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
  const frameCount = useRef(0);
  
  // High-quality shared materials
  const sharedMaterials = useMemo(() => {
    const colorPalette = [
      '#ff5500', '#ff0055', '#00ffee', '#ffee00', 
      '#00ff77', '#9900ff', '#ff2200', '#ffffff',
      '#ff8800', '#00aaff', '#ff00aa', '#aaff00'
    ];
    
    return colorPalette.map(color => ({
      head: new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: 5.5,
        transparent: true,
        opacity: 1,
        metalness: 0.95,
        roughness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0,
        toneMapped: false,
      }),
      glow: new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      trail: new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.5,
        linewidth: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    }));
  }, []);
  
  // Initialize meteors
  useMemo(() => {
    const meteorCount = isMobile ? 40 : 80;
    meteorsRef.current = Array.from({ length: meteorCount }, () => {
      const materialIndex = Math.floor(Math.random() * sharedMaterials.length);
      const startX = (Math.random() - 0.5) * 70;
      const startY = (Math.random() - 0.5) * 70;
      const startZ = (Math.random() - 0.5) * 70;
      
      const speed = Math.random() * 0.3 + 0.14;
      const size = Math.random() * 0.18 + 0.12;
      
      return {
        position: new THREE.Vector3(startX, startY, startZ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed
        ),
        trail: [],
        color: new THREE.Color(sharedMaterials[materialIndex].head.color),
        size,
        speed,
        glowIntensity: Math.random() * 2.5 + 3.5,
      };
    });
  }, [isMobile, sharedMaterials]);
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    frameCount.current++;
    const updateGeometry = frameCount.current % 2 === 0;
    
    meteorsRef.current.forEach((meteor, meteorIndex) => {
      meteor.position.add(meteor.velocity);
      
      meteor.trail.push(meteor.position.clone());
      const maxTrailLength = Math.floor(meteor.speed * 120 + 25);
      if (meteor.trail.length > maxTrailLength) {
        meteor.trail.shift();
      }
      
      const bounds = 40;
      if (
        Math.abs(meteor.position.x) > bounds ||
        Math.abs(meteor.position.y) > bounds ||
        Math.abs(meteor.position.z) > bounds
      ) {
        meteor.position.set(
          (Math.random() - 0.5) * 70,
          (Math.random() - 0.5) * 70,
          (Math.random() - 0.5) * 70
        );
        const newSpeed = Math.random() * 0.25 + 0.12;
        meteor.velocity.set(
          (Math.random() - 0.5) * newSpeed,
          (Math.random() - 0.5) * newSpeed,
          (Math.random() - 0.5) * newSpeed
        );
        meteor.speed = newSpeed;
        meteor.trail = [];
      }
      
      const headKey = `head-${meteorIndex}`;
      let headMesh = meshesRef.current.get(headKey) as THREE.Mesh;
      
      if (!headMesh) {
        const geometry = new THREE.SphereGeometry(meteor.size, 20, 20);
        const materialIndex = Math.floor(Math.random() * sharedMaterials.length);
        headMesh = new THREE.Mesh(geometry, sharedMaterials[materialIndex].head);
        meshesRef.current.set(headKey, headMesh);
        groupRef.current.add(headMesh);
      }
      headMesh.position.copy(meteor.position);
      
      const glowKey = `glow-${meteorIndex}`;
      let glowMesh = meshesRef.current.get(glowKey) as THREE.Mesh;
      
      if (!glowMesh) {
        const glowGeometry = new THREE.SphereGeometry(meteor.size * 3, 16, 16);
        const materialIndex = Math.floor(Math.random() * sharedMaterials.length);
        glowMesh = new THREE.Mesh(glowGeometry, sharedMaterials[materialIndex].glow);
        meshesRef.current.set(glowKey, glowMesh);
        groupRef.current.add(glowMesh);
      }
      glowMesh.position.copy(meteor.position);
      
      if (updateGeometry && meteor.trail.length > 3) {
        const trailKey = `trail-${meteorIndex}`;
        let trailLine = meshesRef.current.get(trailKey) as THREE.Line;
        
        if (!trailLine) {
          const trailGeometry = new THREE.BufferGeometry();
          const materialIndex = Math.floor(Math.random() * sharedMaterials.length);
          trailLine = new THREE.Line(trailGeometry, sharedMaterials[materialIndex].trail);
          meshesRef.current.set(trailKey, trailLine);
          groupRef.current.add(trailLine);
        }
        
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
