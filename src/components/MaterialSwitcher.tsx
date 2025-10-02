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
          roughness={material.roughness * 0.1}
          metalness={0}
          transmission={material.transmission}
          thickness={0.5}
          ior={material.ior}
          clearcoat={material.clearcoat}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.9}
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
          roughness={material.roughness * 0.2}
          metalness={0.1}
          transmission={material.transmission * 0.5}
          thickness={1}
          ior={material.ior}
          clearcoat={material.clearcoat}
          clearcoatRoughness={0}
          emissive={tintColor}
          emissiveIntensity={material.emissiveGain * 0.5}
          wireframe={wireframe}
        />
      );
    
    case 'water':
      return (
        <meshPhysicalMaterial
          map={texture}
          roughness={0}
          metalness={0}
          transmission={material.transmission * 0.9}
          thickness={2}
          ior={1.33}
          clearcoat={1}
          clearcoatRoughness={0.1}
          color={tintColor}
          wireframe={wireframe}
        />
      );
    
    case 'metal':
      return (
        <meshStandardMaterial
          map={texture}
          roughness={material.roughness}
          metalness={material.metalness}
          emissive={tintColor}
          emissiveIntensity={material.emissiveGain * 0.3}
          wireframe={wireframe}
        />
      );
    
    case 'neon':
      return (
        <meshStandardMaterial
          map={texture}
          emissive={tintColor}
          emissiveMap={texture}
          emissiveIntensity={material.neonGlow}
          roughness={0.3}
          metalness={0.8}
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
