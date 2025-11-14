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
        className="fixed top-1/2 right-4 sm:right-6 -translate-y-1/2 z-50 
                   w-14 h-14 sm:w-20 sm:h-20 rounded-full 
                   bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 
                   border-2 border-primary/50 backdrop-blur-md 
                   hover:border-primary/90 transition-all duration-500 ease-out
                   hover:scale-110 active:scale-95 
                   shadow-[0_0_25px_hsl(var(--primary)/0.4),inset_0_0_20px_hsl(var(--primary)/0.1)] 
                   hover:shadow-[0_0_50px_hsl(var(--primary)/0.7),inset_0_0_30px_hsl(var(--primary)/0.2)]
                   touch-manipulation
                   group relative overflow-hidden"
        aria-label={levaHidden ? "Open Settings" : "Close Settings"}
      >
        {/* Animated rotating ring */}
        <span className="absolute inset-0 rounded-full border-2 border-primary/30 
                         animate-[spin_8s_linear_infinite]" 
              style={{ animationDirection: 'reverse' }} />
        
        {/* Pulsing inner ring */}
        <span className="absolute inset-2 rounded-full border border-primary/20 
                         animate-[pulse_3s_ease-in-out_infinite]" />
        
        <span className="absolute inset-0 flex items-center justify-center 
                         text-3xl sm:text-5xl font-bold text-primary 
                         drop-shadow-[0_0_10px_hsl(var(--primary))] 
                         group-hover:drop-shadow-[0_0_20px_hsl(var(--primary))] 
                         transition-all duration-500 animate-pulse
                         group-hover:scale-110">
          Z
        </span>
        
        {/* Enhanced glow rings */}
        <span className="absolute inset-0 rounded-full bg-primary/10 blur-xl 
                         group-hover:bg-primary/25 transition-all duration-500" />
        <span className="absolute inset-[-10px] rounded-full bg-primary/5 blur-2xl 
                         opacity-0 group-hover:opacity-100 transition-all duration-700" />
        
        {/* Subtle scan line effect */}
        <span className="absolute inset-0 rounded-full overflow-hidden">
          <span className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent
                           animate-[scan_4s_ease-in-out_infinite]" 
                style={{ top: '50%' }} />
        </span>
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
