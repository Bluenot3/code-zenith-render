import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { useStore, GeometryType } from '@/state/useStore';
import { MaterialSwitcher } from './MaterialSwitcher';

interface GeometrySwitcherProps {
  texture: THREE.Texture;
  onClick?: () => void;
}

export const GeometrySwitcher = ({ texture, onClick }: GeometrySwitcherProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useStore((state) => state.geometry);
  const animation = useStore((state) => state.animation);
  const material = useStore((state) => state.material);
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    if (animation.spin) {
      meshRef.current.rotation.y += delta * animation.speed;
    }
    
    if (animation.float) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * animation.speed) * 0.3;
    }
    
    if (animation.orbit) {
      meshRef.current.position.x = Math.cos(state.clock.elapsedTime * animation.speed) * 2;
      meshRef.current.position.z = Math.sin(state.clock.elapsedTime * animation.speed) * 2;
    }
  });
  
  const geometryNode = useMemo(() => {
    const props = {
      ref: meshRef,
      onClick,
      castShadow: true,
      receiveShadow: true,
    };
    
    switch (geometry.type) {
      case 'text':
        return (
          <Center>
            <Text3D
              {...props}
              font="/fonts/helvetiker_regular.typeface.json"
              size={geometry.size}
              height={geometry.depth}
              curveSegments={geometry.curveSegments}
              bevelEnabled={geometry.bevel}
              bevelThickness={0.02}
              bevelSize={0.02}
              bevelOffset={0}
              bevelSegments={5}
            >
              {geometry.text}
              <MaterialSwitcher 
                texture={texture}
                material={material}
                wireframe={geometry.wireframe}
              />
            </Text3D>
          </Center>
        );
      
      case 'cube':
        return (
          <mesh {...props}>
            <boxGeometry args={[geometry.size * 2, geometry.size * 2, geometry.size * 2]} />
            <MaterialSwitcher 
              texture={texture}
              material={material}
              wireframe={geometry.wireframe}
            />
          </mesh>
        );
      
      case 'sphere':
        return (
          <mesh {...props}>
            <sphereGeometry args={[geometry.size, 64, 64]} />
            <MaterialSwitcher 
              texture={texture}
              material={material}
              wireframe={geometry.wireframe}
            />
          </mesh>
        );
      
      case 'torus':
        return (
          <mesh {...props}>
            <torusGeometry args={[geometry.size, geometry.size * 0.4, 32, 100]} />
            <MaterialSwitcher 
              texture={texture}
              material={material}
              wireframe={geometry.wireframe}
            />
          </mesh>
        );
      
      case 'cylinder':
        return (
          <mesh {...props}>
            <cylinderGeometry args={[geometry.size, geometry.size, geometry.size * 2, 32]} />
            <MaterialSwitcher 
              texture={texture}
              material={material}
              wireframe={geometry.wireframe}
            />
          </mesh>
        );
      
      case 'plane':
        return (
          <mesh {...props}>
            <planeGeometry args={[geometry.size * 2, geometry.size * 2, 32, 32]} />
            <MaterialSwitcher 
              texture={texture}
              material={material}
              wireframe={geometry.wireframe}
            />
          </mesh>
        );
      
      case 'pyramid':
        return (
          <mesh {...props}>
            <tetrahedronGeometry args={[geometry.size, 0]} />
            <MaterialSwitcher 
              texture={texture}
              material={material}
              wireframe={geometry.wireframe}
            />
          </mesh>
        );
      
      case 'torusKnot':
        return (
          <mesh {...props}>
            <torusKnotGeometry args={[geometry.size * 0.6, geometry.size * 0.2, 128, 16]} />
            <MaterialSwitcher 
              texture={texture}
              material={material}
              wireframe={geometry.wireframe}
            />
          </mesh>
        );
      
      case 'icosahedron':
        return (
          <mesh {...props}>
            <icosahedronGeometry args={[geometry.size, 0]} />
            <MaterialSwitcher 
              texture={texture}
              material={material}
              wireframe={geometry.wireframe}
            />
          </mesh>
        );
      
      case 'dodecahedron':
        return (
          <mesh {...props}>
            <dodecahedronGeometry args={[geometry.size, 0]} />
            <MaterialSwitcher 
              texture={texture}
              material={material}
              wireframe={geometry.wireframe}
            />
          </mesh>
        );
      
      default:
        return null;
    }
  }, [geometry, texture, animation, material, onClick]);
  
  return <>{geometryNode}</>;
};