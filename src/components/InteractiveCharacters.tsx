import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

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
}

export const InteractiveCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const nextId = useRef(0);

  const specialChars = [
    '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '?', 
    '~', '`', '|', '\\', '/', '<', '>', '[', ']', '{', '}',
    '+', '=', '-', '_', ':', ';', '"', "'", ',', '.'
  ];

  const emojis = [
    '✨', '⚡', '🔥', '💎', '🌟', '⭐', '💫', '🎯', '🎨', '🚀',
    '💥', '🌈', '🎭', '🎪', '🎬', '🎮', '🎲', '🎰', '🔮', '💝',
    '🌺', '🌸', '🌼', '🌻', '🍀', '🎃', '👾', '🤖', '👽', '🦄'
  ];

  const spawnCharacter = (point: THREE.Vector3, isEmoji: boolean) => {
    const chars = isEmoji ? emojis : specialChars;
    const count = isEmoji ? Math.floor(Math.random() * 15) + 10 : Math.floor(Math.random() * 8) + 5;

    const newChars: Character[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = isEmoji ? 0.05 + Math.random() * 0.08 : 0.1 + Math.random() * 0.15;
      const upForce = isEmoji ? 0.02 + Math.random() * 0.03 : 0.05 + Math.random() * 0.1;
      
      newChars.push({
        id: nextId.current++,
        char: chars[Math.floor(Math.random() * chars.length)],
        position: point.clone(),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          upForce,
          Math.sin(angle) * speed
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        ),
        scale: isEmoji ? 0.3 + Math.random() * 0.3 : 0.15 + Math.random() * 0.15,
        isEmoji,
        driftSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.001,
          (Math.random() - 0.5) * 0.001,
          (Math.random() - 0.5) * 0.001
        )
      });
    }

    setCharacters(prev => [...prev, ...newChars]);
  };

  useFrame(() => {
    setCharacters(prev => 
      prev.map(char => ({
        ...char,
        position: char.position.clone().add(char.velocity).add(char.driftSpeed),
        rotation: new THREE.Euler(
          char.rotation.x + char.rotationSpeed.x,
          char.rotation.y + char.rotationSpeed.y,
          char.rotation.z + char.rotationSpeed.z
        ),
        velocity: char.velocity.clone().multiplyScalar(0.98)
      }))
    );
  });

  return (
    <>
      <group ref={groupRef}>
        {characters.map(char => (
          <Text
            key={char.id}
            position={char.position}
            rotation={char.rotation}
            scale={char.scale}
            color={char.isEmoji ? '#FFFFFF' : '#00FFD5'}
            fontSize={char.isEmoji ? 1 : 0.8}
            outlineWidth={char.isEmoji ? 0 : 0.02}
            outlineColor="#000000"
            anchorX="center"
            anchorY="middle"
          >
            {char.char}
          </Text>
        ))}
      </group>
      
      {/* Expose spawn function globally */}
      {typeof window !== 'undefined' && ((window as any).__spawnCharacter = spawnCharacter) && null}
    </>
  );
};
