import { useEffect } from 'react';
import { CanvasStage } from '@/components/CanvasStage';
import { HUD } from '@/components/HUD';
import { CodeSettings } from '@/components/CodeSettings';
import { useControls, button, folder } from 'leva';
import { useStore } from '@/state/useStore';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const store = useStore();
  
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
      options: ['JetBrains Mono', 'Orbitron', 'Anton', 'Montserrat', 'Saira Extra Condensed', 'Bebas Neue', 'Unbounded', 'Exo 2', 'Russo One', 'Audiowide'],
      onChange: (v) => store.setGeometry({ fontFamily: v as any }),
    },
    size: {
      value: store.geometry.size,
      min: 0.5,
      max: 3,
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
      max: 2,
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
    fontSize: {
      value: store.code.fontSize,
      min: 8,
      max: 24,
      step: 1,
      onChange: (v) => store.setCode({ fontSize: v }),
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
      <CanvasStage />
      <HUD />
      <CodeSettings />
      
      {/* Footer */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 font-code text-xs">
        <div className="bg-card/80 backdrop-blur-sm px-4 py-2 rounded border border-border space-x-4">
          <a 
            href="https://zenarena.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            ZEN Arena
          </a>
          <span className="text-muted-foreground">|</span>
          <a 
            href="https://aipioneer.zen.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            AI Pioneer Program
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;