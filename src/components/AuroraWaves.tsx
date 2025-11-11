import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const AuroraWaves = () => {
  const groupRef = useRef<THREE.Group>(null);
  const waveMeshesRef = useRef<THREE.Mesh[]>([]);
  
  // Create aurora wave meshes
  if (waveMeshesRef.current.length === 0) {
    const waveCount = 4;
    const colors = [
      new THREE.Color('#00ffaa'),
      new THREE.Color('#00aaff'),
      new THREE.Color('#aa00ff'),
      new THREE.Color('#ff00aa'),
    ];
    
    for (let i = 0; i < waveCount; i++) {
      // Create flowing wave plane
      const geometry = new THREE.PlaneGeometry(30, 8, 64, 16);
      const positions = geometry.attributes.position.array as Float32Array;
      
      // Add initial wave pattern
      for (let j = 0; j < positions.length; j += 3) {
        const x = positions[j];
        const y = positions[j + 1];
        positions[j + 2] = Math.sin(x * 0.3 + y * 0.5) * 0.5;
      }
      
      const material = new THREE.MeshBasicMaterial({
        color: colors[i],
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      // Position waves at different locations
      mesh.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      
      waveMeshesRef.current.push(mesh);
    }
  }
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    waveMeshesRef.current.forEach((mesh, index) => {
      const geometry = mesh.geometry as THREE.PlaneGeometry;
      const positions = geometry.attributes.position.array as Float32Array;
      
      // Animate wave undulation
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        // Multiple sine waves for complex movement
        positions[i + 2] = 
          Math.sin(x * 0.3 + time * 0.5 + index) * 0.5 +
          Math.cos(y * 0.4 + time * 0.3 + index) * 0.3 +
          Math.sin((x + y) * 0.2 + time * 0.4) * 0.2;
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
      
      // Slow drift movement
      mesh.position.x += Math.sin(time * 0.1 + index) * 0.01;
      mesh.position.y += Math.cos(time * 0.15 + index) * 0.01;
      
      // Gentle rotation
      mesh.rotation.z += 0.0005 * (index % 2 === 0 ? 1 : -1);
      
      // Pulsing opacity
      if (mesh.material instanceof THREE.MeshBasicMaterial) {
        mesh.material.opacity = 0.15 + Math.sin(time * 0.5 + index) * 0.1;
      }
    });
  });
  
  return (
    <group ref={groupRef} renderOrder={-2}>
      {waveMeshesRef.current.map((mesh, index) => (
        <primitive key={`aurora-${index}`} object={mesh} />
      ))}
    </group>
  );
};
