import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';
import { particleVertexShader, particleFragmentShader } from '@/utils/sharedResources';

export const GalaxyClusters = () => {
  const isMobile = useIsMobile();
  const pointsRef = useRef<THREE.Points>(null);
  
  const { geometry, material, instanceCount, matrices } = useMemo(() => {
    const galaxyCount = isMobile ? 6 : 12; // More galaxies but optimized
    const particlesPerGalaxy = isMobile ? 1500 : 3000;
    const totalParticles = galaxyCount * particlesPerGalaxy;
    
    const positions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);
    const matrices: THREE.Matrix4[] = [];
    
    const colorThemes = [
      { core: new THREE.Color('#ffd700'), outer: new THREE.Color('#4169e1') },
      { core: new THREE.Color('#ff1493'), outer: new THREE.Color('#9370db') },
      { core: new THREE.Color('#00ced1'), outer: new THREE.Color('#191970') },
      { core: new THREE.Color('#ff6347'), outer: new THREE.Color('#8b008b') },
      { core: new THREE.Color('#98fb98'), outer: new THREE.Color('#2f4f4f') },
      { core: new THREE.Color('#f0e68c'), outer: new THREE.Color('#483d8b') },
    ];
    
    let particleIndex = 0;
    
    for (let g = 0; g < galaxyCount; g++) {
      const galaxyDistance = 100 + Math.random() * 80;
      const galaxyAngle = (g / galaxyCount) * Math.PI * 2;
      const galaxyElevation = (Math.random() - 0.5) * 50;
      
      const centerX = Math.cos(galaxyAngle) * galaxyDistance;
      const centerY = galaxyElevation;
      const centerZ = Math.sin(galaxyAngle) * galaxyDistance;
      
      const colorTheme = colorThemes[g % colorThemes.length];
      
      for (let i = 0; i < particlesPerGalaxy; i++) {
        const armIndex = Math.floor(Math.random() * 4); // 4 arms for more detail
        const armAngle = (armIndex / 4) * Math.PI * 2;
        const distanceFromCenter = Math.pow(Math.random(), 0.6) * 15;
        const spiralAngle = armAngle + distanceFromCenter * 0.6;
        
        const spreadAngle = (Math.random() - 0.5) * 0.6;
        const spreadRadius = (Math.random() - 0.5) * 1.5;
        
        const x = Math.cos(spiralAngle + spreadAngle) * (distanceFromCenter + spreadRadius);
        const z = Math.sin(spiralAngle + spreadAngle) * (distanceFromCenter + spreadRadius);
        const y = (Math.random() - 0.5) * (1.2 - distanceFromCenter * 0.08);
        
        const i3 = particleIndex * 3;
        positions[i3] = centerX + x;
        positions[i3 + 1] = centerY + y;
        positions[i3 + 2] = centerZ + z;
        
        const distanceRatio = distanceFromCenter / 15;
        const color = colorTheme.core.clone().lerp(colorTheme.outer, distanceRatio);
        const brightness = 0.8 + Math.random() * 0.4;
        color.multiplyScalar(brightness);
        
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        sizes[particleIndex] = (1 - distanceRatio * 0.4) * (Math.random() * 0.4 + 0.15);
        
        particleIndex++;
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    return { geometry, material, instanceCount: totalParticles, matrices };
  }, [isMobile]);
  
  useFrame((state) => {
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.time.value = state.clock.elapsedTime * 0.1;
    }
  });
  
  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
};
