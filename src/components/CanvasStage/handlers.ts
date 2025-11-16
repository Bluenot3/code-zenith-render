import * as THREE from 'three';
import { toast } from '@/hooks/use-toast';

export const handleCanvasClick = (event: MouseEvent) => {
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

export const createZoomToggler = (
  setIsZoomEnabled: (fn: (prev: boolean) => boolean) => void
) => () => {
  setIsZoomEnabled(prev => {
    const newState = !prev;
    
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

export const createDoubleClickHandler = (toggleZoom: () => void) => (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  toggleZoom();
};

export const createTouchEndHandler = (
  toggleZoom: () => void,
  lastTapTimeRef: React.MutableRefObject<number>,
  tapTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
) => (event: TouchEvent) => {
  const currentTime = Date.now();
  const tapInterval = currentTime - lastTapTimeRef.current;
  
  if (tapInterval < 300 && tapInterval > 0) {
    event.preventDefault();
    event.stopPropagation();
    toggleZoom();
    lastTapTimeRef.current = 0;
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }
  } else {
    lastTapTimeRef.current = currentTime;
    
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    tapTimeoutRef.current = setTimeout(() => {
      lastTapTimeRef.current = 0;
      tapTimeoutRef.current = null;
    }, 300);
  }
};

export const createKeyPressHandler = (
  geometry: any,
  setGeometry: (geom: any) => void,
  codeTexture: any,
  isPausedRef: React.MutableRefObject<boolean>
) => (e: KeyboardEvent) => {
  if (e.shiftKey && e.key.toLowerCase() === 'g') {
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
