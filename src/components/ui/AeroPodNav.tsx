import { GraduationCap, Globe, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";

interface GlowState {
  x: number;
  y: number;
  intensity: number;
  section: 'top' | 'left' | 'right' | null;
}

export const AeroPodNav = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState<GlowState>({ x: 0, y: 0, intensity: 0, section: null });
  const intensityRef = useRef(0);
  const animationRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());

  // Gradually increase intensity while hovering
  useEffect(() => {
    if (glow.section) {
      const tick = () => {
        const now = Date.now();
        const delta = (now - lastUpdateRef.current) / 1000;
        lastUpdateRef.current = now;
        
        // Increase intensity over time (reaches max ~1.0 after 60 seconds)
        intensityRef.current = Math.min(1, intensityRef.current + delta * 0.0167);
        setGlow(prev => ({ ...prev, intensity: intensityRef.current }));
        
        animationRef.current = requestAnimationFrame(tick);
      };
      
      lastUpdateRef.current = Date.now();
      animationRef.current = requestAnimationFrame(tick);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      // Fade out when not hovering
      intensityRef.current = Math.max(0, intensityRef.current - 0.02);
      if (intensityRef.current > 0) {
        const fadeOut = () => {
          intensityRef.current = Math.max(0, intensityRef.current - 0.02);
          setGlow(prev => ({ ...prev, intensity: intensityRef.current }));
          if (intensityRef.current > 0) {
            animationRef.current = requestAnimationFrame(fadeOut);
          }
        };
        animationRef.current = requestAnimationFrame(fadeOut);
      }
    }
  }, [glow.section]);

  const handleMouseMove = useCallback((e: React.MouseEvent, section: 'top' | 'left' | 'right') => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setGlow(prev => ({
      ...prev,
      x,
      y,
      section,
    }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setGlow(prev => ({ ...prev, section: null }));
  }, []);

  // Calculate spillover glow for adjacent sections
  const getSpilloverIntensity = (targetSection: 'top' | 'left' | 'right') => {
    if (!glow.section || glow.section === targetSection) return 0;
    
    const baseSpillover = glow.intensity * 0.3;
    
    // Calculate distance-based spillover
    if (glow.section === 'top') {
      if (glow.y > 70) return baseSpillover * (glow.y - 70) / 30;
    } else if (glow.section === 'left' && targetSection === 'right') {
      if (glow.x > 70) return baseSpillover * (glow.x - 70) / 30;
    } else if (glow.section === 'right' && targetSection === 'left') {
      if (glow.x < 30) return baseSpillover * (30 - glow.x) / 30;
    } else if ((glow.section === 'left' || glow.section === 'right') && targetSection === 'top') {
      if (glow.y < 30) return baseSpillover * (30 - glow.y) / 30;
    }
    
    return 0;
  };

  const getGlowStyle = (section: 'top' | 'left' | 'right') => {
    const isActive = glow.section === section;
    const spillover = getSpilloverIntensity(section);
    const activeIntensity = isActive ? glow.intensity : spillover;
    
    if (activeIntensity <= 0) return {};
    
    const glowColor = `rgba(59, 130, 246, ${0.15 + activeIntensity * 0.6})`;
    const glowColor2 = `rgba(59, 130, 246, ${activeIntensity * 0.4})`;
    const bgOpacity = activeIntensity * 0.25;
    
    if (isActive) {
      return {
        background: `
          radial-gradient(
            circle at ${glow.x}% ${glow.y}%,
            ${glowColor} 0%,
            ${glowColor2} ${20 + (1 - activeIntensity) * 30}%,
            rgba(59, 130, 246, ${activeIntensity * 0.1}) ${50 + (1 - activeIntensity) * 30}%,
            transparent 80%
          ),
          linear-gradient(to bottom, rgba(59, 130, 246, ${bgOpacity * 0.3}), rgba(59, 130, 246, ${bgOpacity * 0.5}))
        `,
        boxShadow: `
          inset 0 0 ${30 + activeIntensity * 40}px rgba(59, 130, 246, ${activeIntensity * 0.3}),
          0 0 ${20 + activeIntensity * 30}px rgba(59, 130, 246, ${activeIntensity * 0.2})
        `,
      };
    } else {
      return {
        background: `linear-gradient(to bottom, rgba(59, 130, 246, ${spillover * 0.15}), rgba(59, 130, 246, ${spillover * 0.2}))`,
        boxShadow: `inset 0 0 ${spillover * 30}px rgba(59, 130, 246, ${spillover * 0.2})`,
      };
    }
  };

  const getTextGlow = (section: 'top' | 'left' | 'right') => {
    const isActive = glow.section === section;
    const spillover = getSpilloverIntensity(section);
    const intensity = isActive ? glow.intensity : spillover;
    
    if (intensity <= 0) return {};
    
    return {
      textShadow: `0 0 ${10 + intensity * 20}px rgba(59, 130, 246, ${intensity * 0.8})`,
      color: `rgb(${59 + (1 - intensity) * 40}, ${130 - intensity * 30}, ${246})`,
    };
  };

  const getIconGlow = (section: 'top' | 'left' | 'right') => {
    const isActive = glow.section === section;
    const spillover = getSpilloverIntensity(section);
    const intensity = isActive ? glow.intensity : spillover;
    
    if (intensity <= 0) return {};
    
    return {
      filter: `drop-shadow(0 0 ${8 + intensity * 15}px rgba(59, 130, 246, ${0.5 + intensity * 0.5}))`,
      color: `rgb(${59 + (1 - intensity) * 40}, ${130 - intensity * 30}, ${246})`,
    };
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center">
      {/* Main Container - Fused Aero Pod */}
      <div
        className={cn(
          "relative bg-gradient-to-b from-[#f8f9fa] to-[#e8eaed]",
          "rounded-[24px] p-[3px]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]",
          "transition-shadow duration-300"
        )}
        style={{
          boxShadow: glow.intensity > 0.1 
            ? `0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08), 0 0 ${glow.intensity * 40}px rgba(59, 130, 246, ${glow.intensity * 0.3})`
            : undefined
        }}
      >
        {/* Inner Container */}
        <div className="bg-gradient-to-b from-white to-[#f5f6f7] rounded-[22px] overflow-hidden">
          
          {/* Top Section - AI Pioneer Program */}
          <a
            href="https://aipioneer.zen.ai"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group relative block px-10 py-5 text-center overflow-hidden",
              "bg-gradient-to-r from-[#e8f5e9]/60 via-[#f1f8e9]/40 to-[#fff8e1]/60",
              "border-b border-[#e0e0e0]/50",
              "transition-all duration-200 ease-out"
            )}
            onMouseMove={(e) => handleMouseMove(e, 'top')}
            onMouseLeave={handleMouseLeave}
          >
            {/* Dynamic glow overlay */}
            <div 
              className="absolute inset-0 pointer-events-none transition-all duration-100"
              style={getGlowStyle('top')}
            />
            
            <div className="relative z-10 flex items-center justify-center gap-2.5 mb-1.5">
              <GraduationCap 
                className="w-6 h-6 transition-all duration-200"
                style={{
                  ...getIconGlow('top'),
                  color: glow.section === 'top' || getSpilloverIntensity('top') > 0 
                    ? undefined 
                    : '#4a5568'
                }}
              />
              <span 
                className="font-bold text-base tracking-wide transition-all duration-200"
                style={{
                  ...getTextGlow('top'),
                  color: glow.section === 'top' || getSpilloverIntensity('top') > 0 
                    ? undefined 
                    : '#2d3748'
                }}
              >
                AI PIONEER
              </span>
            </div>
            <span 
              className="relative z-10 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-200"
              style={{
                color: glow.section === 'top' 
                  ? `rgba(59, 130, 246, ${0.7 + glow.intensity * 0.3})` 
                  : '#6b7a3d'
              }}
            >
              Program
            </span>
          </a>

          {/* Bottom Section - Two Buttons */}
          <div className="flex">
            {/* ZEN AI World */}
            <a
              href="https://zen.ai"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group relative flex-1 px-8 py-5 text-center overflow-hidden",
                "border-r border-[#e0e0e0]/50",
                "transition-all duration-200 ease-out"
              )}
              onMouseMove={(e) => handleMouseMove(e, 'left')}
              onMouseLeave={handleMouseLeave}
            >
              {/* Dynamic glow overlay */}
              <div 
                className="absolute inset-0 pointer-events-none transition-all duration-100"
                style={getGlowStyle('left')}
              />
              
              <div className="relative z-10 flex flex-col items-center gap-1.5">
                <Globe 
                  className="w-6 h-6 mb-1 transition-all duration-200"
                  style={{
                    ...getIconGlow('left'),
                    color: glow.section === 'left' || getSpilloverIntensity('left') > 0 
                      ? undefined 
                      : '#6b7280'
                  }}
                />
                <span 
                  className="font-bold text-sm transition-all duration-200"
                  style={{
                    ...getTextGlow('left'),
                    color: glow.section === 'left' || getSpilloverIntensity('left') > 0 
                      ? undefined 
                      : '#374151'
                  }}
                >
                  ZENAI
                </span>
                <span 
                  className="text-[10px] uppercase tracking-[0.15em] font-medium transition-all duration-200"
                  style={{
                    color: glow.section === 'left' 
                      ? `rgba(59, 130, 246, ${0.6 + glow.intensity * 0.4})` 
                      : '#9ca3af'
                  }}
                >
                  World
                </span>
              </div>
            </a>

            {/* Arena */}
            <a
              href="https://zenarena.ai"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group relative flex-1 px-8 py-5 text-center overflow-hidden",
                "transition-all duration-200 ease-out"
              )}
              onMouseMove={(e) => handleMouseMove(e, 'right')}
              onMouseLeave={handleMouseLeave}
            >
              {/* Dynamic glow overlay */}
              <div 
                className="absolute inset-0 pointer-events-none transition-all duration-100"
                style={getGlowStyle('right')}
              />
              
              <div className="relative z-10 flex flex-col items-center gap-1.5">
                <Gamepad2 
                  className="w-6 h-6 mb-1 transition-all duration-200"
                  style={{
                    ...getIconGlow('right'),
                    color: glow.section === 'right' || getSpilloverIntensity('right') > 0 
                      ? undefined 
                      : '#6b7280'
                  }}
                />
                <span 
                  className="font-bold text-sm transition-all duration-200"
                  style={{
                    ...getTextGlow('right'),
                    color: glow.section === 'right' || getSpilloverIntensity('right') > 0 
                      ? undefined 
                      : '#374151'
                  }}
                >
                  ARENA
                </span>
                <span 
                  className="text-[10px] uppercase tracking-[0.15em] font-medium transition-all duration-200"
                  style={{
                    color: glow.section === 'right' 
                      ? `rgba(59, 130, 246, ${0.6 + glow.intensity * 0.4})` 
                      : '#9ca3af'
                  }}
                >
                  Enter
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
