import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const QuantumRift = () => {
  const groupRef = useRef<THREE.Group>(null);
  const riftMeshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  // Create the quantum rift effect
  if (riftMeshRef.current === null && groupRef.current) {
    // Create swirling vortex geometry
    const riftGeometry = new THREE.TorusGeometry(3, 0.4, 32, 100);
    const riftMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#00ffff'),
      emissive: new THREE.Color('#0088ff'),
      emissiveIntensity: 2.5,
      transparent: true,
      opacity: 0.7,
      metalness: 1,
      roughness: 0.1,
      side: THREE.DoubleSide,
    });
    
    const riftMesh = new THREE.Mesh(riftGeometry, riftMaterial);
    riftMesh.position.set(-15, 3, -18);
    riftMesh.rotation.x = Math.PI / 4;
    riftMeshRef.current = riftMesh;
    groupRef.current.add(riftMesh);
    
    // Create quantum particles swirling around rift
    const particleCount = 3000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color1 = new THREE.Color('#00ffff');
    const color2 = new THREE.Color('#ff00ff');
    const color3 = new THREE.Color('#ffffff');
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 4;
      const height = (Math.random() - 0.5) * 2;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      const colorChoice = Math.random();
      const selectedColor = colorChoice < 0.33 ? color1 : colorChoice < 0.66 ? color2 : color3;
      colors[i * 3] = selectedColor.r;
      colors[i * 3 + 1] = selectedColor.g;
      colors[i * 3 + 2] = selectedColor.b;
      
      sizes[i] = Math.random() * 0.08 + 0.02;
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
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
    
    if (riftMeshRef.current) {
      // Rotate and pulse the rift
      riftMeshRef.current.rotation.z += 0.01;
      const scale = 1 + Math.sin(time * 2) * 0.1;
      riftMeshRef.current.scale.set(scale, scale, scale);
      
      // Pulsing emissive intensity
      if (riftMeshRef.current.material instanceof THREE.MeshStandardMaterial) {
        riftMeshRef.current.material.emissiveIntensity = 2 + Math.sin(time * 3) * 0.5;
      }
    }
    
    if (particlesRef.current) {
      // Swirl particles around the rift
      particlesRef.current.rotation.z += 0.005;
      particlesRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const sizes = particlesRef.current.geometry.attributes.size.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        // Add spiral motion
        const angle = Math.atan2(z, x);
        const radius = Math.sqrt(x * x + z * z);
        const newAngle = angle + 0.02;
        
        positions[i] = Math.cos(newAngle) * radius;
        positions[i + 2] = Math.sin(newAngle) * radius;
        
        // Pulsing particle sizes
        sizes[i / 3] = (0.05 + Math.sin(time * 2 + i) * 0.03);
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });
  
  return <group ref={groupRef} renderOrder={-1} />;
};
