import { Suspense, useEffect, useState, useRef, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useIsMobile } from '@/hooks/use-mobile';
import { CameraManager } from './CanvasStage/CameraManager';
import { 
  createZoomToggler, 
  createDoubleClickHandler, 
  createTouchEndHandler,
  createKeyPressHandler 
} from './CanvasStage/handlers';
import { GeometrySwitcher } from './GeometrySwitcher';
import { Particles } from './Particles';
import { InteractiveCharacters } from './InteractiveCharacters';
import { SpaceGradient } from './SpaceGradient';
import { CodeTextureGenerator } from '@/utils/codeTexture';
import { useStore } from '@/state/useStore';
import { applyTheme } from '@/utils/themes';
import * as THREE from 'three';

// Dynamic imports for progressive loading
const GalaxyClusters = lazy(() => import('./GalaxyClusters').then(m => ({ default: m.GalaxyClusters })));
const AmbientStars = lazy(() => import('./AmbientStars').then(m => ({ default: m.AmbientStars })));
const NebulaClouds = lazy(() => import('./NebulaClouds').then(m => ({ default: m.NebulaClouds })));
const CosmicAsteroids = lazy(() => import('./CosmicAsteroids').then(m => ({ default: m.CosmicAsteroids })));
const MeteorTrails = lazy(() => import('./MeteorTrails').then(m => ({ default: m.MeteorTrails })));
const QuantumRift = lazy(() => import('./QuantumRift').then(m => ({ default: m.QuantumRift })));
const CrystalFormation = lazy(() => import('./CrystalFormation').then(m => ({ default: m.CrystalFormation })));

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
  const [loadStage, setLoadStage] = useState(0); // Progressive loading stages
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
    
    // Progressive loading strategy
    setIsFullyLoaded(true);
    
    // Stage 1: Immediate (core scene is already rendered)
    setLoadStage(1);
    
    // Stage 2: Quick decorative effects after first paint
    requestAnimationFrame(() => {
      setLoadStage(2);
      
      // Stage 3: Heavy background effects when browser is idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => setLoadStage(3), { timeout: 2000 });
      } else {
        setTimeout(() => setLoadStage(3), 500);
      }
    });
    
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
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const canvas = event.target as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      const spawnPoint = new THREE.Vector3(
        mouse.x * 3,
        mouse.y * 3,
        Math.random() * 2 - 1
      );
      
      (window as any).__spawnCharacter(spawnPoint, false);
    }
  };

  const toggleZoom = createZoomToggler(setIsZoomEnabled);
  const handleCanvasDoubleClick = createDoubleClickHandler(toggleZoom);
  const handleTouchEnd = createTouchEndHandler(toggleZoom, lastTapTimeRef, tapTimeoutRef);
  const handleKeyPress = createKeyPressHandler(geometry, setGeometry, codeTexture, isPausedRef);
  
  
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
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        shadows
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 100 } }}
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
        
        {/* Stage 2: Quick decorative effects - load after first paint */}
        {loadStage >= 2 && (
          <>
            <Particles />
            <InteractiveCharacters />
          </>
        )}
        
        {/* Stage 3: Heavy background effects - load when idle */}
        {loadStage >= 3 && (
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