import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const CrystalFormation = () => {
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
  const crystalsRef = useRef<THREE.Mesh[]>([]);
  const particlesRef = useRef<THREE.Points[]>([]);
  
  useMemo(() => {
    if (crystalsRef.current.length > 0) return;
    
    const crystalCount = isMobile ? 12 : 24; // More crystals
    const colors = [
      new THREE.Color('#ff00ff'),
      new THREE.Color('#00ffff'),
      new THREE.Color('#ffff00'),
      new THREE.Color('#00ff88'),
      new THREE.Color('#ff0088'),
      new THREE.Color('#8800ff'),
      new THREE.Color('#ff6600'),
      new THREE.Color('#00ffaa'),
    ];
    
    for (let i = 0; i < crystalCount; i++) {
      // Use complex geometries - mix of shapes
      const shapeType = i % 3;
      let geometry;
      
      if (shapeType === 0) {
        // Elongated dodecahedron
        geometry = new THREE.DodecahedronGeometry(0.8, 0);
        geometry.scale(1, 2.5, 1);
      } else if (shapeType === 1) {
        // Sharp icosahedron
        geometry = new THREE.IcosahedronGeometry(0.9, 1);
        geometry.scale(0.8, 3, 0.8);
      } else {
        // Refined octahedron
        geometry = new THREE.OctahedronGeometry(0.85, 2);
        geometry.scale(0.9, 2.8, 0.9);
      }
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Ultra advanced material with iridescence
      const material = new THREE.MeshPhysicalMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 3.5,
        transparent: true,
        opacity: 0.92,
        metalness: 1,
        roughness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0,
        transmission: 0.6,
        thickness: 1.2,
        ior: 2.4,
        iridescence: 1,
        iridescenceIOR: 2.3,
        iridescenceThicknessRange: [100, 800],
        sheen: 1.5,
        sheenColor: color,
        side: THREE.DoubleSide,
        envMapIntensity: 3,
      });
      
      const crystal = new THREE.Mesh(geometry, material);
      
      // Position in elaborate cluster formation
      const angle = (i / crystalCount) * Math.PI * 2;
      const radius = 2.5 + Math.random() * 2;
      const height = (Math.random() - 0.5) * 4;
      const spiralOffset = (i / crystalCount) * Math.PI;
      
      crystal.position.set(
        Math.cos(angle) * radius + 10,
        height - 5 + Math.sin(spiralOffset) * 2,
        Math.sin(angle) * radius - 8
      );
      
      // Dynamic rotation
      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      crystalsRef.current.push(crystal);
      
      if (groupRef.current) {
        groupRef.current.add(crystal);
      }
      
      // Add volumetric inner glow with same geometry
      const glowGeometry = geometry.clone();
      glowGeometry.scale(0.85, 0.85, 0.85);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      crystal.add(glow);
      
      // Add particle emissions around each crystal
      const particleCount = isMobile ? 50 : 120;
      const particlePositions = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);
      
      for (let p = 0; p < particleCount; p++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.5 + Math.random() * 0.8;
        const height = (Math.random() - 0.5) * 3;
        
        particlePositions[p * 3] = Math.cos(angle) * radius;
        particlePositions[p * 3 + 1] = height;
        particlePositions[p * 3 + 2] = Math.sin(angle) * radius;
        
        particleColors[p * 3] = color.r;
        particleColors[p * 3 + 1] = color.g;
        particleColors[p * 3 + 2] = color.b;
      }
      
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.position.copy(crystal.position);
      particlesRef.current.push(particles);
      
      if (groupRef.current) {
        groupRef.current.add(particles);
      }
      
      // Add point light for each crystal
      const pointLight = new THREE.PointLight(color, 8, 8);
      pointLight.position.copy(crystal.position);
      if (groupRef.current) {
        groupRef.current.add(pointLight);
      }
    }
  }, [isMobile]);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    crystalsRef.current.forEach((crystal, index) => {
      // Complex multi-axis rotation
      crystal.rotation.y += 0.009 + index * 0.002;
      crystal.rotation.x = Math.sin(time * 0.8 + index * 0.5) * 0.25;
      crystal.rotation.z = Math.cos(time * 0.6 + index * 0.3) * 0.15;
      
      // Orbiting motion around center
      const orbitRadius = 0.3;
      const orbitSpeed = 0.5 + index * 0.1;
      crystal.position.x += Math.cos(time * orbitSpeed + index) * orbitRadius * 0.01;
      crystal.position.z += Math.sin(time * orbitSpeed + index) * orbitRadius * 0.01;
      
      // Vertical floating with variety
      crystal.position.y += Math.sin(time * 1.5 + index * 0.7) * 0.006;
      
      // Intense pulsing emissive with color shift
      if (crystal.material instanceof THREE.MeshPhysicalMaterial) {
        const pulseIntensity = 3 + Math.sin(time * 3 + index) * 1.5;
        crystal.material.emissiveIntensity = pulseIntensity;
        
        // Animate iridescence
        crystal.material.iridescence = 0.7 + Math.sin(time * 2 + index) * 0.3;
        
        // Morph transmission
        crystal.material.transmission = 0.4 + Math.sin(time * 1.5 + index) * 0.3;
      }
      
      // Dynamic scale morphing
      const scaleX = 1 + Math.sin(time * 2.2 + index) * 0.15;
      const scaleY = 1 + Math.sin(time * 1.8 + index * 0.5) * 0.12;
      const scaleZ = 1 + Math.sin(time * 2.5 + index * 0.3) * 0.13;
      crystal.scale.set(scaleX, scaleY, scaleZ);
    });
    
    // Animate particle clouds
    particlesRef.current.forEach((particles, index) => {
      particles.rotation.y += 0.015 + index * 0.003;
      particles.rotation.x = Math.sin(time * 0.5 + index) * 0.4;
      
      // Pulsing particle cloud
      const particleScale = 1 + Math.sin(time * 2 + index * 0.5) * 0.2;
      particles.scale.set(particleScale, particleScale, particleScale);
      
      // Update particle positions for swirling effect
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const angle = time * 0.5 + i * 0.01;
        positions[i] += Math.cos(angle) * 0.001;
        positions[i + 2] += Math.sin(angle) * 0.001;
      }
      particles.geometry.attributes.position.needsUpdate = true;
    });
    
    // Rotate entire formation dramatically
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.08;
      groupRef.current.rotation.z = Math.cos(time * 0.25) * 0.04;
    }
  });
  
  return <group ref={groupRef} renderOrder={-1} />;
};
