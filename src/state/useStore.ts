import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GeometryType = 
  | 'text' 
  | 'cube' 
  | 'sphere' 
  | 'torus' 
  | 'cylinder' 
  | 'plane' 
  | 'pyramid' 
  | 'torusKnot' 
  | 'icosahedron' 
  | 'dodecahedron';

export type MaterialType = 
  | 'code' 
  | 'glass' 
  | 'hologram' 
  | 'crystal' 
  | 'water' 
  | 'metal' 
  | 'matte' 
  | 'neon' 
  | 'carbon'
  | 'diamond'
  | 'jade'
  | 'opal'
  | 'chrome'
  | 'obsidian';

export type ThemeType = 
  | 'dark' 
  | 'light' 
  | 'neon' 
  | 'cyberpunk' 
  | 'crystal' 
  | 'glass' 
  | 'holo' 
  | 'aqua' 
  | 'dusk' 
  | 'midnight' 
  | 'zen';

export type FontFamily = 
  | 'JetBrains Mono' 
  | 'Orbitron' 
  | 'Anton' 
  | 'Montserrat' 
  | 'Saira Extra Condensed' 
  | 'Bebas Neue' 
  | 'Unbounded' 
  | 'Exo 2' 
  | 'Russo One' 
  | 'Audiowide'
  | 'Righteous'
  | 'Bangers'
  | 'Black Ops One'
  | 'Press Start 2P';

export type CodeDirection = 'down' | 'right' | 'spiral';

export interface GeometryState {
  type: GeometryType;
  text: string;
  fontFamily: FontFamily;
  fontWeight: number;
  size: number;
  depth: number;
  bevel: boolean;
  curveSegments: number;
  letterSpacing: number;
  wordSpacing: number;
  wireframe: boolean;
}

export interface MaterialState {
  preset: MaterialType;
  roughness: number;
  metalness: number;
  transmission: number;
  ior: number;
  clearcoat: number;
  tint: string;
  fresnelPower: number;
  emissiveGain: number;
  normalStrength: number;
  scanlineDensity: number;
  neonGlow: number;
}

interface CodeState {
  inputText: string;
  charSet: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  inkColor: string;
  bgMix: number;
  direction: CodeDirection;
  typeSpeed: number;
  scrollSpeed: number;
  syntaxColoring: boolean;
  seed: number;
  proofOverlay: boolean;
  generationStyle?: 'standard' | 'dense' | 'sparse' | 'matrix' | 'minimal';
  textureScale: number;
  textureRepeatX: number;
  textureRepeatY: number;
  coverageMode: 'wrap' | 'fit' | 'tile' | 'stretch';
}

interface ThemeState {
  preset: ThemeType;
  background: string;
  iblIntensity: number;
  uiContrast: number;
}

interface CameraState {
  fov: number;
  autoRotate: boolean;
  rotateSpeed: number;
  damping: number;
}

interface LightingState {
  envIntensity: number;
  keyColor: string;
  keyIntensity: number;
  rimColor: string;
  rimIntensity: number;
  fillIntensity: number;
  shadowSoftness: number;
}

interface PostFXState {
  bloom: boolean;
  bloomStrength: number;
  bloomThreshold: number;
  grain: boolean;
  chromaticAberration: boolean;
}

interface AnimationState {
  spin: boolean;
  float: boolean;
  orbit: boolean;
  speed: number;
}

interface ParticlesState {
  enabled: boolean;
  density: number;
  twinkle: boolean;
  driftSpeed: number;
  orbitMode: boolean;
}

interface AutoplayState {
  enabled: boolean;
  transitionTime: number;
  properties: string[];
  order: 'random' | 'curated';
  loop: boolean;
}

interface StoreState {
  geometry: GeometryState;
  material: MaterialState;
  code: CodeState;
  theme: ThemeState;
  camera: CameraState;
  lighting: LightingState;
  postFX: PostFXState;
  animation: AnimationState;
  particles: ParticlesState;
  autoplay: AutoplayState;
  
  setGeometry: (geometry: Partial<GeometryState>) => void;
  setMaterial: (material: Partial<MaterialState>) => void;
  setCode: (code: Partial<CodeState>) => void;
  setTheme: (theme: Partial<ThemeState>) => void;
  setCamera: (camera: Partial<CameraState>) => void;
  setLighting: (lighting: Partial<LightingState>) => void;
  setPostFX: (postFX: Partial<PostFXState>) => void;
  setAnimation: (animation: Partial<AnimationState>) => void;
  setParticles: (particles: Partial<ParticlesState>) => void;
  setAutoplay: (autoplay: Partial<AutoplayState>) => void;
  
