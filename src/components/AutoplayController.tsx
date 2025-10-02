import { useEffect, useRef } from 'react';
import { useStore } from '@/state/useStore';

const PRESETS = [
  {
    geometry: { type: 'text' as const },
    material: { preset: 'glass' as const },
    theme: { preset: 'crystal' as const },
    animation: { spin: true, float: false, orbit: false, speed: 1 },
  },
  {
    geometry: { type: 'cube' as const },
    material: { preset: 'neon' as const },
    theme: { preset: 'cyberpunk' as const },
    animation: { spin: true, float: true, orbit: false, speed: 1.5 },
  },
  {
    geometry: { type: 'sphere' as const },
    material: { preset: 'crystal' as const },
    theme: { preset: 'aqua' as const },
    animation: { spin: false, float: true, orbit: true, speed: 0.8 },
  },
  {
    geometry: { type: 'torus' as const },
    material: { preset: 'hologram' as const },
    theme: { preset: 'holo' as const },
    animation: { spin: true, float: false, orbit: false, speed: 2 },
  },
  {
    geometry: { type: 'torusKnot' as const },
    material: { preset: 'metal' as const },
    theme: { preset: 'dark' as const },
    animation: { spin: true, float: true, orbit: false, speed: 1.2 },
  },
  {
    geometry: { type: 'icosahedron' as const },
    material: { preset: 'water' as const },
    theme: { preset: 'zen' as const },
    animation: { spin: false, float: true, orbit: true, speed: 0.5 },
  },
  {
    geometry: { type: 'dodecahedron' as const },
    material: { preset: 'carbon' as const },
    theme: { preset: 'midnight' as const },
    animation: { spin: true, float: false, orbit: false, speed: 1 },
  },
  {
    geometry: { type: 'cylinder' as const },
    material: { preset: 'code' as const },
    theme: { preset: 'neon' as const },
    animation: { spin: false, float: true, orbit: false, speed: 1.8 },
  },
];

export const AutoplayController = () => {
  const autoplay = useStore((state) => state.autoplay);
  const setGeometry = useStore((state) => state.setGeometry);
  const setMaterial = useStore((state) => state.setMaterial);
  const setTheme = useStore((state) => state.setTheme);
  const setAnimation = useStore((state) => state.setAnimation);
  const setCamera = useStore((state) => state.setCamera);
  const currentIndexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!autoplay.enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const cyclePresets = () => {
      const preset = PRESETS[currentIndexRef.current];
      
      // Smooth transition: fade animations
      setAnimation({ spin: false, float: false, orbit: false });
      
      setTimeout(() => {
        // Apply new preset
        setGeometry(preset.geometry);
        setMaterial(preset.material);
        setTheme(preset.theme);
        
        setTimeout(() => {
          setAnimation(preset.animation);
          
          // Smooth camera movement
          const fov = 60 + Math.sin(currentIndexRef.current) * 15;
          setCamera({ fov });
        }, 300);
      }, 400);

      currentIndexRef.current = (currentIndexRef.current + 1) % PRESETS.length;
      
      if (!autoplay.loop && currentIndexRef.current === 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    // Initial cycle
    cyclePresets();

    // Set up interval
    intervalRef.current = setInterval(cyclePresets, autoplay.transitionTime * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoplay.enabled, autoplay.transitionTime, autoplay.loop, setGeometry, setMaterial, setTheme, setAnimation, setCamera]);

  return null;
};
