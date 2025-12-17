import { useEffect, useState, lazy, Suspense } from 'react';
import { useControls, button, folder, Leva } from 'leva';
import { useStore } from '@/state/useStore';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// Lazy load heavy components to reduce initial JS execution time
const CanvasStage = lazy(() => import('@/components/CanvasStage').then(m => ({ default: m.CanvasStage })));
const CodeSettings = lazy(() => import('@/components/CodeSettings').then(m => ({ default: m.CodeSettings })));
const AutoplayController = lazy(() => import('@/components/AutoplayController').then(m => ({ default: m.AutoplayController })));
const Index = () => {
  const isMobile = useIsMobile();
  const store = useStore();
  const [levaHidden, setLevaHidden] = useState(true);
  const [canvasReady, setCanvasReady] = useState(false);
  
  // Defer Canvas initialization to improve TTI
  useEffect(() => {
    const initCanvas = () => {
      setCanvasReady(true);
    };
    
    // Use requestIdleCallback to defer until main thread is idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initCanvas, { timeout: 100 });
    } else {
      // Fallback: small delay to let page become interactive first
      setTimeout(initCanvas, 100);
    }
  }, []);
  
  // Geometry controls
  useControls('Geometry', {
    type: {
      value: store.geometry.type,
      options: ['text', 'cube', 'sphere', 'torus', 'cylinder', 'plane', 'pyramid', 'torusKnot', 'icosahedron', 'dodecahedron'],
      onChange: (v) => store.setGeometry({ type: v as any }),
    },
    text: {
      value: store.geometry.text,
      onChange: (v) => store.setGeometry({ text: v }),
    },
    fontFamily: {
      value: store.geometry.fontFamily,
      options: ['JetBrains Mono', 'Orbitron', 'Anton', 'Montserrat', 'Bebas Neue', 'Unbounded', 'Exo 2', 'Russo One', 'Audiowide', 'Saira Extra Condensed', 'Righteous', 'Bangers', 'Black Ops One', 'Press Start 2P'],
      onChange: (v) => store.setGeometry({ fontFamily: v as any }),
    },
    size: {
      value: store.geometry.size,
      min: 0.1,
      max: 10,
      step: 0.1,
      onChange: (v) => store.setGeometry({ size: v }),
    },
    depth: {
      value: store.geometry.depth,
      min: 0.1,
      max: 1,
      step: 0.05,
      onChange: (v) => store.setGeometry({ depth: v }),
    },
    bevel: {
      value: store.geometry.bevel,
      onChange: (v) => store.setGeometry({ bevel: v }),
    },
    wireframe: {
      value: store.geometry.wireframe,
      onChange: (v) => store.setGeometry({ wireframe: v }),
    },
  });
  
  // Material controls
  useControls('Material', {
    preset: {
      value: store.material.preset,
      options: ['code', 'glass', 'hologram', 'crystal', 'water', 'metal', 'matte', 'neon', 'carbon'],
      onChange: (v) => store.setMaterial({ preset: v as any }),
    },
    tint: {
      value: store.material.tint,
      onChange: (v) => store.setMaterial({ tint: v }),
    },
    emissiveGain: {
      value: store.material.emissiveGain,
      min: 0,
      max: 10,
      step: 0.1,
      onChange: (v) => store.setMaterial({ emissiveGain: v }),
    },
    roughness: {
      value: store.material.roughness,
      min: 0,
      max: 1,
      step: 0.05,
      onChange: (v) => store.setMaterial({ roughness: v }),
    },
    metalness: {
      value: store.material.metalness,
      min: 0,
      max: 1,
      step: 0.05,
      onChange: (v) => store.setMaterial({ metalness: v }),
    },
  });
  
  // Code controls
  useControls('Code Stream', {
    '🎨 Generation Style': {
      value: (store.code as any).generationStyle || 'standard',
      options: {
        '📝 Standard': 'standard',
        '🔥 Dense - Packed': 'dense',
        '💎 Sparse - Spacious': 'sparse',
        '⚡ Matrix - Glitch': 'matrix',
        '✨ Minimal - Pure': 'minimal',
      },
      onChange: (v) => store.setCode({ generationStyle: v } as any),
    },
    '📐 Coverage Mode': {
      value: (store.code as any).coverageMode || 'wrap',
      options: {
        '🌀 Wrap - Natural flow': 'wrap',
        '📏 Fit - Full coverage': 'fit',
        '🔲 Tile - Repeat pattern': 'tile',
        '↔️ Stretch - Fill surface': 'stretch',
      },
      onChange: (v) => store.setCode({ coverageMode: v } as any),
    },
    'Texture Scale': {
      value: (store.code as any).textureScale || 1,
      min: 0.1,
      max: 20,
      step: 0.1,
      onChange: (v) => store.setCode({ textureScale: v } as any),
    },
    'Repeat X': {
      value: (store.code as any).textureRepeatX || 1,
      min: 0.1,
      max: 20,
      step: 0.1,
      onChange: (v) => store.setCode({ textureRepeatX: v } as any),
    },
    'Repeat Y': {
      value: (store.code as any).textureRepeatY || 1,
      min: 0.1,
      max: 20,
      step: 0.1,
      onChange: (v) => store.setCode({ textureRepeatY: v } as any),
    },
    fontSize: {
      value: store.code.fontSize,
      min: 6,
      max: 64,
      step: 1,
      onChange: (v) => store.setCode({ fontSize: v }),
    },
    lineHeight: {
      value: store.code.lineHeight,
      min: 0.8,
      max: 3,
      step: 0.1,
      onChange: (v) => store.setCode({ lineHeight: v }),
    },
    inkColor: {
      value: store.code.inkColor,
      onChange: (v) => store.setCode({ inkColor: v }),
    },
    bgMix: {
      value: store.code.bgMix,
      min: 0,
      max: 0.5,
      step: 0.01,
      label: 'Background Mix',
      onChange: (v) => store.setCode({ bgMix: v }),
    },
    typeSpeed: {
      value: store.code.typeSpeed,
      min: 10,
      max: 200,
      step: 10,
      onChange: (v) => store.setCode({ typeSpeed: v }),
    },
    scrollSpeed: {
      value: store.code.scrollSpeed,
      min: 0.1,
      max: 5,
      step: 0.1,
      onChange: (v) => store.setCode({ scrollSpeed: v }),
    },
    syntaxColoring: {
      value: store.code.syntaxColoring,
      onChange: (v) => store.setCode({ syntaxColoring: v }),
    },
    proofOverlay: {
      value: store.code.proofOverlay,
      onChange: (v) => store.setCode({ proofOverlay: v }),
    },
  });
  
  // Theme controls
  useControls('Theme', {
    preset: {
      value: store.theme.preset,
      options: ['dark', 'light', 'neon', 'cyberpunk', 'crystal', 'glass', 'holo', 'aqua', 'dusk', 'midnight', 'zen'],
      onChange: (v) => store.setTheme({ preset: v as any }),
    },
    'Set as Default': button(() => {
      store.saveAsDefault();
      toast({
        title: "Defaults Saved",
        description: "Current settings saved as defaults",
      });
    }),
    'Reset to Factory': button(() => {
      store.resetToDefaults();
      toast({
        title: "Reset Complete",
        description: "All settings restored to factory defaults",
      });
    }),
  });
  
  // Camera controls
  useControls('Camera', {
    fov: {
      value: store.camera.fov,
      min: 30,
      max: 120,
      step: 5,
      onChange: (v) => store.setCamera({ fov: v }),
    },
    autoRotate: {
      value: store.camera.autoRotate,
      onChange: (v) => store.setCamera({ autoRotate: v }),
    },
    rotateSpeed: {
      value: store.camera.rotateSpeed,
      min: 0.1,
      max: 2,
      step: 0.1,
      onChange: (v) => store.setCamera({ rotateSpeed: v }),
    },
  });
  
  // Animation controls
  useControls('Animation', {
    spin: {
      value: store.animation.spin,
      onChange: (v) => store.setAnimation({ spin: v }),
    },
    float: {
      value: store.animation.float,
      onChange: (v) => store.setAnimation({ float: v }),
    },
    orbit: {
      value: store.animation.orbit,
      onChange: (v) => store.setAnimation({ orbit: v }),
    },
    speed: {
      value: store.animation.speed,
      min: 0.1,
      max: 3,
      step: 0.1,
      onChange: (v) => store.setAnimation({ speed: v }),
    },
  });
  
  // Particles controls
  useControls('Particles', {
    enabled: {
      value: store.particles.enabled,
      onChange: (v) => store.setParticles({ enabled: v }),
    },
    density: {
      value: store.particles.density,
      min: 100,
      max: 2000,
      step: 100,
      onChange: (v) => store.setParticles({ density: v }),
    },
    twinkle: {
      value: store.particles.twinkle,
      onChange: (v) => store.setParticles({ twinkle: v }),
    },
    driftSpeed: {
      value: store.particles.driftSpeed,
      min: 0.1,
      max: 2,
      step: 0.1,
      onChange: (v) => store.setParticles({ driftSpeed: v }),
    },
    orbitMode: {
      value: store.particles.orbitMode,
      onChange: (v) => store.setParticles({ orbitMode: v }),
    },
  });
  
  // Post FX controls
  useControls('Post FX', {
    bloom: {
      value: store.postFX.bloom,
      onChange: (v) => store.setPostFX({ bloom: v }),
    },
    bloomStrength: {
      value: store.postFX.bloomStrength,
      min: 0,
      max: 2,
      step: 0.1,
      onChange: (v) => store.setPostFX({ bloomStrength: v }),
    },
    bloomThreshold: {
      value: store.postFX.bloomThreshold,
      min: 0,
      max: 1,
      step: 0.05,
      onChange: (v) => store.setPostFX({ bloomThreshold: v }),
    },
  });
  
  // Autoplay controls
  useControls('Autoplay Tour', {
    enabled: {
      value: store.autoplay.enabled,
      onChange: (v) => store.setAutoplay({ enabled: v }),
    },
    transitionTime: {
      value: store.autoplay.transitionTime,
      min: 5,
      max: 30,
      step: 1,
      onChange: (v) => store.setAutoplay({ transitionTime: v }),
    },
    loop: {
      value: store.autoplay.loop,
      onChange: (v) => store.setAutoplay({ loop: v }),
    },
  });
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        // Pause handled in CanvasStage
      } else if (e.key.toLowerCase() === 't') {
        const themes: typeof store.theme.preset[] = ['dark', 'light', 'neon', 'cyberpunk', 'crystal', 'glass', 'holo', 'aqua', 'dusk', 'midnight', 'zen'];
        const currentIndex = themes.indexOf(store.theme.preset);
        const nextIndex = (currentIndex + 1) % themes.length;
        store.setTheme({ preset: themes[nextIndex] });
      } else if (e.key.toLowerCase() === 'g') {
        const geometries: typeof store.geometry.type[] = ['text', 'cube', 'sphere', 'torus', 'cylinder', 'plane', 'pyramid', 'torusKnot', 'icosahedron', 'dodecahedron'];
        const currentIndex = geometries.indexOf(store.geometry.type);
        const nextIndex = (currentIndex + 1) % geometries.length;
        store.setGeometry({ type: geometries[nextIndex] });
      } else if (e.key.toLowerCase() === 'm') {
        const materials: typeof store.material.preset[] = ['code', 'glass', 'hologram', 'crystal', 'water', 'metal', 'matte', 'neon', 'carbon'];
        const currentIndex = materials.indexOf(store.material.preset);
        const nextIndex = (currentIndex + 1) % materials.length;
        store.setMaterial({ preset: materials[nextIndex] });
      } else if (e.key.toLowerCase() === 'r') {
        store.setCamera({ fov: 75 });
      } else if (e.key.toLowerCase() === 'a') {
        store.setAutoplay({ enabled: !store.autoplay.enabled });
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [store]);
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Lightweight placeholder shown immediately for fast TTI */}
      {!canvasReady && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] via-[#1a1a3e] to-[#0d0d1f] flex items-center justify-center">
          <div className="text-primary text-2xl font-bold animate-pulse">ZEN</div>
        </div>
      )}
      
      {/* Defer heavy components until page is interactive */}
      {canvasReady && (
        <>
          <Leva hidden={levaHidden} />
          <Suspense fallback={null}>
            <CanvasStage />
            <CodeSettings onToggleLeva={() => setLevaHidden(!levaHidden)} levaHidden={levaHidden} />
            <AutoplayController />
          </Suspense>
        </>
      )}
      
      {/* Footer - always visible for immediate interactivity */}
      <div className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 font-code text-xs">
        <div className="bg-card/80 backdrop-blur-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded border border-border flex flex-col sm:flex-row items-center gap-1 sm:gap-4">
          <a 
            href="https://zenarena.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors text-[10px] sm:text-xs touch-manipulation"
          >
            ZEN Arena
          </a>
          <span className="text-muted-foreground hidden sm:inline">|</span>
          <a 
            href="https://aipioneer.zen.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors text-[10px] sm:text-xs touch-manipulation"
          >
            AI Pioneer Program
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;