import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useIsMobile } from '@/hooks/use-mobile';
import { GeometrySwitcher } from './GeometrySwitcher';
import { Particles } from './Particles';
import { InteractiveCharacters } from './InteractiveCharacters';
import { MeteorTrails } from './MeteorTrails';
import { AmbientStars } from './AmbientStars';
import { NebulaClouds } from './NebulaClouds';
import { CosmicAsteroids } from './CosmicAsteroids';
import { QuantumRift } from './QuantumRift';
import { CrystalFormation } from './CrystalFormation';
import { SpaceGradient } from './SpaceGradient';
import { GalaxyClusters } from './GalaxyClusters';
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
  const isPausedRef = useRef(false);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  
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

  const handleCanvasDoubleClick = (event: MouseEvent) => {
    // Toggle zoom mode
    setIsZoomEnabled(prev => {
      const newState = !prev;
      toast({
        title: newState ? "Zoom Enabled" : "Zoom Disabled",
        description: newState ? "Scroll to zoom in/out" : "Scroll to navigate page",
        duration: 2000,
      });
      return newState;
    });
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
      return () => {
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('dblclick', handleCanvasDoubleClick);
      };
    }
  }, [isZoomEnabled]);
  
  if (!codeTexture) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-background">
        <p className="text-muted-foreground">Loading ZEN 3D...</p>
      </div>
    );
  }
  
  const themeConfig = applyTheme(theme.preset);
  
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: camera.fov }}
      style={{ background: themeConfig.sceneBackground }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      shadows
      dpr={[1, 2]}
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
        <GalaxyClusters />
        
        <GeometrySwitcher 
          texture={codeTexture.getTexture()}
        />
        
        <AmbientStars />
        <NebulaClouds />
        <CosmicAsteroids />
        <MeteorTrails />
        <QuantumRift />
        <CrystalFormation />
        <Particles />
        <InteractiveCharacters />
        
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
  );
};