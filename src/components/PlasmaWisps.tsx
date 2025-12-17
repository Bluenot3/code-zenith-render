import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const PlasmaWisps = () => {
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
  const wispsRef = useRef<THREE.Points[]>([]);
  const frameCount = useRef(0);
  
  const wispConfigs = useMemo(() => {
    const count = isMobile ? 4 : 10;
    const configs: { positions: Float32Array; colors: Float32Array; center: THREE.Vector3; phase: number }[] = [];
    
    const plasmaColors = [
      [new THREE.Color('#ff00ff'), new THREE.Color('#8800ff'), new THREE.Color('#ff0088')],
      [new THREE.Color('#00ffff'), new THREE.Color('#0088ff'), new THREE.Color('#00ff88')],
      [new THREE.Color('#ffff00'), new THREE.Color('#ff8800'), new THREE.Color('#ffaa00')],
      [new THREE.Color('#ff0000'), new THREE.Color('#ff4400'), new THREE.Color('#ff0044')],
    ];
    
    for (let w = 0; w < count; w++) {
      const particleCount = isMobile ? 150 : 400;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      const colorSet = plasmaColors[w % plasmaColors.length];
      const center = new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 60
      );
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Swirling wisp shape
        const t = i / particleCount;
        const angle = t * Math.PI * 4;
        const radius = t * 3 + Math.random() * 0.5;
        const height = (Math.random() - 0.5) * 4;
        
        positions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.8;
        positions[i3 + 1] = height + t * 2;
        positions[i3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.8;
        
        // Gradient colors along wisp
        const color = colorSet[Math.floor(t * colorSet.length)];
        const brightness = 0.7 + t * 0.3;
        colors[i3] = color.r * brightness;
        colors[i3 + 1] = color.g * brightness;
        colors[i3 + 2] = color.b * brightness;
      }
      
      configs.push({ positions, colors, center, phase: Math.random() * Math.PI * 2 });
    }
    
    return configs;
  }, [isMobile]);
  
  useMemo(() => {
    if (wispsRef.current.length > 0) return;
    
    wispConfigs.forEach((config) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(config.positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(config.colors, 3));
      
      const material = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
        toneMapped: false,
      });
      
      const wisp = new THREE.Points(geometry, material);
      wisp.position.copy(config.center);
      wispsRef.current.push(wisp);
      
      if (groupRef.current) {
        groupRef.current.add(wisp);
      }
    });
  }, [wispConfigs]);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return;
    
    const time = state.clock.elapsedTime;
    
    wispsRef.current.forEach((wisp, index) => {
      const config = wispConfigs[index];
      
      // Ethereal floating motion
      wisp.rotation.y += 0.008;
      wisp.position.y = config.center.y + Math.sin(time * 0.5 + config.phase) * 2;
      wisp.position.x = config.center.x + Math.cos(time * 0.3 + config.phase) * 1.5;
      
      // Pulsing scale
      const scale = 1 + Math.sin(time * 1.5 + config.phase) * 0.2;
      wisp.scale.setScalar(scale);
      
      // Update particle positions for flowing effect
      const positions = wisp.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const wave = Math.sin(time * 2 + i * 0.1 + config.phase) * 0.05;
        positions[i] += wave;
        positions[i + 2] += wave;
      }
      wisp.geometry.attributes.position.needsUpdate = true;
    });
  });
  
  return <group ref={groupRef} renderOrder={-1} />;
};
