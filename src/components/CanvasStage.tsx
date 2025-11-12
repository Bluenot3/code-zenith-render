import { Suspense, useEffect, useState, useRef, lazy, memo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useIsMobile } from '@/hooks/use-mobile';

const CameraManager = memo(({ isZoomEnabled, isMobile }: { isZoomEnabled: boolean; isMobile: boolean }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    (window as any).__threeCamera = camera;
  }, [camera]);
  
  return null;
});

// Lazy load heavy background components for better initial load
const GalaxyClusters = lazy(() => import('./GalaxyClusters').then(m => ({ default: m.GalaxyClusters })));
const AmbientStars = lazy(() => import('./AmbientStars').then(m => ({ default: m.AmbientStars })));
const NebulaClouds = lazy(() => import('./NebulaClouds').then(m => ({ default: m.NebulaClouds })));
const CosmicAsteroids = lazy(() => import('./CosmicAsteroids').then(m => ({ default: m.CosmicAsteroids })));
const MeteorTrails = lazy(() => import('./MeteorTrails').then(m => ({ default: m.MeteorTrails })));
const QuantumRift = lazy(() => import('./QuantumRift').then(m => ({ default: m.QuantumRift })));
const CrystalFormation = lazy(() => import('./CrystalFormation').then(m => ({ default: m.CrystalFormation })));

// Keep critical components as regular imports for immediate rendering
import { GeometrySwitcher } from './GeometrySwitcher';
import { Particles } from './Particles';
import { InteractiveCharacters } from './InteractiveCharacters';
import { SpaceGradient } from './SpaceGradient';
import { CodeTextureGenerator } from '@/utils/codeTexture';
import { useStore } from '@/state/useStore';
import { applyTheme } from '@/utils/themes';
import { toast } from '@/hooks/use-toast';
import * as THREE from 'three';

