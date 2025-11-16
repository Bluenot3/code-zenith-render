import * as THREE from 'three';

// Multi-octave 3D noise for complex organic motion
export const noise3D = (position: THREE.Vector3, time: number, octaves: number = 3): THREE.Vector3 => {
  let result = new THREE.Vector3(0, 0, 0);
  let amplitude = 1.0;
  let frequency = 1.0;
  
  for (let i = 0; i < octaves; i++) {
    const x = (position.x + time * 0.1) * frequency;
    const y = (position.y + time * 0.1) * frequency;
    const z = (position.z + time * 0.1) * frequency;
    
    result.add(new THREE.Vector3(
      Math.sin(x * 2.5 + Math.cos(y * 1.7)) * Math.cos(z * 1.3) * amplitude,
      Math.sin(y * 2.3 + Math.cos(z * 1.9)) * Math.cos(x * 1.5) * amplitude,
      Math.sin(z * 2.7 + Math.cos(x * 2.1)) * Math.cos(y * 1.7) * amplitude
    ));
    
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  
  return result;
};

// Fractal Brownian Motion for ultra-detailed patterns
export const fbm3D = (position: THREE.Vector3, time: number): number => {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1.0;
  
  for (let i = 0; i < 5; i++) {
    const noise = noise3D(position.clone().multiplyScalar(frequency), time, 1);
    value += noise.length() * amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  
  return value;
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

// Advanced color palette with chromatic aberration effect
export const getChromaticColor = (time: number, offset: number = 0): { r: string, g: string, b: string } => {
  const phase = time * 0.5 + offset;
  return {
    r: `hsl(${(phase + 0) % 360}, 100%, 60%)`,
    g: `hsl(${(phase + 120) % 360}, 100%, 60%)`,
    b: `hsl(${(phase + 240) % 360}, 100%, 60%)`
  };
};

// Plasma color effect
export const getPlasmaColor = (x: number, y: number, z: number, time: number): string => {
  const value = Math.sin(x * 0.5 + time) +
                Math.sin(y * 0.3 + time * 1.3) +
                Math.sin((x + y + z) * 0.2 + time * 0.7) +
                Math.sin(Math.sqrt(x * x + y * y) * 0.5 + time * 1.5);
  const hue = ((value + 4) / 8) * 360;
  return `hsl(${hue}, 100%, 60%)`;
};

// Morphing geometry helpers
export const getMorphFactor = (time: number, speed: number = 1): number => {
  return (Math.sin(time * speed) + 1) / 2;
};

// Wave propagation
export const getWaveDisplacement = (position: THREE.Vector3, time: number, frequency: number, amplitude: number): number => {
  const distance = position.length();
  return Math.sin(distance * frequency - time * 3) * amplitude;
};

// Flocking behavior
export const getFlockingForce = (
  position: THREE.Vector3,
  neighbors: THREE.Vector3[],
  separationDist: number,
  alignmentStrength: number
): THREE.Vector3 => {
  const separation = new THREE.Vector3();
  const alignment = new THREE.Vector3();
  const cohesion = new THREE.Vector3();
  
  let separationCount = 0;
  
  neighbors.forEach(neighbor => {
    const distance = position.distanceTo(neighbor);
    
    if (distance < separationDist && distance > 0) {
      const diff = position.clone().sub(neighbor).normalize().divideScalar(distance);
      separation.add(diff);
      separationCount++;
    }
    
    cohesion.add(neighbor);
  });
  
  if (separationCount > 0) {
    separation.divideScalar(separationCount);
  }
  
  if (neighbors.length > 0) {
    cohesion.divideScalar(neighbors.length);
    cohesion.sub(position);
  }
  
  return separation.multiplyScalar(1.5)
    .add(alignment.multiplyScalar(alignmentStrength))
    .add(cohesion.multiplyScalar(0.5));
};

// Attractor point system
export const getAttractorForce = (
  position: THREE.Vector3,
  attractor: THREE.Vector3,
  strength: number,
  falloff: number = 2
): THREE.Vector3 => {
  const direction = attractor.clone().sub(position);
  const distance = direction.length();
  
  if (distance < 0.1) return new THREE.Vector3();
  
  direction.normalize();
  const forceMagnitude = strength / Math.pow(distance, falloff);
  
  return direction.multiplyScalar(forceMagnitude);
};