  resetToDefaults: () => void;
  saveAsDefault: () => void;
}

export const FACTORY_DEFAULTS: Omit<StoreState, 'setGeometry' | 'setMaterial' | 'setCode' | 'setTheme' | 'setCamera' | 'setLighting' | 'setPostFX' | 'setAnimation' | 'setParticles' | 'setAutoplay' | 'resetToDefaults' | 'saveAsDefault'> = {
  geometry: {
    type: 'text',
    text: 'ZEN',
    fontFamily: 'Orbitron',
    fontWeight: 900,
    size: 1,
    depth: 0.3,
    bevel: true,
    curveSegments: 12,
    letterSpacing: 0,
    wordSpacing: 0,
    wireframe: false,
  },
  material: {
    preset: 'glass',
    roughness: 0.3,
    metalness: 0.1,
    transmission: 0,
    ior: 1.5,
    clearcoat: 0,
    tint: '#00FFD5',
    fresnelPower: 2,
    emissiveGain: 2,
    normalStrength: 1,
    scanlineDensity: 20,
    neonGlow: 1,
  },
  code: {
    inputText: '// ZEN 3D Code Generator\nconst zen = () => {\n  return reality.bend();\n};\n\nzen.prototype.flow = async () => {\n  while (true) {\n    await transcend();\n    manifest(beauty);\n  }\n};\n\nexport default zen;',
    charSet: 'ascii',
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    lineHeight: 1.5,
    inkColor: '#FFFFFF',
    bgMix: 0.05,
    direction: 'down',
    typeSpeed: 50,
    scrollSpeed: 1,
    syntaxColoring: true,
    seed: 42,
    proofOverlay: false,
    generationStyle: 'standard',
    textureScale: 1,
    textureRepeatX: 1,
    textureRepeatY: 1,
    coverageMode: 'wrap',
  },
  theme: {
    preset: 'dark',
    background: '#0A0F1A',
    iblIntensity: 1,
    uiContrast: 1,
  },
  camera: {
    fov: 75,
    autoRotate: true,
    rotateSpeed: 0.5,
    damping: 0.1,
  },
  lighting: {
    envIntensity: 2,
    keyColor: '#FFFFFF',
    keyIntensity: 2,
    rimColor: '#00FFD5',
    rimIntensity: 1.5,
    fillIntensity: 1,
    shadowSoftness: 0.5,
  },
  postFX: {
    bloom: true,
    bloomStrength: 0.3,
    bloomThreshold: 0.8,
    grain: false,
    chromaticAberration: false,
  },
  animation: {
    spin: false,
    float: false,
    orbit: false,
    speed: 1,
  },
  particles: {
    enabled: true,
    density: 500,
    twinkle: true,
    driftSpeed: 0.5,
    orbitMode: false,
  },
  autoplay: {
    enabled: false,
    transitionTime: 10,
    properties: ['geometry', 'material', 'theme'],
    order: 'curated',
    loop: true,
  },
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      ...FACTORY_DEFAULTS,
      
      setGeometry: (geometry) => set((state) => ({ 
        geometry: { ...state.geometry, ...geometry } 
      })),
      
      setMaterial: (material) => set((state) => ({ 
        material: { ...state.material, ...material } 
      })),
      
      setCode: (code) => set((state) => ({ 
        code: { ...state.code, ...code } 
      })),
      
      setTheme: (theme) => set((state) => ({ 
        theme: { ...state.theme, ...theme } 
      })),
      
      setCamera: (camera) => set((state) => ({ 
        camera: { ...state.camera, ...camera } 
      })),
      
      setLighting: (lighting) => set((state) => ({ 
        lighting: { ...state.lighting, ...lighting } 
      })),
      
      setPostFX: (postFX) => set((state) => ({ 
        postFX: { ...state.postFX, ...postFX } 
      })),
      
      setAnimation: (animation) => set((state) => ({ 
        animation: { ...state.animation, ...animation } 
      })),
      
      setParticles: (particles) => set((state) => ({ 
        particles: { ...state.particles, ...particles } 
      })),
      
      setAutoplay: (autoplay) => set((state) => ({ 
        autoplay: { ...state.autoplay, ...autoplay } 
      })),
      
      resetToDefaults: () => set(FACTORY_DEFAULTS),
      
      saveAsDefault: () => {
        // This will be handled by zustand persist
      },
    }),
    {
      name: 'zen-3d-storage',
      partialize: (state) => ({
        geometry: state.geometry,
        material: state.material,
        code: state.code,
        theme: state.theme,
        camera: state.camera,
        lighting: state.lighting,
        postFX: state.postFX,
        animation: state.animation,
        particles: state.particles,
      }),
    }
  )
);