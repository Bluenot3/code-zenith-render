import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const StarClusters = () => {
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
  const clustersRef = useRef<THREE.Points[]>([]);
  const frameCount = useRef(0);
  
  const clusterConfigs = useMemo(() => {
    const clusterCount = isMobile ? 3 : 8;
    const configs: { positions: Float32Array; colors: Float32Array; sizes: Float32Array; center: THREE.Vector3; rotationSpeed: number }[] = [];
    
    const clusterColors = [
      [new THREE.Color('#ffffff'), new THREE.Color('#aaccff'), new THREE.Color('#88aaff')],
      [new THREE.Color('#ffddaa'), new THREE.Color('#ffcc88'), new THREE.Color('#ffaa66')],
      [new THREE.Color('#ffaacc'), new THREE.Color('#ff88aa'), new THREE.Color('#ff6688')],
      [new THREE.Color('#aaffcc'), new THREE.Color('#88ffaa'), new THREE.Color('#66ff88')],
    ];
    
    for (let c = 0; c < clusterCount; c++) {
      const starCount = isMobile ? 100 : 350;
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const sizes = new Float32Array(starCount);
      
      const center = new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 100
      );
      
      const colorSet = clusterColors[c % clusterColors.length];
      const clusterRadius = 5 + Math.random() * 8;
      
      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        
        // Gaussian distribution for cluster density
        const gaussianR = () => {
          let u = 0, v = 0;
          while (u === 0) u = Math.random();
          while (v === 0) v = Math.random();
          return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };
        
        const radius = Math.abs(gaussianR()) * clusterRadius;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
        
        // Color gradient from center to edge
        const distFactor = radius / clusterRadius;
        const colorIndex = Math.min(Math.floor(distFactor * colorSet.length), colorSet.length - 1);
        const color = colorSet[colorIndex];
        
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        // Larger stars in center
        sizes[i] = (1 - distFactor * 0.5) * (Math.random() * 0.3 + 0.1);
      }
      
      configs.push({
        positions,
        colors,
        sizes,
        center,
        rotationSpeed: (Math.random() - 0.5) * 0.002,
      });
    }
    
    return configs;
  }, [isMobile]);
  
  useMemo(() => {
    if (clustersRef.current.length > 0) return;
    
    clusterConfigs.forEach((config) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(config.positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(config.colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(config.sizes, 1));
      
      const material = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
        toneMapped: false,
      });
      
      const cluster = new THREE.Points(geometry, material);
      cluster.position.copy(config.center);
      clustersRef.current.push(cluster);
      
      if (groupRef.current) {
        groupRef.current.add(cluster);
      }
    });
  }, [clusterConfigs]);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return;
    
    const time = state.clock.elapsedTime;
    
    clustersRef.current.forEach((cluster, index) => {
      const config = clusterConfigs[index];
      
      // Slow rotation
      cluster.rotation.y += config.rotationSpeed;
      cluster.rotation.x += config.rotationSpeed * 0.3;
      
      // Gentle floating
      cluster.position.y = config.center.y + Math.sin(time * 0.2 + index) * 0.5;
    });
  });
  
  return <group ref={groupRef} renderOrder={-2} />;
};