export const CanvasStage = () => {
  const isMobile = useIsMobile();
  const theme = useStore((state) => state.theme);
  const code = useStore((state) => state.code);
  const camera = useStore((state) => state.camera);
  const postFX = useStore((state) => state.postFX);
  const lighting = useStore((state) => state.lighting);
  const material = useStore((state) => state.material);
  const setMaterial = useStore((state) => state.setMaterial);
  const geometry = useStore((state) => state.geometry);
  const setGeometry = useStore((state) => state.setGeometry);
  const codeState = useStore((state) => state.code);
  const setCode = useStore((state) => state.setCode);
  
  const [codeTexture, setCodeTexture] = useState<CodeTextureGenerator | null>(null);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [showBackgroundEffects, setShowBackgroundEffects] = useState(false);
  const isPausedRef = useRef(false);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const lastTapTimeRef = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const themeConfig = applyTheme(theme.preset);
    
    // Update code color based on theme
    setCode({ inkColor: themeConfig.codeTextColor });
    
    const generator = new CodeTextureGenerator(code.inputText);
    generator.updateConfig({
      inkColor: themeConfig.codeTextColor,
      bgColor: themeConfig.sceneBackground,
      fontSize: code.fontSize,
      lineHeight: code.lineHeight,
      bgMix: code.bgMix,
      typeSpeed: code.typeSpeed,
      scrollSpeed: code.scrollSpeed,
      syntaxColoring: code.syntaxColoring,
      direction: code.direction,
      generationStyle: (code as any).generationStyle || 'standard',
    });
    
    setCodeTexture(generator);
    
    // Mark as fully loaded immediately for faster initial paint
    setIsFullyLoaded(true);
    
    // Defer background effects to prevent main-thread blocking - reduced delay
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => setShowBackgroundEffects(true), { timeout: 50 });
    } else {
      setTimeout(() => setShowBackgroundEffects(true), 50);
    }
    
    return () => {
      generator.dispose();
    };
  }, [theme.preset, code.inputText, code.fontSize, code.lineHeight, code.bgMix, code.typeSpeed, code.scrollSpeed, code.syntaxColoring, code.direction, (code as any).generationStyle]);
  
  useEffect(() => {
    if (!codeTexture) return;
    
    const themeConfig = applyTheme(theme.preset);
    codeTexture.updateConfig({
      inkColor: themeConfig.codeTextColor,
      bgColor: themeConfig.sceneBackground,
    });
  }, [theme.preset, codeTexture]);
  
  const handleCanvasClick = (event: MouseEvent) => {
    if ((window as any).__spawnCharacter && event.detail === 1) {
      // Single click - spawn special characters
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const canvas = event.target as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Spawn at a point in 3D space near the click
      const spawnPoint = new THREE.Vector3(
        mouse.x * 3,
        mouse.y * 3,
        Math.random() * 2 - 1
      );
      
      (window as any).__spawnCharacter(spawnPoint, false);
    }
  };

  const toggleZoom = () => {
    setIsZoomEnabled(prev => {
      const newState = !prev;
      
      // Reset camera position when disabling zoom
      if (!newState) {
        const camera = (window as any).__threeCamera;
        if (camera) {
          camera.position.set(0, 0, 5);
          camera.lookAt(0, 0, 0);
        }
      }
      
      toast({
        title: newState ? "Zoom Enabled" : "Zoom Disabled",
        description: newState ? "Scroll to zoom in/out" : "Scroll to navigate page",
        duration: 2000,
      });
      return newState;
    });
  };

  const handleCanvasDoubleClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleZoom();
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const currentTime = Date.now();
    const tapInterval = currentTime - lastTapTimeRef.current;
    
    // Double tap detected (two taps within 300ms)
    if (tapInterval < 300 && tapInterval > 0) {
      event.preventDefault();
      event.stopPropagation();
      toggleZoom();
      lastTapTimeRef.current = 0; // Reset
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
    } else {
      // First tap or too slow
      lastTapTimeRef.current = currentTime;
      
      // Clear any existing timeout
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      
      // Reset after 300ms if no second tap comes
      tapTimeoutRef.current = setTimeout(() => {
        lastTapTimeRef.current = 0;
        tapTimeoutRef.current = null;
      }, 300);
    }
  };
  
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.shiftKey && e.key.toLowerCase() === 'g') {
      // Cycle geometry (Shift+Click simulation via Shift+G)
      const geometries: typeof geometry.type[] = ['text', 'cube', 'sphere', 'torus', 'cylinder', 'plane', 'pyramid', 'torusKnot', 'icosahedron', 'dodecahedron'];
      const currentIndex = geometries.indexOf(geometry.type);
      const nextIndex = (currentIndex + 1) % geometries.length;
      setGeometry({ type: geometries[nextIndex] });
      
      toast({
        title: "Geometry Changed",
        description: `Switched to ${geometries[nextIndex]}`,
        duration: 1500,
      });
    } else if (e.altKey && e.key.toLowerCase() === 'p') {
      // Pause/resume code stream (Alt+Click simulation via Alt+P)
      isPausedRef.current = !isPausedRef.current;
      
      if (codeTexture) {
        if (isPausedRef.current) {
          codeTexture.stop();
        } else {
          codeTexture.start();
        }
      }
      
      toast({
        title: isPausedRef.current ? "Code Paused" : "Code Resumed",
        description: `Animation ${isPausedRef.current ? 'stopped' : 'playing'}`,
        duration: 1500,
      });
    }
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [geometry.type, material.preset, codeTexture]);

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick);
      canvas.addEventListener('dblclick', handleCanvasDoubleClick);
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('dblclick', handleCanvasDoubleClick);
        canvas.removeEventListener('touchend', handleTouchEnd);
        if (tapTimeoutRef.current) {
          clearTimeout(tapTimeoutRef.current);
        }
      };
    }
  }, [isZoomEnabled]);
  
  if (!codeTexture || !isFullyLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-background">
        <p className="text-muted-foreground">Loading ZEN 3D...</p>
      </div>
    );
  }
  
  const themeConfig = applyTheme(theme.preset);
  
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: camera.fov }}
        style={{ background: themeConfig.sceneBackground, width: '100%', height: '100%' }}
        gl={{
          antialias: true,
          alpha: false, // Disable alpha for better performance
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        shadows
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 100 } }}
        performance={{ min: 0.5 }} // Adaptive performance mode
        frameloop="always"
      >
      <Suspense fallback={null}>
        <ambientLight intensity={lighting.envIntensity} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={lighting.keyIntensity} 
          color={themeConfig.codeTextColor}
          castShadow 
        />
        <directionalLight 
          position={[-10, -10, -5]} 
          intensity={lighting.fillIntensity}
          color={themeConfig.codeTextColor}
        />
        <pointLight 
          position={[0, 5, 5]} 
          intensity={lighting.rimIntensity} 
          color={themeConfig.particleColor} 
        />
        
        <SpaceGradient />
        
        <GeometrySwitcher 
          texture={codeTexture.getTexture()}
        />
        
        {/* Defer decorative background effects for better performance */}
        {showBackgroundEffects && (
          <Suspense fallback={null}>
            <GalaxyClusters />
            <AmbientStars />
            <NebulaClouds />
            <CosmicAsteroids />
            <MeteorTrails />
            <QuantumRift />
            <CrystalFormation />
          </Suspense>
        )}
        
        <Particles />
        <InteractiveCharacters />
        
        <CameraManager isZoomEnabled={isZoomEnabled} isMobile={isMobile} />
        
        <OrbitControls
          autoRotate={camera.autoRotate}
          autoRotateSpeed={camera.rotateSpeed}
          enableDamping
          dampingFactor={camera.damping}
          enableZoom={isMobile || isZoomEnabled}
          enablePan={isMobile}
          touches={{
            ONE: isMobile ? 2 : 0,
            TWO: 2,
          }}
          minDistance={isMobile ? 2 : 1}
          maxDistance={isMobile ? 15 : 20}
        />
        
        <Environment preset="city" />
      </Suspense>
    </Canvas>
    </div>
  );
};