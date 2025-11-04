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
  processedTexture.repeat.set(textureRepeatX, textureRepeatY);
  
  // Apply coverage mode
  switch (coverageMode) {
    case 'wrap':
      processedTexture.wrapS = THREE.RepeatWrapping;
      processedTexture.wrapT = THREE.RepeatWrapping;
      break;
    case 'fit':
      processedTexture.wrapS = THREE.ClampToEdgeWrapping;
      processedTexture.wrapT = THREE.ClampToEdgeWrapping;
      break;
    case 'tile':
      processedTexture.wrapS = THREE.RepeatWrapping;
      processedTexture.wrapT = THREE.RepeatWrapping;
      processedTexture.repeat.multiplyScalar(textureScale);
      break;
    case 'stretch':
      processedTexture.wrapS = THREE.ClampToEdgeWrapping;
      processedTexture.wrapT = THREE.ClampToEdgeWrapping;
      processedTexture.repeat.set(1, 1);
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
          side={THREE.DoubleSide}
          wireframe={wireframe}
          attenuationDistance={0.5}
          attenuationColor={new THREE.Color('#ffffff')}
        />
      );
    
    case 'hologram':
      return (
        <meshStandardMaterial
          map={processedTexture}
          emissive={tintColor}
          emissiveMap={processedTexture}
          emissiveIntensity={material.emissiveGain * 2}
          roughness={1}
          metalness={0}
          transparent
          opacity={0.7}
          wireframe={wireframe}
          side={THREE.DoubleSide}
        />
      );
    
    case 'crystal':
      return (
        <meshPhysicalMaterial
          map={processedTexture}
          roughness={0}
          metalness={0.2}
          transmission={0.6}
          thickness={1.5}
          ior={2.4}
          clearcoat={1}
          clearcoatRoughness={0}
          emissive={tintColor}
          emissiveIntensity={0.8}
          reflectivity={1}
          envMapIntensity={3}
          sheen={1}
          sheenColor={tintColor}
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
          roughness={0.15}
          metalness={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          envMapIntensity={2.5}
          emissive={tintColor}
          emissiveIntensity={0.3}
          wireframe={wireframe}
        />
      );
    
    case 'neon':
      return (
        <meshPhysicalMaterial
          map={processedTexture}
          emissive={tintColor}
          emissiveMap={processedTexture}
          emissiveIntensity={3}
          roughness={0.2}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
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
    
    case 'diamond':
      return (
        <meshPhysicalMaterial
          map={processedTexture}
          roughness={0}
          metalness={0}
          transmission={0.99}
          thickness={2}
          ior={2.42}
          clearcoat={1}
          clearcoatRoughness={0}
          reflectivity={1}
          envMapIntensity={4}
          emissive={tintColor}
          emissiveIntensity={0.5}
          sheen={1}
          sheenColor={new THREE.Color('#ffffff')}
          specularIntensity={1}
          specularColor={new THREE.Color('#ffffff')}
          wireframe={wireframe}
        />
      );
    
    case 'jade':
      return (
        <meshPhysicalMaterial
          map={processedTexture}
          roughness={0.1}
          metalness={0}
          transmission={0.7}
          thickness={1.8}
          ior={1.66}
          clearcoat={1}
          clearcoatRoughness={0.1}
          color={new THREE.Color('#4ade80')}
          emissive={tintColor}
          emissiveIntensity={0.3}
          sheen={0.8}
          sheenColor={tintColor}
          envMapIntensity={2}
          wireframe={wireframe}
        />
      );
    
    case 'opal':
      return (
        <meshPhysicalMaterial
          map={processedTexture}
          roughness={0.15}
          metalness={0.1}
          transmission={0.5}
          thickness={1}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.2}
          iridescence={1}
          iridescenceIOR={1.8}
          iridescenceThicknessRange={[100, 800]}
          sheen={1}
          sheenColor={tintColor}
          envMapIntensity={2.5}
          wireframe={wireframe}
        />
      );
    
    case 'chrome':
      return (
        <meshPhysicalMaterial
          map={processedTexture}
          roughness={0.05}
          metalness={1}
          clearcoat={1}
          clearcoatRoughness={0}
          reflectivity={1}
          envMapIntensity={3}
          color={new THREE.Color('#e5e7eb')}
          wireframe={wireframe}
        />
      );
    
    case 'obsidian':
      return (
        <meshPhysicalMaterial
          map={processedTexture}
          roughness={0.1}
          metalness={0.3}
          transmission={0.2}
          thickness={2}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.05}
          color={new THREE.Color('#1a1a1a')}
          emissive={tintColor}
          emissiveIntensity={0.8}
          sheen={0.5}
          sheenColor={tintColor}
          wireframe={wireframe}
        />
      );
    
    case 'code':
    default:
      return (
        <meshStandardMaterial
          map={processedTexture}
          emissive={tintColor}
          emissiveMap={processedTexture}
          emissiveIntensity={material.emissiveGain}
          roughness={material.roughness}
          metalness={material.metalness}
          wireframe={wireframe}
        />
      );
  }
};
