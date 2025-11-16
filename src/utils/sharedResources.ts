import * as THREE from 'three';

// Shared geometry instances to reduce memory
export class SharedGeometries {
  private static geometries = new Map<string, THREE.BufferGeometry>();

  static getSphere(radius: number, segments: number): THREE.SphereGeometry {
    const key = `sphere-${radius}-${segments}`;
    if (!this.geometries.has(key)) {
      this.geometries.set(key, new THREE.SphereGeometry(radius, segments, segments));
    }
    return this.geometries.get(key) as THREE.SphereGeometry;
  }

  static getBox(size: number): THREE.BoxGeometry {
    const key = `box-${size}`;
    if (!this.geometries.has(key)) {
      this.geometries.set(key, new THREE.BoxGeometry(size, size, size));
    }
    return this.geometries.get(key) as THREE.BoxGeometry;
  }

  static getTorus(radius: number, tube: number, detail: number): THREE.TorusGeometry {
    const key = `torus-${radius}-${tube}-${detail}`;
    if (!this.geometries.has(key)) {
      this.geometries.set(key, new THREE.TorusGeometry(radius, tube, detail, detail * 3));
    }
    return this.geometries.get(key) as THREE.TorusGeometry;
  }

  static getCone(radius: number, height: number, segments: number): THREE.ConeGeometry {
    const key = `cone-${radius}-${height}-${segments}`;
    if (!this.geometries.has(key)) {
      this.geometries.set(key, new THREE.ConeGeometry(radius, height, segments));
    }
    return this.geometries.get(key) as THREE.ConeGeometry;
  }

  static dispose() {
    this.geometries.forEach(geo => geo.dispose());
    this.geometries.clear();
  }
}

// Shared materials to reduce draw calls
export class SharedMaterials {
  private static materials = new Map<string, THREE.Material>();

  static getPointsMaterial(config: {
    size: number;
    transparent?: boolean;
    opacity?: number;
    blending?: THREE.Blending;
    depthWrite?: boolean;
  }): THREE.PointsMaterial {
    const key = `points-${config.size}-${config.opacity || 1}`;
    if (!this.materials.has(key)) {
      this.materials.set(key, new THREE.PointsMaterial({
        size: config.size,
        vertexColors: true,
        transparent: config.transparent !== false,
        opacity: config.opacity || 1,
        sizeAttenuation: true,
        blending: config.blending || THREE.AdditiveBlending,
        depthWrite: config.depthWrite !== false ? false : true,
      }));
    }
    return this.materials.get(key) as THREE.PointsMaterial;
  }

  static getMeshPhysicalMaterial(config: {
    color?: string | number;
    emissive?: string | number;
    emissiveIntensity?: number;
    metalness?: number;
    roughness?: number;
    transparent?: boolean;
    opacity?: number;
  }): THREE.MeshPhysicalMaterial {
    const key = `physical-${config.color || 0xffffff}-${config.emissiveIntensity || 1}`;
    if (!this.materials.has(key)) {
      this.materials.set(key, new THREE.MeshPhysicalMaterial({
        color: config.color || 0xffffff,
        emissive: config.emissive || 0x000000,
        emissiveIntensity: config.emissiveIntensity || 1,
        metalness: config.metalness || 0.5,
        roughness: config.roughness || 0.5,
        transparent: config.transparent || false,
        opacity: config.opacity || 1,
      }));
    }
    return this.materials.get(key) as THREE.MeshPhysicalMaterial;
  }

  static dispose() {
    this.materials.forEach(mat => mat.dispose());
    this.materials.clear();
  }
}

// Optimized particle shader for better performance
export const particleVertexShader = `
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;
  
  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const particleFragmentShader = `
  varying vec3 vColor;
  
  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    if (distanceToCenter > 0.5) discard;
    
    float alpha = 1.0 - (distanceToCenter * 2.0);
    alpha = pow(alpha, 2.0);
    
    gl_FragColor = vec4(vColor, alpha);
  }
`;
