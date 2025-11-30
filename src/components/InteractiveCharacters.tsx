import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { SpawnFlash, ShockwaveRing, Sparkles } from './SpawnEffects';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  noise3D,
  getSpiralVelocity,
  getVortexVelocity,
  checkBoundaryBounce,
  applyTurbulence,
  getProximityForce,
  getRainbowColor,
  getNeonColor
} from '@/utils/particlePhysics';

interface Character {
  id: number;
  char: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotationSpeed: THREE.Vector3;
  scale: number;
  isEmoji: boolean;
  driftSpeed: THREE.Vector3;
  lifetime: number;
  initialScale: number;
  energy: number;
  hue: number;
  trajectoryType: 'radial' | 'spiral' | 'vortex';
}

interface Effect {
  id: number;
  type: 'flash' | 'ring' | 'sparkles';
  position: THREE.Vector3;
}

const BOUNDARY = { x: 20, y: 15, z: 20 };

export const InteractiveCharacters = () => {
  const isMobile = useIsMobile();
  const MAX_CHARACTERS = isMobile ? 200 : 500;
  const [characters, setCharacters] = useState<Character[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const nextId = useRef(0);
  const nextEffectId = useRef(0);
  const timeRef = useRef(0);
  const frameCount = useRef(0);
  const { mouse, camera } = useThree();

  const specialChars = [
    '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '?', 
    '~', '`', '|', '\\', '/', '<', '>', '[', ']', '{', '}',
    '+', '=', '-', '_', ':', ';', '"', "'", ',', '.', '§',
    '¶', '†', '‡', '•', '°', '±', '×', '÷', '∞', '∑', '∏',
    '√', '∫', '≈', '≠', '≤', '≥', '◊', '◆', '■', '□'
  ];

  const emojis = [
    '✨', '⚡', '🔥', '💎', '🌟', '⭐', '💫', '🎯', '🎨', '🚀',
    '💥', '🌈', '🎭', '🎪', '🎬', '🎮', '🎲', '🎰', '🔮', '💝',
    '🌺', '🌸', '🌼', '🌻', '🍀', '🎃', '👾', '🤖', '👽', '🦄',
    '🎀', '🎁', '🎈', '🎉', '🎊', '🌙', '☀️', '⭐', '🌠', '🌌'
  ];

  const addEffect = (type: Effect['type'], position: THREE.Vector3) => {
    const effect: Effect = {
      id: nextEffectId.current++,
      type,
      position: position.clone()
    };
    setEffects(prev => [...prev, effect]);
  };

  const removeEffect = (id: number) => {
    setEffects(prev => prev.filter(e => e.id !== id));
  };

  const spawnCharacter = (point: THREE.Vector3, isEmoji: boolean) => {
    const chars = isEmoji ? emojis : specialChars;
    const count = isEmoji ? Math.floor(Math.random() * 15) + 10 : Math.floor(Math.random() * 12) + 8;

    // Add spawn effects
    addEffect('flash', point);
    addEffect('ring', point);

    const newChars: Character[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const trajectoryType = Math.random() < 0.7 ? 'radial' : (Math.random() < 0.5 ? 'spiral' : 'vortex');
      
      let velocity: THREE.Vector3;
      const baseSpeed = isEmoji ? 0.06 + Math.random() * 0.12 : 0.15 + Math.random() * 0.25;
      const upForce = isEmoji ? 0.03 + Math.random() * 0.05 : 0.08 + Math.random() * 0.15;
      
      if (trajectoryType === 'spiral') {
        velocity = getSpiralVelocity(angle, baseSpeed, 3);
        velocity.y = upForce;
      } else if (trajectoryType === 'vortex') {
        velocity = getVortexVelocity(angle, baseSpeed, Math.random());
      } else {
        velocity = new THREE.Vector3(
          Math.cos(angle) * baseSpeed * (0.7 + Math.random() * 0.6),
          upForce,
          Math.sin(angle) * baseSpeed * (0.7 + Math.random() * 0.6)
        );
      }
      
      const initialScale = isEmoji ? 0.4 + Math.random() * 0.4 : 0.2 + Math.random() * 0.2;
      
      newChars.push({
        id: nextId.current++,
        char: chars[Math.floor(Math.random() * chars.length)],
        position: point.clone(),
        velocity,
        rotation: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15
        ),
        scale: 0,
        initialScale,
        isEmoji,
        driftSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.001,
          (Math.random() - 0.5) * 0.002
        ),
        lifetime: 0,
        energy: 1,
        hue: isEmoji ? Math.random() * 360 : 180 + Math.random() * 60,
        trajectoryType
      });
    }

    setCharacters(prev => {
      const updated = [...prev, ...newChars];
      if (updated.length > MAX_CHARACTERS) {
        return updated.slice(updated.length - MAX_CHARACTERS);
      }
      return updated;
    });
  };

  useFrame((state, delta) => {
    frameCount.current++;
    
    // Skip frames on mobile for better performance
    if (isMobile && frameCount.current % 2 !== 0) return;
    
    timeRef.current += delta;
    
    // Get mouse position in 3D world space
    const mouse3D = new THREE.Vector3(mouse.x * 10, mouse.y * 10, 5);
    
    setCharacters(prev => 
      prev.map(char => {
        const newLifetime = char.lifetime + delta;
        
        // Fade in animation
        const fadeInProgress = Math.min(newLifetime * 3, 1);
        const currentScale = char.initialScale * fadeInProgress;
        
        // Apply gravity (subtle for emojis, stronger for chars)
        const gravity = char.isEmoji ? 0.0008 : 0.002;
        char.velocity.y -= gravity * char.energy * delta * 60;
        
        // Apply turbulence
        const turbulence = applyTurbulence(char.position, timeRef.current, char.isEmoji ? 0.015 : 0.01);
        
        // Mouse proximity force
        const proximityForce = getProximityForce(char.position, mouse3D, 5, 0.02);
        
        // Update velocity
        const newVelocity = char.velocity
          .clone()
          .add(turbulence)
          .add(proximityForce)
          .multiplyScalar(0.98);
        
        // Check boundary collision
        const bouncedVelocity = checkBoundaryBounce(
          char.position,
          newVelocity,
          BOUNDARY,
          0.6
        );
        
        // Update position
        const newPosition = char.position
          .clone()
          .add(bouncedVelocity.clone().multiplyScalar(delta * 60))
          .add(char.driftSpeed);
        
        // Clamp position to boundaries
        newPosition.x = THREE.MathUtils.clamp(newPosition.x, -BOUNDARY.x, BOUNDARY.x);
        newPosition.y = THREE.MathUtils.clamp(newPosition.y, -BOUNDARY.y, BOUNDARY.y);
        newPosition.z = THREE.MathUtils.clamp(newPosition.z, -BOUNDARY.z, BOUNDARY.z);
        
        // Update rotation
        const newRotation = new THREE.Euler(
          char.rotation.x + char.rotationSpeed.x,
          char.rotation.y + char.rotationSpeed.y,
          char.rotation.z + char.rotationSpeed.z
        );
        
        // Energy decay
        const newEnergy = char.energy * 0.995;
        
        // Scale pulsing based on proximity to mouse
        const distanceToMouse = char.position.distanceTo(mouse3D);
        const pulseScale = 1 + Math.sin(timeRef.current * 3 + char.id) * 0.1 * (1 - Math.min(distanceToMouse / 5, 1));
        
        return {
          ...char,
          position: newPosition,
          velocity: bouncedVelocity,
          rotation: newRotation,
          energy: newEnergy,
          lifetime: newLifetime,
          scale: currentScale * pulseScale
        };
      })
    );
  });

  return (
    <>
      <group ref={groupRef}>
        {characters.map(char => {
          const color = char.isEmoji 
            ? getRainbowColor(timeRef.current * 100, char.id * 50)
            : getNeonColor(timeRef.current * 100, char.hue);
          
          return (
            <Text
              key={char.id}
              position={char.position}
              rotation={char.rotation}
              scale={char.scale}
              color={color}
              fontSize={char.isEmoji ? 1.2 : 0.9}
              outlineWidth={char.isEmoji ? 0 : 0.03}
              outlineColor="#000000"
              anchorX="center"
              anchorY="middle"
              material-toneMapped={false}
            >
              {char.char}
            </Text>
          );
        })}
      </group>
      
      {/* Render spawn effects */}
      {effects.map(effect => {
        if (effect.type === 'flash') {
          return (
            <SpawnFlash
              key={effect.id}
              position={effect.position}
              onComplete={() => removeEffect(effect.id)}
            />
          );
        } else if (effect.type === 'ring') {
          return (
            <ShockwaveRing
              key={effect.id}
              position={effect.position}
              onComplete={() => removeEffect(effect.id)}
            />
          );
        } else if (effect.type === 'sparkles') {
          return (
            <Sparkles
              key={effect.id}
              position={effect.position}
              count={20}
            />
          );
        }
        return null;
      })}
      
      {/* Expose spawn function globally */}
      {typeof window !== 'undefined' && ((window as any).__spawnCharacter = spawnCharacter) && null}
    </>
  );
};
