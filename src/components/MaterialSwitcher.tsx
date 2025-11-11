import * as THREE from 'three';
import { MaterialState } from '@/state/useStore';

interface MaterialSwitcherProps {
  texture: THREE.Texture;
  material: MaterialState;
  wireframe: boolean;
  textureScale?: number;
  textureRepeatX?: number;
  textureRepeatY?: number;
  coverageMode?: 'wrap' | 'fit' | 'tile' | 'stretch';
}

export const MaterialSwitcher = ({ 
  texture, 
  material, 
  wireframe,
  textureScale = 1,
  textureRepeatX = 1,
  textureRepeatY = 1,
  coverageMode = 'wrap'
}: MaterialSwitcherProps) => {
  const tintColor = new THREE.Color(material.tint);
  
  // Apply texture transformations
  const processedTexture = texture.clone();
  
  // Always use RepeatWrapping for proper tiling
  processedTexture.wrapS = THREE.RepeatWrapping;
  processedTexture.wrapT = THREE.RepeatWrapping;
  
  // Apply coverage mode
  switch (coverageMode) {
    case 'wrap':
      processedTexture.repeat.set(textureRepeatX, textureRepeatY);
      break;
    case 'fit':
      processedTexture.repeat.set(textureRepeatX, textureRepeatY);
      break;
    case 'tile':
      processedTexture.repeat.set(textureRepeatX * textureScale, textureRepeatY * textureScale);
      break;
    case 'stretch':
      processedTexture.repeat.set(textureRepeatX, textureRepeatY);
      break;
  }
  
  processedTexture.needsUpdate = true;
  
  switch (material.preset) {
    case 'glass':
      return (
        <meshPhysicalMaterial
          map={processedTexture}
          roughness={0.02}
          metalness={0}
          transmission={0.98}
          thickness={1.2}
          ior={1.52}
          clearcoat={1}
          clearcoatRoughness={0.02}
          transparent
          opacity={1}
          reflectivity={1.5}
          envMapIntensity={3}
          attenuationDistance={0.5}
          attenuationColor={new THREE.Color('#ffffff')}
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      );
    
    case 'hologram':
      return (
        <meshPhysicalMaterial
          map={processedTexture}
          emissive={tintColor}
          emissiveMap={processedTexture}
          emissiveIntensity={material.emissiveGain * 3}
          roughness={0.8}
          metalness={0.2}
          transmission={0.3}
          thickness={0.5}
          ior={1.2}
          transparent
          opacity={0.75}
          reflectivity={0.8}
          envMapIntensity={2}
          wireframe={wireframe}
          side={THREE.DoubleSide}
        />
      );
    
    case 'crystal':
      return (
        <meshPhysicalMaterial
          map={processedTexture}
          roughness={0}
          metalness={0.3}
          transmission={0.7}
          thickness={2}
          ior={2.42}
          clearcoat={1}
          clearcoatRoughness={0}
          emissive={tintColor}
          emissiveIntensity={1.2}
          reflectivity={1.5}
          envMapIntensity={4}
          sheen={1.5}
          sheenColor={tintColor}
          attenuationDistance={1}
          attenuationColor={tintColor}
          wireframe={wireframe}
        />
      );
    
    case 'water':
      return (
        <meshPhysicalMaterial
          map={processedTexture}
          roughness={0}
          metalness={0}
          transmission={0.98}
          thickness={2}
          ior={1.33}
          clearcoat={1}
          clearcoatRoughness={0}
          color={tintColor}
          reflectivity={0.5}
          envMapIntensity={1.5}
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      );
    
    case 'metal':
      return (
        <meshPhysicalMaterial
          map={processedTexture}
          roughness={0.08}
          metalness={1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          reflectivity={1.5}
          envMapIntensity={3.5}
          emissive={tintColor}
          emissiveIntensity={0.5}
          sheen={0.5}
          sheenRoughness={0.2}
          sheenColor={tintColor}
          wireframe={wireframe}
        />
      );
    
    case 'neon':
      return (
        <meshPhysicalMaterial
          map={processedTexture}
          emissive={tintColor}
          emissiveMap={processedTexture}
          emissiveIntensity={4}
          roughness={0.15}
          metalness={0.95}
          clearcoat={1}
          clearcoatRoughness={0.05}
          reflectivity={1.5}
          sheen={2}
          sheenColor={tintColor}
          wireframe={wireframe}
        />
      );
    
    case 'carbon':
      return (
        <meshStandardMaterial
          map={processedTexture}
          roughness={material.roughness * 0.8}
          metalness={0.2}
          color="#1a1a1a"
          emissive={tintColor}
          emissiveIntensity={material.emissiveGain * 0.2}
          wireframe={wireframe}
        />
      );
    
    case 'matte':
      return (
        <meshStandardMaterial
          map={processedTexture}
          roughness={1}
          metalness={0}
          emissive={tintColor}
          emissiveIntensity={material.emissiveGain * 0.5}
          wireframe={wireframe}
        />
      );
    
    case 'code':
    default:
      return (
        <meshStandardMaterial
          map={processedTexture}
          roughness={material.roughness}
          metalness={material.metalness}
          emissive={new THREE.Color('#ffffff')}
          emissiveMap={processedTexture}
          emissiveIntensity={2.5}
          wireframe={wireframe}
        />
      );
  }
};
