import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { GeometrySwitcher } from './GeometrySwitcher';
import { Particles } from './Particles';
import { CodeTextureGenerator } from '@/utils/codeTexture';
import { useStore } from '@/state/useStore';
import { applyTheme } from '@/utils/themes';
import { toast } from '@/hooks/use-toast';

export const CanvasStage = () => {
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
    });
    
    setCodeTexture(generator);
    
    return () => {
      generator.dispose();
    };
  }, [theme.preset, code.inputText, code.fontSize, code.lineHeight, code.bgMix, code.typeSpeed, code.scrollSpeed, code.syntaxColoring, code.direction]);
  
  useEffect(() => {
    if (!codeTexture) return;
    
    const themeConfig = applyTheme(theme.preset);
    codeTexture.updateConfig({
      inkColor: themeConfig.codeTextColor,
      bgColor: themeConfig.sceneBackground,
    });
  }, [theme.preset, codeTexture]);
  
  const handleMeshClick = () => {
    // Pulse animation (handled by CSS)
    toast({
      title: "Interaction!",
      description: "Click detected - mesh pulse activated",
      duration: 1000,
    });
  };
  
  const handleMeshDoubleClick = () => {
    // Cycle material
    const materials: typeof material.preset[] = ['code', 'glass', 'hologram', 'crystal', 'water', 'metal', 'matte', 'neon', 'carbon'];
    const currentIndex = materials.indexOf(material.preset);
    const nextIndex = (currentIndex + 1) % materials.length;
    setMaterial({ preset: materials[nextIndex] });
    
    toast({
      title: "Material Changed",
      description: `Switched to ${materials[nextIndex]}`,
      duration: 1500,
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
        
        <GeometrySwitcher 
          texture={codeTexture.getTexture()} 
          onClick={handleMeshClick}
        />
        
        <Particles />
        
        <OrbitControls
          autoRotate={camera.autoRotate}
          autoRotateSpeed={camera.rotateSpeed}
          enableDamping
          dampingFactor={camera.damping}
        />
        
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
};