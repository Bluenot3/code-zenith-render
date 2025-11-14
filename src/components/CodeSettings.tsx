import { useState } from 'react';

interface CodeSettingsProps {
  onToggleLeva: () => void;
  levaHidden: boolean;
}

export const CodeSettings = ({ onToggleLeva, levaHidden }: CodeSettingsProps) => {
  const [sparks, setSparks] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleZClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Create sparks at button position
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const newSparks = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: centerX,
      y: centerY,
    }));
    
    setSparks(prev => [...prev, ...newSparks]);
    
    // Remove sparks after animation
    setTimeout(() => {
      setSparks(prev => prev.filter(s => !newSparks.find(ns => ns.id === s.id)));
    }, 1000);
    
    // Toggle Leva panel
    onToggleLeva();
  };

  return (
    <>
      <button
        onClick={handleZClick}
        className="fixed top-1/2 right-4 sm:right-6 -translate-y-1/2 z-[100] 
                   w-16 h-16 sm:w-20 sm:h-20 rounded-full 
                   bg-gradient-to-br from-primary/30 to-primary/10 
                   border-2 border-primary/60 backdrop-blur-sm 
                   hover:border-primary/90 transition-all duration-300 
                   hover:scale-110 active:scale-95 
                   shadow-[0_0_30px_hsl(var(--primary)/0.5)] 
                   hover:shadow-[0_0_50px_hsl(var(--primary)/0.8)]
                   touch-manipulation group"
        aria-label={levaHidden ? "Open Settings" : "Close Settings"}
      >
        <span className="absolute inset-0 flex items-center justify-center 
                         text-4xl sm:text-5xl font-bold text-primary 
                         drop-shadow-[0_0_12px_hsl(var(--primary))] 
                         group-hover:drop-shadow-[0_0_20px_hsl(var(--primary))] 
                         transition-all duration-300 animate-pulse">
          Z
        </span>
        
        {/* Glow ring */}
        <span className="absolute inset-0 rounded-full bg-primary/10 blur-xl 
                         group-hover:bg-primary/25 transition-all duration-300" />
      </button>
      
      {/* Spark particles */}
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="fixed w-2 h-2 bg-primary rounded-full pointer-events-none z-[60]
                     animate-[spark_1s_ease-out_forwards]"
          style={{
            left: spark.x,
            top: spark.y,
          }}
        />
      ))}
    </>
  );
};
