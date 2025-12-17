import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

export const ShootingStars = () => {
  const groupRef = useRef<THREE.Group>(null);
  const isMobile = useIsMobile();
  
  const starCount = isMobile ? 8 : 25;
  
  const stars = useMemo(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      id: i,
      startPos: new THREE.Vector3(
        (Math.random() - 0.5) * 300 + 100,
        (Math.random() - 0.5) * 200 + 50,
        -150 - Math.random() * 100
      ),
      direction: new THREE.Vector3(
        -0.8 - Math.random() * 0.4,
        -0.3 - Math.random() * 0.3,
        Math.random() * 0.2
      ).normalize(),
      speed: 15 + Math.random() * 25,
      length: 8 + Math.random() * 15,
      delay: Math.random() * 12,
      duration: 2 + Math.random() * 3,
      color: new THREE.Color().setHSL(0.1 + Math.random() * 0.15, 0.8, 0.9),
      size: 0.3 + Math.random() * 0.5,
    }));
  }, [starCount]);

  const trailGeometry = useMemo(() => new THREE.BufferGeometry(), []);
  const trailPositions = useMemo(() => new Float32Array(starCount * 6), [starCount]);
  const trailColors = useMemo(() => new Float32Array(starCount * 6), [starCount]);

  useFrame((state) => {
    if (isMobile && state.clock.elapsedTime % 3 < 2.95) return;
    
    const time = state.clock.elapsedTime;
    
    stars.forEach((star, i) => {
      const cycleTime = (time + star.delay) % (star.duration + star.delay);
      const progress = Math.max(0, (cycleTime - star.delay) / star.duration);
      
      if (progress > 0 && progress < 1) {
        const currentPos = star.startPos.clone().addScaledVector(
          star.direction,
          progress * star.speed * star.duration
        );
        const tailPos = currentPos.clone().addScaledVector(
          star.direction,
          -star.length * (1 - progress * 0.5)
        );
        
        const fadeIn = Math.min(progress * 5, 1);
        const fadeOut = Math.min((1 - progress) * 3, 1);
        const alpha = fadeIn * fadeOut;
        
        trailPositions[i * 6] = currentPos.x;
        trailPositions[i * 6 + 1] = currentPos.y;
        trailPositions[i * 6 + 2] = currentPos.z;
        trailPositions[i * 6 + 3] = tailPos.x;
        trailPositions[i * 6 + 4] = tailPos.y;
        trailPositions[i * 6 + 5] = tailPos.z;
        
        trailColors[i * 6] = star.color.r * alpha;
        trailColors[i * 6 + 1] = star.color.g * alpha;
        trailColors[i * 6 + 2] = star.color.b * alpha;
        trailColors[i * 6 + 3] = star.color.r * alpha * 0.1;
        trailColors[i * 6 + 4] = star.color.g * alpha * 0.1;
        trailColors[i * 6 + 5] = star.color.b * alpha * 0.1;
      } else {
        for (let j = 0; j < 6; j++) {
          trailPositions[i * 6 + j] = 0;
          trailColors[i * 6 + j] = 0;
        }
      }
    });
    
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
    trailGeometry.attributes.position.needsUpdate = true;
    trailGeometry.attributes.color.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={trailGeometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
};
