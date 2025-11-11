import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Meteor {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  trail: THREE.Vector3[];
  age: number;
  color: THREE.Color;
  size: number;
  speed: number;
  glowIntensity: number;
}

export const MeteorTrails = () => {
  const meteorsRef = useRef<Meteor[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  
  // Initialize meteors with variety
  useMemo(() => {
    const meteorCount = 45;
    const colorPalette = [
      new THREE.Color('#ff6600'), // Orange
      new THREE.Color('#ff0066'), // Hot Pink
      new THREE.Color('#00ffff'), // Cyan
      new THREE.Color('#ff00ff'), // Magenta
      new THREE.Color('#ffff00'), // Yellow
      new THREE.Color('#00ff88'), // Teal
      new THREE.Color('#8800ff'), // Purple
      new THREE.Color('#ff3300'), // Red-Orange
      new THREE.Color('#00ffff'), // Bright Cyan
      new THREE.Color('#ffffff'), // White
    ];
    
    meteorsRef.current = Array.from({ length: meteorCount }, () => {
      const startX = (Math.random() - 0.5) * 50;
      const startY = (Math.random() - 0.5) * 50;
      const startZ = (Math.random() - 0.5) * 50;
      
      const speed = Math.random() * 0.15 + 0.05;
      const size = Math.random() * 0.08 + 0.06;
      
      return {
        position: new THREE.Vector3(startX, startY, startZ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed
        ),
        trail: [],
        age: 0,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)].clone(),
        size,
        speed,
        glowIntensity: Math.random() * 2 + 2,
      };
    });
  }, []);
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    // Clear previous frame
    while (groupRef.current.children.length > 0) {
      const child = groupRef.current.children[0];
      groupRef.current.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
    
    meteorsRef.current.forEach((meteor) => {
      // Update position
      meteor.position.add(meteor.velocity);
      meteor.age++;
      
      // Add to trail with dynamic length based on speed
      meteor.trail.push(meteor.position.clone());
      const maxTrailLength = Math.floor(meteor.speed * 150 + 15);
      if (meteor.trail.length > maxTrailLength) {
        meteor.trail.shift();
      }
      
      // Reset if out of bounds
      const bounds = 30;
      if (
        Math.abs(meteor.position.x) > bounds ||
        Math.abs(meteor.position.y) > bounds ||
        Math.abs(meteor.position.z) > bounds
      ) {
        meteor.position.set(
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50
        );
        const newSpeed = Math.random() * 0.15 + 0.05;
        meteor.velocity.set(
          (Math.random() - 0.5) * newSpeed,
          (Math.random() - 0.5) * newSpeed,
          (Math.random() - 0.5) * newSpeed
        );
        meteor.speed = newSpeed;
        meteor.trail = [];
        meteor.age = 0;
      }
      
      // Draw high-quality glowing point with dynamic color
      const pointGeometry = new THREE.SphereGeometry(meteor.size, 16, 16);
      const pointMaterial = new THREE.MeshStandardMaterial({
        color: meteor.color,
        emissive: meteor.color,
        emissiveIntensity: meteor.glowIntensity,
        transparent: true,
        opacity: 1,
        metalness: 0.8,
        roughness: 0.2,
      });
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      point.position.copy(meteor.position);
      groupRef.current.add(point);
      
      // Add inner bright core
      const coreGeometry = new THREE.SphereGeometry(meteor.size * 0.5, 16, 16);
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#ffffff'),
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      core.position.copy(meteor.position);
      groupRef.current.add(core);
      
      // Add multiple glow halos for depth
      const haloGeometry1 = new THREE.SphereGeometry(meteor.size * 2, 16, 16);
      const haloMaterial1 = new THREE.MeshBasicMaterial({
        color: meteor.color,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const halo1 = new THREE.Mesh(haloGeometry1, haloMaterial1);
      halo1.position.copy(meteor.position);
      groupRef.current.add(halo1);
      
      const haloGeometry2 = new THREE.SphereGeometry(meteor.size * 3, 16, 16);
      const haloMaterial2 = new THREE.MeshBasicMaterial({
        color: meteor.color,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const halo2 = new THREE.Mesh(haloGeometry2, haloMaterial2);
      halo2.position.copy(meteor.position);
      groupRef.current.add(halo2);
      
      // Draw high-quality mesh wire tail with dynamic effects
      if (meteor.trail.length > 1) {
        const trailPoints = meteor.trail.map((p) => p.clone());
        const curve = new THREE.CatmullRomCurve3(trailPoints);
        const tubeRadius = meteor.size * 0.3;
        const tubeGeometry = new THREE.TubeGeometry(curve, meteor.trail.length * 3, tubeRadius, 8, false);
        
        // Create advanced gradient material for tail fade
        const colors = new Float32Array(tubeGeometry.attributes.position.count * 3);
        const darkColor = meteor.color.clone().multiplyScalar(0.3);
        for (let i = 0; i < colors.length; i += 3) {
          const ratio = (i / 3) / (colors.length / 3);
          const color = meteor.color.clone();
          color.lerp(darkColor, ratio);
          colors[i] = color.r;
          colors[i + 1] = color.g;
          colors[i + 2] = color.b;
        }
        tubeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const tailMaterial = new THREE.MeshStandardMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.75,
          emissive: meteor.color,
          emissiveIntensity: 2,
          metalness: 0.5,
          roughness: 0.3,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const tail = new THREE.Mesh(tubeGeometry, tailMaterial);
        groupRef.current.add(tail);
        
        // Add high-quality wireframe overlay
        const wireframeGeometry = new THREE.EdgesGeometry(tubeGeometry);
        const lightColor = meteor.color.clone().offsetHSL(0, 0, 0.3);
        const wireframeMaterial = new THREE.LineBasicMaterial({
          color: lightColor,
          transparent: true,
          opacity: 0.9,
          linewidth: 2,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        groupRef.current.add(wireframe);
        
        // Add sparkle particles along trail
        const sparkleCount = Math.min(meteor.trail.length, 10);
        for (let i = 0; i < sparkleCount; i++) {
          const sparkleIndex = Math.floor((i / sparkleCount) * meteor.trail.length);
          const sparklePos = meteor.trail[sparkleIndex];
          
          const sparkleGeometry = new THREE.SphereGeometry(meteor.size * 0.4, 8, 8);
          const sparkleMaterial = new THREE.MeshBasicMaterial({
            color: meteor.color,
            transparent: true,
            opacity: (1 - i / sparkleCount) * 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
          sparkle.position.copy(sparklePos);
          groupRef.current.add(sparkle);
        }
      }
    });
  });
  
  return <group ref={groupRef} renderOrder={-2} />;
};
