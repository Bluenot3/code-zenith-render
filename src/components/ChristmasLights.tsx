import React, { useMemo } from 'react';

const ChristmasLights: React.FC = () => {
  // Generate lights for each edge with more density
  const lights = useMemo(() => {
    const colors = [
      { main: '#ff1744', glow: '#ff5252', name: 'red' },
      { main: '#00e676', glow: '#69f0ae', name: 'green' },
      { main: '#ffea00', glow: '#ffff00', name: 'yellow' },
      { main: '#2979ff', glow: '#82b1ff', name: 'blue' },
      { main: '#ff4081', glow: '#ff80ab', name: 'pink' },
      { main: '#ffffff', glow: '#ffffff', name: 'white' },
    ];
    
    const allLights: { x: number; y: number; color: typeof colors[0]; delay: number; edge: string }[] = [];
    
    // Top edge - more lights
    for (let i = 0; i < 40; i++) {
      allLights.push({
        x: (i / 39) * 100,
        y: 0,
        color: colors[i % colors.length],
        delay: i * 0.12,
        edge: 'top'
      });
    }
    
    // Right edge
    for (let i = 0; i < 28; i++) {
      allLights.push({
        x: 100,
        y: (i / 27) * 100,
        color: colors[(i + 2) % colors.length],
        delay: (40 + i) * 0.12,
        edge: 'right'
      });
    }
    
    // Bottom edge
    for (let i = 0; i < 40; i++) {
      allLights.push({
        x: 100 - (i / 39) * 100,
        y: 100,
        color: colors[(i + 4) % colors.length],
        delay: (68 + i) * 0.12,
        edge: 'bottom'
      });
    }
    
    // Left edge
    for (let i = 0; i < 28; i++) {
      allLights.push({
        x: 0,
        y: 100 - (i / 27) * 100,
        color: colors[i % colors.length],
        delay: (108 + i) * 0.12,
        edge: 'left'
      });
    }
    
    return allLights;
  }, []);

  // Generate pine needle clusters for garland
  const pineNeedles = useMemo(() => {
    const needles: { x: number; y: number; rotation: number; scale: number; edge: string }[] = [];
    
    // Top edge needles
    for (let i = 0; i < 60; i++) {
      needles.push({
        x: (i / 59) * 100,
        y: Math.random() * 2,
        rotation: Math.random() * 360,
        scale: 0.6 + Math.random() * 0.6,
        edge: 'top'
      });
    }
    
    // Bottom edge
    for (let i = 0; i < 60; i++) {
      needles.push({
        x: (i / 59) * 100,
        y: 98 + Math.random() * 2,
        rotation: Math.random() * 360,
        scale: 0.6 + Math.random() * 0.6,
        edge: 'bottom'
      });
    }
    
    // Left edge
    for (let i = 0; i < 40; i++) {
      needles.push({
        x: Math.random() * 2,
        y: (i / 39) * 100,
        rotation: Math.random() * 360,
        scale: 0.6 + Math.random() * 0.6,
        edge: 'left'
      });
    }
    
    // Right edge
    for (let i = 0; i < 40; i++) {
      needles.push({
        x: 98 + Math.random() * 2,
        y: (i / 39) * 100,
        rotation: Math.random() * 360,
        scale: 0.6 + Math.random() * 0.6,
        edge: 'right'
      });
    }
    
    return needles;
  }, []);

  // Generate holly berries
  const berries = useMemo(() => {
    const b: { x: number; y: number; size: number }[] = [];
    
    // Scatter berries along edges
    for (let i = 0; i < 30; i++) {
      const edge = Math.floor(Math.random() * 4);
      let x, y;
      
      if (edge === 0) { x = Math.random() * 100; y = Math.random() * 3; }
      else if (edge === 1) { x = 97 + Math.random() * 3; y = Math.random() * 100; }
      else if (edge === 2) { x = Math.random() * 100; y = 97 + Math.random() * 3; }
      else { x = Math.random() * 3; y = Math.random() * 100; }
      
      b.push({ x, y, size: 4 + Math.random() * 4 });
    }
    
    return b;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Pine Garland Base - Top */}
      <div className="absolute top-0 left-0 right-0 h-10">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(20, 83, 45, 0.95) 0%, rgba(22, 101, 52, 0.8) 40%, rgba(21, 128, 61, 0.4) 70%, transparent 100%)',
          boxShadow: 'inset 0 0 20px rgba(34, 197, 94, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4)'
        }} />
        {/* Pine texture overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(34, 197, 94, 0.15) 2px,
            rgba(34, 197, 94, 0.15) 4px
          ), repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 2px,
            rgba(22, 163, 74, 0.1) 2px,
            rgba(22, 163, 74, 0.1) 4px
          )`
        }} />
      </div>
      
      {/* Pine Garland Base - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-10">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(0deg, rgba(20, 83, 45, 0.95) 0%, rgba(22, 101, 52, 0.8) 40%, rgba(21, 128, 61, 0.4) 70%, transparent 100%)',
          boxShadow: 'inset 0 0 20px rgba(34, 197, 94, 0.3), 0 -4px 12px rgba(0, 0, 0, 0.4)'
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(34, 197, 94, 0.15) 2px,
            rgba(34, 197, 94, 0.15) 4px
          ), repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 2px,
            rgba(22, 163, 74, 0.1) 2px,
            rgba(22, 163, 74, 0.1) 4px
          )`
        }} />
      </div>
      
      {/* Pine Garland Base - Left */}
      <div className="absolute top-0 bottom-0 left-0 w-10">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(90deg, rgba(20, 83, 45, 0.95) 0%, rgba(22, 101, 52, 0.8) 40%, rgba(21, 128, 61, 0.4) 70%, transparent 100%)',
          boxShadow: 'inset 0 0 20px rgba(34, 197, 94, 0.3), 4px 0 12px rgba(0, 0, 0, 0.4)'
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(34, 197, 94, 0.15) 2px,
            rgba(34, 197, 94, 0.15) 4px
          )`
        }} />
      </div>
      
      {/* Pine Garland Base - Right */}
      <div className="absolute top-0 bottom-0 right-0 w-10">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(-90deg, rgba(20, 83, 45, 0.95) 0%, rgba(22, 101, 52, 0.8) 40%, rgba(21, 128, 61, 0.4) 70%, transparent 100%)',
          boxShadow: 'inset 0 0 20px rgba(34, 197, 94, 0.3), -4px 0 12px rgba(0, 0, 0, 0.4)'
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 2px,
            rgba(34, 197, 94, 0.15) 2px,
            rgba(34, 197, 94, 0.15) 4px
          )`
        }} />
      </div>

      {/* Pine Needle Clusters */}
      {pineNeedles.map((needle, i) => (
        <div
          key={`needle-${i}`}
          className="absolute"
          style={{
            left: `${needle.x}%`,
            top: `${needle.y}%`,
            transform: `rotate(${needle.rotation}deg) scale(${needle.scale})`,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <g fill="none" stroke="rgba(34, 197, 94, 0.8)" strokeWidth="0.8">
              <line x1="8" y1="0" x2="8" y2="16" />
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </g>
          </svg>
        </div>
      ))}

      {/* Holly Berries */}
      {berries.map((berry, i) => (
        <div
          key={`berry-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${berry.x}%`,
            top: `${berry.y}%`,
            width: `${berry.size}px`,
            height: `${berry.size}px`,
            background: 'radial-gradient(ellipse at 30% 30%, #ff6b6b, #dc2626 50%, #991b1b 100%)',
            boxShadow: `
              0 0 ${berry.size}px rgba(220, 38, 38, 0.6),
              inset -1px -1px 2px rgba(0, 0, 0, 0.3),
              inset 1px 1px 2px rgba(255, 255, 255, 0.4)
            `,
          }}
        />
      ))}

      {/* Gold Ribbon Accents - Corners */}
      {[
        { top: '0', left: '0', rotate: '45deg' },
        { top: '0', right: '0', rotate: '-45deg' },
        { bottom: '0', left: '0', rotate: '-45deg' },
        { bottom: '0', right: '0', rotate: '45deg' }
      ].map((pos, i) => (
        <div
          key={`ribbon-${i}`}
          className="absolute w-20 h-20"
          style={{ ...pos }}
        >
          <div 
            className="absolute"
            style={{
              width: '60px',
              height: '8px',
              background: 'linear-gradient(180deg, #ffd700 0%, #b8860b 50%, #daa520 100%)',
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
              transform: `rotate(${pos.rotate})`,
              top: '20px',
              left: '10px',
              borderRadius: '2px'
            }}
          />
        </div>
      ))}

      {/* Christmas Lights with realistic bulb shapes */}
      {lights.map((light, i) => {
        const isVertical = light.edge === 'left' || light.edge === 'right';
        const offset = light.edge === 'top' ? 16 : light.edge === 'bottom' ? -16 : 0;
        const offsetX = light.edge === 'left' ? 16 : light.edge === 'right' ? -16 : 0;
        
        return (
          <div
            key={`light-${i}`}
            className="absolute"
            style={{
              left: light.x === 100 ? 'auto' : `calc(${light.x}% + ${offsetX}px)`,
              right: light.x === 100 ? '16px' : 'auto',
              top: light.y === 100 ? 'auto' : `calc(${light.y}% + ${offset}px)`,
              bottom: light.y === 100 ? '16px' : 'auto',
              transform: 'translate(-50%, -50%)',
              zIndex: 60
            }}
          >
            {/* Wire connecting to next light */}
            <svg
              className="absolute"
              style={{
                width: isVertical ? '4px' : '30px',
                height: isVertical ? '30px' : '4px',
                left: isVertical ? '50%' : '100%',
                top: isVertical ? '100%' : '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: -1
              }}
            >
              <path
                d={isVertical 
                  ? "M2,0 Q4,15 2,30" 
                  : "M0,2 Q15,4 30,2"
                }
                stroke="#1a1a1a"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            
            {/* Bulb socket/cap */}
            <div
              className="absolute"
              style={{
                width: '8px',
                height: '6px',
                background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #3a3a3a 100%)',
                borderRadius: '2px 2px 0 0',
                top: '-3px',
                left: '50%',
                transform: 'translateX(-50%)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2)'
              }}
            />
            
            {/* Main bulb with realistic glass effect */}
            <div
              className="relative"
              style={{
                width: '14px',
                height: '18px',
                borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                background: `
                  radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.9) 0%, transparent 25%),
                  radial-gradient(ellipse at 50% 50%, ${light.color.main} 0%, ${light.color.main}dd 60%, ${light.color.main}88 100%)
                `,
                boxShadow: `
                  0 0 20px ${light.color.glow},
                  0 0 40px ${light.color.glow}88,
                  0 0 60px ${light.color.glow}44,
                  inset 0 -4px 8px rgba(0,0,0,0.3),
                  inset 0 2px 4px rgba(255,255,255,0.4)
                `,
                animation: 'bulbTwinkle 2s ease-in-out infinite',
                animationDelay: `${light.delay}s`,
              }}
            >
              {/* Inner glow filament effect */}
              <div
                className="absolute"
                style={{
                  width: '4px',
                  height: '6px',
                  background: `radial-gradient(ellipse, ${light.color.glow} 0%, transparent 70%)`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  filter: 'blur(1px)',
                  animation: 'filamentGlow 2s ease-in-out infinite',
                  animationDelay: `${light.delay}s`,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Decorative bow clusters at corners */}
      {[
        { top: '4px', left: '4px' },
        { top: '4px', right: '4px' },
        { bottom: '4px', left: '4px' },
        { bottom: '4px', right: '4px' }
      ].map((pos, i) => (
        <div
          key={`bow-${i}`}
          className="absolute"
          style={{ ...pos, width: '40px', height: '40px' }}
        >
          {/* Bow loops */}
          <div style={{
            position: 'absolute',
            width: '20px',
            height: '14px',
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)',
            borderRadius: '50%',
            top: '8px',
            left: '2px',
            transform: 'rotate(-30deg)',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.3)'
          }} />
          <div style={{
            position: 'absolute',
            width: '20px',
            height: '14px',
            background: 'linear-gradient(45deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)',
            borderRadius: '50%',
            top: '8px',
            right: '2px',
            transform: 'rotate(30deg)',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.3)'
          }} />
          {/* Bow center knot */}
          <div style={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            background: 'radial-gradient(ellipse at 30% 30%, #ef4444, #b91c1c 60%, #7f1d1d 100%)',
            borderRadius: '50%',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)'
          }} />
          {/* Bow tails */}
          <div style={{
            position: 'absolute',
            width: '8px',
            height: '18px',
            background: 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)',
            borderRadius: '0 0 4px 4px',
            top: '20px',
            left: '12px',
            transform: 'rotate(-15deg)',
            boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.2)'
          }} />
          <div style={{
            position: 'absolute',
            width: '8px',
            height: '16px',
            background: 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)',
            borderRadius: '0 0 4px 4px',
            top: '20px',
            right: '12px',
            transform: 'rotate(15deg)',
            boxShadow: 'inset 1px 0 2px rgba(0,0,0,0.2)'
          }} />
        </div>
      ))}

      {/* CSS Animations */}
      <style>{`
        @keyframes bulbTwinkle {
          0%, 100% { 
            opacity: 1; 
            filter: brightness(1) saturate(1);
          }
          50% { 
            opacity: 0.7; 
            filter: brightness(0.8) saturate(0.9);
          }
        }
        
        @keyframes filamentGlow {
          0%, 100% { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default ChristmasLights;
