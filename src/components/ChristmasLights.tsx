import React from 'react';

const ChristmasLights: React.FC = () => {
  const lights = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    color: ['#ff3333', '#00cc44', '#ffcc00', '#ff6600', '#00aaff', '#ff66cc'][i % 6],
    glow: ['#ff6666', '#33ff77', '#ffdd44', '#ff9944', '#44ccff', '#ff99dd'][i % 6],
    delay: i * 0.18,
  }));

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      {/* Wreath Container */}
      <div className="relative w-40 h-20 mt-1">
        {/* Pine wreath base - left arc */}
        <div 
          className="absolute left-0 top-3 w-20 h-14"
          style={{
            background: `
              radial-gradient(ellipse 100% 80% at 100% 50%, 
                transparent 38%, 
                #0d3d0d 39%, 
                #1a5c1a 45%,
                #0f4a0f 55%,
                #1a5c1a 65%,
                #0d3d0d 72%,
                transparent 73%
              )
            `,
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))',
          }}
        />
        {/* Pine wreath base - right arc */}
        <div 
          className="absolute right-0 top-3 w-20 h-14"
          style={{
            background: `
              radial-gradient(ellipse 100% 80% at 0% 50%, 
                transparent 38%, 
                #0d3d0d 39%, 
                #1a5c1a 45%,
                #0f4a0f 55%,
                #1a5c1a 65%,
                #0d3d0d 72%,
                transparent 73%
              )
            `,
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))',
          }}
        />
        
        {/* Pine needle texture */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              repeating-linear-gradient(60deg, transparent, transparent 1px, rgba(34,139,34,0.2) 1px, rgba(34,139,34,0.2) 2px),
              repeating-linear-gradient(-60deg, transparent, transparent 1px, rgba(20,100,20,0.15) 1px, rgba(20,100,20,0.15) 2px)
            `,
            maskImage: 'radial-gradient(ellipse 85% 65% at 50% 55%, black 25%, transparent 65%)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 65% at 50% 55%, black 25%, transparent 65%)',
          }}
        />

        {/* Elegant red bow */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-1">
          {/* Bow left loop */}
          <div 
            className="absolute -left-5 -top-2 w-5 h-4 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #cc2222 0%, #8b0000 40%, #660000 100%)',
              boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.4), inset 2px 2px 3px rgba(255,100,100,0.3), 0 2px 4px rgba(0,0,0,0.3)',
              transform: 'rotate(-25deg)',
            }}
          />
          {/* Bow right loop */}
          <div 
            className="absolute -right-5 -top-2 w-5 h-4 rounded-full"
            style={{
              background: 'linear-gradient(45deg, #cc2222 0%, #8b0000 40%, #660000 100%)',
              boxShadow: 'inset 2px -2px 4px rgba(0,0,0,0.4), inset -2px 2px 3px rgba(255,100,100,0.3), 0 2px 4px rgba(0,0,0,0.3)',
              transform: 'rotate(25deg)',
            }}
          />
          {/* Bow center knot */}
          <div 
            className="relative w-4 h-4 rounded-full z-10"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #ee3333, #aa0000 50%, #660000)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,150,150,0.4)',
            }}
          />
          {/* Bow tails */}
          <div 
            className="absolute left-0.5 top-3 w-2.5 h-5"
            style={{
              background: 'linear-gradient(to bottom, #bb1111, #770000)',
              clipPath: 'polygon(40% 0%, 100% 0%, 85% 100%, 15% 100%)',
              transform: 'rotate(-12deg)',
              boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.3)',
            }}
          />
          <div 
            className="absolute right-0.5 top-3 w-2.5 h-5"
            style={{
              background: 'linear-gradient(to bottom, #bb1111, #770000)',
              clipPath: 'polygon(0% 0%, 60% 0%, 85% 100%, 15% 100%)',
              transform: 'rotate(12deg)',
              boxShadow: 'inset 1px 0 2px rgba(0,0,0,0.3)',
            }}
          />
        </div>

        {/* Holly berries scattered on wreath */}
        {[
          { x: '18%', y: '30%' },
          { x: '78%', y: '30%' },
          { x: '30%', y: '22%' },
          { x: '66%', y: '22%' },
          { x: '24%', y: '45%' },
          { x: '72%', y: '45%' },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full"
            style={{
              left: pos.x,
              top: pos.y,
              background: 'radial-gradient(circle at 30% 30%, #ff5555, #cc0000 45%, #880000)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,200,200,0.4)',
            }}
          />
        ))}

        {/* Wire string for lights - follows wreath arc */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 80" fill="none">
          <path
            d="M 8 42 Q 40 6, 80 6 Q 120 6, 152 42"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            fill="none"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}
          />
        </svg>

        {/* Christmas light bulbs along the wire */}
        {lights.map((light, i) => {
          const t = (i + 0.5) / lights.length;
          const x = 8 + t * 144;
          const arcY = 42 - Math.sin(t * Math.PI) * 36;
          const y = arcY + 5;
          
          return (
            <div
              key={light.id}
              className="absolute"
              style={{
                left: `${(x / 160) * 100}%`,
                top: `${(y / 80) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Bulb socket */}
              <div 
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-1.5"
                style={{
                  background: 'linear-gradient(to bottom, #555, #2a2a2a, #444)',
                  borderRadius: '1px 1px 0 0',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)',
                }}
              />
              {/* Glass bulb */}
              <div
                className="w-3 h-4 relative"
                style={{
                  borderRadius: '50% 50% 50% 50% / 35% 35% 65% 65%',
                  background: `
                    radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.85) 0%, transparent 30%),
                    radial-gradient(ellipse at 50% 50%, ${light.color} 0%, ${light.color}cc 50%, ${light.color}88 100%)
                  `,
                  boxShadow: `
                    0 0 8px ${light.glow},
                    0 0 16px ${light.glow}99,
                    0 0 24px ${light.glow}55,
                    inset 0 -3px 6px rgba(0,0,0,0.25),
                    inset 0 2px 3px rgba(255,255,255,0.35)
                  `,
                  animation: `twinkle 2.5s ease-in-out infinite`,
                  animationDelay: `${light.delay}s`,
                }}
              >
                {/* Filament glow */}
                <div
                  className="absolute top-1/2 left-1/2 w-1.5 h-2"
                  style={{
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(ellipse, ${light.glow} 0%, transparent 70%)`,
                    filter: 'blur(0.5px)',
                    animation: `glow 2.5s ease-in-out infinite`,
                    animationDelay: `${light.delay}s`,
                  }}
                />
              </div>
              {/* Light glow halo */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle, ${light.glow}50 0%, transparent 65%)`,
                  transform: 'scale(2.5)',
                  animation: `twinkle 2.5s ease-in-out infinite`,
                  animationDelay: `${light.delay}s`,
                }}
              />
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.65; filter: brightness(0.85); }
        }
        @keyframes glow {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.85); }
        }
      `}</style>
    </div>
  );
};

export default ChristmasLights;
