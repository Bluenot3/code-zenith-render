import React, { memo, useMemo } from 'react';

const LIGHT_COLORS = ['#ff3333', '#00cc44', '#ffcc00', '#ff6600', '#00aaff', '#ff66cc'];
const GLOW_COLORS = ['#ff6666', '#33ff77', '#ffdd44', '#ff9944', '#44ccff', '#ff99dd'];

const BERRY_POSITIONS = [
  { x: '18%', y: '30%' },
  { x: '78%', y: '30%' },
  { x: '30%', y: '22%' },
  { x: '66%', y: '22%' },
  { x: '24%', y: '45%' },
  { x: '72%', y: '45%' },
];

const ChristmasLights: React.FC = memo(() => {
  const lights = useMemo(() => 
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      color: LIGHT_COLORS[i % 6],
      glow: GLOW_COLORS[i % 6],
      delay: i * 0.18,
      t: (i + 0.5) / 14,
    })), []
  );

  const lightPositions = useMemo(() => 
    lights.map(light => {
      const x = 8 + light.t * 144;
      const arcY = 42 - Math.sin(light.t * Math.PI) * 36;
      return {
        left: `${(x / 160) * 100}%`,
        top: `${((arcY + 5) / 80) * 100}%`,
      };
    }), [lights]
  );

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none will-change-transform">
      <div className="relative w-40 h-20 mt-1">
        {/* Pine wreath arcs - combined with CSS */}
        <div 
          className="absolute left-0 top-3 w-20 h-14"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at 100% 50%, transparent 38%, #0d3d0d 39%, #1a5c1a 45%, #0f4a0f 55%, #1a5c1a 65%, #0d3d0d 72%, transparent 73%)',
          }}
        />
        <div 
          className="absolute right-0 top-3 w-20 h-14"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at 0% 50%, transparent 38%, #0d3d0d 39%, #1a5c1a 45%, #0f4a0f 55%, #1a5c1a 65%, #0d3d0d 72%, transparent 73%)',
          }}
        />

        {/* Bow - simplified structure */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-1">
          <div 
            className="absolute -left-5 -top-2 w-5 h-4 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #cc2222, #8b0000 40%, #660000)',
              transform: 'rotate(-25deg)',
            }}
          />
          <div 
            className="absolute -right-5 -top-2 w-5 h-4 rounded-full"
            style={{
              background: 'linear-gradient(45deg, #cc2222, #8b0000 40%, #660000)',
              transform: 'rotate(25deg)',
            }}
          />
          <div 
            className="relative w-4 h-4 rounded-full z-10"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #ee3333, #aa0000 50%, #660000)',
            }}
          />
          <div 
            className="absolute left-0.5 top-3 w-2.5 h-5"
            style={{
              background: 'linear-gradient(to bottom, #bb1111, #770000)',
              clipPath: 'polygon(40% 0%, 100% 0%, 85% 100%, 15% 100%)',
              transform: 'rotate(-12deg)',
            }}
          />
          <div 
            className="absolute right-0.5 top-3 w-2.5 h-5"
            style={{
              background: 'linear-gradient(to bottom, #bb1111, #770000)',
              clipPath: 'polygon(0% 0%, 60% 0%, 85% 100%, 15% 100%)',
              transform: 'rotate(12deg)',
            }}
          />
        </div>

        {/* Holly berries */}
        {BERRY_POSITIONS.map((pos, i) => (
          <div
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full"
            style={{
              left: pos.x,
              top: pos.y,
              background: 'radial-gradient(circle at 30% 30%, #ff5555, #cc0000 45%, #880000)',
            }}
          />
        ))}

        {/* Wire string */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 80" fill="none">
          <path d="M 8 42 Q 40 6, 80 6 Q 120 6, 152 42" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Light bulbs - optimized with CSS animations */}
        {lights.map((light, i) => (
          <div
            key={light.id}
            className="absolute christmas-light"
            style={{
              left: lightPositions[i].left,
              top: lightPositions[i].top,
              transform: 'translate(-50%, -50%)',
              '--light-color': light.color,
              '--glow-color': light.glow,
              '--delay': `${light.delay}s`,
            } as React.CSSProperties}
          >
            <div className="light-socket" />
            <div className="light-bulb" />
          </div>
        ))}
      </div>

      <style>{`
        .christmas-light {
          contain: layout style;
        }
        .light-socket {
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 6px;
          background: linear-gradient(to bottom, #555, #2a2a2a, #444);
          border-radius: 1px 1px 0 0;
        }
        .light-bulb {
          width: 12px;
          height: 16px;
          border-radius: 50% 50% 50% 50% / 35% 35% 65% 65%;
          background: radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.85) 0%, transparent 30%),
                      radial-gradient(ellipse at 50% 50%, var(--light-color) 0%, var(--light-color) 50%, var(--light-color) 100%);
          box-shadow: 0 0 8px var(--glow-color), 0 0 16px var(--glow-color);
          animation: bulb-twinkle 2.5s ease-in-out infinite;
          animation-delay: var(--delay);
          will-change: opacity;
        }
        @keyframes bulb-twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }
      `}</style>
    </div>
  );
});

ChristmasLights.displayName = 'ChristmasLights';

export default ChristmasLights;
