import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { useStore, GeometryType } from '@/state/useStore';
import { MaterialSwitcher } from './MaterialSwitcher';
import { useIsMobile } from '@/hooks/use-mobile';

interface GeometrySwitcherProps {
  texture: THREE.Texture;
}

export const GeometrySwitcher = ({ texture }: GeometrySwitcherProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const isMobile = useIsMobile();
  const geometry = useStore((state) => state.geometry);
  const animation = useStore((state) => state.animation);
  const material = useStore((state) => state.material);
  const code = useStore((state) => state.code);
  
  const textureScale = (code as any).textureScale || 1;
  const textureRepeatX = (code as any).textureRepeatX || 1;
  const textureRepeatY = (code as any).textureRepeatY || 1;
  const coverageMode = (code as any).coverageMode || 'wrap';
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    if (animation.spin) {
      meshRef.current.rotation.y += delta * animation.speed;
    }
    
    if (animation.float) {
      meshRef.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * animation.speed) * 0.3;
    } else {
      meshRef.current.position.y = 0.8;
    }
    
    if (animation.orbit) {
      meshRef.current.position.x = Math.cos(state.clock.elapsedTime * animation.speed) * 2;
      meshRef.current.position.z = Math.sin(state.clock.elapsedTime * animation.speed) * 2;
    }
  });
  
  const getFontPath = (fontFamily: string): string => {
    const fontMap: Record<string, string> = {
      'JetBrains Mono': '/fonts/helvetiker_regular.typeface.json',
      'Orbitron': '/fonts/helvetiker_bold.typeface.json',
      'Anton': '/fonts/gentilis_bold.typeface.json',
      'Montserrat': '/fonts/optimer_regular.typeface.json',
      'Bebas Neue': '/fonts/helvetiker_bold.typeface.json',
      'Unbounded': '/fonts/droid_sans_bold.typeface.json',
      'Exo 2': '/fonts/droid_serif_regular.typeface.json',
      'Russo One': '/fonts/droid_serif_bold.typeface.json',
      'Audiowide': '/fonts/gentilis_bold.typeface.json',
      'Saira Extra Condensed': '/fonts/optimer_regular.typeface.json',
      'Righteous': '/fonts/helvetiker_bold.typeface.json',
      'Bangers': '/fonts/droid_sans_bold.typeface.json',
      'Black Ops One': '/fonts/droid_serif_bold.typeface.json',
      'Press Start 2P': '/fonts/droid_sans_regular.typeface.json',
    };
    return fontMap[fontFamily] || '/fonts/helvetiker_regular.typeface.json';
  };
  
  const geometryNode = useMemo(() => {
    const props = {
      ref: meshRef,
      castShadow: true,
      receiveShadow: true,
    };
    
    switch (geometry.type) {
      case 'text':
        if (isMobile && geometry.text === 'ZEN') {
          // Render letters vertically stacked on mobile
          const letters = ['Z', 'E', 'N'];
          const verticalSpacing = geometry.size * 1.2;
          
          return (
            <group ref={meshRef as any}>
              {letters.map((letter, index) => (
                <Center key={`letter-${letter}-${index}`} position={[0, (1 - index) * verticalSpacing, 0]}>
                  <Text3D
                    font={getFontPath(geometry.fontFamily)}
                    size={geometry.size}
                    height={geometry.depth}
                    curveSegments={geometry.curveSegments}
                    bevelEnabled={geometry.bevel}
                    bevelThickness={0.02}
                    bevelSize={0.02}
                    bevelOffset={0}
                    bevelSegments={5}
                    letterSpacing={0}
                    castShadow
                    receiveShadow
                  >
                    {letter}
                    <MaterialSwitcher 
                      texture={texture}
                      material={material}
                      wireframe={geometry.wireframe}
                      textureScale={textureScale}
                      textureRepeatX={textureRepeatX}
                      textureRepeatY={textureRepeatY}
                      coverageMode={coverageMode}
                    />
                  </Text3D>
                </Center>
              ))}
            </group>
          );
        }
        
        return (
          <Center key={`text-${geometry.fontFamily}-${geometry.text}-${geometry.size}-${getFontPath(geometry.fontFamily)}`}>
            <Text3D
              {...props}
              font={getFontPath(geometry.fontFamily)}
              size={geometry.size}
              height={geometry.depth}
              curveSegments={geometry.curveSegments}
              bevelEnabled={geometry.bevel}
              bevelThickness={0.02}
              bevelSize={0.02}
              bevelOffset={0}
              bevelSegments={5}
              letterSpacing={geometry.letterSpacing}
            >
              {geometry.text}
              <MaterialSwitcher 
                texture={texture}
                material={material}
                wireframe={geometry.wireframe}
                textureScale={textureScale}
                textureRepeatX={textureRepeatX}
                textureRepeatY={textureRepeatY}
                coverageMode={coverageMode}
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
              textureScale={textureScale}
              textureRepeatX={textureRepeatX}
              textureRepeatY={textureRepeatY}
              coverageMode={coverageMode}
            />
          </mesh>
        );
      
      case 'sphere':
        return (
          <mesh {...props}>
            <sphereGeometry args={isMobile ? [geometry.size, 32, 32] : [geometry.size, 64, 64]} />
            <MaterialSwitcher 
              texture={texture}
              material={material}
              wireframe={geometry.wireframe}
              textureScale={textureScale}
              textureRepeatX={textureRepeatX}
              textureRepeatY={textureRepeatY}
              coverageMode={coverageMode}
            />
          </mesh>
        );
      
      case 'torus':
        return (
          <mesh {...props}>
            <torusGeometry args={isMobile ? [geometry.size, geometry.size * 0.4, 16, 48] : [geometry.size, geometry.size * 0.4, 32, 100]} />
            <MaterialSwitcher 
              texture={texture}
              material={material}
              wireframe={geometry.wireframe}
              textureScale={textureScale}
              textureRepeatX={textureRepeatX}
              textureRepeatY={textureRepeatY}
              coverageMode={coverageMode}
            />
          </mesh>
        );
      
      case 'cylinder':
        return (
          <mesh {...props}>
            <cylinderGeometry args={isMobile ? [geometry.size, geometry.size, geometry.size * 2, 16] : [geometry.size, geometry.size, geometry.size * 2, 32]} />
            <MaterialSwitcher 
              texture={texture}
              material={material}
              wireframe={geometry.wireframe}
              textureScale={textureScale}
              textureRepeatX={textureRepeatX}
              textureRepeatY={textureRepeatY}
              coverageMode={coverageMode}
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
              textureScale={textureScale}
              textureRepeatX={textureRepeatX}
              textureRepeatY={textureRepeatY}
              coverageMode={coverageMode}
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
              textureScale={textureScale}
              textureRepeatX={textureRepeatX}
              textureRepeatY={textureRepeatY}
              coverageMode={coverageMode}
            />
          </mesh>
        );
      
      case 'torusKnot':
        return (
          <mesh {...props}>
            <torusKnotGeometry args={isMobile ? [geometry.size * 0.6, geometry.size * 0.2, 64, 8] : [geometry.size * 0.6, geometry.size * 0.2, 128, 16]} />
            <MaterialSwitcher 
              texture={texture}
              material={material}
              wireframe={geometry.wireframe}
              textureScale={textureScale}
              textureRepeatX={textureRepeatX}
              textureRepeatY={textureRepeatY}
              coverageMode={coverageMode}
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
              textureScale={textureScale}
              textureRepeatX={textureRepeatX}
              textureRepeatY={textureRepeatY}
              coverageMode={coverageMode}
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
              textureScale={textureScale}
              textureRepeatX={textureRepeatX}
              textureRepeatY={textureRepeatY}
              coverageMode={coverageMode}
            />
          </mesh>
        );
      
      default:
        return null;
    }
  }, [geometry, texture, animation, material]);
  
  return <>{geometryNode}</>;
};