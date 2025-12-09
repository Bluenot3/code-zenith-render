import React, { memo, useMemo } from 'react';

const LIGHT_COLORS = ['#ff2020', '#00ff55', '#ffdd00', '#ff5500', '#00ccff', '#ff44aa', '#aa44ff'];
const GLOW_COLORS = ['#ff6666', '#44ff88', '#ffee55', '#ff8844', '#66ddff', '#ff77cc', '#cc77ff'];

const BERRY_POSITIONS = [
  { x: '15%', y: '28%' },
  { x: '82%', y: '28%' },
  { x: '28%', y: '20%' },
  { x: '68%', y: '20%' },
  { x: '20%', y: '42%' },
  { x: '76%', y: '42%' },
  { x: '35%', y: '15%' },
  { x: '62%', y: '15%' },
];

const ChristmasLights: React.FC = memo(() => {
  const lights = useMemo(() => 
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      color: LIGHT_COLORS[i % 7],
      glow: GLOW_COLORS[i % 7],
      delay: i * 0.15,
      t: (i + 0.5) / 16,
    })), []
  );

  const lightPositions = useMemo(() => 
    lights.map(light => {
      const x = 6 + light.t * 148;
      const arcY = 44 - Math.sin(light.t * Math.PI) * 38;
      return {
        left: `${(x / 160) * 100}%`,
        top: `${((arcY + 4) / 80) * 100}%`,
      };
    }), [lights]
  );

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none will-change-transform">
      <div className="relative w-44 h-24 mt-0.5">
        {/* Lush pine wreath arcs with rich textures */}
        <div 
          className="absolute left-0 top-2 w-24 h-16"
          style={{
            background: `
              radial-gradient(ellipse 100% 85% at 100% 50%, transparent 32%, #0a4a0a 33%, #15751a 38%, #0d5a12 42%, #1a8a22 48%, #0f6615 54%, #22aa2a 60%, #158a1c 66%, #0d6612 70%, transparent 71%),
              radial-gradient(ellipse 80% 60% at 95% 45%, transparent 40%, rgba(40,180,50,0.4) 50%, transparent 60%)
            `,
            filter: 'drop-shadow(0 2px 4px rgba(0,80,20,0.5))',
          }}
        />
        <div 
          className="absolute right-0 top-2 w-24 h-16"
          style={{
            background: `
              radial-gradient(ellipse 100% 85% at 0% 50%, transparent 32%, #0a4a0a 33%, #15751a 38%, #0d5a12 42%, #1a8a22 48%, #0f6615 54%, #22aa2a 60%, #158a1c 66%, #0d6612 70%, transparent 71%),
              radial-gradient(ellipse 80% 60% at 5% 45%, transparent 40%, rgba(40,180,50,0.4) 50%, transparent 60%)
            `,
            filter: 'drop-shadow(0 2px 4px rgba(0,80,20,0.5))',
          }}
        />
        
        {/* Pine needle texture overlay */}
        <div 
          className="absolute left-1 top-3 w-20 h-12 opacity-60"
          style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(30,120,40,0.3) 2px, rgba(30,120,40,0.3) 3px)',
          }}
        />
        <div 
          className="absolute right-1 top-3 w-20 h-12 opacity-60"
          style={{
            background: 'repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(30,120,40,0.3) 2px, rgba(30,120,40,0.3) 3px)',
          }}
        />

        {/* Elegant bow with rich velvet texture */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
          <div 
            className="absolute -left-6 -top-2.5 w-6 h-5 rounded-full"
            style={{
              background: 'linear-gradient(140deg, #e82828 0%, #cc1515 25%, #a00808 50%, #850505 75%, #6a0303 100%)',
              transform: 'rotate(-28deg)',
              boxShadow: 'inset 2px 2px 4px rgba(255,100,100,0.4), inset -1px -1px 3px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)',
            }}
          />
          <div 
            className="absolute -right-6 -top-2.5 w-6 h-5 rounded-full"
            style={{
              background: 'linear-gradient(40deg, #e82828 0%, #cc1515 25%, #a00808 50%, #850505 75%, #6a0303 100%)',
              transform: 'rotate(28deg)',
              boxShadow: 'inset -2px 2px 4px rgba(255,100,100,0.4), inset 1px -1px 3px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)',
            }}
          />
          <div 
            className="relative w-5 h-5 rounded-full z-10"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #ff4545 0%, #dd2020 30%, #bb0a0a 60%, #880505 100%)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 1px 1px 3px rgba(255,150,150,0.5)',
            }}
          />
          <div 
            className="absolute left-0.5 top-4 w-3 h-6"
            style={{
              background: 'linear-gradient(to bottom, #cc1818 0%, #aa0a0a 50%, #880505 100%)',
              clipPath: 'polygon(35% 0%, 100% 0%, 80% 100%, 20% 100%)',
              transform: 'rotate(-15deg)',
              boxShadow: '0 2px 3px rgba(0,0,0,0.3)',
            }}
          />
          <div 
            className="absolute right-0.5 top-4 w-3 h-6"
            style={{
              background: 'linear-gradient(to bottom, #cc1818 0%, #aa0a0a 50%, #880505 100%)',
              clipPath: 'polygon(0% 0%, 65% 0%, 80% 100%, 20% 100%)',
              transform: 'rotate(15deg)',
              boxShadow: '0 2px 3px rgba(0,0,0,0.3)',
            }}
          />
        </div>

        {/* Vibrant holly berries with 3D effect */}
        {BERRY_POSITIONS.map((pos, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: pos.x,
              top: pos.y,
              background: 'radial-gradient(circle at 28% 28%, #ff8888 0%, #ff3333 25%, #dd0000 55%, #990000 85%, #660000 100%)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,200,200,0.6)',
            }}
          />
        ))}

        {/* Gold accent wire string */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 80" fill="none">
          <defs>
            <linearGradient id="wireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2a2a2a" />
              <stop offset="50%" stopColor="#4a4a4a" />
              <stop offset="100%" stopColor="#2a2a2a" />
            </linearGradient>
          </defs>
          <path d="M 6 44 Q 40 4, 80 4 Q 120 4, 154 44" stroke="url(#wireGrad)" strokeWidth="2" fill="none" />
        </svg>

        {/* Vibrant light bulbs with enhanced glow */}
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
          top: -7px;
          left: 50%;
          transform: translateX(-50%);
          width: 9px;
          height: 7px;
          background: linear-gradient(to bottom, #666 0%, #333 40%, #555 60%, #444 100%);
          border-radius: 2px 2px 0 0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        .light-bulb {
          width: 14px;
          height: 18px;
          border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%;
          background: 
            radial-gradient(ellipse 60% 40% at 30% 20%, rgba(255,255,255,0.95) 0%, transparent 50%),
            radial-gradient(ellipse 80% 80% at 50% 55%, var(--light-color) 0%, var(--light-color) 100%);
          box-shadow: 
            0 0 12px var(--glow-color), 
            0 0 24px var(--glow-color),
            0 0 36px color-mix(in srgb, var(--glow-color) 50%, transparent),
            inset 0 -3px 6px rgba(0,0,0,0.2);
          animation: bulb-twinkle 2s ease-in-out infinite;
          animation-delay: var(--delay);
          will-change: opacity, box-shadow;
        }
        @keyframes bulb-twinkle {
          0%, 100% { 
            opacity: 1;
            filter: brightness(1.1);
          }
          50% { 
            opacity: 0.7;
            filter: brightness(0.85);
          }
        }
      `}</style>
    </div>
  );
});

ChristmasLights.displayName = 'ChristmasLights';

export default ChristmasLights;
