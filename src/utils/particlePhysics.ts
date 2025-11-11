import * as THREE from 'three';

// Simple 3D noise function for organic motion
export const noise3D = (position: THREE.Vector3, time: number): THREE.Vector3 => {
  const x = position.x + time * 0.1;
  const y = position.y + time * 0.1;
  const z = position.z + time * 0.1;
  
  return new THREE.Vector3(
    Math.sin(x * 2.5 + Math.cos(y * 1.7)) * Math.cos(z * 1.3),
    Math.sin(y * 2.3 + Math.cos(z * 1.9)) * Math.cos(x * 1.5),
    Math.sin(z * 2.7 + Math.cos(x * 2.1)) * Math.cos(y * 1.7)
  );
};

// Generate spiral trajectory velocity
export const getSpiralVelocity = (angle: number, speed: number, spiralIntensity: number): THREE.Vector3 => {
  return new THREE.Vector3(
    Math.cos(angle) * speed,
    Math.sin(angle * spiralIntensity) * speed * 0.5,
    Math.sin(angle) * speed
  );
};

// Generate vortex trajectory velocity
export const getVortexVelocity = (angle: number, speed: number, height: number): THREE.Vector3 => {
  const radius = speed * (1 + Math.sin(height * Math.PI * 2));
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    height * speed * 2,
    Math.sin(angle) * radius
  );
};

// Check boundary collision and bounce
export const checkBoundaryBounce = (
  position: THREE.Vector3,
  velocity: THREE.Vector3,
  bounds: { x: number; y: number; z: number },
  damping: number = 0.7
): THREE.Vector3 => {
  const newVelocity = velocity.clone();
  
  if (Math.abs(position.x) > bounds.x) {
    newVelocity.x *= -damping;
  }
  if (position.y < -bounds.y || position.y > bounds.y) {
    newVelocity.y *= -damping;
  }
  if (Math.abs(position.z) > bounds.z) {
    newVelocity.z *= -damping;
  }
  
  return newVelocity;
};

// Apply turbulence to position
export const applyTurbulence = (
  position: THREE.Vector3,
  time: number,
  intensity: number
): THREE.Vector3 => {
  const turbulence = noise3D(position, time);
  return turbulence.multiplyScalar(intensity);
};

// Calculate mouse proximity force
export const getProximityForce = (
  characterPos: THREE.Vector3,
  mousePos: THREE.Vector3,
  maxDistance: number,
  strength: number
): THREE.Vector3 => {
  const distance = characterPos.distanceTo(mousePos);
  
  if (distance > maxDistance) {
    return new THREE.Vector3(0, 0, 0);
  }
  
  const direction = characterPos.clone().sub(mousePos).normalize();
  const forceMagnitude = (1 - distance / maxDistance) * strength;
  
  return direction.multiplyScalar(forceMagnitude);
};

// Get rainbow color based on time
export const getRainbowColor = (time: number, offset: number = 0): string => {
  const hue = ((time * 0.5 + offset) % 360);
  return `hsl(${hue}, 100%, 60%)`;
};

// Get neon color cycling
export const getNeonColor = (time: number, baseHue: number): string => {
  const hue = (baseHue + Math.sin(time * 0.01) * 30) % 360;
  return `hsl(${hue}, 100%, 50%)`;
};
