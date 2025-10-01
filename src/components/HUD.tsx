import { useEffect, useState } from 'react';
import { useStore } from '@/state/useStore';

export const HUD = () => {
  const [fps, setFps] = useState(60);
  const theme = useStore((state) => state.theme);
  const material = useStore((state) => state.material);
  const geometry = useStore((state) => state.geometry);
  const code = useStore((state) => state.code);
  
  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frames * 1000) / (currentTime - lastTime)));
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    const rafId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  return (
    <div className="fixed top-4 left-4 z-10 font-code text-xs space-y-1 pointer-events-none">
      <div className="bg-card/80 backdrop-blur-sm px-3 py-2 rounded border border-border">
        <p className="text-muted-foreground">FPS: <span className="text-primary font-bold">{fps}</span></p>
      </div>
      
      <div className="bg-card/80 backdrop-blur-sm px-3 py-2 rounded border border-border">
        <p className="text-muted-foreground">Theme: <span className="text-foreground">{theme.preset}</span></p>
        <p className="text-muted-foreground">Material: <span className="text-foreground">{material.preset}</span></p>
        <p className="text-muted-foreground">Geometry: <span className="text-foreground">{geometry.type}</span></p>
      </div>
      
      {code.proofOverlay && (
        <div className="bg-card/80 backdrop-blur-sm px-3 py-2 rounded border border-border">
          <p className="text-muted-foreground">Proof of Generation</p>
          <p className="text-muted-foreground">CPS: <span className="text-primary">{Math.round(code.typeSpeed / 16)}</span></p>
          <p className="text-muted-foreground">LPS: <span className="text-primary">{code.scrollSpeed.toFixed(1)}</span></p>
        </div>
      )}
      
      <div className="bg-card/80 backdrop-blur-sm px-3 py-2 rounded border border-border max-w-xs">
        <p className="text-muted-foreground text-[10px] leading-tight">
          <span className="text-primary">Space</span> pause | 
          <span className="text-primary"> T</span> theme | 
          <span className="text-primary"> G</span> geometry | 
          <span className="text-primary"> M</span> material | 
          <span className="text-primary"> R</span> reset | 
          <span className="text-primary"> A</span> autoplay
        </p>
      </div>
    </div>
  );
};