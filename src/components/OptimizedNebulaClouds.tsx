import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';
import { particleVertexShader, particleFragmentShader } from '@/utils/sharedResources';

export const NebulaClouds = () => {
  const isMobile = useIsMobile();
  const meshRef = useRef<THREE.Points>(null);
  
  const { geometry, material } = useMemo(() => {
    const cloudCount = isMobile ? 8 : 15; // More clouds, optimized rendering
    const particlesPerCloud = isMobile ? 1000 : 2000;
    const totalParticles = cloudCount * particlesPerCloud;
    
    const positions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);
    const phases = new Float32Array(totalParticles);
    
    const colorPalettes = [
      [new THREE.Color('#ff6b9d'), new THREE.Color('#c06c84')],
      [new THREE.Color('#6b5b95'), new THREE.Color('#88d8b0')],
      [new THREE.Color('#feb236'), new THREE.Color('#ff6f91')],
      [new THREE.Color('#4ecdc4'), new THREE.Color('#44a08d')],
      [new THREE.Color('#f38181'), new THREE.Color('#aa4465')],
      [new THREE.Color('#667eea'), new THREE.Color('#764ba2')],
      [new THREE.Color('#00d4ff'), new THREE.Color('#090979')],
      [new THREE.Color('#f093fb'), new THREE.Color('#f5576c')],
    ];
    
    let particleIndex = 0;
    
    for (let cloudIndex = 0; cloudIndex < cloudCount; cloudIndex++) {
      const centerX = (Math.random() - 0.5) * 50;
      const centerY = (Math.random() - 0.5) * 50;
      const centerZ = (Math.random() - 0.5) * 50;
      
      const palette = colorPalettes[cloudIndex % colorPalettes.length];
      
      for (let i = 0; i < particlesPerCloud; i++) {
        const spreadX = (Math.random() - 0.5) * 2;
        const spreadY = (Math.random() - 0.5) * 2;
        const spreadZ = (Math.random() - 0.5) * 2;
        
        const radius = Math.sqrt(spreadX * spreadX + spreadY * spreadY + spreadZ * spreadZ);
        const density = Math.exp(-radius * radius / 2);
        
        const scale = 10;
        const i3 = particleIndex * 3;
        positions[i3] = centerX + spreadX * scale;
        positions[i3 + 1] = centerY + spreadY * scale;
        positions[i3 + 2] = centerZ + spreadZ * scale;
        
        const colorMix = Math.random();
        const color = palette[0].clone().lerp(palette[1], colorMix);
        const brightness = 0.7 + Math.random() * 0.5;
        color.multiplyScalar(brightness);
        
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        sizes[particleIndex] = density * (Math.random() * 0.8 + 0.4);
        phases[particleIndex] = Math.random() * Math.PI * 2;
        
        particleIndex++;
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        attribute float phase;
        uniform float time;
        varying vec3 vColor;
        
        void main() {
          vColor = customColor;
          vec3 pos = position;
          float breathe = 1.0 + sin(time * 0.3 + phase) * 0.08;
          pos *= breathe;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * breathe * (400.0 / -mvPosition.z);
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
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return <points ref={meshRef} geometry={geometry} material={material} frustumCulled />;
};
