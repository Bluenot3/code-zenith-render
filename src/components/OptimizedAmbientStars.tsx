import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';
import { particleVertexShader, particleFragmentShader } from '@/utils/sharedResources';

export const AmbientStars = () => {
  const isMobile = useIsMobile();
  const pointsRef = useRef<THREE.Points>(null);
  
  const { geometry, material } = useMemo(() => {
    const starCount = isMobile ? 3000 : 6000; // More stars, single draw call
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const twinklePhases = new Float32Array(starCount);
    
    const starColors = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#ffffcc'),
      new THREE.Color('#ccccff'),
      new THREE.Color('#ffcccc'),
      new THREE.Color('#ccffff'),
    ];
    
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      
      // Distribute in spherical volume
      const radius = 150 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      const colorChoice = starColors[Math.floor(Math.random() * starColors.length)];
      const brightness = 0.6 + Math.random() * 0.7;
      
      colors[i3] = colorChoice.r * brightness;
      colors[i3 + 1] = colorChoice.g * brightness;
      colors[i3 + 2] = colorChoice.b * brightness;
      
      sizes[i] = Math.random() * 0.5 + 0.1;
      twinklePhases[i] = Math.random() * Math.PI * 2;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('twinklePhase', new THREE.BufferAttribute(twinklePhases, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        attribute float twinklePhase;
        uniform float time;
        varying vec3 vColor;
        
        void main() {
          vColor = customColor;
          float twinkle = 0.7 + sin(time * 2.0 + twinklePhase) * 0.3;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * twinkle * (500.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: particleFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    return { geometry, material };
  }, [isMobile]);
  
  useFrame((state) => {
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled />;
};
