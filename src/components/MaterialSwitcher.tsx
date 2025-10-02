import * as THREE from 'three';
import { MaterialState } from '@/state/useStore';

interface MaterialSwitcherProps {
  texture: THREE.Texture;
  material: MaterialState;
  wireframe: boolean;
}

export const MaterialSwitcher = ({ texture, material, wireframe }: MaterialSwitcherProps) => {
  const tintColor = new THREE.Color(material.tint);
  
  switch (material.preset) {
    case 'glass':
      return (
        <meshPhysicalMaterial
          map={texture}
          roughness={0.05}
          metalness={0}
          transmission={0.95}
          thickness={0.8}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transparent
          opacity={1}
          reflectivity={1}
          envMapIntensity={2}
          side={THREE.DoubleSide}
          wireframe={wireframe}
        />
      );
    
    case 'hologram':
      return (
        <meshStandardMaterial
          map={texture}
          emissive={tintColor}
          emissiveMap={texture}
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
          map={texture}
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
          map={texture}
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
          map={texture}
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
          map={texture}
          emissive={tintColor}
          emissiveMap={texture}
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
          map={texture}
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
          map={texture}
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
          map={texture}
          emissive={tintColor}
          emissiveMap={texture}
          emissiveIntensity={material.emissiveGain}
          roughness={material.roughness}
          metalness={material.metalness}
          wireframe={wireframe}
        />
      );
  }
};
