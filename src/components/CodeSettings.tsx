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
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 w-12 h-12 sm:w-16 sm:h-16 rounded-full 
                   bg-gradient-to-br from-primary/20 to-primary/10 
                   border-2 border-primary/40 backdrop-blur-sm 
                   hover:border-primary/80 transition-all duration-300 
                   hover:scale-110 active:scale-95 shadow-[0_0_20px_hsl(var(--primary)/0.3)] 
                   hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)]
                   touch-manipulation
                   group"
        aria-label={levaHidden ? "Open Settings" : "Close Settings"}
      >
        <span className="absolute inset-0 flex items-center justify-center 
                         text-2xl sm:text-4xl font-bold text-primary 
                         drop-shadow-[0_0_8px_hsl(var(--primary))] 
                         group-hover:drop-shadow-[0_0_16px_hsl(var(--primary))] 
                         transition-all duration-300 animate-pulse">
          Z
        </span>
        
        {/* Glow ring */}
        <span className="absolute inset-0 rounded-full bg-primary/10 blur-xl 
                         group-hover:bg-primary/20 transition-all duration-300" />
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
