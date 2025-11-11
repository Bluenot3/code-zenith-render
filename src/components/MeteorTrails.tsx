import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Meteor {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  trail: THREE.Vector3[];
  age: number;
}

export const MeteorTrails = () => {
  const meteorsRef = useRef<Meteor[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  
  // Initialize meteors
  useMemo(() => {
    const meteorCount = 15;
    meteorsRef.current = Array.from({ length: meteorCount }, () => {
      const startX = (Math.random() - 0.5) * 40;
      const startY = (Math.random() - 0.5) * 40;
      const startZ = (Math.random() - 0.5) * 40;
      
      return {
        position: new THREE.Vector3(startX, startY, startZ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15
        ),
        trail: [],
        age: 0,
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
      
      // Add to trail
      meteor.trail.push(meteor.position.clone());
      if (meteor.trail.length > 20) {
        meteor.trail.shift();
      }
      
      // Reset if out of bounds
      const bounds = 25;
      if (
        Math.abs(meteor.position.x) > bounds ||
        Math.abs(meteor.position.y) > bounds ||
        Math.abs(meteor.position.z) > bounds
      ) {
        meteor.position.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40
        );
        meteor.velocity.set(
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15
        );
        meteor.trail = [];
        meteor.age = 0;
      }
      
      // Draw glowing orange point
      const pointGeometry = new THREE.SphereGeometry(0.08, 8, 8);
      const pointMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ff6600'),
        emissive: new THREE.Color('#ff6600'),
        emissiveIntensity: 3,
        transparent: true,
        opacity: 1,
      });
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      point.position.copy(meteor.position);
      groupRef.current.add(point);
      
      // Add glow halo
      const haloGeometry = new THREE.SphereGeometry(0.15, 8, 8);
      const haloMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#ff8833'),
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const halo = new THREE.Mesh(haloGeometry, haloMaterial);
      halo.position.copy(meteor.position);
      groupRef.current.add(halo);
      
      // Draw mesh wire tail
      if (meteor.trail.length > 1) {
        const trailPoints = meteor.trail.map((p) => p.clone());
        const curve = new THREE.CatmullRomCurve3(trailPoints);
        const tubeGeometry = new THREE.TubeGeometry(curve, meteor.trail.length * 2, 0.02, 4, false);
        
        // Create gradient material for tail fade
        const colors = new Float32Array(tubeGeometry.attributes.position.count * 3);
        for (let i = 0; i < colors.length; i += 3) {
          const ratio = (i / 3) / (colors.length / 3);
          const color = new THREE.Color('#ff6600');
          color.lerp(new THREE.Color('#ff0000'), ratio);
          colors[i] = color.r;
          colors[i + 1] = color.g;
          colors[i + 2] = color.b;
        }
        tubeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const tailMaterial = new THREE.MeshStandardMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.6,
          emissive: new THREE.Color('#ff3300'),
          emissiveIntensity: 1.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const tail = new THREE.Mesh(tubeGeometry, tailMaterial);
        groupRef.current.add(tail);
        
        // Add wireframe overlay for mesh effect
        const wireframeGeometry = new THREE.EdgesGeometry(tubeGeometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color('#ffaa55'),
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        groupRef.current.add(wireframe);
      }
    });
  });
  
  return <group ref={groupRef} renderOrder={-2} />;
};
