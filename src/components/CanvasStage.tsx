import { Suspense, useEffect, useState, useRef, lazy, startTransition } from 'react';
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
import { AmbientStars } from './AmbientStars';
import { CodeTextureGenerator } from '@/utils/codeTexture';
import { useStore } from '@/state/useStore';
import { applyTheme } from '@/utils/themes';
import * as THREE from 'three';

// Lazy load heavy effects with deferred loading - only load on desktop after main content
const GalaxyClusters = lazy(() => import('./GalaxyClusters').then(m => ({ default: m.GalaxyClusters })));
const NebulaClouds = lazy(() => import('./NebulaClouds').then(m => ({ default: m.NebulaClouds })));
const CosmicAsteroids = lazy(() => import('./CosmicAsteroids').then(m => ({ default: m.CosmicAsteroids })));
const MeteorTrails = lazy(() => import('./MeteorTrails').then(m => ({ default: m.MeteorTrails })));
const QuantumRift = lazy(() => import('./QuantumRift').then(m => ({ default: m.QuantumRift })));
const CrystalFormation = lazy(() => import('./CrystalFormation').then(m => ({ default: m.CrystalFormation })));
const Sparkles = lazy(() => import('./SpawnEffects').then(m => ({ default: m.Sparkles })));
const SpawnFlash = lazy(() => import('./SpawnEffects').then(m => ({ default: m.SpawnFlash })));
const ShockwaveRing = lazy(() => import('./SpawnEffects').then(m => ({ default: m.ShockwaveRing })));
// New detailed particle systems
const SpaceDust = lazy(() => import('./SpaceDust').then(m => ({ default: m.SpaceDust })));
const EnergyOrbs = lazy(() => import('./EnergyOrbs').then(m => ({ default: m.EnergyOrbs })));
const PlasmaWisps = lazy(() => import('./PlasmaWisps').then(m => ({ default: m.PlasmaWisps })));
const CosmicFireflies = lazy(() => import('./CosmicFireflies').then(m => ({ default: m.CosmicFireflies })));
const StarClusters = lazy(() => import('./StarClusters').then(m => ({ default: m.StarClusters })));
// Deep background effects
const ShootingStars = lazy(() => import('./ShootingStars').then(m => ({ default: m.ShootingStars })));
const DeepSpaceGlow = lazy(() => import('./DeepSpaceGlow').then(m => ({ default: m.DeepSpaceGlow })));
const DistantGalaxies = lazy(() => import('./DistantGalaxies').then(m => ({ default: m.DistantGalaxies })));
const CosmicAurora = lazy(() => import('./CosmicAurora').then(m => ({ default: m.CosmicAurora })));
// Ambient liquid glass rings (desktop only, near-zero cost)
const LiquidRings = lazy(() => import('./LiquidRings').then(m => ({ default: m.LiquidRings })));

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
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const isPausedRef = useRef(false);
  const [showSpawnEffect, setShowSpawnEffect] = useState(true);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [backgroundEffectsReady, setBackgroundEffectsReady] = useState(false);
  const lastTapTimeRef = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Defer background effects loading to reduce main-thread blocking
  useEffect(() => {
    if (!isFullyLoaded || isMobile) return;
    
    const timer = setTimeout(() => {
      startTransition(() => {
        setBackgroundEffectsReady(true);
      });
    }, 500); // Load background effects 500ms after main content
    
    return () => clearTimeout(timer);
  }, [isFullyLoaded, isMobile]);
  
  // Visibility detection - pause rendering when not visible
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Start visible by default
    setIsVisible(true);
    
    // Intersection Observer for viewport visibility
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]) {
          setIsVisible(entries[0].isIntersecting);
        }
      },
      { threshold: 0.01, rootMargin: '100px' }
    );
    
    const currentContainer = containerRef.current;
    observer.observe(currentContainer);
    
    // Page visibility API
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
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
    setIsFullyLoaded(true);
    
    // Show spawn effects on load
    setShowSpawnEffect(true);
    setTimeout(() => setShowSpawnEffect(false), 3000);
    
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
  
  // Fallback for WebGL errors or when not loaded
  if (hasWebGLError) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-background via-background/95 to-primary/10">
        <div className="text-center space-y-2">
          <div className="text-primary text-2xl">✨</div>
          <p className="text-muted-foreground text-sm">3D View Unavailable</p>
        </div>
      </div>
    );
  }
  
  if (!codeTexture || !isFullyLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-background via-background/95 to-primary/10">
        <div className="text-center space-y-2">
          <div className="text-primary text-2xl animate-pulse">⚡</div>
          <p className="text-muted-foreground text-sm">Loading ZEN 3D...</p>
        </div>
      </div>
    );
  }
  
  const themeConfig = applyTheme(theme.preset);
  
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        frameloop={isVisible ? "always" : "demand"}
        camera={{ position: [0, 0, 5], fov: camera.fov }}
        style={{ background: themeConfig.sceneBackground, width: '100%', height: '100%' }}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: isMobile ? 'default' : 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        shadows={!isMobile}
        dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 100 } }}
        onCreated={({ gl }) => {
          // Detect WebGL failures
          try {
            gl.getContext();
          } catch (e) {
            console.error('WebGL Error:', e);
            setHasWebGLError(true);
          }
        }}
      >
      <Suspense fallback={null}>
        <ambientLight intensity={lighting.envIntensity} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={lighting.keyIntensity} 
          color={themeConfig.codeTextColor}
          castShadow={!isMobile} 
        />
        {!isMobile && (
          <>
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
          </>
        )}
        
        <SpaceGradient />
        
        {/* Essential background - always visible */}
        <AmbientStars />
        
        {/* Advanced effects - desktop only, loaded after main content to reduce blocking */}
        {!isMobile && backgroundEffectsReady && (
          <Suspense fallback={null}>
            <GalaxyClusters />
            <NebulaClouds />
            <CosmicAsteroids />
            <MeteorTrails />
            <QuantumRift />
            <CrystalFormation />
            <SpaceDust />
            <EnergyOrbs />
            <PlasmaWisps />
            <CosmicFireflies />
            <StarClusters />
            {/* Deep background effects */}
            <ShootingStars />
            <DeepSpaceGlow />
            <DistantGalaxies />
            <CosmicAurora />
            {/* Ambient liquid glass rings */}
            <LiquidRings />
          </Suspense>
        )}
        
        <GeometrySwitcher 
          texture={codeTexture.getTexture()}
        />
        
        <Particles />
        <InteractiveCharacters />
        
        {/* Spawn Effects - only on desktop or after initial mobile load */}
        {showSpawnEffect && !isMobile && (
          <Suspense fallback={null}>
            <Sparkles position={new THREE.Vector3(0, 0, 0)} count={30} />
            <SpawnFlash 
              position={new THREE.Vector3(0, 0, 0)} 
              onComplete={() => {}} 
            />
            <ShockwaveRing 
              position={new THREE.Vector3(0, 0, 0)} 
              onComplete={() => {}} 
            />
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
        
        {!isMobile && <Environment preset="city" />}
      </Suspense>
    </Canvas>
    </div>
  );
};