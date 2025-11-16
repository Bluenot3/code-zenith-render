import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const QuantumRift = () => {
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
  const riftMeshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  // Create quantum rift effect
  if (riftMeshRef.current === null && groupRef.current) {
    // Create swirling vortex geometry with ultra detail
    const segments = isMobile ? 48 : 96;
    const radialSegments = isMobile ? 150 : 300;
    const riftGeometry = new THREE.TorusKnotGeometry(3, 0.8, radialSegments, segments, 3, 2);
    
    const riftMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#00ffff'),
      emissive: new THREE.Color('#0088ff'),
      emissiveIntensity: 5,
      transparent: true,
      opacity: 0.85,
      metalness: 1,
      roughness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0,
      transmission: 0.4,
      thickness: 1,
      ior: 2.5,
      iridescence: 1,
      iridescenceIOR: 2.5,
      iridescenceThicknessRange: [100, 1000],
      side: THREE.DoubleSide,
      envMapIntensity: 3,
    });
    
    const riftMesh = new THREE.Mesh(riftGeometry, riftMaterial);
    riftMesh.position.set(-15, 3, -18);
    riftMesh.rotation.x = Math.PI / 4;
    riftMeshRef.current = riftMesh;
    groupRef.current.add(riftMesh);
    
    // Add inner rotating rings
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(2.5 - i * 0.7, 0.15, 32, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(i === 0 ? '#ff00ff' : i === 1 ? '#00ffff' : '#ffff00'),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(riftMesh.position);
      ring.rotation.copy(riftMesh.rotation);
      (ring as any).rotationSpeed = 0.02 + i * 0.01;
      groupRef.current.add(ring);
    }
    
    // Add energy beams
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const beamGeometry = new THREE.CylinderGeometry(0.05, 0.05, 8, 8);
      const beamMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#ffffff'),
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      beam.position.set(
        riftMesh.position.x + Math.cos(angle) * 3,
        riftMesh.position.y,
        riftMesh.position.z + Math.sin(angle) * 3
      );
      beam.lookAt(riftMesh.position);
      groupRef.current.add(beam);
    }
    
    // Create quantum particles with adaptive count
    const particleCount = isMobile ? 2000 : 5000;
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
    
    if (riftMeshRef.current) {
      // Complex rotation on multiple axes
      riftMeshRef.current.rotation.z += 0.02;
      riftMeshRef.current.rotation.y += 0.008;
      
      // Dramatic morphing scale
      const scaleX = 1 + Math.sin(time * 2.5) * 0.25;
      const scaleY = 1 + Math.sin(time * 2.2) * 0.22;
      const scaleZ = 1 + Math.sin(time * 2.8) * 0.2;
      riftMeshRef.current.scale.set(scaleX, scaleY, scaleZ);
      
      // Ultra intense pulsing emissive
      if (riftMeshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
        riftMeshRef.current.material.emissiveIntensity = 4 + Math.sin(time * 4) * 2;
        riftMeshRef.current.material.iridescence = 0.8 + Math.sin(time * 3) * 0.2;
        riftMeshRef.current.material.transmission = 0.3 + Math.sin(time * 2) * 0.2;
      }
      
      // Animate surrounding elements
      if (groupRef.current) {
        groupRef.current.children.forEach((child, index) => {
          if (child !== riftMeshRef.current && child !== particlesRef.current) {
            if ((child as any).rotationSpeed !== undefined) {
              child.rotation.z += (child as any).rotationSpeed * (1 + Math.sin(time) * 0.3);
              
              // Pulse rings
              const ringScale = 1 + Math.sin(time * 3 + index) * 0.15;
              child.scale.set(ringScale, ringScale, ringScale);
            }
          }
        });
      }
    }
    
    if (particlesRef.current) {
      // Vortex particle motion
      particlesRef.current.rotation.z += 0.012;
      particlesRef.current.rotation.x = Math.sin(time * 0.5) * 0.5;
      particlesRef.current.rotation.y += 0.006;
      
      // Animate particles spiraling
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const angle = time * 2 + i * 0.01;
        const radius = Math.sqrt(positions[i] * positions[i] + positions[i + 2] * positions[i + 2]);
        positions[i] = Math.cos(angle) * radius;
        positions[i + 2] = Math.sin(angle) * radius;
        positions[i + 1] += Math.sin(time * 3 + i * 0.1) * 0.01;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Pulse particle size
      if (particlesRef.current.material instanceof THREE.PointsMaterial) {
        particlesRef.current.material.size = 0.1 + Math.sin(time * 5) * 0.05;
      }
    }
  });
  
  return <group ref={groupRef} renderOrder={-1} />;
};
