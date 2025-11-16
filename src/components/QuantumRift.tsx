import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const QuantumRift = () => {
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
  const riftMeshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const frameCount = useRef(0);
  
  // Create quantum rift effect
  if (riftMeshRef.current === null && groupRef.current) {
    // Create swirling vortex geometry with optimized detail
    const segments = isMobile ? 24 : 48;
    const radialSegments = isMobile ? 64 : 128;
    const riftGeometry = new THREE.TorusGeometry(3, 0.5, segments, radialSegments);
    const riftMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#00ffff'),
      emissive: new THREE.Color('#0088ff'),
      emissiveIntensity: 3.5,
      transparent: true,
      opacity: 0.8,
      metalness: 1,
      roughness: 0.05,
      side: THREE.DoubleSide,
    });
    
    const riftMesh = new THREE.Mesh(riftGeometry, riftMaterial);
    riftMesh.position.set(-15, 3, -18);
    riftMesh.rotation.x = Math.PI / 4;
    riftMeshRef.current = riftMesh;
    groupRef.current.add(riftMesh);
    
    // Create quantum particles with reduced count
    const particleCount = isMobile ? 1500 : 3000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color1 = new THREE.Color('#00ffff');
    const color2 = new THREE.Color('#ff00ff');
    const color3 = new THREE.Color('#ffffff');
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 4.5;
      const height = (Math.random() - 0.5) * 2.5;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      const colorChoice = Math.random();
      const selectedColor = colorChoice < 0.33 ? color1 : colorChoice < 0.66 ? color2 : color3;
      colors[i * 3] = selectedColor.r;
      colors[i * 3 + 1] = selectedColor.g;
      colors[i * 3 + 2] = selectedColor.b;
      
      sizes[i] = Math.random() * 0.12 + 0.03;
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.position.copy(riftMesh.position);
    particlesRef.current = particles;
    groupRef.current.add(particles);
  }
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    frameCount.current++;
    
    // Update every other frame
    if (frameCount.current % 2 !== 0) return;
    
    if (riftMeshRef.current) {
      // Rotate and pulse the rift with smoother animation
      riftMeshRef.current.rotation.z += 0.015;
      const scale = 1 + Math.sin(time * 2) * 0.15;
      riftMeshRef.current.scale.set(scale, scale, scale);
      
      // Pulsing emissive intensity with more dramatic effect
      if (riftMeshRef.current.material instanceof THREE.MeshStandardMaterial) {
        riftMeshRef.current.material.emissiveIntensity = 3 + Math.sin(time * 3) * 0.8;
      }
    }
    
    if (particlesRef.current) {
      // Swirl particles around the rift with more fluid motion
      particlesRef.current.rotation.z += 0.008;
      particlesRef.current.rotation.x = Math.sin(time * 0.3) * 0.3;
      particlesRef.current.rotation.y += 0.003;
    }
  });
  
  return <group ref={groupRef} renderOrder={-1} />;
};
